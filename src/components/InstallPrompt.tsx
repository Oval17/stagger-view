import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA install button. Hidden until the browser fires beforeinstallprompt
 * (requires manifest + icons + SW + HTTPS/localhost, so absence is normal).
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  const install = async () => {
    // prompt() is single-use per beforeinstallprompt event: capture, clear
    // state first (a second click must be a no-op, not a throw), then prompt.
    const d = deferred;
    if (!d) return;
    setDeferred(null);
    try {
      await d.prompt();
      await d.userChoice;
    } catch {
      // prompt dismissed or unavailable — button stays hidden until the
      // browser fires beforeinstallprompt again.
    }
  };

  return (
    <button type="button" onClick={install} className="install-button">
      Install app
    </button>
  );
}
