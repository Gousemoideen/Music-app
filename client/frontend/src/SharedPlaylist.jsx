import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import TrackList from './components/TrackList';
import Player from './components/Player';
import MoodInput from './components/MoodInput';

const SharedPlaylist = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [newMood, setNewMood] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchPlaylist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8888/playlist/${id}`);
      if (!response.ok) throw new Error('This playlist could not be found.');
      const data = await response.json();
      setPlaylist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handlePlayTrack = (track) => {
    if (track.previewUrl) {
      setNowPlaying(track.previewUrl);
    } else {
      alert('Sorry, a preview is not available for this song.');
    }
  };

  const handleAddToPlaylist = async () => {
    if (!newMood) return;
    setIsAdding(true);

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8888/playlist/${id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mood: newMood }),
      });
      if (!response.ok) throw new Error('Could not add to playlist.');
      
      const updatedPlaylist = await response.json();
      setPlaylist(updatedPlaylist);
      setNewMood('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="loader"></div>;
  if (error) return <p className="error-message">{error}</p>;
  if (!playlist) return <p>No playlist found.</p>;

  return (
    <div className="shared-playlist-container">
      <h1>Vibe: "{playlist.moodPrompt}"</h1>
      <p>A shared playlist. Add your own vibe below!</p>
      
      <SignedIn>
        <div className="collaboration-section">
          <h3>Add to this Vibe</h3>
          <MoodInput
            mood={newMood}
            setMood={setNewMood}
            onGenerate={handleAddToPlaylist}
          />
          {isAdding && <div className="loader"></div>}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="collaboration-prompt">
          <SignInButton mode="modal">
            <button className="login-button">Sign in to add to this playlist</button>
          </SignInButton>
        </div>
      </SignedOut>

      <TrackList tracks={playlist.tracks} onPlayTrack={handlePlayTrack} />
      <Player trackUrl={nowPlaying} />
    </div>
  );
};

export default SharedPlaylist;