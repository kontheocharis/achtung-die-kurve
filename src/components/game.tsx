"use client";

import { renderGameFrame } from "@/game/rendering";
import { setInitialDynamics, State } from "@/game/state";
import { KeyboardEvent, useEffect, useRef } from "react";

function handleKeyDown(
  state: State,
  event: KeyboardEvent<HTMLCanvasElement>,
): void {
  if (event.repeat) return;
  const bind = state.keys[event.key];
  if (typeof bind !== "undefined") {
    const [player, dir] = bind;
    state.dynamics[player].turning = dir;
  }
}

function handleKeyUp(
  state: State,
  event: KeyboardEvent<HTMLCanvasElement>,
): void {
  const bind = state.keys[event.key];
  if (typeof bind !== "undefined") {
    const [player, _] = bind;
    state.dynamics[player].turning = undefined;
  }
}

const state: State = {
  settled: [],
  dynamics: {
    red: { position: [50, 10], velocity: [0, 0], acceleration: [0, 0] },
    blue: { position: [50, 950], velocity: [0, 0], acceleration: [0, 0] },
    green: { position: [950, 50], velocity: [0, 0], acceleration: [0, 0] },
    yellow: { position: [950, 950], velocity: [0, 0], acceleration: [0, 0] },
    magenta: { position: [500, 500], velocity: [0, 0], acceleration: [0, 0] },
    cyan: { position: [500, 500], velocity: [0, 0], acceleration: [0, 0] },
  },
  keys: {
    a: ["red", "left"],
    d: ["red", "right"],
    j: ["blue", "left"],
    k: ["blue", "right"],
    v: ["cyan", "left"],
    b: ["cyan", "right"],
    t: ["magenta", "left"],
    y: ["magenta", "right"],
    o: ["green", "left"],
    p: ["green", "right"],
    z: ["yellow", "left"],
    x: ["yellow", "right"],
  },
  alive: {
    red: true,
    blue: true,
    green: true,
    yellow: true,
    magenta: true,
    cyan: true,
  },
  settings: {
    speed: 100,
    turningSpeed: 500,
    dimensions: [1000, 1000],
    snakeWidth: 5,
    colourMap: {
      red: "#ff0000",
      blue: "#0000ff",
      green: "#00ff00",
      yellow: "#ffff00",
      magenta: "#ff00ff",
      cyan: "#00ffff",
    },
  },
};

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settledCanvasRef = useRef<HTMLCanvasElement>(null);

  setInitialDynamics(state);

  useEffect(() => {
    let requestId: number | null = null;
    canvasRef.current?.focus();

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const settledContext = settledCanvasRef.current?.getContext("2d");
    if (!settledContext) return;

    // Set setled context to transparent
    settledContext.fillStyle = "#00000000";
    settledContext.fillRect(
      0,
      0,
      settledCanvasRef.current?.width || 0,
      settledCanvasRef.current?.height || 0,
    );

    let oldTime = Date.now();
    const render = (newTime: number) => {
      const deltaTime = (newTime - oldTime) / 1000;
      if (deltaTime >= 0) {
        renderGameFrame(state, context, settledContext, deltaTime, newTime);
      }
      oldTime = newTime;
      requestId = requestAnimationFrame(render);
    };
    render(oldTime);

    return () => cancelAnimationFrame(requestId || -1);
  }, []);

  return (
    <>
      <canvas
        style={{ display: "none" }}
        width={state.settings.dimensions[0]}
        height={state.settings.dimensions[1]}
        ref={settledCanvasRef}
      />
      <canvas
        tabIndex={1}
        onKeyDown={(e) => handleKeyDown(state, e)}
        onKeyUp={(e) => handleKeyUp(state, e)}
        width={state.settings.dimensions[0]}
        height={state.settings.dimensions[1]}
        style={{ width: "100%" }}
        ref={canvasRef}
      />
    </>
  );
}
