import { useEffect, useRef, useState } from "react";
import "./App.css";
import startConverting from "./utils/speech_to_text";

export default function App() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const speakBtnRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState("A");

  // main animation interval driver
  useEffect(() => {
    let id;
    if (isRecording || isPlayingAudio) {
      bgColorHandler();
      id = setInterval(bgColorHandler, 1500);
    }
    return () => clearInterval(id);
  }, [isRecording, isPlayingAudio]);

  async function speak(t) {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8787/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.play();
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
        speechToText();
      };
    } catch (e) {
      console.error("TTS play error:", e);
      setIsPlayingAudio(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function speechToText() {
    setIsRecording(true);
    try {
      const holdText = await startConverting();
      setText(holdText || "");
      speak(holdText);
    } catch (e) {
      console.error("STT error:", e);
    } finally {
      setIsRecording(false);
    }
  }

  function bgColorHandler() {
    const gradients = [
      ["#6366f1", "#a855f7", "#ec4899"],
      ["#2dd4bf", "#3b82f6", "#2563eb"],
      ["#f59e0b", "#ef4444", "#8b5cf6"],
      ["#22c55e", "#06b6d4", "#3b82f6"],
      ["#f472b6", "#f59e0b", "#22c55e"],
    ];

    const radiusShapes = [
      "30% 70% 70% 30% / 30% 30% 70% 70%",
      "58% 42% 65% 35% / 48% 62% 38% 52%",
      "67% 33% 43% 57% / 54% 35% 65% 46%",
      "40% 60% 60% 40% / 60% 40% 60% 40%",
      "25% 75% 52% 48% / 34% 51% 49% 66%",
    ];

    const [from, via, to] =
      gradients[Math.floor(Math.random() * gradients.length)];
    const nextGradient = `linear-gradient(135deg, ${from}, ${via}, ${to})`;

    const front = activeLayer === "A" ? layerARef.current : layerBRef.current;
    const back = activeLayer === "A" ? layerBRef.current : layerARef.current;

    back.style.backgroundImage = nextGradient;
    back.offsetHeight;

    back.classList.add("visible");
    front.classList.remove("visible");

    setActiveLayer(activeLayer === "A" ? "B" : "A");

    // border radius morph
    const newRadius =
      radiusShapes[Math.floor(Math.random() * radiusShapes.length)];
    speakBtnRef.current.style.borderRadius = newRadius;
  }

  return (
    <div className="page">
      <div className="center">
        <h2 className="w-[60%] max-h-[30vh] text-md capitalize overflow-auto">
          {text}
        </h2>

        <button
          ref={speakBtnRef}
          className={`speak-btn ${
            isRecording || isPlayingAudio ? "listening" : ""
          } ${isLoading || isPlayingAudio ? "animate-pulse" : ""}`}
          onClick={speechToText}
        >
          <span
            ref={layerARef}
            className="gradient-layer visible bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          />
          <span ref={layerBRef} className="gradient-layer" />

          <span className="label">
            {isLoading
              ? "Thinking..."
              : isRecording
              ? "Listening..."
              : isPlayingAudio
              ? "Speaking..."
              : "Tap to speak"}
          </span>
        </button>
      </div>
    </div>
  );
}
