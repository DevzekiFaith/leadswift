export default function LeadCard({ lead }: { lead: any }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
            {lead.name?.slice(0,2).toUpperCase() || "LD"}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              {lead.name}
            </h4>
            <p className="text-sm text-gray-300 font-medium">{lead.title || "—"}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <span>🌍</span>
              {lead.location?.country || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className={`text-xs px-3 py-2 rounded-xl font-bold shadow-lg ${
            (lead.match_score || 0) > 0.7 
              ? "bg-green-500/20 border border-green-500/30 text-green-300" 
              : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
          }`}>
            🎯 {(lead.match_score || 0) > 0.7 ? "High Match" : "Medium Match"}
          </div>
          <button className="px-6 py-2 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center gap-2">
              ✨ Pitch
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
