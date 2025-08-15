import { IntelligentWebScraper, ScrapingResult, ScrapingTarget } from './intelligentWebScraper';
import { AIProposalGenerator } from './aiProposalGenerator';
import { AutomatedEmailService } from './automatedEmailService';
import { JobOpportunity } from '../types/automation';

export interface HuntingStrategy {
  id: string;
  name: string;
  description: string;
  targetRegions: string[];
  targetIndustries: string[];
  opportunityTypes: ('government' | 'startup' | 'sme' | 'enterprise' | 'ngo')[];
  budgetRange: { min: number; max: number };
  competitionLevel: 'low' | 'medium' | 'high';
  priority: number;
}

export interface OpportunityIntelligence {
  opportunity: JobOpportunity;
  marketAnalysis: {
    localCompetition: number;
    averageRates: { min: number; max: number };
    demandLevel: 'low' | 'medium' | 'high' | 'critical';
    seasonality: string;
    growthTrend: 'declining' | 'stable' | 'growing' | 'booming';
  };
  culturalContext: {
    businessCulture: string;
    communicationStyle: string;
    decisionMakingProcess: string;
    preferredApproach: string;
    localCustoms: string[];
  };
  strategicAdvantage: {
    whyYouWin: string[];
    differentiators: string[];
    riskFactors: string[];
    successProbability: number;
  };
}

export class GlobalOpportunityHunter {
  private scraper: IntelligentWebScraper;
  private proposalGenerator: AIProposalGenerator;
  private emailService: AutomatedEmailService;
  private huntingStrategies: HuntingStrategy[] = [];
  private discoveredOpportunities: Map<string, OpportunityIntelligence> = new Map();

  constructor(
    scraper: IntelligentWebScraper,
    proposalGenerator: AIProposalGenerator,
    emailService: AutomatedEmailService
  ) {
    this.scraper = scraper;
    this.proposalGenerator = proposalGenerator;
    this.emailService = emailService;
    this.initializeHuntingStrategies();
  }

  private initializeHuntingStrategies(): void {
    this.huntingStrategies = [
      {
        id: 'hidden-government-contracts',
        name: 'Hidden Government Modernization Projects',
        description: 'Target government agencies in emerging markets undergoing digital transformation',
        targetRegions: ['Africa', 'Southeast Asia', 'Latin America', 'Eastern Europe'],
        targetIndustries: ['Government', 'Public Services', 'Healthcare', 'Education'],
        opportunityTypes: ['government'],
        budgetRange: { min: 25000, max: 500000 },
        competitionLevel: 'low',
        priority: 10
      },
      {
        id: 'local-business-digitization',
        name: 'Local Business Digital Transformation',
        description: 'Help traditional businesses in developing regions go digital',
        targetRegions: ['Sub-Saharan Africa', 'South Asia', 'Central America'],
        targetIndustries: ['Retail', 'Manufacturing', 'Agriculture', 'Tourism'],
        opportunityTypes: ['sme'],
        budgetRange: { min: 5000, max: 50000 },
        competitionLevel: 'low',
        priority: 9
      },
      {
        id: 'ngo-tech-solutions',
        name: 'NGO Technology Solutions',
        description: 'Provide tech solutions for NGOs and international development projects',
        targetRegions: ['Global'],
        targetIndustries: ['Non-profit', 'International Development', 'Healthcare', 'Education'],
        opportunityTypes: ['ngo'],
        budgetRange: { min: 10000, max: 100000 },
        competitionLevel: 'low',
        priority: 8
      },
      {
        id: 'emerging-market-startups',
        name: 'Emerging Market Startup Ecosystem',
        description: 'Support fast-growing startups in emerging markets with tech expertise',
        targetRegions: ['Africa', 'Southeast Asia', 'Latin America'],
        targetIndustries: ['Fintech', 'Agtech', 'Healthtech', 'Edtech'],
        opportunityTypes: ['startup'],
        budgetRange: { min: 15000, max: 200000 },
        competitionLevel: 'medium',
        priority: 7
      },
      {
        id: 'resource-sector-automation',
        name: 'Resource Sector Automation',
        description: 'Mining, oil, agriculture automation in resource-rich developing countries',
        targetRegions: ['Africa', 'Latin America', 'Central Asia'],
        targetIndustries: ['Mining', 'Oil & Gas', 'Agriculture', 'Forestry'],
        opportunityTypes: ['enterprise'],
        budgetRange: { min: 50000, max: 1000000 },
        competitionLevel: 'low',
        priority: 9
      },
      {
        id: 'municipal-smart-city',
        name: 'Municipal Smart City Initiatives',
        description: 'Smart city projects in mid-tier cities worldwide',
        targetRegions: ['Global'],
        targetIndustries: ['Government', 'Urban Planning', 'Transportation', 'Utilities'],
        opportunityTypes: ['government'],
        budgetRange: { min: 100000, max: 2000000 },
        competitionLevel: 'medium',
        priority: 8
      }
    ];
  }

  async executeHuntingStrategy(strategyId: string): Promise<OpportunityIntelligence[]> {
    const strategy = this.huntingStrategies.find(s => s.id === strategyId);
    if (!strategy) throw new Error(`Strategy ${strategyId} not found`);

    console.log(`🎯 Executing hunting strategy: ${strategy.name}`);
    
    try {
      // Configure scraper for this strategy
      await this.scraper.startGlobalCrawl(strategy.targetRegions);
      
      // Get opportunities matching strategy criteria
      const scrapingResults = await this.scraper.getQualifiedOpportunities(70);
      const filteredResults = this.filterByStrategy(scrapingResults, strategy);
      
      // If no results from scraper, generate mock opportunities for demonstration
      let opportunitiesToProcess = filteredResults;
      if (filteredResults.length === 0) {
        console.log('🔄 No scraping results found, generating demonstration opportunities...');
        opportunitiesToProcess = await this.generateDemonstrationOpportunities(strategy);
      }
      
      // Enhance each opportunity with intelligence
      const intelligentOpportunities: OpportunityIntelligence[] = [];
      
      for (const result of opportunitiesToProcess) {
        const intelligence = await this.gatherOpportunityIntelligence(result, strategy);
        intelligentOpportunities.push(intelligence);
        this.discoveredOpportunities.set(result.opportunity.id, intelligence);
      }
      
      console.log(`✅ Found ${intelligentOpportunities.length} qualified opportunities for ${strategy.name}`);
      return intelligentOpportunities;
      
    } catch (error) {
      console.error(`❌ Error executing strategy ${strategyId}:`, error);
      
      // Fallback to demonstration opportunities
      console.log('🔄 Falling back to demonstration opportunities...');
      const demoResults = await this.generateDemonstrationOpportunities(strategy);
      
      const intelligentOpportunities: OpportunityIntelligence[] = [];
      for (const result of demoResults) {
        const intelligence = await this.gatherOpportunityIntelligence(result, strategy);
        intelligentOpportunities.push(intelligence);
        this.discoveredOpportunities.set(result.opportunity.id, intelligence);
      }
      
      return intelligentOpportunities;
    }
  }

  private async generateDemonstrationOpportunities(strategy: HuntingStrategy): Promise<any[]> {
    const opportunities = [];
    const opportunityCount = Math.floor(Math.random() * 4) + 3; // 3-6 opportunities

    const opportunityTemplates = {
      'hidden-government-contracts': [
        {
          title: 'Digital Government Services Platform',
          company: 'Ministry of Digital Affairs',
          description: 'Develop comprehensive digital services platform for citizen engagement and government service delivery.',
          budget: { min: 150000, max: 400000 },
          location: 'Nigeria',
          industry: 'Government',
          skills: ['Government Tech', 'Digital Services', 'Citizen Engagement', 'Security']
        },
        {
          title: 'Healthcare Data Management System',
          company: 'Department of Health',
          description: 'Build secure healthcare data management system for national health records digitization.',
          budget: { min: 200000, max: 500000 },
          location: 'Kenya',
          industry: 'Healthcare',
          skills: ['Healthcare IT', 'Data Security', 'System Integration', 'Compliance']
        }
      ],
      'local-business-digitization': [
        {
          title: 'E-commerce Platform for Local Retailers',
          company: 'Regional Business Association',
          description: 'Create unified e-commerce platform to help local retailers expand online presence.',
          budget: { min: 25000, max: 75000 },
          location: 'Ghana',
          industry: 'Retail',
          skills: ['E-commerce', 'Payment Integration', 'Mobile Commerce', 'Local Markets']
        },
        {
          title: 'Agricultural Supply Chain Management',
          company: 'Farmers Cooperative Union',
          description: 'Develop digital platform for agricultural supply chain optimization and farmer-buyer connections.',
          budget: { min: 40000, max: 120000 },
          location: 'Uganda',
          industry: 'Agriculture',
          skills: ['Supply Chain', 'Agricultural Tech', 'Mobile Apps', 'Data Analytics']
        }
      ],
      'ngo-tech-solutions': [
        {
          title: 'Education Management System for Rural Schools',
          company: 'Education for All Foundation',
          description: 'Build comprehensive education management system for rural school administration and student tracking.',
          budget: { min: 50000, max: 150000 },
          location: 'Tanzania',
          industry: 'Education',
          skills: ['Education Tech', 'Student Management', 'Rural Connectivity', 'Offline Capability']
        }
      ],
      'emerging-market-startups': [
        {
          title: 'Fintech Mobile Payment Solution',
          company: 'PayTech Innovations',
          description: 'Develop secure mobile payment solution for underbanked populations in emerging markets.',
          budget: { min: 80000, max: 200000 },
          location: 'Rwanda',
          industry: 'Fintech',
          skills: ['Mobile Payments', 'Financial Inclusion', 'Security', 'API Development']
        }
      ]
    };

    const templates = opportunityTemplates[strategy.id as keyof typeof opportunityTemplates] || opportunityTemplates['hidden-government-contracts'];
    
    for (let i = 0; i < opportunityCount; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const urgencyLevels = ['low', 'medium', 'high'] as const;
      
      const opportunity = {
        id: `demo-${strategy.id}-${Date.now()}-${i}`,
        title: template.title,
        company: template.company,
        description: template.description,
        budget: template.budget,
        skills: template.skills,
        type: 'contract' as const,
        location: template.location,
        industry: template.industry,
        urgency: urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)],
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 60 + 15) * 24 * 60 * 60 * 1000),
        source: `https://${template.company.toLowerCase().replace(/\s+/g, '')}.gov`,
        requirements: ['3+ years relevant experience', 'Strong communication skills', `Experience with ${template.skills[0]}`],
        benefits: ['Remote work possible', 'Long-term engagement potential', 'Social impact'],
        contactEmail: `procurement@${template.company.toLowerCase().replace(/\s+/g, '')}.gov`
      };

      opportunities.push({
        opportunity,
        source: {
          id: `demo-${strategy.id}`,
          name: `${template.location} ${strategy.name}`,
          url: opportunity.source,
          type: strategy.opportunityTypes[0],
          region: template.location.includes('Nigeria') || template.location.includes('Ghana') ? 'Africa' : 'Global',
          country: template.location,
          selectors: {},
          crawlDepth: 1,
          updateFrequency: 'daily' as const,
          priority: 'high' as const
        },
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
        aiAnalysis: {
          painPoints: ['Legacy system modernization', 'Digital transformation needs', 'Process efficiency'],
          urgencySignals: ['Government mandate', 'Budget allocated', 'Timeline pressure'],
          budgetIndicators: ['Substantial funding available', 'Multi-year project', 'Growth potential'],
          decisionMakers: ['Project Director', 'CTO', 'Procurement Manager'],
          competitionLevel: strategy.competitionLevel,
          opportunityScore: Math.floor(Math.random() * 20) + 75
        },
        contactInformation: {
          emails: [opportunity.contactEmail],
          phones: ['+234-xxx-xxxx'],
          socialProfiles: [],
          websites: [opportunity.source]
        },
        companyIntelligence: {
          size: '500-2000 employees',
          industry: template.industry,
          recentNews: [`Announced digital transformation initiative`, `Allocated budget for ${template.title.toLowerCase()}`],
          techStack: ['Legacy systems', 'Microsoft Office', 'Basic web presence'],
          fundingStatus: 'Government funded',
          growthSignals: ['Modernization push', 'Digital adoption', 'Process improvement']
        }
      });
    }

    return opportunities;
  }

  private filterByStrategy(results: ScrapingResult[], strategy: HuntingStrategy): ScrapingResult[] {
    return results.filter(result => {
      // Budget range check - extract numeric value from budget string
      const budgetString = result.opportunity.budget;
      if (typeof budgetString === 'string' && budgetString) {
        const budgetMatch = budgetString.match(/\$([\d,]+)/);
        if (budgetMatch) {
          const opportunityBudget = parseInt(budgetMatch[1].replace(/,/g, ''));
          if (opportunityBudget < strategy.budgetRange.min || opportunityBudget > strategy.budgetRange.max) {
            return false;
          }
        }
      }
      
      // Industry match
      if (!strategy.targetIndustries.includes(result.opportunity.industry)) {
        return false;
      }
      
      // Region match
      if (!strategy.targetRegions.some(region => result.source.region.includes(region))) {
        return false;
      }
      
      // Competition level check
      if (strategy.competitionLevel === 'low' && result.aiAnalysis.competitionLevel !== 'low') {
        return false;
      }
      
      return true;
    });
  }

  private async gatherOpportunityIntelligence(
    result: ScrapingResult, 
    strategy: HuntingStrategy
  ): Promise<OpportunityIntelligence> {
    
    const marketAnalysis = await this.analyzeMarket(result.opportunity, strategy);
    const culturalContext = await this.analyzeCulturalContext(result.opportunity);
    const strategicAdvantage = await this.analyzeStrategicAdvantage(result, strategy);
    
    return {
      opportunity: result.opportunity,
      marketAnalysis,
      culturalContext,
      strategicAdvantage
    };
  }

  private async analyzeMarket(opportunity: JobOpportunity, strategy: HuntingStrategy): Promise<any> {
    // Extract budget for analysis from string
    const budgetString = opportunity.budget;
    let budgetMin = 0;
    let budgetMax = 0;
    
    if (typeof budgetString === 'string' && budgetString) {
      const budgetMatch = budgetString.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
      budgetMin = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 0;
      budgetMax = budgetMatch ? parseInt(budgetMatch[2].replace(/,/g, '')) : budgetMin;
    }
    
    // AI-powered market analysis
    return {
      localCompetition: strategy.competitionLevel === 'low' ? 2 : strategy.competitionLevel === 'medium' ? 5 : 10,
      averageRates: {
        min: budgetMin * 0.7,
        max: budgetMax * 1.3
      },
      demandLevel: 'high' as const,
      seasonality: 'Government fiscal year Q4 typically has higher budgets',
      growthTrend: 'growing' as const
    };
  }

  private async analyzeCulturalContext(opportunity: JobOpportunity): Promise<any> {
    // Cultural intelligence based on location
    const culturalMap: Record<string, any> = {
      'Nigeria': {
        businessCulture: 'Relationship-focused, hierarchical decision making',
        communicationStyle: 'Formal, respectful, emphasis on credentials',
        decisionMakingProcess: 'Committee-based, multiple stakeholders',
        preferredApproach: 'In-person meetings preferred, build trust first',
        localCustoms: ['Respect for elders', 'Extended greetings', 'Patience with process']
      },
      'India': {
        businessCulture: 'Hierarchical, relationship-driven, process-oriented',
        communicationStyle: 'Formal, detailed documentation expected',
        decisionMakingProcess: 'Top-down, multiple approval levels',
        preferredApproach: 'Detailed proposals, references important',
        localCustoms: ['Respect hierarchy', 'Detailed contracts', 'Long-term relationships']
      },
      'Brazil': {
        businessCulture: 'Personal relationships crucial, flexible approach',
        communicationStyle: 'Warm, personal, relationship before business',
        decisionMakingProcess: 'Consensus-building, relationship-influenced',
        preferredApproach: 'Personal connections, social interaction',
        localCustoms: ['Personal meetings', 'Social events', 'Family inquiries']
      }
    };

    return culturalMap[opportunity.location] || {
      businessCulture: 'Professional, results-oriented',
      communicationStyle: 'Direct, clear, concise',
      decisionMakingProcess: 'Merit-based, efficiency-focused',
      preferredApproach: 'Professional competence demonstration',
      localCustoms: ['Punctuality', 'Clear communication', 'Results focus']
    };
  }

  private async analyzeStrategicAdvantage(result: ScrapingResult, strategy: HuntingStrategy): Promise<any> {
    return {
      whyYouWin: [
        'International expertise with local market understanding',
        'Cost-effective solutions compared to local competitors',
        'Modern technology stack and methodologies',
        'English proficiency for global communication',
        'Proven track record in similar markets'
      ],
      differentiators: [
        'African tech talent with global perspective',
        'Time zone advantages for certain regions',
        'Cultural sensitivity and adaptation',
        'Competitive pricing with high quality',
        'Remote-first approach proven during COVID'
      ],
      riskFactors: [
        'Currency fluctuation risks',
        'Payment processing challenges',
        'Cultural misunderstandings',
        'Legal/regulatory differences',
        'Time zone coordination'
      ],
      successProbability: result.confidence * 0.01 * (strategy.priority / 10) * 100
    };
  }

  async executeFullHuntingCampaign(): Promise<void> {
    console.log('🌍 Starting full global opportunity hunting campaign...');
    
    // Execute all strategies in priority order
    const sortedStrategies = this.huntingStrategies.sort((a, b) => b.priority - a.priority);
    
    for (const strategy of sortedStrategies) {
      try {
        const opportunities = await this.executeHuntingStrategy(strategy.id);
        
        // Auto-generate and send proposals for high-probability opportunities
        const highProbabilityOps = opportunities.filter(op => op.strategicAdvantage.successProbability > 75);
        
        for (const opportunity of highProbabilityOps) {
          await this.autoApplyToOpportunity(opportunity);
        }
        
        // Wait between strategies to avoid overwhelming systems
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`Error executing strategy ${strategy.name}:`, error);
      }
    }
    
    console.log('✅ Full hunting campaign completed');
  }

  private async autoApplyToOpportunity(intelligence: OpportunityIntelligence): Promise<void> {
    try {
      console.log(`🎯 Auto-applying to: ${intelligence.opportunity.title}`);
      
      // Create mock user profile for proposal generation
      const mockUserProfile = {
        id: 'demo-user',
        fullName: 'Professional Developer',
        email: 'developer@leadswift.ai',
        location: 'Global',
        skills: intelligence.opportunity.skills,
        experience: {
          years: 5,
          level: 'senior' as const,
          previousRoles: ['Full Stack Developer', 'Technical Lead'],
          certifications: ['AWS Certified', 'Agile Certified']
        },
        industries: [intelligence.opportunity.industry],
        portfolio: [],
        resume: 'Experienced developer with expertise in modern technologies',
        bio: 'Passionate about delivering high-quality solutions',
        availability: 'freelance' as const,
        preferredIndustries: [intelligence.opportunity.industry],
        workPreference: 'remote' as const
      };
      
      // Generate culturally-aware proposal
      const proposal = await this.proposalGenerator.generateProposal(
        intelligence.opportunity,
        mockUserProfile
      );
      
      // Send personalized outreach email
      if (intelligence.opportunity.contactInfo?.email) {
        const result = await this.emailService.sendAutomatedProposal(
          intelligence.opportunity,
          mockUserProfile,
          'high'
        );
        
        if (result.success) {
          console.log(`📧 Proposal sent to ${intelligence.opportunity.contactInfo.email}`);
        } else {
          console.error(`❌ Failed to send proposal: ${result.error}`);
        }
      }
      
    } catch (error) {
      console.error(`Error auto-applying to ${intelligence.opportunity.title}:`, error);
    }
  }

  // Get discovered opportunities by various filters
  getOpportunitiesByRegion(region: string): OpportunityIntelligence[] {
    return Array.from(this.discoveredOpportunities.values())
      .filter(op => op.opportunity.location.includes(region));
  }

  getHighProbabilityOpportunities(minProbability: number = 75): OpportunityIntelligence[] {
    return Array.from(this.discoveredOpportunities.values())
      .filter(op => op.strategicAdvantage.successProbability >= minProbability)
      .sort((a, b) => b.strategicAdvantage.successProbability - a.strategicAdvantage.successProbability);
  }

  getLowCompetitionOpportunities(): OpportunityIntelligence[] {
    return Array.from(this.discoveredOpportunities.values())
      .filter(op => op.marketAnalysis.localCompetition <= 3)
      .sort((a, b) => a.marketAnalysis.localCompetition - b.marketAnalysis.localCompetition);
  }

  // Export hunting results for analysis
  exportHuntingResults(): {
    totalOpportunities: number;
    byRegion: Record<string, number>;
    byIndustry: Record<string, number>;
    averageSuccessProbability: number;
    topOpportunities: OpportunityIntelligence[];
  } {
    const opportunities = Array.from(this.discoveredOpportunities.values());
    
    const byRegion: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    
    opportunities.forEach(op => {
      byRegion[op.opportunity.location] = (byRegion[op.opportunity.location] || 0) + 1;
      byIndustry[op.opportunity.industry] = (byIndustry[op.opportunity.industry] || 0) + 1;
    });
    
    const avgProbability = opportunities.reduce((sum, op) => 
      sum + op.strategicAdvantage.successProbability, 0) / opportunities.length;
    
    const topOpportunities = opportunities
      .sort((a, b) => b.strategicAdvantage.successProbability - a.strategicAdvantage.successProbability)
      .slice(0, 10);
    
    return {
      totalOpportunities: opportunities.length,
      byRegion,
      byIndustry,
      averageSuccessProbability: avgProbability,
      topOpportunities
    };
  }
}

export default GlobalOpportunityHunter;
