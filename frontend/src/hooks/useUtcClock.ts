import { useEffect, useState } from 'react';

export function useUtcClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour12: false,
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${formatter.format(now)} UTC`;
}

export default useUtcClock;
