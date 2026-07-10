import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import styleApiClient from "./StyleApiClient";

// Helper: build a Response-like object for the mocked fetch.
function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe("StyleApiClient", () => {
  beforeEach(() => {
    // The client is a singleton; reset its in-memory + persisted state.
    styleApiClient.clearSessionData();
    styleApiClient.setApiBaseUrl("https://haider.techrealm.online/api");
    localStorage.clear();
    styleApiClient.clearSessionData();
    vi.restoreAllMocks();
  });

  describe("session state", () => {
    it("starts unauthenticated", () => {
      expect(styleApiClient.isAuthenticated).toBe(false);
      expect(styleApiClient.getAiId()).toBeNull();
      expect(styleApiClient.getPreferenceId()).toBeNull();
    });

    it("becomes authenticated after setSessionData and persists to localStorage", () => {
      styleApiClient.setSessionData("ai-123", "pref-456");
      expect(styleApiClient.isAuthenticated).toBe(true);
      expect(styleApiClient.getAiId()).toBe("ai-123");
      expect(styleApiClient.getPreferenceId()).toBe("pref-456");
      expect(localStorage.getItem("style_ai_id")).toBe("ai-123");
      expect(localStorage.getItem("style_preference_id")).toBe("pref-456");
    });

    it("resets the iteration to 0 when a new session is created", () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.setCurrentIteration(12);
      expect(styleApiClient.getCurrentIteration()).toBe(12);
      styleApiClient.setSessionData("ai2", "pref2");
      expect(styleApiClient.getCurrentIteration()).toBe(0);
      expect(localStorage.getItem("style_current_iteration")).toBe("0");
    });

    it("clears all session state", () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.clearSessionData();
      expect(styleApiClient.isAuthenticated).toBe(false);
      expect(localStorage.getItem("style_ai_id")).toBeNull();
      expect(localStorage.getItem("style_preference_id")).toBeNull();
      expect(localStorage.getItem("style_current_iteration")).toBeNull();
    });

    it("persists iteration changes", () => {
      styleApiClient.setCurrentIteration(7);
      expect(styleApiClient.getCurrentIteration()).toBe(7);
      expect(localStorage.getItem("style_current_iteration")).toBe("7");
    });
  });

  describe("base URL handling", () => {
    it("strips trailing slashes and persists the override", () => {
      styleApiClient.setApiBaseUrl("https://example.com/api///");
      expect(styleApiClient.getApiBaseUrl()).toBe("https://example.com/api");
      expect(localStorage.getItem("style_api_base_url")).toBe("https://example.com/api");
    });

    it("ignores empty/whitespace-only overrides", () => {
      styleApiClient.setApiBaseUrl("https://real.example/api");
      styleApiClient.setApiBaseUrl("   ");
      expect(styleApiClient.getApiBaseUrl()).toBe("https://real.example/api");
    });
  });

  describe("authenticate", () => {
    it("stores the returned session on success", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse({ ai_id: "ai-x", preference_id: "pref-y" }));

      const result = await styleApiClient.authenticate("access-1", "male");

      expect(result).toEqual({ ai_id: "ai-x", preference_id: "pref-y" });
      expect(styleApiClient.isAuthenticated).toBe(true);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe("https://haider.techrealm.online/api/preference");
      expect(JSON.parse((opts as RequestInit).body as string)).toEqual({
        access_id: "access-1",
        gender: "male",
      });
    });

    it("throws and stays unauthenticated on a non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ error: "bad access id" }, { ok: false, status: 401 })
      );
      await expect(styleApiClient.authenticate("nope", "female")).rejects.toThrow(
        /Authentication failed: 401/
      );
      expect(styleApiClient.isAuthenticated).toBe(false);
    });
  });

  describe("submitFeedbackAndGetNextImage", () => {
    it("throws when not authenticated", async () => {
      await expect(styleApiClient.submitFeedbackAndGetNextImage("like")).rejects.toThrow(
        /Not authenticated/
      );
    });

    it("requests iteration 1 on the first call and syncs iteration from the response", async () => {
      styleApiClient.setSessionData("ai", "pref");
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ image_url: "http://img/1.png", iteration: 1, completed: false })
      );

      const res = await styleApiClient.submitFeedbackAndGetNextImage("like");

      expect(res.iteration).toBe(1);
      expect(res.completed).toBe(false);
      expect(styleApiClient.getCurrentIteration()).toBe(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url).toContain("/preference/pref/iteration/1");
    });

    it("marks completion when the API returns iteration 30", async () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.setCurrentIteration(29);
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ image_url: "http://img/30.png", iteration: 30, completed: false })
      );

      const res = await styleApiClient.submitFeedbackAndGetNextImage("dislike");
      expect(res.completed).toBe(true);
      expect(res.iteration).toBe(30);
    });

    it("short-circuits without fetching once iteration 30 is reached", async () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.setCurrentIteration(30);
      const fetchMock = vi.spyOn(globalThis, "fetch");

      const res = await styleApiClient.submitFeedbackAndGetNextImage("like");
      expect(res.completed).toBe(true);
      expect(res.image_url).toBe("");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("treats a 400 'No more images available' as completion", async () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.setCurrentIteration(5);
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ error: "No more images available" }, { ok: false, status: 400 })
      );

      const res = await styleApiClient.submitFeedbackAndGetNextImage("like");
      expect(res.completed).toBe(true);
      expect(res.iteration).toBe(30);
      expect(styleApiClient.getCurrentIteration()).toBe(30);
    });

    it("recovers from a 400 'Invalid iteration ID' by resetting and retrying", async () => {
      styleApiClient.setSessionData("ai", "pref");
      styleApiClient.setCurrentIteration(9);
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          jsonResponse({ error: "Invalid iteration ID" }, { ok: false, status: 400 })
        )
        .mockResolvedValueOnce(
          jsonResponse({ image_url: "http://img/1.png", iteration: 1, completed: false })
        );

      const res = await styleApiClient.submitFeedbackAndGetNextImage("like");
      expect(fetchMock).toHaveBeenCalledTimes(2);
      // Second (retry) call should target iteration 1 after the reset.
      expect(fetchMock.mock.calls[1][0]).toContain("/iteration/1");
      expect(res.iteration).toBe(1);
    });

    it("defaults the feedback value to 'dislike' when none is given", async () => {
      styleApiClient.setSessionData("ai", "pref");
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ image_url: "http://img/1.png", iteration: 1, completed: false })
      );

      await styleApiClient.submitFeedbackAndGetNextImage();
      const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
      expect(body.feedback).toBe("dislike");
    });
  });

  describe("saveProfile", () => {
    it("throws when not authenticated", async () => {
      await expect(styleApiClient.saveProfile()).rejects.toThrow(/Not authenticated/);
    });

    it("returns the API message on success", async () => {
      styleApiClient.setSessionData("ai", "pref");
      vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "saved" }));
      await expect(styleApiClient.saveProfile()).resolves.toEqual({ message: "saved" });
    });
  });

  describe("getProfile", () => {
    beforeEach(() => {
      // getProfile deliberately waits 1s before hitting the API; fake it away.
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("throws when not authenticated (before the delay)", async () => {
      await expect(styleApiClient.getProfile()).rejects.toThrow(/Not authenticated/);
    });

    it("returns an empty profile on a 400 response", async () => {
      styleApiClient.setSessionData("ai", "pref");
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ error: "not ready" }, { ok: false, status: 400 })
      );
      const promise = styleApiClient.getProfile();
      await vi.runAllTimersAsync();
      await expect(promise).resolves.toEqual({ top_styles: {}, selection_history: [] });
    });

    it("returns the parsed profile on success", async () => {
      styleApiClient.setSessionData("ai", "pref");
      const profile = {
        top_styles: { casual: 0.9 },
        selection_history: [],
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(profile));
      const promise = styleApiClient.getProfile();
      await vi.runAllTimersAsync();
      await expect(promise).resolves.toEqual(profile);
    });
  });

  describe("checkApiHealth", () => {
    it("returns the parsed status when the endpoint is reachable", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "ok" }));
      await expect(styleApiClient.checkApiHealth()).resolves.toEqual({ status: "ok" });
    });

    it("throws when the health endpoint is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({}, { ok: false, status: 500 })
      );
      await expect(styleApiClient.checkApiHealth()).rejects.toThrow(/health check failed/);
    });
  });
});
