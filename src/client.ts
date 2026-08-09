const DEFAULT_API_URL = "https://api.taskmarket.dev/api"
const MAX_RESPONSE_BYTES = 1_000_000
const TASK_ID = /^0x[0-9a-fA-F]{64}$/

export type TaskMode = "bounty" | "claim" | "pitch" | "benchmark" | "auction"
export type TaskSort = "newest" | "reward_desc" | "reward_asc" | "deadline_asc"

type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export type TaskListFilters = {
  mode?: TaskMode | undefined
  minRewardUsdc?: string | undefined
  deadlineHours?: number | undefined
  limit?: number | undefined
  sort?: TaskSort | undefined
  tags?: string[] | undefined
}

export function createTaskmarketClient(input?: { baseUrl?: string; fetch?: Fetch }) {
  const base = normalizeApiUrl(input?.baseUrl ?? process.env.TASKMARKET_API_URL ?? DEFAULT_API_URL)
  const request = input?.fetch ?? fetch

  return {
    async list(filters: TaskListFilters = {}) {
      const query = new URLSearchParams({
        status: "open",
        limit: String(filters.limit ?? 20),
        sort: filters.sort ?? "reward_desc",
      })
      if (filters.mode) query.set("mode", filters.mode)
      if (filters.minRewardUsdc) query.set("minReward", usdcToBaseUnits(filters.minRewardUsdc))
      if (filters.deadlineHours) query.set("deadlineHours", String(filters.deadlineHours))
      filters.tags?.forEach((tag) => query.append("tags", tag))

      return fetchJson(new URL(`tasks?${query}`, base), request)
    },

    async get(taskId: string) {
      requireTaskId(taskId)
      return fetchJson(new URL(`tasks/${taskId}`, base), request)
    },

    async submissions(taskId: string) {
      requireTaskId(taskId)
      return fetchJson(new URL(`tasks/${taskId}/submissions`, base), request)
    },
  }
}

export function normalizeApiUrl(value: string) {
  const url = new URL(value)
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]"
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new Error("TASKMARKET_API_URL must use HTTPS (HTTP is allowed only for localhost)")
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("TASKMARKET_API_URL cannot contain credentials, a query, or a fragment")
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`
  return url
}

export function requireTaskId(value: string) {
  if (!TASK_ID.test(value)) throw new Error("Task ID must be a 0x-prefixed 32-byte hex value")
  return value
}

export function usdcToBaseUnits(value: string) {
  if (!/^(0|[1-9]\d*)(\.\d{1,6})?$/.test(value)) {
    throw new Error("USDC amount must be a non-negative decimal with at most six places")
  }
  const [whole = "0", fraction = ""] = value.split(".")
  return (BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"))).toString()
}

export function baseUnitsToUsdc(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null
  const units = BigInt(value)
  const whole = units / 1_000_000n
  const fraction = (units % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export function summarizeTasks(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.tasks)) return payload
  return {
    ...payload,
    tasks: payload.tasks.map((value) => {
      if (!isRecord(value)) return value
      return {
        id: value.id,
        mode: value.mode,
        status: value.status,
        rewardUsdc: baseUnitsToUsdc(value.reward),
        netRewardUsdc: baseUnitsToUsdc(value.netReward),
        expiryTime: value.expiryTime,
        submissionCount: value.submissionCount,
        tags: value.tags,
      }
    }),
  }
}

async function fetchJson(url: URL, request: Fetch) {
  const response = await request(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Taskmarket returned HTTP ${response.status}`)

  const length = Number(response.headers.get("content-length") ?? "0")
  if (length > MAX_RESPONSE_BYTES) throw new Error("Taskmarket response exceeded the 1 MB safety limit")

  const body = await response.text()
  if (new TextEncoder().encode(body).byteLength > MAX_RESPONSE_BYTES) {
    throw new Error("Taskmarket response exceeded the 1 MB safety limit")
  }
  return JSON.parse(body) as unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
