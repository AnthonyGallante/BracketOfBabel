import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppHeaderNav from "./components/AppHeaderNav.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import BracketPage from "./pages/BracketPage.jsx";
import RandomPage from "./pages/RandomPage.jsx";
import FindPage from "./pages/FindPage.jsx";
import RemainingBracketsPage from "./pages/RemainingBracketsPage.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <AppHeaderNav />
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/bracket/:id" element={<BracketPage />} />
        <Route path="/random" element={<RandomPage />} />
        <Route path="/find" element={<FindPage />} />
        <Route path="/remaining" element={<RemainingBracketsPage />} />
        <Route path="/about" element={<About />} />

        {/* Back-compat / default route */}
        <Route path="/api/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

