const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const DB_DIR = path.resolve(__dirname, 'db');
const DB_FILE = path.resolve(DB_DIR, 'mood_submissions.json');

// Ensure directory and file exist
fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, '[]', 'utf8');
}

app.post('/api/mood', (req, res) => {
  const payload = req.body || {};
  // Mood range validation (1-10)
  if (typeof payload.mood !== 'number' || payload.mood < 1 || payload.mood > 10) {
    return res.status(400).json({ error: 'Invalid payload: mood must be a number between 1 and 10' });
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const entry = {
    id: Date.now(),
    mood: payload.mood,
    notes: payload.notes || '',
    timestamp: payload.timestamp || new Date().toISOString(),
    synced: false
  };
  data.push(entry);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  res.json({ ok: true, id: entry.id });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'Mood API healthy' });
});

const PORT = process.env.MOOD_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mood API server listening on port ${PORT}`);
});
