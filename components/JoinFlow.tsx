"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./JoinFlow.module.css";
import SmartImage from "./SmartImage";
import { CUCUMBER } from "@/lib/art";
import {
  X_HANDLE,
  followIntentUrl,
  likeIntentUrl,
  repostIntentUrl,
  quoteIntentUrl,
  shareIntentUrl,
} from "@/lib/config";
import { isEvmAddress, isXStatusUrl } from "@/lib/validate";
import { isReferralCode, POINTS_PER_REFERRAL, GTD_SPOTS } from "@/lib/referral";

type Status = "idle" | "submitting" | "success" | "error";

function openTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function JoinFlow() {
  const [followed, setFollowed] = useState(false);
  // Like and repost are separate X intents, so they're tracked separately
  // even though they make up one step in the list.
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [quoteOpened, setQuoteOpened] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [touched, setTouched] = useState({ quote: false, wallet: false });
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<{
    referralUrl?: string;
    points?: number;
    rank?: number | null;
  }>({});
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  /*
   * Capture ?ref= once and keep it in localStorage: people arrive from an X
   * link, then wander off to X to do the tasks and come back — often via a
   * fresh tab without the query string. Reading window.location directly
   * rather than useSearchParams keeps this out of a Suspense boundary.
   */
  useEffect(() => {
    const KEY = "cucumberhood_ref";
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl && isReferralCode(fromUrl)) {
      localStorage.setItem(KEY, fromUrl.toUpperCase());
      setRef(fromUrl.toUpperCase());
      return;
    }
    const stored = localStorage.getItem(KEY);
    if (stored && isReferralCode(stored)) setRef(stored);
  }, []);

  const quoteValid = isXStatusUrl(quoteUrl);
  const walletValid = isEvmAddress(wallet);
  const engaged = liked && reposted;

  // Every step is required and they unlock in order — each one opens only
  // once the one before it is complete.
  const steps = [followed, engaged, quoteValid, walletValid];
  const unlocked = steps.map((_, i) => i === 0 || steps[i - 1]);

  const done = steps.filter(Boolean).length;
  const ready = done === steps.length;

  // Move focus into the dialog when it opens, and close it on Escape.
  useEffect(() => {
    if (status !== "success") return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStatus("idle");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  /*
   * navigator.clipboard needs a secure context and isn't available in every
   * in-app browser (X's webview on iOS especially), so fall back to selecting
   * the input and using execCommand. Deprecated, but it's what still works
   * where the modern API doesn't.
   */
  async function copyLink() {
    const url = result.referralUrl;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = linkRef.current;
      if (el) {
        el.removeAttribute("readonly");
        el.select();
        el.setSelectionRange(0, url.length);
        document.execCommand("copy");
        el.setAttribute("readonly", "true");
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ quote: true, wallet: true });

    if (!ready) {
      setError("Finish all four steps first.");
      return;
    }

    setError("");
    setDuplicate(false);
    setStatus("submitting");

    try {
      const res = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: wallet.trim(),
          quoteUrl: quoteUrl.trim(),
          followed,
          reposted,
          ref,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        /*
         * Keyed off the explicit flag, not the 409 status — a reused quote
         * link also answers 409, and showing "this wallet is already
         * registered" for that would send people chasing the wrong problem.
         */
        if (data.duplicate === true) {
          setDuplicate(true);
          // Their referral link comes back too, so show the success panel:
          // already being in shouldn't cost them access to their own link.
          if (data.referralUrl) {
            setResult({ referralUrl: data.referralUrl, points: data.points });
            setStatus("success");
            return;
          }
        }
        throw new Error(data.error || "Something went wrong. Try again.");
      }

      setResult({
        referralUrl: data.referralUrl,
        points: data.points ?? 0,
        rank: data.rank ?? null,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  }

  return (
    <>
      <form className={styles.wrap} onSubmit={handleSubmit} noValidate>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(done / 4) * 100}%` }}
            />
          </div>
          <span className={styles.progressText}>{done} / 4 done</span>
        </div>

        {/* 1 — follow */}
        <div className={`${styles.task} ${followed ? styles.taskDone : ""}`}>
          <span className={styles.taskNum}>{followed ? "✓" : "1"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Follow @{X_HANDLE} on X</h3>
            <button
              type="button"
              className={`${styles.taskAction} ${followed ? styles.taskActionDone : ""}`}
              onClick={() => {
                openTab(followIntentUrl());
                setFollowed(true);
              }}
            >
              {followed ? "Done ✓" : "Follow on X"}
            </button>
          </div>
        </div>

        {/* 2 — like + repost (two separate X intents) */}
        <div
          className={`${styles.task} ${engaged ? styles.taskDone : ""} ${!unlocked[1] ? styles.taskLocked : ""}`}
          aria-disabled={!unlocked[1]}
        >
          <span className={styles.taskNum}>{engaged ? "✓" : "2"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Like and repost the post</h3>
            <div className={styles.taskActions}>
              <button
                type="button"
                disabled={!unlocked[1]}
                className={`${styles.taskAction} ${liked ? styles.taskActionDone : ""}`}
                onClick={() => {
                  openTab(likeIntentUrl());
                  setLiked(true);
                }}
              >
                {liked ? "Liked ✓" : "Like the post"}
              </button>
              <button
                type="button"
                disabled={!unlocked[1]}
                className={`${styles.taskAction} ${reposted ? styles.taskActionDone : ""}`}
                onClick={() => {
                  openTab(repostIntentUrl());
                  setReposted(true);
                }}
              >
                {reposted ? "Reposted ✓" : "Repost"}
              </button>
            </div>
            {!unlocked[1] && (
              <p className={styles.lockNote}>Finish step 1 first</p>
            )}
          </div>
        </div>

        {/* 3 — quote, then paste the quote's URL */}
        <div
          className={`${styles.task} ${quoteValid ? styles.taskDone : ""} ${!unlocked[2] ? styles.taskLocked : ""}`}
          aria-disabled={!unlocked[2]}
        >
          <span className={styles.taskNum}>{quoteValid ? "✓" : "3"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Quote the post</h3>
            <button
              type="button"
              disabled={!unlocked[2]}
              className={`${styles.taskAction} ${quoteOpened ? styles.taskActionDone : ""}`}
              onClick={() => {
                openTab(quoteIntentUrl());
                setQuoteOpened(true);
              }}
            >
              {quoteOpened ? "Opened — now paste the link" : "Quote the post"}
            </button>
            <label className="visually-hidden" htmlFor="quoteUrl">
              URL of your quote post
            </label>
            <input
              id="quoteUrl"
              name="quoteUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              className={styles.input}
              placeholder="https://x.com/you/status/..."
              value={quoteUrl}
              disabled={!unlocked[2] || !quoteOpened}
              onChange={(e) => setQuoteUrl(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, quote: true }))}
            />
            {touched.quote && quoteUrl && !quoteValid && (
              <p className={styles.fieldError}>
                That doesn&apos;t look like an X post link.
              </p>
            )}
            {!unlocked[2] && (
              <p className={styles.lockNote}>Finish step 2 first</p>
            )}
          </div>
        </div>

        {/* 4 — wallet */}
        <div
          className={`${styles.task} ${walletValid ? styles.taskDone : ""} ${!unlocked[3] ? styles.taskLocked : ""}`}
          aria-disabled={!unlocked[3]}
        >
          <span className={styles.taskNum}>{walletValid ? "✓" : "4"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Add your EVM wallet</h3>
            <label className="visually-hidden" htmlFor="wallet">
              EVM wallet address
            </label>
            <input
              id="wallet"
              name="wallet"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className={styles.input}
              placeholder="0x..."
              value={wallet}
              disabled={!unlocked[3]}
              onChange={(e) => {
                setWallet(e.target.value);
                setDuplicate(false);
              }}
              onBlur={() => setTouched((t) => ({ ...t, wallet: true }))}
            />
            {touched.wallet && wallet && !walletValid && (
              <p className={styles.fieldError}>
                Enter a valid EVM address (0x + 40 characters).
              </p>
            )}
            {duplicate && (
              <p className={styles.duplicate} role="alert">
                This wallet is already on the allowlist — you&apos;re in. Use a
                different wallet if you&apos;re entering for someone else.
              </p>
            )}
            {!unlocked[3] && (
              <p className={styles.lockNote}>Finish step 3 first</p>
            )}
          </div>
        </div>

        {error && !duplicate && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.submit}
          disabled={!ready || status === "submitting"}
        >
          {status === "submitting" ? "Saving…" : "Join the Hood"}
        </button>

        <p className={styles.note}>
          No wallet connection. No transaction. Just your address.
        </p>
      </form>

      {status === "success" && (
        <div
          className={styles.scrim}
          onClick={(e) => {
            if (e.target === e.currentTarget) setStatus("idle");
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-success-title"
          >
            <SmartImage
              sources={CUCUMBER}
              className={styles.modalArt}
              eager
            />
            <h2 id="join-success-title" className={styles.modalTitle}>
              {duplicate
                ? "You're already in the Hood."
                : "Congrats — you're in the Hood."}
            </h2>
            <p className={styles.modalText}>
              Your spot is saved. See you at mint.
            </p>

            {result.referralUrl && (
              <div className={styles.referral}>
                <p className={styles.referralExplainer}>
                  Refer a friend and get {POINTS_PER_REFERRAL} points — top{" "}
                  {GTD_SPOTS} point holders get a guaranteed whitelist spot.
                </p>

                <div className={styles.referralRow}>
                  <input
                    ref={linkRef}
                    className={styles.referralInput}
                    value={result.referralUrl}
                    readOnly
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label="Your referral link"
                  />
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={copyLink}
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>

                <p className={styles.referralStats}>
                  You have <strong>{result.points ?? 0}</strong>{" "}
                  {result.points === 1 ? "point" : "points"} —{" "}
                  {result.rank ? `rank #${result.rank}` : "rank unranked"}
                </p>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.shareBtn}
                onClick={() => openTab(shareIntentUrl())}
              >
                Share on X
              </button>
              <button
                ref={closeRef}
                type="button"
                className={styles.closeBtn}
                onClick={() => setStatus("idle")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
