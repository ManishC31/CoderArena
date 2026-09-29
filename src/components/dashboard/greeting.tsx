"use client";

import { useSyncExternalStore } from "react";

// The time of day never needs re-reading while the page is open.
const subscribe = () => () => {};

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

// "Good evening, Sam", in the user's own time zone. The server doesn't know it, so it
// renders "Welcome back" and the browser swaps in the greeting.
export function Greeting({ name }: { name: string }) {
  const greeting = useSyncExternalStore(subscribe, greetingForNow, () => "Welcome back");

  return (
    <h1 className="text-2xl font-semibold tracking-tight">
      {greeting}, {name}
    </h1>
  );
}
