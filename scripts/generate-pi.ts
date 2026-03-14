import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const NUM_DIGITS = 1_000_000;
const GUARD = 20;

/**
 * Compute arccot(x) = arctan(1/x) in fixed-point BigInt arithmetic.
 * Returns arctan(1/x) × 10^precision.
 */
function arccot(x: bigint, precision: number): bigint {
  const unity = 10n ** BigInt(precision);
  const negX2 = -(x * x); // sign flip gives alternating series
  let sum = 0n;
  let term = unity / x;
  let n = 1n;

  while (term !== 0n) {
    sum += term / n;
    term /= negX2;
    n += 2n;
  }
  return sum;
}

console.log(
  `Computing ${NUM_DIGITS.toLocaleString()} decimal digits of π (Machin's formula)...`
);
console.time("computation");

const precision = NUM_DIGITS + GUARD;

// Machin's formula: π/4 = 4·arctan(1/5) − arctan(1/239)
const pi = 4n * (4n * arccot(5n, precision) - arccot(239n, precision));

const piStr = pi.toString();
const decimals = piStr.substring(1, NUM_DIGITS + 1); // skip leading "3"

console.timeEnd("computation");
console.log(
  `Verify: 3.${decimals.substring(0, 20)} (expect 3.14159265358979323846)`
);

const outDir = join(process.cwd(), "public");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const outPath = join(outDir, "pi-digits.txt");
writeFileSync(outPath, decimals, "utf-8");
console.log(
  `Written ${decimals.length.toLocaleString()} digits to public/pi-digits.txt`
);
