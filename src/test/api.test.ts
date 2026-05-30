import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchForeignOrigins,
  invalidateForeignOriginsCache,
  fetchCustomLists,
  invalidateCustomListsCache,
} from "@/lib/api";

describe("API caching layer", () => {
  beforeEach(() => {
    // Reset caches before each test
    invalidateForeignOriginsCache();
    invalidateCustomListsCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchForeignOrigins deduplicates and caches parallel and sequential calls", async () => {
    const mockOrigins = { origins: [{ origin: "French", wordCount: 5 }] };
    
    // Setup fetch mock to return status 200 ok with json response
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOrigins,
    });
    vi.stubGlobal("fetch", fetchMock);

    // Make parallel calls
    const [res1, res2] = await Promise.all([
      fetchForeignOrigins(),
      fetchForeignOrigins(),
    ]);

    // Make a sequential call
    const res3 = await fetchForeignOrigins();

    expect(res1).toEqual(mockOrigins);
    expect(res2).toEqual(mockOrigins);
    expect(res3).toEqual(mockOrigins);
    
    // Check that fetch was only called exactly once
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/foreign-origins"));
  });

  it("invalidateForeignOriginsCache clears the cache, forcing a new network call", async () => {
    const mockOrigins1 = { origins: [{ origin: "French", wordCount: 5 }] };
    const mockOrigins2 = { origins: [{ origin: "Latin", wordCount: 10 }] };
    
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrigins1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrigins2,
      });
    vi.stubGlobal("fetch", fetchMock);

    // First fetch
    const firstRes = await fetchForeignOrigins();
    expect(firstRes).toEqual(mockOrigins1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Invalidate
    invalidateForeignOriginsCache();

    // Second fetch (should trigger a new fetch)
    const secondRes = await fetchForeignOrigins();
    expect(secondRes).toEqual(mockOrigins2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clears foreignOriginsCache on request failure so subsequent calls can retry", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false, // Fails first time
      })
      .mockResolvedValueOnce({
        ok: true, // Succeeds second time
        json: async () => ({ origins: [] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    // First attempt should fail
    await expect(fetchForeignOrigins()).rejects.toThrow("Failed to fetch foreign origins");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second attempt should retry and succeed
    const successRes = await fetchForeignOrigins();
    expect(successRes).toEqual({ origins: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetchCustomLists deduplicates and caches requests", async () => {
    const mockLists = { lists: [{ id: "1", name: "Spelling List", level: "Grade 3", wordCount: 12 }] };
    
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockLists,
    });
    vi.stubGlobal("fetch", fetchMock);

    const [res1, res2] = await Promise.all([
      fetchCustomLists(),
      fetchCustomLists(),
    ]);

    expect(res1).toEqual(mockLists);
    expect(res2).toEqual(mockLists);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/custom-lists"),
      expect.any(Object)
    );
  });

  it("invalidateCustomListsCache clears custom list cache", async () => {
    const mockLists1 = { lists: [{ id: "1", name: "List 1", level: "Grade 3", wordCount: 12 }] };
    const mockLists2 = { lists: [{ id: "2", name: "List 2", level: "Grade 4", wordCount: 15 }] };
    
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLists1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLists2,
      });
    vi.stubGlobal("fetch", fetchMock);

    await fetchCustomLists();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    invalidateCustomListsCache();

    await fetchCustomLists();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
