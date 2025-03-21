import { Game } from "@/components/game";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-xl py-4">Achtung die Kurve!</h1>
      <Game />
    </div>
  );
}
