import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini API proxy endpoint with Multi-turn history, Search Grounding, and Model selection
app.post('/api/tutor/chat', async (req, res) => {
  const {
    prompt,
    circuitContext,
    learnerLevel,
    history,
    modelName = 'gemini-3.8-flash',
    useSearchGrounding = false,
    useMapsGrounding = false,
  } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Falling back to the Local Rule-Based Quantum Expert Engine.',
      useFallback: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the AI Quantum Tutor, an expert quantum physics professor, algorithm architect, and interactive pedagogical mentor.
Learner level: ${learnerLevel || 'intermediate'}.
You provide scientifically rigorous, engaging, crystal-clear answers with mathematical formulas where appropriate (using bra-ket notation |ψ⟩, Dirac notation, matrix representations).
Current circuit context: ${JSON.stringify(circuitContext || {})}
If the learner asks about the circuit, break down the state transformations step by step.
Be pedagogical, encouraging, and accurate. Explain limitations of small classical simulators when asked about quantum speedup.
When Search Grounding is enabled, ground your knowledge in the latest real-world quantum hardware milestones (e.g. Google Quantum AI Willow chip, IBM Heron, neutral atoms).
Never fabricate quantum hardware connectivity; accurately explain simulator behavior.`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    // Configure tools: search grounding or maps grounding
    const tools: any[] = [];
    if (useSearchGrounding) {
      tools.push({ googleSearch: {} });
    } else if (useMapsGrounding) {
      tools.push({ googleMaps: {} });
    }

    const selectedModel =
      modelName === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    // Extract potential search grounding metadata
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const sources: Array<{ title: string; url: string }> = [];

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'Web Source',
            url: chunk.web.uri,
          });
        }
      }
    }

    return res.json({
      reply: response.text,
      source: selectedModel,
      provider: 'Google Gemini AI',
      sources: sources.length > 0 ? sources : undefined,
      grounded: Boolean(sources.length > 0),
    });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return res.status(500).json({
      error: error.message || 'Gemini API call failed',
      useFallback: true,
    });
  }
});

// Voice TTS Endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tutor/tts', async (req, res) => {
  const { text, voiceName = 'Kore' } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Shorten speech text for clear audible narration
    const cleanSpeechText = String(text || '')
      .replace(/\$\$?[^$]+\$\$?/g, 'mathematical expression')
      .replace(/[#*`_]/g, '')
      .slice(0, 450);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: cleanSpeechText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName === 'Puck' ? 'Puck' : 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Failed to generate voice speech audio.' });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Science Skill: arXiv Preprints Proxy Route
app.get('/api/arxiv', async (req, res) => {
  try {
    const query = String(req.query.query ?? 'cat:quant-ph AND all:quantum computing');
    const maxResults = String(req.query.max_results ?? '10');
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&max_results=${encodeURIComponent(maxResults)}&sortBy=submittedDate&sortOrder=descending`;
    const upstream = await fetch(url);
    const xml = await upstream.text();
    res.status(upstream.status).type('application/xml').send(xml);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Science Skill: OpenAlex Works Proxy Route
app.get('/api/science/openalex', async (req, res) => {
  try {
    const query = String(req.query.q ?? 'quantum algorithms');
    const url = `https://api.openalex.org/works?filter=default.search:${encodeURIComponent(query)}&sort=cited_by_count:desc&per-page=10`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// System Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: 'gemini-3.8-flash',
    simulator: 'local-browser-statevector',
    adapters: ['qiskit-aer', 'pennylane', 'cirq', 'qbraid'],
  });
});

// Production static serve or dev Vite middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist/index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Quantum Tutor server running on http://0.0.0.0:${PORT}`);
});
