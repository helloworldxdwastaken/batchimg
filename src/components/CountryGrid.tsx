"use client";

import { useState, useMemo } from "react";
import { CountryWithState } from "@/types";
import CountryCard from "./CountryCard";

interface CountryGridProps {
  countries: CountryWithState[];
  onGenerate: (slug: string, force: boolean) => void;
  onView: (country: CountryWithState) => void;
  onRefresh: () => void;
}

const REGIONS = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
const STATUSES = ["All", "pending", "generating", "done", "failed"] as const;

export default function CountryGrid({ countries, onGenerate, onView, onRefresh }: CountryGridProps) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (regionFilter !== "All" && c.region !== regionFilter) return false;
      if (statusFilter !== "All" && c.state.status !== statusFilter) return false;
      return true;
    });
  }, [countries, search, regionFilter, statusFilter]);

  const uploadReference = async (slug: string, file: File) => {
    const formData = new FormData();
    formData.append("country", slug);
    formData.append("image", file);
    try {
      await fetch("/api/reference-image", { method: "POST", body: formData });
      onRefresh();
    } catch (err) {
      console.error("Failed to upload reference:", err);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search countries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
        />

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s === "All" ? "All Statuses" : s}</option>
          ))}
        </select>

        <span className="text-sm text-gray-500 self-center">
          {filtered.length} of {countries.length} countries
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((country) => (
          <CountryCard
            key={country.slug}
            country={country}
            onGenerate={onGenerate}
            onView={onView}
            onUploadRef={uploadReference}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No countries match your filters.</p>
      )}
    </div>
  );
}
