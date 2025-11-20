import React from 'react';
import { Avatar } from './Avatar';
import { UserAvatar } from './UserAvatar';

/**
 * Example usage of Avatar components
 * This file demonstrates the different ways to use avatars in your app
 */
export const AvatarExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Avatar Component (with URL)</h2>
        <p className="text-gray-600 mb-4">Use when you already have the avatar URL</p>
        <div className="flex gap-4 items-end">
          <Avatar url="https://example.com/avatar.png" username="user1" size="xxsmall" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="xsmall" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="small" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="medium" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="large" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="xlarge" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="xxlarge" />
          <Avatar url="https://example.com/avatar.png" username="user1" size="xxxlarge" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">UserAvatar Component (auto-fetch)</h2>
        <p className="text-gray-600 mb-4">Automatically fetches avatar from server</p>
        <div className="flex gap-4 items-end">
          <UserAvatar username="spez" size="small" />
          <UserAvatar username="spez" size="medium" />
          <UserAvatar username="spez" size="large" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Avatar Facing</h2>
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <Avatar url="https://example.com/avatar.png" username="user1" size="large" facing="left" />
            <p className="text-sm mt-2">Left (default)</p>
          </div>
          <div className="text-center">
            <Avatar url="https://example.com/avatar.png" username="user1" size="large" facing="right" />
            <p className="text-sm mt-2">Right (flipped)</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Clickable Avatar</h2>
        <Avatar 
          url="https://example.com/avatar.png" 
          username="user1" 
          size="large"
          onClick={() => alert('Avatar clicked!')}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Fallback Behavior</h2>
        <p className="text-gray-600 mb-4">Shows fallback when URL fails to load</p>
        <Avatar url="https://invalid-url.com/broken.png" username="user1" size="large" />
      </section>
    </div>
  );
};
