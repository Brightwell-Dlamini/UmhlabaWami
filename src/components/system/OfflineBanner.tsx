import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-2 z-50">
      <WifiOff className="w-3.5 h-3.5" />
      You are offline — demo data remains available; sync resumes when connectivity returns.
    </div>
  );
};
