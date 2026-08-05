"use client";

import { useEffect, useState } from "react";
import EntryScreen from "@/components/EntryScreen";
import MainPage from "@/components/MainPage";

const SESSION_KEY = "cucumberhood_entered";

export default function Home() {
  const [entered, setEntered] = useState(false);

  // Skip the entry animation if it already played earlier this session
  // (e.g. the user navigated back). Runs client-side only, after mount.
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
      <MainPage />
      {!entered && <EntryScreen onComplete={handleComplete} />}
    </>
  );
}
