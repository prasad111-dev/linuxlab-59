import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { terminalSocketUrl } from '../lib/api';

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export default function XTerm({ attemptId, ticket, onConnected }) {
  const ref = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      lineHeight: 1.25,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      theme: {
        background: '#020617',
        foreground: '#e2e8f0',
        cursor: '#818cf8',
        cursorAccent: '#020617',
        selectionBackground: 'rgba(99,102,241,0.4)',
        black: '#0f172a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde047',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      scrollback: 3000,
      convertEol: false,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(ref.current);

    const safeFit = () => {
      const el = ref.current;
      if (!el || el.clientWidth <= 0 || el.clientHeight <= 0) return;
      try {
        fit.fit();
      } catch {
        /* hidden or too small to fit */
      }
    };
    safeFit();

    let ws = null;
    let disposed = false;
    let retryTimer = null;
    let retries = 0;
    let firstOpen = true;

    const send = (data) => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(data);
    };

    const cleanupWs = () => {
      if (ws) {
        ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
        ws = null;
      }
    };

    const connect = () => {
      if (disposed) return;
      cleanupWs();
      ws = new WebSocket(terminalSocketUrl(attemptId, ticket));
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        retries = 0;
        // Only wipe the screen on the very first connection; reconnects attach
        // to the same live shell (orchestrator replays buffered output).
        if (firstOpen) {
          term.clear();
          firstOpen = false;
        }
        onConnected?.();
      };
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          term.write(e.data);
        } else {
          term.write(new Uint8Array(e.data));
        }
      };
      ws.onclose = () => {
        if (disposed) return;
        term.writeln('\r\n\x1b[90m[connection lost — retrying]…\x1b[0m');
        if (retries < 10) {
          retryTimer = setTimeout(connect, 2000);
          retries += 1;
        } else {
          term.writeln('\r\n\x1b[31m[connection closed]\x1b[0m');
        }
      };
      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };
    };

    // Some mobile keyboards/composition helpers emit the same character twice
    // back-to-back. Drop an identical single-character echo within a tiny
    // window so `ls` doesn't come out as `lss`. Desktop is unaffected.
    const dedupe = isTouchDevice();
    let lastData = '';
    let lastDataAt = 0;
    const dataDisposable = term.onData((data) => {
      if (dedupe && data.length === 1 && data === lastData && Date.now() - lastDataAt < 90) {
        return;
      }
      lastData = data;
      lastDataAt = Date.now();
      send(data);
    });
    connect();

    const ro = new ResizeObserver(safeFit);
    ro.observe(ref.current);
    window.addEventListener('resize', safeFit);

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      dataDisposable.dispose();
      cleanupWs();
      ro.disconnect();
      window.removeEventListener('resize', safeFit);
      term.dispose();
    };
  }, [attemptId, ticket, onConnected]);

  return <div ref={ref} className="h-full w-full" />;
}
