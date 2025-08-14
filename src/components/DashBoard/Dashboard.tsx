import { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import SubscriptionPlans from '../Subscription/SubscriptionPlans';
import Settings from '../Settings/Settings';
import Compliance from '../Compliance/Compliance';
import LeadDiscovery from "../LeadDiscovery/LeadDiscovery";
import PitchComposer from "../PitchComposer/PitchComposer";
import AIAssistant from "../AI/AIAssistant";
import AutomationDashboard from "../Automation/AutomationDashboard";
import JobApplicationWorkflow from "../Automation/JobApplicationWorkflow";
import AnalyticsDashboard from "../Automation/AnalyticsDashboard";
import {
  FaUsers,
  FaSearch,
  FaMagic,
  FaCheckCircle,
  FaGem,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
  FaGlobe,
  FaEnvelope,
  FaRocket,
  FaStar,
  FaRobot,
  FaTasks,
  FaPlus
} from "react-icons/fa";

// Mock data for demonstration - replace with real data from your backend
const mockLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    company: "TechCorp Solutions",
    email: "contact@techstartup.com",
    country: "US",
    budget: "$50,000",
    urgency: "High",
    status: "Hot",
    interestLevel: 85,
    industry: "Technology",
    description: "Looking for a full-stack developer for a fintech project"
  },
  {
    id: 2,
    name: "James Ochieng",
    company: "Nairobi Digital Hub",
    email: "hello@digitalagency.co.uk",
    country: "KE",
    budget: "$15,000",
    urgency: "Medium",
    status: "New",
    interestLevel: 65,
    industry: "Marketing",
    description: "Need a React developer for client dashboard"
  },
  {
    id: 3,
    name: "Emma Williams",
    company: "London Fintech Ltd",
    email: "dev@ecommerce.ca",
    country: "GB",
    budget: "$75,000",
    urgency: "Low",
    status: "Closed",
    interestLevel: 95,
    industry: "Finance",
    description: "Seeking backend developer for payment integration"
  }
];

const sidebarItems = [
  { name: "Leads", icon: FaUsers, active: true },
  { name: "Lead Discovery", icon: FaSearch, active: false },
  { name: "Pitch Composer", icon: FaMagic, active: false },
  { name: "Automation", icon: FaRobot, active: false },
  { name: "Job Workflow", icon: FaTasks, active: false },
  { name: "Analytics", icon: FaChartLine, active: false },
  { name: "Compliance", icon: FaCheckCircle, active: false },
  { name: "Subscription", icon: FaGem, active: false },
  { name: "Settings", icon: FaCog, active: false },
];

export default function Dashboard({ user }: { user: User }) {
  const [activeSection, setActiveSection] = useState("Leads");
  const [userPlan, setUserPlan] = useState("starter"); // This would come from your database

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 shadow-2xl">
        {/* Logo */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-gray-700">
              LeadSwift
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-2">AI-Powered Client Acquisition</p>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-3">
          {sidebarItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] group ${activeSection === item.name
                    ? "bg-gradient-primary text-white shadow-lg shadow-purple-500/25 border border-purple-500/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50"
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${activeSection === item.name
                    ? "bg-white/20"
                    : "bg-gray-700/30 group-hover:bg-gray-600/50"
                  }`}>
                  <IconComponent className="text-lg" />
                </div>
                <span className="font-semibold">{item.name}</span>
                {activeSection === item.name && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 w-72 p-6 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-300">Pro Plan Active</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">127</div>
                <div className="text-xs text-gray-400">Leads Found</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">89</div>
                <div className="text-xs text-gray-400">Pitches Sent</div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-3 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all duration-200 font-medium"
            >
              <FaSignOutAlt className="text-sm" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 px-8 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {activeSection}
              </h1>
              <p className="text-gray-300 text-lg font-medium">
                🚀 Manage your leads and close deals faster with AI
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-3 px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600/50 hover:border-gray-500 hover:text-white transition-all duration-200 font-semibold">
                <FaPlus className="text-lg" />
                Import Leads
              </button>
              <button className="flex items-center gap-3 px-8 py-3 bg-gradient-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <FaRocket className="text-lg relative z-10" />
                <span className="relative z-10">Generate Leads</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="h-full overflow-hidden">
          {activeSection === "Leads" && (
            <div className="p-8 h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] group"
                  >
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          {getCountryFlag(lead.country)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{lead.name}</h3>
                          <p className="text-sm text-gray-300 font-medium">{lead.company}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-2 rounded-xl text-xs font-bold shadow-lg ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>

                    {/* Lead Details */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-gray-700/30 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm font-medium">⚡ Interest Level:</span>
                          <span className="font-bold text-white text-lg">{lead.interestLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3 mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-primary h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{ width: `${lead.interestLevel}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">💰 Budget</div>
                          <div className="font-semibold text-white text-sm">{lead.budget}</div>
                        </div>
                        <div className="bg-gray-700/30 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">🏢 Industry</div>
                          <div className="font-semibold text-white text-sm">{lead.industry}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setActiveSection("Pitch Composer")}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <FaRocket className="text-lg relative z-10" />
                      <span className="relative z-10">Create Pitch</span>
                    </button>
                  </div>
                ))}

                {/* Add New Lead Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-purple-500 hover:bg-gray-700/30 transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-purple-500/25">
                    <FaSearch className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Discover New Leads</h3>
                  <p className="text-sm text-gray-300 mb-6 font-medium">🌍 Use AI to find your next high-value global clients</p>
                  <button
                    onClick={() => setActiveSection("Lead Discovery")}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">✨ Start Discovery</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Lead Discovery" && (
            <LeadDiscovery />
          )}

          {activeSection === "Pitch Composer" && (
            <PitchComposer user={user} />
          )}

          {activeSection === "Automation" && (
            <AutomationDashboard user={user} />
          )}

          {activeSection === "Job Workflow" && (
            <JobApplicationWorkflow user={user} />
          )}

          {activeSection === "Analytics" && (
            <AnalyticsDashboard user={user} />
          )}

          {activeSection === "Subscription" && (
            <SubscriptionPlans
              user={user}
              currentPlan={userPlan}
              onPlanSelect={(planId) => setUserPlan(planId)}
            />
          )}

          {activeSection === "Compliance" && (
            <Compliance />
          )}

          {activeSection === "Settings" && (
            <Settings user={user} />
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
