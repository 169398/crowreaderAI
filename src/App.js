// App.js
import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";

function App() {
  const [audio, setAudio] = useState(null);

  const handleUpload = (audioBuffer) => {
    setAudio(audioBuffer);
  };

  useEffect(() => {
    if (audio) {
      const audioBlob = new Blob([Buffer.from(audio, "base64")], {
        type: "audio/wav",
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioElement = new Audio(audioUrl);
      audioElement.play();
    }
  }, [audio]);

  return (
    <div>
      <h1>Azure PDF Reader</h1>
      <FileUpload onUpload={handleUpload} />
    </div>
  );
}

export default App;
