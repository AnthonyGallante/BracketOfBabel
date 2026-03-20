import React from "react";
import { useSearchParams } from "react-router-dom";
import { apiGetJson } from "../config/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import BracketGrid from "../components/BracketGrid.jsx";
import { TOTAL_PAGES } from "../engine/bracketEngine.js";
import { formatInteger } from "../components/bracket/bracketUtils.js";
import "./home.css";

export default function Browse() {
  const [searchParams] = useSearchParams();
  const pageStr = searchParams.get("page") ?? "0";
  const page = (() => {
    try {
      return BigInt(pageStr);
    } catch {
      return 0n;
    }
  })();

  const [state, setState] = React.useState({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setState({ status: "loading" });
        const data = await apiGetJson(`/api/brackets/?page=${page.toString()}`);
        if (cancelled) return;
        setState({ status: "ready", stubs: data });
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", error: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <LoadingSpinner label="Loading browse page" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[var(--danger)]">
        {state.error}
      </div>
    );
  }

  const stubs = state.stubs;

  return (
    <div className="home-shell mx-auto max-w-6xl px-4 py-10">
      <div className="relative z-10 mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 text-sm text-[var(--text-muted)] backdrop-blur-sm">
        Showing up to 200 brackets for page {formatInteger(page)}.
      </div>

      <div className="relative z-10 mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <Pagination currentPage={page} totalPages={TOTAL_PAGES} />
      </div>

      <div className="relative z-10">
        <BracketGrid stubs={stubs} />
      </div>

      <div className="relative z-10 mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <Pagination currentPage={page} totalPages={TOTAL_PAGES} />
      </div>
    </div>
  );
}

