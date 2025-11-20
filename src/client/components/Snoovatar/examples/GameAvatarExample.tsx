/**
 * Game Avatar Example
 * 
 * Demonstrates how to integrate the Snoovatar system into a game
 */

import React, { useState, useEffect } from 'react';
import { Snoovatar, useSnoovatar, getAccessoryById } from '../index';
import type { SnoovatarPose } from '../types';

/**
 * Example: Player Avatar with Inventory
 */
export function PlayerAvatarWithInventory() {
  const {
    config,
    equipAccessory,
    unequipAccessory,
    setPose,
    toggleFacing,
    isLoading,
  } = useSnoovatar({
    username: 'player1',
    initialAccessories: [],
    fetchRedditAvatar: true,
  });

  const [inventory, setInventory] = useState<string[]>([
    'crown',
    'sunglasses',
    'trophy',
    'party_hat',
  ]);

  const equippedAccessoryIds = config.accessories?.map(acc => acc.id) || [];

  const handleEquip = (accessoryId: string) => {
    if (equippedAccessoryIds.includes(accessoryId)) {
      unequipAccessory(accessoryId);
    } else {
      equipAccessory(accessoryId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Avatar Display */}
      <div className="relative">
        <Snoovatar {...config} size="xlarge" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setPose('wave')}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Wave
        </button>
        <button
          onClick={() => setPose('celebrate')}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Celebrate
        </button>
        <button
          onClick={toggleFacing}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Turn
        </button>
      </div>

      {/* Inventory */}
      <div className="w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">Inventory</h3>
        <div className="grid grid-cols-4 gap-2">
          {inventory.map(accessoryId => {
            const accessory = getAccessoryById(accessoryId);
            const isEquipped = equippedAccessoryIds.includes(accessoryId);
            
            return (
              <button
                key={accessoryId}
                onClick={() => handleEquip(accessoryId)}
                className={`
                  p-2 border-2 rounded text-sm
                  ${isEquipped 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {accessory?.name || accessoryId}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Leaderboard with Avatars
 */
export function LeaderboardWithAvatars() {
  const players = [
    { username: 'player1', score: 1000, accessories: ['crown', 'trophy'] },
    { username: 'player2', score: 850, accessories: ['sunglasses'] },
    { username: 'player3', score: 720, accessories: ['party_hat'] },
  ];

  return (
    <div className="w-full max-w-md p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.username}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow"
          >
            <div className="text-2xl font-bold text-gray-400 w-8">
              #{index + 1}
            </div>
            
            <Snoovatar
              username={player.username}
              accessories={player.accessories
                .map(id => getAccessoryById(id))
                .filter(Boolean)}
              size="medium"
              animated
            />
            
            <div className="flex-1">
              <div className="font-semibold">{player.username}</div>
              <div className="text-sm text-gray-500">{player.score} points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Avatar with Game Events
 */
export function GameEventAvatar() {
  const { config, setPose } = useSnoovatar({
    username: 'player1',
    initialAccessories: ['crown'],
    fetchRedditAvatar: true,
  });

  const [eventLog, setEventLog] = useState<string[]>([]);

  const triggerEvent = (event: string, pose: SnoovatarPose) => {
    setPose(pose);
    setEventLog(prev => [`${event} triggered!`, ...prev].slice(0, 5));
    
    // Reset to idle after animation
    setTimeout(() => setPose('idle'), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Snoovatar {...config} size="xlarge" />

      <div className="flex gap-2">
        <button
          onClick={() => triggerEvent('Victory', 'celebrate')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Win
        </button>
        <button
          onClick={() => triggerEvent('Jump', 'jump')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Jump
        </button>
        <button
          onClick={() => triggerEvent('Defeat', 'sad')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Lose
        </button>
      </div>

      <div className="w-full max-w-md">
        <h3 className="text-sm font-bold mb-2">Event Log</h3>
        <div className="space-y-1">
          {eventLog.map((event, index) => (
            <div key={index} className="text-sm text-gray-600">
              {event}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Avatar Customization UI
 */
export function AvatarCustomizer() {
  const {
    config,
    equipAccessory,
    setColorScheme,
    setPose,
    toggleFacing,
  } = useSnoovatar({
    username: 'player1',
    initialAccessories: [],
    fetchRedditAvatar: false, // Use custom sprite for full customization
  });

  const colorSchemes = {
    reddit: { primary: '#FF4500', secondary: '#FFFFFF', eyes: '#000000', outline: '#000000' },
    blue: { primary: '#0079D3', secondary: '#FFFFFF', eyes: '#000000', outline: '#000000' },
    green: { primary: '#46D160', secondary: '#FFFFFF', eyes: '#000000', outline: '#000000' },
    purple: { primary: '#7C3AED', secondary: '#FFFFFF', eyes: '#000000', outline: '#000000' },
  };

  const accessories = {
    hats: ['crown', 'party_hat', 'top_hat'],
    glasses: ['sunglasses', 'monocle'],
    badges: ['star_badge', 'heart_badge'],
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Preview */}
      <div className="bg-gray-100 p-8 rounded-lg">
        <Snoovatar {...config} size="xlarge" animated />
      </div>

      {/* Color Schemes */}
      <div className="w-full max-w-md">
        <h3 className="font-bold mb-2">Colors</h3>
        <div className="flex gap-2">
          {Object.entries(colorSchemes).map(([name, scheme]) => (
            <button
              key={name}
              onClick={() => setColorScheme(scheme)}
              className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-500"
              style={{ backgroundColor: scheme.primary }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div className="w-full max-w-md space-y-4">
        {Object.entries(accessories).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-bold mb-2 capitalize">{category}</h3>
            <div className="flex gap-2">
              {items.map(accessoryId => {
                const accessory = getAccessoryById(accessoryId);
                return (
                  <button
                    key={accessoryId}
                    onClick={() => equipAccessory(accessoryId)}
                    className="px-3 py-2 border rounded text-sm hover:bg-gray-50"
                  >
                    {accessory?.name || accessoryId}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pose Controls */}
      <div className="w-full max-w-md">
        <h3 className="font-bold mb-2">Pose</h3>
        <div className="flex gap-2">
          {(['idle', 'wave', 'jump', 'celebrate', 'sad'] as const).map(pose => (
            <button
              key={pose}
              onClick={() => setPose(pose)}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-50 capitalize"
            >
              {pose}
            </button>
          ))}
        </div>
      </div>

      {/* Facing */}
      <button
        onClick={toggleFacing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Flip Direction
      </button>
    </div>
  );
}
