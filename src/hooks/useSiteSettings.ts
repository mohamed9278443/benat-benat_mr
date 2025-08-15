import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  [key: string]: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Use unified function for all users - handles permissions internally and prevents caching
      const { data, error } = await supabase.rpc('get_site_settings_with_permissions');

      if (error) throw error;

      const settingsObj = data?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value || '';
        return acc;
      }, {} as SiteSettings) || {};

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      console.log('Updating setting:', key, '=', value);
      
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ setting_key: key, setting_value: value }, {
          onConflict: 'setting_key'
        })
        .select();

      if (error) {
        console.error('Error updating setting:', error);
        throw error;
      }

      console.log('Setting updated successfully:', data);
      
      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
    
    // Real-time subscription for site settings
    const channel = supabase
      .channel('site-settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings'
      }, (payload) => {
        console.log('Site settings changed:', payload);
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings
  };
};