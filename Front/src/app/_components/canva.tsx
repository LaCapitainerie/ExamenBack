import React, { useRef, useEffect } from 'react';

export type Socket<T> = {
    [key: string]: T;
}

export type Player = {
    name: string;
    score: number;
    x: number;
    y: number;
  
    color: string;
}

export type food = {
    x: number;
    y: number;
    color: string;
}

interface CanvasProps {
    players: Player[];
    foods: food[];
    me?: Player;
}

type offset = {
    x: number;
    y: number;
}

const Canvas: React.FC<CanvasProps> = ({ players, foods, me }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const offset = { x: Math.floor(window.innerWidth / 2), y: Math.floor(window.innerHeight / 2) }

    function drawPlayer(player: Player, context: CanvasRenderingContext2D, offset: offset = { x: 0, y: 0 }) {

        context.beginPath();
        context.arc(player.x + offset.x, player.y + offset.y, player.score, 0, Math.PI * 2, false);
        context.fillStyle = player.color;
        context.fill();
        context.closePath();

        context.beginPath();
        context.font = "20px Arial";
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(player.name, player.x + offset.x, player.y + offset.y);
        context.closePath();

    }

    function drawPlayers(context: CanvasRenderingContext2D, players: Player[], me?: Player, ) {

        

        players.forEach(player => {
            if (player.name === me?.name) { return; }
            drawPlayer(player, context, { x: offset.x - (me?.x || 0), y: offset.y - (me?.y || 0) });
        });

        if(me)drawPlayer({...me, x:0, y:0,}, context, offset);
    }

    function drawFood(context: CanvasRenderingContext2D, foods: food[], offset: offset = { x: 0, y: 0 }) {
        foods.forEach(food => {
            context.beginPath();
            context.arc(food.x + offset.x, food.y + offset.y, 5, 0, Math.PI * 2, false);
            context.fillStyle = food.color;
            context.fill();
            context.closePath();
        });
    }

    function drawGame(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, players: Player[], foods: food[], me?: Player) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(context, canvas.width, canvas.height, 50);
        drawPlayers(context, players, me);
        drawFood(context, foods, { x: offset.x - (me?.x || 0), y: offset.y - (me?.y || 0) });
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (context && canvas) {
            drawGame(context, canvas, players, foods || [], me);
        }
    }, [players]);

    const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number, gridSize: number) => {
        context.strokeStyle = '#e0e0e0';
        for (let x = 0; x <= width; x += gridSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    drawGame(context, canvas, players, foods || [], me);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [players]);

    return <canvas ref={canvasRef} />;
};

export default Canvas;

