"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Canvas, { food, Player, Socket } from "./_components/canva";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import Leaderboard from "./_components/leaderboard";

const socket = io("http://localhost:3001");



export default function Home() {
  const { toast } = useToast();

  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState<Socket<Player>>({});
  const [died, setDied] = useState(false);

  function changeName(name: string) {
    if(name.length > 15 || name.length == 0) return;
    setName(name);
  }

  function connection(name: string) {

    if (!name) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid name",
      });

      return;
    }

    if (leaderboard[name]) {
      toast({
        title: "Name already in use",
        description: "Please enter a different name",
      });

      return;
    }

    socket.emit("set_name", name);

    toast({
      title: "Connection successful",
      description: `You are now connected as ${name}`,
    });

    setIsConnected(true);
  }

  useEffect(() => {
    socket.emit("request_players");
    socket.emit("request_food");

    socket.on("update_leaderboard", (players) => {
      console.log("Players", players);
      
      setLeaderboard(players);
    });

    return () => {
      socket.off("update_leaderboard");
    };
  }, []);

  const [foods, setFoods] = useState<food[]>([]);

  useEffect(() => {
    socket.on("update_food", (newFood) => {
      console.log("Foods", newFood);
      
      setFoods(newFood);
    });

    return () => {
      socket.off("update_food");
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isConnected) return;

      const { clientX, clientY } = event;
      const direction = Math.atan2(clientY - window.innerHeight / 2, clientX - window.innerWidth / 2);
      socket.emit("update_direction", direction);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isConnected]);

  useEffect(() => {
    socket.on("update_players", (players) => {
      setLeaderboard(players);
    });

    return () => {
      socket.off("update_players");
    };
  }, []);

  useEffect(() => {
    socket.on("died", () => {
      setDied(true);

      setTimeout(() => {
        setIsConnected(false);
      }, 2000);
    });

    return () => {
      socket.off("died");
    };
  }, []);
  

  return (
    <>
      <Dialog open={!isConnected}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {
                died ? 
                (
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">You died</span>
                  </div>
                ) :
                (
                  <div className="flex items-center gap-2">
                    <span>Join the game</span>
                  </div>
                )
              }
            </DialogTitle>
            <DialogDescription>
              Enter your nickname to join the game
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nickname
              </Label>
              <Input placeholder="Enter your name" value={name} onChange={e => changeName(e.currentTarget.value)} className="col-span-3"/>
            </div>
          </div>
          <DialogFooter>
            {
              died ? (
                <Button type="button" onClick={() => {connection(name);setDied(false)}}>Respawn</Button>
              ) : 
                <Button type="submit" onClick={() => {connection(name)}}>Join</Button>
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Leaderboard players={Object.values(leaderboard)} />
      <Canvas players={Object.values(leaderboard)} me={leaderboard[socket.id || ""]} foods={foods}/>
    </>
  );
}