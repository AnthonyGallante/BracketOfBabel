import React from "react";
import {
  buildMastodonShareUrl,
  normalizeMastodonHost,
  shareViaEmail,
  shareToFacebook,
  shareToLinkedIn,
  shareToReddit,
  shareToX,
} from "./bracketUtils.js";

const SHARE_BTN =
  "rounded border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

/**
 * Copy link + share to social platforms and email.
 * Mastodon opens a dialog so users can enter their home server (federated).
 */
export default function SharePanel({ bracketUrl, bracketId, championName }) {
  const [toast, setToast] = React.useState(null);
  const [mastodonOpen, setMastodonOpen] = React.useState(false);
  const [mastodonHost, setMastodonHost] = React.useState("mastodon.social");
  const [mastodonError, setMastodonError] = React.useState(false);
  const mastodonInputRef = React.useRef(null);

  const shareText = React.useMemo(
    () => `Bracket ${bracketId} — ${championName} champion\n${bracketUrl}`,
    [bracketId, championName, bracketUrl],
  );

  const tweetText = React.useMemo(
    () => `Bracket ${bracketId} — ${championName} champion`,
    [bracketId, championName],
  );

  const redditTitle = React.useMemo(
    () => `Bracket ${bracketId} | Champion: ${championName}`,
    [bracketId, championName],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bracketUrl);
      setToast("Copied link");
    } catch {
      setToast("Copy failed");
    } finally {
      setTimeout(() => setToast(null), 1600);
    }
  };

  const openEmail = () => {
    window.location.href = shareViaEmail({
      subject: `Bracket ${bracketId} | Bracket Archive`,
      body: `Check out this bracket:\n${bracketUrl}\n\nChampion: ${championName}\n`,
    });
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openMastodonShare = () => {
    const url = buildMastodonShareUrl(mastodonHost, shareText);
    if (!url || !normalizeMastodonHost(mastodonHost)) {
      setMastodonError(true);
      return;
    }
    setMastodonError(false);
    openInNewTab(url);
    setMastodonOpen(false);
  };

  React.useEffect(() => {
    if (!mastodonOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMastodonOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mastodonInputRef.current?.focus();
    mastodonInputRef.current?.select();
    return () => window.removeEventListener("keydown", onKey);
  }, [mastodonOpen]);

  return (
    <>
      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={SHARE_BTN}
            onClick={copyLink}
            aria-label="Copy bracket link to clipboard"
            title="Copy the page URL for this bracket"
          >
            Copy link
          </button>
          {toast && (
            <div className="font-mono text-xs text-[var(--accent)]" aria-live="polite">
              {toast}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={SHARE_BTN}
            onClick={openEmail}
            aria-label="Share via email"
            title="Open your email app with a pre-filled message"
          >
            Share via email
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToFacebook(bracketUrl))}
            aria-label="Share to Facebook"
            title="Share this bracket on Facebook"
          >
            Share to Facebook
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToLinkedIn(bracketUrl))}
            aria-label="Share to LinkedIn"
            title="Share this bracket on LinkedIn"
          >
            Share to LinkedIn
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => {
              setMastodonError(false);
              setMastodonOpen(true);
            }}
            aria-label="Share to Mastodon"
            title="Share on your Mastodon server"
          >
            Share to Mastodon
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToX(bracketUrl, tweetText))}
            aria-label="Share to X"
            title="Post this bracket on X"
          >
            Share to X
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToReddit(bracketUrl, redditTitle))}
            aria-label="Share to Reddit"
            title="Submit this bracket to Reddit"
          >
            Share to Reddit
          </button>
        </div>
      </div>

      {mastodonOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close Mastodon dialog"
            onClick={() => setMastodonOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mastodon-share-title"
            className="relative z-[101] w-full max-w-md rounded border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg"
          >
            <h2 id="mastodon-share-title" className="text-sm font-semibold text-[var(--text)]">
              Share on Mastodon
            </h2>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Enter your server&apos;s hostname (domain only, no <code className="font-mono">@</code>{" "}
              username). Example: <span className="font-mono">mastodon.social</span> or{" "}
              <span className="font-mono">fosstodon.org</span>.
            </p>
            <label htmlFor="mastodon-host" className="mt-3 block text-xs text-[var(--text-muted)]">
              Mastodon server
            </label>
            <input
              id="mastodon-host"
              ref={mastodonInputRef}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={mastodonHost}
              onChange={(e) => {
                setMastodonHost(e.target.value);
                setMastodonError(false);
              }}
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="mastodon.social"
            />
            {mastodonError && (
              <p className="mt-2 text-xs text-[var(--danger)]" role="alert">
                Please enter a valid server hostname.
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={SHARE_BTN}
                onClick={() => setMastodonOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={SHARE_BTN}
                onClick={openMastodonShare}
              >
                Open share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
