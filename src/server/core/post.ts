import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    entry: 'welcome',
    postData: {
      createdAt: Date.now(),
    },
    subredditName: subredditName,
    title: 'Happening - Real-time Chat',
  });
};
