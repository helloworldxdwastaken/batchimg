"use client";

import { CountryWithState } from "@/types";
import StatusBadge from "./StatusBadge";
import { useRef } from "react";

interface CountryCardProps {
  country: CountryWithState;
  onGenerate: (slug: string, force: boolean) => void;
  onView: (country: CountryWithState) => void;
  onUploadRef: (slug: string, file: File) => void;
}

export default function CountryCard({ country, onGenerate, onView, onUploadRef }: CountryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDone = country.state.status === "done";
  const isFailed = country.state.status === "failed";
  const isGenerating = country.state.status === "generating";
  const imageSrc = isDone ? `/generated/${country.slug}.png?t=${Date.now()}` : null;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors group">
      {/* Image / Placeholder */}
      <div
        className={`aspect-square relative cursor-pointer ${isDone ? "" : "flex items-center justify-center bg-gray-800/50"}`}
        onClick={() => isDone && onView(country)}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={country.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center p-3">
            <span className="text-4xl">{country.emoji}</span>
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">{country.landmark}</p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Hover overlay for done images */}
        {isDone && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">View</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-white truncate" title={country.name}>
            {country.emoji} {country.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={country.state.status} />
          <div className="flex gap-1">
            {(isFailed || isDone || country.state.status === "pending") && !isGenerating && (
              <button
                onClick={() => onGenerate(country.slug, true)}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                title={isDone ? "Re-generate" : "Generate"}
              >
                {isDone ? "Redo" : "Gen"}
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              title="Upload reference image"
            >
              Ref
            </button>
          </div>
        </div>

        {isFailed && country.state.error && (
          <p className="text-xs text-red-400 mt-1 truncate" title={country.state.error}>
            {country.state.error}
          </p>
        )}

        {country.state.referenceImage && (
          <p className="text-xs text-blue-400 mt-1">Has reference</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadRef(country.slug, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
