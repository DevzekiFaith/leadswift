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

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchProgress(0);
    setDiscoveredLeads([]);

    // Simulate AI search progress
    const progressSteps = [
      "Scanning LinkedIn profiles...",
      "Analyzing Upwork projects...",
      "Checking AngelList startups...",
      "Reviewing company websites...",
      "Scoring prospects with AI...",
      "Filtering results..."
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSearchProgress(((i + 1) / progressSteps.length) * 100);
    }

    // Filter mock leads based on criteria
    let filteredLeads = mockDiscoveredLeads;
    
    if (filters.industry !== "All Industries") {
      filteredLeads = filteredLeads.filter(lead => 
        lead.industry.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    if (filters.location !== "Global") {
      filteredLeads = filteredLeads.filter(lead => 
        lead.location.includes(filters.location) || lead.country === filters.location
      );
    }

    // Limit results based on plan
    const planLimits = {
      starter: 3,
      pro: 10,
      elite: filteredLeads.length
    };

    const limitedLeads = filteredLeads.slice(0, planLimits[userPlan as keyof typeof planLimits] || 3);
    
    setDiscoveredLeads(limitedLeads);
    setIsSearching(false);
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
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          🔍 AI Lead Discovery
        </h1>
        <p className="text-gray-600">
          Find high-quality prospects across multiple platforms with AI-powered scoring
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Search Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Budget Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
            <select
              value={filters.budgetRange}
              onChange={(e) => setFilters({...filters, budgetRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              {budgetRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters({...filters, urgency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="Any">Any Urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Platforms to Search</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => {
                  const newPlatforms = filters.platforms.includes(platform)
                    ? filters.platforms.filter(p => p !== platform)
                    : [...filters.platforms, platform];
                  setFilters({...filters, platforms: newPlatforms});
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.platforms.includes(platform)
                    ? 'bg-gradient-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSearching ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching... {Math.round(searchProgress)}%
            </div>
          ) : (
            "🚀 Discover Leads"
          )}
        </button>
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">AI Search Progress</span>
            <span className="text-sm text-gray-500">{Math.round(searchProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${searchProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      {discoveredLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Discovered Leads ({discoveredLeads.length})
            </h2>
            <div className="text-sm text-gray-500">
              Sorted by AI Score (highest first)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {discoveredLeads.map((lead) => (
              <div
                key={lead.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Lead Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCountryFlag(lead.country)}</span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{lead.name}</h3>
                      <p className="text-sm text-gray-600">{lead.title} at {lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}% Match
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(lead.urgency)}`}>
                      {lead.urgency}
                    </span>
                  </div>
                </div>

                {/* Lead Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-text-primary">{lead.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-text-primary">{lead.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-medium text-text-primary">{lead.industry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium text-text-primary">{lead.lastActive}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
                  {lead.description}
                </p>

                {/* Platforms */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {lead.platforms.map(platform => (
                    <span key={platform} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {platform}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02]">
                    ✨ Generate Pitch
                  </button>
                  <button className="px-4 py-2 border border-primary-accent text-primary-accent rounded-lg hover:bg-purple-50 transition-colors">
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Ready to Discover Leads</h3>
          <p className="text-gray-600">
            Set your filters and click "Discover Leads" to find high-quality prospects with AI
          </p>
        </div>
      )}
    </div>
  );
}
