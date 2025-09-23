import React, { useEffect, useState, useRef } from "react";
import "./index.css";
import sadHorn from "/sadhorn.mp3";
import twerk from "/twerk.mp3";

const WORD = "twerk";
const MAX_WRONG = 7;

export default function App() {
  const [letters, setLetters] = useState(Array(WORD.length).fill(""));
  const [wrong, setWrong] = useState(0);
  const [guessed, setGuessed] = useState([]);
  const [status, setStatus] = useState("playing"); // playing, won, lost
  
  const audioRef = useRef(null);

  const resetGame = () => { // reset the game 
    setLetters(Array(WORD.length).fill(""));
    setWrong(0);
    setGuessed([]);
    setStatus("playing");
  };

  useEffect(() => {
    let newStatus = status;

    if (letters.join("") === WORD) newStatus = "won";
    else if (wrong >= MAX_WRONG) newStatus = "lost";

    if (newStatus !== status) setStatus(newStatus);

    if (audioRef.current) { // stop previous audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // play sounds
    if (newStatus === "lost") {
      audioRef.current = new Audio(sadHorn);
      audioRef.current.play();
    } else if (newStatus === "won") {
      audioRef.current = new Audio(twerk);
      audioRef.current.play();
    }
  }, [letters, wrong, status]);


  // keyboard input
  useEffect(() => {
    const handleKey = (e) => {
      if (status !== "playing") return;
      const key = e.key.toLowerCase();
      // only process keys that haven't been guessed yet
      if (/^[a-z]$/.test(key) && !guessed.includes(key)) makeGuess(key); 
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [guessed, status]);

  const makeGuess = async (letter) => {
    setGuessed((prev) => [...prev, letter]); // add the guessed letter to the list of guessed letters

    try {
      const res = await fetch("http://localhost:4000/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: WORD, guess: letter }),
      });
      const data = await res.json();
      if (data.matches?.length) {
        setLetters((prev) =>
          prev.map((l, i) => (data.matches.includes(i) ? letter : l))
        );
      } else {
        setWrong((w) => Math.min(MAX_WRONG, w + 1));
      }
    } catch (err) {
      console.error("Validation error:", err); 
    }
  };

  return (
    <div className="app-container p-8 text-white flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Hangman Game</h1>

      <HangmanSVG wrong={wrong} animateTwerk={status === "won"} forceFull={status === "won"} />

      <div className="flex space-x-6 text-6xl font-mono tracking-widest mt-4">
        {letters.map((l, i) => <span key={i}>{l ? l.toUpperCase() : "_ "}</span>)}
      </div>

      <Keyboard onPress={makeGuess} disabled={status !== "playing"} guessed={guessed} />

      <div className="mt-6 text-lg">
        {status === "won" && <div className="text-green-600">You won! LET'S GOOOO!</div>}
        {status === "lost" && <div className="text-red-600">You lost. BOOO!</div>}
      </div>

      <button onClick={resetGame} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"> New Game </button>
    </div>

  );
}


const Keyboard = ({ onPress, disabled, guessed }) => (
  <div className="space-y-2 mt-4">
    {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row, ri) => (
      <div className="flex justify-center" key={ri}>
        {row.split("").map((k) => (
          <button
            key={k}
            disabled={disabled || guessed.includes(k)}
            onClick={() => onPress(k)}
            className="mx-1 px-3 py-2 border rounded"
          >
            {k}
          </button>
        ))}
      </div>
    ))}
  </div>
);


const HangmanSVG = ({ wrong, animateTwerk, forceFull }) => {
  const show = (threshold) => forceFull || wrong >= threshold;
  const twerkGif = "/twerk.gif";

  if (animateTwerk) return ( // twerk if won
    <div className="flex justify-center mt-4">
      <img src={twerkGif} alt="Hangman twerking" className="w-64 h-64" />
    </div>
  );

  return (
    <div className="flex justify-center mt-4">
      <svg className="w-64 h-64" viewBox="0 0 200 200">
        <g>
          {/* gallows */}
          {show(0) && <line x1="20" y1="180" x2="180" y2="180" stroke="#fff" strokeWidth="4" />}
          {show(0) && <line x1="40" y1="180" x2="40" y2="20" stroke="#fff" strokeWidth="4" />}
          {show(1) && <line x1="40" y1="20" x2="120" y2="20" stroke="#fff" strokeWidth="4" />}
          {show(1) && <line x1="120" y1="20" x2="120" y2="40" stroke="#fff" strokeWidth="3" />}
          {/* stickman */}
          {show(2) && <circle cx="120" cy="55" r="14" stroke="#fff" fill="transparent" strokeWidth="2" />}
          {show(3) && <line x1="120" y1="69" x2="120" y2="110" stroke="#fff" strokeWidth="3" />}
          {show(4) && <line x1="120" y1="78" x2="100" y2="95" stroke="#fff" strokeWidth="3" />}
          {show(5) && <line x1="120" y1="78" x2="140" y2="95" stroke="#fff" strokeWidth="3" />}
          {show(6) && <line x1="120" y1="110" x2="105" y2="140" stroke="#fff" strokeWidth="3" />}
          {show(7) && <line x1="120" y1="110" x2="135" y2="140" stroke="#fff" strokeWidth="3" />}
        </g>
      </svg>
    </div>
  );
};
