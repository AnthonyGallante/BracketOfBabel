import React from "react";
import { useNavigate } from "react-router-dom";
import { formatInteger } from "./bracket/bracketUtils.js";
import { parseBoundedBigInt, sanitizeDigits } from "../utils/numericInput.js";

export default function Pagination({
  currentPage,
  totalPages,
  queryKey = "page",
  basePath = "/browse",
  ariaLabel = "Pagination",
}) {
  // BigInt-only pagination. Never cast pages to Number.
  const navigate = useNavigate();
  const [input, setInput] = React.useState(currentPage.toString());

  React.useEffect(() => {
    setInput(currentPage.toString());
  }, [currentPage]);

  const go = (pageBig) => {
    navigate(`${basePath}?${queryKey}=${pageBig.toString()}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const parsed = parseBoundedBigInt(input, { min: 0n, max: totalPages - 1n });
    if (parsed === null) return;
    go(parsed);
  };

  const goRandom = () => {
    // Uniform random page in [0, totalPages) using rejection sampling.
    if (totalPages <= 1n) {
      go(0n);
      return;
    }

    const bitsNeeded = totalPages.toString(2).length;
    const bytesNeeded = Math.ceil(bitsNeeded / 8);
    const maxMask = (1n << BigInt(bitsNeeded)) - 1n;

    let candidate = 0n;
    do {
      const bytes = new Uint8Array(bytesNeeded);
      crypto.getRandomValues(bytes);
      candidate = 0n;
      for (const b of bytes) candidate = (candidate << 8n) + BigInt(b);
      candidate &= maxMask;
    } while (candidate >= totalPages);

    go(candidate);
  };

  return (
    <div className="flex flex-col items-center gap-3 border-t border-[var(--border)] pt-4">
      <div className="text-sm text-[var(--text-muted)]" aria-label={ariaLabel}>
        Page {formatInteger(currentPage)} of {formatInteger(totalPages)}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
          onClick={() => go(0n)}
          aria-label="First Page"
        >
          First Page
        </button>

        <button
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
          onClick={() => go(currentPage - 1n)}
          disabled={currentPage <= 0n}
          aria-label="Previous Page"
        >
          Previous
        </button>

        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(sanitizeDigits(e.target.value))}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              if (e.key.length === 1 && !/\d/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text");
              setInput((prev) => `${prev}${sanitizeDigits(text)}`);
            }}
            onDrop={(e) => e.preventDefault()}
            className="w-40 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm outline-none"
            aria-label="Page number input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <button
            type="submit"
            className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
            aria-label="Go to page"
          >
            Go
          </button>
        </form>

        <button
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] disabled:opacity-50"
          onClick={() => go(currentPage + 1n)}
          disabled={currentPage + 1n >= totalPages}
          aria-label="Next Page"
        >
          Next
        </button>

        <button
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
          onClick={() => go(totalPages - 1n)}
          aria-label="Last Page"
        >
          Last Page
        </button>

        <button
          className="rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
          onClick={goRandom}
          aria-label="Random Page"
        >
          Random Page
        </button>
      </div>
    </div>
  );
}

