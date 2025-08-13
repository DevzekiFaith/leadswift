import { useEffect } from "react";
import { useQuery } from "react-query";
import { supabase } from "../../../lib/supabaseClient";
import LeadCard from "../LeadCard/LeadCard";

async function fetchLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data;
}

export default function Dashboard({ user }: { user: any }) {
  const { data: leads, isLoading, refetch } = useQuery("leads", fetchLeads);

  useEffect(() => {
    // optional: subscribe to realtime updates
    const sub = supabase
      .from("leads")
      .on("*", () => refetch())
      .subscribe();

    return () => { supabase.removeSubscription(sub); };
  }, [refetch]);

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">LeadSwift</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded bg-white border">Import Leads</button>
          <button className="px-4 py-2 rounded bg-gradient-to-r from-primary to-accent text-white">Generate Leads</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="space-y-4">
            {isLoading && <div>Loading leads…</div>}
            {!isLoading && (leads || []).length === 0 && <div>No leads yet — try Generate Leads.</div>}
            {leads?.map((lead: any) => <LeadCard key={lead.id} lead={lead} />)}
          </div>
        </div>

        <aside className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-semibold mb-2">AI Pitch Assistant</h3>
          <p className="text-sm text-gray-600">Select a lead to compose a pitch. AI suggestions will appear here.</p>
        </aside>
      </section>
    </div>
  );
}
