'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaFileAlt,
  FaGlobe,
  FaEye,
  FaDownload,
  FaUpload,
  FaSearch,
  FaClock,
  FaUsers,
  FaLock,
  FaFlag,
  FaChartBar
} from 'react-icons/fa';

interface ComplianceCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  description: string;
  details: string;
  lastChecked: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceReport {
  id: string;
  title: string;
  date: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  issues: number;
}

interface RegulationFramework {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  coverage: number;
  lastUpdate: string;
}

export default function Compliance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize Supabase browser client using SSR
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: '1',
      name: 'GDPR Compliance',
      status: 'passed',
      description: 'General Data Protection Regulation compliance check',
      details: 'All data processing activities comply with GDPR requirements',
      lastChecked: '2 hours ago',
      severity: 'high'
    },
    {
      id: '2',
      name: 'CAN-SPAM Act',
      status: 'warning',
      description: 'Email marketing compliance verification',
      details: 'Some email templates missing unsubscribe links',
      lastChecked: '1 day ago',
      severity: 'medium'
    },
    {
      id: '3',
      name: 'CCPA Compliance',
      status: 'passed',
      description: 'California Consumer Privacy Act compliance',
      details: 'Privacy policy and data handling procedures are compliant',
      lastChecked: '3 hours ago',
      severity: 'high'
    },
    {
      id: '4',
      name: 'LinkedIn Terms of Service',
      status: 'failed',
      description: 'LinkedIn API usage compliance',
      details: 'Exceeding rate limits for data extraction',
      lastChecked: '30 minutes ago',
      severity: 'critical'
    },
    {
      id: '5',
      name: 'Data Retention Policy',
      status: 'passed',
      description: 'Data storage and retention compliance',
      details: 'All data retention policies are properly implemented',
      lastChecked: '1 hour ago',
      severity: 'medium'
    }
  ]);

  const [complianceReports] = useState<ComplianceReport[]>([
    {
      id: '1',
      title: 'Monthly Compliance Report - December 2024',
      date: '2024-12-01',
      status: 'partial',
      score: 87,
      issues: 3
    },
    {
      id: '2',
      title: 'GDPR Audit Report',
      date: '2024-11-15',
      status: 'compliant',
      score: 96,
      issues: 1
    },
    {
      id: '3',
      title: 'Email Marketing Compliance Check',
      date: '2024-11-10',
      status: 'non-compliant',
      score: 72,
      issues: 8
    }
  ]);

  const [regulationFrameworks] = useState<RegulationFramework[]>([
    {
      id: '1',
      name: 'GDPR',
      description: 'General Data Protection Regulation (EU)',
      enabled: true,
      coverage: 95,
      lastUpdate: '2024-12-01'
    },
    {
      id: '2',
      name: 'CCPA',
      description: 'California Consumer Privacy Act (US)',
      enabled: true,
      coverage: 88,
      lastUpdate: '2024-11-28'
    },
    {
      id: '3',
      name: 'CAN-SPAM',
      description: 'Controlling the Assault of Non-Solicited Pornography And Marketing Act',
      enabled: true,
      coverage: 92,
      lastUpdate: '2024-11-25'
    },
    {
      id: '4',
      name: 'PIPEDA',
      description: 'Personal Information Protection and Electronic Documents Act (Canada)',
      enabled: false,
      coverage: 0,
      lastUpdate: 'Never'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <FaCheckCircle className="text-green-400" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-400" />;
      case 'failed':
        return <FaTimes className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10';
      case 'high':
        return 'border-orange-500/30 bg-orange-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'non-compliant':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const handleFullScan = async () => {
    setIsScanning(true);
    setScanningProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'checks', label: 'Compliance Checks', icon: FaShieldAlt },
    { id: 'reports', label: 'Reports', icon: FaFileAlt },
    { id: 'frameworks', label: 'Frameworks', icon: FaGlobe },
    { id: 'settings', label: 'Settings', icon: FaLock }
  ];

  const overallScore = Math.round(complianceChecks.reduce((acc, check) => {
    if (check.status === 'passed') return acc + 100;
    if (check.status === 'warning') return acc + 70;
    if (check.status === 'failed') return acc + 0;
    return acc + 50;
  }, 0) / complianceChecks.length);

  return (
    <div className="min-h-screen bg-black py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-white font-semibold">Compliance Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Compliance Dashboard
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Monitor and maintain compliance with global regulations and industry standards for your outreach campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleFullScan}
                    disabled={isScanning}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSearch className="w-3 h-3" />
                    {isScanning ? 'Scanning...' : 'Full Scan'}
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors duration-200">
                    <FaDownload className="w-3 h-3" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compliance Overview</h2>
                    <p className="text-sm text-gray-400 mb-6">Real-time compliance status and key metrics for your organization.</p>
                  </div>

                  {/* Overall Score */}
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Overall Compliance Score</h3>
                      <span className={`text-2xl font-bold ${overallScore >= 90 ? 'text-green-400' : overallScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {overallScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          overallScore >= 90 ? 'bg-green-500' : overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${overallScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400">
                      {overallScore >= 90 ? 'Excellent compliance status' : 
                       overallScore >= 70 ? 'Good compliance with some areas for improvement' : 
                       'Compliance issues require immediate attention'}
                    </p>
                  </div>

                  {/* Scanning Progress */}
                  {isScanning && (
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <h3 className="text-lg font-bold text-white">Compliance Scan in Progress</h3>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${scanningProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-400">{scanningProgress}% complete</p>
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCheckCircle className="text-green-400 w-5 h-5" />
                        <span className="text-sm font-medium text-gray-300">Passed Checks</span>
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {complianceChecks.filter(c => c.status === 'passed').length}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FaExclamationTriangle className="text-yellow-400 w-5 h-5" />
                        <span className="text-sm font-medium text-gray-300">Warnings</span>
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {complianceChecks.filter(c => c.status === 'warning').length}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FaTimes className="text-red-400 w-5 h-5" />
                        <span className="text-sm font-medium text-gray-300">Failed Checks</span>
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {complianceChecks.filter(c => c.status === 'failed').length}
                      </span>
                    </div>
                  </div>

                  {/* Recent Issues */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Recent Issues</h3>
                    <div className="space-y-3">
                      {complianceChecks.filter(check => check.status === 'failed' || check.status === 'warning').slice(0, 3).map((check) => (
                        <div key={check.id} className={`p-4 rounded-xl border ${getSeverityColor(check.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(check.status)}
                              <div>
                                <h4 className="font-medium text-white">{check.name}</h4>
                                <p className="text-sm text-gray-400 mt-1">{check.details}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{check.lastChecked}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Checks Tab */}
              {activeTab === 'checks' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compliance Checks</h2>
                    <p className="text-sm text-gray-400 mb-6">Detailed view of all compliance checks and their current status.</p>
                  </div>

                  <div className="space-y-4">
                    {complianceChecks.map((check) => (
                      <div key={check.id} className={`p-6 rounded-xl border ${getSeverityColor(check.severity)}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                              {getStatusIcon(check.status)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{check.name}</h3>
                              <p className="text-sm text-gray-400 mt-1">{check.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              check.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                              check.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                              check.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {check.severity.toUpperCase()}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">{check.lastChecked}</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-sm text-gray-300">{check.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compliance Reports</h2>
                    <p className="text-sm text-gray-400 mb-6">Historical compliance reports and audit documentation.</p>
                  </div>

                  <div className="space-y-4">
                    {complianceReports.map((report) => (
                      <div key={report.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{report.title}</h3>
                            <p className="text-sm text-gray-400">{report.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReportStatusColor(report.status)}`}>
                              {report.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                              <FaDownload className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-sm text-gray-400">Compliance Score</span>
                            <div className="text-xl font-bold text-white">{report.score}%</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-sm text-gray-400">Issues Found</span>
                            <div className="text-xl font-bold text-white">{report.issues}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frameworks Tab */}
              {activeTab === 'frameworks' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Regulation Frameworks</h2>
                    <p className="text-sm text-gray-400 mb-6">Manage and configure compliance frameworks for your organization.</p>
                  </div>

                  <div className="space-y-4">
                    {regulationFrameworks.map((framework) => (
                      <div key={framework.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{framework.name}</h3>
                            <p className="text-sm text-gray-400">{framework.description}</p>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                              framework.enabled ? 'bg-white' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                                framework.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-sm text-gray-400">Coverage</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-white h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${framework.coverage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-white">{framework.coverage}%</span>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-sm text-gray-400">Last Updated</span>
                            <div className="text-sm font-medium text-white">{framework.lastUpdate}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Compliance Settings</h2>
                    <p className="text-sm text-gray-400 mb-6">Configure compliance monitoring and notification preferences.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Monitoring Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Automatic Scanning</h4>
                            <p className="text-sm text-gray-400">Run compliance checks automatically</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white transition-colors duration-200">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-black translate-x-6 transition-transform duration-200" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Real-time Alerts</h4>
                            <p className="text-sm text-gray-400">Get notified of compliance issues immediately</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white transition-colors duration-200">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-black translate-x-6 transition-transform duration-200" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Scan Frequency</label>
                          <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent">
                            <option value="daily" className="bg-gray-800">Daily</option>
                            <option value="weekly" className="bg-gray-800">Weekly</option>
                            <option value="monthly" className="bg-gray-800">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Alert Threshold</label>
                          <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent">
                            <option value="critical" className="bg-gray-800">Critical Only</option>
                            <option value="high" className="bg-gray-800">High & Critical</option>
                            <option value="all" className="bg-gray-800">All Issues</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
