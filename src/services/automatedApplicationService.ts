import { JobOpportunity, UserProfile, Proposal } from '../types/automation';

export interface PlatformConfig {
  name: 'upwork' | 'freelancer' | 'fiverr' | 'toptal' | 'linkedin' | 'indeed' | 'glassdoor';
  enabled: boolean;
  credentials: {
    username?: string;
    password?: string;
    apiKey?: string;
    accessToken?: string;
  };
  settings: {
    autoApply: boolean;
    maxApplicationsPerDay: number;
    bidRange: { min: number; max: number };
    preferredJobTypes: string[];
  };
}

export interface ApplicationResult {
  success: boolean;
  platform: string;
  jobId: string;
  applicationId?: string;
  error?: string;
  timestamp: Date;
}

export class AutomatedApplicationService {
  private platformConfigs: Map<string, PlatformConfig> = new Map();
  private applicationHistory: ApplicationResult[] = [];
  private dailyApplicationCounts: Map<string, number> = new Map();

  constructor(configs: PlatformConfig[]) {
    configs.forEach(config => {
      this.platformConfigs.set(config.name, config);
    });
  }

  /**
   * Submit application automatically to multiple platforms
   */
  async submitApplication(
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    proposal: Proposal,
    targetPlatforms?: string[]
  ): Promise<ApplicationResult[]> {
    const results: ApplicationResult[] = [];
    const platforms = targetPlatforms || Array.from(this.platformConfigs.keys());

    for (const platformName of platforms) {
      const config = this.platformConfigs.get(platformName);
      if (!config || !config.enabled) continue;

      // Check daily limits
      const dailyCount = this.dailyApplicationCounts.get(platformName) || 0;
      if (dailyCount >= config.settings.maxApplicationsPerDay) {
        results.push({
          success: false,
          platform: platformName,
          jobId: jobOpportunity.id,
          error: 'Daily application limit reached',
          timestamp: new Date()
        });
        continue;
      }

      try {
        const result = await this.submitToPlatform(
          platformName,
          jobOpportunity,
          userProfile,
          proposal,
          config
        );
        
        results.push(result);
        
        if (result.success) {
          this.incrementDailyCount(platformName);
        }
        
        // Delay between platform submissions
        await this.delay(2000);
      } catch (error) {
        results.push({
          success: false,
          platform: platformName,
          jobId: jobOpportunity.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    this.applicationHistory.push(...results);
    return results;
  }

  /**
   * Submit to specific platform
   */
  private async submitToPlatform(
    platform: string,
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    switch (platform) {
      case 'upwork':
        return await this.submitToUpwork(job, user, proposal, config);
      case 'freelancer':
        return await this.submitToFreelancer(job, user, proposal, config);
      case 'fiverr':
        return await this.submitToFiverr(job, user, proposal, config);
      case 'linkedin':
        return await this.submitToLinkedIn(job, user, proposal, config);
      case 'indeed':
        return await this.submitToIndeed(job, user, proposal, config);
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  }

  /**
   * Upwork application submission
   */
  private async submitToUpwork(
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    try {
      // Upwork API integration
      const applicationData = {
        job_id: job.sourceUrl.split('/').pop(),
        cover_letter: this.formatProposalForUpwork(proposal, job),
        hourly_rate: this.calculateBidAmount(job, config),
        estimated_duration: this.estimateProjectDuration(job),
        attachments: proposal.attachments.slice(0, 3) // Upwork allows max 3 attachments
      };

      const response = await fetch('https://www.upwork.com/api/profiles/v1/contractors/actions/submit_proposal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        throw new Error(`Upwork API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        platform: 'upwork',
        jobId: job.id,
        applicationId: result.proposal_id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: 'upwork',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Freelancer.com application submission
   */
  private async submitToFreelancer(
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    try {
      const bidData = {
        project_id: this.extractProjectId(job.sourceUrl),
        description: this.formatProposalForFreelancer(proposal, job),
        amount: this.calculateBidAmount(job, config),
        period: this.estimateProjectDuration(job),
        milestone_percentage: 50,
        highlight: true // Highlight bid for better visibility
      };

      const response = await fetch('https://www.freelancer.com/api/projects/0.1/bids/', {
        method: 'POST',
        headers: {
          'Freelancer-OAuth-Token': config.credentials.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bidData)
      });

      if (!response.ok) {
        throw new Error(`Freelancer API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        platform: 'freelancer',
        jobId: job.id,
        applicationId: result.result.id.toString(),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: 'freelancer',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Fiverr application submission (Buyer Requests)
   */
  private async submitToFiverr(
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    try {
      // Fiverr uses a different approach - responding to buyer requests
      const offerData = {
        buyer_request_id: this.extractRequestId(job.sourceUrl),
        description: this.formatProposalForFiverr(proposal, job),
        delivery_time: this.estimateDeliveryDays(job),
        revisions: 3,
        price: this.calculateBidAmount(job, config),
        extras: this.generateFiverrExtras(job, user)
      };

      // Note: Fiverr doesn't have a public API for buyer requests
      // This would require web scraping or browser automation
      const result = await this.submitViaWebAutomation('fiverr', offerData);
      
      return {
        success: result.success,
        platform: 'fiverr',
        jobId: job.id,
        applicationId: result.offerId,
        error: result.error,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: 'fiverr',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * LinkedIn application submission
   */
  private async submitToLinkedIn(
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    try {
      const jobId = this.extractLinkedInJobId(job.sourceUrl);
      
      const applicationData = {
        jobPostingId: jobId,
        coverLetter: this.formatProposalForLinkedIn(proposal, job),
        resumeId: user.resume, // LinkedIn resume ID
        answers: this.generateLinkedInAnswers(job) // Screening questions
      };

      const response = await fetch(`https://api.linkedin.com/v2/jobApplications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.credentials.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        platform: 'linkedin',
        jobId: job.id,
        applicationId: result.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: 'linkedin',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Indeed application submission
   */
  private async submitToIndeed(
    job: JobOpportunity,
    user: UserProfile,
    proposal: Proposal,
    config: PlatformConfig
  ): Promise<ApplicationResult> {
    try {
      // Indeed typically requires web automation as they don't have a public API
      const applicationData = {
        jobKey: this.extractIndeedJobKey(job.sourceUrl),
        coverLetter: this.formatProposalForIndeed(proposal, job),
        resume: user.resume,
        contactInfo: {
          email: user.email,
          phone: user.phone
        }
      };

      const result = await this.submitViaWebAutomation('indeed', applicationData);
      
      return {
        success: result.success,
        platform: 'indeed',
        jobId: job.id,
        applicationId: result.applicationId,
        error: result.error,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: 'indeed',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Web automation for platforms without APIs
   */
  private async submitViaWebAutomation(
    platform: string,
    data: any
  ): Promise<{success: boolean, applicationId?: string, offerId?: string, error?: string}> {
    // This would integrate with Puppeteer or Playwright for browser automation
    // For now, return a mock success response
    console.log(`Web automation submission to ${platform}:`, data);
    
    // Simulate processing time
    await this.delay(3000 + Math.random() * 2000);
    
    // Mock success rate of 85%
    const success = Math.random() > 0.15;
    
    if (success) {
      return {
        success: true,
        applicationId: this.generateId(),
        offerId: this.generateId()
      };
    } else {
      return {
        success: false,
        error: 'Web automation failed - captcha or form changes detected'
      };
    }
  }

  /**
   * Format proposal for different platforms
   */
  private formatProposalForUpwork(proposal: Proposal, job: JobOpportunity): string {
    return `
${proposal.content}

Key Qualifications:
${proposal.keyPoints.map(point => `• ${point}`).join('\n')}

${proposal.callToAction}

Best regards,
[Your Name]
    `.trim();
  }

  private formatProposalForFreelancer(proposal: Proposal, job: JobOpportunity): string {
    return `
Hi there!

${proposal.content}

Why choose me:
${proposal.keyPoints.map(point => `✓ ${point}`).join('\n')}

${proposal.callToAction}

Looking forward to working with you!
    `.trim();
  }

  private formatProposalForFiverr(proposal: Proposal, job: JobOpportunity): string {
    return `
Hello!

${proposal.content}

What you'll get:
${proposal.keyPoints.map(point => `🎯 ${point}`).join('\n')}

${proposal.callToAction}

Ready to start immediately!
    `.trim();
  }

  private formatProposalForLinkedIn(proposal: Proposal, job: JobOpportunity): string {
    return `
Dear Hiring Manager,

${proposal.content}

Key strengths I bring:
${proposal.keyPoints.map(point => `• ${point}`).join('\n')}

${proposal.callToAction}

Sincerely,
[Your Name]
    `.trim();
  }

  private formatProposalForIndeed(proposal: Proposal, job: JobOpportunity): string {
    return proposal.content;
  }

  /**
   * Calculate bid amount based on job and config
   */
  private calculateBidAmount(job: JobOpportunity, config: PlatformConfig): number {
    const budgetMatch = job.budget.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (!budgetMatch) return config.settings.bidRange.min;

    const jobBudget = parseFloat(budgetMatch[1].replace(/,/g, ''));
    
    // Bid slightly below job budget but within our range
    const bidAmount = Math.min(
      jobBudget * 0.95, // 5% below job budget
      config.settings.bidRange.max
    );

    return Math.max(bidAmount, config.settings.bidRange.min);
  }

  /**
   * Estimate project duration
   */
  private estimateProjectDuration(job: JobOpportunity): number {
    const description = job.description.toLowerCase();
    
    if (description.includes('urgent') || description.includes('asap')) {
      return 7; // 1 week
    } else if (description.includes('simple') || description.includes('quick')) {
      return 14; // 2 weeks
    } else if (description.includes('complex') || description.includes('large')) {
      return 60; // 2 months
    }
    
    return 30; // 1 month default
  }

  private estimateDeliveryDays(job: JobOpportunity): number {
    return Math.ceil(this.estimateProjectDuration(job) / 7);
  }

  /**
   * Generate platform-specific extras
   */
  private generateFiverrExtras(job: JobOpportunity, user: UserProfile): any[] {
    return [
      {
        title: 'Express Delivery',
        price: 50,
        description: 'Get your project completed 50% faster'
      },
      {
        title: 'Additional Revisions',
        price: 25,
        description: 'Up to 5 additional revisions included'
      }
    ];
  }

  private generateLinkedInAnswers(job: JobOpportunity): any[] {
    // Mock screening question answers
    return [
      {
        question: 'Do you have experience with the required technologies?',
        answer: 'Yes, I have extensive experience with the technologies mentioned in the job posting.'
      }
    ];
  }

  /**
   * Extract IDs from job URLs
   */
  private extractProjectId(url: string): string {
    const match = url.match(/\/projects\/([^\/\?]+)/);
    return match ? match[1] : '';
  }

  private extractRequestId(url: string): string {
    const match = url.match(/\/requests\/([^\/\?]+)/);
    return match ? match[1] : '';
  }

  private extractLinkedInJobId(url: string): string {
    const match = url.match(/\/jobs\/view\/(\d+)/);
    return match ? match[1] : '';
  }

  private extractIndeedJobKey(url: string): string {
    const match = url.match(/jk=([^&]+)/);
    return match ? match[1] : '';
  }

  /**
   * Utility methods
   */
  private incrementDailyCount(platform: string): void {
    const current = this.dailyApplicationCounts.get(platform) || 0;
    this.dailyApplicationCounts.set(platform, current + 1);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get application statistics
   */
  getApplicationStats(timeframe: 'today' | 'week' | 'month' = 'today'): {
    totalApplications: number;
    successfulApplications: number;
    failedApplications: number;
    platformBreakdown: Record<string, {sent: number, success: number}>;
    successRate: number;
  } {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const relevantApplications = this.applicationHistory.filter(
      app => app.timestamp >= startDate
    );

    const platformBreakdown: Record<string, {sent: number, success: number}> = {};
    
    relevantApplications.forEach(app => {
      if (!platformBreakdown[app.platform]) {
        platformBreakdown[app.platform] = { sent: 0, success: 0 };
      }
      platformBreakdown[app.platform].sent++;
      if (app.success) {
        platformBreakdown[app.platform].success++;
      }
    });

    const totalApplications = relevantApplications.length;
    const successfulApplications = relevantApplications.filter(app => app.success).length;
    const failedApplications = totalApplications - successfulApplications;
    const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;

    return {
      totalApplications,
      successfulApplications,
      failedApplications,
      platformBreakdown,
      successRate: Math.round(successRate)
    };
  }

  /**
   * Update platform configuration
   */
  updatePlatformConfig(platformName: string, config: Partial<PlatformConfig>): void {
    const existingConfig = this.platformConfigs.get(platformName);
    if (existingConfig) {
      this.platformConfigs.set(platformName, { ...existingConfig, ...config });
    }
  }

  /**
   * Reset daily counters (call this daily)
   */
  resetDailyCounters(): void {
    this.dailyApplicationCounts.clear();
  }
}

export default AutomatedApplicationService;
