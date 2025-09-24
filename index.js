import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { connectDB } from './config/db.js';
import { Playlist } from './models/Playlist.js';
// Add other API client imports and logic here later

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// This is a protected route. Only signed-in users can access it.
app.post('/generate', ClerkExpressRequireAuth(), async (req, res) => {
  const { mood } = req.body;
  const { userId } = req.auth;
  
  // In a real app, you would add the full logic here:
  // 1. Call Gemini to get search terms
  // 2. Call Spotify and Apple Music APIs
  // 3. Normalize the results
  // 4. Create and save a new Playlist document
  
  // For now, let's return a success message
  res.json({ message: `Playlist for mood "${mood}" is being generated for user ${userId}.` });
});

// This route fetches a user's history. It's also protected.
app.get('/history', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const playlists = await Playlist.find({ clerkUserId: userId }).sort({ createdAt: -1 });
  res.json(playlists);
});

// This is a public route for shared playlists. Anyone can access it.
app.get('/playlist/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

const port = process.env.PORT || 8888;
app.listen(port, () => console.log(`Server started on port ${port}`));