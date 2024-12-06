import React, { useRef, useEffect } from 'react';

interface Player {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
}

interface CanvasProps {
    players: Player[];
}

const Canvas: React.FC<CanvasProps> = ({ players }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            players.forEach(player => {
                context.beginPath();
                context.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
                context.fillStyle = player.color;
                context.fill();
                context.closePath();
            });
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
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
    
        if (context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            drawGrid(context, canvas.width, canvas.height, 50);
    
            players.forEach(player => {
                context.beginPath();
                context.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
                context.fillStyle = player.color;
                context.fill();
                context.closePath();
            });
        }
    }, [players]);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const context = canvas.getContext('2d');
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    drawGrid(context, canvas.width, canvas.height, 50);
                    players.forEach(player => {
                        context.beginPath();
                        context.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
                        context.fillStyle = player.color;
                        context.fill();
                        context.closePath();
                    });
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

