import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if it's an iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to show the install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      // Hide the install button when installed
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOSDevice) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the installation`);

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable && !isIOSDevice) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {showIOSInstructions ? (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold mb-2">Instalasi di iOS:</h3>
          <ol className="text-sm space-y-1 list-decimal pl-4 mb-3">
            <li>Tap ikon "Share" (kotak dengan panah ke atas)</li>
            <li>Scroll dan pilih "Add to Home Screen"</li>
            <li>Tap "Add" di pojok kanan atas</li>
          </ol>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowIOSInstructions(false)}
            className="w-full"
          >
            Tutup
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleInstallClick}
          className="shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {isIOSDevice ? 'Pasang Aplikasi' : 'Install Aplikasi'}
        </Button>
      )}
    </div>
  );
};

export default InstallPWAButton;