"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./JoinFlow.module.css";
import SmartImage from "./SmartImage";
import { CUCUMBER } from "@/lib/art";
import { X_PROFILE, X_POST, shareIntentUrl } from "@/lib/config";
import { isEvmAddress, isXStatusUrl } from "@/lib/validate";

type Status = "idle" | "submitting" | "success" | "error";

function openTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function JoinFlow() {
  const [followed, setFollowed] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [quoteOpened, setQuoteOpened] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [touched, setTouched] = useState({ quote: false, wallet: false });
  const closeRef = useRef<HTMLButtonElement>(null);

  const quoteValid = isXStatusUrl(quoteUrl);
  const walletValid = isEvmAddress(wallet);
  const done = [followed, reposted, quoteValid, walletValid].filter(
    Boolean
  ).length;
  const ready = done === 4;

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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409 = this wallet already has a spot. Called out on the wallet
        // field itself rather than buried in the generic error line.
        if (res.status === 409) setDuplicate(true);
        throw new Error(data.error || "Something went wrong. Try again.");
      }

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
            <h3 className={styles.taskTitle}>Follow @CucumberHoodNFT on X</h3>
            <button
              type="button"
              className={`${styles.taskAction} ${followed ? styles.taskActionDone : ""}`}
              onClick={() => {
                openTab(X_PROFILE);
                setFollowed(true);
              }}
            >
              {followed ? "Opened — done" : "Follow on X"}
            </button>
          </div>
        </div>

        {/* 2 — like + repost */}
        <div className={`${styles.task} ${reposted ? styles.taskDone : ""}`}>
          <span className={styles.taskNum}>{reposted ? "✓" : "2"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Like and repost the post</h3>
            <button
              type="button"
              className={`${styles.taskAction} ${reposted ? styles.taskActionDone : ""}`}
              onClick={() => {
                openTab(X_POST);
                setReposted(true);
              }}
            >
              {reposted ? "Opened — done" : "Open the post"}
            </button>
          </div>
        </div>

        {/* 3 — quote, then paste the quote's URL */}
        <div className={`${styles.task} ${quoteValid ? styles.taskDone : ""}`}>
          <span className={styles.taskNum}>{quoteValid ? "✓" : "3"}</span>
          <div className={styles.taskBody}>
            <h3 className={styles.taskTitle}>Quote the post</h3>
            <p className={styles.taskHint}>
              Open the post, quote it, then paste the link to <em>your</em>{" "}
              quote below.
            </p>
            <button
              type="button"
              className={`${styles.taskAction} ${quoteOpened ? styles.taskActionDone : ""}`}
              onClick={() => {
                openTab(X_POST);
                setQuoteOpened(true);
              }}
            >
              {quoteOpened ? "Opened — now paste the link" : "Open post to quote"}
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
              disabled={!quoteOpened}
              onChange={(e) => setQuoteUrl(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, quote: true }))}
            />
            {touched.quote && quoteUrl && !quoteValid && (
              <p className={styles.fieldError}>
                That doesn&apos;t look like an X post link.
              </p>
            )}
          </div>
        </div>

        {/* 4 — wallet */}
        <div className={`${styles.task} ${walletValid ? styles.taskDone : ""}`}>
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
              Congrats — you&apos;re in the Hood.
            </h2>
            <p className={styles.modalText}>
              Your spot is saved. See you at mint.
            </p>
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
