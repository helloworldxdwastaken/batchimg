"use client";

import { useState } from "react";
import { BatchProgress } from "@/types";

interface BatchControlsProps {
  progress: BatchProgress | null;
  stats: {
    total: number;
    done: number;
    failed: number;
    pending: number;
    generating: number;
  };
  onStart: (force: boolean) => void;
  onCancel: () => void;
}

export default function BatchControls({ progress, stats, onStart, onCancel }: BatchControlsProps) {
  const [force, setForce] = useState(false);
  const isRunning = progress?.running === true;
  const pct = progress && progress.total > 0
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button
              onClick={() => onStart(force)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Batch
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              disabled={isRunning}
              className="rounded border-gray-600"
            />
            Force re-generate all
          </label>
        </div>

        {isRunning && progress && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">
              Generating: <span className="text-white font-medium">{progress.current}</span>
            </span>
            <span className="text-green-400">{progress.completed} done</span>
            {progress.failed > 0 && (
              <span className="text-red-400">{progress.failed} failed</span>
            )}
            <span className="text-gray-400">
              {progress.completed + progress.failed}/{progress.total}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isRunning && progress && progress.total > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{pct}% complete</p>
        </div>
      )}
    </div>
  );
}
