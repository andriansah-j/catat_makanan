const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data.json", error);
    return { users: [], receipts: [] };
  }
};

// Helper to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing data.json", error);
  }
};

// --- AUTH ROUTE (Login/Register) ---
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const lowerUsername = username.toLowerCase().trim();
  if (lowerUsername === 'admin' || lowerUsername === 'administrator') {
    return res.status(400).json({ error: 'Username restricted' });
  }

  const data = readData();
  if (data.users.find(u => u.username.toLowerCase() === lowerUsername)) {
    return res.status(400).json({ error: 'Username exists' });
  }

  let nextId = 6477;
  if (data.users.length > 0) {
    const maxId = Math.max(...data.users.map(u => u.id));
    nextId = Math.max(6477, maxId + 1);
  }

  const newUser = { id: nextId, username: lowerUsername, password };
  data.users.push(newUser);
  writeData(data);
  res.status(201).json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const lowerUsername = (username || '').toLowerCase().trim();
  
  const user = data.users.find(u => u.username.toLowerCase() === lowerUsername && u.password === password);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- USERS ROUTES (Admin Only) ---
app.get('/api/users', (req, res) => {
  const data = readData();
  res.json(data.users);
});

app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  const lowerUsername = username.toLowerCase().trim();
  const data = readData();

  if (data.users.find(u => u.username.toLowerCase() === lowerUsername)) {
    return res.status(400).json({ error: 'Username exists' });
  }

  let nextId = 6477;
  if (data.users.length > 0) {
    const maxId = Math.max(...data.users.map(u => u.id));
    nextId = Math.max(6477, maxId + 1);
  }

  const newUser = { id: nextId, username: lowerUsername, password };
  data.users.push(newUser);
  writeData(data);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { username, password } = req.body;
  const data = readData();
  const userIndex = data.users.findIndex(u => u.id === id);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  data.users[userIndex] = { ...data.users[userIndex], username, password };
  writeData(data);
  res.json(data.users[userIndex]);
});

app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = readData();
  data.users = data.users.filter(u => u.id !== id);
  writeData(data);
  res.json({ success: true });
});

// --- RECEIPTS ROUTES ---
app.get('/api/receipts', (req, res) => {
  const data = readData();
  res.json(data.receipts);
});

app.post('/api/receipts', (req, res) => {
  const receipt = req.body;
  const data = readData();
  // Ensure the receipt has an ID
  if (!receipt.id) receipt.id = Date.now().toString();
  data.receipts.unshift(receipt);
  writeData(data);
  res.status(201).json(receipt);
});

app.delete('/api/receipts/:id', (req, res) => {
  const id = req.params.id;
  const data = readData();
  data.receipts = data.receipts.filter(r => r.id !== id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
