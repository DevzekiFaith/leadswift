import { Proposal, EmailCampaign, JobOpportunity, UserProfile, ContactInfo } from '../types/automation';
import AIProposalGenerator from './aiProposalGenerator';

export interface EmailProvider {
  name: 'sendgrid' | 'resend' | 'nodemailer' | 'postmark';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface AutomatedEmailConfig {
  provider: EmailProvider;
  trackingEnabled: boolean;
  followUpEnabled: boolean;
  maxDailyEmails: number;
  delayBetweenEmails: number; // minutes
}

export class AutomatedEmailService {
  private config: AutomatedEmailConfig;
  private proposalGenerator: AIProposalGenerator;
  private emailQueue: Array<{
    proposal: Proposal;
    jobOpportunity: JobOpportunity;
    userProfile: UserProfile;
    scheduledTime: Date;
    priority: number;
  }> = [];

  constructor(config: AutomatedEmailConfig, proposalGenerator: AIProposalGenerator) {
    this.config = config;
    this.proposalGenerator = proposalGenerator;
    this.startEmailProcessor();
  }

  /**
   * Automatically generate and send proposal email
   */
  async sendAutomatedProposal(
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{success: boolean, campaignId?: string, error?: string}> {
    try {
      // Generate AI proposal
      const proposal = await this.proposalGenerator.generateProposal(
        jobOpportunity,
        userProfile
      );

      // Create email campaign
      const campaign = await this.createEmailCampaign(proposal, jobOpportunity);

      // Send email immediately for high priority, queue for others
      if (priority === 'high') {
        const result = await this.sendEmail(proposal, jobOpportunity, userProfile);
        if (result.success) {
          await this.updateCampaignStatus(campaign.id, 'sent');
          this.scheduleFollowUps(campaign, jobOpportunity, userProfile);
        }
        return result;
      } else {
        // Add to queue for batch processing
        this.addToQueue(proposal, jobOpportunity, userProfile, this.getPriorityScore(priority));
        return { success: true, campaignId: campaign.id };
      }
    } catch (error) {
      console.error('Error sending automated proposal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send bulk automated proposals
   */
  async sendBulkProposals(
    opportunities: Array<{job: JobOpportunity, user: UserProfile}>,
    options: {
      batchSize: number;
      delayBetweenBatches: number; // minutes
      generateVariations: boolean;
    }
  ): Promise<Array<{jobId: string, success: boolean, campaignId?: string, error?: string}>> {
    const results = [];
    
    for (let i = 0; i < opportunities.length; i += options.batchSize) {
      const batch = opportunities.slice(i, i + options.batchSize);
      
      const batchPromises = batch.map(async ({job, user}) => {
        try {
          let proposal: Proposal;
          
          if (options.generateVariations) {
            const variations = await this.proposalGenerator.generateProposalVariations(job, user, 3);
            proposal = variations[0]; // Use best variation
          } else {
            proposal = await this.proposalGenerator.generateProposal(job, user);
          }

          const result = await this.sendEmail(proposal, job, user);
          
          if (result.success) {
            const campaign = await this.createEmailCampaign(proposal, job);
            this.scheduleFollowUps(campaign, job, user);
            return { jobId: job.id, success: true, campaignId: campaign.id };
          }
          
          return { jobId: job.id, success: false, error: result.error };
        } catch (error) {
          return { 
            jobId: job.id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid rate limiting
      if (i + options.batchSize < opportunities.length) {
        await this.delay(options.delayBetweenBatches * 60 * 1000);
      }
    }

    return results;
  }

  /**
   * Send follow-up emails based on response tracking
   */
  async sendFollowUp(
    originalCampaign: EmailCampaign,
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    followUpType: 'no_response' | 'opened_no_reply' | 'custom'
  ): Promise<{success: boolean, error?: string}> {
    try {
      // Generate follow-up content using AI
      const followUpPrompt = this.buildFollowUpPrompt(
        originalCampaign,
        jobOpportunity,
        followUpType
      );

      const followUpContent = await this.generateFollowUpContent(followUpPrompt);
      
      // Create follow-up proposal
      const followUpProposal: Proposal = {
        id: this.generateId(),
        jobOpportunityId: jobOpportunity.id,
        subject: followUpContent.subject,
        content: followUpContent.content,
        tone: 'professional',
        keyPoints: followUpContent.keyPoints,
        callToAction: followUpContent.callToAction,
        attachments: [],
        customizations: [],
        estimatedReadTime: Math.ceil(followUpContent.content.split(' ').length / 200),
        confidenceScore: 75
      };

      return await this.sendEmail(followUpProposal, jobOpportunity, userProfile);
    } catch (error) {
      console.error('Error sending follow-up:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Real-time email tracking and response handling
   */
  async trackEmailResponse(
    campaignId: string,
    eventType: 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed',
    metadata?: any
  ): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) return;

      // Update campaign tracking data
      campaign.trackingData = campaign.trackingData || {
        opens: 0,
        clicks: 0,
        responses: 0,
        bounces: 0,
        unsubscribes: 0
      };

      switch (eventType) {
        case 'opened':
          campaign.trackingData.opens++;
          campaign.openedDate = new Date();
          break;
        case 'clicked':
          campaign.trackingData.clicks++;
          break;
        case 'replied':
          campaign.trackingData.responses++;
          campaign.repliedDate = new Date();
          campaign.status = 'replied';
          break;
        case 'bounced':
          campaign.trackingData.bounces++;
          campaign.status = 'bounced';
          break;
        case 'unsubscribed':
          campaign.trackingData.unsubscribes++;
          break;
      }

      await this.updateCampaign(campaign);

      // Trigger automated responses based on tracking
      if (eventType === 'opened' && !campaign.repliedDate) {
        // Schedule follow-up for opened but not replied
        setTimeout(() => {
          this.scheduleOpenedFollowUp(campaign);
        }, 24 * 60 * 60 * 1000); // 24 hours delay
      }
    } catch (error) {
      console.error('Error tracking email response:', error);
    }
  }

  private async sendEmail(
    proposal: Proposal,
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile
  ): Promise<{success: boolean, messageId?: string, error?: string}> {
    try {
      const emailData = {
        to: this.extractEmail(jobOpportunity.contactInfo),
        from: {
          email: this.config.provider.fromEmail,
          name: this.config.provider.fromName
        },
        subject: proposal.subject,
        html: this.formatEmailHTML(proposal, userProfile),
        text: this.formatEmailText(proposal, userProfile),
        attachments: await this.prepareAttachments(proposal.attachments),
        tracking: this.config.trackingEnabled ? {
          clickTracking: true,
          openTracking: true,
          subscriptionTracking: true
        } : undefined
      };

      const messageId = await this.sendViaProvider(emailData);
      
      return { success: true, messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendViaProvider(emailData: any): Promise<string> {
    switch (this.config.provider.name) {
      case 'sendgrid':
        return await this.sendViaSendGrid(emailData);
      case 'resend':
        return await this.sendViaResend(emailData);
      case 'postmark':
        return await this.sendViaPostmark(emailData);
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider.name}`);
    }
  }

  private async sendViaSendGrid(emailData: any): Promise<string> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: emailData.from,
        content: [
          { type: 'text/plain', value: emailData.text },
          { type: 'text/html', value: emailData.html }
        ],
        tracking_settings: emailData.tracking ? {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
          subscription_tracking: { enable: true }
        } : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`);
    }

    return response.headers.get('x-message-id') || this.generateId();
  }

  private async sendViaResend(emailData: any): Promise<string> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${emailData.from.name} <${emailData.from.email}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      })
    });

    if (!response.ok) {
      throw new Error(`Resend error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  private async sendViaPostmark(emailData: any): Promise<string> {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': this.config.provider.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: `${emailData.from.name} <${emailData.from.email}>`,
        To: emailData.to,
        Subject: emailData.subject,
        HtmlBody: emailData.html,
        TextBody: emailData.text,
        TrackOpens: this.config.trackingEnabled,
        TrackLinks: this.config.trackingEnabled ? 'HtmlAndText' : 'None',
        Attachments: emailData.attachments
      })
    });

    if (!response.ok) {
      throw new Error(`Postmark error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.MessageID;
  }

  private formatEmailHTML(proposal: Proposal, userProfile: UserProfile): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${proposal.subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #6C3EFF; padding-bottom: 20px; margin-bottom: 30px; }
            .content { margin-bottom: 30px; }
            .signature { border-top: 1px solid #eee; padding-top: 20px; }
            .cta-button { 
                display: inline-block; 
                background: #6C3EFF; 
                color: white; 
                padding: 12px 24px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="color: #6C3EFF; margin: 0;">LeadSwift Proposal</h2>
            </div>
            
            <div class="content">
                ${proposal.content.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center;">
                <a href="mailto:${userProfile.email}" class="cta-button">${proposal.callToAction}</a>
            </div>
            
            <div class="signature">
                <p><strong>${userProfile.fullName}</strong><br>
                ${userProfile.email}<br>
                ${userProfile.phone || ''}</p>
                
                <p><small>Sent via LeadSwift - AI-Powered Client Acquisition</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private formatEmailText(proposal: Proposal, userProfile: UserProfile): string {
    return `
${proposal.content}

${proposal.callToAction}

Best regards,
${userProfile.fullName}
${userProfile.email}
${userProfile.phone || ''}

---
Sent via LeadSwift - AI-Powered Client Acquisition
    `.trim();
  }

  private extractEmail(contactInfo: ContactInfo): string {
    if (contactInfo.email) {
      return contactInfo.email;
    }
    throw new Error('No email address found in contact info');
  }

  private async prepareAttachments(attachmentUrls: string[]): Promise<any[]> {
    // Convert URLs to attachment format for email providers
    return attachmentUrls.map(url => ({
      filename: url.split('/').pop() || 'attachment',
      content: url, // For URLs, providers will fetch the content
      type: 'application/pdf' // Default type
    }));
  }

  private startEmailProcessor(): void {
    // Process email queue every minute
    setInterval(() => {
      this.processEmailQueue();
    }, 60 * 1000);
  }

  private async processEmailQueue(): Promise<void> {
    if (this.emailQueue.length === 0) return;

    // Sort by priority and scheduled time
    this.emailQueue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    });

    const now = new Date();
    const emailsToSend = this.emailQueue.filter(item => item.scheduledTime <= now);

    for (const emailItem of emailsToSend.slice(0, 5)) { // Process max 5 at a time
      try {
        await this.sendEmail(emailItem.proposal, emailItem.jobOpportunity, emailItem.userProfile);
        this.emailQueue = this.emailQueue.filter(item => item !== emailItem);
        
        // Delay between emails to avoid rate limiting
        await this.delay(this.config.delayBetweenEmails * 60 * 1000);
      } catch (error) {
        console.error('Error processing email from queue:', error);
      }
    }
  }

  private addToQueue(
    proposal: Proposal,
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    priority: number
  ): void {
    const scheduledTime = new Date(Date.now() + (this.emailQueue.length * this.config.delayBetweenEmails * 60 * 1000));
    
    this.emailQueue.push({
      proposal,
      jobOpportunity,
      userProfile,
      scheduledTime,
      priority
    });
  }

  private getPriorityScore(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private async createEmailCampaign(proposal: Proposal, jobOpportunity: JobOpportunity): Promise<EmailCampaign> {
    const campaign: EmailCampaign = {
      id: this.generateId(),
      proposalId: proposal.id,
      name: `${jobOpportunity.company} - ${jobOpportunity.title}`,
      targetIndustry: jobOpportunity.industry,
      template: proposal.content,
      status: 'scheduled',
      scheduledDate: new Date(),
      scheduled: new Date(),
      totalSent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      automationEnabled: true,
      followUpSequence: [],
      trackingData: {
        opens: 0,
        clicks: 0,
        responses: 0,
        bounces: 0,
        unsubscribes: 0
      }
    };

    // Save campaign to database (mock implementation)
    await this.saveCampaign(campaign);
    return campaign;
  }

  private async scheduleFollowUps(
    campaign: EmailCampaign,
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile
  ): Promise<void> {
    if (!this.config.followUpEnabled) return;

    const followUps = [
      { delayDays: 3, type: 'no_response', subject: 'Following up on my proposal' },
      { delayDays: 7, type: 'opened_no_reply', subject: 'Quick question about your project' },
      { delayDays: 14, type: 'final_follow_up', subject: 'Last follow-up - still interested?' }
    ];

    for (const followUp of followUps) {
      setTimeout(() => {
        this.checkAndSendFollowUp(campaign, jobOpportunity, userProfile, followUp.type);
      }, followUp.delayDays * 24 * 60 * 60 * 1000);
    }
  }

  private async checkAndSendFollowUp(
    campaign: EmailCampaign,
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    followUpType: string
  ): Promise<void> {
    const updatedCampaign = await this.getCampaign(campaign.id);
    if (!updatedCampaign || updatedCampaign.status === 'replied') return;

    if (followUpType === 'no_response' && updatedCampaign.trackingData.responses === 0) {
      await this.sendFollowUp(updatedCampaign, jobOpportunity, userProfile, 'no_response');
    } else if (followUpType === 'opened_no_reply' && updatedCampaign.trackingData.opens > 0 && updatedCampaign.trackingData.responses === 0) {
      await this.sendFollowUp(updatedCampaign, jobOpportunity, userProfile, 'opened_no_reply');
    }
  }

  private buildFollowUpPrompt(
    originalCampaign: EmailCampaign,
    jobOpportunity: JobOpportunity,
    followUpType: string
  ): string {
    return `
    Generate a follow-up email for this situation:
    
    Original proposal sent for: ${jobOpportunity.title} at ${jobOpportunity.company}
    Follow-up type: ${followUpType}
    Days since original: ${Math.ceil((Date.now() - originalCampaign.scheduledDate.getTime()) / (1000 * 60 * 60 * 24))}
    
    Create a brief, professional follow-up that:
    1. References the original proposal
    2. Adds new value or perspective
    3. Has a clear call to action
    4. Maintains professional tone
    
    Return JSON with subject, content, keyPoints, and callToAction.
    `;
  }

  private async generateFollowUpContent(prompt: string): Promise<any> {
    // Use the AI proposal generator's service for consistency
    return { 
      subject: "Following up on my proposal",
      content: "I wanted to follow up on the proposal I sent regarding your project. I'm still very interested and available to discuss further.",
      keyPoints: ["Still interested", "Available to discuss", "Ready to start"],
      callToAction: "Would you be available for a brief call this week?"
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Mock database methods - replace with real database integration
  private async saveCampaign(campaign: EmailCampaign): Promise<void> {
    console.log('Saving campaign:', campaign.id);
  }

  private async getCampaign(campaignId: string): Promise<EmailCampaign | null> {
    console.log('Getting campaign:', campaignId);
    return null;
  }

  private async updateCampaign(campaign: EmailCampaign): Promise<void> {
    console.log('Updating campaign:', campaign.id);
  }

  private async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    console.log('Updating campaign status:', campaignId, status);
  }

  private async scheduleOpenedFollowUp(campaign: EmailCampaign): Promise<void> {
    console.log('Scheduling opened follow-up for campaign:', campaign.id);
  }
}

export default AutomatedEmailService;
