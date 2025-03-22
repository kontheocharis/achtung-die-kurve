"use client";

import { newState } from "@/game/state";
import { handleKeyDown, handleKeyUp, renderGameFrame } from "@/game/controller";
import { useEffect, useRef } from "react";
import { Settings } from "@/game/settings";

export function GameView({ settings }: { settings: Settings }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef(newState(settings));

  useEffect(() => {
    let requestId: number | null = null;
    canvasRef.current?.focus();

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    let oldTime = Date.now();
    const render = (newTime: number) => {
      const deltaTime = (newTime - oldTime) / 1000;
      if (deltaTime >= 0) {
        renderGameFrame(state.current, context, deltaTime);
      }
      oldTime = newTime;
      requestId = requestAnimationFrame(render);
    };
    render(oldTime);

    return () => cancelAnimationFrame(requestId || -1);
  }, []);

  return (
    <canvas
      tabIndex={1}
      onKeyDown={(e) => handleKeyDown(state.current, e)}
      onKeyUp={(e) => handleKeyUp(state.current, e)}
      width={settings.dimensions[0]}
      height={settings.dimensions[1]}
      style={{ width: "100%" }}
      ref={canvasRef}
    />
  );
}
