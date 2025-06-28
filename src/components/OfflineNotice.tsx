import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OfflineNotice = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <WifiOff className="h-4 w-4 mr-2" />
      <AlertDescription>
        Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
      </AlertDescription>
    </Alert>
  );
};

export default OfflineNotice;