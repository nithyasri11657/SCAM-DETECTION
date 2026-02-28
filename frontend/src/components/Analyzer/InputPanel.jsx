import { useState } from "react";

function InputPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    setCharCount(value.length);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setError("Failed to analyze text. Make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
    setCharCount(0);
  };

  const getRiskColor = (risk) => {
    if (risk === "SCAM") {
      return {
        badge: "bg-red-600 text-white",
        bar: "bg-red-500",
        text: "text-red-400",
        icon: "🚨"
      };
    }
    return {
      badge: "bg-green-600 text-white",
      bar: "bg-green-500",
      text: "text-green-400",
      icon: "✅"
    };
  };

  const confidenceLevel = result ? 
    (result.confidence > 0.8 ? "High" : result.confidence > 0.5 ? "Medium" : "Low") 
    : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-green-400 mb-2">
          Scam Message Analyzer 🔍
        </h2>
        <p className="text-gray-400">
          Detect suspicious messages using hybrid AI detection (rule-based + ML model)
        </p>
      </div>

      <div className="bg-gray-900 p-7 rounded-xl border border-gray-700 shadow-xl">
        <label className="block text-gray-300 font-semibold mb-3">
          Paste your message here:
        </label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter the message you want to analyze..."
          maxLength="2000"
          className="w-full h-40 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 resize-none"
        />

        <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
          <span>{charCount} / 2000 characters</span>
          <span className={charCount > 1900 ? "text-yellow-400" : ""}>
            {charCount > 1900 && "⚠️ Approaching limit"}
          </span>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>🔍 Analyze Text</>
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
        <div className="mt-6 bg-red-900/30 border border-red-600 p-4 rounded-lg">
          <p className="text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Risk Badge */}
          <div className="bg-gray-900 p-7 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`inline-block px-6 py-3 rounded-full font-bold text-xl ${
                  getRiskColor(result.risk).badge
                }`}
              >
                {getRiskColor(result.risk).icon} {result.risk}
              </div>
              <div>
                <p className="text-gray-400 text-sm">Confidence Level</p>
                <p className={`text-2xl font-bold ${getRiskColor(result.risk).text}`}>
                  {(result.confidence * 100).toFixed(0)}% {confidenceLevel}
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Detection Confidence</span>
                <span className="text-xs bg-gray-800 px-3 py-1 rounded text-gray-400">
                  {result.risk} Detection
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    getRiskColor(result.risk).bar
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Analysis Reason */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm font-semibold text-gray-200 mb-2">
                Analysis Details:
              </p>
              <p className="text-gray-300 leading-relaxed">
                {result.reason}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-700 text-sm text-gray-400">
            <p>
              📅 Analyzed: {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-900/20 border border-blue-600/30 p-5 rounded-lg">
            <p className="text-blue-200 text-sm">
              <span className="font-semibold">💡 Tip:</span> This tool uses AI and pattern recognition. Always apply your own judgment to suspicious messages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputPanel;