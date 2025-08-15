import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

// Settings interfaces
export interface UserProfile {
  fullName: string;
  company: string;
  jobTitle: string;
  phone: string;
  bio: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  leadAlerts: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettings {
  privacyMode: boolean;
  allowDataCollection: boolean;
  shareWithPlatforms: boolean;
  cacheLeadData: boolean;
  autoDeleteAfterDays: number;
}

export interface SearchPreferences {
  defaultIndustry: string;
  defaultLocation: string;
  defaultBudgetRange: string;
  defaultUrgency: string;
  preferredPlatforms: string[];
  autoRefresh: boolean;
  searchFrequency: 'real-time' | 'cached' | 'manual';
}

export interface APISettings {
  useRealTimeAPI: boolean;
  rateLimitBuffer: number;
  cacheTimeout: number;
  fallbackToSimulation: boolean;
  maxResultsPerPlatform: number;
  requestTimeout: number;
}

export interface DataManagementSettings {
  retentionPeriod: number;
  autoExport: boolean;
  exportFormat: 'json' | 'csv' | 'xlsx';
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface AppSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  searchPreferences: SearchPreferences;
  apiSettings: APISettings;
  dataManagement: DataManagementSettings;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

// Default settings
const defaultSettings: AppSettings = {
  profile: {
    fullName: '',
    company: '',
    jobTitle: '',
    phone: '',
    bio: ''
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    leadAlerts: true,
    weeklyReports: true
  },
  privacy: {
    privacyMode: false,
    allowDataCollection: true,
    shareWithPlatforms: true,
    cacheLeadData: true,
    autoDeleteAfterDays: 30
  },
  searchPreferences: {
    defaultIndustry: 'All Industries',
    defaultLocation: 'Global',
    defaultBudgetRange: 'Any Budget',
    defaultUrgency: 'Any',
    preferredPlatforms: ['LinkedIn', 'Crunchbase', 'Twitter'],
    autoRefresh: false,
    searchFrequency: 'real-time'
  },
  apiSettings: {
    useRealTimeAPI: true,
    rateLimitBuffer: 10,
    cacheTimeout: 300000, // 5 minutes
    fallbackToSimulation: true,
    maxResultsPerPlatform: 25,
    requestTimeout: 30000 // 30 seconds
  },
  dataManagement: {
    retentionPeriod: 90,
    autoExport: false,
    exportFormat: 'json',
    backupFrequency: 'weekly'
  },
  language: 'en',
  timezone: 'UTC',
  theme: 'dark'
};

// Settings context
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateNotifications: (notifications: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacy: (privacy: Partial<PrivacySettings>) => Promise<void>;
  updateSearchPreferences: (preferences: Partial<SearchPreferences>) => Promise<void>;
  updateAPISettings: (apiSettings: Partial<APISettings>) => Promise<void>;
  updateDataManagement: (dataManagement: Partial<DataManagementSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings provider component
interface SettingsProviderProps {
  children: ReactNode;
  user: User | null;
}

export function SettingsProvider({ children, user }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load settings from Supabase on mount
  useEffect(() => {
    let mounted = true;
    
    if (user && user.id) {
      // Only load if we don't already have settings or if user changed
      if (mounted && (settings === defaultSettings || !settings.profile.fullName)) {
        loadUserSettings();
      }
    } else {
      // Reset to defaults when user signs out
      if (mounted) {
        setSettings(defaultSettings);
        setIsLoading(false);
        setError(null);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only depend on user ID, not the entire user object

  const loadUserSettings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No settings found - this is normal for new users
          console.log('No user settings found, using defaults');
        } else if (fetchError.code === '42P01') {
          // Table doesn't exist
          console.warn('user_settings table does not exist. Using default settings.');
          console.log('To create the table, run this SQL in your Supabase dashboard:');
          console.log(`
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
          `);
        } else if (fetchError.code === 'PGRST301') {
          // 406 Not Acceptable - likely RLS policy issue
          console.warn('RLS policy preventing access to user_settings. Using defaults.');
          console.log('Check your RLS policies in Supabase dashboard');
        } else {
          console.warn('Error fetching user settings:', fetchError.message || fetchError, 'Code:', fetchError.code);
        }
        // Continue with defaults for any error
      }

      if (data && data.settings) {
        try {
          // Merge saved settings with defaults
          const savedSettings = JSON.parse(data.settings);
          setSettings(prevSettings => ({
            ...defaultSettings, // Start with defaults
            ...savedSettings, // Override with saved settings
            profile: {
              ...defaultSettings.profile,
              ...savedSettings.profile,
              fullName: user?.user_metadata?.full_name || savedSettings.profile?.fullName || '',
              company: user?.user_metadata?.company || savedSettings.profile?.company || ''
            }
          }));
        } catch (parseError) {
          console.warn('Failed to parse saved settings, using defaults with user metadata:', parseError);
          // Initialize with user metadata if JSON parsing fails
          setSettings(prevSettings => ({
            ...defaultSettings,
            profile: {
              ...defaultSettings.profile,
              fullName: user?.user_metadata?.full_name || '',
              company: user?.user_metadata?.company || ''
            }
          }));
        }
      } else {
        // Initialize with user metadata
        setSettings(prevSettings => ({
          ...defaultSettings,
          profile: {
            ...defaultSettings.profile,
            fullName: user?.user_metadata?.full_name || '',
            company: user?.user_metadata?.company || ''
          }
        }));
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Use defaults with user metadata as fallback
      setSettings(prevSettings => ({
        ...defaultSettings,
        profile: {
          ...defaultSettings.profile,
          fullName: user?.user_metadata?.full_name || '',
          company: user?.user_metadata?.company || ''
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    if (!user?.id) {
      console.warn('Cannot save settings: no user ID');
      return;
    }

    try {
      const { error: saveError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: JSON.stringify(newSettings),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (saveError) {
        if (saveError.code === '42P01') {
          console.warn('Cannot save settings: user_settings table does not exist');
          setError('Settings table not found. Please check database setup.');
        } else {
          console.error('Error saving settings to database:', saveError);
          setError('Failed to save settings. Changes may be lost on refresh.');
        }
      } else {
        // Clear any previous errors on successful save
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updatedSettings = {
      ...settings,
      profile: { ...settings.profile, ...profile }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updateNotifications = async (notifications: Partial<NotificationSettings>) => {
    const updatedSettings = {
      ...settings,
      notifications: { ...settings.notifications, ...notifications }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updatePrivacy = async (privacy: Partial<PrivacySettings>) => {
    const updatedSettings = {
      ...settings,
      privacy: { ...settings.privacy, ...privacy }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updateSearchPreferences = async (preferences: Partial<SearchPreferences>) => {
    const updatedSettings = {
      ...settings,
      searchPreferences: { ...settings.searchPreferences, ...preferences }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updateAPISettings = async (apiSettings: Partial<APISettings>) => {
    const updatedSettings = {
      ...settings,
      apiSettings: { ...settings.apiSettings, ...apiSettings }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const updateDataManagement = async (dataManagement: Partial<DataManagementSettings>) => {
    const updatedSettings = {
      ...settings,
      dataManagement: { ...settings.dataManagement, ...dataManagement }
    };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const resetToDefaults = async () => {
    setSettings(defaultSettings);
    await saveSettings(defaultSettings);
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateSearchPreferences,
    updateAPISettings,
    updateDataManagement,
    resetToDefaults,
    isLoading,
    error
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
