/**
 * Lists the Tavus replicas (avatar characters) available on your account, so
 * you can copy a replica_id into TAVUS_REPLICA_ID in .env.local.
 *
 * Usage:
 *   npm run list-tavus-replicas
 *
 * Requires TAVUS_API_KEY in .env.local (https://platform.tavus.io/dev/api-keys).
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_BASE =
  process.env.TAVUS_API_BASE?.trim().replace(/\/$/, "") || "https://tavusapi.com";

interface Replica {
  replica_id: string;
  replica_name?: string;
  status?: string;
  replica_type?: string;
}

async function fetchReplicas(): Promise<Replica[]> {
  const key = process.env.TAVUS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "TAVUS_API_KEY is not set. Add it to .env.local (https://platform.tavus.io/dev/api-keys).",
    );
  }

  const res = await fetch(`${API_BASE}/v2/replicas?verbose=true`, {
    headers: { "x-api-key": key },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Tavus API ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { data?: Replica[] } | Replica[];
  return Array.isArray(json) ? json : (json.data ?? []);
}

async function main() {
  const replicas = await fetchReplicas();
  if (!replicas.length) {
    console.log(
      "No replicas found on this account. Create or pick one at https://platform.tavus.io",
    );
    return;
  }

  console.log(`\nFound ${replicas.length} replica(s):\n`);
  for (const r of replicas) {
    const name = r.replica_name ?? "(unnamed)";
    const type = r.replica_type ? ` [${r.replica_type}]` : "";
    const status = r.status ? ` (${r.status})` : "";
    console.log(`  ${r.replica_id}  -  ${name}${type}${status}`);
  }
  console.log(
    "\nCopy the id you want into .env.local:\n  TAVUS_REPLICA_ID=<id>\n  TAVUS_VOICE_MODE=script   # use the replica's own voice\n",
  );
}

main().catch((error) => {
  console.error("Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
