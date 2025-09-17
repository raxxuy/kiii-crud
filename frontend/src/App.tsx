import { useEffect, useState } from "react";
import type { SelectedColor } from "./types";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/selected-colors/`)
      .then((res) => res.json())
      .then((data) => setSelectedColors(data))
      .catch((err) => console.error("Error fetching colors:", err));
  }, []);

  return (
    <div>
      <h1>Selected Colors</h1>
      <ul>
        {selectedColors.map((color) => (
          <li key={color.id}>
            {color.hex} {color.custom ? "(custom)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
