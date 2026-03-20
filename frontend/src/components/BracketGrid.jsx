import React from "react";
import BracketThumbnail from "./BracketThumbnail.jsx";

export default function BracketGrid({ stubs }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stubs.map((stub) => (
        <BracketThumbnail
          key={stub.id}
          id={stub.id}
          champion={stub.champion}
          bitsPreview={stub.bits_preview}
        />
      ))}
    </div>
  );
}

