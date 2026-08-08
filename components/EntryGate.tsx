"use client";

import { ReactNode, useEffect, useState } from "react";
import EntryScreen from "./EntryScreen";

const SESSION_KEY = "cucumberhood_entered";

/**
 * Shows the click-to-enter screen over whatever it wraps, once per browser
 * session. Used on every route, so landing straight on /join from a shared
 * link still gets the intro.
 */
export default function EntryGate({ children }: { children: ReactNode }) {
  // Defaults to showing the entry screen (correct for first-time visitors).
  // On a repeat visit this effect flips it off as soon as sessionStorage is
  // read; defaulting the other way would flash the page before the overlay
  // mounted on every first visit instead.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setEntered(true);
    }
  }, []);

  function handleComplete() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setEntered(true);
  }

  return (
    <>
      {children}
      {!entered && <EntryScreen onComplete={handleComplete} />}
    </>
  );
}
