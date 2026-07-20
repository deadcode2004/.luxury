const AUTH_COOKIE = "paradise_auth";
const ROLE_COOKIE = "paradise_role";

export function setAuthCookies(role: "owner" | "user") {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${AUTH_COOKIE}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${role}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export { AUTH_COOKIE, ROLE_COOKIE };
