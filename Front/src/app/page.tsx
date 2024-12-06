"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Canvas from "./_components/canva";

const socket = io("http://localhost:3001");

export default function Home() {
  const { toast } = useToast();

  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState<{ [key: string]: string }>({});

  // Récupérer la liste des joueurs dès la connexion
  useEffect(() => {
    // Demander la liste des joueurs au serveur
    socket.emit("request_players");

    // Écouter les mises à jour de la liste des joueurs
    socket.on("update_leaderboard", (players, scores) => {
      setLeaderboard(players); // Mettre à jour l'état avec les joueurs reçus
    });

    // Nettoyer les écouteurs lorsque le composant est démonté
    return () => {
      socket.off("update_leaderboard");
    };
  }, []);

  function connection(name: string) {
    socket.emit("set_name", name);

    toast({
      title: "Connection successful",
      description: `You are now connected as ${name}`,
    });

    setIsConnected(true);
  }

  return (
    !isConnected ? (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <Input placeholder="Enter your name" value={name} onChange={e => setName(e.currentTarget.value)} />
          <Button onClick={() => connection(name)}>Join</Button>

          <div>
            <h2>Leaderboard</h2>
            <ul>
              {Object.entries(leaderboard).map(([id, playerName]) => (
                <li key={id}>{playerName}</li>
              ))}
            </ul>
          </div>
        </main>
      </div >
    ) : (
      <Canvas players={[]} />
    )
  );
}