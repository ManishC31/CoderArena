// Route access rules used by src/proxy.ts. Any route not listed here is private.

// Anyone can visit these, signed in or not.
export const publicRoutes = ["/"];

// Sign-in pages: open to signed-out users; signed-in users are sent to DEFAULT_LOGIN_REDIRECT.
export const authRoutes = ["/login", "/signup"];

// Where signed-out users are sent when they open a private route.
export const LOGIN_ROUTE = "/login";

// Where users land after logging in or signing up, and where signed-in users
// are sent when they open an auth route.
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

// Only same-site paths are allowed as a post-login destination; anything else
// (e.g. "https://evil.com" or "//evil.com") falls back to DEFAULT_LOGIN_REDIRECT.
export function safeCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string") return DEFAULT_LOGIN_REDIRECT;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_LOGIN_REDIRECT;
  }
  return value;
}

// Keeps the post-login destination when switching between the login and signup pages.
export function withCallbackUrl(path: string, callbackUrl: string) {
  if (callbackUrl === DEFAULT_LOGIN_REDIRECT) return path;
  return `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

// A route covers itself and everything under it ("/docs" also matches "/docs/intro").
// "/" only matches the home page.
export function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );
}
