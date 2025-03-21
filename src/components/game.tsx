"use client";

import { Vec2, rotate, normalised, add, scale, modulo } from "@/lib/vec2";
import { normalize } from "node:path/win32";
import {
  useRef,
  useEffect,
  useState,
  KeyboardEventHandler,
  KeyboardEvent,
} from "react";

interface Settings {
  speed: number;
  turningSpeed: number;
  dimensions: Vec2;
  snakeWidth: number;
  colourMap: Record<Player, string>;
}

interface Dynamics {
  position: Vec2;
  velocity: Vec2;
  acceleration: Vec2;
  turning?: "left" | "right";
}

interface State {
  settled: ((ctx: CanvasRenderingContext2D) => void)[];
  dynamics: Record<Player, Dynamics>;
  alive: Record<Player, boolean>;
  keys: Record<string, [Player, "left" | "right"]>;
  settings: Settings;
}

const PLAYERS = ["red", "blue", "green", "yellow", "magenta", "cyan"] as const;

const NUM_PENDING = 1;

type Player = (typeof PLAYERS)[number];

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

function updateDynamics(
  state: State,
  player: Player,
  deltaTime: number,
  isValidPosition: (position: Vec2) => boolean,
) {
  if (!state.alive[player]) {
    return;
  }

  const dynamics = state.dynamics[player];
  const settings = state.settings;

  if (typeof dynamics.turning !== "undefined") {
    const rotVec = scale(
      rotate(
        normalised(dynamics.velocity),
        dynamics.turning === "left" ? Math.PI / 2 : -Math.PI / 2,
      ),
      state.settings.turningSpeed,
    );
    dynamics.acceleration = rotVec;
  } else {
    dynamics.acceleration = [0, 0];
  }

  dynamics.velocity = scale(
    normalised(add(dynamics.velocity, scale(dynamics.acceleration, deltaTime))),
    settings.speed,
  );
  dynamics.position = modulo(
    add(dynamics.position, scale(dynamics.velocity, deltaTime)),
    settings.dimensions,
  );

  if (!isValidPosition(dynamics.position)) {
    dynamics.velocity = [0, 0];
    dynamics.acceleration = [0, 0];
    state.alive[player] = false;
  }
}

const GAP_EVERY = 1000;
const GAP_SIZE = 0;
const GAP_APART = 300;

function drawPlayer(
  state: State,
  player: Player,
  context: CanvasRenderingContext2D,
  settledContext: CanvasRenderingContext2D,
  deltaTime: number,
  iterations: number,
) {
  const { position } = state.dynamics[player];

  const draw = (context: CanvasRenderingContext2D) => {
    if (iterations % GAP_EVERY < GAP_SIZE) {
      return;
    }

    context.fillStyle = state.settings.colourMap[player];
    context.beginPath();
    context.ellipse(
      position[0],
      position[1],
      state.settings.snakeWidth,
      state.settings.snakeWidth,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
  };

  draw(context);
  state.settled.push(draw);

  if (state.settled.length >= NUM_PENDING / deltaTime) {
    const next = state.settled.shift();
    if (next) {
      next(settledContext);
    }
  }
}

function updateState(
  state: State,
  deltaTime: number,
  isValidPosition: (position: Vec2) => boolean,
) {
  for (const player of PLAYERS) {
    updateDynamics(state, player, deltaTime, isValidPosition);
  }
}

const SQRT_2 = Math.sqrt(2);

function isValidPosition(
  settings: Settings,
  position: Vec2,
  settledContext: CanvasRenderingContext2D,
) {
  const d = settledContext.getImageData(
    Math.max(0, Math.round(position[0] + settings.snakeWidth / 2)),
    Math.max(0, Math.round(position[1] + settings.snakeWidth / 2)),
    Math.max(0, Math.round(settings.snakeWidth / SQRT_2)),
    Math.max(0, Math.round(settings.snakeWidth / SQRT_2)),
  );
  return d.data.every((value) => {
    return value == 0 || value == 1;
  });
}

function renderGameFrame(
  state: State,
  context: CanvasRenderingContext2D,
  settledContext: CanvasRenderingContext2D,
  deltaTime: number,
  iterations: number,
) {
  updateState(state, deltaTime, (pos) =>
    isValidPosition(state.settings, pos, settledContext),
  );
  let gap = iterations;
  for (const player of PLAYERS) {
    drawPlayer(state, player, context, settledContext, deltaTime, gap);
    gap += GAP_APART;
  }
}

function setInitialDynamics(state: State) {
  const centre = scale(state.settings.dimensions, 0.5);
  for (const player of PLAYERS) {
    const dir = normalised(
      add(scale(centre, -1), state.dynamics[player].position),
    );
    state.dynamics[player].velocity = scale(dir, -state.settings.speed);
    state.dynamics[player].acceleration = [0, 0];
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
