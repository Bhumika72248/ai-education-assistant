import React, { useState, useEffect, useRef } from 'react';
import introVideo from "../images/eduai-bg.mp4";
import introLogo from "../images/eduai logo.png";

export default function NarratorIntro({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef(null);
  const typeIntervalRef = useRef(null);
  const textIndexRef = useRef(0);

  const fullText = "Welcome to EduAI — your personal AI study assistant. Paste any YouTube link and I will strip out the fluff, extract the real knowledge, and give you timestamped notes in seconds. Generate a quiz on anything you just watched. Upload your PDFs and ask me anything about them. Track your progress, build your skill map, and never lose your streak. Everything you need to learn — in one distraction-free place. Let's begin.";

  const audioRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem("eduai_narrator_played") === "true") {
      setVisible(false);
      if (onDone) onDone();
      return;
    }

    const startIntro = async () => {
      try {
        const response = await fetch("http://localhost:8000/chat/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fullText })
        });
        
        let audio;
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audio = new Audio(url);
          audioRef.current = audio;
        }

        const playAudio = async () => {
          if (audio) {
            audio.onplay = () => {
              setIsSpeaking(true);
              startTypewriter();
            };
            audio.onended = () => finishIntro();
            audio.onerror = () => {
              console.error("Audio error, falling back...");
              fallbackSpeech();
            };
            try {
              await audio.play();
            } catch (err) {
              console.error("Play error, falling back...", err);
              fallbackSpeech();
            }
          } else {
            fallbackSpeech();
          }
        };

        const startTypewriter = () => {
          textIndexRef.current = 0;
          setDisplayedText("");
          
          typeIntervalRef.current = setInterval(() => {
            if (textIndexRef.current < fullText.length) {
              setDisplayedText(prev => prev + fullText.charAt(textIndexRef.current));
              textIndexRef.current++;
            } else {
              clearInterval(typeIntervalRef.current);
            }
          }, 45);
        };

        const fallbackSpeech = () => {
          setIsSpeaking(true);
          startTypewriter();
          const utterance = new SpeechSynthesisUtterance(fullText);
          utterance.lang = "en-IN";
          utterance.rate = 0.88;
          utterance.pitch = 1.08;
          const voices = window.speechSynthesis.getVoices();
          if (voices.length) {
            const selectedVoice = voices.find(v => v.name.includes("Google") && v.name.includes("India")) || voices[0];
            if (selectedVoice) utterance.voice = selectedVoice;
          }
          utterance.onend = () => finishIntro();
          window.speechSynthesis.speak(utterance);
        };

        await playAudio();

      } catch (err) {
        console.error(err);
        finishIntro();
      }
    };

    const initialDelay = setTimeout(() => {
      startIntro();
    }, 100);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(typeIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
      window.speechSynthesis.cancel();
    };
  }, [onDone]);

  const finishIntro = () => {
    setIsSpeaking(false);
    clearInterval(typeIntervalRef.current);
    
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("eduai_narrator_played", "true");
        if (onDone) onDone();
      }, 600);
    }, 1500);
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();
    clearInterval(typeIntervalRef.current);
    setDisplayedText(fullText); // Instantly show all text
    setIsSpeaking(false);
    
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("eduai_narrator_played", "true");
      if (onDone) onDone();
    }, 600);
  };

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={introVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-950/60" />
      
      {/* Brand & Tagline */}
      <div className="absolute top-16 flex flex-col items-center z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">EduAI</h1>
          <span className="text-2xl text-indigo-400">✦</span>
        </div>
        <p className="mt-2 text-sm text-slate-400 animate-fadeInUp opacity-0" style={{ animationDelay: '200ms' }}>
          Your personal AI study assistant
        </p>
      </div>

      {/* Central Visualizer */}
      <div className="flex flex-col items-center justify-center mt-12 mb-12 z-10">
        {/* Logo */}
        <div className={`relative mb-12 flex justify-center items-center h-24 ${isSpeaking ? 'animate-orbPulse' : ''} transition-all duration-300`}>
          <img
            src={introLogo}
            alt="EduAI logo"
            className="w-24 h-24 object-cover rounded-full drop-shadow-[0_0_30px_rgba(99,102,241,0.45)]"
          />
        </div>

        {/* Sound Bars */}
        <div className="flex items-end gap-3 h-10">
          {[0, 150, 300, 450, 600].map((delay, i) => (
            <div 
              key={i}
              className={`w-1.5 rounded-t-full bg-indigo-500 opacity-80 transition-all duration-300 ${isSpeaking ? 'animate-soundBar' : 'h-2'}`}
              style={isSpeaking ? { animationDelay: `${delay}ms` } : {}}
            />
          ))}
        </div>
      </div>

      {/* Typewriter Text */}
      <div className="w-full max-w-[600px] px-8 text-center min-h-[120px] z-10">
        <p className="text-slate-100 leading-relaxed font-medium" style={{ fontSize: '24px', fontFamily: "'Caveat', cursive" }}>
          {displayedText}
        </p>
      </div>

      {/* Skip Button */}
      <button 
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-4 py-2 text-sm text-slate-200 border border-slate-600 rounded-full hover:bg-slate-800 transition-colors z-10"
      >
        Skip intro
      </button>

    </div>
  );
}
