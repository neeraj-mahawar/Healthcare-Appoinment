// frontend/hooks/useGeminiVoiceAssistant.js
import { useState, useRef, useEffect } from "react";

export default function useGeminiVoiceAssistant(handleAICommand) {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");

  const synth = window.speechSynthesis;
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  // 🪶 Utility: Clean speech text (normalize doctor names, remove fillers)
  const normalizeSpeechText = (spokenText = "") => {
    return spokenText
      .replace(/doctor|docter|docktor/gi, "Dr.")
      .replace(/\b(?:mera|meri|mere|ke|ko|ka|ki|please|krdo|karo)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // 🎤 Speak using browser TTS
  const speak = async (text) => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    utter.pitch = voiceGender === "male" ? 0.85 : 1.05;
    utter.rate = 1;
    synth.cancel();
    synth.speak(utter);
  };

  // 🎙️ Start listening
  const startListening = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    // stop speaking to avoid echo
    synth.cancel();

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    // Mic visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const updateVol = () => {
        analyser.getByteFrequencyData(dataArrayRef.current);
        const avg =
          dataArrayRef.current.reduce((a, b) => a + b, 0) /
            dataArrayRef.current.length || 0;
        setVolume(avg / 255);
        rafRef.current = requestAnimationFrame(updateVol);
      };
      updateVol();
    } catch (err) {
      console.warn("🎙️ Mic error:", err);
    }

    recognition.onstart = () => {
      setListening(true);
      speak("Listening... please speak your command.");
    };

    recognition.onresult = async (e) => {
      const raw = e.results[e.results.length - 1][0].transcript.trim();
      const spokenText = normalizeSpeechText(raw);
      setTranscript(spokenText);
      setListening(false);
      console.log("🎧 You said:", spokenText);

      try {
     const res = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}/api/voice/interpret`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: spokenText, gender: voiceGender }),
  }
);

        const data = await res.json();

        setAiResponse(data.responseText || "No response");
        await speak(data.responseText);

        if (data.parsed?.action) handleAICommand(data.parsed);
      } catch (err) {
        console.error("Interpret error:", err);
        speak("Sorry, I could not process that.");
      }
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

 const stopListening = async () => {
  try {
    recognitionRef.current?.stop();
  } catch {}

  try {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  } catch {}

  try {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  } catch {}

  try {
    const ctx = audioContextRef.current;
    if (ctx && ctx.state !== "closed") {
      await ctx.close();
    }
    audioContextRef.current = null;
  } catch (err) {
    console.warn("⚠️ AudioContext cleanup skipped:", err.message);
  }

  setListening(false);
  setVolume(0);
};


  useEffect(() => () => stopListening(), []);

  return {
    startListening,
    stopListening,
    listening,
    volume,
    transcript,
    aiResponse,
    voiceGender,
    setVoiceGender,
    speak,
  };
}
