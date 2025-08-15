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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const signOut = async () => {
    try {
      // Clear local storage and session storage first
      localStorage.removeItem('leadswift-cache');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      });
      
      if (error) {
        console.error('Error signing out:', error);
        // Even if there's an error, clear the session locally
        window.location.reload();
      }
      
      // The auth state change listener in page.tsx will automatically redirect to AuthCard
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Force reload to clear any stuck state
      window.location.reload();
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700/50 text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl font-bold">L</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">LeadSwift</h1>
              <p className="text-gray-400 text-xs sm:text-sm">AI Client Acquisition</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.name);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-left text-sm sm:text-base ${
                  activeSection === item.name
                    ? "bg-gradient-primary text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <item.icon className="text-lg sm:text-xl" />
                <span className="font-medium">{item.name}</span>
                {activeSection === item.name && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-600/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-lg transition-all duration-200 text-xs sm:text-sm"
            >
              <FaSignOutAlt className="text-xs sm:text-sm" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 shadow-lg rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {activeSection}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg font-medium">
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
          {activeSection === "Leads" && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {mockLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50 p-4 sm:p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] group"
                  >
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-2xl shadow-lg">
                          {getCountryFlag(lead.country)}
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{lead.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-300 font-medium">{lead.company}</p>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold shadow-lg ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>

                    {/* Lead Details */}
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs sm:text-sm font-medium">⚡ Interest Level:</span>
                          <span className="font-bold text-white text-base sm:text-lg">{lead.interestLevel}%</span>
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <div className="text-xs sm:text-sm text-gray-400 mb-1">💰 Budget</div>
                          <div className="font-semibold text-white text-sm sm:text-base">{lead.budget}</div>
                        </div>
                        <div className="bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <div className="text-xs sm:text-sm text-gray-400 mb-1">🏢 Industry</div>
                          <div className="font-semibold text-white text-sm sm:text-base">{lead.industry}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setActiveSection("Pitch Composer")}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-gradient-primary text-white rounded-lg sm:rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group text-sm sm:text-base"
                    >
                      <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <FaRocket className="text-base sm:text-lg relative z-10" />
                      <span className="relative z-10">Create Pitch</span>
                    </button>
                  </div>
                ))}

                {/* Add New Lead Card */}
                <div className="bg-gray-800/30 backdrop-blur-sm border-2 border-dashed border-gray-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:border-purple-500 hover:bg-gray-700/30 transition-all duration-300 cursor-pointer group">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 animate-pulse shadow-lg shadow-purple-500/25">
                    <FaSearch className="text-white text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-300 transition-colors">Discover New Leads</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 font-medium">🌍 Use AI to find your next high-value global clients</p>
                  <button
                    onClick={() => setActiveSection("Lead Discovery")}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group text-sm sm:text-base"
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
        </div>
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
