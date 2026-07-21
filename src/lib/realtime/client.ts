import { apiRequest } from "@/lib/api/client";
import {
  EMPTY_VERSIONS,
  type DomainVersions,
  type RealtimeSnapshot,
} from "@/lib/realtime/types";

export async function fetchRealtimeVersions(
  signal?: AbortSignal
): Promise<RealtimeSnapshot> {
  const data = await apiRequest<{
    cursor?: number;
    versions?: Partial<DomainVersions>;
  }>("/realtime/versions", { cache: "no-store", signal });

  return {
    cursor: Number(data?.cursor ?? 0),
    versions: { ...EMPTY_VERSIONS, ...(data?.versions ?? {}) },
  };
}
