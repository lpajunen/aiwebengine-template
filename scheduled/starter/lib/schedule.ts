/** The one schedule this app keeps per person. */
export const SCHEDULE_KEY = "daily";

/** What a run needs the person to have granted. */
export const NEEDED_SCOPES: DelegationScope[] = ["personal_storage", "write"];

/** How many days before a grant lapses the app starts saying so. */
export const EXPIRY_WARNING_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** "07:30" as an hour and minute, or null for anything else. */
export function parseTime(
  text: string,
): { hour: number; minute: number } | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/** Every day at that local time, as the five-field cron the engine takes. */
export function dailyCron(hour: number, minute: number): string {
  return `${minute} ${hour} * * *`;
}

/** The time of day a daily cron runs at, as "07:30"; null for another cron. */
export function timeOfCron(cron: string | null): string | null {
  const match = /^(\d+) (\d+) \* \* \*$/.exec(cron ?? "");
  if (!match) return null;
  return `${match[2].padStart(2, "0")}:${match[1].padStart(2, "0")}`;
}

/** Whether the grant covers what a run does. */
export function hasScopes(auth: DelegationState): boolean {
  const scopes = auth.scopes ?? [];
  return NEEDED_SCOPES.every((scope) => scopes.indexOf(scope) !== -1);
}

/**
 * What to tell the person when their grant is about to lapse, or null.
 *
 * The engine does not warn anybody yet, and a schedule whose grant lapses
 * pauses without a word. So the app says so, in the channel it already has.
 */
export function expiryNotice(
  expiresAt: string | undefined,
  now: Date,
): string | null {
  if (!expiresAt) return null;
  const left = Date.parse(expiresAt) - now.getTime();
  if (Number.isNaN(left) || left > EXPIRY_WARNING_DAYS * DAY_MS) return null;
  const days = Math.max(0, Math.ceil(left / DAY_MS));
  const when =
    days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return `Your permission for this app ends ${when}. Renew it to keep the schedule running.`;
}

/** One line about a schedule's state, for the page. */
export function describeSchedule(schedule: PersonalSchedule): string {
  const at = timeOfCron(schedule.cron) ?? schedule.cron ?? "";
  const zone = schedule.timeZone ?? "UTC";
  if (schedule.state === "active") {
    return `Runs every day at ${at} (${zone}). Next run: ${schedule.nextRunAt}.`;
  }
  const why =
    schedule.pausedReason === "expired"
      ? "your permission has lapsed; renew it to start again"
      : schedule.pausedReason === "failing"
        ? "the last three runs failed; save it again to retry"
        : "you paused it on your account page; save it again to resume";
  return `Paused: ${why}.`;
}
