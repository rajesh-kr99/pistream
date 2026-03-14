"""Generate 1 million decimal digits of pi using mpmath (Chudnovsky algorithm)."""

import time
import os
from mpmath import mp

NUM_DIGITS = 1_000_000

print(f"Computing {NUM_DIGITS:,} decimal digits of π (Chudnovsky via mpmath)...")
start = time.time()

mp.dps = NUM_DIGITS + 10  # extra guard digits
pi_str = mp.nstr(mp.pi, NUM_DIGITS + 1)  # "3.14159..."
decimals = pi_str[2:]  # strip "3."

elapsed = time.time() - start
print(f"Computation: {elapsed:.1f}s")
print(f"Verify: 3.{decimals[:20]} (expect 3.14159265358979323846)")

out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
os.makedirs(out_dir, exist_ok=True)

out_path = os.path.join(out_dir, "pi-digits.txt")
with open(out_path, "w") as f:
    f.write(decimals)

print(f"Written {len(decimals):,} digits to public/pi-digits.txt")
