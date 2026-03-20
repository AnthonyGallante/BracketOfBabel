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
  "inline-flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
const SOCIAL_ICON = "h-4 w-4 shrink-0";

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
      <div className="flex flex-col gap-3">
        <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Share
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={SHARE_BTN}
            onClick={copyLink}
            aria-label="Copy bracket link to clipboard"
            title="Copy the page URL for this bracket"
          >
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
            </svg>
            <span>Copy link</span>
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
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <span>Email</span>
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToFacebook(bracketUrl))}
            aria-label="Share to Facebook"
            title="Share this bracket on Facebook"
          >
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1z" />
            </svg>
            <span>Facebook</span>
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToLinkedIn(bracketUrl))}
            aria-label="Share to LinkedIn"
            title="Share this bracket on LinkedIn"
          >
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.5 8.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM5 10h3v9H5zM10 10h3v1.5h.04c.42-.8 1.45-1.64 2.98-1.64 3.18 0 3.76 2.1 3.76 4.83V19h-3v-3.8c0-.91-.02-2.08-1.27-2.08-1.27 0-1.47.99-1.47 2.01V19h-3z" />
            </svg>
            <span>LinkedIn</span>
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
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.94 14c-.32 1.6-2.76 3.35-5.58 3.67-1.47.17-2.92.33-4.5.25-2.58-.13-4.6-.7-4.6-.7v1.5c0 2.44 1.64 2.52 4.62 2.62 3.03.1 5.73-.75 5.73-.75l.13 2.67s-2.12 1.14-5.9 1.35c-2.08.11-4.66-.05-7.52-.8C.58 22.99 0 19.64 0 16.17V8.9C0 5.47 2.25 4.48 2.25 4.48 4.5 3.45 8.38 3 12 3h.09c3.62 0 7.5.45 9.75 1.48 0 0 2.25.99 2.25 4.42v7.27c0 1.83-.34 3.64-1.15 5.29zM18 9.5c0-1.65-1.07-2.6-2.6-2.6-1.68 0-2.52 1.08-2.52 1.08l-.54.9-.54-.9s-.84-1.08-2.52-1.08c-1.53 0-2.6.95-2.6 2.6V15h2.03V9.88c0-1.08.45-1.63 1.37-1.63 1.02 0 1.54.66 1.54 1.96v2.8h2.01v-2.8c0-1.3.52-1.96 1.54-1.96.92 0 1.37.55 1.37 1.63V15H18V9.5z" />
            </svg>
            <span>Mastodon</span>
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToX(bracketUrl, tweetText))}
            aria-label="Share to X"
            title="Post this bracket on X"
          >
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.9 3H22l-6.8 7.7L23 21h-6.2l-4.8-6.3L6.4 21H3.3l7.2-8.2L1 3h6.3l4.3 5.8L18.9 3z" />
            </svg>
            <span>X</span>
          </button>
          <button
            type="button"
            className={SHARE_BTN}
            onClick={() => openInNewTab(shareToReddit(bracketUrl, redditTitle))}
            aria-label="Share to Reddit"
            title="Submit this bracket to Reddit"
          >
            <svg className={SOCIAL_ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M14.3 13.7a1 1 0 0 0-1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6a1 1 0 1 0-1.4-1.4 1 1 0 0 1-.4.1 1 1 0 0 1-.4-.1zm-4.6 0a1 1 0 1 0-1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6a1 1 0 0 0-1.4-1.4 1 1 0 0 1-.4.1 1 1 0 0 1-.4-.1zM24 12a2.4 2.4 0 0 0-4.1-1.7 8.8 8.8 0 0 0-5.2-1.8l1-3 2.5.6a1.8 1.8 0 1 0 .4-1.9l-3-.7a1 1 0 0 0-1.2.7l-1.2 3.8a8.9 8.9 0 0 0-5.2 1.7A2.4 2.4 0 1 0 6 14.4c0 3.1 3.6 5.6 8 5.6s8-2.5 8-5.6c0-.1 0-.3-.1-.4A2.4 2.4 0 0 0 24 12z" />
            </svg>
            <span>Reddit</span>
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
