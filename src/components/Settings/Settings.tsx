'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { useSettings, UserProfile } from '../../contexts/SettingsContext';
import {
  FaUser,
  FaBell,
  FaLock,
  FaCog,
  FaGlobe,
  FaDatabase,
  FaDownload,
  FaTrash,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaSave,
  FaRobot,
  FaEnvelope,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

interface SettingsProps {
  user: User;
}

export default function Settings({ user }: SettingsProps) {
  const { settings, updateProfile, updateNotifications, updatePrivacy, updateSearchPreferences, updateAPISettings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Local state for form inputs (synced with context)
  const [profile, setProfile] = useState(settings.profile);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [privacy, setPrivacy] = useState(settings.privacy);
  const [searchPreferences, setSearchPreferences] = useState(settings.searchPreferences);
  const [apiSettings, setApiSettings] = useState(settings.apiSettings);
  const [preferences, setPreferences] = useState({
    language: settings.language,
    timezone: settings.timezone,
    theme: settings.theme
  });
  const [dataManagement, setDataManagement] = useState(settings.dataManagement);
  
  // Automation settings state
  const [automationSettings, setAutomationSettings] = useState({
    enabled: true,
    proposalGeneration: {
      autoGenerate: true,
      includeCompanyResearch: true,
      personalizeGreeting: true,
      includePortfolio: true,
      tone: 'professional' as 'casual' | 'professional' | 'formal',
      maxLength: 500
    },
    emailOutreach: {
      autoSend: false,
      followUpEnabled: true,
      followUpDelay: 3,
      maxFollowUps: 3,
      trackOpens: true,
      trackClicks: true,
      customSignature: 'Best regards,\n[Your Name]'
    },
    interviewPrep: {
      autoGenerate: true,
      includeCompanyResearch: true,
      generateQuestions: true,
      mockInterviewEnabled: true,
      salaryResearchEnabled: true
    },
    analytics: {
      trackApplications: true,
      trackEmails: true,
      trackInterviews: true,
      generateReports: true,
      aiRecommendations: true
    }
  });

  // Sync local state with context when settings change
  useEffect(() => {
    setProfile(settings.profile);
    setNotifications(settings.notifications);
    setPrivacy(settings.privacy);
    setSearchPreferences(settings.searchPreferences);
    setApiSettings(settings.apiSettings);
    setPreferences({
      language: settings.language,
      timezone: settings.timezone,
      theme: settings.theme
    });
    setDataManagement(settings.dataManagement);
  }, [settings]);

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize profile from user prop if available
  useEffect(() => {
    if (user) {
      // Load user profile from user metadata
      setProfile(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName,
        company: user.user_metadata?.company || prev.company,
        jobTitle: user.user_metadata?.job_title || prev.jobTitle,
        phone: user.user_metadata?.phone || prev.phone,
        bio: user.user_metadata?.bio || prev.bio
      }));
    }
  }, [user]);

  // Save profile changes using SettingsContext
  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      await updateProfile(profile);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUser },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy & Security', icon: FaLock },
    { id: 'search', name: 'Search Preferences', icon: FaSearch },
    { id: 'api', name: 'API Settings', icon: FaCog },
    { id: 'automation', name: 'Automation', icon: FaRobot },
    { id: 'preferences', name: 'Preferences', icon: FaCog },
    { id: 'data', name: 'Data Management', icon: FaDatabase }
  ];

  return (
    <div className="min-h-screen bg-black py-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-white font-semibold">Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Account Settings
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Manage your account preferences, privacy settings, and personal information.
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
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                    <p className="text-sm text-gray-400 mb-6">Update your personal information and profile details.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Company</label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({...profile, company: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Job Title</label>
                      <input
                        type="text"
                        value={profile.jobTitle}
                        onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your job title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                        saveStatus === 'saved'
                          ? 'bg-green-600 text-white'
                          : saveStatus === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-black hover:bg-gray-100 active:bg-gray-200'
                      }`}
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <FaCheck className="w-4 h-4" />
                      ) : saveStatus === 'error' ? (
                        <FaTimes className="w-4 h-4" />
                      ) : (
                        <FaSave className="w-4 h-4" />
                      )}
                      {loading ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                    <p className="text-sm text-gray-400 mb-6">Choose how you want to be notified about updates and activities.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <h3 className="text-white font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-400">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => {
                          const newNotifications = {...notifications, emailNotifications: !notifications.emailNotifications};
                          setNotifications(newNotifications);
                          updateNotifications(newNotifications);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.emailNotifications ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <h3 className="text-white font-medium">Push Notifications</h3>
                        <p className="text-sm text-gray-400">Receive push notifications in your browser</p>
                      </div>
                      <button
                        onClick={() => {
                          const newNotifications = {...notifications, pushNotifications: !notifications.pushNotifications};
                          setNotifications(newNotifications);
                          updateNotifications(newNotifications);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.pushNotifications ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <h3 className="text-white font-medium">Marketing Emails</h3>
                        <p className="text-sm text-gray-400">Receive updates about new features and promotions</p>
                      </div>
                      <button
                        onClick={() => {
                          const newNotifications = {...notifications, marketingEmails: !notifications.marketingEmails};
                          setNotifications(newNotifications);
                          updateNotifications(newNotifications);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          notifications.marketingEmails ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Privacy & Security</h2>
                    <p className="text-sm text-gray-400 mb-6">Manage your privacy settings and account security.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <h3 className="text-white font-medium">Privacy Mode</h3>
                        <p className="text-sm text-gray-400">Hide your activity from other users</p>
                      </div>
                      <button
                        onClick={() => {
                          const newPrivacy = {...privacy, privacyMode: !privacy.privacyMode};
                          setPrivacy(newPrivacy);
                          updatePrivacy(newPrivacy);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          privacy.privacyMode ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            privacy.privacyMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-3">Change Password</h3>
                      <p className="text-sm text-gray-400 mb-4">Update your account password for better security</p>
                      <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-3">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Preferences Tab */}
              {activeTab === 'search' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Search Preferences</h2>
                    <p className="text-sm text-gray-400 mb-6">Configure default search filters and behavior for Lead Discovery.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Default Search Filters</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Default Industry</label>
                          <select
                            value={searchPreferences.defaultIndustry}
                            onChange={(e) => {
                              const newPrefs = {...searchPreferences, defaultIndustry: e.target.value};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          >
                            <option value="All Industries">All Industries</option>
                            <option value="SaaS">SaaS</option>
                            <option value="Fintech">Fintech</option>
                            <option value="E-commerce">E-commerce</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="CleanTech">CleanTech</option>
                            <option value="EdTech">EdTech</option>
                          </select>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Default Location</label>
                          <select
                            value={searchPreferences.defaultLocation}
                            onChange={(e) => {
                              const newPrefs = {...searchPreferences, defaultLocation: e.target.value};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          >
                            <option value="Global">Global</option>
                            <option value="North America">North America</option>
                            <option value="Europe">Europe</option>
                            <option value="Asia">Asia</option>
                          </select>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Default Budget Range</label>
                          <select
                            value={searchPreferences.defaultBudgetRange}
                            onChange={(e) => {
                              const newPrefs = {...searchPreferences, defaultBudgetRange: e.target.value};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          >
                            <option value="Any Budget">Any Budget</option>
                            <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                            <option value="$15,000 - $30,000">$15,000 - $30,000</option>
                            <option value="$30,000 - $50,000">$30,000 - $50,000</option>
                            <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                            <option value="$100,000+">$100,000+</option>
                          </select>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Default Urgency</label>
                          <select
                            value={searchPreferences.defaultUrgency}
                            onChange={(e) => {
                              const newPrefs = {...searchPreferences, defaultUrgency: e.target.value};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          >
                            <option value="Any">Any Urgency</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Preferred Platforms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['LinkedIn', 'Upwork', 'AngelList', 'Crunchbase', 'Twitter', 'Behance'].map(platform => (
                          <div key={platform} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                            <span className="text-white text-sm">{platform}</span>
                            <button
                              onClick={() => {
                                const newPlatforms = searchPreferences.preferredPlatforms.includes(platform)
                                  ? searchPreferences.preferredPlatforms.filter(p => p !== platform)
                                  : [...searchPreferences.preferredPlatforms, platform];
                                const newPrefs = {...searchPreferences, preferredPlatforms: newPlatforms};
                                setSearchPreferences(newPrefs);
                                updateSearchPreferences(newPrefs);
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                searchPreferences.preferredPlatforms.includes(platform) ? 'bg-white' : 'bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                                searchPreferences.preferredPlatforms.includes(platform) ? 'translate-x-5' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Search Behavior</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <div className="font-medium text-white">Auto-refresh Results</div>
                            <div className="text-sm text-gray-400">Automatically refresh search results periodically</div>
                          </div>
                          <button
                            onClick={() => {
                              const newPrefs = {...searchPreferences, autoRefresh: !searchPreferences.autoRefresh};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              searchPreferences.autoRefresh ? 'bg-white' : 'bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                              searchPreferences.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Search Frequency</label>
                          <select
                            value={searchPreferences.searchFrequency}
                            onChange={(e) => {
                              const newPrefs = {...searchPreferences, searchFrequency: e.target.value as 'real-time' | 'cached' | 'manual'};
                              setSearchPreferences(newPrefs);
                              updateSearchPreferences(newPrefs);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                          >
                            <option value="real-time">Real-time</option>
                            <option value="cached">Cached (5 minutes)</option>
                            <option value="manual">Manual only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Settings Tab */}
              {activeTab === 'api' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">API Settings</h2>
                    <p className="text-sm text-gray-400 mb-6">Configure real-time API integration and performance settings.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <div className="font-medium text-white">Use Real-Time APIs</div>
                            <div className="text-sm text-gray-400">Enable live data from social platforms</div>
                          </div>
                          <button
                            onClick={() => {
                              const newApiSettings = {...apiSettings, useRealTimeAPI: !apiSettings.useRealTimeAPI};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              apiSettings.useRealTimeAPI ? 'bg-white' : 'bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                              apiSettings.useRealTimeAPI ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <div className="font-medium text-white">Fallback to Simulation</div>
                            <div className="text-sm text-gray-400">Use enhanced simulation when APIs fail</div>
                          </div>
                          <button
                            onClick={() => {
                              const newApiSettings = {...apiSettings, fallbackToSimulation: !apiSettings.fallbackToSimulation};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              apiSettings.fallbackToSimulation ? 'bg-white' : 'bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                              apiSettings.fallbackToSimulation ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Performance Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Cache Timeout (seconds)</label>
                          <input
                            type="number"
                            value={apiSettings.cacheTimeout / 1000}
                            onChange={(e) => {
                              const newApiSettings = {...apiSettings, cacheTimeout: parseInt(e.target.value) * 1000};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            min="30"
                            max="3600"
                          />
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Max Results Per Platform</label>
                          <input
                            type="number"
                            value={apiSettings.maxResultsPerPlatform}
                            onChange={(e) => {
                              const newApiSettings = {...apiSettings, maxResultsPerPlatform: parseInt(e.target.value)};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            min="5"
                            max="100"
                          />
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Rate Limit Buffer (%)</label>
                          <input
                            type="number"
                            value={apiSettings.rateLimitBuffer}
                            onChange={(e) => {
                              const newApiSettings = {...apiSettings, rateLimitBuffer: parseInt(e.target.value)};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            min="0"
                            max="50"
                          />
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <label className="block text-sm font-medium text-white mb-3">Request Timeout (ms)</label>
                          <input
                            type="number"
                            value={apiSettings.requestTimeout}
                            onChange={(e) => {
                              const newApiSettings = {...apiSettings, requestTimeout: parseInt(e.target.value)};
                              setApiSettings(newApiSettings);
                              updateAPISettings(newApiSettings);
                            }}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            min="5000"
                            max="60000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Preferences</h2>
                    <p className="text-sm text-gray-400 mb-6">Customize your experience with language and display settings.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="en" className="bg-gray-800">English</option>
                        <option value="es" className="bg-gray-800">Spanish</option>
                        <option value="fr" className="bg-gray-800">French</option>
                        <option value="de" className="bg-gray-800">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="UTC" className="bg-gray-800">UTC</option>
                        <option value="EST" className="bg-gray-800">Eastern Time</option>
                        <option value="PST" className="bg-gray-800">Pacific Time</option>
                        <option value="GMT" className="bg-gray-800">GMT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Theme</label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({...preferences, theme: e.target.value as 'light' | 'dark' | 'system'})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="dark" className="bg-gray-800">Dark</option>
                        <option value="light" className="bg-gray-800">Light</option>
                        <option value="system" className="bg-gray-800">System</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Automation Tab */}
              {activeTab === 'automation' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">🤖 Automation Settings</h2>
                    <p className="text-sm text-gray-400 mb-6">Configure your job acquisition automation preferences and behavior.</p>
                  </div>

                  {/* Master Automation Toggle */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">Enable Automation</h3>
                        <p className="text-gray-400 text-sm">Master switch for all automation features</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={automationSettings.enabled}
                          onChange={(e) => setAutomationSettings({...automationSettings, enabled: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {automationSettings.enabled && (
                    <>
                      {/* Proposal Generation Settings */}
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                          <FaEnvelope className="text-blue-400" />
                          Proposal Generation
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Auto-generate proposals</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.proposalGeneration.autoGenerate}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  proposalGeneration: {...automationSettings.proposalGeneration, autoGenerate: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Include company research</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.proposalGeneration.includeCompanyResearch}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  proposalGeneration: {...automationSettings.proposalGeneration, includeCompanyResearch: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Personalize greeting</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.proposalGeneration.personalizeGreeting}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  proposalGeneration: {...automationSettings.proposalGeneration, personalizeGreeting: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Proposal Tone</label>
                              <select
                                value={automationSettings.proposalGeneration.tone}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  proposalGeneration: {...automationSettings.proposalGeneration, tone: e.target.value as 'casual' | 'professional' | 'formal'}
                                })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="casual" className="bg-gray-800">Casual</option>
                                <option value="professional" className="bg-gray-800">Professional</option>
                                <option value="formal" className="bg-gray-800">Formal</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Max Length (words)</label>
                              <input
                                type="number"
                                min="200"
                                max="1000"
                                value={automationSettings.proposalGeneration.maxLength}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  proposalGeneration: {...automationSettings.proposalGeneration, maxLength: parseInt(e.target.value)}
                                })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email Outreach Settings */}
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                          <FaEnvelope className="text-green-400" />
                          Email Outreach
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Auto-send emails</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.emailOutreach.autoSend}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  emailOutreach: {...automationSettings.emailOutreach, autoSend: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Enable follow-ups</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.emailOutreach.followUpEnabled}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  emailOutreach: {...automationSettings.emailOutreach, followUpEnabled: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Follow-up Delay (days)</label>
                              <input
                                type="number"
                                min="1"
                                max="14"
                                value={automationSettings.emailOutreach.followUpDelay}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  emailOutreach: {...automationSettings.emailOutreach, followUpDelay: parseInt(e.target.value)}
                                })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Max Follow-ups</label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={automationSettings.emailOutreach.maxFollowUps}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  emailOutreach: {...automationSettings.emailOutreach, maxFollowUps: parseInt(e.target.value)}
                                })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Email Signature</label>
                            <textarea
                              value={automationSettings.emailOutreach.customSignature}
                              onChange={(e) => setAutomationSettings({
                                ...automationSettings,
                                emailOutreach: {...automationSettings.emailOutreach, customSignature: e.target.value}
                              })}
                              rows={3}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Your email signature..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Interview Preparation Settings */}
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                          <FaCalendarAlt className="text-orange-400" />
                          Interview Preparation
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Auto-generate interview prep</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.interviewPrep.autoGenerate}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  interviewPrep: {...automationSettings.interviewPrep, autoGenerate: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Include company research</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.interviewPrep.includeCompanyResearch}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  interviewPrep: {...automationSettings.interviewPrep, includeCompanyResearch: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Generate practice questions</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.interviewPrep.generateQuestions}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  interviewPrep: {...automationSettings.interviewPrep, generateQuestions: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Mock interview sessions</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.interviewPrep.mockInterviewEnabled}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  interviewPrep: {...automationSettings.interviewPrep, mockInterviewEnabled: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Settings */}
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                          <FaChartLine className="text-purple-400" />
                          Analytics & Tracking
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Track application performance</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.analytics.trackApplications}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  analytics: {...automationSettings.analytics, trackApplications: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Email tracking</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.analytics.trackEmails}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  analytics: {...automationSettings.analytics, trackEmails: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">AI recommendations</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={automationSettings.analytics.aiRecommendations}
                                onChange={(e) => setAutomationSettings({
                                  ...automationSettings,
                                  analytics: {...automationSettings.analytics, aiRecommendations: e.target.checked}
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            // Save automation settings logic here
                            console.log('Saving automation settings:', automationSettings);
                            setSaveStatus('saved');
                            setTimeout(() => setSaveStatus('idle'), 2000);
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FaSave className="w-4 h-4" />
                          Save Automation Settings
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Data Management Tab */}
              {activeTab === 'data' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Data Management</h2>
                    <p className="text-sm text-gray-400 mb-6">Control your data retention and export options.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-3">Data Retention</h3>
                      <p className="text-sm text-gray-400 mb-4">Choose how long to keep your data</p>
                      <select
                        value={dataManagement.retentionPeriod}
                        onChange={(e) => setDataManagement({...dataManagement, retentionPeriod: parseInt(e.target.value)})}
                        className="w-full max-w-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="90" className="bg-gray-800">3 Months</option>
                        <option value="180" className="bg-gray-800">6 Months</option>
                        <option value="365" className="bg-gray-800">12 Months</option>
                        <option value="0" className="bg-gray-800">Indefinite</option>
                      </select>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-3">Export Data</h3>
                      <p className="text-sm text-gray-400 mb-4">Download a copy of your data</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                        <FaDownload className="w-4 h-4" />
                        Export Data
                      </button>
                    </div>

                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h3 className="text-red-300 font-medium mb-3">Danger Zone</h3>
                      <p className="text-sm text-red-200 mb-4">Permanently delete your account and all associated data</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200">
                        <FaTrash className="w-4 h-4" />
                        Delete Account
                      </button>
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
