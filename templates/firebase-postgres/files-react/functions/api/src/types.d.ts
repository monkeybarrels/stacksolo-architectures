/**
 * Express Request Type Augmentation
 */

declare namespace Express {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };
  }
}