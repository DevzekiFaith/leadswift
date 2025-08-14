import {
  ApplicationPipeline,
  ApplicationStatus,
  PipelineStage,
  AutomatedAction,
  Reminder,
  ApplicationOutcome,
  JobOpportunity,
  UserProfile,
  EmailCampaign,
  InterviewPrep,
  AutomationMetrics
} from '../types/automation';

export class PipelineTrackingService {
  private notificationService: any;
  private reminderService: any;

  constructor() {
    // Initialize notification and reminder services
    this.notificationService = null; // Would be injected
    this.reminderService = null; // Would be injected
  }

  /**
   * Create new application pipeline
   */
  async createPipeline(
    userId: string,
    jobOpportunity: JobOpportunity
  ): Promise<ApplicationPipeline> {
    try {
      const pipeline: ApplicationPipeline = {
        id: this.generateId(),
        userId,
        jobOpportunityId: jobOpportunity.id,
        status: 'discovered',
        stages: this.initializePipelineStages(),
        currentStage: 'discovery',
        createdDate: new Date(),
        lastUpdated: new Date(),
        notes: [`Job discovered: ${jobOpportunity.title} at ${jobOpportunity.company}`],
        reminders: []
      };

      // Set initial automated actions
      await this.scheduleAutomatedActions(pipeline, jobOpportunity);

      return pipeline;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw new Error('Failed to create application pipeline');
    }
  }

  /**
   * Update pipeline status and trigger automated actions
   */
  async updatePipelineStatus(
    pipelineId: string,
    newStatus: ApplicationStatus,
    notes?: string
  ): Promise<ApplicationPipeline> {
    try {
      // In a real implementation, this would fetch from database
      const pipeline = await this.getPipeline(pipelineId);
      
      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      const oldStatus = pipeline.status;
      pipeline.status = newStatus;
      pipeline.lastUpdated = new Date();

      if (notes) {
        pipeline.notes.push(`${new Date().toISOString()}: ${notes}`);
      }

      // Update current stage
      pipeline.currentStage = this.getStageFromStatus(newStatus);

      // Mark current stage as completed
      const currentStage = pipeline.stages.find(s => s.name === pipeline.currentStage);
      if (currentStage && currentStage.status !== 'completed') {
        currentStage.status = 'completed';
        currentStage.completedDate = new Date();
      }

      // Trigger status-specific actions
      await this.handleStatusChange(pipeline, oldStatus, newStatus);

      // Execute automated actions
      await this.executeAutomatedActions(pipeline);

      return pipeline;
    } catch (error) {
      console.error('Error updating pipeline status:', error);
      throw new Error('Failed to update pipeline status');
    }
  }

  /**
   * Track email campaign in pipeline
   */
  async trackEmailCampaign(
    pipelineId: string,
    campaign: EmailCampaign
  ): Promise<void> {
    try {
      const pipeline = await this.getPipeline(pipelineId);
      if (!pipeline) return;

      switch (campaign.status) {
        case 'sent':
          await this.updatePipelineStatus(pipelineId, 'proposal_sent', 
            `Proposal email sent to ${campaign.trackingData.opens ? 'and opened by ' : ''}hiring manager`);
          break;
        case 'opened':
          pipeline.notes.push(`${new Date().toISOString()}: Email opened by recipient`);
          break;
        case 'replied':
          await this.updatePipelineStatus(pipelineId, 'response_received', 
            'Received response from hiring manager');
          break;
        case 'bounced':
          pipeline.notes.push(`${new Date().toISOString()}: Email bounced - need to find alternative contact`);
          break;
      }
    } catch (error) {
      console.error('Error tracking email campaign:', error);
    }
  }

  /**
   * Schedule interview and update pipeline
   */
  async scheduleInterview(
    pipelineId: string,
    interviewDate: Date,
    interviewType: string,
    interviewDetails: string
  ): Promise<void> {
    try {
      await this.updatePipelineStatus(pipelineId, 'interview_scheduled', 
        `${interviewType} interview scheduled for ${interviewDate.toLocaleDateString()}: ${interviewDetails}`);

      // Create interview preparation reminder
      const reminder: Reminder = {
        id: this.generateId(),
        type: 'interview_prep',
        title: `Prepare for ${interviewType} interview`,
        description: `Interview preparation for ${interviewDetails}`,
        dueDate: new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        priority: 'high',
        completed: false
      };

      const pipeline = await this.getPipeline(pipelineId);
      if (pipeline) {
        pipeline.reminders.push(reminder);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  }

  /**
   * Complete interview and update pipeline
   */
  async completeInterview(
    pipelineId: string,
    interviewFeedback: string,
    nextSteps?: string
  ): Promise<void> {
    try {
      let notes = `Interview completed. Feedback: ${interviewFeedback}`;
      if (nextSteps) {
        notes += ` Next steps: ${nextSteps}`;
      }

      await this.updatePipelineStatus(pipelineId, 'interview_completed', notes);

      // Create follow-up reminder if no next steps provided
      if (!nextSteps) {
        const reminder: Reminder = {
          id: this.generateId(),
          type: 'follow_up',
          title: 'Follow up on interview',
          description: 'Check status after interview completion',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          priority: 'medium',
          completed: false
        };

        const pipeline = await this.getPipeline(pipelineId);
        if (pipeline) {
          pipeline.reminders.push(reminder);
        }
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  }

  /**
   * Record offer received
   */
  async recordOffer(
    pipelineId: string,
    offerDetails: {
      salary?: number;
      startDate?: Date;
      benefits?: string;
      deadline?: Date;
    }
  ): Promise<void> {
    try {
      const notes = `Offer received! Salary: ${offerDetails.salary ? `$${offerDetails.salary}` : 'TBD'}, Start: ${offerDetails.startDate?.toLocaleDateString() || 'TBD'}`;
      
      await this.updatePipelineStatus(pipelineId, 'offer_received', notes);

      // Create decision reminder if deadline provided
      if (offerDetails.deadline) {
        const reminder: Reminder = {
          id: this.generateId(),
          type: 'deadline',
          title: 'Offer decision deadline',
          description: `Decision needed on offer by ${offerDetails.deadline.toLocaleDateString()}`,
          dueDate: new Date(offerDetails.deadline.getTime() - 24 * 60 * 60 * 1000), // 1 day before deadline
          priority: 'high',
          completed: false
        };

        const pipeline = await this.getPipeline(pipelineId);
        if (pipeline) {
          pipeline.reminders.push(reminder);
        }
      }
    } catch (error) {
      console.error('Error recording offer:', error);
    }
  }

  /**
   * Finalize application outcome
   */
  async finalizeOutcome(
    pipelineId: string,
    outcome: ApplicationOutcome
  ): Promise<void> {
    try {
      const pipeline = await this.getPipeline(pipelineId);
      if (!pipeline) return;

      pipeline.outcome = outcome;
      
      switch (outcome.result) {
        case 'hired':
          await this.updatePipelineStatus(pipelineId, 'offer_accepted', 
            `Offer accepted! Starting ${outcome.startDate?.toLocaleDateString() || 'TBD'}`);
          break;
        case 'rejected':
          await this.updatePipelineStatus(pipelineId, 'application_rejected', 
            `Application rejected. ${outcome.feedback || 'No feedback provided'}`);
          break;
        case 'withdrawn':
          await this.updatePipelineStatus(pipelineId, 'withdrawn', 
            `Application withdrawn. ${outcome.feedback || ''}`);
          break;
        case 'expired':
          await this.updatePipelineStatus(pipelineId, 'application_rejected', 
            'Application expired due to no response');
          break;
      }

      // Generate lessons learned
      await this.generateLessonsLearned(pipeline, outcome);
    } catch (error) {
      console.error('Error finalizing outcome:', error);
    }
  }

  /**
   * Get pipeline analytics and metrics
   */
  async getPipelineAnalytics(userId: string, timeframe?: 'week' | 'month' | 'quarter'): Promise<AutomationMetrics> {
    try {
      // In a real implementation, this would query the database
      const pipelines = await this.getUserPipelines(userId, timeframe);
      
      const totalApplications = pipelines.length;
      const responses = pipelines.filter(p => 
        p.status === 'response_received' || 
        p.status === 'interview_scheduled' || 
        p.status === 'interview_completed' ||
        p.status === 'offer_received' ||
        p.status === 'offer_accepted'
      ).length;
      
      const interviews = pipelines.filter(p => 
        p.status === 'interview_scheduled' || 
        p.status === 'interview_completed' ||
        p.status === 'offer_received' ||
        p.status === 'offer_accepted'
      ).length;
      
      const offers = pipelines.filter(p => 
        p.status === 'offer_received' || 
        p.status === 'offer_accepted'
      ).length;
      
      const accepted = pipelines.filter(p => p.status === 'offer_accepted').length;

      // Calculate average times
      const responseTimes = pipelines
        .filter(p => p.status === 'response_received')
        .map(p => this.calculateDaysBetween(p.createdDate, p.lastUpdated));
      
      const offerTimes = pipelines
        .filter(p => p.status === 'offer_received')
        .map(p => this.calculateDaysBetween(p.createdDate, p.lastUpdated));

      return {
        totalApplications,
        responseRate: totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0,
        interviewRate: totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0,
        offerRate: totalApplications > 0 ? Math.round((offers / totalApplications) * 100) : 0,
        acceptanceRate: offers > 0 ? Math.round((accepted / offers) * 100) : 0,
        averageTimeToResponse: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        averageTimeToOffer: offerTimes.length > 0 ? Math.round(offerTimes.reduce((a, b) => a + b, 0) / offerTimes.length) : 0,
        topPerformingIndustries: this.getTopPerformingIndustries(pipelines),
        topPerformingProposalTypes: this.getTopPerformingProposalTypes(pipelines),
        optimizationRecommendations: this.generateOptimizationRecommendations(pipelines)
      };
    } catch (error) {
      console.error('Error getting pipeline analytics:', error);
      throw new Error('Failed to get pipeline analytics');
    }
  }

  /**
   * Get active reminders for user
   */
  async getActiveReminders(userId: string): Promise<Reminder[]> {
    try {
      const pipelines = await this.getUserPipelines(userId);
      const allReminders: Reminder[] = [];

      for (const pipeline of pipelines) {
        const activeReminders = pipeline.reminders.filter(r => 
          !r.completed && r.dueDate >= new Date()
        );
        allReminders.push(...activeReminders);
      }

      // Sort by due date
      return allReminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private initializePipelineStages(): PipelineStage[] {
    return [
      {
        name: 'discovery',
        status: 'completed',
        startDate: new Date(),
        completedDate: new Date(),
        notes: 'Job opportunity discovered',
        automatedActions: []
      },
      {
        name: 'analysis',
        status: 'pending',
        notes: 'Analyzing job fit and generating proposal',
        automatedActions: [
          {
            type: 'generate_report',
            triggerCondition: 'stage_start',
            executed: false
          }
        ]
      },
      {
        name: 'proposal',
        status: 'pending',
        notes: 'Proposal generation and review',
        automatedActions: [
          {
            type: 'send_email',
            triggerCondition: 'proposal_approved',
            executed: false
          }
        ]
      },
      {
        name: 'outreach',
        status: 'pending',
        notes: 'Email sent and tracking responses',
        automatedActions: [
          {
            type: 'schedule_reminder',
            triggerCondition: 'no_response_3_days',
            executed: false
          }
        ]
      },
      {
        name: 'interview',
        status: 'pending',
        notes: 'Interview preparation and completion',
        automatedActions: [
          {
            type: 'schedule_reminder',
            triggerCondition: 'interview_scheduled',
            executed: false
          }
        ]
      },
      {
        name: 'negotiation',
        status: 'pending',
        notes: 'Offer negotiation and decision',
        automatedActions: []
      },
      {
        name: 'completion',
        status: 'pending',
        notes: 'Final outcome and lessons learned',
        automatedActions: [
          {
            type: 'generate_report',
            triggerCondition: 'outcome_finalized',
            executed: false
          }
        ]
      }
    ];
  }

  private getStageFromStatus(status: ApplicationStatus): string {
    const statusToStage: Record<ApplicationStatus, string> = {
      'discovered': 'discovery',
      'analyzing': 'analysis',
      'proposal_generated': 'proposal',
      'proposal_sent': 'outreach',
      'follow_up_sent': 'outreach',
      'response_received': 'interview',
      'interview_scheduled': 'interview',
      'interview_completed': 'interview',
      'offer_received': 'negotiation',
      'offer_accepted': 'completion',
      'offer_rejected': 'completion',
      'application_rejected': 'completion',
      'withdrawn': 'completion'
    };

    return statusToStage[status] || 'discovery';
  }

  private async scheduleAutomatedActions(
    pipeline: ApplicationPipeline,
    jobOpportunity: JobOpportunity
  ): Promise<void> {
    // Schedule deadline reminder if job has deadline
    if (jobOpportunity.deadline) {
      const reminder: Reminder = {
        id: this.generateId(),
        type: 'deadline',
        title: `Application deadline approaching`,
        description: `Deadline for ${jobOpportunity.title} at ${jobOpportunity.company}`,
        dueDate: new Date(jobOpportunity.deadline.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        priority: 'high',
        completed: false
      };
      
      pipeline.reminders.push(reminder);
    }
  }

  private async handleStatusChange(
    pipeline: ApplicationPipeline,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus
  ): Promise<void> {
    // Send notifications based on status changes
    if (newStatus === 'response_received') {
      // Notify user of response
      console.log(`Response received for ${pipeline.jobOpportunityId}`);
    } else if (newStatus === 'interview_scheduled') {
      // Notify user of interview
      console.log(`Interview scheduled for ${pipeline.jobOpportunityId}`);
    } else if (newStatus === 'offer_received') {
      // Notify user of offer
      console.log(`Offer received for ${pipeline.jobOpportunityId}`);
    }
  }

  private async executeAutomatedActions(pipeline: ApplicationPipeline): Promise<void> {
    const currentStage = pipeline.stages.find(s => s.name === pipeline.currentStage);
    if (!currentStage) return;

    for (const action of currentStage.automatedActions) {
      if (!action.executed && this.shouldExecuteAction(action, pipeline)) {
        await this.executeAction(action, pipeline);
        action.executed = true;
        action.executedDate = new Date();
      }
    }
  }

  private shouldExecuteAction(action: AutomatedAction, pipeline: ApplicationPipeline): boolean {
    switch (action.triggerCondition) {
      case 'stage_start':
        return true;
      case 'no_response_3_days':
        return this.calculateDaysBetween(pipeline.lastUpdated, new Date()) >= 3;
      case 'interview_scheduled':
        return pipeline.status === 'interview_scheduled';
      case 'outcome_finalized':
        return !!pipeline.outcome;
      default:
        return false;
    }
  }

  private async executeAction(action: AutomatedAction, pipeline: ApplicationPipeline): Promise<void> {
    switch (action.type) {
      case 'send_email':
        console.log(`Executing send_email action for pipeline ${pipeline.id}`);
        break;
      case 'schedule_reminder':
        console.log(`Executing schedule_reminder action for pipeline ${pipeline.id}`);
        break;
      case 'generate_report':
        console.log(`Executing generate_report action for pipeline ${pipeline.id}`);
        break;
      case 'update_status':
        console.log(`Executing update_status action for pipeline ${pipeline.id}`);
        break;
    }
  }

  private async generateLessonsLearned(
    pipeline: ApplicationPipeline,
    outcome: ApplicationOutcome
  ): Promise<void> {
    const lessons: string[] = [];

    if (outcome.result === 'hired') {
      lessons.push('Successful application - analyze what worked well');
      lessons.push('Document effective proposal elements for future use');
    } else if (outcome.result === 'rejected') {
      if (outcome.feedback) {
        lessons.push(`Feedback received: ${outcome.feedback}`);
      }
      lessons.push('Analyze proposal and interview performance for improvements');
    }

    pipeline.notes.push(`Lessons learned: ${lessons.join('; ')}`);
  }

  private calculateDaysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getTopPerformingIndustries(pipelines: ApplicationPipeline[]): string[] {
    // Mock implementation - would analyze actual success rates by industry
    return ['Technology', 'Healthcare', 'Finance'];
  }

  private getTopPerformingProposalTypes(pipelines: ApplicationPipeline[]): string[] {
    // Mock implementation - would analyze proposal success rates
    return ['Technical-focused', 'Experience-focused', 'Value-focused'];
  }

  private generateOptimizationRecommendations(pipelines: ApplicationPipeline[]): string[] {
    const recommendations: string[] = [];

    const responseRate = pipelines.filter(p => p.status === 'response_received').length / pipelines.length;
    
    if (responseRate < 0.1) {
      recommendations.push('Consider improving proposal personalization and subject lines');
    }
    
    if (responseRate < 0.05) {
      recommendations.push('Research company contacts more thoroughly before sending');
    }

    recommendations.push('Continue tracking metrics to identify improvement opportunities');

    return recommendations;
  }

  private async getPipeline(pipelineId: string): Promise<ApplicationPipeline | null> {
    // Mock implementation - would fetch from database
    return null;
  }

  private async getUserPipelines(userId: string, timeframe?: string): Promise<ApplicationPipeline[]> {
    // Mock implementation - would fetch from database
    return [];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default PipelineTrackingService;
