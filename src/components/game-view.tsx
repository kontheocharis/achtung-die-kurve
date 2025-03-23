"use client";

import { newState, State } from "@/game/state";
import { handleKeyDown, handleKeyUp, renderGameFrame } from "@/game/controller";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getAspectRatio, Settings } from "@/game/settings";

function handleResize(
  canvas: HTMLCanvasElement,
  state: State,
  entries: ResizeObserverEntry[],
) {
  const aspect = getAspectRatio(state.settings);
  const entry = entries.find((entry) => entry.target === canvas);
  if (!entry) return;

  const width = entry.devicePixelContentBoxSize[0].inlineSize;
  const height = entry.devicePixelContentBoxSize[0].blockSize;

  if (width / height < aspect) {
    // use width
    state.unitsPerPixel =
      (state.settings.dimensions[0] * devicePixelRatio) / width;
    canvas.width = width / devicePixelRatio;
    canvas.height = canvas.width / aspect;
  } else {
    // use height
    state.unitsPerPixel =
      (state.settings.dimensions[1] * devicePixelRatio) / height;
    canvas.height = height / devicePixelRatio;
    canvas.width = canvas.height * aspect;
  }
}

export function GameView({ settings }: { settings: Settings }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef(newState(settings));

  useEffect(() => {
    let requestId: number | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Bring to front
    canvas.focus();

    // Resize events
    const observer = new ResizeObserver((entries) =>
      handleResize(canvas, state.current, entries),
    );
    observer.observe(canvas, { box: "device-pixel-content-box" });

    const context = canvas.getContext("2d");
    if (!context) return;

    let oldTime = Date.now();
    const render = (newTime: number) => {
      const deltaTime = (newTime - oldTime) / 1000;
      if (deltaTime > 0) {
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
      className="h-full w-full object-contain m-auto"
      tabIndex={1}
      onKeyDown={(e) => handleKeyDown(state.current, e)}
      onKeyUp={(e) => handleKeyUp(state.current, e)}
      width={String(settings.dimensions[0] / settings.unitsPerPixel)}
      height={String(settings.dimensions[1] / settings.unitsPerPixel)}
      ref={canvasRef}
    />
  );
}
