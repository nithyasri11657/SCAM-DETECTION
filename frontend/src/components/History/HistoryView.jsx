import { useState, useEffect } from "react";

function HistoryView() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, filter, searchTerm]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/v1/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history. Make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    if (filter === "scam") {
      filtered = filtered.filter((item) => item.risk === "SCAM");
    } else if (filter === "safe") {
      filtered = filtered.filter((item) => item.risk === "SAFE");
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered.reverse());
  };

  const downloadCSV = () => {
    if (filteredHistory.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = ["Risk", "Confidence", "Reason", "Timestamp"];
    const rows = filteredHistory.map((item) => [
      item.risk,
      `${(item.confidence * 100).toFixed(0)}%`,
      `"${item.reason}"`,
      item.timestamp,
    ]);

    let csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv" })
    );
    link.download = `analysis_history_${new Date().getTime()}.csv`;
    link.click();
  };

  const getRiskColor = (risk) => {
    return risk === "SCAM"
      ? { badge: "bg-red-600", text: "text-red-400", icon: "🚨" }
      : { badge: "bg-green-600", text: "text-green-400", icon: "✅" };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-red-900/30 border border-red-600 p-4 rounded-lg">
          <p className="text-red-200">⚠️ {error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-green-400 mb-2">
          Analysis History 📋
        </h2>
        <p className="text-gray-400">
          Browse all analyzed messages and their detection results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg">
          <p className="text-gray-400 text-sm">Total Analyzed</p>
          <p className="text-3xl font-bold text-white">{history.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg">
          <p className="text-gray-400 text-sm">Scam Detected</p>
          <p className="text-3xl font-bold text-red-400">
            {history.filter((h) => h.risk === "SCAM").length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg">
          <p className="text-gray-400 text-sm">Safe Messages</p>
          <p className="text-3xl font-bold text-green-400">
            {history.filter((h) => h.risk === "SAFE").length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Filter by Risk
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Messages</option>
              <option value="scam">Scam Only</option>
              <option value="safe">Safe Only</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Search Results
            </label>
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-green-400 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={downloadCSV}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
            >
              📥 Download CSV
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Showing {filteredHistory.length} of {history.length} results
        </p>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 p-12 rounded-lg text-center">
          <p className="text-gray-400 text-lg">📭 No analysis history found</p>
              <p className="text-gray-500 text-sm mt-2">
                Start analyzing messages to build your history
              </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => {
            const colors = getRiskColor(item.risk);
            return (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-700 p-5 rounded-lg hover:border-gray-600 transition hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm ${colors.badge} text-white`}
                    >
                      {colors.icon} {item.risk}
                    </span>
                    <div>
                      <p className={`font-semibold ${colors.text}`}>
                        {(item.confidence * 100).toFixed(0)}% Confidence
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                      #{idx + 1}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.reason}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryView;
