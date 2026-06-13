/**
 * Tiny argv parser shared by the verbs. `--name value` captures a value (bounds-checked — a
 * trailing `--name` with no following token is a bare flag, not `undefined`); `--name` alone is a
 * boolean flag; everything else is positional. Pass the args WITHOUT the leading verb.
 */
export interface ParsedArgs {
  positional: string[];
  flag(name: string): boolean;
  value(name: string): string | undefined;
}

export function parseArgs(args: readonly string[]): ParsedArgs {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();
  for (let i = 0; i < args.length; i++) {
    const a = args[i] as string;
    if (a.startsWith("--")) {
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags.set(a.slice(2), next);
        i++;
      } else {
        flags.set(a.slice(2), true);
      }
    } else if (!a.startsWith("-")) {
      positional.push(a);
    }
  }
  return {
    positional,
    flag: (name) => flags.has(name),
    value: (name) => {
      const v = flags.get(name);
      return typeof v === "string" ? v : undefined;
    },
  };
}
