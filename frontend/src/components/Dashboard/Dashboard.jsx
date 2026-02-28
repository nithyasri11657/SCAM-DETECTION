import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

function Dashboard() {
  const [data, setData] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://127.0.0.1:8000/api/v1/history")
      if (!response.ok) throw new Error("Failed to fetch data")
      
      const history = await response.json()
      setHistory(history)

      const scamCount = history.filter((item) => item.risk === "SCAM").length
      const safeCount = history.filter((item) => item.risk === "SAFE").length

      setData([
        { name: "SAFE", value: safeCount },
        { name: "SCAM", value: scamCount },
      ])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load dashboard. Make sure backend is running!")
    } finally {
      setLoading(false)
    }
  }

  // Calculate average confidence by risk type
  const getStats = () => {
    const scams = history.filter((h) => h.risk === "SCAM")
    const safes = history.filter((h) => h.risk === "SAFE")

    return {
      totalScams: scams.length,
      totalSafe: safes.length,
      avgScamConfidence:
        scams.length > 0
          ? (
              scams.reduce((sum, h) => sum + h.confidence, 0) /
              scams.length
            ).toFixed(2)
          : 0,
      avgSafeConfidence:
        safes.length > 0
          ? (
              safes.reduce((sum, h) => sum + h.confidence, 0) /
              safes.length
            ).toFixed(2)
          : 0,
      total: history.length,
      scamPercentage:
        history.length > 0
          ? ((scams.length / history.length) * 100).toFixed(1)
          : 0,
    }
  }

  // Confidence distribution data
  const getConfidenceDistribution = () => {
    const bins = [
      { range: "0-20%", count: 0 },
      { range: "20-40%", count: 0 },
      { range: "40-60%", count: 0 },
      { range: "60-80%", count: 0 },
      { range: "80-100%", count: 0 },
    ]

    history.forEach((item) => {
      const conf = item.confidence * 100
      if (conf <= 20) bins[0].count++
      else if (conf <= 40) bins[1].count++
      else if (conf <= 60) bins[2].count++
      else if (conf <= 80) bins[3].count++
      else bins[4].count++
    })

    return bins
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-red-900/30 border border-red-600 p-6 rounded-lg text-center">
          <p className="text-red-200 mb-4">⚠️ {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const stats = getStats()
  const confidenceData = getConfidenceDistribution()

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-green-400 mb-2">
          Dashboard 📊
        </h2>
        <p className="text-gray-400">
          AI Scam Detection Analytics and Statistics
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg hover:border-green-600/50 transition">
          <p className="text-gray-400 text-sm font-semibold">Total Analyzed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats.total}</p>
        </div>

        <div className="bg-gray-900 border border-red-900/50 p-5 rounded-lg hover:border-red-600/50 transition">
          <p className="text-gray-400 text-sm font-semibold">Scam Detected</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{stats.totalScams}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.scamPercentage}% of total</p>
        </div>

        <div className="bg-gray-900 border border-green-900/50 p-5 rounded-lg hover:border-green-600/50 transition">
          <p className="text-gray-400 text-sm font-semibold">Safe Messages</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats.totalSafe}</p>
          <p className="text-xs text-gray-500 mt-1">{(100 - stats.scamPercentage).toFixed(1)}% of total</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg hover:border-yellow-600/50 transition">
          <p className="text-gray-400 text-sm font-semibold">Avg Scam Confidence</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{(stats.avgScamConfidence * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 p-5 rounded-lg hover:border-blue-600/50 transition">
          <p className="text-gray-400 text-sm font-semibold">Avg Safe Confidence</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{(stats.avgSafeConfidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart */}
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-6">
            Detection Results Distribution
          </h3>
          {data.length > 0 && data.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                  labelLine={true}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.name === "SCAM" ? "#ef4444" : "#22c55e"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No data available yet
            </div>
          )}
        </div>

        {/* Confidence Distribution Bar Chart */}
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-6">
            Confidence Level Distribution
          </h3>
          {confidenceData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No data available yet
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600/30 p-6 rounded-lg">
        <p className="text-blue-200">
          <span className="font-semibold">📈 Dashboard Insights:</span> This dashboard provides real-time statistics about detected scams and safe messages. 
          The confidence levels indicate how certain the AI model is about each classification.
        </p>
      </div>
    </div>
  )
}

export default Dashboard