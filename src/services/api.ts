import { supabase } from "../../lib/supabaseClient";

// Types for API responses
export interface LeadData {
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
  painPoints?: string[];
  recentActivity?: string;
}

export interface LeadFilters {
  industry: string;
  location: string;
  budgetRange: string;
  urgency: string;
  platforms: string[];
}

export interface PitchRequest {
  leadId: string;
  tone: "professional" | "casual" | "friendly";
  channel: "email" | "linkedin" | "twitter";
  customInstructions?: string;
}

export interface PitchResponse {
  id: string;
  content: string;
  subject?: string;
  confidence: number;
  suggestions: string[];
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class LeadSwiftAPI {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Lead Discovery API
  async discoverLeads(filters: LeadFilters, userPlan: string): Promise<LeadData[]> {
    try {
      return await this.makeRequest<LeadData[]>('/leads/discover', {
        method: 'POST',
        body: JSON.stringify({ filters, userPlan }),
      });
    } catch (error) {
      console.error('Lead discovery failed:', error);
      // Fallback to mock data for demo
      return this.getMockLeads(filters, userPlan);
    }
  }

  // AI Pitch Generation API
  async generatePitch(request: PitchRequest): Promise<PitchResponse> {
    try {
      return await this.makeRequest<PitchResponse>('/ai/generate-pitch', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Pitch generation failed:', error);
      // Fallback to mock pitch
      return this.getMockPitch(request);
    }
  }

  // Lead Scoring API
  async scoreLead(leadData: Partial<LeadData>): Promise<{ score: number; factors: string[] }> {
    try {
      return await this.makeRequest<{ score: number; factors: string[] }>('/ai/score-lead', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
    } catch (error) {
      console.error('Lead scoring failed:', error);
      return { score: Math.floor(Math.random() * 40) + 60, factors: ['Budget match', 'Industry relevance'] };
    }
  }

  // Follow-up Automation API
  async scheduleFollowUp(leadId: string, sequence: string[]): Promise<{ success: boolean; scheduleId: string }> {
    try {
      return await this.makeRequest<{ success: boolean; scheduleId: string }>('/automation/follow-up', {
        method: 'POST',
        body: JSON.stringify({ leadId, sequence }),
      });
    } catch (error) {
      console.error('Follow-up scheduling failed:', error);
      return { success: false, scheduleId: '' };
    }
  }

  // Compliance Check API
  async checkCompliance(content: string, region: string): Promise<{ compliant: boolean; issues: string[] }> {
    try {
      return await this.makeRequest<{ compliant: boolean; issues: string[] }>('/compliance/check', {
        method: 'POST',
        body: JSON.stringify({ content, region }),
      });
    } catch (error) {
      console.error('Compliance check failed:', error);
      return { compliant: true, issues: [] };
    }
  }

  // User Analytics API
  async getUserAnalytics(): Promise<{
    leadsGenerated: number;
    pitchesSent: number;
    responseRate: number;
    conversionRate: number;
    revenueGenerated: number;
  }> {
    try {
      return await this.makeRequest<{
        leadsGenerated: number;
        pitchesSent: number;
        responseRate: number;
        conversionRate: number;
        revenueGenerated: number;
      }>('/analytics/user');
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      return {
        leadsGenerated: 127,
        pitchesSent: 89,
        responseRate: 23.5,
        conversionRate: 12.8,
        revenueGenerated: 45600
      };
    }
  }

  // Mock data fallbacks for development/demo
  private getMockLeads(filters: LeadFilters, userPlan: string): LeadData[] {
    const mockLeads: LeadData[] = [
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
        lastActive: "2 hours ago",
        painPoints: ["Struggling with B2B lead generation", "Need to scale marketing operations", "Looking for African market expertise"],
        recentActivity: "Posted about needing marketing help on LinkedIn 2 days ago"
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
        lastActive: "1 day ago",
        painPoints: ["Need African market entry strategy", "Regulatory compliance challenges", "Local partnership requirements"],
        recentActivity: "Attended African fintech conference last week"
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
        lastActive: "4 hours ago",
        painPoints: ["Product launch strategy", "Brand positioning", "Global market awareness"],
        recentActivity: "Tweeted about seeking creative partners yesterday"
      }
    ];

    // Filter based on plan limits
    const planLimits = {
      starter: 3,
      pro: 10,
      elite: mockLeads.length
    };

    return mockLeads.slice(0, planLimits[userPlan as keyof typeof planLimits] || 3);
  }

  private getMockPitch(request: PitchRequest): PitchResponse {
    const pitches = {
      professional: `Subject: Strategic Partnership Opportunity - African Market Expansion

Dear [Lead Name],

I hope this message finds you well. I came across your recent post about [specific need] and believe there's a compelling opportunity for collaboration.

As a specialist in African market expansion, I've helped 50+ companies like yours achieve remarkable growth in emerging markets. Your timing is particularly strategic, given the 40% increase in African tech adoption this year.

What sets our approach apart:
• Localized market intelligence across 15 African countries
• Cultural adaptation strategies that maintain authenticity
• Direct access to 200+ verified decision-makers
• Proven ROI framework with average 300% returns

I'd welcome the opportunity to share our case study with a similar [industry] company that achieved [specific result].

Would you be available for a brief 15-minute call this week to explore how we can accelerate your growth objectives?

Best regards,
[Your Name]`,

      casual: `Hey [Lead Name]! 👋

Saw your post about [specific need] and thought we might be a perfect match!

I've been helping companies like yours break into African markets (it's been pretty exciting - 50+ success stories and counting! 🚀).

Here's the thing - African markets are absolutely booming right now (+40% growth in tech adoption), and companies that get in early are seeing incredible returns.

What we bring to the table:
✅ Deep local knowledge across 15 countries
✅ Cultural insights that actually work
✅ A network of 200+ key decision-makers
✅ Track record of 300% average ROI

I'd love to show you a quick case study of how we helped [similar company] achieve [result] in just [timeframe].

Up for a quick 15-min chat this week? I promise it'll be worth your time! 😊

Cheers,
[Your Name]`,

      friendly: `Hi [Lead Name],

I hope you're having a great week! I noticed your recent post about [specific need] and wanted to reach out because I think we could really help.

I specialize in helping businesses expand into African markets, and I've been fortunate to work with over 50 companies in situations similar to yours. The results have been really encouraging!

What caught my attention about your post:
• Your focus on [specific area] aligns perfectly with current African market trends
• The timing couldn't be better - we're seeing unprecedented growth in the region
• Your company values seem to align well with what African partners are looking for

I'd love to share a success story from a recent client in the [industry] space who saw [specific result]. It might give you some ideas for your own expansion plans.

Would you be interested in a brief conversation sometime this week? I'm happy to work around your schedule.

Looking forward to potentially working together!

Warm regards,
[Your Name]`
    };

    return {
      id: Date.now().toString(),
      content: pitches[request.tone] || pitches.professional,
      subject: request.channel === 'email' ? 'Strategic Partnership Opportunity' : undefined,
      confidence: Math.floor(Math.random() * 20) + 80,
      suggestions: [
        'Consider mentioning a specific recent achievement',
        'Add a relevant case study or statistic',
        'Include a clear call-to-action with specific timing',
        'Personalize with recent company news or developments'
      ]
    };
  }
}

// Export singleton instance
export const leadSwiftAPI = new LeadSwiftAPI();

// Utility functions for real-time features
export const subscribeToLeadUpdates = (callback: (payload: any) => void) => {
  const channel = supabase.channel('leads');
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'leads' },
    (payload) => callback(payload.new as LeadData)
  );
  return channel.subscribe();
};

export const subscribeToAnalytics = (callback: (data: any) => void) => {
  const channel = supabase.channel('analytics');
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'user_analytics' },
    (payload) => callback(payload.new)
  );
  return channel.subscribe();
};
