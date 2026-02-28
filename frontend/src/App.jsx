import { useState } from "react";
import InputPanel from "./components/Analyzer/InputPanel";
import Dashboard from "./components/Dashboard/Dashboard";
import HistoryView from "./components/History/HistoryView";
import URLAnalyzer from "./components/URLAnalyzer/URLAnalyzer";

function App() {
  const [page, setPage] = useState("analyzer");

  const navItems = [
    { id: "analyzer", label: "Analyzer", icon: "🔍" },
    { id: "history", label: "History", icon: "📋" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "url", label: "URL Scan", icon: "🔗" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Navigation */}
      <nav className="bg-gray-900 text-white border-b border-gray-700 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h1 className="text-xl font-bold text-green-400">Scam Detector</h1>
                <p className="text-xs text-gray-400">AI-Powered Protection</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-1 flex-wrap justify-end">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 ${
                    page === item.id
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-green-400"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        {page === "analyzer" && <InputPanel />}
        {page === "history" && <HistoryView />}
        {page === "dashboard" && <Dashboard />}
        {page === "url" && <URLAnalyzer />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 text-gray-400 text-center py-6 text-sm">
        <p>
          🔒 Scam Detector v1.0 | Using Hybrid AI Detection (Rule-Based + DistilBERT ML Model)
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Never share OTPs, passwords, or personal information with strangers
        </p>
      </footer>
    </div>
  );
}

export default App;