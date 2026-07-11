"use client";

import { SoundProvider, useSound } from "@web-kits/audio/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { uiClick } from "@/lib/sounds";

const STORAGE_KEY = "blank-sound";

const INTERACTIVE =
  'button, a, input, select, textarea, summary, [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="slider"], [role="option"], [role="button"]';

/**
 * One delegated listener instead of wiring every control: any click that lands
 * on an interactive element (studio toggles, color pickers, preset tabs,
 * sliders, links) plays the click sound. Capture phase so components that stop
 * propagation still sound.
 */
function GlobalClickSounds() {
  const playClick = useSound(uiClick);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE)) {
        playClick();
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [playClick]);

  return null;
}

const SoundSettingContext = createContext<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}>({ enabled: true, setEnabled: () => {} });

export function useSoundSetting() {
  return useContext(SoundSettingContext);
}

/**
 * Owns the sound preference (persisted in localStorage) and syncs it into
 * @web-kits/audio's SoundProvider, which also auto-mutes under
 * prefers-reduced-motion.
 */
export function SiteSoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    setEnabledState(localStorage.getItem(STORAGE_KEY) !== "off");
  }, []);

  function setEnabled(next: boolean) {
    setEnabledState(next);
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  }

  return (
    <SoundSettingContext.Provider value={{ enabled, setEnabled }}>
      <SoundProvider enabled={enabled} volume={1} onEnabledChange={setEnabled}>
        <GlobalClickSounds />
        {children}
      </SoundProvider>
    </SoundSettingContext.Provider>
  );
}
