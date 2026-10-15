import { home, live, runDaily, saveSchedule } from "./handlers.ts";
import { makeContext } from "./testing.ts";

/** Fake personalTasks and personalStorage, recording what was asked of them. */
function fakeDeps(grant: Partial<DelegationState> = {}) {
  const stored: Record<string, string> = {};
  const declared: ScheduleSpec[] = [];
  const removed: string[] = [];
  const deps: ReturnType<typeof live> = {
    tasks: {
      authorization: () => ({
        authenticated: true,
        granted: true,
        scopes: ["personal_storage", "write"],
        expiresAt: "2027-01-01T00:00:00Z",
        consentUrl: "/auth/delegate?script=x",
        ...grant,
      }),
      schedule: (spec) => {
        declared.push(spec);
        return {
          key: spec.key,
          handler: spec.handler,
          cron: spec.cron ?? null,
          intervalMinutes: null,
          timeZone: spec.timeZone ?? null,
          nextRunAt: "2026-10-16T04:00:00Z",
          lastRunAt: null,
          state: "active",
        };
      },
      schedules: () => [],
      unschedule: (key) => {
        removed.push(key);
        return true;
      },
    },
    storage: {
      getItem: (key) => stored[key] ?? null,
      setItem: (key, value) => {
        stored[key] = value;
      },
    },
    now: () => new Date("2026-10-15T12:00:00Z"),
  };
  return { deps, stored, declared, removed };
}

describe("home", () => {
  test("asks a visitor to sign in", () => {
    const response = home(makeContext(), fakeDeps().deps);
    expect(response.body).toContain("/auth/login");
  });
  test("sends a person without a grant to the consent page", () => {
    const { deps } = fakeDeps({ granted: false });
    const response = home(makeContext({ userId: "u1" }), deps);
    expect(response.body).toContain("/auth/delegate?script=x");
  });
  test("warns in the last week of the grant", () => {
    const { deps } = fakeDeps({ expiresAt: "2026-10-18T12:00:00Z" });
    const response = home(makeContext({ userId: "u1" }), deps);
    expect(response.body).toContain("in 3 days");
  });
});

describe("saveSchedule", () => {
  test("declares a daily schedule in the person's time zone", () => {
    const { deps, declared } = fakeDeps();
    const response = saveSchedule(
      makeContext({
        method: "POST",
        userId: "u1",
        form: { time: "07:30", timeZone: "Europe/Helsinki" },
      }),
      deps,
    );
    expect(response.status).toBe(303);
    expect(declared[0].cron).toBe("30 7 * * *");
    expect(declared[0].timeZone).toBe("Europe/Helsinki");
  });
  test("a bad time is a 400", () => {
    const response = saveSchedule(
      makeContext({ method: "POST", userId: "u1", form: { time: "late" } }),
      fakeDeps().deps,
    );
    expect(response.status).toBe(400);
  });
  test("an engine refusal is a 400, not a crash", () => {
    const { deps } = fakeDeps();
    deps.tasks.schedule = () => {
      throw new RangeError("unknown time zone");
    };
    const response = saveSchedule(
      makeContext({
        method: "POST",
        userId: "u1",
        form: { time: "07:30", timeZone: "Mars/Olympus" },
      }),
      deps,
    );
    expect(response.status).toBe(400);
  });
  test("stop removes the schedule", () => {
    const { deps, removed } = fakeDeps();
    saveSchedule(
      makeContext({ method: "POST", userId: "u1", form: { action: "stop" } }),
      deps,
    );
    expect(removed).toEqual(["daily"]);
  });
});

describe("runDaily", () => {
  test("keeps the result and the expiry notice for the page", () => {
    const { deps, stored } = fakeDeps({ expiresAt: "2026-10-16T00:00:00Z" });
    runDaily(
      {
        meta: {
          schedule: { key: "daily", scheduledFor: "2026-10-15T04:00:00Z" },
        },
      },
      deps,
    );
    const last = JSON.parse(stored.lastRun);
    expect(last.scheduledFor).toBe("2026-10-15T04:00:00Z");
    expect(last.notice).toContain("tomorrow");
  });
});
