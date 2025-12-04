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
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
  try {
    const prompt = `Act as a seasoned DJ. Create a playlist for the mood: "${mood}".
    Return ONLY a raw JSON object with this exact structure (no markdown, no backticks, no extra text):
    {
      "coreArtists": ["artist1", "artist2"],
      "vibeKeywords": ["keyword1", "keyword2", "keyword3"]
    }`;

    // 1. Generate Content
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // 2. Safer JSON Parsing
    // This cleans up any markdown code blocks (```json ... ```) if Gemini adds them
    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const { coreArtists, vibeKeywords } = JSON.parse(cleanedText);

    // 3. Search Spotify
    const allSearchTerms = [...coreArtists, ...vibeKeywords];
    const trackList = [];
    const trackIds = new Set();

    for (const term of allSearchTerms) {
      try {
        const searchResult = await spotifyApi.searchTracks(term, { limit: 5 });
        
        if (searchResult.body.tracks && searchResult.body.tracks.items) {
          for (const track of searchResult.body.tracks.items) {
            // Prevent duplicates
            if (!trackIds.has(track.id)) {
              trackIds.add(track.id);
              trackList.push({
                id: track.id,
                title: track.name,
                artist: track.artists[0].name,
                albumArt: track.album.images[0]?.url || '', // Handle missing images safely
                previewUrl: track.preview_url, // Note: Often null nowadays
                spotifyUrl: track.external_urls.spotify,
              });
            }
          }
        }
      } catch (spotifyError) {
        console.error(`Spotify search failed for term "${term}":`, spotifyError.message);
        // Continue loop even if one search term fails
      }
    }
    
    return trackList;

  } catch (error) {
    console.error("AI Generation Error:", error);
    return []; // Return empty array so your route handles the 404 gracefully
  }
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