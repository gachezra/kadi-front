import React, { useEffect, useState } from 'react';
import { isSocketConnected, connectSocketService, onConnected, onDisconnected } from '../utils/api';

interface Props {
  placement?: 'inline' | 'fixed';
}

export const SocketStatus: React.FC<Props> = ({ placement = 'inline' }) => {
  const [connected, setConnected] = useState<boolean>(isSocketConnected());

  useEffect(() => {
    const off1 = onConnected(() => setConnected(true));
    const off2 = onDisconnected(() => setConnected(false));
    setConnected(isSocketConnected());
    return () => {
      try { off1(); } catch (_) {}
      try { off2(); } catch (_) {}
    };
  }, []);

  const handleRetry = async () => {
    try {
      await connectSocketService();
      setConnected(isSocketConnected());
    } catch (err) {
      console.warn('Socket reconnect failed', err);
      setConnected(false);
    }
  };

  const baseClasses = 'inline-flex items-center gap-3 px-3 py-1 rounded-md text-sm font-medium';
  const statusClasses = connected ? 'bg-green-600 text-white' : 'bg-red-600 text-white';

  if (placement === 'fixed') {
    return (
      <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 60 }}>
        <div className={`${baseClasses} ${statusClasses}`}>
          <span>{connected ? 'Socket: connected' : 'Socket: disconnected'}</span>
          {!connected && <button onClick={handleRetry} className="px-2 py-1 bg-white/10 rounded text-xs">Retry</button>}
        </div>
      </div>
    );
  }

  // Inline, responsive badge suitable for headers/pages
  return (
    <div className={`inline-block ${statusClasses} rounded-md p-1`}>
      <div className={`${baseClasses}`}>
        <span className="sr-only">Socket connection status</span>
        <span className="font-semibold">{connected ? 'Connected' : 'Disconnected'}</span>
        {!connected && (
          <button onClick={handleRetry} className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs">Retry</button>
        )}
      </div>
    </div>
  );
};

export default SocketStatus;
