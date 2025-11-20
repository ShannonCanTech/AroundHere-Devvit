# Avatar Components

Custom avatar components that mimic Devvit Blocks `<avatar>` functionality for Devvit Web apps.

## Components

### `<Avatar>` - Basic Avatar Component

Use when you already have the avatar URL (e.g., from message data or cached state).

**Props:**
- `url?: string` - The avatar image URL
- `username?: string` - Username for alt text and fallback (default: 'User')
- `size?: AvatarSize` - Size of avatar (default: 'medium')
- `facing?: 'left' | 'right'` - Direction avatar faces (default: 'left')
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

**Sizes:**
- `xxsmall` - 16px (w-4 h-4)
- `xsmall` - 24px (w-6 h-6)
- `small` - 32px (w-8 h-8)
- `medium` - 40px (w-10 h-10) - default
- `large` - 48px (w-12 h-12)
- `xlarge` - 64px (w-16 h-16)
- `xxlarge` - 80px (w-20 h-20)
- `xxxlarge` - 96px (w-24 h-24)

**Example:**
```tsx
import { Avatar } from './components/Avatar';

<Avatar 
  url={message.avatarUrl} 
  username={message.username} 
  size="small" 
/>
```

### `<UserAvatar>` - Auto-Fetching Avatar Component

Use when you only have the username and want to automatically fetch the avatar.

**Props:**
- `username: string` - Username to fetch avatar for (required)
- `size?: AvatarSize` - Size of avatar (default: 'medium')
- `facing?: 'left' | 'right'` - Direction avatar faces (default: 'left')
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

**Example:**
```tsx
import { UserAvatar } from './components/UserAvatar';

<UserAvatar username="spez" size="large" />
```

## Usage Examples

### In Chat Messages
```tsx
{messages.map((msg) => (
  <div key={msg.id} className="flex gap-2">
    <Avatar 
      url={msg.avatarUrl} 
      username={msg.username} 
      size="small" 
    />
    <div>
      <p className="font-bold">{msg.username}</p>
      <p>{msg.content}</p>
    </div>
  </div>
))}
```

### In Chat List
```tsx
{chats.map((chat) => (
  <div key={chat.id} className="flex gap-3">
    <Avatar 
      url={chat.lastMessage?.avatarUrl} 
      username={chat.lastMessage?.username} 
      size="medium" 
    />
    <div>
      <h3>{chat.title}</h3>
      <p>{chat.lastMessage?.text}</p>
    </div>
  </div>
))}
```

### Current User Profile
```tsx
<UserAvatar username="current" size="xlarge" />
```

### Clickable Avatar
```tsx
<Avatar 
  url={avatarUrl} 
  username={username} 
  size="large"
  onClick={() => navigateToProfile(username)}
/>
```

### With Custom Styling
```tsx
<Avatar 
  url={avatarUrl} 
  username={username} 
  size="medium"
  className="ring-2 ring-blue-500 shadow-lg"
/>
```

## Features

✅ **Automatic fallback** - Shows Reddit snoo fallback if image fails to load  
✅ **Loading states** - Displays skeleton loader while fetching  
✅ **Caching** - Server caches avatar URLs for 1 hour  
✅ **Lazy loading** - Images load only when visible  
✅ **Accessibility** - Proper alt text and ARIA attributes  
✅ **Responsive** - Works on all screen sizes  
✅ **Type-safe** - Full TypeScript support  

## Server API

The components use the `/api/user/avatar` endpoint:

```typescript
// Get current user's avatar
GET /api/user/avatar

// Get specific user's avatar
GET /api/user/avatar?username=spez

// Response
{
  "username": "spez",
  "avatarUrl": "https://..."
}
```

## Migration from Inline Avatars

**Before:**
```tsx
<img 
  src={avatarUrl} 
  className="w-12 h-12 rounded-full border-2 border-orange-500"
  alt="avatar"
/>
```

**After:**
```tsx
<Avatar url={avatarUrl} username={username} size="large" />
```

## Performance

- Avatar URLs are cached in Redis for 1 hour
- Images use lazy loading
- Fallback SVG is inlined (no extra request)
- Component memoization recommended for lists

## Troubleshooting

**Avatar not showing:**
- Check that `getSnoovatarUrl()` is working on server
- Verify avatar URL is being passed correctly
- Check browser console for image load errors

**Wrong size:**
- Ensure you're using the correct size prop
- Check Tailwind classes are being applied

**Fallback always showing:**
- Verify the avatar URL is valid
- Check network tab for failed requests
- Ensure CORS is not blocking the image
