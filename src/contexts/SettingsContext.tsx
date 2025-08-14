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
    if (user) {
      loadUserSettings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        throw fetchError;
      }

      if (data) {
        // Merge saved settings with defaults
        const savedSettings = JSON.parse(data.settings || '{}');
        setSettings(prevSettings => ({
          ...prevSettings,
          ...savedSettings,
          profile: {
            ...prevSettings.profile,
            ...savedSettings.profile,
            fullName: user?.user_metadata?.full_name || savedSettings.profile?.fullName || '',
            company: user?.user_metadata?.company || savedSettings.profile?.company || ''
          }
        }));
      } else {
        // Initialize with user metadata
        setSettings(prevSettings => ({
          ...prevSettings,
          profile: {
            ...prevSettings.profile,
            fullName: user?.user_metadata?.full_name || '',
            company: user?.user_metadata?.company || ''
          }
        }));
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    if (!user) return;

    try {
      const { error: saveError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: JSON.stringify(newSettings),
          updated_at: new Date().toISOString()
        });

      if (saveError) throw saveError;
    } catch (err) {
      console.error('Error saving settings:', err);
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
