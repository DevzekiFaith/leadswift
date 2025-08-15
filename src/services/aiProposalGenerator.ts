import { JobOpportunity, UserProfile, Proposal, CompanyData, ProposalCustomization } from '../types/automation';

export interface AIProposalConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  temperature: number;
  maxTokens: number;
}

export class AIProposalGenerator {
  private config: AIProposalConfig;

  constructor(config: AIProposalConfig) {
    this.config = config;
  }

  /**
   * Generate AI-powered personalized proposal
   */
  async generateProposal(
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    companyData?: CompanyData
  ): Promise<Proposal> {
    try {
      // Analyze job requirements and user profile match
      const analysisPrompt = this.buildAnalysisPrompt(jobOpportunity, userProfile, companyData);
      
      // Generate proposal content using AI
      const proposalContent = await this.callAIService(analysisPrompt);
      
      // Extract structured data from AI response
      const structuredProposal = this.parseAIResponse(proposalContent);
      
      // Create final proposal object
      const proposal: Proposal = {
        id: this.generateId(),
        jobOpportunityId: jobOpportunity.id,
        subject: structuredProposal.subject,
        content: structuredProposal.content,
        tone: this.determineTone(jobOpportunity, companyData),
        keyPoints: structuredProposal.keyPoints,
        callToAction: structuredProposal.callToAction,
        attachments: this.getRelevantAttachments(userProfile, jobOpportunity),
        customizations: this.generateCustomizations(jobOpportunity, companyData, userProfile),
        estimatedReadTime: Math.ceil(structuredProposal.content.split(' ').length / 200),
        confidenceScore: this.calculateConfidenceScore(jobOpportunity, userProfile)
      };

      return proposal;
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      throw new Error('Failed to generate AI proposal');
    }
  }

  /**
   * Generate multiple proposal variations for A/B testing
   */
  async generateProposalVariations(
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    variations: number = 3
  ): Promise<Proposal[]> {
    const proposals: Proposal[] = [];
    const tones: Array<'professional' | 'casual' | 'enthusiastic' | 'technical'> = 
      ['professional', 'enthusiastic', 'technical'];

    for (let i = 0; i < variations; i++) {
      const variationPrompt = this.buildVariationPrompt(
        jobOpportunity, 
        userProfile, 
        tones[i % tones.length],
        i + 1
      );
      
      const content = await this.callAIService(variationPrompt);
      const parsed = this.parseAIResponse(content);
      
      proposals.push({
        id: this.generateId(),
        jobOpportunityId: jobOpportunity.id,
        subject: parsed.subject,
        content: parsed.content,
        tone: tones[i % tones.length],
        keyPoints: parsed.keyPoints,
        callToAction: parsed.callToAction,
        attachments: this.getRelevantAttachments(userProfile, jobOpportunity),
        customizations: [],
        estimatedReadTime: Math.ceil(parsed.content.split(' ').length / 200),
        confidenceScore: this.calculateConfidenceScore(jobOpportunity, userProfile) - (i * 5)
      });
    }

    return proposals.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * Real-time proposal optimization based on response data
   */
  async optimizeProposal(
    originalProposal: Proposal,
    responseData: {
      opened: boolean;
      clicked: boolean;
      replied: boolean;
      responseTime?: number;
      feedback?: string;
    }
  ): Promise<Proposal> {
    const optimizationPrompt = `
    Analyze and optimize this proposal based on performance data:
    
    Original Proposal:
    Subject: ${originalProposal.subject}
    Content: ${originalProposal.content}
    
    Performance Data:
    - Opened: ${responseData.opened}
    - Clicked: ${responseData.clicked}
    - Replied: ${responseData.replied}
    - Response Time: ${responseData.responseTime || 'N/A'} hours
    - Feedback: ${responseData.feedback || 'None'}
    
    Provide an optimized version that addresses any weaknesses and improves engagement.
    Return JSON format with subject, content, keyPoints, and callToAction.
    `;

    const optimizedContent = await this.callAIService(optimizationPrompt);
    const parsed = this.parseAIResponse(optimizedContent);

    return {
      ...originalProposal,
      id: this.generateId(),
      subject: parsed.subject,
      content: parsed.content,
      keyPoints: parsed.keyPoints,
      callToAction: parsed.callToAction,
      confidenceScore: Math.min(originalProposal.confidenceScore + 10, 100)
    };
  }

  private buildAnalysisPrompt(
    job: JobOpportunity,
    user: UserProfile,
    company?: CompanyData
  ): string {
    return `
    You are an expert proposal writer for freelancers and job seekers. Generate a highly personalized, compelling proposal.

    JOB OPPORTUNITY:
    - Title: ${job.title}
    - Company: ${job.company}
    - Industry: ${job.industry}
    - Location: ${job.location}
    - Type: ${job.type}
    - Budget: ${job.budget}
    - Description: ${job.description}
    - Requirements: ${job.requirements.join(', ')}
    - Urgency: ${job.urgency}

    USER PROFILE:
    - Name: ${user.fullName}
    - Experience: ${user.experience.years} years (${user.experience.level})
    - Skills: ${user.skills.join(', ')}
    - Industries: ${user.industries.join(', ')}
    - Previous Roles: ${user.experience.previousRoles.join(', ')}
    - Bio: ${user.bio}
    - Hourly Rate: $${user.hourlyRate || 'Negotiable'}

    ${company ? `
    COMPANY RESEARCH:
    - Industry: ${company.industry}
    - Size: ${company.size}
    - Values: ${company.values.join(', ')}
    - Recent News: ${company.recentNews.join(', ')}
    - Tech Stack: ${company.techStack?.join(', ') || 'N/A'}
    ` : ''}

    Generate a proposal that:
    1. Shows deep understanding of their needs
    2. Highlights relevant experience and skills
    3. Demonstrates knowledge of their company/industry
    4. Provides specific examples and value propositions
    5. Includes a clear call to action
    6. Matches the job's urgency and tone

    Return JSON format:
    {
      "subject": "Compelling email subject line",
      "content": "Full proposal content (300-500 words)",
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "callToAction": "Specific next step request"
    }
    `;
  }

  private buildVariationPrompt(
    job: JobOpportunity,
    user: UserProfile,
    tone: string,
    variation: number
  ): string {
    return `
    Create proposal variation #${variation} with ${tone} tone for:
    
    Job: ${job.title} at ${job.company}
    User: ${user.fullName} (${user.experience.years} years experience)
    
    Make this version unique while maintaining quality and relevance.
    Focus on different aspects of the user's experience and value proposition.
    
    Return JSON format with subject, content, keyPoints, and callToAction.
    `;
  }

  private async callAIService(prompt: string): Promise<string> {
    try {
      if (this.config.model.startsWith('gpt')) {
        return await this.callOpenAI(prompt);
      } else if (this.config.model.startsWith('claude')) {
        return await this.callClaude(prompt);
      }
      throw new Error('Unsupported AI model');
    } catch (error) {
      console.error('AI service call failed:', error);
      // Fallback to template-based generation
      return this.generateFallbackProposal(prompt);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callClaude(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private generateFallbackProposal(prompt: string): string {
    // Template-based fallback when AI services are unavailable
    return JSON.stringify({
      subject: "Experienced Professional Ready to Deliver Results",
      content: "I am excited to apply for this opportunity and believe my experience aligns well with your requirements. I would love to discuss how I can contribute to your project's success.",
      keyPoints: ["Relevant experience", "Proven track record", "Available to start immediately"],
      callToAction: "I'd be happy to discuss this opportunity further. When would be a good time for a brief call?"
    });
  }

  private parseAIResponse(response: string): any {
    try {
      // Extract JSON from response if it's wrapped in other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return fallback structure
      return {
        subject: "Professional Application",
        content: response,
        keyPoints: ["Experience", "Skills", "Availability"],
        callToAction: "Looking forward to hearing from you."
      };
    }
  }

  private determineTone(job: JobOpportunity, company?: CompanyData): 'professional' | 'casual' | 'enthusiastic' | 'technical' {
    if (job.industry.toLowerCase().includes('tech') || job.title.toLowerCase().includes('developer')) {
      return 'technical';
    }
    if (job.urgency === 'high') {
      return 'enthusiastic';
    }
    if (company?.culture.some(c => c.toLowerCase().includes('casual'))) {
      return 'casual';
    }
    return 'professional';
  }

  private getRelevantAttachments(user: UserProfile, job: JobOpportunity): string[] {
    const attachments: string[] = [];
    
    if (user.resume) {
      attachments.push(user.resume);
    }
    
    // Add relevant portfolio items
    const relevantPortfolio = user.portfolio.filter(item => 
      job.skills.some(skill => 
        item.technologies.some(tech => 
          tech.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
    
    relevantPortfolio.slice(0, 2).forEach(item => {
      if (item.url) {
        attachments.push(item.url);
      }
    });
    
    return attachments;
  }

  private generateCustomizations(
    job: JobOpportunity,
    company?: CompanyData,
    user?: UserProfile
  ): ProposalCustomization[] {
    const customizations: ProposalCustomization[] = [];

    if (company?.recentNews.length) {
      customizations.push({
        type: 'company_research',
        content: `I noticed your recent ${company.recentNews[0]}`,
        reasoning: 'Shows research and genuine interest'
      });
    }

    if (user?.experience.previousRoles.some(role => 
      role.toLowerCase().includes(job.industry.toLowerCase())
    )) {
      customizations.push({
        type: 'industry_insight',
        content: `My experience in ${job.industry} gives me unique insights`,
        reasoning: 'Highlights relevant industry experience'
      });
    }

    return customizations;
  }

  private calculateConfidenceScore(job: JobOpportunity, user: UserProfile): number {
    let score = 50; // Base score

    // Skill match
    const matchingSkills = job.skills.filter(skill =>
      user.skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    score += (matchingSkills.length / job.skills.length) * 30;

    // Industry match
    if (user.industries.includes(job.industry)) {
      score += 15;
    }

    // Experience level match
    const jobSeniorityLevel = this.extractJobLevel(job.title, job.description);
    if (jobSeniorityLevel === user.experience.level) {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  }

  private extractJobLevel(title: string, description: string): 'entry' | 'mid' | 'senior' | 'expert' {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
      return 'senior';
    }
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
      return 'entry';
    }
    if (text.includes('expert') || text.includes('architect') || text.includes('director')) {
      return 'expert';
    }
    return 'mid';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default AIProposalGenerator;
