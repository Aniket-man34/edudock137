import type { Metadata } from "next";
import SavedView from "@/components/saved/SavedView";

export const metadata: Metadata = {
  title: "Saved | EduDock",
  description: "Items you've saved for later on this device.",
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return <SavedView />;
}
