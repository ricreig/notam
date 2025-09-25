import { useEffect, useState } from 'react';

export function useUTCClock(interval = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return now.toISOString().replace('T', ' ').replace('Z', ' UTC');
}
