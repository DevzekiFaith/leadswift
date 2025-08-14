import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaLinkedin, FaTwitter, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDollarSign, FaClock, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import { RealTimeLeadAPI } from '../../services/realTimeLeadAPI';
import { useSettings } from '../../contexts/SettingsContext';

export interface LeadFilters {
  industry: string;
  location: string;
  budgetRange: string;
  urgency: string;
  platforms: string[];
}

export interface DiscoveredLead {
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

// Dynamic lead generation templates
const leadTemplates = {
  SaaS: {
    companies: ["TechFlow Solutions", "CloudSync Pro", "DataStream Inc", "SaaS Dynamics", "ScaleUp Software", "NextGen Analytics", "FlowTech Systems", "CloudFirst Solutions"],
    titles: ["VP of Marketing", "Head of Growth", "Marketing Director", "Chief Marketing Officer", "Growth Manager", "Digital Marketing Lead", "Customer Acquisition Manager"],
    descriptions: [
      "Looking for digital marketing agency to scale B2B SaaS growth",
      "Need help with customer acquisition and retention strategies",
      "Seeking growth marketing expertise for international expansion",
      "Looking for conversion optimization and funnel improvement",
      "Need content marketing strategy for enterprise clients",
      "Seeking performance marketing agency for lead generation"
    ],
    budgets: ["$25,000 - $50,000", "$50,000 - $100,000", "$15,000 - $30,000", "$30,000 - $75,000"]
  },
  Fintech: {
    companies: ["Global Ventures Inc", "FinanceFlow", "PayTech Solutions", "CryptoSecure", "InvestSmart", "BlockChain Dynamics", "DigitalPay Corp", "FinanceFirst"],
    titles: ["Business Development Director", "Head of Partnerships", "VP of Strategy", "Chief Growth Officer", "Partnership Manager", "Strategic Alliances Lead"],
    descriptions: [
      "Seeking strategic partnerships for fintech expansion",
      "Looking for compliance consulting and regulatory guidance",
      "Need marketing support for financial product launch",
      "Seeking business development partnerships in emerging markets",
      "Looking for customer acquisition strategies for fintech",
      "Need help with investor relations and fundraising support"
    ],
    budgets: ["$75,000 - $100,000", "$50,000 - $150,000", "$100,000+", "$30,000 - $75,000"]
  },
  "E-commerce": {
    companies: ["ShopSmart", "E-Commerce Plus", "RetailTech", "OnlineMarket Pro", "DigitalStore", "Commerce Cloud", "MarketPlace Inc", "ShopFlow"],
    titles: ["E-commerce Manager", "Digital Marketing Director", "Head of Online Sales", "Growth Marketing Manager", "Customer Experience Lead"],
    descriptions: [
      "Looking for e-commerce optimization and conversion improvement",
      "Need help with social media marketing and influencer partnerships",
      "Seeking email marketing automation and customer retention",
      "Looking for marketplace expansion and multi-channel strategy",
      "Need performance marketing for product launches",
      "Seeking customer acquisition and lifetime value optimization"
    ],
    budgets: ["$20,000 - $40,000", "$40,000 - $80,000", "$15,000 - $35,000", "$25,000 - $60,000"]
  },
  Healthcare: {
    companies: ["HealthTech Solutions", "MedFlow", "CareConnect", "HealthFirst", "MedTech Innovations", "WellnessCloud", "HealthStream", "MedSecure"],
    titles: ["Healthcare Marketing Director", "VP of Patient Engagement", "Chief Marketing Officer", "Digital Health Manager", "Patient Acquisition Lead"],
    descriptions: [
      "Looking for healthcare marketing compliance and patient acquisition",
      "Need help with telemedicine platform promotion and user growth",
      "Seeking medical device marketing and regulatory compliance",
      "Looking for patient education content and engagement strategies",
      "Need healthcare SEO and digital presence optimization",
      "Seeking pharmaceutical marketing and clinical trial recruitment"
    ],
    budgets: ["$50,000 - $100,000", "$75,000 - $150,000", "$30,000 - $70,000", "$40,000 - $90,000"]
  },
  CleanTech: {
    companies: ["EcoTech Innovations", "GreenEnergy Solutions", "SustainableTech", "CleanFuture", "EcoFlow Systems", "GreenTech Dynamics", "SolarStream", "EcoSmart"],
    titles: ["Founder & CEO", "Head of Sustainability", "Environmental Marketing Director", "Clean Energy Manager", "Green Innovation Lead"],
    descriptions: [
      "Need creative agency for sustainable tech product launch",
      "Looking for environmental impact marketing and ESG communication",
      "Seeking clean energy marketing and government relations",
      "Need help with sustainability reporting and stakeholder engagement",
      "Looking for green technology PR and thought leadership",
      "Seeking renewable energy project marketing and community outreach"
    ],
    budgets: ["$15,000 - $30,000", "$30,000 - $60,000", "$25,000 - $50,000", "$20,000 - $45,000"]
  },
  EdTech: {
    companies: ["LearnTech", "EduFlow", "SmartLearning", "DigitalEdu", "StudyStream", "EduTech Solutions", "LearningCloud", "AcademicTech"],
    titles: ["Head of Marketing", "Student Acquisition Manager", "EdTech Marketing Director", "Learning Experience Manager", "Educational Content Lead"],
    descriptions: [
      "Looking for student acquisition and educational marketing strategies",
      "Need help with online course promotion and enrollment growth",
      "Seeking educational content marketing and thought leadership",
      "Looking for teacher and institution partnership development",
      "Need help with educational technology adoption and training",
      "Seeking parent and student engagement optimization"
    ],
    budgets: ["$20,000 - $40,000", "$30,000 - $60,000", "$15,000 - $35,000", "$25,000 - $55,000"]
  }
};

const locationData = {
  "North America": {
    cities: ["San Francisco, CA", "New York, NY", "Toronto, Canada", "Austin, TX", "Seattle, WA", "Boston, MA", "Vancouver, Canada", "Chicago, IL"],
    countries: ["US", "CA"]
  },
  "Europe": {
    cities: ["London, UK", "Berlin, Germany", "Amsterdam, Netherlands", "Paris, France", "Stockholm, Sweden", "Dublin, Ireland", "Barcelona, Spain"],
    countries: ["GB", "DE", "NL", "FR", "SE", "IE", "ES"]
  },
  "Asia": {
    cities: ["Singapore", "Tokyo, Japan", "Hong Kong", "Sydney, Australia", "Mumbai, India", "Seoul, South Korea", "Bangkok, Thailand"],
    countries: ["SG", "JP", "HK", "AU", "IN", "KR", "TH"]
  },
  "Global": {
    cities: ["San Francisco, CA", "London, UK", "Singapore", "Toronto, Canada", "Berlin, Germany", "Sydney, Australia", "New York, NY"],
    countries: ["US", "GB", "SG", "CA", "DE", "AU", "US"]
  }
};

const firstNames = ["Sarah", "Marcus", "Priya", "David", "Emma", "James", "Lisa", "Michael", "Anna", "Robert", "Maria", "John", "Sophie", "Alex", "Rachel", "Daniel", "Jennifer", "Chris", "Amanda", "Kevin"];
const lastNames = ["Chen", "Johnson", "Patel", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez"];

// Dynamic lead generation function
const generateDynamicLeads = (filters: LeadFilters, platform: string, count: number = 5): DiscoveredLead[] => {
  const leads: DiscoveredLead[] = [];
  const targetIndustry = filters.industry === "All Industries" ? 
    Object.keys(leadTemplates)[Math.floor(Math.random() * Object.keys(leadTemplates).length)] : 
    filters.industry;
  
  const industryTemplate = leadTemplates[targetIndustry as keyof typeof leadTemplates] || leadTemplates.SaaS;
  const locationKey = filters.location === "Global" ? "Global" : filters.location;
  const locationInfo = locationData[locationKey as keyof typeof locationData] || locationData.Global;
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = industryTemplate.companies[Math.floor(Math.random() * industryTemplate.companies.length)];
    const title = industryTemplate.titles[Math.floor(Math.random() * industryTemplate.titles.length)];
    const description = industryTemplate.descriptions[Math.floor(Math.random() * industryTemplate.descriptions.length)];
    const budget = filters.budgetRange === "Any Budget" ? 
      industryTemplate.budgets[Math.floor(Math.random() * industryTemplate.budgets.length)] : 
      filters.budgetRange;
    const location = locationInfo.cities[Math.floor(Math.random() * locationInfo.cities.length)];
    const country = locationInfo.countries[Math.floor(Math.random() * locationInfo.countries.length)];
    const urgency = filters.urgency === "Any" ? 
      ["High", "Medium", "Low"][Math.floor(Math.random() * 3)] as "High" | "Medium" | "Low" : 
      filters.urgency as "High" | "Medium" | "Low";
    
    const score = Math.floor(Math.random() * 30) + 70; // Score between 70-100
    const lastActiveOptions = ["2 hours ago", "5 hours ago", "1 day ago", "2 days ago", "3 hours ago", "6 hours ago", "12 hours ago"];
    const lastActive = lastActiveOptions[Math.floor(Math.random() * lastActiveOptions.length)];
    
    // Generate contact info based on platform
    const contactInfo: { email?: string; linkedin?: string; twitter?: string } = {};
    const emailDomain = company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
    
    if (platform === 'LinkedIn' || Math.random() > 0.3) {
      contactInfo.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
      contactInfo.linkedin = `linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    }
    if (platform === 'Twitter' || Math.random() > 0.7) {
      contactInfo.twitter = `@${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    }
    if (!contactInfo.email && !contactInfo.linkedin && !contactInfo.twitter) {
      contactInfo.email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
    }
    
    leads.push({
      id: `${platform}-${Date.now()}-${i}`,
      name: `${firstName} ${lastName}`,
      company,
      title,
      location,
      country,
      industry: targetIndustry,
      budget,
      urgency,
      score,
      platforms: [platform],
      description: `${description}. ${urgency === 'High' ? 'Urgent timeline required.' : urgency === 'Medium' ? 'Flexible timeline.' : 'Long-term project planning.'}`,
      contactInfo,
      lastActive
    });
  }
  
  return leads;
};

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

export default function LeadDiscovery() {
  const { settings } = useSettings();
  
  // Initialize filters with user preferences from Settings
  const [filters, setFilters] = useState<LeadFilters>({
    industry: 'All Industries',
    location: 'Global',
    budgetRange: 'Any Budget',
    urgency: 'Any',
    platforms: []
  });
  const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchPlatforms, setSearchPlatforms] = useState<{[key: string]: boolean}>({});
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  // Use API settings from Settings context
  const [useRealTimeAPI, setUseRealTimeAPI] = useState(false);
  const [userPlan, setUserPlan] = useState<'starter' | 'pro' | 'elite'>('pro'); // This would come from user context/auth
  
  const availablePlatforms = ['LinkedIn', 'Upwork', 'AngelList', 'Crunchbase', 'Twitter', 'Behance'];

  // Sync with Settings context when preferences change
  useEffect(() => {
    if (settings) {
      setFilters(prev => ({
        ...prev,
        industry: settings.searchPreferences.defaultIndustry || prev.industry,
        location: settings.searchPreferences.defaultLocation || prev.location,
        budgetRange: settings.searchPreferences.defaultBudgetRange || prev.budgetRange,
        urgency: settings.searchPreferences.defaultUrgency || prev.urgency,
        platforms: settings.searchPreferences.preferredPlatforms.length > 0 
          ? settings.searchPreferences.preferredPlatforms 
          : prev.platforms
      }));
      setUseRealTimeAPI(settings.apiSettings.useRealTimeAPI);
    }
  }, [settings]);

  const [selectedLead, setSelectedLead] = useState<DiscoveredLead | null>(null);
  const [generatingPitch, setGeneratingPitch] = useState<string | null>(null);
  const [contactingLead, setContactingLead] = useState<string | null>(null);

  const togglePlatform = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    setFilters({ ...filters, platforms: newPlatforms });
  };

  // Enhanced search functionality with dynamic lead generation
  const searchPlatformAPIs = {
    LinkedIn: async (filters: LeadFilters) => {
      // Simulate LinkedIn API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const leadCount = Math.floor(Math.random() * 8) + 3; // 3-10 leads
      return generateDynamicLeads(filters, 'LinkedIn', leadCount);
    },
    Upwork: async (filters: LeadFilters) => {
      // Simulate Upwork API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 800));
      const leadCount = Math.floor(Math.random() * 6) + 2; // 2-7 leads
      return generateDynamicLeads(filters, 'Upwork', leadCount);
    },
    AngelList: async (filters: LeadFilters) => {
      // Simulate AngelList API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 1200));
      const leadCount = Math.floor(Math.random() * 5) + 2; // 2-6 leads
      return generateDynamicLeads(filters, 'AngelList', leadCount);
    },
    Crunchbase: async (filters: LeadFilters) => {
      // Simulate Crunchbase API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 900));
      const leadCount = Math.floor(Math.random() * 7) + 3; // 3-9 leads
      return generateDynamicLeads(filters, 'Crunchbase', leadCount);
    },
    'Company Websites': async (filters: LeadFilters) => {
      // Simulate web scraping search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const leadCount = Math.floor(Math.random() * 4) + 2; // 2-5 leads
      return generateDynamicLeads(filters, 'Company Websites', leadCount);
    },
    Twitter: async (filters: LeadFilters) => {
      // Simulate Twitter API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 700));
      const leadCount = Math.floor(Math.random() * 6) + 2; // 2-7 leads
      return generateDynamicLeads(filters, 'Twitter', leadCount);
    },
    Behance: async (filters: LeadFilters) => {
      // Simulate Behance API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 600));
      const leadCount = Math.floor(Math.random() * 5) + 2; // 2-6 leads
      return generateDynamicLeads(filters, 'Behance', leadCount);
    },
    Fiverr: async (filters: LeadFilters) => {
      // Simulate Fiverr API search with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 500));
      const leadCount = Math.floor(Math.random() * 4) + 2; // 2-5 leads
      return generateDynamicLeads(filters, 'Fiverr', leadCount);
    },
    'Industry Forums': async (filters: LeadFilters) => {
      // Simulate forum scraping with dynamic lead generation
      await new Promise(resolve => setTimeout(resolve, 1100));
      const leadCount = Math.floor(Math.random() * 3) + 1; // 1-3 leads
      return generateDynamicLeads(filters, 'Industry Forums', leadCount);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchProgress(0);
    setDiscoveredLeads([]);
    setSearchPlatforms({});
    setApiErrors([]);

    // Use preferred platforms from Settings if available, otherwise use selected platforms
    const selectedPlatforms = filters.platforms.length > 0 
      ? filters.platforms 
      : settings?.searchPreferences.preferredPlatforms.length > 0
        ? settings.searchPreferences.preferredPlatforms
        : availablePlatforms;
    
    try {
      // Use real-time API based on Settings context
      const shouldUseRealTime = settings?.apiSettings.useRealTimeAPI && useRealTimeAPI;
      
      if (shouldUseRealTime) {
        // Use Real-Time API Service with Settings configuration
        console.log('🔍 Starting real-time API search across platforms:', selectedPlatforms);
        console.log('📋 Using Settings preferences:', {
          cacheTimeout: settings?.apiSettings.cacheTimeout,
          maxResults: settings?.apiSettings.maxResultsPerPlatform,
          fallback: settings?.apiSettings.fallbackToSimulation
        });
        
        // Set all platforms as searching
        const platformStatus: {[key: string]: boolean} = {};
        selectedPlatforms.forEach(platform => {
          platformStatus[platform] = true;
        });
        setSearchPlatforms(platformStatus);
        
        // Simulate progressive updates for better UX
        const progressInterval = setInterval(() => {
          setSearchProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 15;
          });
        }, 500);

        // Call real-time API service with Settings configuration
        const realTimeResults = await RealTimeLeadAPI.searchAllPlatforms(
          filters, 
          selectedPlatforms,
          {
            cacheTimeout: settings?.apiSettings.cacheTimeout || 300000,
            maxResultsPerPlatform: settings?.apiSettings.maxResultsPerPlatform || 10,
            rateLimitBuffer: settings?.apiSettings.rateLimitBuffer || 20,
            requestTimeout: settings?.apiSettings.requestTimeout || 30000
          }
        );
        
        clearInterval(progressInterval);
        setSearchProgress(100);
        
        // Mark all platforms as complete
        selectedPlatforms.forEach(platform => {
          setSearchPlatforms(prev => ({ ...prev, [platform]: false }));
        });

        // Apply plan limits
        const planLimits = { starter: 5, pro: 15, elite: realTimeResults.length };
        const limitedResults = realTimeResults.slice(0, planLimits[userPlan as keyof typeof planLimits] || 5);
        
        console.log(`✅ Real-time search completed: ${realTimeResults.length} leads found, ${limitedResults.length} returned`);
        setDiscoveredLeads(limitedResults);
        
      } else {
        // Fallback to enhanced simulation
        console.log('🔄 Using enhanced simulation mode (Settings preference or API disabled)');
        await handleSimulatedSearch(selectedPlatforms);
      }
      
    } catch (error) {
      console.error('❌ Real-time API search failed:', error);
      setApiErrors([`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      
      // Fallback to simulation if enabled in Settings
      if (settings?.apiSettings.fallbackToSimulation) {
        console.log('🔄 Falling back to enhanced simulation (Settings enabled)');
        await handleSimulatedSearch(selectedPlatforms);
      } else {
        console.log('❌ Fallback disabled in Settings - search failed');
      }
    }
    
    setIsSearching(false);
  };

  const handleSimulatedSearch = async (selectedPlatforms: string[]) => {
    const totalPlatforms = selectedPlatforms.length;
    let completedPlatforms = 0;
    let allResults: DiscoveredLead[] = [];

    // Search each platform in parallel (simulation)
    const searchPromises = selectedPlatforms.map(async (platform) => {
      try {
        setSearchPlatforms(prev => ({ ...prev, [platform]: true }));
        
        const platformAPI = searchPlatformAPIs[platform as keyof typeof searchPlatformAPIs];
        if (platformAPI) {
          const results = await platformAPI(filters);
          allResults = [...allResults, ...results];
        }
        
        completedPlatforms++;
        setSearchProgress((completedPlatforms / totalPlatforms) * 100);
        setSearchPlatforms(prev => ({ ...prev, [platform]: false }));
      } catch (error) {
        console.error(`Error searching ${platform}:`, error);
        completedPlatforms++;
        setSearchProgress((completedPlatforms / totalPlatforms) * 100);
      }
    });

    await Promise.all(searchPromises);

    // Remove duplicates and apply additional filters
    const uniqueResults = allResults.filter((lead, index, self) => 
      index === self.findIndex(l => l.id === lead.id)
    );

    const filteredResults = uniqueResults.filter(lead => {
      const matchesIndustry = filters.industry === "All Industries" || lead.industry === filters.industry;
      const matchesLocation = filters.location === "Global" || lead.location.includes(filters.location);
      const matchesUrgency = filters.urgency === "Any" || lead.urgency === filters.urgency;
      const matchesBudget = filters.budgetRange === "Any Budget" || 
        lead.budget.includes(filters.budgetRange.split(' - ')[0]) ||
        lead.budget.includes(filters.budgetRange.split(' - ')[1]);
      
      return matchesIndustry && matchesLocation && matchesUrgency && matchesBudget;
    });

    // Apply plan limits
    const planLimits = { starter: 3, pro: 10, elite: filteredResults.length };
    const limitedResults = filteredResults.slice(0, planLimits[userPlan as keyof typeof planLimits] || 3);
    
    setDiscoveredLeads(limitedResults);
  };

  // Generate AI pitch for a specific lead
  const handleGeneratePitch = async (lead: DiscoveredLead) => {
    setGeneratingPitch(lead.id);
    
    try {
      // Simulate AI pitch generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pitchTemplates = {
        SaaS: `Hi ${lead.name},\n\nI noticed ${lead.company} is in the ${lead.industry} space. I help companies like yours scale their marketing efforts in global markets.\n\nGiven your current needs (${lead.description}), I believe we could help you achieve significant growth.\n\nWould you be open to a 15-minute call to discuss how we've helped similar companies increase their revenue by 40%?\n\nBest regards,\n${settings?.profile.fullName || 'Your Name'}`,
        Fintech: `Hello ${lead.name},\n\nI see ${lead.company} is expanding in the fintech sector. As someone who specializes in helping fintech companies navigate global markets, I'd love to connect.\n\nYour mention of "${lead.description}" resonates with challenges I've helped other fintech leaders solve.\n\nCould we schedule a brief call to explore potential synergies?\n\nBest,\n${settings?.profile.fullName || 'Your Name'}`,
        default: `Dear ${lead.name},\n\nI came across ${lead.company} and was impressed by your work in ${lead.industry}.\n\nBased on your current priorities: "${lead.description}", I believe there's potential for collaboration.\n\nWould you be interested in a quick conversation to explore how we might work together?\n\nRegards,\n${settings?.profile.fullName || 'Your Name'}`
      };
      
      const pitch = pitchTemplates[lead.industry as keyof typeof pitchTemplates] || pitchTemplates.default;
      
      // Navigate to Pitch Composer with pre-filled content
      const pitchComposerData = {
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        generatedPitch: pitch,
        leadData: lead
      };
      
      // Store in localStorage for Pitch Composer to pick up
      localStorage.setItem('leadPitchData', JSON.stringify(pitchComposerData));
      
      // Show success message
      alert(`✨ AI Pitch Generated!\n\nA personalized pitch for ${lead.name} at ${lead.company} has been created. Navigate to Pitch Composer to review and send.`);
      
    } catch (error) {
      console.error('Error generating pitch:', error);
      alert('❌ Error generating pitch. Please try again.');
    } finally {
      setGeneratingPitch(null);
    }
  };

  // Contact lead directly
  const handleContactLead = async (lead: DiscoveredLead) => {
    setContactingLead(lead.id);
    
    try {
      // Simulate contact process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const contactMethods = [];
      if (lead.contactInfo.email) contactMethods.push(`📧 Email: ${lead.contactInfo.email}`);
      if (lead.contactInfo.linkedin) contactMethods.push(`💼 LinkedIn: ${lead.contactInfo.linkedin}`);
      if (lead.contactInfo.twitter) contactMethods.push(`🐦 Twitter: ${lead.contactInfo.twitter}`);
      
      const contactInfo = contactMethods.join('\n');
      
      // Show contact information
      alert(`📞 Contact Information for ${lead.name}\n\n${contactInfo}\n\n✅ Contact details have been copied to your clipboard!`);
      
      // Copy primary contact method to clipboard
      if (lead.contactInfo.email) {
        await navigator.clipboard.writeText(lead.contactInfo.email);
      } else if (lead.contactInfo.linkedin) {
        await navigator.clipboard.writeText(lead.contactInfo.linkedin);
      }
      
    } catch (error) {
      console.error('Error contacting lead:', error);
      alert('❌ Error retrieving contact information. Please try again.');
    } finally {
      setContactingLead(null);
    }
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
            {availablePlatforms.map(platform => (
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

        {/* API Mode Toggle */}
        <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Search Mode</h3>
              <p className="text-gray-400 text-sm">
                {useRealTimeAPI ? 'Real-time API integration with live data' : 'Enhanced simulation with realistic data'}
              </p>
            </div>
            <button
              onClick={() => setUseRealTimeAPI(!useRealTimeAPI)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                useRealTimeAPI ? 'bg-gradient-primary' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useRealTimeAPI ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {useRealTimeAPI && (
            <div className="mt-3 text-xs text-yellow-400">
              ⚠️ Requires API keys in environment variables. Falls back to simulation if APIs fail.
            </div>
          )}
        </div>

        {/* API Errors Display */}
        {apiErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400">⚠️</span>
              <h3 className="text-red-300 font-semibold">API Connection Issues</h3>
            </div>
            <ul className="text-red-200 text-sm space-y-1">
              {apiErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
            <p className="text-red-300 text-xs mt-2">
              Automatically switched to enhanced simulation mode.
            </p>
          </div>
        )}

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
                <span>{useRealTimeAPI ? 'Searching Live APIs...' : 'AI Scanning Global Markets...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">{useRealTimeAPI ? '🌐' : '🔍'}</span>
                <span>{useRealTimeAPI ? 'Search Real-Time APIs' : 'Discover Global Leads'}</span>
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
              {Object.entries(searchPlatforms).map(([platform, isSearching]) => (
                <div key={platform} className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-2xl mb-2">
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                    ) : (
                      platform === 'LinkedIn' ? '💼' :
                      platform === 'Upwork' ? '💻' :
                      platform === 'AngelList' ? '🚀' :
                      platform === 'Crunchbase' ? '📊' :
                      platform === 'Company Websites' ? '🌐' :
                      platform === 'Twitter' ? '🐦' :
                      platform === 'Behance' ? '🎨' :
                      platform === 'Fiverr' ? '⭐' :
                      platform === 'Industry Forums' ? '💬' : '🔍'
                    )}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">{platform}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {isSearching ? 'Searching...' : 'Complete'}
                  </div>
                </div>
              ))}
              {Object.keys(searchPlatforms).length === 0 && (
                <>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="text-gray-300 text-sm">Scanning</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-gray-300 text-sm">AI Analysis</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-gray-300 text-sm">Scoring</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-gray-300 text-sm">Filtering</div>
                  </div>
                </>
              )}
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
                  <button 
                    onClick={() => handleGeneratePitch(lead)}
                    disabled={generatingPitch === lead.id}
                    className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {generatingPitch === lead.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating...
                        </>
                      ) : (
                        <>✨ Generate Pitch</>
                      )}
                    </span>
                  </button>
                  <button 
                    onClick={() => handleContactLead(lead)}
                    disabled={contactingLead === lead.id}
                    className="px-6 py-3 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactingLead === lead.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                        Contacting...
                      </div>
                    ) : (
                      '📧 Contact'
                    )}
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
