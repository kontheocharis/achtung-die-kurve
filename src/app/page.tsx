import { GameView } from "@/components/game-view";
import { defaultSettings } from "@/game/settings";

const SETTINGS = defaultSettings();

export default function Home() {
  return (
    <div className="h-screen flex">
      <GameView settings={SETTINGS} />
    </div>
  );
}
