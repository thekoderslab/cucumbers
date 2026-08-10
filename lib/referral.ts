import { SITE } from "./config";

/*
 * Client-safe referral helpers — imported by JoinFlow and MainPage, so
 * nothing here may touch Node built-ins. Code *generation* needs crypto and
 * lives in referral-code.ts, which only the API route imports.
 */

export const POINTS_PER_REFERRAL = 10;
export const GTD_SPOTS = 10;

export function referralUrl(code: string): string {
  return `https://${SITE}/join?ref=${code}`;
}

/** Codes are 8 uppercase hex characters — anything else can't be one. */
export function isReferralCode(value: string): boolean {
  return /^[0-9A-F]{8}$/.test(value.trim().toUpperCase());
}

/** 0x1234…abcd */
export function truncateWallet(wallet: string): string {
  return wallet.length > 12
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : wallet;
}
