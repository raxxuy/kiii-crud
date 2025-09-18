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
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      {/* Combined color display */}
      <div
        className="w-112 h-112 rounded-full border border-gray-400"
        style={{ backgroundColor: combinedColor }}
      ></div>

      {/* Button to add combined color */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addCombinedToWheel}
      >
        Add Combined Color to Wheel
      </button>

      {/* Remove all button */}
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4"
        onClick={removeAllSelected}
      >
        Remove All Selected Colors
      </button>

      {/* Selected colors */}
      <h1>Selected Colors</h1>
      <ul className="flex gap-2 flex-wrap justify-center">
        {selectedColors.map((color) => (
          <li
            key={color.id}
            className="relative w-8 h-8 border border-gray-300 cursor-pointer"
            style={{ backgroundColor: color.hex }}
            onClick={() => addToColorWheel(color)}
          >
            {color && (
              <button
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border rounded-full text-xs flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelected(color.id);
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Color wheel entries */}
      <h1>Color Wheel</h1>
      <ul className="flex gap-2 flex-wrap justify-center">
        {colorWheelEntries.map((entry) => (
          <li
            key={entry.id}
            className="relative w-8 h-8 border border-gray-300 cursor-pointer"
            style={{ backgroundColor: entry.hex }}
            onClick={() => addToSelected(entry)}
          >
            {entry.removable && (
              <button
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border rounded-full text-xs flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  removeColorWheel(entry.id);
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
