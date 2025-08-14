'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  FaChartLine,
  FaUsers,
  FaEnvelope,
  FaCalendarCheck,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaMousePointer,
  FaReply,
  FaHandshake,
  FaClock,
  FaCrosshairs,
  FaBullseye,
  FaAward
} from 'react-icons/fa';

interface AnalyticsDashboardProps {
  user: User;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface ApplicationFunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface EmailPerformanceData {
  metric: string;
  value: string;
  benchmark: string;
  status: 'good' | 'average' | 'poor';
}

interface InterviewSuccessData {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
}

export default function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const [metrics] = useState<MetricCard[]>([
    {
      title: 'Total Applications',
      value: '247',
      change: '+12.5%',
      trend: 'up',
      icon: FaUsers,
      color: 'from-white/20 to-white/10'
    },
    {
      title: 'Email Open Rate',
      value: '68.3%',
      change: '+5.2%',
      trend: 'up',
      icon: FaEye,
      color: 'from-white/20 to-white/10'
    },
    {
      title: 'Response Rate',
      value: '24.7%',
      change: '-2.1%',
      trend: 'down',
      icon: FaReply,
      color: 'from-white/20 to-white/10'
    },
    {
      title: 'Interview Rate',
      value: '8.9%',
      change: '+1.3%',
      trend: 'up',
      icon: FaCalendarCheck,
      color: 'from-white/20 to-white/10'
    },
    {
      title: 'Offer Rate',
      value: '3.2%',
      change: '+0.8%',
      trend: 'up',
      icon: FaHandshake,
      color: 'from-white/20 to-white/10'
    },
    {
      title: 'Avg. Response Time',
      value: '2.4 days',
      change: '-0.3 days',
      trend: 'up',
      icon: FaClock,
      color: 'from-white/20 to-white/10'
    }
  ]);

  const [funnelData] = useState<ApplicationFunnelData[]>([
    { stage: 'Applications Sent', count: 247, percentage: 100, color: 'bg-white/30' },
    { stage: 'Emails Opened', count: 169, percentage: 68, color: 'bg-white/25' },
    { stage: 'Responses Received', count: 61, percentage: 25, color: 'bg-white/20' },
    { stage: 'Interviews Scheduled', count: 22, percentage: 9, color: 'bg-white/15' },
    { stage: 'Offers Received', count: 8, percentage: 3, color: 'bg-white/10' }
  ]);

  const [emailPerformance] = useState<EmailPerformanceData[]>([
    { metric: 'Open Rate', value: '68.3%', benchmark: '65%', status: 'good' },
    { metric: 'Click Rate', value: '12.7%', benchmark: '15%', status: 'average' },
    { metric: 'Response Rate', value: '24.7%', benchmark: '20%', status: 'good' },
    { metric: 'Bounce Rate', value: '2.1%', benchmark: '3%', status: 'good' },
    { metric: 'Unsubscribe Rate', value: '0.8%', benchmark: '1%', status: 'good' }
  ]);

  const [interviewSuccess] = useState<InterviewSuccessData[]>([
    { month: 'Jan', applications: 45, interviews: 4, offers: 1 },
    { month: 'Feb', applications: 52, interviews: 6, offers: 2 },
    { month: 'Mar', applications: 48, interviews: 5, offers: 1 },
    { month: 'Apr', applications: 61, interviews: 7, offers: 3 },
    { month: 'May', applications: 41, interviews: 3, offers: 1 }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-white" />;
      case 'down': return <FaArrowDown className="text-gray-400" />;
      default: return <FaChartLine className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'good' | 'average' | 'poor') => {
    switch (status) {
      case 'good': return 'text-white';
      case 'average': return 'text-gray-300';
      case 'poor': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Track your job acquisition performance and optimize your strategy</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={metric.title}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="text-white text-xl" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(metric.trend)}
                    <span className={metric.trend === 'up' ? 'text-white' : metric.trend === 'down' ? 'text-gray-400' : 'text-gray-400'}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{metric.title}</h3>
                <p className="text-white text-2xl font-bold">{metric.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Funnel */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
              <FaCrosshairs className="text-white/60" />
              Application Funnel
            </h3>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{stage.count}</span>
                      <span className="text-gray-400 text-sm">({stage.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${stage.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${stage.percentage}%`, animationDelay: `${index * 200}ms` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Performance */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
              <FaEnvelope className="text-white/60" />
              Email Performance
            </h3>
            <div className="space-y-4">
              {emailPerformance.map((metric, index) => (
                <div key={metric.metric} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300 font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">Benchmark: {metric.benchmark}</span>
                    <span className={`font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interview Success Trends */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
            <FaBullseye className="text-white/60" />
            Interview Success Trends
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {interviewSuccess.map((data, index) => (
              <div key={data.month} className="text-center">
                <div className="text-gray-400 text-sm mb-2">{data.month}</div>
                <div className="space-y-2">
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-gray-300 text-xs">Applications</div>
                    <div className="text-white font-bold">{data.applications}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-gray-300 text-xs">Interviews</div>
                    <div className="text-white font-bold">{data.interviews}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-gray-300 text-xs">Offers</div>
                    <div className="text-white font-bold">{data.offers}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
            <FaAward className="text-white/60" />
            AI-Powered Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-white font-bold mb-2">Strong Performance</div>
              <p className="text-gray-300 text-sm">Your email open rate is 5% above industry benchmark. Keep using personalized subject lines.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-gray-300 font-bold mb-2">Needs Attention</div>
              <p className="text-gray-400 text-sm">Click-through rate is below average. Consider A/B testing your email content and CTAs.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-white font-bold mb-2">Opportunity</div>
              <p className="text-gray-300 text-sm">Your interview-to-offer rate is strong. Focus on getting more interviews to increase offers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
