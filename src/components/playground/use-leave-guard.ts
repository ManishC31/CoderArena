"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// While `enabled`, stops the user from leaving the page by accident:
// - the Back button and links to other pages call onLeaveAttempt(destination) instead of
//   navigating, so the page can ask first;
// - closing or reloading the tab shows the browser's own "Leave site?" prompt (browsers
//   don't allow a custom one there).
// Returns leave(destination), which navigates away for real.
export function useLeaveGuard(enabled: boolean, onLeaveAttempt: (destination: string) => void) {
  const router = useRouter();
  const latest = useRef({ enabled, onLeaveAttempt });
  useEffect(() => {
    latest.current = { enabled, onLeaveAttempt };
  });

  // Back is caught with an extra history entry for this same page: pressing Back pops it,
  // staying on the page, and popstate decides what happens next. Once pushed, it stays until
  // Back uses it, so `enabled` can switch on and off (e.g. as autosave catches up).
  const guardPushed = useRef(false);
  useEffect(() => {
    if (enabled && !guardPushed.current) {
      window.history.pushState(null, "");
      guardPushed.current = true;
    }
  }, [enabled]);

  useEffect(() => {
    const pageUrl = window.location.href;

    function handlePopState() {
      // Already on another page (e.g. from the Back button's history menu): too late to ask.
      if (window.location.href !== pageUrl || !guardPushed.current) return;
      if (latest.current.enabled) {
        window.history.pushState(null, "");
        latest.current.onLeaveAttempt("/dashboard");
      } else {
        // Nothing to lose: continue to the page Back was going to.
        guardPushed.current = false;
        window.history.back();
      }
    }

    // Capture phase on window runs before Next.js's <Link> handles the click.
    function handleClick(event: MouseEvent) {
      if (!latest.current.enabled) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) {
        return;
      }
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      event.stopPropagation();
      latest.current.onLeaveAttempt(`${url.pathname}${url.search}${url.hash}`);
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!latest.current.enabled) return;
      event.preventDefault();
      // For browsers from before preventDefault() was enough (e.g. Chrome < 119).
      event.returnValue = true;
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Replaces the extra entry, so Back from the next page doesn't land on it.
  return useCallback(
    (destination: string) => {
      if (guardPushed.current) router.replace(destination);
      else router.push(destination);
    },
    [router],
  );
}
