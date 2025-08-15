'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock, 
  Award,
  Search,
  Zap,
  Brain,
  Shield
} from 'lucide-react';
import { IntelligentWebScraper, ScrapingResult } from '@/services/intelligentWebScraper';
import { GlobalOpportunityHunter, OpportunityIntelligence, HuntingStrategy } from '@/services/globalOpportunityHunter';
import { CulturalIntelligenceEngine } from '@/services/culturalIntelligenceEngine';

interface GlobalHuntingDashboardProps {
  userId: string;
}

export default function GlobalHuntingDashboard({ userId }: GlobalHuntingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [huntingResults, setHuntingResults] = useState<OpportunityIntelligence[]>([]);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [isHunting, setIsHunting] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [discoveredOpportunities, setDiscoveredOpportunities] = useState<OpportunityIntelligence[]>([]);
  const [huntingStats, setHuntingStats] = useState({
    totalOpportunities: 0,
    byRegion: {} as Record<string, number>,
    byIndustry: {} as Record<string, number>,
    averageSuccessProbability: 0,
    topOpportunities: [] as OpportunityIntelligence[]
  });

  const huntingStrategies: HuntingStrategy[] = [
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
    }
  ];

  const mockDiscoveredOpportunities: OpportunityIntelligence[] = [
    {
      opportunity: {
        id: '1',
        title: 'Digital Health Platform Development - Nigeria Ministry of Health',
        company: 'Federal Ministry of Health Nigeria',
        description: 'Develop comprehensive digital health platform for rural healthcare delivery',
        budget: { min: 150000, max: 300000, currency: 'USD' },
        skills: ['React', 'Node.js', 'Healthcare Systems', 'Mobile Development'],
        type: 'contract',
        location: 'Nigeria',
        industry: 'Healthcare',
        urgency: 'high',
        postedDate: new Date(),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        source: 'https://procurement.gov.ng',
        requirements: ['5+ years healthcare tech experience', 'Government project experience'],
        benefits: ['Long-term engagement', 'Social impact', 'Government references']
      },
      marketAnalysis: {
        localCompetition: 2,
        averageRates: { min: 120000, max: 280000 },
        demandLevel: 'critical',
        seasonality: 'Government fiscal year Q4',
        growthTrend: 'booming'
      },
      culturalContext: {
        businessCulture: 'Relationship-focused, hierarchical decision making',
        communicationStyle: 'Formal, respectful, emphasis on credentials',
        decisionMakingProcess: 'Committee-based, multiple stakeholders',
        preferredApproach: 'In-person meetings preferred, build trust first',
        localCustoms: ['Respect for elders', 'Extended greetings', 'Patience with process']
      },
      strategicAdvantage: {
        whyYouWin: [
          'International expertise with local market understanding',
          'Cost-effective solutions compared to local competitors',
          'Proven healthcare tech experience'
        ],
        differentiators: [
          'African tech talent with global perspective',
          'Cultural sensitivity and adaptation',
          'Remote-first approach with local presence'
        ],
        riskFactors: [
          'Currency fluctuation risks',
          'Government payment delays',
          'Regulatory compliance requirements'
        ],
        successProbability: 87
      }
    },
    {
      opportunity: {
        id: '2',
        title: 'Smart Agriculture Platform - Kenya Agricultural Board',
        company: 'Kenya Agricultural Development Corporation',
        description: 'IoT and AI-powered platform for smallholder farmer productivity',
        budget: { min: 75000, max: 150000, currency: 'USD' },
        skills: ['IoT', 'Machine Learning', 'Mobile Apps', 'Data Analytics'],
        type: 'project',
        location: 'Kenya',
        industry: 'Agriculture',
        urgency: 'medium',
        postedDate: new Date(),
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        source: 'https://kilimo.go.ke',
        requirements: ['AgTech experience', 'IoT implementation', 'Mobile development'],
        benefits: ['Social impact', 'Scalability potential', 'Government backing']
      },
      marketAnalysis: {
        localCompetition: 1,
        averageRates: { min: 60000, max: 120000 },
        demandLevel: 'high',
        seasonality: 'Planting season alignment',
        growthTrend: 'growing'
      },
      culturalContext: {
        businessCulture: 'Community-focused, collaborative approach',
        communicationStyle: 'English and Swahili, relationship-building important',
        decisionMakingProcess: 'Consensus-building with farmer input',
        preferredApproach: 'Demonstrate understanding of local farming practices',
        localCustoms: ['Ubuntu philosophy', 'Community consultation', 'Practical demonstrations']
      },
      strategicAdvantage: {
        whyYouWin: [
          'Understanding of smallholder farming challenges',
          'Mobile-first approach for rural connectivity',
          'Cost-effective IoT solutions'
        ],
        differentiators: [
          'Local language support',
          'Offline-capable solutions',
          'Community-centered design'
        ],
        riskFactors: [
          'Rural connectivity challenges',
          'Farmer adoption rates',
          'Weather dependency'
        ],
        successProbability: 82
      }
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setDiscoveredOpportunities(mockDiscoveredOpportunities);
    setHuntingStats({
      totalOpportunities: mockDiscoveredOpportunities.length,
      byRegion: {
        'Nigeria': 1,
        'Kenya': 1
      },
      byIndustry: {
        'Healthcare': 1,
        'Agriculture': 1
      },
      averageSuccessProbability: 84.5,
      topOpportunities: mockDiscoveredOpportunities
    });
  }, []);

  const startGlobalHunt = async (strategyId: string) => {
    setIsHunting(true);
    setScrapingProgress(0);
    setSelectedStrategy(strategyId);

    // Simulate hunting progress
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsHunting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    // Simulate discovering new opportunities
    setTimeout(() => {
      const newOpportunities = [...mockDiscoveredOpportunities];
      setDiscoveredOpportunities(newOpportunities);
      setHuntingResults(newOpportunities);
    }, 5000);
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-purple-400" />
              Global Opportunity Hunter
            </h1>
            <p className="text-gray-400 mt-2">
              AI-powered discovery of hidden opportunities worldwide
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => startGlobalHunt('hidden-government-contracts')}
              disabled={isHunting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isHunting ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Hunting...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Start Hunt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hunting Progress */}
        {isHunting && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Global Hunt in Progress</h3>
                <span className="text-sm text-gray-400">{scrapingProgress}% Complete</span>
              </div>
              <Progress value={scrapingProgress} className="mb-4" />
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-purple-400 font-semibold">Government Portals</div>
                  <div className="text-gray-400">Scanning...</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-semibold">Business Directories</div>
                  <div className="text-gray-400">Processing...</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">NGO Platforms</div>
                  <div className="text-gray-400">Analyzing...</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold">Startup Ecosystems</div>
                  <div className="text-gray-400">Qualifying...</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Opportunities</p>
                  <p className="text-2xl font-bold text-white">{huntingStats.totalOpportunities}</p>
                </div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">{huntingStats.averageSuccessProbability}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Regions</p>
                  <p className="text-2xl font-bold text-blue-400">{Object.keys(huntingStats.byRegion).length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Industries</p>
                  <p className="text-2xl font-bold text-yellow-400">{Object.keys(huntingStats.byIndustry).length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-purple-600">
              Hunting Strategies
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-purple-600">
              Discovered Opportunities
            </TabsTrigger>
            <TabsTrigger value="cultural" className="data-[state=active]:bg-purple-600">
              Cultural Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Regional Distribution */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(huntingStats.byRegion).map(([region, count]) => (
                    <div key={region} className="bg-white/5 rounded-lg p-4">
                      <div className="font-semibold text-white">{region}</div>
                      <div className="text-2xl font-bold text-purple-400">{count}</div>
                      <div className="text-sm text-gray-400">opportunities</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Industry Distribution */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-400" />
                  Industry Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(huntingStats.byIndustry).map(([industry, count]) => (
                    <div key={industry} className="bg-white/5 rounded-lg p-4">
                      <div className="font-semibold text-white">{industry}</div>
                      <div className="text-2xl font-bold text-blue-400">{count}</div>
                      <div className="text-sm text-gray-400">opportunities</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <div className="grid gap-6">
              {huntingStrategies.map((strategy) => (
                <Card key={strategy.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-400" />
                        {strategy.name}
                      </CardTitle>
                      <Badge className={`${getCompetitionColor(strategy.competitionLevel)} text-white`}>
                        {strategy.competitionLevel} competition
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{strategy.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Target Regions</h4>
                        <div className="flex flex-wrap gap-2">
                          {strategy.targetRegions.map((region) => (
                            <Badge key={region} variant="outline" className="border-purple-400 text-purple-400">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Industries</h4>
                        <div className="flex flex-wrap gap-2">
                          {strategy.targetIndustries.map((industry) => (
                            <Badge key={industry} variant="outline" className="border-blue-400 text-blue-400">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Budget Range</h4>
                        <div className="text-green-400 font-semibold">
                          ${strategy.budgetRange.min.toLocaleString()} - ${strategy.budgetRange.max.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => startGlobalHunt(strategy.id)}
                        disabled={isHunting}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Execute Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid gap-6">
              {discoveredOpportunities.map((intel) => (
                <Card key={intel.opportunity.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{intel.opportunity.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getProbabilityColor(intel.strategicAdvantage.successProbability)} bg-white/10`}>
                          {intel.strategicAdvantage.successProbability}% Success
                        </Badge>
                        <Badge className={`${getCompetitionColor(intel.marketAnalysis.localCompetition <= 3 ? 'low' : 'medium')} text-white`}>
                          {intel.marketAnalysis.localCompetition} Competitors
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          Budget & Market
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Budget:</span>
                            <span className="text-green-400 font-semibold">
                              ${intel.opportunity.budget.min.toLocaleString()} - ${intel.opportunity.budget.max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Market Rates:</span>
                            <span className="text-blue-400">
                              ${intel.marketAnalysis.averageRates.min.toLocaleString()} - ${intel.marketAnalysis.averageRates.max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Demand:</span>
                            <Badge className="bg-red-500 text-white text-xs">
                              {intel.marketAnalysis.demandLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          Strategic Advantage
                        </h4>
                        <div className="space-y-2">
                          {intel.strategicAdvantage.whyYouWin.slice(0, 3).map((advantage, idx) => (
                            <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                              <Shield className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                              {advantage}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {intel.opportunity.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="border-yellow-400 text-yellow-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {intel.opportunity.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.ceil((intel.opportunity.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Generate Proposal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Cultural Intelligence Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {discoveredOpportunities.map((intel) => (
                  <div key={intel.opportunity.id} className="bg-white/5 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-white">{intel.opportunity.location} - {intel.opportunity.company}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-2">Business Culture</h4>
                        <p className="text-sm text-gray-300">{intel.culturalContext.businessCulture}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-2">Communication Style</h4>
                        <p className="text-sm text-gray-300">{intel.culturalContext.communicationStyle}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">Decision Making</h4>
                        <p className="text-sm text-gray-300">{intel.culturalContext.decisionMakingProcess}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">Preferred Approach</h4>
                        <p className="text-sm text-gray-300">{intel.culturalContext.preferredApproach}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Local Customs</h4>
                      <div className="flex flex-wrap gap-2">
                        {intel.culturalContext.localCustoms.map((custom, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-400 text-gray-300">
                            {custom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
