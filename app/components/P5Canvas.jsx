"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";

export default function P5Canvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
      };

      p.draw = () => {
        p.background(240);

        // Circle follows the mouse
        p.fill(255, 0, 0);
        p.noStroke();
        p.circle(p.mouseX, p.mouseY, 100);
      };
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={canvasRef} />;
}