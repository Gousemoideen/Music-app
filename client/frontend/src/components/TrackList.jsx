import { ReactComponent as SpotifyIcon } from '../Spotify_icon.svg';

const TrackList = ({ tracks, onPlayTrack }) => {
  return (
    <div className="tracklist-container">
      {tracks.map((track) => {
        const isPlayable = !!track.previewUrl;
        return (
          <div
            key={track.id}
            className={`track-item ${isPlayable ? 'is-playable' : ''}`}
            onClick={() => onPlayTrack(track)}
          >
            <div className="track-album-art">
              <img src={track.albumArt} alt={track.title} />
              {isPlayable && <div className="play-icon">▶</div>}
            </div>
            <div className="track-info">
              <h4>{track.title}</h4>
              <p>{track.artist}</p>
            </div>
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="service-link"
              title="Listen on Spotify"
              onClick={(e) => e.stopPropagation()}
            >
              <SpotifyIcon />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default TrackList;