'use client';

import { useState } from 'react';

interface SetupScreenProps {
  onStart: (smallBlind: number, bigBlind: number, startingChips: number, playerCount: number) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [startingChips, setStartingChips] = useState(1000);
  const [playerCount, setPlayerCount] = useState(7);
  
  const handleStart = () => {
    if (smallBlind > 0 && bigBlind > smallBlind && startingChips > 0 && playerCount >= 2 && playerCount <= 7) {
      onStart(smallBlind, bigBlind, startingChips, playerCount);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-center">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">텍사스 홀덤</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">스몰 블라인드 (SB)</label>
            <input
              type="number"
              min="1"
              value={smallBlind}
              onChange={(e) => setSmallBlind(Number(e.target.value))}
              className="w-full px-4 py-2 rounded text-black"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">빅 블라인드 (BB)</label>
            <input
              type="number"
              min={smallBlind + 1}
              value={bigBlind}
              onChange={(e) => setBigBlind(Number(e.target.value))}
              className="w-full px-4 py-2 rounded text-black"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">1인당 시작 자본</label>
            <input
              type="number"
              min="1"
              value={startingChips}
              onChange={(e) => setStartingChips(Number(e.target.value))}
              className="w-full px-4 py-2 rounded text-black"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">플레이어 수 (2-7명)</label>
            <input
              type="number"
              min="2"
              max="7"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded text-black"
            />
          </div>
          
          <button
            onClick={handleStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg transition"
          >
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}

