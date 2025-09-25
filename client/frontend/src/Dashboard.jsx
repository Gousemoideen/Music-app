import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import MoodInput from './components/MoodInput';
import TrackList from './components/TrackList';
import Player from './components/Player';

const Dashboard = () => {
  const { getToken } = useAuth();
  const [mood, setMood] = useState('');
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);

  const fetchHistory = async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8888/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch history.');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [getToken]);

  const handleGeneratePlaylist = async () => {
    if (!mood) return;
    setIsLoading(true);
    setError(null);
    setCurrentPlaylist(null);

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8888/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Could not generate playlist.');
      }
      
      const newPlaylist = await response.json();
      setCurrentPlaylist(newPlaylist);
      await fetchHistory();

    } catch (err)
      {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayTrack = (track) => {
    if (track.previewUrl) {
      setNowPlaying(track.previewUrl);
    } else {
      alert('Sorry, a preview is not available for this song. Try listening on Spotify!');
    }
  };

  const selectHistoryPlaylist = (playlist) => {
     setCurrentPlaylist(playlist);
     setNowPlaying(null);
  };

  const handleShare = (e, playlistId) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="dashboard-container">
      <MoodInput
        mood={mood}
        setMood={setMood}
        onGenerate={handleGeneratePlaylist}
      />

      {isLoading && <div className="loader"></div>}
      {error && <p className="error-message">{error}</p>}
      
      {currentPlaylist && (
        <div className="current-playlist-section">
          <h2>Now Viewing: "{currentPlaylist.moodPrompt}"</h2>
          <TrackList tracks={currentPlaylist.tracks} onPlayTrack={handlePlayTrack} />
        </div>
      )}

<div className="history-section">
  <h2>Your History</h2>
  {history.length > 0 ? (
    history.map((playlist) => (
      <div 
        key={playlist._id} 
        className="history-item"
        onClick={() => selectHistoryPlaylist(playlist)}
      >
        <div className="history-info">
          <p>"{playlist.moodPrompt}" ({playlist.tracks.length} tracks)</p>
        </div>
        <button 
          onClick={(e) => handleShare(e, playlist._id)} 
          className="share-button"
        >
          Share
        </button>
      </div>
    ))
  ) : (
    !isLoading && <p>You haven't generated any playlists yet.</p>
  )}
</div>
      
      <Player trackUrl={nowPlaying} />
    </div>
  );
};

export default Dashboard;