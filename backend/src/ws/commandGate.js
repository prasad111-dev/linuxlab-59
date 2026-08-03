const { TextDecoder } = require('util');
const { checkCommand, blockMessage, cleanLineForDisplay } = require('../services/commandPolicy');

/**
 * Intercepts the student->container byte stream.
 *
 * Typed characters are forwarded live so the shell echoes them normally, but the
 * terminating Enter is held back until the reconstructed command line passes the
 * task policy. Blocked commands are erased from the line buffer and replaced with
 * a clear "blocked" message instead of being executed.
 */
function createCommandGate(policy, send) {
  const decoder = new TextDecoder();
  let rawLine = '';
  let heldEnter = null;

  function resolveHeld() {
    if (heldEnter === null) return;
    const visible = cleanLineForDisplay(rawLine);
    const res = checkCommand(visible, policy);
    if (res.allowed) {
      send(heldEnter);
    } else {
      const erase = '\x7f'.repeat([...visible].length);
      if (erase) send(erase);
      send(`echo '${blockMessage(res).replace(/'/g, "'\\''")}'\r\n`);
    }
    rawLine = '';
    heldEnter = null;
  }

  return {
    push(data) {
      const str = typeof data === 'string' ? data : decoder.decode(data, { stream: true });
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];

        if (ch === '\x03' || ch === '\x04') {
          // Ctrl+C / Ctrl+D: cancel the pending line and forward immediately
          if (heldEnter) send(heldEnter);
          heldEnter = null;
          rawLine = '';
          send(ch);
          continue;
        }

        if (ch === '\r' || ch === '\n') {
          if (ch === '\r' && str[i + 1] === '\n') {
            heldEnter = '\r\n';
            i += 1;
          } else {
            heldEnter = ch;
          }
          resolveHeld();
          continue;
        }

        rawLine += ch;
        send(ch);
      }
    },
    flush() {
      resolveHeld();
    },
  };
}

module.exports = { createCommandGate };
