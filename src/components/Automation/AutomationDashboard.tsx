"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  ApplicationPipeline, 
  EmailCampaign, 
  Interview, 
  Reminder, 
  AutomationMetrics,
  ApplicationStatus 
} from '../../types/automation';
import RealTimeAutomationEngine from '../../services/realTimeAutomationEngine';
import AIProposalGenerator from '../../services/aiProposalGenerator';
import AutomatedEmailService from '../../services/automatedEmailService';
import AutomatedApplicationService from '../../services/automatedApplicationService';
import RealTimeNotificationService from '../../services/realTimeNotificationService';
import { 
  FaRobot, 
  FaChartLine, 
  FaUsers, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaBell, 
  FaCog, 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaSync, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaCheckCircle, 
  FaPaperPlane, 
  FaTrash,
  FaVideo,
  FaFileAlt,
  FaCalendarPlus,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaClock
} from 'react-icons/fa';

interface AutomationDashboardProps {
  user: User;
}

export default function AutomationDashboard({ user }: AutomationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [pipelines, setPipelines] = useState<ApplicationPipeline[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [automationEngine, setAutomationEngine] = useState<RealTimeAutomationEngine | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>({
    automationEngine: 'stopped',
    proposalGenerator: 'inactive',
    emailService: 'inactive',
    applicationService: 'inactive'
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadAutomationData();
    
    // Set up real-time polling
    let interval: NodeJS.Timeout;
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        loadAutomationData(false); // Don't show loading on refresh
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTimeEnabled]);

  const loadAutomationData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Simulate real-time data with dynamic values
      const now = Date.now();
      const mockMetrics: AutomationMetrics = {
        totalApplications: 47 + Math.floor(Math.random() * 5),
        responseRate: 23 + Math.floor(Math.random() * 10) - 5,
        interviewRate: 12 + Math.floor(Math.random() * 6) - 3,
        offerRate: 6 + Math.floor(Math.random() * 4) - 2,
        acceptanceRate: 85 + Math.floor(Math.random() * 10) - 5,
        averageTimeToResponse: 4 + Math.floor(Math.random() * 3) - 1,
        averageTimeToOffer: 18 + Math.floor(Math.random() * 8) - 4,
        topPerformingIndustries: ['Technology', 'Healthcare', 'Finance'],
        topPerformingProposalTypes: ['Technical-focused', 'Experience-focused'],
        optimizationRecommendations: [
          'Increase personalization in healthcare proposals',
          'Follow up faster on technology roles',
          'Research company culture more thoroughly'
        ]
      };

      const mockPipelines: ApplicationPipeline[] = [
        {
          id: '1',
          userId: user.id,
          jobOpportunityId: 'job-1',
          jobTitle: 'Senior React Developer',
          company: 'TechCorp Solutions',
          status: 'interview_scheduled',
          stages: [],
          currentStage: 'technical_interview',
          appliedDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
          createdDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
          nextAction: 'Prepare for technical interview',
          nextActionDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
          priority: 'high',
          automationEnabled: true,
          proposalSent: true,
          responseReceived: true,
          interviewScheduled: true,
          offerReceived: false,
          notes: ['Strong technical match, prepare system design questions'],
          reminders: []
        },
        {
          id: '2',
          userId: user.id,
          jobOpportunityId: 'job-2',
          jobTitle: 'Marketing Manager',
          company: 'Digital Agency Co',
          status: 'proposal_sent',
          stages: [],
          currentStage: 'awaiting_response',
          appliedDate: new Date(now - 3 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(now - Math.random() * 12 * 60 * 60 * 1000),
          createdDate: new Date(now - 3 * 24 * 60 * 60 * 1000),
          nextAction: 'Follow up email',
          nextActionDate: new Date(now + 1 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          automationEnabled: true,
          proposalSent: true,
          responseReceived: false,
          interviewScheduled: false,
          offerReceived: false,
          notes: ['Automated follow-up scheduled'],
          reminders: []
        }
      ];

      const mockEmailCampaigns: EmailCampaign[] = [
        {
          id: '1',
          proposalId: 'proposal-1',
          name: 'Tech Industry Outreach Q1',
          status: 'active',
          totalSent: 45,
          opened: 31,
          clicked: 12,
          replied: 8,
          scheduled: new Date(now - 5 * 24 * 60 * 60 * 1000),
          scheduledDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
          lastSent: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
          nextSend: new Date(now + 2 * 60 * 60 * 1000),
          template: 'tech_proposal_v2',
          targetIndustry: 'Technology',
          automationEnabled: true,
          followUpSequence: [],
          trackingData: {
            opens: 31,
            clicks: 12,
            responses: 8,
            bounces: 2,
            unsubscribes: 0
          }
        },
        {
          id: '2',
          proposalId: 'proposal-2',
          name: 'Healthcare Follow-ups',
          status: 'paused',
          totalSent: 23,
          opened: 18,
          clicked: 7,
          replied: 5,
          scheduled: new Date(now - 10 * 24 * 60 * 60 * 1000),
          scheduledDate: new Date(now - 10 * 24 * 60 * 60 * 1000),
          lastSent: new Date(now - 2 * 24 * 60 * 60 * 1000),
          nextSend: undefined,
          template: 'healthcare_followup',
          targetIndustry: 'Healthcare',
          automationEnabled: false,
          followUpSequence: [],
          trackingData: {
            opens: 18,
            clicks: 7,
            responses: 5,
            bounces: 1,
            unsubscribes: 0
          }
        }
      ];

      const mockInterviews: Interview[] = [
        {
          id: '1',
          jobOpportunityId: 'job-1',
          pipelineId: 'pipeline-1',
          type: 'technical',
          scheduledDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
          duration: 60,
          status: 'scheduled',
          interviewerName: 'Sarah Johnson',
          interviewerEmail: 'sarah.johnson@techcorp.com',
          meetingLink: 'https://meet.google.com/abc-def-ghi',
          preparationCompleted: false,
          notes: 'Focus on React hooks and state management',
          createdDate: new Date(now - 3 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(now - Math.random() * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          jobOpportunityId: 'job-2',
          pipelineId: 'pipeline-2',
          type: 'video',
          scheduledDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
          duration: 45,
          status: 'scheduled',
          interviewerName: 'Mike Chen',
          interviewerEmail: 'mike.chen@digitalagency.com',
          meetingLink: undefined,
          preparationCompleted: false,
          notes: 'Prepare portfolio examples and campaign metrics',
          createdDate: new Date(now - 2 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(now - Math.random() * 12 * 60 * 60 * 1000)
        }
      ];

      const mockReminders: Reminder[] = [
        {
          id: '1',
          type: 'interview_prep',
          title: 'Prepare for Senior Developer interview',
          description: 'Technical interview with TechCorp Solutions in 2 days',
          dueDate: new Date(now + 24 * 60 * 60 * 1000),
          priority: 'high',
          completed: false,
          automationGenerated: true,
          relatedId: '1',
          actionRequired: 'Review technical questions and prepare system design examples'
        },
        {
          id: '2',
          type: 'follow_up',
          title: 'Follow up on Marketing Manager application',
          description: 'No response received after 3 days',
          dueDate: new Date(now + 2 * 60 * 60 * 1000),
          priority: 'medium',
          completed: false,
          automationGenerated: true,
          relatedId: '2',
          actionRequired: 'Send follow-up email with portfolio examples'
        },
        {
          id: '3',
          type: 'email_campaign',
          title: 'Review Healthcare campaign performance',
          description: 'Campaign paused, needs review and optimization',
          dueDate: new Date(now + 4 * 60 * 60 * 1000),
          priority: 'low',
          completed: false,
          automationGenerated: false,
          relatedId: '2',
          actionRequired: 'Analyze campaign metrics and adjust targeting'
        }
      ];

      setMetrics(mockMetrics);
      setPipelines(mockPipelines);
      setEmailCampaigns(mockEmailCampaigns);
      setInterviews(mockInterviews);
      setReminders(mockReminders);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading automation data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const toggleAutomation = () => {
    setAutomationEnabled(!automationEnabled);
    // In real implementation, would update user settings
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const refreshData = () => {
    loadAutomationData(false);
  };

  // Real-time action handlers
  const handlePipelineAction = useCallback(async (pipelineId: string, action: string) => {
    try {
      // Simulate API call
      console.log(`Pipeline ${pipelineId}: ${action}`);
      
      // Update local state optimistically
      setPipelines(prev => prev.map(pipeline => 
        pipeline.id === pipelineId 
          ? { ...pipeline, lastUpdated: new Date() }
          : pipeline
      ));
      
      // Refresh data after action
      setTimeout(() => refreshData(), 1000);
    } catch (error) {
      console.error('Pipeline action error:', error);
    }
  }, []);

  const handleEmailCampaignAction = useCallback(async (campaignId: string, action: string) => {
    try {
      console.log(`Email campaign ${campaignId}: ${action}`);
      
      setEmailCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : campaign.status,
              lastSent: action === 'send' ? new Date() : campaign.lastSent
            }
          : campaign
      ));
      
      setTimeout(() => refreshData(), 1000);
    } catch (error) {
      console.error('Email campaign action error:', error);
    }
  }, []);

  const handleInterviewAction = useCallback(async (interviewId: string, action: string) => {
    try {
      console.log(`Interview ${interviewId}: ${action}`);
      
      setInterviews(prev => prev.map(interview => 
        interview.id === interviewId 
          ? { 
              ...interview, 
              preparationCompleted: action === 'mark_prepared' ? true : interview.preparationCompleted,
              status: action === 'confirm' ? 'scheduled' : interview.status
            }
          : interview
      ));
      
      setTimeout(() => refreshData(), 1000);
    } catch (error) {
      console.error('Interview action error:', error);
    }
  }, []);

  const handleReminderAction = useCallback(async (reminderId: string, action: string) => {
    try {
      console.log(`Reminder ${reminderId}: ${action}`);
      
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, completed: action === 'complete' ? true : reminder.completed }
          : reminder
      ));
      
      setTimeout(() => refreshData(), 1000);
    } catch (error) {
      console.error('Reminder action error:', error);
    }
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaChartLine },
    { id: 'pipelines', name: 'Pipelines', icon: FaUsers },
    { id: 'emails', name: 'Email Campaigns', icon: FaEnvelope },
    { id: 'interviews', name: 'Interviews', icon: FaCalendarAlt },
    { id: 'reminders', name: 'Reminders', icon: FaBell },
    { id: 'settings', name: 'Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading automation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Automation Center</h1>
              <p className="text-gray-400">AI-powered job acquisition automation</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-300">
                    {isRealTimeEnabled ? 'Live Updates' : 'Static Mode'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              title="Refresh Data"
            >
              <FaSync className="text-sm" />
              <span className="text-sm">Refresh</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Real-time</span>
              <button
                onClick={toggleRealTime}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isRealTimeEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRealTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Automation</span>
              <button
                onClick={toggleAutomation}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${automationEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white text-sm font-medium">
                {automationEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-xl border border-gray-700/50">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <IconComponent className="text-sm" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab metrics={metrics} reminders={reminders} />}
      {activeTab === 'pipelines' && <PipelinesTab pipelines={pipelines} onAction={handlePipelineAction} />}
      {activeTab === 'emails' && <EmailCampaignsTab campaigns={emailCampaigns} onAction={handleEmailCampaignAction} />}
      {activeTab === 'interviews' && <InterviewsTab interviews={interviews} onAction={handleInterviewAction} />}
      {activeTab === 'reminders' && <RemindersTab reminders={reminders} onAction={handleReminderAction} />}
      {activeTab === 'settings' && <AutomationSettingsTab />}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ metrics, reminders }: { metrics: AutomationMetrics | null; reminders: Reminder[] }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Applications"
          value={metrics.totalApplications}
          icon={FaUsers}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Response Rate"
          value={`${metrics.responseRate}%`}
          icon={FaEnvelope}
          trend="+3%"
          trendUp={true}
        />
        <MetricCard
          title="Interview Rate"
          value={`${metrics.interviewRate}%`}
          icon={FaCalendarAlt}
          trend="-1%"
          trendUp={false}
        />
        <MetricCard
          title="Offer Rate"
          value={`${metrics.offerRate}%`}
          icon={FaCheckCircle}
          trend="+2%"
          trendUp={true}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Avg. Time to Response</span>
              <span className="text-white font-semibold">{metrics.averageTimeToResponse} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Avg. Time to Offer</span>
              <span className="text-white font-semibold">{metrics.averageTimeToOffer} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Acceptance Rate</span>
              <span className="text-green-400 font-semibold">{metrics.acceptanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Top Performing Industries */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Industries</h3>
          <div className="space-y-3">
            {metrics.topPerformingIndustries.map((industry, index) => (
              <div key={industry} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-white">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Reminders */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Urgent Reminders</h3>
        <div className="space-y-3">
          {reminders.filter(r => r.priority === 'high').map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <FaExclamationTriangle className="text-red-400" />
              <div className="flex-1">
                <p className="text-white font-medium">{reminder.title}</p>
                <p className="text-gray-400 text-sm">{reminder.description}</p>
              </div>
              <span className="text-red-400 text-sm">
                {new Date(reminder.dueDate).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {metrics.optimizationRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <FaRobot className="text-purple-400 mt-1" />
              <p className="text-gray-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend: string; 
  trendUp: boolean; 
}) {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          <Icon className="text-white text-xl" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? <FaArrowUp /> : <FaArrowDown />}
          <span>{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Pipelines Tab Component
function PipelinesTab({ pipelines, onAction }: { pipelines: ApplicationPipeline[]; onAction: (id: string, action: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview_scheduled': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'proposal_sent': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'awaiting_response': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'offer_received': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Application Pipelines</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
            <FaFilter />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <FaPlus />
            Add Pipeline
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(pipeline.priority)}`}></div>
                <div>
                  <h3 className="text-white text-lg font-semibold">{pipeline.jobTitle}</h3>
                  <p className="text-gray-300">{pipeline.company}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Applied: {pipeline.appliedDate.toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Updated: {pipeline.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {pipeline.automationEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                    <FaRobot className="text-green-400 text-xs" />
                    <span className="text-green-300 text-xs">Auto</span>
                  </div>
                )}
                <button
                  onClick={() => onAction(pipeline.id, 'view_details')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEye className="text-white text-sm" />
                </button>
                <button
                  onClick={() => onAction(pipeline.id, 'edit')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEdit className="text-white text-sm" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCheckCircle className={`text-sm ${pipeline.proposalSent ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-gray-300 text-sm">Proposal Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className={`text-sm ${pipeline.responseReceived ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-gray-300 text-sm">Response</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className={`text-sm ${pipeline.interviewScheduled ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-gray-300 text-sm">Interview</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className={`text-sm ${pipeline.offerReceived ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-gray-300 text-sm">Offer</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Next: {pipeline.nextAction}</p>
                <p className="text-gray-400 text-xs">Due: {pipeline.nextActionDate?.toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAction(pipeline.id, 'send_follow_up')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                  <FaEnvelope className="text-xs" />
                  Follow Up
                </button>
                <button
                  onClick={() => onAction(pipeline.id, 'update_status')}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                >
                  <FaSync className="text-xs" />
                  Update
                </button>
              </div>
            </div>
            
            {pipeline.notes && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm">{pipeline.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {pipelines.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No active pipelines</p>
          <p className="text-gray-500 text-sm mt-2">Start by discovering new opportunities or importing existing applications</p>
        </div>
      )}
    </div>
  );
}

// Email Campaigns Tab Component
function EmailCampaignsTab({ campaigns, onAction }: { campaigns: EmailCampaign[]; onAction: (id: string, action: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? Math.round((opened / sent) * 100) : 0;
  };

  const calculateClickRate = (clicked: number, sent: number) => {
    return sent > 0 ? Math.round((clicked / sent) * 100) : 0;
  };

  const calculateReplyRate = (replied: number, sent: number) => {
    return sent > 0 ? Math.round((replied / sent) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Email Campaigns</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
            <FaFilter />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <FaPlus />
            New Campaign
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white text-lg font-semibold">{campaign.name}</h3>
                <p className="text-gray-300">{campaign.targetIndustry} • {campaign.template}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Scheduled: {campaign.scheduled.toLocaleDateString()}
                  </span>
                  {campaign.lastSent && (
                    <span className="text-gray-400 text-sm">
                      Last sent: {campaign.lastSent.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {campaign.automationEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                    <FaRobot className="text-green-400 text-xs" />
                    <span className="text-green-300 text-xs">Auto</span>
                  </div>
                )}
                <button
                  onClick={() => onAction(campaign.id, 'view_details')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEye className="text-white text-sm" />
                </button>
                <button
                  onClick={() => onAction(campaign.id, 'edit')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEdit className="text-white text-sm" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{campaign.totalSent}</div>
                <div className="text-gray-400 text-xs">Sent</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{calculateOpenRate(campaign.opened, campaign.totalSent)}%</div>
                <div className="text-gray-400 text-xs">Open Rate</div>
                <div className="text-gray-500 text-xs">{campaign.opened} opened</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{calculateClickRate(campaign.clicked, campaign.totalSent)}%</div>
                <div className="text-gray-400 text-xs">Click Rate</div>
                <div className="text-gray-500 text-xs">{campaign.clicked} clicked</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{calculateReplyRate(campaign.replied, campaign.totalSent)}%</div>
                <div className="text-gray-400 text-xs">Reply Rate</div>
                <div className="text-gray-500 text-xs">{campaign.replied} replied</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {campaign.nextSend ? (
                  <div>
                    <p className="text-white text-sm font-medium">Next send: {campaign.nextSend.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">Automated sequence active</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm">No scheduled sends</p>
                    <p className="text-gray-500 text-xs">Campaign paused or completed</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {campaign.status === 'active' ? (
                  <button
                    onClick={() => onAction(campaign.id, 'pause')}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                  >
                    <FaPause className="text-xs" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => onAction(campaign.id, 'resume')}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <FaPlay className="text-xs" />
                    Resume
                  </button>
                )}
                <button
                  onClick={() => onAction(campaign.id, 'send_now')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                  <FaPaperPlane className="text-xs" />
                  Send Now
                </button>
                <button
                  onClick={() => onAction(campaign.id, 'stop')}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                >
                  <FaStop className="text-xs" />
                  Stop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {campaigns.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <FaEnvelope className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No email campaigns</p>
          <p className="text-gray-500 text-sm mt-2">Create your first automated email campaign to start reaching out to prospects</p>
        </div>
      )}
    </div>
  );
}

// Interviews Tab Component
function InterviewsTab({ interviews, onAction }: { interviews: Interview[]; onAction: (id: string, action: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rescheduled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FaVideo className="text-blue-400" />;
      case 'phone': return <FaBell className="text-green-400" />;
      case 'in_person': return <FaUsers className="text-purple-400" />;
      case 'technical': return <FaFileAlt className="text-orange-400" />;
      default: return <FaCalendarAlt className="text-gray-400" />;
    }
  };

  const isUpcoming = (date: Date) => {
    return date > new Date();
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Soon';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Interviews</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
            <FaFilter />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <FaCalendarPlus />
            Schedule Interview
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {interviews.map((interview) => (
          <div key={interview.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                  {getTypeIcon(interview.type)}
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold">Interview - {interview.jobOpportunityId}</h3>
                  <p className="text-gray-300">{interview.type.replace('_', ' ').toUpperCase()} • {interview.duration} minutes</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(interview.status)}`}>
                      {interview.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {interview.scheduledDate.toLocaleDateString()} at {interview.scheduledDate.toLocaleTimeString()}
                    </span>
                    {isUpcoming(interview.scheduledDate) && (
                      <span className="text-blue-300 text-sm">
                        In {getTimeUntil(interview.scheduledDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {interview.preparationCompleted && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg">
                    <FaCheck className="text-green-400 text-xs" />
                    <span className="text-green-300 text-xs">Prepared</span>
                  </div>
                )}
                <button
                  onClick={() => onAction(interview.id, 'view_details')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEye className="text-white text-sm" />
                </button>
                <button
                  onClick={() => onAction(interview.id, 'edit')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEdit className="text-white text-sm" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Interviewer</div>
                <div className="text-white text-sm font-medium">
                  {interview.interviewerName || 'TBD'}
                </div>
                {interview.interviewerEmail && (
                  <div className="text-gray-400 text-xs">{interview.interviewerEmail}</div>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Location/Link</div>
                <div className="text-white text-sm font-medium">
                  {interview.meetingLink ? 'Video Call' : interview.location || 'TBD'}
                </div>
                {interview.meetingLink && (
                  <div className="text-blue-300 text-xs truncate">{interview.meetingLink}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {interview.nextSteps ? (
                  <div>
                    <p className="text-white text-sm font-medium">Next: {interview.nextSteps}</p>
                    <p className="text-gray-400 text-xs">Follow-up required</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm">No next steps defined</p>
                    <p className="text-gray-500 text-xs">Awaiting interview completion</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {interview.status === 'scheduled' && (
                  <button
                    onClick={() => onAction(interview.id, 'confirm')}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <FaCheck className="text-xs" />
                    Confirm
                  </button>
                )}
                {!interview.preparationCompleted && isUpcoming(interview.scheduledDate) && (
                  <button
                    onClick={() => onAction(interview.id, 'prepare')}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    <FaFileAlt className="text-xs" />
                    Prepare
                  </button>
                )}
                {interview.status === 'completed' && !interview.feedback && (
                  <button
                    onClick={() => onAction(interview.id, 'add_feedback')}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    <FaEdit className="text-xs" />
                    Add Feedback
                  </button>
                )}
                <button
                  onClick={() => onAction(interview.id, 'reschedule')}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                >
                  <FaCalendarAlt className="text-xs" />
                  Reschedule
                </button>
              </div>
            </div>
            
            {interview.notes && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-gray-300 text-sm">{interview.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {interviews.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No interviews scheduled</p>
          <p className="text-gray-500 text-sm mt-2">Schedule interviews as you progress through your application pipeline</p>
        </div>
      )}
    </div>
  );
}

// Reminders Tab Component
function RemindersTab({ reminders, onAction }: { reminders: Reminder[]; onAction: (id: string, action: string) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interview_prep': return <FaCalendarAlt className="text-blue-400" />;
      case 'follow_up': return <FaEnvelope className="text-green-400" />;
      case 'deadline': return <FaClock className="text-red-400" />;
      case 'email_campaign': return <FaChartLine className="text-purple-400" />;
      default: return <FaBell className="text-gray-400" />;
    }
  };

  const getTimeUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (diff < 0) return 'Overdue';
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Due soon';
  };

  const isOverdue = (dueDate: Date) => {
    return dueDate.getTime() < new Date().getTime();
  };

  const isUrgent = (dueDate: Date) => {
    const diff = dueDate.getTime() - new Date().getTime();
    return diff < 2 * 60 * 60 * 1000; // Less than 2 hours
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    // Sort by completed status first, then by due date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reminders & Tasks</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300">
            <FaFilter />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <FaPlus />
            Add Reminder
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {sortedReminders.map((reminder) => (
          <div 
            key={reminder.id} 
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 ${
              reminder.completed ? 'opacity-60' : ''
            } ${isOverdue(reminder.dueDate) && !reminder.completed ? 'border-red-500/30 bg-red-500/5' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                  {getTypeIcon(reminder.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${reminder.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {reminder.title}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(reminder.priority)}`}></div>
                    {reminder.automationGenerated && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
                        <FaRobot className="text-blue-400 text-xs" />
                        <span className="text-blue-300 text-xs">Auto</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{reminder.description}</p>
                  {reminder.actionRequired && (
                    <p className="text-blue-300 text-sm font-medium">Action: {reminder.actionRequired}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAction(reminder.id, 'view_details')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEye className="text-white text-sm" />
                </button>
                <button
                  onClick={() => onAction(reminder.id, 'edit')}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEdit className="text-white text-sm" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Due Date</p>
                  <p className="text-white text-sm font-medium">
                    {reminder.dueDate.toLocaleDateString()} at {reminder.dueDate.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Time Until Due</p>
                  <p className={`text-sm font-medium ${
                    isOverdue(reminder.dueDate) ? 'text-red-300' : 
                    isUrgent(reminder.dueDate) ? 'text-yellow-300' : 'text-green-300'
                  }`}>
                    {getTimeUntilDue(reminder.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Type</p>
                  <p className="text-white text-sm capitalize">{reminder.type.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!reminder.completed ? (
                  <>
                    <button
                      onClick={() => onAction(reminder.id, 'complete')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                    >
                      <FaCheck className="text-xs" />
                      Complete
                    </button>
                    <button
                      onClick={() => onAction(reminder.id, 'snooze')}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      <FaClock className="text-xs" />
                      Snooze
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onAction(reminder.id, 'reopen')}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    <FaSync className="text-xs" />
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => onAction(reminder.id, 'delete')}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                >
                  <FaTrash className="text-xs" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {reminders.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <FaBell className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No reminders</p>
          <p className="text-gray-500 text-sm mt-2">Create reminders to stay on top of your automation workflow</p>
        </div>
      )}
    </div>
  );
}

// Automation Settings Tab Component
function AutomationSettingsTab() {
  const [settings, setSettings] = useState({
    // Pipeline Automation
    autoProposalGeneration: true,
    autoFollowUp: true,
    followUpDelay: 3, // days
    maxFollowUps: 3,
    
    // Email Campaign Settings
    autoEmailSending: true,
    emailSendDelay: 24, // hours
    maxEmailsPerDay: 10,
    trackEmailOpens: true,
    
    // Interview Automation
    autoInterviewReminders: true,
    reminderTiming: [24, 2], // hours before
    autoCalendarSync: false,
    
    // AI Settings
    aiPersonalization: true,
    aiTonePreference: 'professional',
    aiResearchDepth: 'medium',
    
    // Notification Settings
    realTimeNotifications: true,
    emailNotifications: true,
    desktopNotifications: false,
    
    // Performance Settings
    refreshInterval: 30, // seconds
    batchProcessing: true,
    dataRetention: 90 // days
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // In a real implementation, this would save to backend
    console.log('Saving automation settings:', settings);
    // Show success message or handle errors
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Automation Settings</h2>
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          <FaCheck />
          Save Settings
        </button>
      </div>
      
      {/* Pipeline Automation Settings */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaUsers className="text-blue-400" />
          Pipeline Automation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Auto Proposal Generation</label>
                <p className="text-gray-400 text-sm">Automatically generate proposals for new opportunities</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoProposalGeneration', !settings.autoProposalGeneration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoProposalGeneration ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoProposalGeneration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Auto Follow-up</label>
                <p className="text-gray-400 text-sm">Send automatic follow-up emails</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoFollowUp', !settings.autoFollowUp)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoFollowUp ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoFollowUp ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">Follow-up Delay (days)</label>
              <input
                type="number"
                value={settings.followUpDelay}
                onChange={(e) => handleSettingChange('followUpDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="30"
              />
            </div>
            
            <div>
              <label className="text-white font-medium block mb-2">Max Follow-ups</label>
              <input
                type="number"
                value={settings.maxFollowUps}
                onChange={(e) => handleSettingChange('maxFollowUps', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Campaign Settings */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaEnvelope className="text-green-400" />
          Email Campaign Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Auto Email Sending</label>
                <p className="text-gray-400 text-sm">Automatically send scheduled emails</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoEmailSending', !settings.autoEmailSending)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoEmailSending ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoEmailSending ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Track Email Opens</label>
                <p className="text-gray-400 text-sm">Monitor email open rates and engagement</p>
              </div>
              <button
                onClick={() => handleSettingChange('trackEmailOpens', !settings.trackEmailOpens)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.trackEmailOpens ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.trackEmailOpens ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">Email Send Delay (hours)</label>
              <input
                type="number"
                value={settings.emailSendDelay}
                onChange={(e) => handleSettingChange('emailSendDelay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="168"
              />
            </div>
            
            <div>
              <label className="text-white font-medium block mb-2">Max Emails Per Day</label>
              <input
                type="number"
                value={settings.maxEmailsPerDay}
                onChange={(e) => handleSettingChange('maxEmailsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI & Personalization Settings */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaRobot className="text-purple-400" />
          AI & Personalization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">AI Personalization</label>
                <p className="text-gray-400 text-sm">Use AI to personalize proposals and emails</p>
              </div>
              <button
                onClick={() => handleSettingChange('aiPersonalization', !settings.aiPersonalization)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiPersonalization ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.aiPersonalization ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div>
              <label className="text-white font-medium block mb-2">AI Tone Preference</label>
              <select
                value={settings.aiTonePreference}
                onChange={(e) => handleSettingChange('aiTonePreference', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">Research Depth</label>
              <select
                value={settings.aiResearchDepth}
                onChange={(e) => handleSettingChange('aiResearchDepth', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="basic">Basic</option>
                <option value="medium">Medium</option>
                <option value="deep">Deep</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time & Performance Settings */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaCog className="text-orange-400" />
          Real-time & Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Real-time Notifications</label>
                <p className="text-gray-400 text-sm">Get instant notifications for important events</p>
              </div>
              <button
                onClick={() => handleSettingChange('realTimeNotifications', !settings.realTimeNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.realTimeNotifications ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.realTimeNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Batch Processing</label>
                <p className="text-gray-400 text-sm">Process multiple actions together for efficiency</p>
              </div>
              <button
                onClick={() => handleSettingChange('batchProcessing', !settings.batchProcessing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.batchProcessing ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.batchProcessing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium block mb-2">Refresh Interval (seconds)</label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="10"
                max="300"
              />
            </div>
            
            <div>
              <label className="text-white font-medium block mb-2">Data Retention (days)</label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="30"
                max="365"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors">
            <FaSync />
            Reset to Defaults
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors">
            <FaFileAlt />
            Export Settings
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-colors">
            <FaCog />
            Advanced Config
          </button>
        </div>
      </div>
    </div>
  );
}
