# Avatar Test Slideshow - Implementation

## What Was Built

A testing slideshow on the home screen that cycles through different avatar URL patterns to see what actually renders in the browser.

## Slides Overview

The slideshow includes **12 slides** total:

### Slide 1: getSnoovatarUrl()
- **Source**: Reddit API method `user.getSnoovatarUrl()`
- **URL Pattern**: `https://i.redd.it/snoovatar/avatars/{uuid}.png`
- **Purpose**: Test if the API returns a custom snoovatar
- **Fallback**: Shows `/default-snoo.png` if no custom snoovatar exists

### Slide 2: Redis Cached URL
- **Source**: Redis cache (`avatar:{username}`)
- **Purpose**: Test if avatar URL is cached from previous API call
- **Fallback**: Shows `/default-snoo.png` if no cache exists

### Slides 3-10: Reddit Default Avatars (All 8)
- **Source**: `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png`
- **Purpose**: Test all 8 Reddit default avatars to see which ones render
- **Pattern**: Cycles through numbers 0-7

### Slide 11: Custom Default Avatar
- **Source**: `/default-snoo.png` (your uploaded asset)
- **Purpose**: Test your custom default avatar
- **Location**: `src/client/public/default-snoo.png`

### Slide 12: Computed Default
- **Source**: Reddit default computed from username hash
- **Purpose**: Test the hash-based default avatar selection
- **Algorithm**: `hash(username) % 8` to pick one of 8 defaults

## Navigation

- **Next**: Click "Next →" button or press Right/Down arrow keys
- **Previous**: Click "← Previous" button or press Left/Up arrow keys
- **Counter**: Top-right shows current slide number (e.g., "3 / 12")
- **Username**: Top-left shows current Reddit username

## What You'll See

Each slide displays:
1. **Title** - What type of avatar URL this is
2. **Description** - Explanation of the source
3. **Avatar Image** - 192x192px rounded display
4. **Source Badge** - Where the URL came from
5. **URL Display** - Full URL in code format

## Testing Goals

This slideshow helps you:

1. ✅ Verify which URL patterns actually work
2. ✅ See if `i.redd.it/snoovatar/avatars/` renders correctly
3. ✅ Test if Reddit defaults (`www.redditstatic.com`) work
4. ✅ Confirm your custom default loads
5. ✅ Check Redis caching behavior
6. ✅ Compare different avatar sources side-by-side

## Expected Results

### For Users WITH Custom Snoovatars:
- **Slide 1**: Should show custom snoovatar from `i.redd.it`
- **Slide 2**: Should show cached URL (same as Slide 1 after first load)
- **Slides 3-10**: Should show all 8 Reddit defaults
- **Slide 11**: Should show your custom default-snoo.png
- **Slide 12**: Should show computed Reddit default

### For Users WITHOUT Custom Snoovatars:
- **Slide 1**: Should show your default-snoo.png (fallback)
- **Slide 2**: Should show your default-snoo.png (no cache)
- **Slides 3-10**: Should show all 8 Reddit defaults
- **Slide 11**: Should show your custom default-snoo.png
- **Slide 12**: Should show computed Reddit default

## Error Handling

If an image fails to load:
- Automatically falls back to `/default-snoo.png`
- Image becomes semi-transparent (50% opacity)
- You can still see the URL that failed

## Implementation Files

### Client
- `src/client/screens/HomeScreen.tsx` - Slideshow UI component

### Server
- `src/server/index.ts` - New endpoint: `GET /api/avatar-test`

### Assets
- `src/client/public/default-snoo.png` - Your custom default avatar

## API Endpoint

**GET /api/avatar-test**

Returns:
```json
{
  "username": "your_reddit_username",
  "slides": [
    {
      "title": "Slide 1: getSnoovatarUrl()",
      "description": "This is the URL returned by...",
      "url": "https://i.redd.it/snoovatar/avatars/{uuid}.png",
      "source": "Reddit API (i.redd.it)"
    },
    // ... 11 more slides
  ]
}
```

## How to Test

1. **Start the dev server**: `npm run dev`
2. **Open the playtest URL** in your browser
3. **Navigate to home screen** (should load automatically)
4. **Use arrow keys or buttons** to cycle through slides
5. **Observe which URLs render** successfully
6. **Note any failures** or unexpected results

## What to Look For

### Success Indicators:
- ✅ Slide 1 shows your actual Reddit avatar
- ✅ Slides 3-10 all render (8 different Reddit defaults)
- ✅ Slide 11 shows your custom default-snoo.png
- ✅ No broken image icons

### Potential Issues:
- ❌ Slide 1 shows fallback (you might not have a custom snoovatar)
- ❌ Some Reddit defaults don't load (network/CORS issues)
- ❌ Custom default doesn't load (asset path issue)

## Next Steps After Testing

Based on what renders successfully:

1. **If `i.redd.it` works**: Use `getSnoovatarUrl()` as primary method
2. **If Reddit defaults work**: Use them as fallback for users without custom snoovatars
3. **If custom default works**: Use it as final fallback for errors
4. **If caching works**: Implement Redis caching strategy

## Cleanup

After testing, you can:
- Keep the slideshow for future testing
- Replace with the actual chat interface
- Use the learned URL patterns in your Avatar component

## Notes

- The slideshow is temporary for testing purposes
- All URL patterns are publicly accessible (no auth required)
- Images are cached by the browser automatically
- Redis caching is implemented server-side
