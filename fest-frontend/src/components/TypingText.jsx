import { useEffect, useState } from "react";

export default function TypingText({ text, speed = 80, pause = 800, loop = false, className = "" }) {
  const texts = Array.isArray(text) ? text : [text];
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const full = texts[idx];

    if (!isDeleting && display === full) {
      if (loop) {
        timeout = setTimeout(() => setIsDeleting(true), pause);
      }
    } else if (isDeleting && display === "") {
      setIsDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    } else {
      const delta = isDeleting ? speed / 2 : speed;
      timeout = setTimeout(() => {
        setDisplay((d) => {
          const next = isDeleting ? full.slice(0, d.length - 1) : full.slice(0, d.length + 1);
          return next;
        });
      }, delta);
    }

    return () => clearTimeout(timeout);
  }, [display, isDeleting, idx, texts, speed, pause, loop]);

  return (
    <span className={className}>
      {display}
      <span className="typing-caret" aria-hidden>▌</span>
    </span>
  );
}
