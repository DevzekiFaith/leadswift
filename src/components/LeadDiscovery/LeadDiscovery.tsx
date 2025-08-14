import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import InstantScoring from "../AI/InstantScoring";
import { LeadData } from "../../services/api";

interface LeadFilters {
  industry: string;
  location: string;
  budgetRange: string;
  urgency: string;
  platforms: string[];
}

interface DiscoveredLead {
  id: string;
  name: string;
  company: string;
  title: string;
  location: string;
  country: string;
  industry: string;
  budget: string;
  urgency: "Low" | "Medium" | "High";
  score: number;
  platforms: string[];
  description: string;
  contactInfo: {
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
  lastActive: string;
}

// Mock data for demonstration
const mockDiscoveredLeads: DiscoveredLead[] = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "TechFlow Solutions",
    title: "VP of Marketing",
    location: "San Francisco, CA",
    country: "US",
    industry: "SaaS",
    budget: "$25,000 - $50,000",
    urgency: "High",
    score: 92,
    platforms: ["LinkedIn", "Company Website"],
    description: "Looking for digital marketing agency to scale B2B SaaS growth. Mentioned need for African market expertise.",
    contactInfo: {
      email: "sarah@techflow.com",
      linkedin: "linkedin.com/in/sarahchen"
    },
    lastActive: "2 hours ago"
  },
  {
    id: "2",
    name: "Marcus Johnson",
    company: "Global Ventures Inc",
    title: "Business Development Director",
    location: "London, UK",
    country: "GB",
    industry: "Fintech",
    budget: "$75,000 - $100,000",
    urgency: "Medium",
    score: 87,
    platforms: ["AngelList", "Crunchbase"],
    description: "Seeking strategic partnerships for African fintech expansion. Open to consulting services.",
    contactInfo: {
      email: "m.johnson@globalventures.co.uk",
      linkedin: "linkedin.com/in/marcusjohnson"
    },
    lastActive: "1 day ago"
  },
  {
    id: "3",
    name: "Priya Patel",
    company: "EcoTech Innovations",
    title: "Founder & CEO",
    location: "Toronto, Canada",
    country: "CA",
    industry: "CleanTech",
    budget: "$15,000 - $30,000",
    urgency: "High",
    score: 89,
    platforms: ["Upwork", "Behance"],
    description: "Need creative agency for sustainable tech product launch. Values diversity and global perspectives.",
    contactInfo: {
      email: "priya@ecotech.ca",
      twitter: "@priyaecotech"
    },
    lastActive: "4 hours ago"
  }
];

const industries = [
  "All Industries", "SaaS", "Fintech", "E-commerce", "Healthcare", 
  "CleanTech", "EdTech", "Marketing", "Consulting", "Manufacturing"
];

const locations = [
  "Global", "North America", "Europe", "Asia", "Africa", 
  "United States", "United Kingdom", "Canada", "Germany", "Australia"
];

const budgetRanges = [
  "Any Budget", "$5,000 - $15,000", "$15,000 - $30,000", 
  "$30,000 - $50,000", "$50,000 - $100,000", "$100,000+"
];

const platforms = [
  "LinkedIn", "Upwork", "AngelList", "Behance", "Fiverr", 
  "Crunchbase", "Company Websites", "Twitter", "Industry Forums"
];

interface LeadDiscoveryProps {
  user: User;
  userPlan: string;
}

export default function LeadDiscovery({ user, userPlan }: LeadDiscoveryProps) {
  const [filters, setFilters] = useState<LeadFilters>({
    industry: "All Industries",
    location: "Global",
    budgetRange: "Any Budget",
    urgency: "Any",
    platforms: []
  });
  
  const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Partial<LeadData>>({});

  const togglePlatform = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    setFilters({...filters, platforms: newPlatforms});
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchProgress(0);
    setDiscoveredLeads([]);

    // Simulate AI search progress
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          
          // Filter mock leads based on current filters
          const filteredLeads = mockDiscoveredLeads.filter(lead => {
            const matchesIndustry = filters.industry === "Any" || lead.industry === filters.industry;
            const matchesLocation = filters.location === "Any" || lead.location.includes(filters.location);
            const matchesUrgency = filters.urgency === "Any" || lead.urgency === filters.urgency;
            return matchesIndustry && matchesLocation && matchesUrgency;
          });

          // Apply plan limits
          const planLimits = { starter: 3, pro: 10, elite: filteredLeads.length };
          const limitedLeads = filteredLeads.slice(0, planLimits[userPlan as keyof typeof planLimits] || 3);
          
          setDiscoveredLeads(limitedLeads);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      "US": "🇺🇸", "GB": "🇬🇧", "CA": "🇨🇦", "DE": "🇩🇪", "AU": "🇦🇺"
    };
    return flags[countryCode] || "🌍";
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">🔍</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-gray-700">
            AI Lead Discovery
          </h1>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Discover high-quality prospects across global markets with AI-powered intelligence
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Smart Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Industry Filter */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-white transition-colors">🏢 Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-gray-700/70"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-white transition-colors">🌍 Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-gray-700/70"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Budget Range Filter */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-white transition-colors"> Budget Range</label>
            <select
              value={filters.budgetRange}
              onChange={(e) => setFilters({...filters, budgetRange: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-gray-700/70"
            >
              {budgetRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-3 group-hover:text-white transition-colors"> Urgency</label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters({...filters, urgency: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-gray-700/70"
            >
              <option value="Any">Any Urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-4"> Platforms to Search</label>
          <div className="flex flex-wrap gap-3">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`px-6 py-3 rounded-xl border transition-all duration-200 transform hover:scale-105 ${
                  filters.platforms.includes(platform)
                    ? "bg-gradient-primary text-white border-purple-500 shadow-lg shadow-purple-500/25"
                    : "bg-gray-700/50 text-gray-300 border-gray-600 hover:border-purple-500 hover:text-white hover:bg-gray-700/70"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full bg-gradient-primary text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative z-10">
            {isSearching ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>AI Scanning Global Markets...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl"></span>
                <span>Discover Global Leads</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-spin">
              <span className="text-white text-sm"></span>
            </div>
            <h3 className="text-2xl font-semibold text-white">AI Scanning Global Markets</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-lg">Analyzing prospects across platforms...</span>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{Math.round(searchProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${searchProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="text-2xl mb-2"></div>
                <div className="text-gray-300 text-sm">Scanning</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="text-2xl mb-2"></div>
                <div className="text-gray-300 text-sm">AI Analysis</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="text-2xl mb-2"></div>
                <div className="text-gray-300 text-sm">Scoring</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="text-2xl mb-2"></div>
                <div className="text-gray-300 text-sm">Filtering</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {discoveredLeads.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white text-xl"></span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">
                  Discovered Leads
                </h3>
                <p className="text-gray-300">
                  {discoveredLeads.length} high-quality prospects found
                </p>
              </div>
            </div>
            {userPlan === "starter" && (
              <div className="bg-gradient-primary/20 border border-purple-500/30 rounded-xl px-4 py-2">
                <span className="text-purple-300 text-sm"> Upgrade to Pro for unlimited results</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {discoveredLeads.map((lead, index) => (
              <div
                key={lead.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02] group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Lead Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl">
                      {getCountryFlag(lead.country)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{lead.name}</h3>
                      <p className="text-gray-300 font-medium">{lead.company}</p>
                      <p className="text-sm text-gray-400">{lead.title}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${getScoreColor(lead.score)} shadow-lg`}>
                      🎯 {lead.score}
                    </div>
                    <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium ${getUrgencyColor(lead.urgency)}`}>
                      ⚡ {lead.urgency}
                    </div>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">🏢 Industry</div>
                      <div className="text-white font-semibold">{lead.industry}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">💰 Budget</div>
                      <div className="text-white font-semibold">{lead.budget}</div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-2">📍 Location</div>
                    <div className="text-white font-semibold">{lead.location}</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-3">🚀 Platforms</div>
                    <div className="flex flex-wrap gap-2">
                      {lead.platforms.map(platform => (
                        <span key={platform} className="px-3 py-1 bg-gradient-primary/20 border border-purple-500/30 text-purple-300 text-xs rounded-lg font-medium">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-700/20 rounded-xl p-4 mb-6">
                  <div className="text-gray-400 text-sm mb-2">📝 Description</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{lead.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      ✨ Generate Pitch
                    </span>
                  </button>
                  <button className="px-6 py-3 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-200 font-medium">
                    📧 Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && discoveredLeads.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Discover Global Leads</h3>
          <p className="text-gray-300 text-lg max-w-md mx-auto mb-8">
            Configure your search filters above and let our AI discover high-quality prospects across global markets
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="text-sm">Global Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm">AI Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm">Real-time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
