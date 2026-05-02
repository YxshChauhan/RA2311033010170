"use client";

const FILTERS = ["All", "Event", "Result", "Placement"];

export default function Filters({ active, onChange, counts }) {
  return (
    <div className="filters-bar">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`filter-btn filter-${f.toLowerCase()}${active === f ? " active" : ""}`}
          onClick={() => onChange(f)}
        >
          <span className="filter-label">{f}</span>
          {counts[f] !== undefined && (
            <span className="filter-count">{counts[f]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
