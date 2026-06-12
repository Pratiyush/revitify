import { createHash } from "node:crypto";

/**
 * MinHash + LSH banding, ported from graphify _minhash.py: 128 permutations over the Mersenne
 * prime 2^61-1, sha1-derived shingle hashes, 3-gram character shingles, candidate pairs from
 * 16 bands × 8 rows (≈0.7 Jaccard threshold — datasketch's banding for graphify's 0.7).
 * Coefficients come from a seeded PRNG: structurally equivalent to numpy RandomState(1), not
 * bit-identical (documented in PARITY.md).
 */

const MERSENNE = (1n << 61n) - 1n;
const NUM_PERM = 128;
const BANDS = 16;
const ROWS = 8;
const SHINGLE = 3;

/** mulberry32 — tiny deterministic PRNG; seed fixed so signatures are stable across runs. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1);
const PERMS: Array<[bigint, bigint]> = Array.from({ length: NUM_PERM }, () => [
  BigInt(Math.floor(rand() * Number(MERSENNE - 1n)) + 1),
  BigInt(Math.floor(rand() * Number(MERSENNE))),
]);

function shingleHash(shingle: string): bigint {
  const digest = createHash("sha1").update(shingle).digest();
  return digest.readBigUInt64BE(0) & MERSENNE;
}

export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function signature(text: string): BigUint64Array {
  const sig = new BigUint64Array(NUM_PERM).fill(MERSENNE);
  const padded = text.length < SHINGLE ? text.padEnd(SHINGLE, "_") : text;
  for (let i = 0; i + SHINGLE <= padded.length; i++) {
    const h = shingleHash(padded.slice(i, i + SHINGLE));
    for (let p = 0; p < NUM_PERM; p++) {
      const [a, b] = PERMS[p] as [bigint, bigint];
      const v = (a * h + b) % MERSENNE;
      if (v < (sig[p] as bigint)) sig[p] = v;
    }
  }
  return sig;
}

export function estimatedJaccard(a: BigUint64Array, b: BigUint64Array): number {
  let equal = 0;
  for (let i = 0; i < NUM_PERM; i++) if (a[i] === b[i]) equal++;
  return equal / NUM_PERM;
}

/** Candidate near-duplicate pairs via LSH banding — O(items), not O(items²). */
export function candidatePairs(signatures: ReadonlyArray<BigUint64Array>): Array<[number, number]> {
  const pairs = new Set<string>();
  for (let band = 0; band < BANDS; band++) {
    const buckets = new Map<string, number[]>();
    for (let i = 0; i < signatures.length; i++) {
      const sig = signatures[i] as BigUint64Array;
      let key = "";
      for (let row = 0; row < ROWS; row++) key += `${sig[band * ROWS + row]},`;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(i);
      else buckets.set(key, [i]);
    }
    for (const bucket of buckets.values()) {
      for (let x = 0; x < bucket.length; x++) {
        for (let y = x + 1; y < bucket.length; y++) {
          pairs.add(`${bucket[x]},${bucket[y]}`);
        }
      }
    }
  }
  return [...pairs].map((p) => p.split(",").map(Number) as [number, number]);
}
