import { escapeHtml, renderPage } from "./page.ts";
import {
  SCHEDULE_KEY,
  dailyCron,
  describeSchedule,
  expiryNotice,
  hasScopes,
  parseTime,
  timeOfCron,
} from "./schedule.ts";

// Handlers live here, not in main.ts, so a test can import and call them.
// main.ts registers them; see the note there.

/**
 * What the handlers reach outside themselves. The engine calls a handler with
 * the context alone, so these default to the real globals; a test passes
 * fakes.
 */
export interface Deps {
  tasks: Pick<
    PersonalTasks,
    "authorization" | "schedule" | "schedules" | "unschedule"
  >;
  storage: Pick<Storage, "getItem" | "setItem">;
  now: () => Date;
}

export function live(): Deps {
  return {
    tasks: personalTasks,
    storage: personalStorage,
    now: () => new Date(),
  };
}

/** What the last run left for the page. */
export interface LastRun {
  scheduledFor: string | null;
  finishedAt: string;
  result: string;
  notice: string | null;
}

const BASE = "/__NAME__";

/** The page: sign in, then authorise, then choose when it runs. */
export function home(
  context: HandlerContext,
  deps: Deps = live(),
): HttpResponse {
  const auth = context.request?.auth;
  if (!auth?.isAuthenticated) {
    const login = "/auth/login?redirect=" + encodeURIComponent(BASE);
    return page(
      `<p><a href="${login}">Sign in</a> to set up your schedule.</p>`,
    );
  }

  const grant = deps.tasks.authorization();
  if (!grant.granted || !hasScopes(grant)) {
    const why = grant.expired
      ? "Your permission for this app has lapsed."
      : "This app runs while you are away, so it needs your permission to " +
        "keep your results (personal storage, with write).";
    const link = grant.consentUrl
      ? ` <a href="${escapeHtml(grant.consentUrl)}">Give permission</a>, then come back.`
      : "";
    return page(`<p>${why}${link}</p>`);
  }

  const parts: string[] = [];
  const notice = expiryNotice(grant.expiresAt, deps.now());
  if (notice && grant.consentUrl) {
    parts.push(
      `<p class=notice>${escapeHtml(notice)} <a href="${escapeHtml(grant.consentUrl)}">Renew</a>.</p>`,
    );
  }

  const schedule = deps.tasks
    .schedules()
    .find((candidate) => candidate.key === SCHEDULE_KEY);
  parts.push(
    `<p>${escapeHtml(schedule ? describeSchedule(schedule) : "No schedule yet.")}</p>`,
  );

  const last = readLastRun(deps.storage);
  if (last) {
    parts.push(
      `<p>Last run: ${escapeHtml(last.finishedAt)} — ${escapeHtml(last.result)}</p>`,
    );
  }

  const time = timeOfCron(schedule?.cron ?? null) ?? "07:00";
  const zone = schedule?.timeZone ?? "UTC";
  parts.push(
    `<form method=post action="${BASE}/schedule">` +
      `<label>Time <input name=time value="${escapeHtml(time)}" required></label> ` +
      `<label>Time zone <input name=timeZone value="${escapeHtml(zone)}" required></label> ` +
      `<button>Save</button></form>`,
  );
  if (schedule) {
    parts.push(
      `<form method=post action="${BASE}/schedule">` +
        `<input type=hidden name=action value=stop><button>Stop</button></form>`,
    );
  }
  return page(parts.join(""));
}

/** POST: set the daily time and time zone, or stop. */
export function saveSchedule(
  context: HandlerContext,
  deps: Deps = live(),
): HttpResponse {
  const request = context.request;
  if (!request?.auth?.isAuthenticated) {
    return ResponseBuilder.error(401, "Sign in first");
  }
  const form = request.form ?? {};

  if (form.action === "stop") {
    deps.tasks.unschedule(SCHEDULE_KEY);
    return ResponseBuilder.redirect(BASE, 303);
  }

  const time = parseTime(form.time ?? "");
  if (!time) return ResponseBuilder.error(400, "time must be HH:MM");
  const timeZone = (form.timeZone ?? "").trim();
  if (!timeZone) return ResponseBuilder.error(400, "timeZone is required");

  try {
    deps.tasks.schedule({
      key: SCHEDULE_KEY,
      handler: "runDaily",
      cron: dailyCron(time.hour, time.minute),
      timeZone,
    });
  } catch (e) {
    // An unknown time zone is a RangeError; no grant is a SecurityError,
    // which the page explains once they go back to it.
    const message = e instanceof Error ? e.message : String(e);
    return ResponseBuilder.error(400, message);
  }
  return ResponseBuilder.redirect(BASE, 303);
}

/**
 * The scheduled run. It acts as the person, through their grant, while they
 * are away: `personalStorage` is theirs here.
 *
 * Replace `doWork` with what the app is for. A run that throws is retried; three
 * runs in a row that give up pause the schedule, and the page says so.
 */
export function runDaily(context: HandlerContext, deps: Deps = live()): void {
  const now = deps.now();
  const last: LastRun = {
    scheduledFor: context.meta?.schedule?.scheduledFor ?? null,
    finishedAt: now.toISOString(),
    result: doWork(now),
    notice: expiryNotice(deps.tasks.authorization().expiresAt, now),
  };
  deps.storage.setItem("lastRun", JSON.stringify(last));
}

export function doWork(now: Date): string {
  return `Ran at ${now.toISOString()}. Replace this with the app's work.`;
}

function readLastRun(storage: Deps["storage"]): LastRun | null {
  const text = storage.getItem("lastRun");
  if (!text) return null;
  try {
    return JSON.parse(text) as LastRun;
  } catch {
    return null;
  }
}

function page(body: string): HttpResponse {
  return ResponseBuilder.html(renderPage("__NAME__", body));
}
