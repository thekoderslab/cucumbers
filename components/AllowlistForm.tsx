"use client";

import { FormEvent, useState } from "react";
import styles from "./AllowlistForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export default function AllowlistForm() {
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!wallet.trim() || !twitter.trim()) {
      setError("Wallet address and X handle are required.");
      return;
    }

    setError("");
    setStatus("submitting");

    try {
      const res = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: wallet.trim(),
          email: email.trim(),
          twitter: twitter.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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

  if (status === "success") {
    return (
      <div className={styles.confirmation} role="status">
        <span className={styles.confirmEmoji} aria-hidden="true">
          🥒
        </span>
        <h3 className={styles.confirmTitle}>
          You&apos;re in the Hood. See you at mint.
        </h3>
        <p className={styles.confirmText}>
          Keep an eye on X — that&apos;s where the news drops.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className="visually-hidden" htmlFor="wallet">
        Wallet address
      </label>
      <input
        id="wallet"
        name="wallet"
        type="text"
        autoComplete="off"
        placeholder="Enter your wallet address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className={styles.input}
      />

      <label className="visually-hidden" htmlFor="email">
        Email (optional)
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="off"
        placeholder="Enter your email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />

      <label className="visually-hidden" htmlFor="twitter">
        X handle
      </label>
      <input
        id="twitter"
        name="twitter"
        type="text"
        autoComplete="off"
        placeholder="Your X handle"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Joining…" : "Join the Hood"}
      </button>

      <p className={styles.note}>
        No wallet connection. No transaction. Just your address.
      </p>
    </form>
  );
}
