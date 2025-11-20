# Snoovatar Implementation Guide

## Overview

This guide walks you through implementing the Snoovatar system in your Reddit Devvit game, from basic avatar display to advanced game integration with accessories and animations.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Fetching Reddit Avatars](#fetching-reddit-avatars)
3. [Adding Accessories](#adding-accessories)
4. [Animations and Poses](#animations-and-poses)
5. [Game Integration](#game-integration)
6. [Performance Optimization](#performance-optimization)
7. [Brand Compliance](#brand-compliance)

---

## Basic Setup

### Step 1: Import the Component

```tsx
import { Snoovatar } from './components/Snoovatar';
```

### Step 2: Display a Basic Avatar

```tsx
function MyComponent() {
  return (
    <Snoovatar
      username="player1"
      size="medium"
    />
  );
}
```

This will display a custom sprite avatar with a color scheme generated from the username.

---

## Fetching Reddit Avatars

### Step 1: Use the Hook

```tsx
import { useSnoovatar, Snoovatar } from './components/Snoovatar';

function PlayerAvatar({ username }: { username: string }) {
  const { config, isLoading, error } = useSnoovatar({
    username,
    fetchRedditAvatar: true, // Enable Reddit avatar fetching
  });

  if (error) {
    console.error('Failed to load avatar:', error);
  }

  return (
    <Snoovatar
      {...config}
      size="large"
      loading={isLoading}
    />
  );
}
```

### Step 2: Server-Side Caching

The avatar URL is automatically cached in Redis for 1 hour. The server endpoint is already implemented:

```typescript
// Server: src/server/core/avatar.ts
export async function getAvatarUrl(username: string): Promise<string> {
  // Checks cache first
  // Falls back to Reddit API
  // Returns default avatar if needed
}
```

### Step 3: Manual Fetching (Alternative)

If you prefer manual control:

```tsx
const [avatarUrl, setAvatarUrl] = useState<string>();

useEffect(() => {
  fetch(`/api/user/avatar?username=${username}`)
    .then(res => res.json())
    .then(data => setAvatarUrl(data.avatarUrl));
}, [username]);

return (
  <Snoovatar
    username={username}
    redditAvatarUrl={avatarUrl}
    size="large"
  />
);
```

---

## Adding Accessories

### Step 1: Equip Accessories

```tsx
import { useSnoovatar, Snoovatar } from './components/Snoovatar';

function AvatarWithAccessories() {
  const { config, equipAccessory, unequipAccessory } = useSnoovatar({
    username: 'player1',
    initialAccessories: ['crown'], // Start with crown equipped
  });

  return (
    <div>
      <Snoovatar {...config} size="xlarge" />
      
      <button onClick={() => equipAccessory('sunglasses')}>
        Equip Sunglasses
      </button>
      
      <button onClick={() => unequipAccessory('crown')}>
        Remove Crown
      </button>
    </div>
  );
}
```

### Step 2: Store in Redis

```typescript
// Server-side: Save equipped accessories
await redis.hSet(`user:${userId}:avatar`, {
  accessories: JSON.stringify(['crown', 'sunglasses']),
  lastUpdated: Date.now().toString(),
});

// Load on game start
const avatarData = await redis.hGetAll(`user:${userId}:avatar`);
const accessories = JSON.parse(avatarData.accessories || '[]');
```

### Step 3: Create API Endpoint

```typescript
// Server: src/server/index.ts
router.get('/api/user/accessories', async (req, res) => {
  const { userId } = context;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const avatarData = await redis.hGetAll(`user:${userId}:avatar`);
  const accessories = JSON.parse(avatarData.accessories || '[]');
  
  res.json({ accessories });
});

router.post('/api/user/accessories', async (req, res) => {
  const { userId } = context;
  const { accessories } = req.body;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  await redis.hSet(`user:${userId}:avatar`, {
    accessories: JSON.stringify(accessories),
    lastUpdated: Date.now().toString(),
  });
  
  res.json({ success: true });
});
```

### Step 4: Load Accessories on Mount

```tsx
function GameAvatar() {
  const [savedAccessories, setSavedAccessories] = useState<string[]>([]);
  
  useEffect(() => {
    fetch('/api/user/accessories')
      .then(res => res.json())
      .then(data => setSavedAccessories(data.accessories));
  }, []);
  
  const { config, equipAccessory } = useSnoovatar({
    username: 'player1',
    initialAccessories: savedAccessories,
  });
  
  return <Snoovatar {...config} size="large" />;
}
```

---

## Animations and Poses

### Step 1: Trigger Poses

```tsx
function AnimatedAvatar() {
  const { config, setPose } = useSnoovatar({
    username: 'player1',
  });
  
  const celebrate = () => {
    setPose('celebrate');
    setTimeout(() => setPose('idle'), 2000); // Reset after 2s
  };
  
  return (
    <div>
      <Snoovatar {...config} size="large" animated />
      <button onClick={celebrate}>Celebrate!</button>
    </div>
  );
}
```

### Step 2: Game Event Animations

```tsx
function GameAvatar() {
  const { config, setPose } = useSnoovatar({
    username: 'player1',
  });
  
  // Trigger animations based on game events
  useEffect(() => {
    const handleGameEvent = (event: CustomEvent) => {
      switch (event.detail.type) {
        case 'win':
          setPose('celebrate');
          setTimeout(() => setPose('idle'), 2000);
          break;
        case 'lose':
          setPose('sad');
          setTimeout(() => setPose('idle'), 2000);
          break;
        case 'powerup':
          setPose('jump');
          setTimeout(() => setPose('idle'), 1000);
          break;
      }
    };
    
    window.addEventListener('game-event', handleGameEvent as EventListener);
    return () => window.removeEventListener('game-event', handleGameEvent as EventListener);
  }, [setPose]);
  
  return <Snoovatar {...config} size="large" animated />;
}
```

### Step 3: Continuous Animations

```tsx
function IdleAnimations() {
  const { config, setPose } = useSnoovatar({
    username: 'player1',
  });
  
  useEffect(() => {
    const poses: SnoovatarPose[] = ['idle', 'wave', 'idle', 'idle'];
    let index = 0;
    
    const interval = setInterval(() => {
      setPose(poses[index]);
      index = (index + 1) % poses.length;
    }, 3000);
    
    return () => clearInterval(interval);
  }, [setPose]);
  
  return <Snoovatar {...config} size="large" animated />;
}
```

---

## Game Integration

### Achievement System

```tsx
// Define achievement rewards
const ACHIEVEMENT_REWARDS: Record<string, string> = {
  'first_win': 'trophy',
  'speed_demon': 'sunglasses',
  'champion': 'crown',
  'party_animal': 'party_hat',
};

function AchievementSystem() {
  const { config, equipAccessory } = useSnoovatar({
    username: 'player1',
  });
  
  const unlockAchievement = async (achievementId: string) => {
    const accessory = ACHIEVEMENT_REWARDS[achievementId];
    
    if (accessory) {
      // Equip the accessory
      equipAccessory(accessory);
      
      // Save to server
      await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId, accessory }),
      });
      
      // Show notification
      alert(`Achievement unlocked! You earned: ${accessory}`);
    }
  };
  
  return (
    <div>
      <Snoovatar {...config} size="large" />
      <button onClick={() => unlockAchievement('first_win')}>
        Win Game
      </button>
    </div>
  );
}
```

### Leaderboard Integration

```tsx
function Leaderboard() {
  const [players, setPlayers] = useState<Array<{
    username: string;
    score: number;
    accessories: string[];
  }>>([]);
  
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setPlayers(data.players));
  }, []);
  
  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <div key={player.username} className="flex items-center gap-3">
          <span className="text-2xl font-bold">#{index + 1}</span>
          
          <Snoovatar
            username={player.username}
            accessories={player.accessories
              .map(id => getAccessoryById(id))
              .filter(Boolean)}
            size="medium"
          />
          
          <div>
            <div className="font-bold">{player.username}</div>
            <div className="text-sm text-gray-500">{player.score} pts</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Shop System

```tsx
function AvatarShop() {
  const { config, equipAccessory } = useSnoovatar({
    username: 'player1',
  });
  
  const [coins, setCoins] = useState(100);
  
  const shopItems = [
    { id: 'crown', name: 'Golden Crown', price: 50 },
    { id: 'sunglasses', name: 'Cool Sunglasses', price: 30 },
    { id: 'trophy', name: 'Trophy', price: 40 },
  ];
  
  const purchaseItem = async (item: typeof shopItems[0]) => {
    if (coins < item.price) {
      alert('Not enough coins!');
      return;
    }
    
    // Deduct coins
    setCoins(coins - item.price);
    
    // Equip accessory
    equipAccessory(item.id);
    
    // Save purchase to server
    await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, price: item.price }),
    });
  };
  
  return (
    <div>
      <div className="mb-4">
        <Snoovatar {...config} size="xlarge" />
        <div className="text-lg font-bold mt-2">Coins: {coins}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {shopItems.map(item => (
          <button
            key={item.id}
            onClick={() => purchaseItem(item)}
            className="p-3 border rounded hover:bg-gray-50"
          >
            <div className="font-bold">{item.name}</div>
            <div className="text-sm text-gray-500">{item.price} coins</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Performance Optimization

### Memoization

```tsx
import { memo } from 'react';

const MemoizedSnoovatar = memo(Snoovatar);

function PlayerList({ players }: { players: Player[] }) {
  return (
    <div>
      {players.map(player => (
        <MemoizedSnoovatar
          key={player.username}
          username={player.username}
          size="small"
        />
      ))}
    </div>
  );
}
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const Snoovatar = lazy(() => import('./components/Snoovatar').then(m => ({ default: m.Snoovatar })));

function LazyAvatar() {
  return (
    <Suspense fallback={<div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />}>
      <Snoovatar username="player1" size="large" />
    </Suspense>
  );
}
```

### Batch Avatar Fetching

```typescript
// Server endpoint for batch fetching
router.post('/api/avatars/batch', async (req, res) => {
  const { usernames } = req.body;
  
  if (!Array.isArray(usernames)) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }
  
  const avatars = await getAvatarUrls(usernames); // Already implemented
  
  res.json({ avatars });
});
```

```tsx
// Client usage
const [avatars, setAvatars] = useState<Record<string, string>>({});

useEffect(() => {
  const usernames = players.map(p => p.username);
  
  fetch('/api/avatars/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames }),
  })
    .then(res => res.json())
    .then(data => setAvatars(data.avatars));
}, [players]);
```

---

## Brand Compliance

### ✅ What You CAN Do

1. **Use Reddit's actual snoovatar images** (returned by `getSnoovatarUrl`)
   - These are user-owned content
   - Displayed as profile pictures

2. **Create original sprite designs** (our custom sprites)
   - Not using Snoo character
   - Original game assets

3. **Add custom accessories** (our accessory system)
   - Original designs
   - Game-specific items

### ❌ What You CANNOT Do

1. **Use Reddit's Snoo character** without written permission
   - Don't copy Snoo's design
   - Don't use Snoo as a game character

2. **Use Reddit trademarks**
   - Don't use "Reddit" in your app name
   - Don't use Reddit's logo or branding

3. **Suggest Reddit endorsement**
   - Don't imply partnership with Reddit
   - Don't use Reddit brand assets

### Our Approach

The Snoovatar system is compliant because:

1. ✅ **Reddit avatars**: We display user-owned snoovatar images (allowed)
2. ✅ **Custom sprites**: Our fallback sprites are original designs (not Snoo)
3. ✅ **Accessories**: All accessories are original game assets
4. ✅ **No trademarks**: We don't use Reddit's name or branding

### If You Need Snoo

If you want to use Reddit's actual Snoo character:

1. Submit request to Reddit for review
2. Get written approval
3. Follow Reddit's Brand Guidelines
4. Submit all Snoo content for approval

---

## Next Steps

1. **Start Simple**: Begin with basic avatar display
2. **Add Reddit Integration**: Fetch actual snoovatars
3. **Implement Accessories**: Add game-specific items
4. **Add Animations**: Trigger poses based on events
5. **Integrate with Game**: Connect to achievements, shop, etc.

## Support

For questions or issues:
- Check the [README](./README.md) for API reference
- Review [examples](./examples/GameAvatarExample.tsx)
- Consult Devvit documentation for platform-specific questions

---

**Happy coding!** 🎮
