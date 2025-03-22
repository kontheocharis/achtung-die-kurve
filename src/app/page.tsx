import { GameView } from "@/components/game-view";
import { defaultSettings } from "@/game/settings";

const SETTINGS = defaultSettings();

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-xl py-4">Achtung die Kurve!</h1>
      <GameView settings={SETTINGS} />
    </div>
  );
}
