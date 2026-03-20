import React from "react";
import { useParams } from "react-router-dom";
import { apiGetJson } from "../config/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import BracketViewer from "../components/BracketViewer.jsx";
import { setDocumentMeta } from "../utils/meta.js";

export default function BracketPage() {
  const { id } = useParams();
  const [state, setState] = React.useState({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setState({ status: "loading" });
        const [bracket, prob] = await Promise.all([
          apiGetJson(`/api/bracket/${id}/`),
          apiGetJson(`/api/bracket/${id}/probability/`),
        ]);

        if (cancelled) return;
        setState({ status: "ready", bracket, prob });
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", error: e.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Must run unconditionally (Rules of Hooks); only updates document when data is ready.
  React.useEffect(() => {
    if (state.status !== "ready") return;
    const { bracket } = state;
    const championName = bracket?.champion?.name ?? "Unknown";
    const title = `Bracket ${bracket.id} | Bracket Archive`;
    const description = `Bracket ${bracket.id}. Champion: ${championName}. Tournament bracket record from the 63-bit archive.`;
    setDocumentMeta({
      title,
      description,
      ogTitle: title,
      ogDescription: description,
      ogUrl: window.location.href,
      twitterTitle: title,
      twitterDescription: description,
    });
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <LoadingSpinner label="Loading bracket" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-[var(--danger)]">
        {state.error}
      </div>
    );
  }

  const { bracket, prob } = state;

  return <BracketViewer bracket={bracket} probability={prob} />;
}

