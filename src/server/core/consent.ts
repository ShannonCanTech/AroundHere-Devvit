import type { RedisClient } from '@devvit/public-api';
import type { ConsentStatus } from '../../shared/types/consent.js';
import { getConsent, setConsent } from './redis/consent.js';

/**
 * Current terms version - update this when terms change
 */
const CURRENT_TERMS_VERSION = '1.0';

/**
 * Get the current terms version
 */
export function getCurrentTermsVersion(): string {
  return CURRENT_TERMS_VERSION;
}

/**
 * Check if user has accepted terms
 */
export async function checkConsent(
  redis: RedisClient,
  userId: string
): Promise<ConsentStatus | null> {
  try {
    return await getConsent(redis, userId);
  } catch (error) {
    console.error('Error checking consent:', error);
    throw error;
  }
}

/**
 * Record user consent
 */
export async function recordConsent(
  redis: RedisClient,
  userId: string,
  termsVersion?: string
): Promise<ConsentStatus> {
  const consent: ConsentStatus = {
    accepted: true,
    timestamp: Date.now(),
    termsVersion: termsVersion || CURRENT_TERMS_VERSION,
  };
  
  try {
    await setConsent(redis, userId, consent);
    return consent;
  } catch (error) {
    console.error('Error recording consent:', error);
    throw error;
  }
}
