"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CountryWithState, BatchProgress } from "@/types";
import CountryGrid from "@/components/CountryGrid";
import BatchControls from "@/components/BatchControls";
import PromptEditor from "@/components/PromptEditor";
import SettingsPanel from "@/components/SettingsPanel";
import ImageViewer from "@/components/ImageViewer";

export default function Home() {
  const [countries, setCountries] = useState<CountryWithState[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithState | null>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "prompt" | "settings">("grid");
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch("/api/countries");
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const subscribeToSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/batch");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const progress: BatchProgress = JSON.parse(event.data);
      setBatchProgress(progress);

      if (!progress.running) {
        es.close();
        eventSourceRef.current = null;
        fetchCountries();
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      // Fallback: poll countries
      fetchCountries();
    };
  }, [fetchCountries]);

  const startBatch = async (force: boolean) => {
    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });

      if (res.ok) {
        subscribeToSSE();
        // Poll countries periodically during batch
        const interval = setInterval(async () => {
          await fetchCountries();
          const progress = batchProgress;
          if (progress && !progress.running) {
            clearInterval(interval);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to start batch:", err);
    }
  };

  const cancelBatch = async () => {
    try {
      await fetch("/api/batch-cancel", { method: "POST" });
    } catch (err) {
      console.error("Failed to cancel batch:", err);
    }
  };

  const generateOne = async (slug: string, force: boolean = true) => {
    try {
      // Optimistic update
      setCountries((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, state: { ...c.state, status: "generating" } } : c
        )
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: slug, force }),
      });

      await res.json();
      await fetchCountries();
    } catch (err) {
      console.error("Failed to generate:", err);
      await fetchCountries();
    }
  };

  const stats = {
    total: countries.length,
    done: countries.filter((c) => c.state.status === "done").length,
    failed: countries.filter((c) => c.state.status === "failed").length,
    pending: countries.filter((c) => c.state.status === "pending").length,
    generating: countries.filter((c) => c.state.status === "generating").length,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">BatchImg</h1>
          <p className="text-gray-400 text-sm mt-1">
            Country Image Generator — {stats.done}/{stats.total} generated
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 bg-green-900/40 text-green-400 rounded">
            {stats.done} done
          </span>
          <span className="px-2 py-1 bg-red-900/40 text-red-400 rounded">
            {stats.failed} failed
          </span>
          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded">
            {stats.pending} pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {(["grid", "prompt", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "grid" ? "Countries" : tab}
          </button>
        ))}
      </div>

      {/* Batch Controls */}
      {activeTab === "grid" && (
        <BatchControls
          progress={batchProgress}
          stats={stats}
          onStart={startBatch}
          onCancel={cancelBatch}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {activeTab === "grid" && (
            <CountryGrid
              countries={countries}
              onGenerate={generateOne}
              onView={setSelectedCountry}
              onRefresh={fetchCountries}
            />
          )}
          {activeTab === "prompt" && <PromptEditor />}
          {activeTab === "settings" && <SettingsPanel />}
        </>
      )}

      {/* Image Viewer Modal */}
      {selectedCountry && (
        <ImageViewer
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onRegenerate={(slug) => {
            generateOne(slug, true);
            setSelectedCountry(null);
          }}
        />
      )}
    </div>
  );
}
