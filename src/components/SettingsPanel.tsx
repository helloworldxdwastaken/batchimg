"use client";

import { useState, useEffect } from "react";

export default function SettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);
  const [overridePreview, setOverridePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHasEnvKey(data.hasEnvKey);
        setHasOverride(data.hasOverride);
        setOverridePreview(data.overridePreview);
      });
  }, []);

  const save = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Refresh status
      const res = await fetch("/api/settings");
      const data = await res.json();
      setHasOverride(data.hasOverride);
      setOverridePreview(data.overridePreview);
      setApiKey("");
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const clear = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: null }),
      });
      setHasOverride(false);
      setOverridePreview(null);
    } catch (err) {
      console.error("Failed to clear override:", err);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-white mb-3">Settings</h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">API Key Status</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${hasEnvKey ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-gray-400">
                .env.local: {hasEnvKey ? "Configured" : "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${hasOverride ? "bg-blue-500" : "bg-gray-600"}`} />
              <span className="text-gray-400">
                Override: {hasOverride ? overridePreview : "None"}
              </span>
              {hasOverride && (
                <button
                  onClick={clear}
                  className="text-xs text-red-400 hover:text-red-300 ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Override Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            API Key Override (session only, not saved to disk)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={save}
              disabled={!apiKey}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Set
            </button>
          </div>
          {saved && <span className="text-green-400 text-xs mt-1">Key set!</span>}
        </div>
      </div>
    </div>
  );
}
