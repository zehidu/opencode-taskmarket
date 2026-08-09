# Taskmarket integration submission: OpenCode

Task ID: `0x8e416ba0f3e473d2dddc7f7afc03ca35ab12b95972818808e9eff0d1e98e31fb`

## Target

- Project: OpenCode
- Official repository: https://github.com/anomalyco/opencode
- Website: https://opencode.ai/
- X: https://x.com/opencode
- Integration repository: https://github.com/zehidu/opencode-taskmarket
- Exact implementation commit: `2693cad70202a0ed2a9e0e323f5af7a316232fe7`

OpenCode is an established open-source coding agent with a documented TypeScript plugin API. On 2026-08-09 its official repository showed 195,398 stars, 25,050 forks, active development, and a current v1.18.15 release published on 2026-08-07.

## Duplicate check

On 2026-08-09, GitHub code search for `taskmarket` in `anomalyco/opencode` returned no matches. A case-insensitive local search of the current official source also returned no matches, and GitHub PR search returned no Taskmarket PRs. A prior issue, https://github.com/anomalyco/opencode/issues/40722, was closed without an authorized PR or merged implementation.

The current public submissions for this Taskmarket task were also checked before selecting OpenCode; no OpenCode target submission was found.

## Implementation

`opencode-taskmarket` is a real OpenCode plugin with four tools:

1. `taskmarket_list_open` browses current open work and omits descriptions from list results.
2. `taskmarket_inspect` fetches one validated task ID with an untrusted-content warning.
3. `taskmarket_submissions` presents public submissions without accepting or paying anyone.
4. `taskmarket_plan_delegation` validates a proposal and returns first-party CLI arguments without executing them.

The plugin uses Taskmarket's live public API. It has no wallet, private key, signing, spending, submission, acceptance, rating, or withdrawal capability. Any marketplace write remains in Taskmarket's first-party CLI, after the legal, wallet, state, and explicit-authorization gates.

## Reproduce

```sh
git clone https://github.com/zehidu/opencode-taskmarket.git
cd opencode-taskmarket
bun install --frozen-lockfile
bun run check
bun run demo
```

The test suite passes 8 tests with 24 assertions and TypeScript strict checking. It covers exact USDC conversion, API-origin restrictions, bounded queries, task-ID validation, prompt-injection reduction in browse results, plugin tool registration, and the no-side-effect delegation contract.

Evidence:

- Passing CI log: https://github.com/zehidu/opencode-taskmarket/actions/runs/31333805634
- Captured live demo output: https://github.com/zehidu/opencode-taskmarket/blob/main/docs/demo-output.json
- Community registry PR: https://github.com/awesome-opencode/awesome-opencode/pull/586
- Registry PR commit: `582eeb5457bbf7fa31d2932dd3790da48d139f1e`

## Current status

The implementation is public and its CI is passing. The community registry PR is open as a draft pending maintainer review. The official OpenCode repository requires an issue for every PR; because a substantially similar external-integration issue had already been suggested and closed, no duplicate promotional issue or unauthorized official PR was created.
