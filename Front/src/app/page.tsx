"use client"

import io from "socket.io-client";
const socket = io("http://localhost:3001");

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function randomString() {
  return Math.random().toString(36).substring(7)
}


export default function Home() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    socket.on("update_leaderboard", (players, scores) => {
      setLeaderboard(players);
    });

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
  }

  return (
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
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}

