const MoodInput = ({ mood, setMood, onGenerate }) => {
  return (
    <div className="mood-input-container">
      <textarea
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="e.g., a rainy afternoon in a coffee shop..."
      />
      <button onClick={onGenerate}>Create Vibe</button>
    </div>
  );
};

export default MoodInput;