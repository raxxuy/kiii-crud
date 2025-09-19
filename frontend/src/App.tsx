import { useEffect, useMemo, useState } from "react";
import { combineColors } from "./utils";
import type { ColorWheelEntry, SelectedColor } from "./types";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [colorWheelEntries, setColorWheelEntries] = useState<ColorWheelEntry[]>(
    []
  );

  // Fetch initial data
  useEffect(() => {
    fetch(`${API_URL}/api/selected-colors/`)
      .then((res) => res.json())
      .then((data) => setSelectedColors(data))
      .catch((err) => console.error("Error fetching colors:", err));

    fetch(`${API_URL}/api/color-wheel/`)
      .then((res) => res.json())
      .then((data) => setColorWheelEntries(data))
      .catch((err) => console.error("Error fetching color wheel:", err));
  }, []);

  // Re-calculate the combined color only when selectedColors changes
  const combinedColor = useMemo(
    () => combineColors(selectedColors),
    [selectedColors]
  );

  // Add to selected colors
  const addToSelected = async (color: ColorWheelEntry) => {
    try {
      const res = await fetch(`${API_URL}/api/selected-colors/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hex: color.hex }),
      });
      if (res.ok) {
        const newColor = await res.json();
        setSelectedColors((prev) => [...prev, newColor]);
      }
    } catch (err) {
      console.error("Error adding selected color:", err);
    }
  };

  // Add back to color wheel
  const addToColorWheel = async (color: SelectedColor) => {
    try {
      const res = await fetch(`${API_URL}/api/color-wheel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hex: color.hex }),
      });
      if (res.ok) {
        const newColor = await res.json();
        setColorWheelEntries((prev) => [...prev, newColor]);
      }
    } catch (err) {
      console.error("Error adding color wheel entry:", err);
    }
  };

  // Add combined color to wheel
  const addCombinedToWheel = async () => {
    if (!combinedColor) return;
    try {
      const res = await fetch(`${API_URL}/api/color-wheel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hex: combinedColor }),
      });
      if (res.ok) {
        const newColor = await res.json();
        setColorWheelEntries((prev) => [...prev, newColor]);
      }
    } catch (err) {
      console.error("Error adding combined color:", err);
    }
  };

  // Remove selected color
  const removeSelected = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/selected-colors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedColors((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error removing selected color:", err);
    }
  };

  // Remove color wheel entry
  const removeColorWheel = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/color-wheel/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setColorWheelEntries((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error removing color wheel entry:", err);
    }
  };

  // Bulk delete all selected colors
  const removeAllSelected = async () => {
    try {
      const res = await fetch(`${API_URL}/api/selected-colors/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedColors([]); // clear local state
      }
    } catch (err) {
      console.error("Error removing all selected colors:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Color Mixer
            </h1>
            <p className="text-sm text-gray-500">
              Blend selected colors and build a wheel.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Selected:</span>{" "}
            {selectedColors.length}
            <span className="mx-2">•</span>
            <span className="font-medium text-gray-700">Wheel:</span>{" "}
            {colorWheelEntries.length}
          </div>
        </div>

        {/* Combined color card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center gap-4">
            <div
              className="w-64 h-64 rounded-full ring-1 ring-gray-200 shadow-inner"
              style={{ backgroundColor: combinedColor }}
              aria-label="Combined color preview"
              title={combinedColor}
            ></div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Combined</span>
              <span className="px-2 py-1 rounded-md bg-gray-100 font-mono text-sm text-gray-800 border border-gray-200">
                {combinedColor}
              </span>
            </div>
            <button
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                selectedColors.length === 0
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={addCombinedToWheel}
              disabled={selectedColors.length === 0}
            >
              Add Combined Color to Wheel
            </button>
          </div>

          {/* Selected colors card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">
                Selected Colors
              </h2>
              <button
                className={`px-3 py-1.5 rounded-md text-white text-sm transition-colors ${
                  selectedColors.length === 0
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={removeAllSelected}
                disabled={selectedColors.length === 0}
              >
                Remove All
              </button>
            </div>
            {selectedColors.length === 0 ? (
              <div className="text-sm text-gray-500">
                No selected colors yet. Tap a color from the wheel.
              </div>
            ) : (
              <ul className="grid grid-cols-10 gap-2">
                {selectedColors.map((color) => (
                  <li
                    key={color.id}
                    className="relative w-10 h-10 rounded-md border border-gray-200 cursor-pointer ring-1 ring-black/10 hover:ring-black/20 transition"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => addToColorWheel(color)}
                    title={color.hex}
                  >
                    <button
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white/95 border border-gray-300 rounded-full text-[10px] leading-none flex items-center justify-center shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelected(color.id);
                      }}
                      aria-label="Remove selected color"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Color Wheel card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Color Wheel
          </h2>
          {colorWheelEntries.length === 0 ? (
            <div className="text-sm text-gray-500">
              No colors in the wheel yet.
            </div>
          ) : (
            <ul className="grid grid-cols-12 gap-2">
              {colorWheelEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="relative w-10 h-10 rounded-md border border-gray-200 cursor-pointer ring-1 ring-black/10 hover:ring-black/20 transition"
                  style={{ backgroundColor: entry.hex }}
                  onClick={() => addToSelected(entry)}
                  title={entry.hex}
                >
                  {entry.removable && (
                    <button
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white/95 border border-gray-300 rounded-full text-[10px] leading-none flex items-center justify-center shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColorWheel(entry.id);
                      }}
                      aria-label="Remove color wheel entry"
                    >
                      x
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
