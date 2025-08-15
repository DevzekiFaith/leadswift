// Automation Pipeline Types for LeadSwift

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  remote: boolean;
  type: 'full_time' | 'contract' | 'freelance' | 'project';
  budget: string;
  skills: string[];
  description: string;
  requirements: string[];
  contactInfo: ContactInfo;
  urgency: 'low' | 'medium' | 'high';
  sourceUrl: string;
  postedDate: Date;
  deadline?: Date;
  companySize?: string;
  companyWebsite?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  contactPerson?: string;
  linkedinProfile?: string;
  applicationMethod: 'email' | 'website' | 'linkedin' | 'phone';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  skills: string[];
  experience: ExperienceLevel;
  industries: string[];
  portfolio: PortfolioItem[];
  resume: string;
  bio: string;
  hourlyRate?: number;
  availability: 'full_time' | 'part_time' | 'contract' | 'freelance';
  preferredIndustries: string[];
  workPreference: 'remote' | 'onsite' | 'hybrid';
}

export interface ExperienceLevel {
  years: number;
  level: 'entry' | 'mid' | 'senior' | 'expert';
  previousRoles: string[];
  certifications: string[];
}

export interface PortfolioItem {
  title: string;
  description: string;
  url?: string;
  technologies: string[];
  industry: string;
}

export interface JobAnalysis {
  keyRequirements: string[];
  skillMatch: number; // 0-100
  experienceMatch: number; // 0-100
  industryFit: number; // 0-100
  overallScore: number; // 0-100
  missingSkills: string[];
  strengths: string[];
  companyInfo: CompanyData;
  recommendedApproach: string;
}

export interface CompanyData {
  name: string;
  industry: string;
  size: string;
  website?: string;
  recentNews: string[];
  culture: string[];
  values: string[];
  hiringManagerInfo?: HiringManagerInfo;
  techStack?: string[];
  competitors: string[];
}

export interface HiringManagerInfo {
  name?: string;
  title?: string;
  linkedinProfile?: string;
  background: string[];
  interests: string[];
}

export interface Proposal {
  id: string;
  jobOpportunityId: string;
  subject: string;
  content: string;
  tone: 'professional' | 'casual' | 'enthusiastic' | 'technical';
  keyPoints: string[];
  callToAction: string;
  attachments: string[];
  customizations: ProposalCustomization[];
  estimatedReadTime: number;
  confidenceScore: number; // 0-100
}

export interface ProposalCustomization {
  type: 'company_research' | 'skill_highlight' | 'industry_insight' | 'personal_touch';
  content: string;
  reasoning: string;
}

export interface EmailCampaign {
  id: string;
  proposalId: string;
  name: string;
  targetIndustry: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'active' | 'paused' | 'completed';
  scheduledDate: Date;
  scheduled: Date;
  sentDate?: Date;
  lastSent?: Date;
  openedDate?: Date;
  repliedDate?: Date;
  nextSend?: Date;
  totalSent: number;
  opened: number;
  clicked: number;
  replied: number;
  automationEnabled: boolean;
  followUpSequence: FollowUpEmail[];
  trackingData: EmailTracking;
}

export interface FollowUpEmail {
  id: string;
  sequence: number;
  delayDays: number;
  subject: string;
  content: string;
  triggerCondition: 'no_response' | 'opened_no_reply' | 'specific_date';
  status: 'pending' | 'sent' | 'skipped';
}

export interface EmailTracking {
  opens: number;
  clicks: number;
  responses: number;
  bounces: number;
  unsubscribes: number;
  lastActivity?: Date;
  deviceInfo?: string;
  locationInfo?: string;
}

export interface InterviewPrep {
  id: string;
  jobOpportunityId: string;
  companyResearch: CompanyResearch;
  commonQuestions: InterviewQuestion[];
  industrySpecificQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  salaryNegotiation: SalaryData;
  mockInterviewSessions: MockInterviewSession[];
}

export interface CompanyResearch {
  history: string;
  mission: string;
  values: string[];
  recentProjects: string[];
  challenges: string[];
  competitors: string[];
  newsArticles: NewsArticle[];
}

export interface NewsArticle {
  title: string;
  url: string;
  date: Date;
  summary: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'industry' | 'company';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAnswer: string;
  keyPoints: string[];
}

export interface SalaryData {
  industryAverage: number;
  locationAdjustment: number;
  experienceMultiplier: number;
  recommendedRange: {
    min: number;
    max: number;
    target: number;
  };
  negotiationTips: string[];
}

export interface MockInterviewSession {
  id: string;
  date: Date;
  duration: number;
  questions: InterviewQuestion[];
  responses: string[];
  feedback: InterviewFeedback;
  score: number; // 0-100
}

export interface InterviewFeedback {
  strengths: string[];
  improvements: string[];
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  overallRecommendations: string[];
}

export interface ApplicationPipeline {
  id: string;
  userId: string;
  jobOpportunityId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  priority: 'low' | 'medium' | 'high';
  appliedDate: Date;
  proposalSent: boolean;
  responseReceived: boolean;
  interviewScheduled: boolean;
  offerReceived: boolean;
  nextAction: string;
  nextActionDate?: Date;
  notes: string[];
  automationEnabled: boolean;
  stages: PipelineStage[];
  currentStage: string;
  createdDate: Date;
  lastUpdated: Date;
  reminders: Reminder[];
  outcome?: ApplicationOutcome;
}

export type ApplicationStatus = 
  | 'discovered'
  | 'analyzing'
  | 'proposal_generated'
  | 'proposal_sent'
  | 'follow_up_sent'
  | 'response_received'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'application_rejected'
  | 'withdrawn';

export interface PipelineStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startDate?: Date;
  completedDate?: Date;
  notes: string;
  automatedActions: AutomatedAction[];
}

export interface AutomatedAction {
  type: 'send_email' | 'schedule_reminder' | 'update_status' | 'generate_report';
  triggerCondition: string;
  executed: boolean;
  executedDate?: Date;
  result?: string;
}

export interface Reminder {
  id: string;
  type: 'follow_up' | 'interview_prep' | 'deadline' | 'custom' | 'email_campaign';
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedDate?: Date;
  automationGenerated?: boolean;
  relatedId?: string;
  actionRequired?: string;
}

export interface ApplicationOutcome {
  result: 'hired' | 'rejected' | 'withdrawn' | 'expired';
  date: Date;
  feedback?: string;
  salary?: number;
  startDate?: Date;
  contractDetails?: string;
}

export interface AutomationMetrics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  acceptanceRate: number;
  averageTimeToResponse: number;
  averageTimeToOffer: number;
  topPerformingIndustries: string[];
  topPerformingProposalTypes: string[];
  optimizationRecommendations: string[];
}

export interface ScrapingTarget {
  id: string;
  name: string;
  url: string;
  industry: string;
  region: string;
  sourceType: 'job_board' | 'company_direct' | 'government' | 'association' | 'freelance_platform';
  scrapingConfig: ScrapingConfig;
  lastScraped?: Date;
  isActive: boolean;
  successRate: number;
  averageOpportunities: number;
}

export interface ScrapingConfig {
  selectors: {
    jobTitle: string;
    company: string;
    description: string;
    requirements: string;
    contact: string;
    salary: string;
    location: string;
  };
  pagination: {
    nextPageSelector: string;
    maxPages: number;
  };
  rateLimiting: {
    delayMs: number;
    requestsPerMinute: number;
  };
  headers: Record<string, string>;
  useProxy: boolean;
}

// Additional interfaces for real-time automation dashboard
export interface Interview {
  id: string;
  jobOpportunityId: string;
  pipelineId: string;
  type: 'phone' | 'video' | 'in_person' | 'technical';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: Date;
  duration: number; // in minutes
  interviewerName?: string;
  interviewerEmail?: string;
  meetingLink?: string;
  location?: string;
  notes: string;
  preparationCompleted: boolean;
  feedback?: InterviewFeedback;
  nextSteps?: string;
  createdDate: Date;
  lastUpdated: Date;
}
