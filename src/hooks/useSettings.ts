import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types';
import { DEFAULT_OWNED_CARD_IDS } from '../data/cards';

const STORAGE_KEY = 'cardmax_settings_v1';

const DEFAULT_SETTINGS: UserSettings = {
  ownedCardIds: DEFAULT_OWNED_CARD_IDS,
  cppOverrides: {},
  rotatingCategories: {},
  lastSynced: null,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: UserSettings = JSON.parse(raw);
        setSettings(parsed);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, []);

  const toggleCard = useCallback(
    (cardId: string) => {
      const ownedCardIds = settings.ownedCardIds.includes(cardId)
        ? settings.ownedCardIds.filter((id) => id !== cardId)
        : [...settings.ownedCardIds, cardId];
      saveSettings({ ...settings, ownedCardIds });
    },
    [settings, saveSettings]
  );

  const setCppOverride = useCallback(
    (cardId: string, value: number) => {
      const cppOverrides = { ...settings.cppOverrides, [cardId]: value };
      saveSettings({ ...settings, cppOverrides });
    },
    [settings, saveSettings]
  );

  const setRotatingCategory = useCallback(
    (cardId: string, category: string | null) => {
      const rotatingCategories = { ...settings.rotatingCategories, [cardId]: category };
      saveSettings({ ...settings, rotatingCategories });
    },
    [settings, saveSettings]
  );

  const markSynced = useCallback(() => {
    saveSettings({ ...settings, lastSynced: new Date().toISOString() });
  }, [settings, saveSettings]);

  const isSyncStale = (): boolean => {
    if (!settings.lastSynced) return true;
    const last = new Date(settings.lastSynced);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  };

  return {
    settings,
    isLoading,
    toggleCard,
    setCppOverride,
    setRotatingCategory,
    markSynced,
    isSyncStale,
    saveSettings,
  };
}
