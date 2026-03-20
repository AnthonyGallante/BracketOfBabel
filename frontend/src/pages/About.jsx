import React from "react";
import { setDocumentMeta } from "../utils/meta.js";
import { formatInteger } from "../components/bracket/bracketUtils.js";
import { TOTAL_BRACKET_COUNT } from "../engine/bracketEngine.js";
import "./home.css";

export default function About() {
  React.useEffect(() => {
    const title = "About | Bracket Archive";
    const description =
      "How Bracket Archive deterministically maps every possible tournament bracket to a 63-bit integer.";
    setDocumentMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogUrl: window.location.href,
      twitterTitle: title,
      twitterDescription: description,
    });
  }, []);

  return (
    <div className="home-shell mx-auto max-w-4xl px-4 py-10">
      <div className="relative z-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-8">
        <h1 className="bg-gradient-to-br from-[var(--text)] via-[var(--accent)] to-[var(--win)] bg-clip-text font-mono text-3xl font-bold text-transparent sm:text-4xl">
          About Bracket Archive
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
          This site is inspired by{" "}
          <a
            href="https://libraryofbabel.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Library of Babel
          </a>
          : instead of storing a giant database, it deterministically indexes every possible tournament bracket
          by treating each game outcome as one binary bit (63 games total), so every bracket is a unique 63-bit
          sequence and therefore a unique integer from 0 to {formatInteger(TOTAL_BRACKET_COUNT - 1n)} (for{" "}
          {formatInteger(TOTAL_BRACKET_COUNT)} total brackets); given an ID, the app decodes those bits to
          reconstruct the full bracket on demand, and given a bracket, it can encode back to the same ID.
        </p>
      </div>
    </div>
  );
}

