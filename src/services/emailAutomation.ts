import { 
  EmailCampaign, 
  FollowUpEmail, 
  EmailTracking, 
  Proposal, 
  JobOpportunity, 
  UserProfile,
  Reminder 
} from '../types/automation';

export class EmailAutomationService {
  private emailProvider: string;
  private trackingDomain: string;
  private apiKey: string;

  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid'; // sendgrid, mailgun, ses
    this.trackingDomain = process.env.TRACKING_DOMAIN || 'track.leadswift.ai';
    this.apiKey = process.env.EMAIL_API_KEY || '';
  }

  /**
   * Create and schedule email campaign for proposal
   */
  async createEmailCampaign(
    proposal: Proposal,
    job: JobOpportunity,
    user: UserProfile,
    scheduleDate?: Date
  ): Promise<EmailCampaign> {
    try {
      const campaign: EmailCampaign = {
        id: this.generateId(),
        proposalId: proposal.id,
        status: 'draft',
        scheduledDate: scheduleDate || new Date(),
        followUpSequence: await this.generateFollowUpSequence(job, user),
        trackingData: this.initializeTracking()
      };

      // Schedule the email
      if (scheduleDate && scheduleDate > new Date()) {
        campaign.status = 'scheduled';
        await this.scheduleEmail(campaign, proposal, job, user);
      } else {
        // Send immediately
        await this.sendEmail(campaign, proposal, job, user);
      }

      return campaign;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw new Error('Failed to create email campaign');
    }
  }

  /**
   * Send email with tracking
   */
  async sendEmail(
    campaign: EmailCampaign,
    proposal: Proposal,
    job: JobOpportunity,
    user: UserProfile
  ): Promise<boolean> {
    try {
      // Add tracking pixels and links
      const trackedContent = this.addEmailTracking(proposal.content, campaign.id);
      
      // Prepare email data
      const emailData = {
        to: job.contactInfo.email,
        from: {
          email: user.email,
          name: user.fullName
        },
        subject: proposal.subject,
        html: this.formatEmailHTML(trackedContent, user),
        text: proposal.content,
        attachments: await this.prepareAttachments(proposal.attachments, user),
        tracking: {
          campaignId: campaign.id,
          userId: user.id,
          jobId: job.id
        }
      };

      // Send via email provider
      const result = await this.sendViaProvider(emailData);
      
      if (result.success) {
        campaign.status = 'sent';
        campaign.sentDate = new Date();
        
        // Schedule follow-ups
        await this.scheduleFollowUps(campaign, job, user);
        
        return true;
      } else {
        campaign.status = 'bounced';
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      campaign.status = 'bounced';
      return false;
    }
  }

  /**
   * Generate intelligent follow-up sequence
   */
  private async generateFollowUpSequence(
    job: JobOpportunity,
    user: UserProfile
  ): Promise<FollowUpEmail[]> {
    const sequence: FollowUpEmail[] = [];

    // Follow-up 1: Gentle reminder (3 days)
    sequence.push({
      id: this.generateId(),
      sequence: 1,
      delayDays: 3,
      subject: `Following up on ${job.title} application`,
      content: this.generateFollowUpContent(1, job, user),
      triggerCondition: 'no_response',
      status: 'pending'
    });

    // Follow-up 2: Value addition (7 days)
    sequence.push({
      id: this.generateId(),
      sequence: 2,
      delayDays: 7,
      subject: `Additional insights for ${job.title} role`,
      content: this.generateFollowUpContent(2, job, user),
      triggerCondition: 'no_response',
      status: 'pending'
    });

    // Follow-up 3: Final attempt (14 days)
    sequence.push({
      id: this.generateId(),
      sequence: 3,
      delayDays: 14,
      subject: `Last follow-up regarding ${job.title}`,
      content: this.generateFollowUpContent(3, job, user),
      triggerCondition: 'no_response',
      status: 'pending'
    });

    return sequence;
  }

  /**
   * Generate follow-up email content
   */
  private generateFollowUpContent(
    sequenceNumber: number,
    job: JobOpportunity,
    user: UserProfile
  ): string {
    const templates = {
      1: `Hi there,

I wanted to follow up on my application for the ${job.title} position at ${job.company}. 

I'm still very interested in this opportunity and believe my ${user.skills.slice(0, 2).join(' and ')} experience would be valuable to your team.

Is there any additional information I can provide to help with your decision?

Best regards,
${user.fullName}`,

      2: `Hello,

I hope this email finds you well. I'm following up on the ${job.title} position I applied for.

I've been thinking about the challenges ${job.company} might be facing in ${job.industry}, and I have some ideas that could add immediate value:

• ${this.generateValueProposition(job.industry, 1)}
• ${this.generateValueProposition(job.industry, 2)}

I'd love to discuss these ideas and how I can contribute to your team's success.

Best regards,
${user.fullName}`,

      3: `Hi,

This will be my final follow-up regarding the ${job.title} position.

I understand you're likely busy evaluating candidates. If the timing isn't right now, I'd appreciate being considered for future opportunities that match my ${user.skills[0]} background.

Thank you for your time and consideration.

Best regards,
${user.fullName}`
    };

    return templates[sequenceNumber as keyof typeof templates] || templates[1];
  }

  /**
   * Generate value proposition for follow-ups
   */
  private generateValueProposition(industry: string, index: number): string {
    const propositions: Record<string, string[]> = {
      'technology': [
        'Implementing automated testing to reduce deployment risks',
        'Optimizing database queries to improve application performance'
      ],
      'healthcare': [
        'Enhancing patient data security with advanced encryption',
        'Streamlining workflow processes to improve efficiency'
      ],
      'finance': [
        'Implementing risk assessment algorithms for better decision making',
        'Developing real-time monitoring systems for fraud detection'
      ],
      'education': [
        'Creating interactive learning modules to increase engagement',
        'Implementing analytics to track student progress and outcomes'
      ],
      'marketing': [
        'Developing data-driven campaigns to improve ROI',
        'Creating automated lead nurturing sequences'
      ],
      'retail': [
        'Optimizing inventory management to reduce costs',
        'Implementing personalization engines to increase sales'
      ]
    };

    const industryProps = propositions[industry.toLowerCase()] || [
      'Streamlining processes to improve efficiency',
      'Implementing best practices to reduce costs'
    ];

    return industryProps[index - 1] || industryProps[0];
  }

  /**
   * Add email tracking pixels and link tracking
   */
  private addEmailTracking(content: string, campaignId: string): string {
    // Add tracking pixel
    const trackingPixel = `<img src="https://${this.trackingDomain}/pixel/${campaignId}" width="1" height="1" style="display:none;" />`;
    
    // Add link tracking (replace URLs with tracked versions)
    const trackedContent = content.replace(
      /(https?:\/\/[^\s]+)/g,
      `https://${this.trackingDomain}/link/${campaignId}?url=$1`
    );
    
    return trackedContent + trackingPixel;
  }

  /**
   * Format email as HTML
   */
  private formatEmailHTML(content: string, user: UserProfile): string {
    const htmlContent = content.replace(/\n/g, '<br>');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application from ${user.fullName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #6C3EFF; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
        .signature { margin-top: 20px; }
        a { color: #6C3EFF; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="color: #6C3EFF; margin: 0;">Application from ${user.fullName}</h2>
    </div>
    
    <div class="content">
        ${htmlContent}
    </div>
    
    <div class="footer">
        <p>This email was sent via LeadSwift AI - Automated Job Application Platform</p>
    </div>
</body>
</html>`;
  }

  /**
   * Prepare email attachments
   */
  private async prepareAttachments(attachmentNames: string[], user: UserProfile): Promise<any[]> {
    const attachments: any[] = [];
    
    for (const name of attachmentNames) {
      try {
        // In a real implementation, this would fetch files from storage
        const attachment = {
          filename: name,
          content: await this.getAttachmentContent(name, user),
          type: this.getAttachmentType(name)
        };
        attachments.push(attachment);
      } catch (error) {
        console.error(`Error preparing attachment ${name}:`, error);
      }
    }
    
    return attachments;
  }

  /**
   * Get attachment content (mock implementation)
   */
  private async getAttachmentContent(filename: string, user: UserProfile): Promise<string> {
    // In a real implementation, this would fetch from file storage
    if (filename === 'resume.pdf') {
      return user.resume || 'Resume content would be here';
    }
    return 'Attachment content would be here';
  }

  /**
   * Get attachment MIME type
   */
  private getAttachmentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    return types[extension || ''] || 'application/octet-stream';
  }

  /**
   * Send email via provider (mock implementation)
   */
  private async sendViaProvider(emailData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock implementation - in reality would call SendGrid, Mailgun, etc.
      console.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate 95% success rate
      if (Math.random() > 0.05) {
        return { success: true };
      } else {
        return { success: false, error: 'Email delivery failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Schedule follow-up emails
   */
  private async scheduleFollowUps(
    campaign: EmailCampaign,
    job: JobOpportunity,
    user: UserProfile
  ): Promise<void> {
    for (const followUp of campaign.followUpSequence) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + followUp.delayDays);
      
      // In a real implementation, this would use a job queue like Bull or Agenda
      setTimeout(async () => {
        await this.processFollowUp(campaign, followUp, job, user);
      }, followUp.delayDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    }
  }

  /**
   * Process scheduled follow-up
   */
  private async processFollowUp(
    campaign: EmailCampaign,
    followUp: FollowUpEmail,
    job: JobOpportunity,
    user: UserProfile
  ): Promise<void> {
    try {
      // Check if conditions are met
      if (followUp.triggerCondition === 'no_response' && campaign.trackingData.responses > 0) {
        followUp.status = 'skipped';
        return;
      }
      
      if (followUp.triggerCondition === 'opened_no_reply' && campaign.trackingData.opens === 0) {
        followUp.status = 'skipped';
        return;
      }
      
      // Send follow-up email
      const followUpEmailData = {
        to: job.contactInfo.email,
        from: {
          email: user.email,
          name: user.fullName
        },
        subject: followUp.subject,
        html: this.formatEmailHTML(followUp.content, user),
        text: followUp.content,
        tracking: {
          campaignId: campaign.id,
          followUpId: followUp.id,
          sequence: followUp.sequence
        }
      };
      
      const result = await this.sendViaProvider(followUpEmailData);
      
      if (result.success) {
        followUp.status = 'sent';
      } else {
        followUp.status = 'skipped';
        console.error('Follow-up email failed:', result.error);
      }
    } catch (error) {
      console.error('Error processing follow-up:', error);
      followUp.status = 'skipped';
    }
  }

  /**
   * Track email opens, clicks, and responses
   */
  async trackEmailEvent(
    campaignId: string,
    eventType: 'open' | 'click' | 'response' | 'bounce' | 'unsubscribe',
    metadata?: any
  ): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log('Email event tracked:', {
        campaignId,
        eventType,
        timestamp: new Date(),
        metadata
      });
      
      // Update campaign tracking data
      // This would be retrieved from and saved to database
    } catch (error) {
      console.error('Error tracking email event:', error);
    }
  }

  /**
   * Generate email performance report
   */
  async generateEmailReport(campaignIds: string[]): Promise<any> {
    try {
      // Mock report data - in reality would query database
      return {
        totalEmails: campaignIds.length,
        delivered: Math.round(campaignIds.length * 0.95),
        opened: Math.round(campaignIds.length * 0.25),
        clicked: Math.round(campaignIds.length * 0.05),
        responded: Math.round(campaignIds.length * 0.03),
        bounced: Math.round(campaignIds.length * 0.05),
        openRate: '25%',
        clickRate: '5%',
        responseRate: '3%',
        bestPerformingSubjects: [
          'Application: Senior Developer | 85% Skills Match',
          'Following up on Frontend Developer application'
        ],
        recommendedOptimizations: [
          'Try sending emails on Tuesday-Thursday for better open rates',
          'Personalize subject lines with company name',
          'Keep email content under 150 words for better response rates'
        ]
      };
    } catch (error) {
      console.error('Error generating email report:', error);
      throw new Error('Failed to generate email report');
    }
  }

  /**
   * Create reminder for manual follow-up
   */
  async createFollowUpReminder(
    campaign: EmailCampaign,
    job: JobOpportunity,
    daysFromNow: number
  ): Promise<Reminder> {
    const reminder: Reminder = {
      id: this.generateId(),
      type: 'follow_up',
      title: `Follow up on ${job.title} application`,
      description: `Check status of application to ${job.company} for ${job.title} position`,
      dueDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
      priority: 'medium',
      completed: false
    };
    
    // In a real implementation, this would save to database
    console.log('Reminder created:', reminder);
    
    return reminder;
  }

  /**
   * Schedule email for later sending
   */
  private async scheduleEmail(
    campaign: EmailCampaign,
    proposal: Proposal,
    job: JobOpportunity,
    user: UserProfile
  ): Promise<void> {
    const delay = campaign.scheduledDate.getTime() - Date.now();
    
    setTimeout(async () => {
      await this.sendEmail(campaign, proposal, job, user);
    }, delay);
  }

  /**
   * Initialize email tracking data
   */
  private initializeTracking(): EmailTracking {
    return {
      opens: 0,
      clicks: 0,
      responses: 0,
      bounces: 0,
      unsubscribes: 0
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default EmailAutomationService;
