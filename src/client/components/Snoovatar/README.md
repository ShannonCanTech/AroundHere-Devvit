## Snoovatar Component System

A comprehensive 2D sprite-based avatar system for Reddit Devvit games that intelligently combines Reddit's actual snoovatar images with customizable game accessories and animations.

### Features

- ✅ **Reddit Integration**: Automatically uses Reddit's actual snoovatar images when available
- ✅ **Custom Sprites**: Falls back to customizable 2D sprites with original designs
- ✅ **Accessories System**: Equip hats, glasses, badges, and handheld items
- ✅ **Animations**: Support for poses (idle, wave, jump, celebrate, sad)
- ✅ **Color Schemes**: Multiple color themes with username-based generation
- ✅ **Responsive**: Multiple size options from tiny to xlarge
- ✅ **Performance**: Built-in caching and lazy loading
- ✅ **Brand Compliant**: Original designs that respect Reddit's IP guidelines

### Quick Start

```tsx
import { Snoovatar } from './components/Snoovatar';

function MyComponent() {
  return (
    <Snoovatar
      username="user123"
      redditAvatarUrl="https://..."
      size="large"
      accessories={[]}
    />
  );
}
```

### Using the Hook

```tsx
import { useSnoovatar } from './components/Snoovatar';
import { Snoovatar } from './components/Snoovatar';

function GameAvatar() {
  const {
    config,
    equipAccessory,
    unequipAccessory,
    setPose,
    toggleFacing,
    isLoading,
  } = useSnoovatar({
    username: 'player1',
    initialAccessories: ['crown', 'sunglasses'],
    fetchRedditAvatar: true,
  });

  return (
    <div>
      <Snoovatar {...config} size="xlarge" />
      
      <button onClick={() => equipAccessory('party_hat')}>
        Equip Party Hat
      </button>
      
      <button onClick={() => setPose('celebrate')}>
        Celebrate!
      </button>
      
      <button onClick={toggleFacing}>
        Turn Around
      </button>
    </div>
  );
}
```

### Available Accessories

#### Hats
- `crown` - Golden Crown
- `party_hat` - Party Hat
- `top_hat` - Top Hat

#### Glasses
- `sunglasses` - Cool Sunglasses
- `monocle` - Fancy Monocle

#### Badges
- `star_badge` - Star Badge
- `heart_badge` - Heart Badge

#### Handheld Items
- `flag` - Victory Flag
- `trophy` - Trophy

#### Background Effects
- `sparkles` - Sparkle Effect
- `glow` - Glow Effect

### Props

#### Snoovatar Component

```typescript
type SnoovatarProps = {
  // Reddit avatar URL (fetched from API)
  redditAvatarUrl?: string;
  
  // Username for fallback and identification
  username: string;
  
  // Custom color scheme (only used if no Reddit avatar)
  colorScheme?: SnoovatarColorScheme;
  
  // Array of equipped accessories
  accessories?: Accessory[];
  
  // Current pose/animation
  pose?: 'idle' | 'wave' | 'jump' | 'celebrate' | 'sad';
  
  // Direction the avatar faces
  facing?: 'left' | 'right';
  
  // Size of the avatar
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
  
  // Enable animations
  animated?: boolean;
  
  // Additional CSS classes
  className?: string;
  
  // Click handler
  onClick?: () => void;
  
  // Show loading state
  loading?: boolean;
  
  // Alt text override
  alt?: string;
};
```

### Color Schemes

Pre-defined color schemes:
- `reddit` - Classic Reddit orange
- `blue` - Reddit blue
- `green` - Fresh green
- `purple` - Royal purple
- `pink` - Vibrant pink

Generate color scheme from username:
```tsx
import { getUserColorScheme } from './components/Snoovatar';

const colorScheme = getUserColorScheme('username');
```

### Creating Custom Accessories

```typescript
import type { Accessory } from './components/Snoovatar';

const customHat: Accessory = {
  id: 'wizard_hat',
  type: 'hat',
  name: 'Wizard Hat',
  svgPath: 'M30,5 L35,20 L25,20 Z M28,20 L32,20 L30,25 Z',
  position: { x: 25, y: 5 },
  scale: 1.2,
  zIndex: 10,
};
```

### Server-Side Avatar Fetching

The system automatically fetches Reddit avatars from your server:

```typescript
// Server endpoint (already implemented in src/server/index.ts)
GET /api/user/avatar?username=user123

// Response
{
  "username": "user123",
  "avatarUrl": "https://..."
}
```

### Integration with Game Systems

#### Inventory System

```tsx
// Store equipped accessories in Redis
await redis.hSet(`user:${userId}:avatar`, {
  accessories: JSON.stringify(['crown', 'sunglasses']),
  colorScheme: 'purple',
});

// Load on game start
const avatarData = await redis.hGetAll(`user:${userId}:avatar`);
const accessories = JSON.parse(avatarData.accessories || '[]');
```

#### Achievement System

```tsx
// Award accessory when achievement unlocked
function unlockAchievement(achievementId: string) {
  const accessoryMap = {
    'first_win': 'trophy',
    'speed_demon': 'sunglasses',
    'champion': 'crown',
  };
  
  const accessory = accessoryMap[achievementId];
  if (accessory) {
    equipAccessory(accessory);
  }
}
```

#### Animation Triggers

```tsx
// Trigger animations based on game events
function onGameEvent(event: string) {
  switch (event) {
    case 'win':
      setPose('celebrate');
      setTimeout(() => setPose('idle'), 2000);
      break;
    case 'lose':
      setPose('sad');
      setTimeout(() => setPose('idle'), 2000);
      break;
    case 'greeting':
      setPose('wave');
      setTimeout(() => setPose('idle'), 1000);
      break;
  }
}
```

### Performance Optimization

#### Caching

The system includes built-in caching:
- Reddit avatars cached for 1 hour in Redis
- Lazy loading for images
- Optimized re-renders with React hooks

#### Lazy Loading

```tsx
<Snoovatar
  username="user123"
  loading={isLoading}
  // Image loads lazily
/>
```

### Brand Guidelines Compliance

⚠️ **Important**: This system uses **original designs** that are inspired by but do not directly use Reddit's Snoo character or trademarks.

From Reddit's Developer Rules:
> "Do not use any Reddit trademarks (e.g., REDDIT or SNOO) or other brand assets in your app... For example, do not name your app "Reddit Community Fundraisers" or use Reddit's alien mascot Snoo as a game character in your app."

Our approach:
1. ✅ Uses Reddit's actual snoovatar **images** (which users own)
2. ✅ Falls back to **original sprite designs** (not Snoo)
3. ✅ Accessories are **original game assets**
4. ✅ No Reddit trademarks in naming or branding

### Examples

#### Basic Avatar Display

```tsx
<Snoovatar
  username="player1"
  redditAvatarUrl={avatarUrl}
  size="medium"
/>
```

#### Avatar with Accessories

```tsx
<Snoovatar
  username="player1"
  redditAvatarUrl={avatarUrl}
  accessories={[
    getAccessoryById('crown'),
    getAccessoryById('sunglasses'),
  ].filter(Boolean)}
  size="large"
  animated
/>
```

#### Custom Color Scheme

```tsx
<Snoovatar
  username="player1"
  colorScheme={{
    primary: '#FF6B6B',
    secondary: '#FFFFFF',
    eyes: '#000000',
    outline: '#000000',
  }}
  size="large"
/>
```

#### Animated Avatar

```tsx
function AnimatedAvatar() {
  const [pose, setPose] = useState<SnoovatarPose>('idle');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const poses: SnoovatarPose[] = ['idle', 'wave', 'jump', 'celebrate'];
      const randomPose = poses[Math.floor(Math.random() * poses.length)];
      setPose(randomPose);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Snoovatar
      username="player1"
      pose={pose}
      animated
      size="xlarge"
    />
  );
}
```

### Architecture

```
Snoovatar/
├── types.ts              # TypeScript type definitions
├── accessories.ts        # Accessory library and utilities
├── SnoovatarSprite.tsx   # 2D sprite renderer
├── Snoovatar.tsx         # Main component (smart wrapper)
├── useSnoovatar.ts       # React hook for state management
├── index.ts              # Public exports
└── README.md             # This file
```

### Future Enhancements

Potential additions:
- [ ] More accessory types (wings, tails, pets)
- [ ] Animation sequences (walk cycles, emotes)
- [ ] Particle effects system
- [ ] Accessory rarity tiers
- [ ] Seasonal/event accessories
- [ ] Avatar customization UI component
- [ ] Export avatar as image/GIF
- [ ] Multiplayer avatar synchronization

### Troubleshooting

**Avatar not loading?**
- Check that `/api/user/avatar` endpoint is accessible
- Verify username is correct
- Check browser console for errors

**Accessories not showing?**
- Ensure accessory IDs are valid
- Check that accessories array is not empty
- Verify zIndex values for layering

**Animations not working?**
- Set `animated={true}` prop
- Check that Tailwind animations are configured
- Verify pose is a valid SnoovatarPose value

### License

This component system is part of your Devvit application and follows your project's license. The sprite designs are original and do not use Reddit's intellectual property.
