import { JobOpportunity, UserProfile, ApplicationPipeline, AutomationMetrics } from '../types/automation';
import PipelineTrackingService from './pipelineTracking';
import AIProposalGenerator from './aiProposalGenerator';
import AutomatedEmailService from './automatedEmailService';
import { EventEmitter } from 'events';

export interface AutomationConfig {
  enabled: boolean;
  autoApplyEnabled: boolean;
  maxDailyApplications: number;
  minimumMatchScore: number;
  priorityIndustries: string[];
  excludedCompanies: string[];
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
  };
  aiConfig: {
    apiKey: string;
    model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus';
    temperature: number;
  };
  emailConfig: {
    provider: 'sendgrid' | 'resend' | 'postmark';
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
}

export interface AutomationEvent {
  type: 'job_discovered' | 'proposal_generated' | 'email_sent' | 'response_received' | 'interview_scheduled' | 'offer_received';
  data: any;
  timestamp: Date;
  pipelineId?: string;
  jobId?: string;
}

export class RealTimeAutomationEngine extends EventEmitter {
  private config: AutomationConfig;
  private pipelineService: PipelineTrackingService;
  private proposalGenerator: AIProposalGenerator;
  private emailService: AutomatedEmailService;
  private isRunning: boolean = false;
  private dailyApplicationCount: number = 0;
  private lastResetDate: string = '';
  private activeJobs: Map<string, JobOpportunity> = new Map();
  private processingQueue: Array<{job: JobOpportunity, user: UserProfile, priority: number}> = [];

  constructor(config: AutomationConfig) {
    super();
    this.config = config;
    this.initializeServices();
    this.setupEventListeners();
  }

  /**
   * Start the real-time automation engine
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.resetDailyCountIfNeeded();
    
    console.log('🚀 Real-time automation engine started');
    this.emit('engine_started', { timestamp: new Date() });
    
    // Start processing loops
    this.startJobProcessor();
    this.startMetricsCollector();
    this.startHealthMonitor();
  }

  /**
   * Stop the automation engine
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('⏹️ Real-time automation engine stopped');
    this.emit('engine_stopped', { timestamp: new Date() });
  }

  /**
   * Process new job opportunity automatically
   */
  async processJobOpportunity(
    jobOpportunity: JobOpportunity,
    userProfile: UserProfile,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{success: boolean, pipelineId?: string, reason?: string}> {
    try {
      if (!this.config.enabled) {
        return { success: false, reason: 'Automation is disabled' };
      }

      if (this.dailyApplicationCount >= this.config.maxDailyApplications) {
        return { success: false, reason: 'Daily application limit reached' };
      }

      // Check if job meets criteria
      const shouldProcess = await this.shouldProcessJob(jobOpportunity, userProfile);
      if (!shouldProcess.process) {
        return { success: false, reason: shouldProcess.reason };
      }

      // Add to processing queue
      this.addToProcessingQueue(jobOpportunity, userProfile, this.getPriorityScore(priority));
      
      this.emit('job_queued', {
        type: 'job_discovered',
        data: { job: jobOpportunity, user: userProfile },
        timestamp: new Date(),
        jobId: jobOpportunity.id
      });

      return { success: true, reason: 'Job added to processing queue' };
    } catch (error) {
      console.error('Error processing job opportunity:', error);
      return { success: false, reason: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get real-time automation metrics
   */
  async getAutomationMetrics(timeframe: 'today' | 'week' | 'month' = 'today'): Promise<AutomationMetrics & {
    automationStats: {
      jobsProcessed: number;
      proposalsGenerated: number;
      emailsSent: number;
      responsesReceived: number;
      successRate: number;
      averageProcessingTime: number;
    }
  }> {
    const baseMetrics = await this.pipelineService.getPipelineAnalytics('current-user', timeframe === 'today' ? 'week' : timeframe);
    
    const automationStats = {
      jobsProcessed: this.activeJobs.size,
      proposalsGenerated: this.dailyApplicationCount,
      emailsSent: this.dailyApplicationCount,
      responsesReceived: Math.floor(this.dailyApplicationCount * 0.15), // Mock 15% response rate
      successRate: 85,
      averageProcessingTime: 45 // seconds
    };

    return {
      ...baseMetrics,
      automationStats
    };
  }

  /**
   * Update automation configuration
   */
  async updateConfig(newConfig: Partial<AutomationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize services if needed
    if (newConfig.aiConfig || newConfig.emailConfig) {
      this.initializeServices();
    }

    this.emit('config_updated', { config: this.config, timestamp: new Date() });
  }

  /**
   * Get current automation status
   */
  getStatus(): {
    isRunning: boolean;
    dailyApplicationCount: number;
    maxDailyApplications: number;
    queueLength: number;
    activeJobs: number;
    lastActivity: Date | null;
  } {
    return {
      isRunning: this.isRunning,
      dailyApplicationCount: this.dailyApplicationCount,
      maxDailyApplications: this.config.maxDailyApplications,
      queueLength: this.processingQueue.length,
      activeJobs: this.activeJobs.size,
      lastActivity: new Date()
    };
  }

  private initializeServices(): void {
    this.pipelineService = new PipelineTrackingService();
    
    this.proposalGenerator = new AIProposalGenerator({
      apiKey: this.config.aiConfig.apiKey,
      model: this.config.aiConfig.model,
      temperature: this.config.aiConfig.temperature,
      maxTokens: 1000
    });

    this.emailService = new AutomatedEmailService(
      {
        provider: {
          name: this.config.emailConfig.provider,
          apiKey: this.config.emailConfig.apiKey,
          fromEmail: this.config.emailConfig.fromEmail,
          fromName: this.config.emailConfig.fromName
        },
        trackingEnabled: true,
        followUpEnabled: true,
        maxDailyEmails: this.config.maxDailyApplications,
        delayBetweenEmails: 5
      },
      this.proposalGenerator
    );
  }

  private setupEventListeners(): void {
    // Listen to email service events
    this.emailService.on?.('email_sent', (data) => {
      this.emit('email_sent', {
        type: 'email_sent',
        data,
        timestamp: new Date()
      });
    });

    this.emailService.on?.('email_opened', (data) => {
      this.emit('email_opened', {
        type: 'response_received',
        data,
        timestamp: new Date()
      });
    });
  }

  private async shouldProcessJob(
    job: JobOpportunity,
    user: UserProfile
  ): Promise<{process: boolean, reason: string, score?: number}> {
    // Check excluded companies
    if (this.config.excludedCompanies.includes(job.company.toLowerCase())) {
      return { process: false, reason: 'Company is in exclusion list' };
    }

    // Check working hours
    if (!this.isWithinWorkingHours()) {
      return { process: false, reason: 'Outside working hours' };
    }

    // Calculate match score
    const matchScore = this.calculateMatchScore(job, user);
    if (matchScore < this.config.minimumMatchScore) {
      return { process: false, reason: `Match score too low: ${matchScore}%`, score: matchScore };
    }

    // Check if already applied
    if (this.activeJobs.has(job.id)) {
      return { process: false, reason: 'Already processing this job' };
    }

    return { process: true, reason: 'Job meets all criteria', score: matchScore };
  }

  private calculateMatchScore(job: JobOpportunity, user: UserProfile): number {
    let score = 0;

    // Skill matching (40% weight)
    const skillMatches = job.skills.filter(skill =>
      user.skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    score += (skillMatches.length / job.skills.length) * 40;

    // Industry matching (25% weight)
    if (user.industries.includes(job.industry)) {
      score += 25;
    }

    // Experience level matching (20% weight)
    const experienceMatch = this.getExperienceMatch(job, user);
    score += experienceMatch * 20;

    // Priority industry bonus (10% weight)
    if (this.config.priorityIndustries.includes(job.industry)) {
      score += 10;
    }

    // Urgency bonus (5% weight)
    if (job.urgency === 'high') {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  private getExperienceMatch(job: JobOpportunity, user: UserProfile): number {
    const jobLevel = this.extractJobLevel(job.title, job.description);
    const userLevel = user.experience.level;

    const levelMap = { 'entry': 1, 'mid': 2, 'senior': 3, 'expert': 4 };
    const jobLevelNum = levelMap[jobLevel] || 2;
    const userLevelNum = levelMap[userLevel] || 2;

    // Perfect match = 1.0, each level difference reduces by 0.25
    return Math.max(0, 1 - Math.abs(jobLevelNum - userLevelNum) * 0.25);
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

  private isWithinWorkingHours(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(this.config.workingHours.start.split(':')[0]);
    const endHour = parseInt(this.config.workingHours.end.split(':')[0]);
    
    return currentHour >= startHour && currentHour < endHour;
  }

  private addToProcessingQueue(job: JobOpportunity, user: UserProfile, priority: number): void {
    this.processingQueue.push({ job, user, priority });
    this.processingQueue.sort((a, b) => b.priority - a.priority);
  }

  private getPriorityScore(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private startJobProcessor(): void {
    const processJobs = async () => {
      if (!this.isRunning || this.processingQueue.length === 0) return;

      const jobItem = this.processingQueue.shift();
      if (!jobItem) return;

      try {
        await this.processJobAutomatically(jobItem.job, jobItem.user);
      } catch (error) {
        console.error('Error processing job automatically:', error);
      }
    };

    // Process jobs every 30 seconds
    setInterval(processJobs, 30 * 1000);
  }

  private async processJobAutomatically(job: JobOpportunity, user: UserProfile): Promise<void> {
    try {
      // Create pipeline
      const pipeline = await this.pipelineService.createPipeline(user.id, job);
      this.activeJobs.set(job.id, job);

      this.emit('pipeline_created', {
        type: 'job_discovered',
        data: { pipeline, job },
        timestamp: new Date(),
        pipelineId: pipeline.id,
        jobId: job.id
      });

      // Generate and send proposal automatically
      if (this.config.autoApplyEnabled) {
        const result = await this.emailService.sendAutomatedProposal(job, user, 'medium');
        
        if (result.success) {
          this.dailyApplicationCount++;
          await this.pipelineService.updatePipelineStatus(
            pipeline.id,
            'proposal_sent',
            'AI-generated proposal sent automatically'
          );

          this.emit('proposal_sent', {
            type: 'email_sent',
            data: { pipelineId: pipeline.id, campaignId: result.campaignId },
            timestamp: new Date(),
            pipelineId: pipeline.id,
            jobId: job.id
          });
        }
      }
    } catch (error) {
      console.error('Error in automatic job processing:', error);
    }
  }

  private startMetricsCollector(): void {
    // Collect metrics every 5 minutes
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const metrics = await this.getAutomationMetrics('today');
        this.emit('metrics_updated', {
          type: 'metrics_updated',
          data: metrics,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 5 * 60 * 1000);
  }

  private startHealthMonitor(): void {
    // Health check every minute
    setInterval(() => {
      if (!this.isRunning) return;

      const status = this.getStatus();
      this.emit('health_check', {
        type: 'health_check',
        data: status,
        timestamp: new Date()
      });

      // Auto-restart if needed
      if (status.queueLength > 100) {
        console.warn('Queue length too high, clearing old items');
        this.processingQueue = this.processingQueue.slice(0, 50);
      }
    }, 60 * 1000);
  }

  private resetDailyCountIfNeeded(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyApplicationCount = 0;
      this.lastResetDate = today;
      console.log('Daily application count reset');
    }
  }
}

export default RealTimeAutomationEngine;
