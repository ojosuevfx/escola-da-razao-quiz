"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouse  = useRef({ x: 0, y: 0 });
  const ring   = useRef({ x: 0, y: 0 });
  const raf    = useRef<number>(0);

  const [visible,  setVisible]  = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // só ativa em dispositivos sem touch
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement;
      setHovering(
        el.closest("a, button, [role=button], .option-card") !== null
      );
    };

    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);
    const onOut  = () => setVisible(false);

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onOut);

    const loop = () => {
      const lerp = 0.12;
      ring.current.x += (mouse.current.x - ring.current.x) * lerp;
      ring.current.y += (mouse.current.y - ring.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${mouse.current.x}px, ${mouse.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onOut);
      cancelAnimationFrame(raf.current);
    };
  }, [visible]);

  if (typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches) return null;

  const ringSize  = hovering ? 44 : clicking ? 18 : 32;
  const ringColor = hovering
    ? "rgba(201,168,76,0.55)"
    : "rgba(201,168,76,0.35)";

  return (
    <>
      {/* dot */}
      <div
        ref={dotRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         6,
          height:        6,
          borderRadius:  "50%",
          background:    "#c9a84c",
          pointerEvents: "none",
          zIndex:        99999,
          marginLeft:    -3,
          marginTop:     -3,
          opacity:       visible ? 1 : 0,
          transition:    "opacity 200ms",
          willChange:    "transform",
        }}
      />

      {/* ring */}
      <div
        ref={ringRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         ringSize,
          height:        ringSize,
          borderRadius:  "50%",
          border:        `1.5px solid ${ringColor}`,
          pointerEvents: "none",
          zIndex:        99998,
          marginLeft:    -(ringSize / 2),
          marginTop:     -(ringSize / 2),
          opacity:       visible ? 1 : 0,
          transition:    "width 200ms ease, height 200ms ease, margin 200ms ease, border-color 200ms ease, opacity 200ms",
          willChange:    "transform",
          backdropFilter: hovering ? "blur(1px)" : "none",
        }}
      />
    </>
  );
}
