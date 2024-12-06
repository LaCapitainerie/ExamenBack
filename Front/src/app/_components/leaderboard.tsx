import React from 'react';
import { Player } from './canva';

interface LeaderboardProps {
    players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
    return (
        <div className="fixed top-0 right-0 m-4 p-4 bg-white shadow-lg rounded-lg w-64">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
            <ul>
                {players.sort((a, b) => b.score - a.score).map((player, index) => (
                    <li key={index} className="flex justify-between py-1">
                        <span>{player.name}</span>
                        <span>{player.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;