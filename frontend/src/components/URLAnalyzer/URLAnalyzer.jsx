import { useState } from "react";

function URLAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL to analyze");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Invalid URL format");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/url-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("URL scanning feature not yet available on backend");
        }
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing URL:", error);
      setError(error.message || "Failed to analyze URL");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  const parseURL = (urlString) => {
    try {
      const urlObj = new URL(urlString);
      return {
        protocol: urlObj.protocol,
        domain: urlObj.hostname,
        path: urlObj.pathname,
        full: urlString,
      };
    } catch {
      return null;
    }
  };

  const urlParts = url ? parseURL(url) : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-green-400 mb-2">
          URL Analyzer 🔗
        </h2>
        <p className="text-gray-400">
          Analyze URLs for suspicious patterns and phishing indicators
        </p>
      </div>

      <div className="bg-gray-900 p-7 rounded-xl border border-gray-700 shadow-xl">
        <label className="block text-gray-300 font-semibold mb-3">
          Enter URL to analyze:
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/path"
          className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
          onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
        />

        {urlParts && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
            <p>
              <span className="text-gray-400">Protocol:</span> {urlParts.protocol} | 
              <span className="text-gray-400"> Domain:</span> {urlParts.domain}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>🔍 Analyze URL</>
            )}
          </button>

          <button
            onClick={handleClear}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-yellow-900/30 border border-yellow-600 p-4 rounded-lg">
          <p className="text-yellow-200 flex items-center gap-2">
            <span>ℹ️</span>
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="bg-gray-900 p-7 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`inline-block px-6 py-3 rounded-full font-bold text-xl ${
                  result.risk === "MALICIOUS"
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {result.risk === "MALICIOUS" ? "🚨" : "✅"} {result.risk}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
              <p className="text-gray-300 text-sm font-semibold mb-2">
                Analysis Details:
              </p>
              <p className="text-gray-300 leading-relaxed">{result.reason}</p>
            </div>

            {result.details && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 text-sm font-semibold mb-3">
                  Additional Checks:
                </p>
                <ul className="space-y-2">
                  {Object.entries(result.details).map(([key, value]) => (
                    <li key={key} className="text-sm text-gray-400">
                      <span className="capitalize">{key}:</span> 
                      <span
                        className={`ml-2 font-semibold ${
                          value ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {value ? "⚠️ Alert" : "✓ Safe"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-blue-900/20 border border-blue-600/30 p-5 rounded-lg">
            <p className="text-blue-200 text-sm">
              <span className="font-semibold">💡 Tip:</span> Always verify URLs
              before clicking. Check the domain carefully for typos (typosquatting).
            </p>
          </div>
        </div>
      )}

      {!result && !error && url && (
        <div className="mt-6 bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-white font-semibold mb-4">URL Analysis Checks:</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>✓ Domain reputation analysis</li>
            <li>✓ Typosquatting detection</li>
            <li>✓ SSL certificate validation</li>
            <li>✓ Known phishing patterns</li>
            <li>✓ URL structure analysis</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default URLAnalyzer;
