"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  FaSearch, 
  FaRobot, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaHandshake,
  FaCheckCircle,
  FaSpinner,
  FaEdit,
  FaEye,
  FaPlay,
  FaPause,
  FaForward,
  FaChartLine,
  FaExclamationTriangle,
  FaLightbulb,
  FaClock,
  FaUser,
  FaBuilding
} from 'react-icons/fa';
import { JobOpportunity, UserProfile, Proposal, EmailCampaign, ApplicationPipeline } from '../../types/automation';

interface JobApplicationWorkflowProps {
  user: User;
  jobOpportunity?: JobOpportunity;
  onComplete?: (pipeline: ApplicationPipeline) => void;
}

type WorkflowStep = 'discovery' | 'analysis' | 'proposal' | 'review' | 'send' | 'track' | 'complete';

export default function JobApplicationWorkflow({ user, jobOpportunity, onComplete }: JobApplicationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('discovery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(jobOpportunity || null);
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);
  const [generatedProposal, setGeneratedProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'discovery', name: 'Job Discovery', icon: FaSearch, description: 'Find and select job opportunities' },
    { id: 'analysis', name: 'AI Analysis', icon: FaRobot, description: 'Analyze job fit and requirements' },
    { id: 'proposal', name: 'Generate Proposal', icon: FaEdit, description: 'Create personalized proposal' },
    { id: 'review', name: 'Review & Edit', icon: FaEye, description: 'Review and customize proposal' },
    { id: 'send', name: 'Send Application', icon: FaEnvelope, description: 'Send email with tracking' },
    { id: 'track', name: 'Track Progress', icon: FaChartLine, description: 'Monitor application status' },
    { id: 'complete', name: 'Complete', icon: FaCheckCircle, description: 'Application submitted successfully' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);

  const handleStepAction = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      switch (currentStep) {
        case 'discovery':
          if (selectedJob) setCurrentStep('analysis');
          break;
        case 'analysis':
          setJobAnalysis({ overallScore: 85, skillMatch: 90, experienceMatch: 80, strengths: ['React', 'Node.js'], recommendedApproach: 'Technical-focused approach' });
          setCurrentStep('proposal');
          break;
        case 'proposal':
          setGeneratedProposal({
            id: '1',
            jobOpportunityId: selectedJob?.id || '',
            subject: 'Application for Senior Developer Position',
            content: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Developer position...',
            tone: 'professional',
            keyPoints: ['5+ years experience', 'React expertise', 'Team leadership'],
            callToAction: 'I would love to discuss how I can contribute to your team.',
            attachments: ['resume.pdf'],
            customizations: [],
            estimatedReadTime: 3,
            confidenceScore: 85
          });
          setCurrentStep('review');
          break;
        case 'review':
          setCurrentStep('send');
          break;
        case 'send':
          setCurrentStep('track');
          break;
        case 'track':
          setCurrentStep('complete');
          break;
      }
    } catch (err) {
      setError('An error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const mockJobs: JobOpportunity[] = [
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      industry: 'Technology',
      location: 'Remote',
      remote: true,
      type: 'full_time',
      budget: '$80,000 - $120,000',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      description: 'We are looking for a senior full stack developer to join our growing team...',
      requirements: ['5+ years experience', 'React expertise', 'Node.js proficiency'],
      contactInfo: { email: 'hiring@techcorp.com', applicationMethod: 'email' },
      urgency: 'medium',
      sourceUrl: 'https://techcorp.com/careers',
      postedDate: new Date(),
      companySize: 'Medium',
      companyWebsite: 'https://techcorp.com'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 'discovery':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Job Opportunity</h2>
              <p className="text-gray-400">Choose a job opportunity to start the automated application process</p>
            </div>
            <div className="space-y-4">
              {mockJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedJob?.id === job.id ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-gray-400 mb-3">
                        <span>{job.company}</span>
                        <span>{job.location}</span>
                        <span>{job.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{job.budget}</p>
                      <p className="text-gray-400 text-sm">{job.industry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">AI Job Analysis</h2>
              <p className="text-gray-400">Analyzing your fit for {selectedJob?.title} at {selectedJob?.company}</p>
            </div>
            {isProcessing ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
                <p className="text-white text-lg">Analyzing job requirements and your profile...</p>
              </div>
            ) : jobAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2">Overall Match Score</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-600 rounded-full h-3">
                      <div className="bg-gradient-primary h-3 rounded-full" style={{ width: `${jobAnalysis.overallScore}%` }} />
                    </div>
                    <span className="text-white font-bold">{jobAnalysis.overallScore}%</span>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2">Your Strengths</h3>
                  <div className="space-y-2">
                    {jobAnalysis.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-400" />
                        <span className="text-gray-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaLightbulb className="text-yellow-500 text-4xl mx-auto mb-4" />
                <p className="text-white">Ready to analyze this opportunity</p>
              </div>
            )}
          </div>
        );

      case 'proposal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">AI Proposal Generation</h2>
              <p className="text-gray-400">Creating a personalized proposal for your application</p>
            </div>
            {isProcessing ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
                <p className="text-white text-lg">Generating personalized proposal...</p>
              </div>
            ) : generatedProposal ? (
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Proposal Preview</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-300 font-medium mb-2">Subject: {generatedProposal.subject}</p>
                  <div className="text-gray-400 text-sm whitespace-pre-line max-h-40 overflow-y-auto">
                    {generatedProposal.content.substring(0, 300)}...
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaEdit className="text-purple-500 text-4xl mx-auto mb-4" />
                <p className="text-white">Ready to generate your proposal</p>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Review & Customize</h2>
              <p className="text-gray-400">Review your proposal and make any final adjustments</p>
            </div>
            {generatedProposal && (
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Email Content</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                    {generatedProposal.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );

      case 'send':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Send Application</h2>
              <p className="text-gray-400">Ready to send your application to {selectedJob?.company}</p>
            </div>
            {isProcessing ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
                <p className="text-white text-lg">Sending your application...</p>
              </div>
            ) : (
              <div className="bg-gray-700/30 rounded-xl p-6 text-center">
                <FaEnvelope className="text-purple-500 text-4xl mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">Ready to Send</h3>
                <p className="text-gray-400">Your personalized application will be sent with tracking enabled</p>
              </div>
            )}
          </div>
        );

      case 'track':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Track Progress</h2>
              <p className="text-gray-400">Monitor your application status and responses</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <FaChartLine className="text-green-500 text-4xl mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Application Sent Successfully!</h3>
              <p className="text-gray-400">Email tracking and follow-up sequences are now active</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Application Complete</h2>
              <p className="text-gray-400">Your automated job application has been successfully submitted</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Success!</h3>
              <p className="text-gray-400">We'll notify you of any responses or follow-up actions needed</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Job Application Workflow</h1>
        <p className="text-gray-400">AI-powered automated job application process</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < getCurrentStepIndex();

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                    isActive ? 'bg-gradient-primary text-white shadow-lg shadow-purple-500/25' : 
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {isCompleted ? <FaCheckCircle /> : isProcessing && isActive ? <FaSpinner className="animate-spin" /> : <IconComponent />}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.name}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const currentIndex = getCurrentStepIndex();
            if (currentIndex > 0) {
              setCurrentStep(steps[currentIndex - 1].id as WorkflowStep);
            }
          }}
          disabled={getCurrentStepIndex() === 0 || isProcessing}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Previous
        </button>

        <button
          onClick={handleStepAction}
          disabled={isProcessing || currentStep === 'complete'}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : currentStep === 'complete' ? (
            <>
              <FaCheckCircle />
              Completed
            </>
          ) : (
            <>
              <FaPlay />
              {currentStep === 'send' ? 'Send Application' : 'Continue'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
