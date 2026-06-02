/**
 * Parse magazine post id from CLI (works on Windows npm where --id is eaten as npm config).
 *
 * Supports:
 *   npx tsx script/publish-social.ts --id=36
 *   npm run publish-social --id=36
 *   npm run publish-social -- 36
 */
export function parseCliPostId(argv: string[] = process.argv): number | null {
  const fromFlag = argv.find((arg) => arg.startsWith("--id="));
  if (fromFlag) {
    const n = Number(fromFlag.split("=")[1]);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  const fromNpmConfig = process.env.npm_config_id;
  if (fromNpmConfig) {
    const n = Number(fromNpmConfig);
    if (!Number.isNaN(n) && n > 0) return n;
  }

  const positional = argv
    .slice(2)
    .find((arg) => /^\d+$/.test(arg) && !arg.startsWith("-"));
  if (positional) {
    return Number(positional);
  }

  return null;
}
