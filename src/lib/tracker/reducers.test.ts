import {describe, expect, it} from "vitest";
import * as reducers from "@/lib/tracker/reducers";
import {EMPTY_USER_DATA} from "@/lib/tracker/types";
import {makeJob} from "@/test/fixtures";

const T1 = "2026-10-01T00:00:00.000Z";
const T2 = "2026-10-05T00:00:00.000Z";
const job = makeJob({id: 7, title: "Platform Engineer"});

describe("applications", () => {
    it("adds a job with a snapshot and a first history entry", () => {
        const data = reducers.addApplication(EMPTY_USER_DATA, job, "saved", T1);
        expect(data.applications[7]).toMatchObject({
            jobId: 7, status: "saved", notes: "", createdAt: T1, history: [{status: "saved", at: T1}],
            job: {id: 7, title: "Platform Engineer"},
        });
        expect(EMPTY_USER_DATA.applications).toEqual({}); // never mutated
    });

    it("re-adding an existing job moves it instead of duplicating", () => {
        let data = reducers.addApplication(EMPTY_USER_DATA, job, "saved", T1);
        data = reducers.addApplication(data, job, "applied", T2);
        expect(Object.keys(data.applications)).toHaveLength(1);
        expect(data.applications[7].history.map((entry) => entry.status)).toEqual(["saved", "applied"]);
    });

    it("records each status change once", () => {
        let data = reducers.addApplication(EMPTY_USER_DATA, job, "saved", T1);
        data = reducers.setStatus(data, 7, "interview", T2);
        const same = reducers.setStatus(data, 7, "interview", T2);
        expect(same).toBe(data);
        expect(data.applications[7]).toMatchObject({status: "interview", updatedAt: T2});
        expect(reducers.firstReached(data.applications[7], "interview")).toBe(T2);
        expect(reducers.firstReached(data.applications[7], "offer")).toBeNull();
    });

    it("updates notes and supports remove + restore (undo)", () => {
        let data = reducers.addApplication(EMPTY_USER_DATA, job, "saved", T1);
        data = reducers.setNotes(data, 7, "Call Sam", T2);
        const removedApp = data.applications[7];
        const removed = reducers.removeApplication(data, 7);
        expect(removed.applications[7]).toBeUndefined();
        expect(reducers.restoreApplication(removed, removedApp).applications[7].notes).toBe("Call Sam");
    });

    it("ignores changes to jobs that aren't tracked", () => {
        expect(reducers.setStatus(EMPTY_USER_DATA, 99, "offer", T1)).toBe(EMPTY_USER_DATA);
        expect(reducers.removeApplication(EMPTY_USER_DATA, 99)).toBe(EMPTY_USER_DATA);
    });
});

describe("recently viewed", () => {
    it("moves repeats to the front and caps the list", () => {
        let data = EMPTY_USER_DATA;
        for (let id = 1; id <= reducers.MAX_RECENTLY_VIEWED + 3; id++) data = reducers.recordView(data, id);
        data = reducers.recordView(data, 10);
        expect(data.recentlyViewed[0]).toBe(10);
        expect(data.recentlyViewed).toHaveLength(reducers.MAX_RECENTLY_VIEWED);
        expect(new Set(data.recentlyViewed).size).toBe(data.recentlyViewed.length);
    });
});

describe("saved searches", () => {
    it("treats the same query as the same saved search", () => {
        const search = {id: "a", name: "Remote", query: "mode=remote", createdAt: T1, lastCheckedAt: T1};
        let data = reducers.addSavedSearch(EMPTY_USER_DATA, search);
        data = reducers.addSavedSearch(data, {...search, id: "b", name: "Remote (renamed)"});
        expect(data.savedSearches.map((saved) => saved.name)).toEqual(["Remote (renamed)"]);
        data = reducers.markSearchChecked(data, "b", T2);
        expect(data.savedSearches[0].lastCheckedAt).toBe(T2);
        expect(reducers.removeSavedSearch(data, "b").savedSearches).toEqual([]);
    });
});

describe("parseUserData (import)", () => {
    it("accepts a valid export and drops malformed records", () => {
        const valid = reducers.addApplication(EMPTY_USER_DATA, job, "applied", T1);
        const parsed = reducers.parseUserData({
            ...valid,
            applications: {...valid.applications, 8: {jobId: "8", status: "hacked"}},
            recentlyViewed: [1, "two", 3],
        });
        expect(Object.keys(parsed!.applications)).toEqual(["7"]);
        expect(parsed!.recentlyViewed).toEqual([1, 3]);
    });

    it("rejects things that aren't exports", () => {
        expect(reducers.parseUserData(null)).toBeNull();
        expect(reducers.parseUserData({applications: []})).toBeNull();
        expect(reducers.parseUserData("nope")).toBeNull();
    });
});
