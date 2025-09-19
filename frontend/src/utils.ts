import type { SelectedColor } from "./types";

export const combineColors = (colors: SelectedColor[]): string => {
  if (colors.length === 0) {
    return "#CCCCCC";
  }

  const srgbToLinear = (c: number): number => {
    const cs = c / 255;
    return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };

  const linearToSrgb = (c: number): number => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    const n = Math.round(Math.min(1, Math.max(0, v)) * 255);
    return n;
  };

  // Sum linear-light RGB components
  const combined = { r: 0, g: 0, b: 0 };

  // Convert hex to RGB and sum the values
  colors.forEach((color: SelectedColor) => {
    const hex = color.hex.startsWith("#") ? color.hex.slice(1) : color.hex;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    combined.r += srgbToLinear(r);
    combined.g += srgbToLinear(g);
    combined.b += srgbToLinear(b);
  });

  const avgR = combined.r / colors.length;
  const avgG = combined.g / colors.length;
  const avgB = combined.b / colors.length;

  const toHex = (n: number) => {
    const h = n.toString(16);
    return h.length === 1 ? "0" + h : h;
  };

  const outR = linearToSrgb(avgR);
  const outG = linearToSrgb(avgG);
  const outB = linearToSrgb(avgB);

  return `#${toHex(outR)}${toHex(outG)}${toHex(outB)}`;
};
