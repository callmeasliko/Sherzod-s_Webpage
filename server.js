const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is missing. Add it to your .env file.');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Winsales AI backend is running.'
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message || !systemPrompt) {
      return res.status(400).json({
        error: 'message va systemPrompt yuborilishi kerak.'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      systemPrompt,
      message
    ]);

    const reply = result.response.text();

    return res.json({ reply });
  } catch (error) {
    console.error('Chat Error:', error);
    return res.status(500).json({
      error: 'Chatda xatolik yuz berdi. API kalit va server loglarini tekshiring.'
    });
  }
});

app.post('/api/analyze-audio', upload.single('audio'), async (req, res) => {
  let uploadedPath = null;

  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Audio fayl yuklanmadi.' });
    }

    uploadedPath = file.path;
    const audioData = fs.readFileSync(uploadedPath);
    const base64Audio = audioData.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Siz tajribali sotuv auditorisiz. Ushbu audio suhbatni eshiting.
Uni "Top 50 sotuv xatolari" qoidalari asosida tahlil qiling.
1. Suhbatga 100 ballik tizimda baho bering.
2. 3 ta eng katta xatoni ko'rsating.
3. 2 ta yaxshilash maslahatini bering.
Javobni O'zbek tilida bering.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: file.mimetype
        }
      }
    ]);

    const analysis = result.response.text();
    return res.json({ analysis });
  } catch (error) {
    console.error('Analysis Error:', error);
    return res.status(500).json({
      error: 'Tahlil jarayonida xatolik yuz berdi.'
    });
  } finally {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
