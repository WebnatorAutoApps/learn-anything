import type { Metadata } from "next";
import LandingClient from "./landing/LandingClient";

export const metadata: Metadata = {
  title: "Learn Any Skill by Doing",
  description:
    "LearnAnything helps you master any skill through hands-on projects. Pick a skill, follow guided lessons, build real projects, and master it — all for free.",
};

export default function LandingPage() {
  return <LandingClient />;
}
