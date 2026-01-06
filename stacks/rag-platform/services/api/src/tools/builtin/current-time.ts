/**
 * Built-in Tool: Current Time
 *
 * Simple tool that returns the current date and time.
 * Useful for time-sensitive queries.
 */

import { createTool } from '../create-tool';

interface TimeParams {
  timezone?: string;
}

interface TimeResult {
  iso: string;
  formatted: string;
  timezone: string;
}

export const currentTimeTool = createTool<TimeParams, TimeResult>({
  name: 'get_current_time',
  description: 'Get the current date and time. Use this when the user asks about the current time or date.',
  parameters: {
    timezone: {
      type: 'string',
      description: 'Timezone (e.g., "America/New_York", "UTC"). Default is UTC.',
      required: false,
      default: 'UTC',
    },
  },
  handler: async ({ timezone = 'UTC' }) => {
    const now = new Date();

    let formatted: string;
    let tz = timezone;

    try {
      formatted = now.toLocaleString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      // Invalid timezone, fall back to UTC
      tz = 'UTC';
      formatted = now.toUTCString();
    }

    return {
      iso: now.toISOString(),
      formatted,
      timezone: tz,
    };
  },
});
