# Snoovatar System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Snoovatar System                          │
│                                                                   │
│  ┌────────────────┐      ┌──────────────┐      ┌─────────────┐ │
│  │   Game Logic   │─────▶│  useSnoovatar│─────▶│  Snoovatar  │ │
│  │  (Your Code)   │      │     Hook     │      │  Component  │ │
│  └────────────────┘      └──────────────┘      └─────────────┘ │
│                                                         │         │
│                                                         ▼         │
│                                              ┌──────────────────┐│
│                                              │ Reddit Avatar OR ││
│                                              │ Custom Sprite    ││
│                                              └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Snoovatar (Smart Component)
├── Reddit Avatar Image (if available)
│   └── Accessory Overlay (optional)
│
└── SnoovatarSprite (Custom 2D Sprite)
    ├── Background Accessories (zIndex < 0)
    ├── Body (Main Character)
    │   ├── Body Circle
    │   ├── Inner Body
    │   ├── Eyes
    │   ├── Smile
    │   └── Ears/Antenna
    └── Foreground Accessories (zIndex >= 0)
        ├── Hats (zIndex: 10)
        ├── Glasses (zIndex: 5)
        ├── Badges (zIndex: 3)
        └── Handheld Items (zIndex: 2)
```

## Data Flow

### 1. Avatar Loading Flow

```
User Component
    │
    ├─▶ useSnoovatar Hook
    │       │
    │       ├─▶ Fetch Reddit Avatar
    │       │       │
    │       │       └─▶ GET /api/user/avatar
    │       │               │
    │       │               ├─▶ Check Redis Cache
    │       │               │       │
    │       │               │       ├─▶ Cache Hit → Return URL
    │       │               │       │
    │       │               │       └─▶ Cache Miss
    │       │               │               │
    │       │               │               └─▶ reddit.getSnoovatarUrl()
    │       │               │                       │
    │       │               │                       ├─▶ Success → Cache & Return
    │       │               │                       │
    │       │               │                       └─▶ Fail → Default Avatar
    │       │               │
    │       │               └─▶ Return Avatar URL
    │       │
    │       └─▶ Return Config Object
    │
    └─▶ Snoovatar Component
            │
            ├─▶ Has Reddit Avatar? → Display Image
            │
            └─▶ No Reddit Avatar? → Display Custom Sprite
```

### 2. Accessory Management Flow

```
Game Event (Achievement, Purchase, etc.)
    │
    ├─▶ equipAccessory(accessoryId)
    │       │
    │       ├─▶ Get Accessory from Library
    │       │
    │       ├─▶ Update Local State
    │       │
    │       └─▶ Optional: Save to Server
    │               │
    │               └─▶ POST /api/user/accessories
    │                       │
    │                       └─▶ Redis: user:${userId}:avatar
    │
    └─▶ Re-render Snoovatar with New Accessories
```

### 3. Animation Flow

```
Game Event
    │
    ├─▶ setPose('celebrate')
    │       │
    │       └─▶ Update State
    │               │
    │               └─▶ Snoovatar Re-renders
    │                       │
    │                       └─▶ Apply Animation Class
    │
    └─▶ setTimeout(() => setPose('idle'), 2000)
            │
            └─▶ Reset to Idle
```

## State Management

### Hook State

```typescript
useSnoovatar State:
├── redditAvatarUrl: string | undefined
├── accessories: Accessory[]
├── colorScheme: SnoovatarColorScheme
├── pose: SnoovatarPose
├── facing: 'left' | 'right'
├── isLoading: boolean
└── error: string | null
```

### Component State

```typescript
Snoovatar Component State:
├── imageError: boolean
└── imageLoaded: boolean
```

## Redis Storage Schema

### Avatar URL Cache

```
Key: avatar:${username}
Type: String
Value: "https://..."
TTL: 3600 seconds (1 hour)
```

### User Avatar Data

```
Key: user:${userId}:avatar
Type: Hash
Fields:
  - accessories: '["crown", "sunglasses"]'
  - colorScheme: 'purple'
  - lastUpdated: '1700000000000'
```

### Achievement Rewards (Optional)

```
Key: user:${userId}:achievements
Type: Sorted Set
Members: achievement_id
Scores: timestamp
```

## API Endpoints

### Existing Endpoints

```
GET /api/user/avatar?username={username}
Response: {
  username: string,
  avatarUrl: string
}
```

### Recommended New Endpoints

```
GET /api/user/accessories
Response: {
  accessories: string[]
}

POST /api/user/accessories
Body: {
  accessories: string[]
}
Response: {
  success: boolean
}

POST /api/shop/purchase
Body: {
  itemId: string,
  price: number
}
Response: {
  success: boolean,
  newBalance: number
}

POST /api/achievements/unlock
Body: {
  achievementId: string,
  accessory: string
}
Response: {
  success: boolean,
  accessory: string
}
```

## Rendering Pipeline

### 1. Reddit Avatar Mode

```
Snoovatar Component
    │
    ├─▶ Check: redditAvatarUrl exists?
    │       │
    │       └─▶ Yes
    │           │
    │           ├─▶ Show Loading Placeholder
    │           │
    │           ├─▶ Load Image
    │           │       │
    │           │       ├─▶ Success → Display Image
    │           │       │
    │           │       └─▶ Error → Fall back to Sprite
    │           │
    │           └─▶ Accessories?
    │               │
    │               └─▶ Overlay Accessories on Image
    │
    └─▶ No → Render Custom Sprite
```

### 2. Custom Sprite Mode

```
SnoovatarSprite Component
    │
    ├─▶ Sort Accessories by zIndex
    │
    ├─▶ Render Background Accessories (zIndex < 0)
    │       │
    │       └─▶ Sparkles, Glow, etc.
    │
    ├─▶ Render Body
    │       │
    │       ├─▶ Body Circle (colorScheme.primary)
    │       ├─▶ Inner Body (colorScheme.secondary)
    │       ├─▶ Eyes (colorScheme.eyes)
    │       ├─▶ Smile (colorScheme.eyes)
    │       └─▶ Ears/Antenna (colorScheme.primary)
    │
    └─▶ Render Foreground Accessories (zIndex >= 0)
            │
            ├─▶ Handheld Items (zIndex: 2)
            ├─▶ Badges (zIndex: 3)
            ├─▶ Glasses (zIndex: 5)
            └─▶ Hats (zIndex: 10)
```

## Performance Optimizations

### 1. Caching Strategy

```
Client Request
    │
    ├─▶ Check Browser Cache (img tag)
    │       │
    │       └─▶ Hit → Display Immediately
    │
    └─▶ Miss → Request from Server
            │
            ├─▶ Check Redis Cache
            │       │
            │       └─▶ Hit → Return (Fast)
            │
            └─▶ Miss → Fetch from Reddit API
                    │
                    └─▶ Cache in Redis → Return
```

### 2. Lazy Loading

```
Component Mount
    │
    ├─▶ Show Placeholder
    │
    ├─▶ Image in Viewport?
    │       │
    │       ├─▶ No → Wait
    │       │
    │       └─▶ Yes → Load Image
    │
    └─▶ Image Loaded → Display
```

### 3. Memoization

```
Parent Re-render
    │
    ├─▶ Snoovatar Props Changed?
    │       │
    │       ├─▶ Yes → Re-render
    │       │
    │       └─▶ No → Skip Re-render (memo)
    │
    └─▶ Accessories Changed?
            │
            ├─▶ Yes → Re-render Sprite
            │
            └─▶ No → Skip Re-render
```

## Integration Points

### 1. Game Systems

```
Achievement System
    │
    └─▶ Unlock Achievement
            │
            └─▶ Award Accessory
                    │
                    └─▶ equipAccessory()

Shop System
    │
    └─▶ Purchase Item
            │
            ├─▶ Deduct Currency
            │
            └─▶ equipAccessory()

Leaderboard System
    │
    └─▶ Display Rankings
            │
            └─▶ Show Snoovatar with Accessories
```

### 2. Event System

```
Game Events
    │
    ├─▶ Win → setPose('celebrate')
    ├─▶ Lose → setPose('sad')
    ├─▶ Jump → setPose('jump')
    ├─▶ Greet → setPose('wave')
    └─▶ Idle → setPose('idle')
```

## Security Considerations

### 1. Avatar URL Validation

```
Server: getAvatarUrl()
    │
    ├─▶ Validate Username Format
    │
    ├─▶ Sanitize Input
    │
    ├─▶ Check Rate Limits
    │
    └─▶ Return Safe URL
```

### 2. Accessory Validation

```
Server: Save Accessories
    │
    ├─▶ Validate User Authentication
    │
    ├─▶ Validate Accessory IDs
    │       │
    │       └─▶ Check Against Whitelist
    │
    ├─▶ Validate Ownership (if needed)
    │
    └─▶ Save to Redis
```

## Error Handling

### 1. Avatar Loading Errors

```
Load Reddit Avatar
    │
    ├─▶ Network Error
    │       │
    │       └─▶ Fall back to Custom Sprite
    │
    ├─▶ 404 Not Found
    │       │
    │       └─▶ Use Default Avatar
    │
    └─▶ Timeout
            │
            └─▶ Show Loading State → Retry
```

### 2. Accessory Errors

```
Load Accessory
    │
    ├─▶ Invalid ID
    │       │
    │       └─▶ Log Warning → Skip
    │
    ├─▶ Missing SVG Path
    │       │
    │       └─▶ Log Error → Skip
    │
    └─▶ Invalid Position
            │
            └─▶ Use Default Position
```

## Scalability

### Horizontal Scaling

```
Multiple Server Instances
    │
    ├─▶ Shared Redis Cache
    │       │
    │       └─▶ Consistent Avatar URLs
    │
    └─▶ Load Balancer
            │
            └─▶ Distribute Requests
```

### Vertical Scaling

```
Single Server Instance
    │
    ├─▶ Redis Connection Pool
    │
    ├─▶ Image CDN (Reddit's)
    │
    └─▶ Efficient Caching
```

## Monitoring

### Key Metrics

```
Performance Metrics:
├── Avatar Load Time
├── Cache Hit Rate
├── API Response Time
└── Error Rate

Usage Metrics:
├── Active Users with Accessories
├── Most Popular Accessories
├── Accessory Equip/Unequip Rate
└── Animation Trigger Frequency
```

## Future Enhancements

### Planned Features

```
Phase 1 (Current):
├── Reddit Avatar Integration ✓
├── Custom Sprite System ✓
├── Basic Accessories ✓
└── Simple Animations ✓

Phase 2 (Future):
├── More Accessory Types
├── Advanced Animations
├── Particle Effects
└── Customization UI

Phase 3 (Future):
├── Avatar Export (PNG/GIF)
├── Multiplayer Sync
├── Seasonal Events
└── Rarity System
```

## Summary

The Snoovatar system is architected for:
- ✅ **Performance**: Multi-level caching, lazy loading
- ✅ **Scalability**: Redis-backed, stateless design
- ✅ **Flexibility**: Modular components, extensible accessories
- ✅ **Reliability**: Error handling, fallbacks
- ✅ **Maintainability**: Clear separation of concerns, documented APIs

The system integrates seamlessly with your existing Devvit application while providing powerful new features for game development.
