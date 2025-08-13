import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import SubscriptionPlans from "../Subscription/SubscriptionPlans";
import LeadDiscovery from "../LeadDiscovery/LeadDiscovery";
import PitchComposer from "../PitchComposer/PitchComposer";
import AIAssistant from "../AI/AIAssistant";
import { 
  FaUsers, 
  FaSearch, 
  FaMagic, 
  FaCheckCircle, 
  FaGem, 
  FaCog,
  FaSignOutAlt,
  FaRocket,
  FaPlus
} from "react-icons/fa";

// Mock data for demonstration - replace with real data from your backend
const mockLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "TechCorp Solutions",
    country: "US",
    status: "Hot",
    interestLevel: 85,
    budget: "$50,000",
    industry: "Technology"
  },
  {
    id: 2,
    name: "James Ochieng",
    company: "Nairobi Digital Hub",
    country: "KE",
    status: "New",
    interestLevel: 65,
    budget: "$15,000",
    industry: "Marketing"
  },
  {
    id: 3,
    name: "Emma Williams",
    company: "London Fintech Ltd",
    country: "GB",
    status: "Closed",
    interestLevel: 95,
    budget: "$75,000",
    industry: "Finance"
  }
];

const sidebarItems = [
  { name: "Leads", icon: FaUsers, active: true },
  { name: "Lead Discovery", icon: FaSearch, active: false },
  { name: "Pitch Composer", icon: FaMagic, active: false },
  { name: "Compliance", icon: FaCheckCircle, active: false },
  { name: "Subscription", icon: FaGem, active: false },
  { name: "Settings", icon: FaCog, active: false },
];

export default function Dashboard({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState("Leads");
  const [userPlan, setUserPlan] = useState("starter"); // This would come from your database

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot": return "bg-red-100 text-red-800";
      case "New": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      "US": "🇺🇸",
      "KE": "🇰🇪", 
      "GB": "🇬🇧",
      "CA": "🇨🇦",
      "AU": "🇦🇺"
    };
    return flags[countryCode] || "🌍";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            LeadSwift
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === item.name
                    ? "bg-gradient-primary text-white shadow-md"
                    : "text-text-primary hover:bg-gray-50"
                }`}
              >
                <IconComponent className="text-lg" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-text-primary transition-colors"
          >
            <FaSignOutAlt className="text-sm" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {activeSection}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your leads and close deals faster with AI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-text-primary hover:bg-gray-50 transition-colors">
                <FaPlus className="text-sm" />
                Import Leads
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02]">
                <FaRocket className="text-sm" />
                Generate Leads
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="h-full overflow-hidden">
          {activeSection === "Leads" && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(lead.country)}</span>
                        <div>
                          <h3 className="font-semibold text-text-primary">{lead.name}</h3>
                          <p className="text-sm text-gray-600">{lead.company}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>

                    {/* Lead Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Interest Level:</span>
                        <span className="font-medium text-text-primary">{lead.interestLevel}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium text-text-primary">{lead.budget}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium text-text-primary">{lead.industry}</span>
                      </div>
                    </div>

                    {/* Interest Level Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${lead.interestLevel}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => setActiveSection("Pitch Composer")}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FaMagic className="text-sm" />
                      Pitch Now
                    </button>
                  </div>
                ))}

                {/* Add New Lead Card */}
                <div 
                  onClick={() => setActiveSection("Lead Discovery")}
                  className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-primary-accent transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-white text-xl" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2">Discover New Leads</h3>
                  <p className="text-sm text-gray-600">
                    Use AI to find high-quality prospects
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Lead Discovery" && (
            <LeadDiscovery user={user} userPlan={userPlan} />
          )}

          {activeSection === "Pitch Composer" && (
            <PitchComposer user={user} />
          )}

          {activeSection === "Subscription" && (
            <SubscriptionPlans 
              user={user} 
              currentPlan={userPlan}
              onPlanSelect={(planId) => setUserPlan(planId)}
            />
          )}

          {activeSection === "Compliance" && (
            <div className="p-8 text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Compliance Checker</h2>
              <p className="text-gray-600">Coming soon - AI compliance scanning</p>
            </div>
          )}

          {activeSection === "Settings" && (
            <div className="p-8 text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Settings</h2>
              <p className="text-gray-600">Coming soon - Profile and integrations</p>
            </div>
          )}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        activeSection={activeSection}
        userPlan={userPlan}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}
