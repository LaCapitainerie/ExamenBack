"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Canvas, { Player, Socket } from "./_components/canva";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";

const socket = io("http://localhost:3001");



export default function Home() {
  const { toast } = useToast();

  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState<Socket<Player>>({});

  function changeName(name: string) {
    if(name.length > 15) return;
    setName(name);
  }

  useEffect(() => {
    socket.emit("request_players");

    socket.on("update_leaderboard", (players) => {
      console.log(players);
      
      setLeaderboard(players);
    });

    return () => {
      socket.off("update_leaderboard");
    };
  }, []);

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

  return (
    <>
      <Dialog open={!isConnected}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join the Game</DialogTitle>
            <DialogDescription>
              Make your profile before joining up.
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
            <Button type="submit" onClick={() => connection(name)}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Canvas players={Object.values(leaderboard)} me={leaderboard[socket.id || ""]}/>
    </>
  );
}