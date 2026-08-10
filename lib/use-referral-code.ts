import { useEffect, useState } from "react";
import { isReferralCode } from "./referral";

export const REF_STORAGE_KEY = "cucumberhood_ref";

/**
 * The referral code this visitor arrived with.
 *
 * Captured once and kept in localStorage: people arrive from an X link, go
 * off to X to do the tasks, and come back — often in a fresh tab with no
 * query string. Reading window.location directly rather than useSearchParams
 * keeps callers out of a Suspense boundary.
 */
export function useReferralCode(): string {
  const [code, setCode] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl && isReferralCode(fromUrl)) {
      const upper = fromUrl.toUpperCase();
      localStorage.setItem(REF_STORAGE_KEY, upper);
      setCode(upper);
      return;
    }
    const stored = localStorage.getItem(REF_STORAGE_KEY);
    if (stored && isReferralCode(stored)) setCode(stored);
  }, []);

  return code;
}
