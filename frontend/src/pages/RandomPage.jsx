import React from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { TOTAL_BRACKET_COUNT } from "../engine/bracketEngine.js";

function randomBigIntBelow(upperExclusive) {
  // Generates uniformly in [0, upperExclusive) using 63 bits masking.
  if (upperExclusive !== 1n << 63n) {
    // For now, only supports the known bracket range.
    throw new Error("randomBigIntBelow expects 2^63");
  }
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  let id = 0n;
  for (const b of bytes) id = (id << 8n) + BigInt(b);

  // Keep only lower 63 bits.
  const mask = (1n << 63n) - 1n;
  return id & mask;
}

export default function RandomPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // TOTAL_BRACKET_COUNT is 2^63, i.e. the upper exclusive bound.
    const id = randomBigIntBelow(TOTAL_BRACKET_COUNT);
    navigate(`/bracket/${id.toString()}`);
  }, [navigate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <LoadingSpinner label="Selecting random bracket" />
    </div>
  );
}

