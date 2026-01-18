import type { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
      apiKey?: {
        id: string;
        userId: string;
        plan: string;
        rateLimit: number;
        dailyLimit: number;
      };
    }
  }
}

export {};
