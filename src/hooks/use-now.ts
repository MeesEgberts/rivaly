import { useEffect, useState } from "react";

const MINUTE = 60 * 1000;

function roundedNow(): number {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

/**
 * De huidige tijd, afgerond op de minuut. Queries krijgen `now` als argument
 * omdat Convex-queries de klok niet mogen lezen; afronden voorkomt dat elke
 * render een nieuwe subscription start.
 */
export function useNow(): number {
  const [now, setNow] = useState(roundedNow);

  useEffect(() => {
    const interval = setInterval(() => setNow(roundedNow()), MINUTE);

    return () => clearInterval(interval);
  }, []);

  return now;
}
