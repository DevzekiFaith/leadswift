export default function LeadCard({ lead }: { lead: any }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-bold">
            {lead.name?.slice(0,2).toUpperCase() || "LD"}
          </div>
          <div>
            <h4 className="font-semibold">{lead.name}</h4>
            <p className="text-sm text-gray-500">{lead.title || "—"}</p>
            <p className="text-xs text-gray-400">{lead.location?.country || "Unknown"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-xs px-2 py-1 rounded-full bg-[#EEF2FF] text-[#3B82F6]">{(lead.match_score || 0) > 0.7 ? "High" : "Med"}</div>
        <div>
          <button className="px-3 py-1 rounded bg-gradient-to-r from-primary to-accent text-white">Pitch</button>
        </div>
      </div>
    </div>
  );
}
