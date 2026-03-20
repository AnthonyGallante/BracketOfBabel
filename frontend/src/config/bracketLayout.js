// bracketLayout.js
//
// Layout profile for region placement in the traditional bracket view.
// Update this file (not JSX) if a future season uses a different orientation.

export const BRACKET_LAYOUT_PROFILE_2025 = {
  // Grid slot semantics:
  // - topLeft / topRight / bottomLeft / bottomRight correspond to the
  //   four regional quadrants surrounding the center championship column.
  topLeft: "East",
  topRight: "West",
  bottomLeft: "South",
  bottomRight: "Midwest",
};

// Active profile used by the viewer.
export const ACTIVE_BRACKET_LAYOUT_PROFILE = BRACKET_LAYOUT_PROFILE_2025;

