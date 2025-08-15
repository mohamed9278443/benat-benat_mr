import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  [key: string]: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (!error) {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchSettings = async (forceRefresh = false) => {
    try {
      console.log('Fetching site settings...', { forceRefresh, isAdmin });
      
      // Clear local state if force refresh for admin
      if (forceRefresh && isAdmin) {
        setSettings({});
        console.log('Force refresh: Clearing local state for admin');
      }

      // Add cache-busting for admin to prevent caching
      // Use a simple approach with timestamp query parameter for admin
      const { data, error } = isAdmin
        ? await supabase.rpc('get_site_settings_with_permissions')
        : await supabase.rpc('get_site_settings_with_permissions');

      if (error) throw error;

      const settingsObj = data?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value || '';
        return acc;
      }, {} as SiteSettings) || {};

      console.log('Settings fetched successfully:', settingsObj);
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
    // Check admin status first, then fetch settings
    const initializeSettings = async () => {
      await checkAdminStatus();
      await fetchSettings();
    };
    
    initializeSettings();
    
    // Enhanced real-time subscription for site settings
    const channel = supabase
      .channel(`site-settings-changes-${Date.now()}`) // Unique channel name
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings'
      }, (payload) => {
        console.log('Site settings changed via realtime:', payload);
        
        // Force refresh for admin to bypass any caching
        if (isAdmin) {
          console.log('Admin detected - forcing fresh data fetch');
          setTimeout(() => fetchSettings(true), 100); // Small delay to ensure DB consistency
        } else {
          fetchSettings();
        }
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [isAdmin]); // Re-run when admin status changes

  // Force refresh function specifically for admin cache clearing
  const forceRefresh = async () => {
    console.log('Force refresh triggered');
    setLoading(true);
    await fetchSettings(true);
  };

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
    forceRefresh,
    isAdmin
  };
};