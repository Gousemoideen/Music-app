import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { connectDB } from './config/db.js';
import { Playlist } from './models/Playlist.js';
import SpotifyWebApi from 'spotify-web-api-node';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
connectDB();

app.use(cors()); 
app.use(express.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const getSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (err) {
    console.error('Failed to retrieve Spotify access token', err);
  }
};

getSpotifyToken();
setInterval(getSpotifyToken, 1000 * 60 * 55);

const generateTracksFromMood = async (mood) => {
  const prompt = `Act as a seasoned DJ creating a music set for a specific atmosphere. A user has given you the following mood: "${mood}".

Your job is to select foundational artists and niche vibe keywords to build the playlist.

Generate a JSON object with two keys:
1.  "coreArtists": An array of 2-3 artists who are masters of this mood.
2.  "vibeKeywords": An array of 3 niche genre or playlist search terms that perfectly capture the atmosphere.

Do not include mainstream pop artists unless they are essential to the mood. Focus on authenticity.`;

  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();
  const { coreArtists, vibeKeywords } = JSON.parse(responseText.replace(/```json|```/g, ''));
  const allSearchTerms = [...coreArtists, ...vibeKeywords];
  
  const trackList = [];
  const trackIds = new Set();

  for (const term of allSearchTerms) {
    const searchResult = await spotifyApi.searchTracks(term, { limit: 5 });
    for (const track of searchResult.body.tracks.items) {
      if (!trackIds.has(track.id)) {
        trackIds.add(track.id);
        trackList.push({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          albumArt: track.album.images[0].url,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls.spotify,
        });
      }
    }
  }
  return trackList;
};

app.post('/generate-playlist', ClerkExpressRequireAuth(), async (req, res) => {
  const { mood } = req.body;
  const { userId } = req.auth;
  try {
    const tracks = await generateTracksFromMood(mood);
    if (tracks.length === 0) {
      return res.status(404).json({ message: 'Could not find any tracks for that mood.' });
    }
    const newPlaylist = new Playlist({
      clerkUserId: userId,
      moodPrompt: mood,
      tracks: tracks,
    });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate playlist.' });
  }
});

app.post('/playlist/:id/add', ClerkExpressRequireAuth(), async (req, res) => {
  const { mood } = req.body;
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });

    const newTracks = await generateTracksFromMood(mood);
    const existingTrackIds = new Set(playlist.tracks.map(t => t.id));
    const uniqueNewTracks = newTracks.filter(t => !existingTrackIds.has(t.id));

    playlist.tracks.push(...uniqueNewTracks);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.get('/history', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const playlists = await Playlist.find({ clerkUserId: userId }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

app.get('/playlist/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ msg: 'Playlist not found' });
  }
});

const port = process.env.PORT || 8888;
app.listen(port, () => console.log(`Server started on port ${port}`));