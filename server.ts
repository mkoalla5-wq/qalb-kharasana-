import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Qalb Al-Kharasana Server',
    geminiModel: 'gemini-3.8-flash',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Server-side Gemini AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful domain-aware fallback if API key is pending in environment
      return res.json({
        reply: `[Gemini 3.8 Flash Ready]\nSalam! I have received your question: "${message}". Please ensure GEMINI_API_KEY is configured in your project Secrets to enable full live streaming intelligence.\n\nIn the meantime, our brutalist concrete homeware collection features heat-resistant mabkharas, siloxane-sealed terrazzo trays, and Cash on Delivery across KSA, UAE, and Egypt!`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are the Qalb Al-Kharasana (قلب الخرسانة) AI Art Concierge, an intelligent, cultured design assistant powered by Google Gemini (gemini-3.8-flash).
You assist collectors, clients, and interior designers in exploring artisanal brutalist concrete homeware, architectural decor, incense burners (mabkhara), and bespoke commissions across Saudi Arabia, UAE, and Egypt.

Key Knowledge & Guidelines:
1. **Language & Tone**:
   - Seamlessly detect and answer in the language the user speaks to you (Arabic or English).
   - Tone: Warm, refined, knowledgeable, architectural, respectful of Arab heritage and modern brutalist aesthetics.
2. **Product Categories**:
   - **Mabkhara (مبخرة)**: Cast with heat-resistant refractory concrete and cured with mineral silicates. For safety, use natural bamboo charcoal discs with an insulated brass ash dish inside the vessel. Clean with a dry microfiber brush; avoid acidic cleansers.
   - **Terrazzo (تيرازو)**: Hand-seeded with natural marble, alabaster, and volcanic basalt aggregate chips into wet cementitious matrix, followed by diamond-pad honing.
   - **Trays & Vessels (صواني وأوعية)**: Fluted, wave, and minimalist geometric shapes, sealed with water-repellent food-safe siloxane.
   - **Lighting & Sculptures (إضاءة وتحف)**: Monolithic concrete desk lamps, arches, and architectural accents.
3. **Care & Maintenance**:
   - Wipe spills (coffee, perfume, wax) immediately with a damp cloth.
   - Never use acidic chemicals, vinegar, or harsh abrasives.
   - Apply natural beeswax balm every 6 months to nourish the satin tactile patina.
4. **Ordering & Shipping**:
   - Cash on Delivery (COD) supported across Saudi Arabia (Riyadh, Jeddah, Dammam: 2-4 days), UAE (Dubai, Abu Dhabi: 2-3 days), and Egypt (Cairo, Alexandria: 3-5 days).
   - Heavy pieces packed in custom shock-absorbing foam.
5. **Bespoke Commissions & Artisans**:
   - Clients can commission custom mineral pigments (Desert Dune Sand, Basalt Charcoal, Terracotta, Alabaster White, Olive Green) or Arabic calligraphy by using the "Custom Commission" feature.
   - Artisans and vendors can register their atelier, upload product photos directly from their phone/computer, set prices in SAR, and earn Artisan Points (+15 per published piece, +50 per accepted order).

Keep answers clear, engaging, elegant, and scannable. Use Markdown formatting with bolding and lists where suitable.`;

    // Build chat message history for multi-turn Gemini conversation
    const formattedHistory = Array.isArray(history)
      ? history.slice(-8).map((h: { sender: string; text: string }) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }))
      : [];

    let userPromptWithContext = message.trim();
    if (context && Object.keys(context).length > 0) {
      userPromptWithContext = `[Current Context: ${JSON.stringify(context)}]\n\n${userPromptWithContext}`;
    }

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: userPromptWithContext }],
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-3.8-flash busy, falling back to gemini-flash-latest:', primaryErr?.message);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (fallbackErr: any) {
        throw primaryErr || fallbackErr;
      }
    }

    const reply = response.text || 'I apologize, but I could not formulate an answer. Please ask again.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Server Gemini API error:', err);
    return res.status(500).json({
      error: err?.message || 'Error processing request with Gemini model',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Qalb Al-Kharasana Server with Gemini running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
