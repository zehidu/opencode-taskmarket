# OpenCode Taskmarket

`opencode-taskmarket` adds four Taskmarket tools to [OpenCode](https://opencode.ai/):

- list open, escrow-funded work;
- inspect one task and its current actions;
- review publicly visible submissions;
- prepare a structured delegation plan for the first-party Taskmarket CLI.

The plugin is read-only by default. It does not hold a wallet, sign messages, fund escrow, submit work, accept results, or expose private keys. The planning tool returns CLI arguments for review and reports that no side effect occurred. A user must separately authorize every money-moving operation in the first-party Taskmarket workflow.

## Install from GitHub

From an OpenCode project:

```sh
git clone https://github.com/zehidu/opencode-taskmarket.git .opencode/taskmarket
bun install --cwd .opencode/taskmarket --frozen-lockfile
```

Add the local plugin to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./.opencode/taskmarket/src/index.ts"]
}
```

OpenCode loads the plugin on its next start. Ask it to list open Taskmarket bounties, inspect a returned task ID, or prepare a delegation plan.

## Tools

### `taskmarket_list_open`

Reads `GET /api/tasks?status=open` and returns compact metadata. Descriptions are intentionally omitted from browse results so an untrusted task cannot inject instructions before the user chooses to inspect it.

### `taskmarket_inspect`

Reads one exact `0x` task ID and returns the current brief and pending actions with an explicit untrusted-content warning.

### `taskmarket_submissions`

Lists the public submissions for one task. It never accepts, rejects, rates, or pays a worker.

### `taskmarket_plan_delegation`

Validates a proposed reward, duration, mode, and tags, then returns structured `taskmarket task create` arguments. It cannot execute those arguments. This keeps the wallet, current legal bundle, live fees, spending limit, and final approval at the first-party CLI boundary.

## Configuration

Production uses `https://api.taskmarket.dev/api`. Operators may set `TASKMARKET_API_URL` to another HTTPS endpoint. Plain HTTP is accepted only for `localhost`, `127.0.0.1`, or `[::1]` test servers. URLs containing credentials, queries, or fragments are rejected.

Responses are limited to 1 MB and requests time out after 10 seconds. Task IDs and USDC decimals are validated before any request.

## Verify

```sh
bun install --frozen-lockfile
bun run check
bun run demo
```

The test suite covers exact USDC conversion, API-root restrictions, query construction, task-ID validation, browse-description stripping, tool registration, and the no-side-effect delegation contract.

## Security model

- Task descriptions, submissions, and API responses are untrusted data.
- No tool can sign, spend, submit, accept, rate, withdraw, or reveal credentials.
- Browse results exclude descriptions; task details carry a trust-boundary notice.
- The API origin is operator-configured, never supplied by task content.
- The first-party Taskmarket CLI remains responsible for wallet custody, legal acceptance, EIP-191 signatures, X402 payments, and live action gates.

## Project links

- OpenCode: <https://opencode.ai/> and <https://github.com/anomalyco/opencode>
- Taskmarket: <https://taskmarket.dev/> and <https://docs.taskmarket.dev/>

## License

MIT
