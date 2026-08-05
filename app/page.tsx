"use client";

import { useEffect, useState } from "react";
import EntryScreen from "@/components/EntryScreen";
import MainPage from "@/components/MainPage";

const SESSION_KEY = "cucumberhood_entered";

export default function Home() {
  // Defaults to showing the entry screen (the correct behavior for the vast
  // majority of visits — first-time visitors). On a same-session reload,
  // this effect flips it off almost immediately once sessionStorage is
  // checked; that's a deliberate tradeoff over defaulting the other way,
  // which would instead flash the bare main page before the overlay mounts
  // on every first-time visit.
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
      <MainPage />
      {!entered && <EntryScreen onComplete={handleComplete} />}
    </>
  );
}
