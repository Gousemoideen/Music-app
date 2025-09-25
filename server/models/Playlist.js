import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true },
  moodPrompt: { type: String, required: true },
  tracks: [{
    id: String,
    title: String,
    artist: String,
    albumArt: String,
    previewUrl: String,
    spotifyUrl: String
  }],
  createdAt: { type: Date, default: Date.now },
});

export const Playlist = mongoose.model('Playlist', PlaylistSchema);