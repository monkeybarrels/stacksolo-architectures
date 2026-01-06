/**
 * Express Request Type Augmentation
 *
 * Adds the `user` property set by kernel.authMiddleware()
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
