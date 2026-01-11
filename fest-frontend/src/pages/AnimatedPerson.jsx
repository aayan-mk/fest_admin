import React, { useRef, useState, useEffect } from "react";
import "./AnimatedPerson.css";

export default function AnimatedPerson({ mode }) {
  // mode: "idle" | "email" | "password" | "otp"
  const faceRef = useRef();
  const [eyeOffset, setEyeOffset] = useState({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });

  useEffect(() => {
    function handleMouseMove(e) {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Mouse position relative to center of face
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Increase sensitivity by dividing less
      const maxX = 7, maxY = 5;
      const eyeX = Math.max(-maxX, Math.min(maxX, dx / 4));
      const eyeY = Math.max(-maxY, Math.min(maxY, dy / 5));
      setEyeOffset({
        left: { x: eyeX, y: eyeY },
        right: { x: eyeX, y: eyeY }
      });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`animated-person ${mode}`}>
      <div className="head">
        <div
          className="face"
          ref={faceRef}
        >
          <div
            className="eye left"
            style={{ left: `${4 + eyeOffset.left.x}px`, top: `${7 + eyeOffset.left.y}px` }}
          />
          <div
            className="eye right"
            style={{ right: `${4 - eyeOffset.right.x}px`, top: `${7 + eyeOffset.right.y}px` }}
          />
          <div className="mouth" />
        </div>
        <div className="hand left" />
        <div className="hand right" />
      </div>
      <div className="body" />
    </div>
  );
}
