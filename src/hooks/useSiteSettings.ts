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
      // Try to get user session to determine if admin
      const { data: session } = await supabase.auth.getSession();
      
      let data, error;
      
      if (session?.session?.user) {
        // If authenticated, try to get all settings (admins will see all, users will see public only)
        const result = await supabase
          .from('site_settings')
          .select('setting_key, setting_value');
        data = result.data;
        error = result.error;
      } else {
        // If not authenticated, use the public function for non-sensitive settings
        const result = await supabase.rpc('get_public_site_settings');
        data = result.data;
        error = result.error;
      }

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
      const { error } = await supabase
        .from('site_settings')
        .upsert({ setting_key: key, setting_value: value }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

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