import { useEffect, useRef } from 'react';

const Player = ({ trackUrl }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (trackUrl) {
        audioRef.current.play().catch(error => console.log("Playback was prevented."));
      } else {
        audioRef.current.pause();
      }
    }
  }, [trackUrl]);

  if (!trackUrl) return null;

  return (
    <div className="player-container">
      <audio ref={audioRef} src={trackUrl} controls />
    </div>
  );
};

export default Player;