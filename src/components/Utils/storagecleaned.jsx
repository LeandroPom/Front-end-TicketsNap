import { useEffect } from "react";

const LAST_CLEAN_KEY = "lastCleanTimestamp";
const CLEAN_INTERVAL = 24 * 60 * 60 * 1000; // 24h en ms

export function useStorageAutoClear() {
  useEffect(() => {
    // Solo ejecutar si estamos en la home
    if (window.location.pathname !== "/") return;

    const now = Date.now();
    const lastClean = localStorage.getItem(LAST_CLEAN_KEY);

    if (!lastClean) {
      // Primera vez → limpiar todo
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(LAST_CLEAN_KEY, now.toString());
    } else {
      const elapsed = now - parseInt(lastClean, 10);
      if (elapsed > CLEAN_INTERVAL) {
        // Pasaron más de 24h → limpiar todo
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem(LAST_CLEAN_KEY, now.toString());
      }
    }
  }, []);
}
