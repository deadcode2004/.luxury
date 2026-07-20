/**
 * Deployment/build identity used to detect stale browser shells.
 * Prefer Vercel git SHA in production; fall back to a process-scoped local id.
 */
export function getAppBuildId(): string {
  return (
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.GIT_COMMIT ||
    "dev"
  );
}
