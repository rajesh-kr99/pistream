"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  LAUNCH_DATE,
  MS_PER_DIGIT,
  PI_DECIMALS_FALLBACK,
} from "@/lib/constants";

export default function PiDisplay() {
  const [piDecimals, setPiDecimals] = useState(PI_DECIMALS_FALLBACK);
  const [, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    position: number;
    revealed: boolean;
    revealDate: Date;
  } | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [highlightRange, setHighlightRange] = useState<
    [number, number] | null
  >(null);
  const [showFacts, setShowFacts] = useState(false);
  const [guessInput, setGuessInput] = useState("");
  const [resultModal, setResultModal] = useState<{
    type: "search-found" | "search-not-found" | "guess-correct" | "guess-wrong";
    message: string;
    sub?: string;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLSpanElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const piLoadedRef = useRef(false);

  // Load full pi digits file
  useEffect(() => {
    fetch("/pi-digits.txt")
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then((text) => {
        const trimmed = text.trim();
        if (trimmed.length > 0) setPiDecimals(trimmed);
      })
      .catch(() => {
        // Use hardcoded fallback
      })
      .finally(() => {
        piLoadedRef.current = true;
      });
  }, []);

  // Tick every second to drive the clock
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ----- derived values (recalculated every render / tick) -----
  const now = Date.now();
  const launched = now >= LAUNCH_DATE.getTime();
  const elapsed = launched ? now - LAUNCH_DATE.getTime() : 0;
  const totalRevealed = launched
    ? Math.floor(elapsed / MS_PER_DIGIT) + 1
    : 0;
  const displayCount = Math.min(totalRevealed, piDecimals.length);
  const exhausted = totalRevealed > piDecimals.length;

  const nextDigitAt = LAUNCH_DATE.getTime() + totalRevealed * MS_PER_DIGIT;
  const secondsToNext = launched
    ? Math.max(0, Math.ceil((nextDigitAt - now) / 1000))
    : 0;

  // Auto-scroll when a new digit appears
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [displayCount]);

  // Read ?find= from URL on mount and auto-search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const findParam = params.get("find");
    if (findParam && /^\d+$/.test(findParam)) {
      setSearchQuery(findParam);
    }
  }, []);

  // Auto-run search when query is set from URL param and digits are loaded
  useEffect(() => {
    if (searchQuery && piLoadedRef.current) {
      handleSearch();
    }
  // Only run when piDecimals changes (i.e. loaded from file) with an existing query
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piDecimals]);

  // ----- search handler -----
  const handleSearch = useCallback(() => {
    if (!searchQuery || !/^\d+$/.test(searchQuery)) return;

    const idx = piDecimals.indexOf(searchQuery);
    if (idx === -1) {
      setSearchResult(null);
      setSearchNotFound(true);
      setHighlightRange(null);
      setResultModal({
        type: "search-not-found",
        message: `"${searchQuery}" not found`,
        sub: `Not in the first ${piDecimals.length.toLocaleString()} decimal digits of π`,
      });
      return;
    }

    const endPos = idx + searchQuery.length;
    const revealed = endPos <= totalRevealed;
    const revealDate = new Date(
      LAUNCH_DATE.getTime() + (endPos - 1) * MS_PER_DIGIT
    );

    setSearchResult({ position: idx + 1, revealed, revealDate });
    setSearchNotFound(false);

    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set("find", searchQuery);
    window.history.replaceState({}, "", url.toString());

    if (revealed) {
      setHighlightRange([idx, endPos]);
      setResultModal({
        type: "search-found",
        message: `Found at position ${(idx + 1).toLocaleString()}`,
        sub: "Highlighted in green in the digit stream above",
      });
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } else {
      setHighlightRange(null);
      setResultModal({
        type: "search-found",
        message: `Found at position ${(idx + 1).toLocaleString()}`,
        sub: `Will be revealed ${revealDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`,
      });
    }
  }, [searchQuery, piDecimals, totalRevealed]);

  // ----- guess handler -----
  const handleGuess = useCallback(() => {
    if (!guessInput || !/^\d$/.test(guessInput)) return;
    const nextIndex = displayCount; // 0-based index of the next unrevealed digit
    if (nextIndex >= piDecimals.length) return;
    const actual = piDecimals[nextIndex];
    if (guessInput === actual) {
      setResultModal({
        type: "guess-correct",
        message: `You got it! The next digit is ${actual}`,
        sub: `Digit #${(nextIndex + 1).toLocaleString()} in the decimal expansion of π`,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setResultModal({
        type: "guess-wrong",
        message: `Not quite! You guessed ${guessInput}`,
        sub: `Wait for the next digit to be revealed and try again!`,
      });
    }
    setGuessInput("");
  }, [guessInput, displayCount, piDecimals]);

  // ========================  PRE-LAUNCH  ========================
  if (!launched) {
    const diff = LAUNCH_DATE.getTime() - now;
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    const secs = Math.floor((diff % 60_000) / 1000);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 select-none">
        <div className="text-[10rem] md:text-[14rem] leading-none mb-4 text-amber-400">
          π
        </div>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 text-center">
          One digit. Every minute. Forever.
        </p>
        <p className="text-gray-600 mb-3 text-sm">Launching Pi Day 2026</p>
        <div className="text-4xl md:text-6xl text-amber-400 tabular-nums tracking-wider">
          {days > 0 && (
            <>
              {days}
              <span className="text-gray-600 text-2xl md:text-4xl">d </span>
            </>
          )}
          {String(hours).padStart(2, "0")}
          <span className="text-gray-600">:</span>
          {String(mins).padStart(2, "0")}
          <span className="text-gray-600">:</span>
          {String(secs).padStart(2, "0")}
        </div>
        <p className="text-gray-700 mt-10 text-xs">
          March 14, 2026 · 00:00 UTC
        </p>
      </div>
    );
  }

  // ========================  LIVE DISPLAY  ========================
  const visibleDigits = piDecimals.substring(0, displayCount);

  // Format "running for" label
  const daysR = Math.floor(elapsed / 86_400_000);
  const hoursR = Math.floor((elapsed % 86_400_000) / 3_600_000);
  const minsR = Math.floor((elapsed % 3_600_000) / 60_000);
  let timeRunning = "";
  if (daysR > 0) timeRunning += `${daysR}d `;
  if (hoursR > 0 || daysR > 0) timeRunning += `${hoursR}h `;
  timeRunning += `${minsR}m`;

  // Render digits efficiently: plain text spans + one highlighted range + latest digit
  const renderDigits = () => {
    if (displayCount === 0) return null;

    const lastDigit = visibleDigits[displayCount - 1];
    const rest = displayCount > 1 ? visibleDigits.substring(0, displayCount - 1) : "";

    if (highlightRange) {
      const [hlStart, hlEnd] = highlightRange;
      const clampedEnd = Math.min(hlEnd, displayCount - 1);

      if (hlStart < displayCount - 1) {
        return (
          <>
            <span className="text-gray-400">
              {rest.substring(0, hlStart)}
            </span>
            <span
              ref={highlightRef}
              className="text-emerald-400 bg-emerald-400/10 rounded-sm"
            >
              {rest.substring(hlStart, clampedEnd)}
            </span>
            <span className="text-gray-400">
              {rest.substring(clampedEnd)}
            </span>
            <span ref={endRef} className="latest-digit">
              {lastDigit}
            </span>
          </>
        );
      }
    }

    return (
      <>
        <span className="text-gray-400">{rest}</span>
        <span ref={endRef} className="latest-digit">
          {lastDigit}
        </span>
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ---- Header: π + tagline left, counters right ---- */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-4xl md:text-5xl text-amber-400 leading-none select-none">
            π
          </span>
          <div className="hidden sm:block">
            <p className="text-xs md:text-sm text-gray-600">
              One digit. Every minute. Forever.
            </p>
            <button
              onClick={() => setShowFacts(true)}
              className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors mt-0.5"
            >
              Interesting facts about π →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-white/[0.04] rounded-lg px-3 py-1.5 text-center">
            <div className="text-sm md:text-base text-amber-400 tabular-nums leading-tight">
              {displayCount.toLocaleString()}
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-600">
              digits
            </div>
          </div>
          <div className="bg-white/[0.04] rounded-lg px-3 py-1.5 text-center">
            <div className="text-sm md:text-base text-amber-400 tabular-nums leading-tight">
              {secondsToNext}
              <span className="text-[10px] text-gray-600">s</span>
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-600">
              next digit
            </div>
          </div>
          <div className="bg-white/[0.04] rounded-lg px-3 py-1.5 text-center">
            <div className="text-sm md:text-base text-amber-400 tabular-nums leading-tight">
              {timeRunning}
            </div>
            <div className="text-[9px] md:text-[10px] text-gray-600">
              running
            </div>
          </div>
        </div>
      </header>

      {/* ---- Facts modal ---- */}
      {showFacts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowFacts(false)}
        >
          <div
            className="bg-[#111] border border-white/[0.08] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-amber-400">
                Interesting facts about π
              </h2>
              <button
                onClick={() => setShowFacts(false)}
                className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <span className="text-white font-medium">Irrational & transcendental</span>
                <br />
                π cannot be expressed as a fraction and is not the root of any polynomial with rational coefficients. Its decimal expansion never ends and never repeats.
              </li>
              <li>
                <span className="text-white font-medium">Computed to 100 trillion digits</span>
                <br />
                In 2024, StorageTeam computed 100 trillion digits of π — a record that took 54 days. At 1 digit per minute, this site would take ~190 million years to display them all.
              </li>
              <li>
                <span className="text-white font-medium">Your birthday is in π</span>
                <br />
                It is widely believed (though unproven) that π is "normal" — meaning every finite sequence of digits appears somewhere. Your birthday, phone number, and every other number is likely hiding in there.
              </li>
              <li>
                <span className="text-white font-medium">Ancient origins</span>
                <br />
                The Babylonians approximated π as 3.125 nearly 4,000 years ago. Archimedes (~250 BC) was the first to rigorously bound it between 3 10/71 and 3 1/7.
              </li>
              <li>
                <span className="text-white font-medium">Pi Day</span>
                <br />
                March 14 (3/14) was officially recognized as Pi Day by the U.S. House of Representatives in 2009. It also happens to be Albert Einstein's birthday.
              </li>
              <li>
                <span className="text-white font-medium">Memorization record</span>
                <br />
                Rajveer Meena holds the Guinness World Record for reciting 70,000 digits of π from memory, taking nearly 10 hours.
              </li>
              <li>
                <span className="text-white font-medium">π in nature</span>
                <br />
                π appears in the physics of waves, pendulums, rivers (a river's meandering length averages π times its straight-line distance), and even in the equations governing the universe.
              </li>
              <li>
                <span className="text-white font-medium">The "3." is special</span>
                <br />
                Only 39 digits of π are needed to calculate the circumference of the observable universe to the accuracy of a single hydrogen atom.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ---- Pi digits — fills remaining viewport ---- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="text-base md:text-lg leading-relaxed break-all tracking-wide">
          <span className="text-2xl md:text-3xl text-white font-bold">
            3.
          </span>
          {renderDigits()}
          <span className="animate-blink text-amber-400 ml-0.5">│</span>
        </div>
        {exhausted && (
          <p className="text-gray-600 text-sm mt-4 text-center">
            All {piDecimals.length.toLocaleString()} computed digits revealed.
            More on the way!
          </p>
        )}
      </div>

      {/* ---- Result modal ---- */}
      {resultModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setResultModal(null)}
        >
          <div
            className="relative bg-[#111] border border-white/[0.08] rounded-2xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setResultModal(null)}
              className="absolute top-3 right-4 text-gray-600 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
            <div className="text-4xl mb-3">
              {resultModal.type === "guess-correct" && "🎉"}
              {resultModal.type === "guess-wrong" && "🤔"}
              {resultModal.type === "search-found" && "✅"}
              {resultModal.type === "search-not-found" && "🔍"}
            </div>
            <p
              className={`text-base font-semibold mb-1 ${
                resultModal.type === "guess-correct"
                  ? "text-emerald-400"
                  : resultModal.type === "search-found"
                  ? "text-emerald-400"
                  : resultModal.type === "guess-wrong"
                  ? "text-amber-400"
                  : "text-gray-400"
              }`}
            >
              {resultModal.message}
            </p>
            {resultModal.sub && (
              <p className="text-sm text-gray-500">{resultModal.sub}</p>
            )}
            {(resultModal.type === "search-found") && searchQuery && (
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/?find=${searchQuery}`;
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="mt-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <>✓ Link copied!</>
                ) : (
                  <>📋 Share this result</>
                )}
              </button>
            )}
            <div>
              <button
                onClick={() => setResultModal(null)}
                className="mt-3 bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Confetti ---- */}
      {showConfetti && (
        <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: [
                  "#f59e0b",
                  "#10b981",
                  "#3b82f6",
                  "#ef4444",
                  "#a855f7",
                  "#ec4899",
                ][i % 6],
              }}
            />
          ))}
        </div>
      )}

      {/* ---- Footer: Search + Predict ---- */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0a0a] px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="flex gap-2 items-center flex-1">
            <span className="text-xs text-gray-600 hidden md:block whitespace-nowrap">
              Find your number in π
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Birthday, anniversary… e.g. 0314"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value.replace(/\D/g, ""));
                setSearchResult(null);
                setSearchNotFound(false);
                setHighlightRange(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-colors"
              maxLength={20}
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery}
              className="bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-white/[0.06] mx-1" />

          {/* Predict next digit */}
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-600 hidden md:block whitespace-nowrap">
              Predict next
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, d) => (
                <button
                  key={d}
                  onClick={() => {
                    setGuessInput(String(d));
                  }}
                  className={`w-7 h-8 rounded text-sm font-semibold transition-colors ${
                    guessInput === String(d)
                      ? "bg-amber-400 text-black"
                      : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              onClick={handleGuess}
              disabled={!guessInput}
              className="bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Guess
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
