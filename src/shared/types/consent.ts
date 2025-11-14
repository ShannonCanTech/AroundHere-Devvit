export type ConsentStatus = {
  accepted: boolean;
  timestamp: number;
  termsVersion: string;
};

export type CheckConsentResponse = {
  hasConsent: boolean;
  consent?: ConsentStatus;
};

export type AcceptConsentRequest = {
  termsVersion?: string;
};

export type AcceptConsentResponse = {
  success: boolean;
  consent: ConsentStatus;
};
