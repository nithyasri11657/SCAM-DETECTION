function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-400">
        Scam Detector 🔍
      </h1>

      <div className="space-x-6">
        <button className="hover:text-green-400 transition">
          Analyzer
        </button>
        <button className="hover:text-green-400 transition">
          Dashboard
        </button>
        <button className="hover:text-green-400 transition">
          Education
        </button>
      </div>
    </nav>
  )
}

export default Navbar