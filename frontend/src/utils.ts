import type { SelectedColor } from "./types";

export const combineColors = (colors: SelectedColor[]): string => {
  if (colors.length === 0) {
    return "#CCCCCC";
  }

  // Use a map to store the sum of each color channel
  const combined = { r: 0, g: 0, b: 0 };

  // Convert hex to RGB and sum the values
  colors.forEach((color: SelectedColor) => {
    const hex = color.hex.startsWith("#") ? color.hex.slice(1) : color.hex;
    // Parse the hex strings for each color channel
    combined.r += parseInt(hex.substring(0, 2), 16);
    combined.g += parseInt(hex.substring(2, 4), 16);
    combined.b += parseInt(hex.substring(4, 6), 16);
  });

  const avgR = Math.round(combined.r / colors.length);
  const avgG = Math.round(combined.g / colors.length);
  const avgB = Math.round(combined.b / colors.length);

  const toHex = (c: number) => {
    const hex = c.toString(16);
    // Pad with a leading zero if needed
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`;
};
