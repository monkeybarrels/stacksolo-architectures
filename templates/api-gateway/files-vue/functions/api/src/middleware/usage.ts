/**
 * Usage Tracking Middleware
 * Records API usage for analytics
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index';
import { usageRecords, dailyUsage, type NewUsageRecord } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export function usageTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.apiKey) {
    return next();
  }

  const startTime = Date.now();
  const keyId = req.apiKey.id;

  // Capture original end method
  const originalEnd = res.end.bind(res);

  // Override end to capture response
  res.end = function (chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void) {
    const responseTime = Date.now() - startTime;

    // Record usage asynchronously (don't block response)
    recordUsage(keyId, req, res.statusCode, responseTime).catch((err) => {
      console.error('Failed to record usage:', err);
    });

    // Correctly call the original end
    if (typeof encoding === 'function') {
      return originalEnd(chunk, encoding);
    }
    return originalEnd(chunk, encoding, callback);
  };

  next();
}

async function recordUsage(
  keyId: string,
  req: Request,
  statusCode: number,
  responseTimeMs: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Record individual usage
  const record: NewUsageRecord = {
    apiKeyId: keyId,
    endpoint: req.path,
    method: req.method,
    statusCode,
    responseTimeMs,
    ipAddress: req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || 'unknown',
    userAgent: req.headers['user-agent']?.substring(0, 500),
  };

  await db.insert(usageRecords).values(record);

  // Update daily aggregate
  const isError = statusCode >= 400;

  // Try to update existing daily record
  const updateResult = await db
    .update(dailyUsage)
    .set({
      requestCount: sql`${dailyUsage.requestCount} + 1`,
      errorCount: isError ? sql`${dailyUsage.errorCount} + 1` : dailyUsage.errorCount,
      avgResponseTimeMs: sql`(${dailyUsage.avgResponseTimeMs} * ${dailyUsage.requestCount} + ${responseTimeMs}) / (${dailyUsage.requestCount} + 1)`,
    })
    .where(and(eq(dailyUsage.apiKeyId, keyId), eq(dailyUsage.date, today)));

  // If no existing record, insert new one
  if ((updateResult.rowCount ?? 0) === 0) {
    await db
      .insert(dailyUsage)
      .values({
        apiKeyId: keyId,
        date: today,
        requestCount: 1,
        errorCount: isError ? 1 : 0,
        avgResponseTimeMs: responseTimeMs,
      })
      .onConflictDoUpdate({
        target: [dailyUsage.apiKeyId, dailyUsage.date],
        set: {
          requestCount: sql`${dailyUsage.requestCount} + 1`,
          errorCount: isError ? sql`${dailyUsage.errorCount} + 1` : dailyUsage.errorCount,
        },
      })
      .catch(() => {
        // Ignore conflict errors (race condition)
      });
  }
}
