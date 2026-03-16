"use client";

import { CountryWithState } from "@/types";

interface ImageViewerProps {
  country: CountryWithState;
  onClose: () => void;
  onRegenerate: (slug: string) => void;
}

export default function ImageViewer({ country, onClose, onRegenerate }: ImageViewerProps) {
  const imageSrc = `/generated/${country.slug}.png?t=${Date.now()}`;
  const refSrc = country.state.referenceImage;

  const download = () => {
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = `${country.slug}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">{country.name}</h2>
            <p className="text-sm text-gray-400">{country.landmark}</p>
            {country.state.generatedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Generated: {new Date(country.state.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* Images */}
        <div className="p-4">
          <div className={`grid gap-4 ${refSrc ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Generated</p>
              <img
                src={imageSrc}
                alt={country.name}
                className="w-full rounded-lg"
              />
            </div>
            {refSrc && (
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Reference</p>
                <img
                  src={refSrc}
                  alt={`${country.name} reference`}
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-800">
          <button
            onClick={() => onRegenerate(country.slug)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Re-generate
          </button>
          <button
            onClick={download}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
