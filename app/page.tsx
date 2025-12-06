"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const WalkMap = dynamic(() => import("../components/WalkMap"), {
  ssr: false,
});

type WalkResult = {
  start: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  distanceMiles: number;
  googleMapsUrl: string;
};

export default function Home() {
  const [distance, setDistance] = useState(0.75);
  const [result, setResult] = useState<WalkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateWalk() {
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate-walk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance }),
      });

      if (!response.ok) {
        throw new Error("Server error generating walk.");
      }

      const data = (await response.json()) as WalkResult;
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-6">
      <main className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Random Walk Point Generator
        </h1>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Generates a random point within{" "}
          <span className="font-semibold">0.5–1 mile</span> of a fixed starting
          location in Providence, RI, and shows it on the map.
        </p>

        {/* Distance Slider */}
        <div className="flex flex-col gap-2">
          <label className="text-zinc-700 dark:text-zinc-300 font-medium">
            Distance (miles): {distance.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>0.50 mi</span>
            <span>1.00 mi</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateWalk}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-black dark:bg-zinc-200 text-white dark:text-black font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Walk"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 font-medium bg-red-100 dark:bg-red-900/40 p-3 rounded">
            {error}
          </div>
        )}

        {/* Map + Google Maps link */}
        {result && (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                Approx. distance:{" "}
                <span className="font-medium">
                  {result.distanceMiles.toFixed(2)} miles
                </span>
              </p>

              <a
                href={result.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 underline"
              >
                Open destination in Google Maps
              </a>
            </div>

            <WalkMap start={result.start} destination={result.destination} />
          </div>
        )}
      </main>
    </div>
  );
}
