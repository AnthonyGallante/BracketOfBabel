import React from "react";
import { useSearchParams } from "react-router-dom";
import { apiGetJson } from "../config/api.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Pagination from "../components/Pagination.jsx";
import BracketGrid from "../components/BracketGrid.jsx";
import { BRACKETS_PER_PAGE, TOTAL_BRACKET_COUNT } from "../engine/bracketEngine.js";
import { formatInteger } from "../components/bracket/bracketUtils.js";
import "./home.css";

const PER_PAGE_OPTIONS = [50n, 100n, 200n];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageStr = searchParams.get("page") ?? "0";
  const perPageStr = searchParams.get("per_page") ?? "200";
  const page = (() => {
    try {
      return BigInt(pageStr);
    } catch {
      return 0n;
    }
  })();
  const perPage = (() => {
    try {
      const p = BigInt(perPageStr);
      return PER_PAGE_OPTIONS.includes(p) ? p : 200n;
    } catch {
      return 200n;
    }
  })();
  const totalPages = (TOTAL_BRACKET_COUNT - 1n) / perPage + 1n;
  const apiPage = (page * perPage) / BRACKETS_PER_PAGE;
  const offsetWithinApiPage = (page * perPage) % BRACKETS_PER_PAGE;

  const [state, setState] = React.useState({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setState({ status: "loading" });
        const data = await apiGetJson(`/api/brackets/?page=${apiPage.toString()}`);
        if (cancelled) return;
        const start = Number(offsetWithinApiPage);
        const end = start + Number(perPage);
        setState({ status: "ready", stubs: data.slice(start, end) });
      } catch (e) {
        if (cancelled) return;
        setState({ status: "error", error: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiPage, offsetWithinApiPage, perPage]);

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
      <div className="relative z-10 mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          extraQueryParams={{ per_page: perPage.toString() }}
        />
      </div>

      <div className="relative z-10">
        <BracketGrid stubs={stubs} />
      </div>

      <div className="relative z-10 mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-sm">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 border-b border-[var(--border)] pb-3">
          <span className="text-sm text-[var(--text-muted)]">Brackets per page:</span>
          {PER_PAGE_OPTIONS.map((n) => {
            const active = perPage === n;
            return (
              <button
                key={n.toString()}
                type="button"
                className={[
                  "rounded border px-3 py-1 text-sm",
                  active
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]",
                ].join(" ")}
                onClick={() => setSearchParams({ page: "0", per_page: n.toString() })}
                aria-label={`Show ${n.toString()} brackets per page`}
              >
                {formatInteger(n)}
              </button>
            );
          })}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          extraQueryParams={{ per_page: perPage.toString() }}
        />
      </div>
    </div>
  );
}

