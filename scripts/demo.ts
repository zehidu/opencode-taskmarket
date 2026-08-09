import { createTaskmarketClient, summarizeTasks } from "../src/client.ts"

const result = summarizeTasks(await createTaskmarketClient().list({ limit: 3, sort: "reward_desc" }))
console.log(JSON.stringify(result, null, 2))
