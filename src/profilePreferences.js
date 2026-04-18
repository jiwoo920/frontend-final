import { useEffect, useState } from "react";

const PROFILE_STORAGE_KEY = "meme-library-final-profile-preferences";
const PROFILE_UPDATED_EVENT = "meme-library-profile-preferences-updated";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getProfileKey(user) {
  return user?.sub || user?.email || "guest";
}

function readProfileMap() {
  if (!canUseStorage()) return {};

  try {
    const rawValue = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch {
    return {};
  }
}

function writeProfileMap(profileMap) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileMap));
}

export function getDefaultProfilePreferences(user) {
  const email = user?.email || "";
  const fallbackName = email ? email.split("@")[0] : user?.nickname || user?.name || "";

  return {
    nickname: user?.nickname || user?.name || fallbackName,
    email,
    isProfilePrivate: false,
  };
}

export function loadProfilePreferences(user) {
  const defaults = getDefaultProfilePreferences(user);
  const profileMap = readProfileMap();
  const storedProfile = profileMap[getProfileKey(user)] || {};

  return {
    nickname:
      typeof storedProfile.nickname === "string" && storedProfile.nickname.trim()
        ? storedProfile.nickname
        : defaults.nickname,
    email:
      typeof storedProfile.email === "string" && storedProfile.email.trim()
        ? storedProfile.email
        : defaults.email,
    isProfilePrivate:
      typeof storedProfile.isProfilePrivate === "boolean"
        ? storedProfile.isProfilePrivate
        : defaults.isProfilePrivate,
  };
}

export function saveProfilePreferences(user, preferences) {
  const nextProfile = {
    ...loadProfilePreferences(user),
    ...preferences,
  };
  const profileMap = readProfileMap();
  profileMap[getProfileKey(user)] = {
    nickname: nextProfile.nickname.trim(),
    email: nextProfile.email.trim(),
    isProfilePrivate: Boolean(nextProfile.isProfilePrivate),
  };

  writeProfileMap(profileMap);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));

  return loadProfilePreferences(user);
}

export function useProfilePreferences(user) {
  const [profilePreferences, setProfilePreferences] = useState(() =>
    loadProfilePreferences(user)
  );

  useEffect(() => {
    const refreshProfile = () => setProfilePreferences(loadProfilePreferences(user));

    refreshProfile();
    window.addEventListener("storage", refreshProfile);
    window.addEventListener(PROFILE_UPDATED_EVENT, refreshProfile);

    return () => {
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener(PROFILE_UPDATED_EVENT, refreshProfile);
    };
  }, [user?.sub, user?.email, user?.name, user?.nickname]);

  return profilePreferences;
}
