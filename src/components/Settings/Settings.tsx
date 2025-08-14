'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import {
  FaUser,
  FaBell,
  FaLock,
  FaGlobe,
  FaEye,
  FaDatabase,
  FaDownload,
  FaTrash,
  FaSave,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface UserSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  privacy_mode: boolean;
  data_retention: string;
  language: string;
  timezone: string;
  theme: string;
}

interface UserProfile {
  full_name: string;
  company: string;
  job_title: string;
  phone: string;
  bio: string;
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    company: '',
    job_title: '',
    phone: '',
    bio: ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    privacy_mode: false,
    data_retention: '12_months',
    language: 'en',
    timezone: 'UTC',
    theme: 'dark'
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize Supabase browser client using SSR
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Load user profile and settings from database
        // This would be implemented with actual Supabase queries
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          company: user.user_metadata?.company || '',
          job_title: user.user_metadata?.job_title || '',
          phone: user.user_metadata?.phone || '',
          bio: user.user_metadata?.bio || ''
        });
      }
    };

    getUser();
  }, [supabase]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FaLock },
    { id: 'preferences', label: 'Preferences', icon: FaGlobe },
    { id: 'data', label: 'Data Management', icon: FaDatabase }
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
                      {tab.label}
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
                        value={profile.full_name}
                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
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
                        onChange={(e) => handleProfileChange('company', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Job Title</label>
                      <input
                        type="text"
                        value={profile.job_title}
                        onChange={(e) => handleProfileChange('job_title', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your job title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
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
                        onClick={() => handleSettingChange('email_notifications', !settings.email_notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.email_notifications ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
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
                        onClick={() => handleSettingChange('push_notifications', !settings.push_notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.push_notifications ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            settings.push_notifications ? 'translate-x-6' : 'translate-x-1'
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
                        onClick={() => handleSettingChange('marketing_emails', !settings.marketing_emails)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.marketing_emails ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            settings.marketing_emails ? 'translate-x-6' : 'translate-x-1'
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
                        onClick={() => handleSettingChange('privacy_mode', !settings.privacy_mode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.privacy_mode ? 'bg-white' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-200 ${
                            settings.privacy_mode ? 'translate-x-6' : 'translate-x-1'
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
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
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
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
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
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="dark" className="bg-gray-800">Dark</option>
                        <option value="light" className="bg-gray-800">Light</option>
                        <option value="auto" className="bg-gray-800">Auto</option>
                      </select>
                    </div>
                  </div>
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
                        value={settings.data_retention}
                        onChange={(e) => handleSettingChange('data_retention', e.target.value)}
                        className="w-full max-w-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      >
                        <option value="3_months" className="bg-gray-800">3 Months</option>
                        <option value="6_months" className="bg-gray-800">6 Months</option>
                        <option value="12_months" className="bg-gray-800">12 Months</option>
                        <option value="indefinite" className="bg-gray-800">Indefinite</option>
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
