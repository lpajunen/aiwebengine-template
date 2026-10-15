import {
  dailyCron,
  describeSchedule,
  expiryNotice,
  hasScopes,
  parseTime,
  timeOfCron,
} from "./schedule.ts";

describe("parseTime", () => {
  test("reads HH:MM", () => {
    expect(parseTime("07:30")).toEqual({ hour: 7, minute: 30 });
    expect(parseTime("7:05")).toEqual({ hour: 7, minute: 5 });
  });
  test("refuses anything else", () => {
    expect(parseTime("24:00")).toBe(null);
    expect(parseTime("7")).toBe(null);
    expect(parseTime("07:60")).toBe(null);
  });
});

describe("dailyCron and timeOfCron", () => {
  test("round-trip a time of day", () => {
    expect(dailyCron(7, 5)).toBe("5 7 * * *");
    expect(timeOfCron("5 7 * * *")).toBe("07:05");
    expect(timeOfCron("0 7 * * 1")).toBe(null);
  });
});

describe("hasScopes", () => {
  test("needs personal storage and write", () => {
    expect(
      hasScopes({
        authenticated: true,
        granted: true,
        scopes: ["personal_storage", "write"],
      }),
    ).toBe(true);
    expect(
      hasScopes({
        authenticated: true,
        granted: true,
        scopes: ["personal_storage"],
      }),
    ).toBe(false);
  });
});

describe("expiryNotice", () => {
  const now = new Date("2026-10-15T12:00:00Z");
  test("is quiet more than a week out", () => {
    expect(expiryNotice("2026-11-15T12:00:00Z", now)).toBe(null);
    expect(expiryNotice(undefined, now)).toBe(null);
  });
  test("counts the days in the last week", () => {
    expect(expiryNotice("2026-10-18T12:00:00Z", now)).toContain("in 3 days");
    expect(expiryNotice("2026-10-16T00:00:00Z", now)).toContain("tomorrow");
  });
});

describe("describeSchedule", () => {
  const schedule: PersonalSchedule = {
    key: "daily",
    handler: "runDaily",
    cron: "0 7 * * *",
    intervalMinutes: null,
    timeZone: "Europe/Helsinki",
    nextRunAt: "2026-10-16T04:00:00Z",
    lastRunAt: null,
    state: "active",
  };
  test("says when an active one runs", () => {
    expect(describeSchedule(schedule)).toContain("07:00 (Europe/Helsinki)");
  });
  test("says why a paused one is paused", () => {
    const paused = { ...schedule, state: "paused" as const };
    expect(describeSchedule({ ...paused, pausedReason: "expired" })).toContain(
      "renew it",
    );
    expect(describeSchedule({ ...paused, pausedReason: "failing" })).toContain(
      "failed",
    );
  });
});
