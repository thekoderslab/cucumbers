import EntryGate from "@/components/EntryGate";
import MainPage from "@/components/MainPage";

export default function Home() {
  return (
    <EntryGate>
      <MainPage />
    </EntryGate>
  );
}
