import { useCallback, useEffect, useMemo, useState } from "react";
import { ALPHABET } from "./data/alphabet.js";

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.82;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [mode, setMode] = useState("learn");
  const [selected, setSelected] = useState(ALPHABET[0]);
  const [quizTarget, setQuizTarget] = useState(null);
  const [quizChoices, setQuizChoices] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const nextQuiz = useCallback(() => {
    const target = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const others = shuffle(ALPHABET.filter((e) => e.letter !== target.letter)).slice(
      0,
      3,
    );
    const choices = shuffle([target, ...others]);
    setQuizTarget(target);
    setQuizChoices(choices);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (mode === "quiz") nextQuiz();
  }, [mode, nextQuiz]);

  const onPickLearn = (entry) => {
    setSelected(entry);
    setFeedback(null);
  };

  const onPickQuiz = (entry) => {
    if (!quizTarget || feedback === "yes") return;
    if (entry.letter === quizTarget.letter) {
      setFeedback("yes");
      setScore((s) => s + 1);
      speak(`Yes! ${entry.letter} for ${entry.word}`);
    } else {
      setFeedback("no");
      speak(`Try again. Look for ${quizTarget.letter}`);
    }
  };

  const hint = useMemo(() => {
    if (mode !== "quiz" || !quizTarget) return null;
    return `Find the letter ${quizTarget.letter}`;
  }, [mode, quizTarget]);

  return (
    <div className="abc-app">
      <header className="abc-header">
        <h1 className="abc-title">ABC Fun</h1>
        <p className="abc-sub">Tap letters, hear words, play a tiny quiz</p>
        <div className="abc-modes" role="tablist" aria-label="Mode">
          <button
            type="button"
            className={mode === "learn" ? "abc-tab active" : "abc-tab"}
            onClick={() => setMode("learn")}
            aria-selected={mode === "learn"}
          >
            Learn
          </button>
          <button
            type="button"
            className={mode === "quiz" ? "abc-tab active" : "abc-tab"}
            onClick={() => setMode("quiz")}
            aria-selected={mode === "quiz"}
          >
            Quiz
          </button>
        </div>
      </header>

      {mode === "learn" && (
        <section className="abc-panel" aria-label="Letter detail">
          <div className="abc-big-letter" aria-live="polite">
            {selected.letter}
          </div>
          <div className="abc-emoji" aria-hidden>
            {selected.emoji}
          </div>
          <p className="abc-word">
            <strong>{selected.word}</strong> starts with {selected.letter}
          </p>
          <div className="abc-actions">
            <button type="button" className="abc-btn primary" onClick={() => speak(selected.letter)}>
              Say letter
            </button>
            <button type="button" className="abc-btn" onClick={() => speak(`${selected.word}`)}>
              Say word
            </button>
          </div>
        </section>
      )}

      {mode === "quiz" && quizTarget && (
        <section className="abc-quiz" aria-label="Quiz">
          <p className="abc-quiz-prompt">{hint}</p>
          <p className="abc-score">Score: {score}</p>
          <div className="abc-actions">
            <button
              type="button"
              className="abc-btn primary"
              onClick={() => speak(`Find the letter ${quizTarget.letter}`)}
            >
              Hear hint
            </button>
            {feedback === "yes" && (
              <button type="button" className="abc-btn" onClick={nextQuiz}>
                Next question
              </button>
            )}
          </div>
          {feedback === "no" && (
            <p className="abc-feedback miss" role="status">
              Oops — try another button.
            </p>
          )}
          {feedback === "yes" && (
            <p className="abc-feedback hit" role="status">
              Nice one!
            </p>
          )}
          <div className="abc-quiz-grid">
            {quizChoices.map((e) => (
              <button
                key={e.letter}
                type="button"
                className="abc-quiz-choice"
                onClick={() => onPickQuiz(e)}
                disabled={feedback === "yes"}
              >
                <span className="abc-quiz-letter">{e.letter}</span>
                <span className="abc-quiz-emoji" aria-hidden>
                  {e.emoji}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="abc-grid-wrap" aria-label="Alphabet">
        <h2 className="abc-grid-title">All letters</h2>
        <div className="abc-grid">
          {ALPHABET.map((e) => (
            <button
              key={e.letter}
              type="button"
              className={
                mode === "learn" && selected.letter === e.letter
                  ? "abc-cell selected"
                  : "abc-cell"
              }
              onClick={() => {
                if (mode === "learn") onPickLearn(e);
              }}
              disabled={mode === "quiz"}
              title={mode === "quiz" ? "Use the quiz buttons above" : `${e.letter} — ${e.word}`}
            >
              <span className="abc-cell-letter">{e.letter}</span>
              <span className="abc-cell-emoji" aria-hidden>
                {e.emoji}
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="abc-footer">
        Uses your browser voice (Chrome / Edge work great). Turn sound on.
      </footer>
    </div>
  );
}
