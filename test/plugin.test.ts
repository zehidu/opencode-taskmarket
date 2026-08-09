import { describe, expect, test } from "bun:test"
import { TaskmarketPlugin } from "../src/index.ts"

describe("OpenCode plugin", () => {
  test("registers read and planning tools", async () => {
    const plugin = await TaskmarketPlugin({} as never)
    expect(Object.keys(plugin.tool ?? {}).sort()).toEqual([
      "taskmarket_inspect",
      "taskmarket_list_open",
      "taskmarket_plan_delegation",
      "taskmarket_submissions",
    ])
  })

  test("delegation planning is explicit and side-effect free", async () => {
    const plugin = await TaskmarketPlugin({} as never)
    const output = await plugin.tool?.taskmarket_plan_delegation?.execute(
      {
        description: "Review a public repository and return a reproducible test report.",
        rewardUsdc: "5",
        deadlineHours: 48,
        mode: "bounty",
        tags: ["qa", "code"],
      },
      {} as never,
    )
    const result = JSON.parse(String(output))

    expect(result.status).toBe("proposal_requires_explicit_user_authorization")
    expect(result.sideEffectsPerformed).toBe(false)
    expect(result.rewardBaseUnits).toBe("5000000")
    expect(result.cliArgv).toEqual([
      "taskmarket",
      "task",
      "create",
      "--description",
      "Review a public repository and return a reproducible test report.",
      "--reward",
      "5",
      "--duration",
      "48",
      "--mode",
      "bounty",
      "--tags",
      "qa,code",
    ])
  })
})
