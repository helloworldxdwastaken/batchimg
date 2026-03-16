"use client";

import { useState, useEffect } from "react";

export default function PromptEditor() {
  const [template, setTemplate] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prompt-template")
      .then((res) => res.json())
      .then((data) => {
        setTemplate(data.template);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await fetch("/api/prompt-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-white mb-3">Prompt Template</h2>
      <p className="text-sm text-gray-400 mb-4">
        This template is used for every country. Available placeholders:
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {["{{country}}", "{{landmark}}", "{{icon}}", "{{region}}", "{{code}}", "{{lighting}}"].map((p) => (
          <code
            key={p}
            className="px-2 py-1 bg-gray-800 text-blue-400 text-xs rounded cursor-pointer hover:bg-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(p);
            }}
            title="Click to copy"
          >
            {p}
          </code>
        ))}
      </div>

      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        rows={10}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-y"
      />

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={save}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Save Template
        </button>
        {saved && <span className="text-green-400 text-sm">Saved!</span>}
      </div>

      {/* Preview */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Preview (Japan):</h3>
        <pre className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 whitespace-pre-wrap">
          {template
            .replace(/\{\{country\}\}/g, "Japan")
            .replace(/\{\{landmark\}\}/g, "Mount Fuji with cherry blossoms")
            .replace(/\{\{icon\}\}/g, "torii gate")
            .replace(/\{\{region\}\}/g, "Asia")
            .replace(/\{\{code\}\}/g, "JP")
            .replace(/\{\{lighting\}\}/g, "Golden hour warm sunset lighting with long soft shadows and orange-pink sky.")}
        </pre>
      </div>
    </div>
  );
}
