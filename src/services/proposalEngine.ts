import { 
  JobOpportunity, 
  UserProfile, 
  JobAnalysis, 
  Proposal, 
  CompanyData, 
  ProposalCustomization 
} from '../types/automation';

export class ProposalEngine {
  private openAIKey: string;
  private companyResearchAPI: string;

  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY || '';
    this.companyResearchAPI = process.env.COMPANY_RESEARCH_API || '';
  }

  /**
   * Analyze job opportunity and user profile compatibility
   */
  async analyzeJobOpportunity(job: JobOpportunity, user: UserProfile): Promise<JobAnalysis> {
    try {
      // Calculate skill matching
      const skillMatch = this.calculateSkillMatch(job.skills, user.skills);
      
      // Calculate experience matching
      const experienceMatch = this.calculateExperienceMatch(job, user);
      
      // Calculate industry fit
      const industryFit = this.calculateIndustryFit(job.industry, user.preferredIndustries);
      
      // Research company information
      const companyInfo = await this.researchCompany(job.company, job.industry);
      
      // Calculate overall score
      const overallScore = Math.round((skillMatch + experienceMatch + industryFit) / 3);
      
      // Identify missing skills and strengths
      const missingSkills = job.skills.filter(skill => 
        !user.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const strengths = user.skills.filter(skill =>
        job.skills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

      // Generate recommended approach
      const recommendedApproach = this.generateApproachStrategy(
        overallScore, 
        skillMatch, 
        experienceMatch, 
        companyInfo
      );

      return {
        keyRequirements: this.extractKeyRequirements(job.description),
        skillMatch,
        experienceMatch,
        industryFit,
        overallScore,
        missingSkills,
        strengths,
        companyInfo,
        recommendedApproach
      };
    } catch (error) {
      console.error('Error analyzing job opportunity:', error);
      throw new Error('Failed to analyze job opportunity');
    }
  }

  /**
   * Generate personalized proposal based on analysis
   */
  async generateProposal(
    job: JobOpportunity, 
    user: UserProfile, 
    analysis: JobAnalysis
  ): Promise<Proposal> {
    try {
      // Determine optimal tone based on company culture and industry
      const tone = this.determineTone(analysis.companyInfo, job.industry);
      
      // Generate customizations
      const customizations = await this.generateCustomizations(job, user, analysis);
      
      // Create proposal content using AI
      const content = await this.generateProposalContent(job, user, analysis, customizations);
      
      // Generate compelling subject line
      const subject = this.generateSubjectLine(job, user, analysis);
      
      // Extract key points
      const keyPoints = this.extractKeyPoints(content);
      
      // Generate call to action
      const callToAction = this.generateCallToAction(job, analysis);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(analysis, customizations);

      return {
        id: this.generateId(),
        jobOpportunityId: job.id,
        subject,
        content,
        tone,
        keyPoints,
        callToAction,
        attachments: this.recommendAttachments(user, job),
        customizations,
        estimatedReadTime: Math.ceil(content.split(' ').length / 200), // Average reading speed
        confidenceScore
      };
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw new Error('Failed to generate proposal');
    }
  }

  /**
   * Calculate skill matching percentage
   */
  private calculateSkillMatch(jobSkills: string[], userSkills: string[]): number {
    if (jobSkills.length === 0) return 100;
    
    const matches = jobSkills.filter(jobSkill =>
      userSkills.some(userSkill =>
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    return Math.round((matches.length / jobSkills.length) * 100);
  }

  /**
   * Calculate experience level matching
   */
  private calculateExperienceMatch(job: JobOpportunity, user: UserProfile): number {
    const experienceMapping = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'expert': 4
    };

    // Extract experience requirements from job description
    const jobDescription = job.description.toLowerCase();
    let requiredLevel = 1; // Default to entry level

    if (jobDescription.includes('senior') || jobDescription.includes('lead')) {
      requiredLevel = 3;
    } else if (jobDescription.includes('mid') || jobDescription.includes('intermediate')) {
      requiredLevel = 2;
    } else if (jobDescription.includes('expert') || jobDescription.includes('principal')) {
      requiredLevel = 4;
    }

    const userLevel = experienceMapping[user.experience.level];
    const difference = Math.abs(userLevel - requiredLevel);
    
    // Perfect match = 100%, each level difference reduces by 25%
    return Math.max(0, 100 - (difference * 25));
  }

  /**
   * Calculate industry fit percentage
   */
  private calculateIndustryFit(jobIndustry: string, userIndustries: string[]): number {
    if (userIndustries.length === 0) return 50; // Neutral if no preferences
    
    const directMatch = userIndustries.some(industry =>
      industry.toLowerCase() === jobIndustry.toLowerCase()
    );
    
    if (directMatch) return 100;
    
    // Check for related industries
    const relatedMatch = userIndustries.some(industry =>
      this.areIndustriesRelated(industry, jobIndustry)
    );
    
    return relatedMatch ? 75 : 25;
  }

  /**
   * Check if industries are related
   */
  private areIndustriesRelated(industry1: string, industry2: string): boolean {
    const relatedIndustries: Record<string, string[]> = {
      'technology': ['software', 'it', 'tech', 'digital', 'ai', 'data'],
      'healthcare': ['medical', 'pharma', 'biotech', 'health'],
      'finance': ['banking', 'fintech', 'investment', 'insurance'],
      'education': ['edtech', 'training', 'learning', 'academic'],
      'marketing': ['advertising', 'digital marketing', 'social media', 'content'],
      'construction': ['engineering', 'architecture', 'infrastructure'],
      'retail': ['ecommerce', 'consumer', 'sales', 'commerce']
    };

    const industry1Lower = industry1.toLowerCase();
    const industry2Lower = industry2.toLowerCase();

    for (const [key, related] of Object.entries(relatedIndustries)) {
      if (
        (industry1Lower.includes(key) || related.some(r => industry1Lower.includes(r))) &&
        (industry2Lower.includes(key) || related.some(r => industry2Lower.includes(r)))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Research company information
   */
  private async researchCompany(companyName: string, industry: string): Promise<CompanyData> {
    try {
      // In a real implementation, this would call external APIs
      // For now, we'll return mock data with intelligent defaults
      return {
        name: companyName,
        industry,
        size: 'Medium', // Would be researched
        website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        recentNews: [
          `${companyName} announces expansion in ${industry} sector`,
          `${companyName} receives funding for growth initiatives`
        ],
        culture: ['Innovation', 'Collaboration', 'Growth'],
        values: ['Quality', 'Customer Focus', 'Excellence'],
        techStack: this.getIndustryTechStack(industry),
        competitors: this.getIndustryCompetitors(industry)
      };
    } catch (error) {
      console.error('Error researching company:', error);
      return {
        name: companyName,
        industry,
        size: 'Unknown',
        recentNews: [],
        culture: [],
        values: [],
        techStack: [],
        competitors: []
      };
    }
  }

  /**
   * Get common tech stack for industry
   */
  private getIndustryTechStack(industry: string): string[] {
    const techStacks: Record<string, string[]> = {
      'technology': ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      'finance': ['Java', 'Python', 'SQL', 'Blockchain', 'Risk Management'],
      'healthcare': ['HIPAA', 'HL7', 'Python', 'Data Analytics', 'Cloud'],
      'education': ['LMS', 'React', 'Node.js', 'Video Streaming', 'Mobile'],
      'marketing': ['Google Analytics', 'HubSpot', 'Social Media APIs', 'CRM'],
      'retail': ['E-commerce', 'Payment Processing', 'Inventory Management', 'CRM']
    };

    return techStacks[industry.toLowerCase()] || ['Web Development', 'Database', 'Cloud'];
  }

  /**
   * Get industry competitors
   */
  private getIndustryCompetitors(industry: string): string[] {
    // This would be populated from real market research
    return ['Market Leader A', 'Competitor B', 'Emerging Player C'];
  }

  /**
   * Extract key requirements from job description
   */
  private extractKeyRequirements(description: string): string[] {
    const requirements: string[] = [];
    const lines = description.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('•') || 
        trimmed.startsWith('-') || 
        trimmed.startsWith('*') ||
        trimmed.match(/^\d+\./)
      ) {
        requirements.push(trimmed.replace(/^[•\-*\d\.]\s*/, ''));
      }
    }
    
    return requirements.slice(0, 10); // Limit to top 10 requirements
  }

  /**
   * Generate approach strategy
   */
  private generateApproachStrategy(
    overallScore: number,
    skillMatch: number,
    experienceMatch: number,
    companyInfo: CompanyData
  ): string {
    if (overallScore >= 80) {
      return 'Direct confident approach - highlight perfect fit and immediate value';
    } else if (overallScore >= 60) {
      return 'Balanced approach - emphasize strengths while addressing any gaps';
    } else if (skillMatch >= 70) {
      return 'Skill-focused approach - lead with technical expertise and learning ability';
    } else if (experienceMatch >= 70) {
      return 'Experience-focused approach - emphasize proven track record and adaptability';
    } else {
      return 'Value-focused approach - highlight unique perspective and growth potential';
    }
  }

  /**
   * Determine optimal tone for proposal
   */
  private determineTone(companyInfo: CompanyData, industry: string): 'professional' | 'casual' | 'enthusiastic' | 'technical' {
    if (industry.toLowerCase().includes('tech') || industry.toLowerCase().includes('startup')) {
      return 'enthusiastic';
    } else if (industry.toLowerCase().includes('finance') || industry.toLowerCase().includes('legal')) {
      return 'professional';
    } else if (companyInfo.culture.includes('Innovation') || companyInfo.culture.includes('Creative')) {
      return 'casual';
    } else {
      return 'technical';
    }
  }

  /**
   * Generate proposal customizations
   */
  private async generateCustomizations(
    job: JobOpportunity,
    user: UserProfile,
    analysis: JobAnalysis
  ): Promise<ProposalCustomization[]> {
    const customizations: ProposalCustomization[] = [];

    // Company research customization
    if (analysis.companyInfo.recentNews.length > 0) {
      customizations.push({
        type: 'company_research',
        content: `I noticed ${analysis.companyInfo.name}'s recent ${analysis.companyInfo.recentNews[0]}`,
        reasoning: 'Shows research and genuine interest in company'
      });
    }

    // Skill highlight customization
    if (analysis.strengths.length > 0) {
      customizations.push({
        type: 'skill_highlight',
        content: `My expertise in ${analysis.strengths.slice(0, 3).join(', ')} directly aligns with your needs`,
        reasoning: 'Emphasizes relevant skills match'
      });
    }

    // Industry insight customization
    customizations.push({
      type: 'industry_insight',
      content: this.generateIndustryInsight(job.industry),
      reasoning: 'Demonstrates industry knowledge and awareness'
    });

    // Personal touch customization
    if (user.portfolio.length > 0) {
      const relevantPortfolio = user.portfolio.find(p => p.industry === job.industry);
      if (relevantPortfolio) {
        customizations.push({
          type: 'personal_touch',
          content: `I recently completed a similar project: ${relevantPortfolio.title}`,
          reasoning: 'Provides concrete evidence of relevant experience'
        });
      }
    }

    return customizations;
  }

  /**
   * Generate industry-specific insight
   */
  private generateIndustryInsight(industry: string): string {
    const insights: Record<string, string> = {
      'technology': 'The rapid evolution of AI and cloud technologies is reshaping how businesses operate',
      'healthcare': 'Digital transformation in healthcare is creating new opportunities for patient care',
      'finance': 'Fintech innovations are revolutionizing traditional banking and investment services',
      'education': 'Remote learning technologies are transforming educational delivery and accessibility',
      'marketing': 'Data-driven marketing strategies are becoming essential for customer engagement',
      'retail': 'E-commerce and omnichannel experiences are redefining retail customer journeys'
    };

    return insights[industry.toLowerCase()] || 'Industry innovation continues to drive new opportunities and challenges';
  }

  /**
   * Generate proposal content using AI
   */
  private async generateProposalContent(
    job: JobOpportunity,
    user: UserProfile,
    analysis: JobAnalysis,
    customizations: ProposalCustomization[]
  ): Promise<string> {
    // In a real implementation, this would call OpenAI API
    // For now, we'll generate a structured template

    const greeting = `Dear ${job.contactInfo.contactPerson || 'Hiring Manager'},`;
    
    const opening = customizations.find(c => c.type === 'company_research')?.content || 
      `I am excited to apply for the ${job.title} position at ${job.company}.`;
    
    const valueProposition = `With ${user.experience.years} years of experience in ${user.industries.join(' and ')}, I bring a unique combination of ${analysis.strengths.slice(0, 3).join(', ')} that directly addresses your needs.`;
    
    const skillsSection = `My expertise includes:
${analysis.strengths.map(skill => `• ${skill}`).join('\n')}`;
    
    const experienceSection = user.experience.previousRoles.length > 0 ? 
      `In my previous roles as ${user.experience.previousRoles.slice(0, 2).join(' and ')}, I have successfully delivered projects that ${this.generateAchievementExample(job.industry)}.` : '';
    
    const industryInsight = customizations.find(c => c.type === 'industry_insight')?.content || '';
    
    const personalTouch = customizations.find(c => c.type === 'personal_touch')?.content || '';
    
    const closing = `I would welcome the opportunity to discuss how my skills and experience can contribute to ${job.company}'s continued success. I am available for an interview at your convenience and can start immediately.`;
    
    const signature = `Best regards,\n${user.fullName}\n${user.email}\n${user.phone || ''}`;

    return [
      greeting,
      '',
      opening,
      '',
      valueProposition,
      '',
      skillsSection,
      '',
      experienceSection,
      '',
      industryInsight,
      '',
      personalTouch,
      '',
      closing,
      '',
      signature
    ].filter(line => line !== '').join('\n');
  }

  /**
   * Generate achievement example for industry
   */
  private generateAchievementExample(industry: string): string {
    const examples: Record<string, string> = {
      'technology': 'improved system performance by 40% and reduced deployment time',
      'healthcare': 'enhanced patient data security and improved care coordination',
      'finance': 'implemented risk management solutions that reduced exposure by 30%',
      'education': 'developed learning platforms that increased student engagement by 50%',
      'marketing': 'created campaigns that increased conversion rates by 35%',
      'retail': 'optimized e-commerce platforms resulting in 25% sales increase'
    };

    return examples[industry.toLowerCase()] || 'delivered measurable results and exceeded project expectations';
  }

  /**
   * Generate compelling subject line
   */
  private generateSubjectLine(job: JobOpportunity, user: UserProfile, analysis: JobAnalysis): string {
    const templates = [
      `${user.fullName} - ${job.title} Application | ${analysis.strengths[0]} Expert`,
      `Experienced ${user.experience.level} ${job.title} | Ready to Start`,
      `${job.title} Position - ${user.fullName} | ${analysis.overallScore}% Skills Match`,
      `Application: ${job.title} | ${user.experience.years}+ Years Experience`
    ];

    // Choose template based on analysis score
    if (analysis.overallScore >= 80) return templates[2];
    if (analysis.skillMatch >= 80) return templates[0];
    if (analysis.experienceMatch >= 80) return templates[3];
    return templates[1];
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(content: string): string[] {
    const lines = content.split('\n');
    const keyPoints: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('•') || line.startsWith('-')) {
        keyPoints.push(line.replace(/^[•\-]\s*/, ''));
      }
    }
    
    // Add summary points if no bullet points found
    if (keyPoints.length === 0) {
      keyPoints.push(
        'Relevant experience and skills',
        'Proven track record of success',
        'Available to start immediately',
        'Strong communication and collaboration skills'
      );
    }
    
    return keyPoints.slice(0, 5); // Limit to top 5 points
  }

  /**
   * Generate call to action
   */
  private generateCallToAction(job: JobOpportunity, analysis: JobAnalysis): string {
    if (analysis.overallScore >= 80) {
      return "I'm confident I'm the right fit for this role. Let's schedule a call to discuss how I can contribute immediately.";
    } else if (analysis.overallScore >= 60) {
      return "I'd love to discuss how my unique background can bring fresh value to your team.";
    } else {
      return "I'm excited about the opportunity to grow with your team and contribute my skills to your success.";
    }
  }

  /**
   * Calculate confidence score for proposal
   */
  private calculateConfidenceScore(analysis: JobAnalysis, customizations: ProposalCustomization[]): number {
    let score = analysis.overallScore;
    
    // Boost for customizations
    score += customizations.length * 5;
    
    // Boost for company research
    if (customizations.some(c => c.type === 'company_research')) {
      score += 10;
    }
    
    // Boost for personal touch
    if (customizations.some(c => c.type === 'personal_touch')) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Recommend attachments based on job and user profile
   */
  private recommendAttachments(user: UserProfile, job: JobOpportunity): string[] {
    const attachments: string[] = [];
    
    // Always include resume
    if (user.resume) {
      attachments.push('resume.pdf');
    }
    
    // Include portfolio for creative/technical roles
    if (
      job.title.toLowerCase().includes('developer') ||
      job.title.toLowerCase().includes('designer') ||
      job.title.toLowerCase().includes('creative')
    ) {
      attachments.push('portfolio.pdf');
    }
    
    // Include certifications for technical roles
    if (user.experience.certifications.length > 0) {
      attachments.push('certifications.pdf');
    }
    
    return attachments;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default ProposalEngine;
