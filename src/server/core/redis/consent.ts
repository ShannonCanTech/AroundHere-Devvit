import type { RedisClient } from '@devvit/public-api';
import type { ConsentStatus } from '../../../shared/types/consent.js';

/**
 * Store user consent in Redis
 */
export async function setConsent(
  redis: RedisClient,
  userId: string,
  consent: ConsentStatus
): Promise<void> {
  const key = `user:${userId}:consent`;
  
  try {
    await redis.hSet(key, {
      accepted: consent.accepted.toString(),
      timestamp: consent.timestamp.toString(),
      termsVersion: consent.termsVersion,
    });
  } catch (error) {
    throw new Error('Failed to store consent');
  }
}

/**
 * Retrieve user consent from Redis
 */
export async function getConsent(
  redis: RedisClient,
  userId: string
): Promise<ConsentStatus | null> {
  const key = `user:${userId}:consent`;
  
  try {
    const data = await redis.hGetAll(key);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    return {
      accepted: data.accepted === 'true',
      timestamp: parseInt(data.timestamp, 10),
      termsVersion: data.termsVersion,
    };
  } catch (error) {
    throw new Error('Failed to retrieve consent');
  }
}

/**
 * Check if user consent exists in Redis
 */
export async function hasConsent(
  redis: RedisClient,
  userId: string
): Promise<boolean> {
  const key = `user:${userId}:consent`;
  
  try {
    const exists = await redis.exists(key);
    return exists;
  } catch (error) {
    throw new Error('Failed to check consent');
  }
}
