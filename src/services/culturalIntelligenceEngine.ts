import { JobOpportunity } from '../types/automation';

export interface CulturalProfile {
  country: string;
  region: string;
  businessCulture: {
    hierarchy: 'flat' | 'moderate' | 'strict';
    relationshipImportance: 'low' | 'medium' | 'high' | 'critical';
    decisionSpeed: 'fast' | 'moderate' | 'slow' | 'very_slow';
    formalityLevel: 'casual' | 'business_casual' | 'formal' | 'very_formal';
    directness: 'very_direct' | 'direct' | 'diplomatic' | 'indirect';
  };
  communicationStyle: {
    preferredChannels: ('email' | 'phone' | 'video_call' | 'in_person' | 'messaging')[];
    responseTimeExpectation: string;
    languagePreferences: string[];
    culturalSensitivities: string[];
    businessEtiquette: string[];
  };
  negotiationStyle: {
    approach: 'competitive' | 'collaborative' | 'accommodating' | 'compromise';
    timeOrientation: 'punctual' | 'flexible' | 'relaxed';
    contractImportance: 'high' | 'medium' | 'low';
    relationshipVsTask: 'task_focused' | 'balanced' | 'relationship_focused';
  };
  economicContext: {
    currencyStability: 'stable' | 'moderate' | 'volatile';
    paymentMethods: string[];
    typicalProjectSizes: { min: number; max: number };
    seasonalFactors: string[];
    economicPriorities: string[];
  };
}

export interface LocalizedOutreach {
  emailSubject: string;
  emailContent: string;
  followUpStrategy: {
    timing: string[];
    channels: string[];
    messaging: string[];
  };
  proposalAdaptations: {
    structurePreferences: string[];
    contentEmphasis: string[];
    visualElements: string[];
    documentFormat: string;
  };
  relationshipBuilding: {
    iceBreakers: string[];
    trustBuilders: string[];
    credibilityFactors: string[];
    socialProof: string[];
  };
}

export class CulturalIntelligenceEngine {
  private culturalProfiles: Map<string, CulturalProfile> = new Map();

  constructor() {
    this.initializeCulturalProfiles();
  }

  private initializeCulturalProfiles(): void {
    // African Markets
    this.culturalProfiles.set('Nigeria', {
      country: 'Nigeria',
      region: 'West Africa',
      businessCulture: {
        hierarchy: 'strict',
        relationshipImportance: 'critical',
        decisionSpeed: 'slow',
        formalityLevel: 'very_formal',
        directness: 'diplomatic'
      },
      communicationStyle: {
        preferredChannels: ['email', 'phone', 'in_person'],
        responseTimeExpectation: '2-3 business days acceptable',
        languagePreferences: ['English', 'Hausa', 'Yoruba', 'Igbo'],
        culturalSensitivities: ['Respect for elders', 'Religious considerations', 'Tribal affiliations'],
        businessEtiquette: ['Extended greetings', 'Inquire about family', 'Patience with process', 'Respect hierarchy']
      },
      negotiationStyle: {
        approach: 'relationship_focused',
        timeOrientation: 'flexible',
        contractImportance: 'high',
        relationshipVsTask: 'relationship_focused'
      },
      economicContext: {
        currencyStability: 'moderate',
        paymentMethods: ['Bank transfer', 'USD preferred', 'Cryptocurrency growing'],
        typicalProjectSizes: { min: 5000, max: 100000 },
        seasonalFactors: ['Ramadan considerations', 'Harmattan season', 'Fiscal year Q4 budgets'],
        economicPriorities: ['Job creation', 'Technology transfer', 'Local capacity building']
      }
    });

    this.culturalProfiles.set('South Africa', {
      country: 'South Africa',
      region: 'Southern Africa',
      businessCulture: {
        hierarchy: 'moderate',
        relationshipImportance: 'high',
        decisionSpeed: 'moderate',
        formalityLevel: 'formal',
        directness: 'direct'
      },
      communicationStyle: {
        preferredChannels: ['email', 'video_call', 'phone'],
        responseTimeExpectation: '1-2 business days',
        languagePreferences: ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
        culturalSensitivities: ['Apartheid history', 'Economic inequality', 'Ubuntu philosophy'],
        businessEtiquette: ['Punctuality important', 'Firm handshakes', 'Eye contact', 'Professional dress']
      },
      negotiationStyle: {
        approach: 'collaborative',
        timeOrientation: 'punctual',
        contractImportance: 'high',
        relationshipVsTask: 'balanced'
      },
      economicContext: {
        currencyStability: 'moderate',
        paymentMethods: ['Bank transfer', 'PayPal', 'Wise'],
        typicalProjectSizes: { min: 10000, max: 500000 },
        seasonalFactors: ['December holidays', 'Easter break', 'Heritage month'],
        economicPriorities: ['BEE compliance', 'Skills development', 'Local procurement']
      }
    });

    // Asian Markets
    this.culturalProfiles.set('India', {
      country: 'India',
      region: 'South Asia',
      businessCulture: {
        hierarchy: 'strict',
        relationshipImportance: 'high',
        decisionSpeed: 'slow',
        formalityLevel: 'formal',
        directness: 'diplomatic'
      },
      communicationStyle: {
        preferredChannels: ['email', 'phone', 'video_call'],
        responseTimeExpectation: '1-2 business days',
        languagePreferences: ['English', 'Hindi', 'Regional languages'],
        culturalSensitivities: ['Religious diversity', 'Caste considerations', 'Regional differences'],
        businessEtiquette: ['Namaste greeting', 'Respect for age', 'Detailed documentation', 'Multiple stakeholders']
      },
      negotiationStyle: {
        approach: 'compromise',
        timeOrientation: 'flexible',
        contractImportance: 'high',
        relationshipVsTask: 'relationship_focused'
      },
      economicContext: {
        currencyStability: 'stable',
        paymentMethods: ['Bank transfer', 'UPI', 'PayPal'],
        typicalProjectSizes: { min: 15000, max: 1000000 },
        seasonalFactors: ['Diwali season', 'Monsoon period', 'Festival calendar'],
        economicPriorities: ['Digital India', 'Make in India', 'Skill development']
      }
    });

    // Latin American Markets
    this.culturalProfiles.set('Brazil', {
      country: 'Brazil',
      region: 'South America',
      businessCulture: {
        hierarchy: 'moderate',
        relationshipImportance: 'critical',
        decisionSpeed: 'moderate',
        formalityLevel: 'business_casual',
        directness: 'diplomatic'
      },
      communicationStyle: {
        preferredChannels: ['email', 'video_call', 'messaging'],
        responseTimeExpectation: '1-3 business days',
        languagePreferences: ['Portuguese', 'English'],
        culturalSensitivities: ['Personal space', 'Family importance', 'Social hierarchy'],
        businessEtiquette: ['Warm greetings', 'Personal conversation', 'Social events', 'Patience']
      },
      negotiationStyle: {
        approach: 'relationship_focused',
        timeOrientation: 'flexible',
        contractImportance: 'medium',
        relationshipVsTask: 'relationship_focused'
      },
      economicContext: {
        currencyStability: 'moderate',
        paymentMethods: ['Bank transfer', 'PIX', 'PayPal'],
        typicalProjectSizes: { min: 20000, max: 800000 },
        seasonalFactors: ['Carnival season', 'December holidays', 'Summer vacation'],
        economicPriorities: ['Innovation', 'Sustainability', 'Regional development']
      }
    });

    // Middle Eastern Markets
    this.culturalProfiles.set('UAE', {
      country: 'United Arab Emirates',
      region: 'Middle East',
      businessCulture: {
        hierarchy: 'strict',
        relationshipImportance: 'high',
        decisionSpeed: 'fast',
        formalityLevel: 'formal',
        directness: 'diplomatic'
      },
      communicationStyle: {
        preferredChannels: ['email', 'phone', 'in_person'],
        responseTimeExpectation: '1 business day',
        languagePreferences: ['English', 'Arabic'],
        culturalSensitivities: ['Islamic customs', 'Ramadan observance', 'Cultural diversity'],
        businessEtiquette: ['Right hand greetings', 'Modest dress', 'Respect for traditions', 'Hospitality']
      },
      negotiationStyle: {
        approach: 'competitive',
        timeOrientation: 'punctual',
        contractImportance: 'high',
        relationshipVsTask: 'balanced'
      },
      economicContext: {
        currencyStability: 'stable',
        paymentMethods: ['Bank transfer', 'UAE dirham', 'USD accepted'],
        typicalProjectSizes: { min: 50000, max: 2000000 },
        seasonalFactors: ['Ramadan', 'Eid holidays', 'Summer heat'],
        economicPriorities: ['Vision 2071', 'Diversification', 'Innovation']
      }
    });
  }

  generateLocalizedOutreach(
    opportunity: JobOpportunity,
    userProfile?: any
  ): LocalizedOutreach {
    const culturalProfile = this.culturalProfiles.get(opportunity.location) || this.getDefaultProfile();
    
    return {
      emailSubject: this.generateCulturallyAppropriateSubject(opportunity, culturalProfile),
      emailContent: this.generateCulturallyAppropriateContent(opportunity, culturalProfile, userProfile),
      followUpStrategy: this.generateFollowUpStrategy(culturalProfile),
      proposalAdaptations: this.generateProposalAdaptations(culturalProfile),
      relationshipBuilding: this.generateRelationshipBuildingStrategy(culturalProfile, opportunity)
    };
  }

  private generateCulturallyAppropriateSubject(
    opportunity: JobOpportunity,
    profile: CulturalProfile
  ): string {
    const formalityMap = {
      'very_formal': 'Respectful Inquiry Regarding',
      'formal': 'Professional Proposal for',
      'business_casual': 'Partnership Opportunity:',
      'casual': 'Let\'s Discuss:'
    };

    const prefix = formalityMap[profile.businessCulture.formalityLevel];
    return `${prefix} ${opportunity.title} - ${opportunity.company}`;
  }

  private generateCulturallyAppropriateContent(
    opportunity: JobOpportunity,
    profile: CulturalProfile,
    userProfile?: any
  ): string {
    let content = '';

    // Greeting based on cultural norms
    if (profile.country === 'India') {
      content += 'Namaste,\n\n';
    } else if (profile.country === 'UAE') {
      content += 'As-salamu alaikum / Greetings,\n\n';
    } else if (profile.businessCulture.formalityLevel === 'very_formal') {
      content += 'Dear Esteemed Colleagues,\n\n';
    } else {
      content += 'Dear Hiring Manager,\n\n';
    }

    // Relationship building opener
    if (profile.businessCulture.relationshipImportance === 'critical') {
      content += 'I hope this message finds you and your team in good health and prosperity. ';
      content += 'I am writing with great respect for your organization\'s reputation and achievements in the industry.\n\n';
    }

    // Main content with cultural adaptations
    content += `I am reaching out regarding the ${opportunity.title} opportunity at ${opportunity.company}. `;
    
    if (profile.businessCulture.directness === 'indirect') {
      content += 'After careful consideration and research into your esteemed organization, I believe there may be a mutually beneficial opportunity for collaboration. ';
    } else {
      content += 'I am confident that my expertise aligns perfectly with your requirements. ';
    }

    // Add local context and understanding
    content += `Having worked extensively with organizations in ${profile.region}, I understand the unique challenges and opportunities in your market. `;

    // Economic context awareness
    if (profile.economicContext.economicPriorities.length > 0) {
      content += `I am particularly aligned with your region's focus on ${profile.economicContext.economicPriorities[0]} and ${profile.economicContext.economicPriorities[1]}. `;
    }

    // Closing based on cultural norms
    if (profile.businessCulture.relationshipImportance === 'critical') {
      content += '\n\nI would be honored to discuss how we might work together to achieve your objectives. ';
      content += 'I am committed to building a long-term partnership that brings mutual success and growth.\n\n';
    } else {
      content += '\n\nI would welcome the opportunity to discuss how I can contribute to your project\'s success.\n\n';
    }

    // Culturally appropriate closing
    if (profile.country === 'India') {
      content += 'With warm regards and best wishes,';
    } else if (profile.country === 'UAE') {
      content += 'With highest regards and respect,';
    } else if (profile.businessCulture.formalityLevel === 'very_formal') {
      content += 'Most respectfully yours,';
    } else {
      content += 'Best regards,';
    }

    return content;
  }

  private generateFollowUpStrategy(profile: CulturalProfile): any {
    const timingMap = {
      'fast': ['3 days', '1 week', '2 weeks'],
      'moderate': ['1 week', '2 weeks', '1 month'],
      'slow': ['2 weeks', '1 month', '6 weeks'],
      'very_slow': ['3 weeks', '6 weeks', '2 months']
    };

    return {
      timing: timingMap[profile.businessCulture.decisionSpeed],
      channels: profile.communicationStyle.preferredChannels,
      messaging: [
        'Gentle reminder with additional value',
        'Share relevant case study or insight',
        'Offer to adjust proposal based on feedback'
      ]
    };
  }

  private generateProposalAdaptations(profile: CulturalProfile): any {
    const structurePreferences = {
      'strict': ['Executive summary first', 'Clear hierarchy', 'Detailed credentials'],
      'moderate': ['Balanced approach', 'Clear sections', 'Professional format'],
      'flat': ['Collaborative tone', 'Direct approach', 'Results-focused']
    };

    return {
      structurePreferences: structurePreferences[profile.businessCulture.hierarchy],
      contentEmphasis: profile.economicContext.economicPriorities,
      visualElements: ['Professional charts', 'Local market data', 'Cultural imagery'],
      documentFormat: 'PDF with detailed appendices'
    };
  }

  private generateRelationshipBuildingStrategy(profile: CulturalProfile, opportunity: JobOpportunity): any {
    return {
      iceBreakers: [
        `Interest in ${profile.region} market developments`,
        `Appreciation for ${opportunity.company}'s industry leadership`,
        `Shared commitment to ${profile.economicContext.economicPriorities[0]}`
      ],
      trustBuilders: [
        'References from similar regional projects',
        'Understanding of local business practices',
        'Commitment to long-term partnership'
      ],
      credibilityFactors: [
        'International experience with local sensitivity',
        'Proven track record in similar markets',
        'Cultural competency and language skills'
      ],
      socialProof: [
        'Testimonials from regional clients',
        'Case studies from similar cultural contexts',
        'Awards or recognition in the region'
      ]
    };
  }

  private getDefaultProfile(): CulturalProfile {
    return {
      country: 'International',
      region: 'Global',
      businessCulture: {
        hierarchy: 'moderate',
        relationshipImportance: 'medium',
        decisionSpeed: 'moderate',
        formalityLevel: 'formal',
        directness: 'direct'
      },
      communicationStyle: {
        preferredChannels: ['email', 'video_call'],
        responseTimeExpectation: '1-2 business days',
        languagePreferences: ['English'],
        culturalSensitivities: ['Professional courtesy'],
        businessEtiquette: ['Punctuality', 'Clear communication', 'Professional demeanor']
      },
      negotiationStyle: {
        approach: 'collaborative',
        timeOrientation: 'punctual',
        contractImportance: 'high',
        relationshipVsTask: 'balanced'
      },
      economicContext: {
        currencyStability: 'stable',
        paymentMethods: ['Bank transfer', 'PayPal'],
        typicalProjectSizes: { min: 10000, max: 100000 },
        seasonalFactors: ['Standard business calendar'],
        economicPriorities: ['Efficiency', 'Innovation', 'Growth']
      }
    };
  }

  getCulturalProfile(country: string): CulturalProfile | undefined {
    return this.culturalProfiles.get(country);
  }

  getAllSupportedCountries(): string[] {
    return Array.from(this.culturalProfiles.keys());
  }

  addCulturalProfile(country: string, profile: CulturalProfile): void {
    this.culturalProfiles.set(country, profile);
  }
}

export default CulturalIntelligenceEngine;
