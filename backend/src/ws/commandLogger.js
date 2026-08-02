const { TextDecoder } = require('util');
const decoder = new TextDecoder();

/**
 * Best-effort parser that reconstructs typed command lines from terminal
 * input (raw bytes the student sends). Ignores escape/control sequences and
 * applies backspace handling.
 */
function createCommandLogger() {
  const commands = [];
  let buf = '';

  function cleanLine(line) {
    const chars = [];
    for (const ch of line) {
      if (ch === '\b' || ch === '\x7f') chars.pop();
      else if (ch === '\x00') continue;
      else chars.push(ch);
    }
    return chars.join('');
  }

  function ingest(data) {
    const raw = typeof data === 'string' ? data : decoder.decode(data, { stream: true });
    const cleaned = raw
      .replace(/\x1b\]\d+;.*?(\x07|\x1b\\)/g, '')
      .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
      .replace(/\x1b[()][0-9A-B]/g, '')
      .replace(/\x1b[=>]/g, '');
    buf += cleaned;
    let idx;
    while ((idx = buf.search(/[\r\n]/)) !== -1) {
      const line = cleanLine(buf.slice(0, idx)).trim();
      buf = buf.slice(idx + 1);
      if (line && line.length <= 500) commands.push(line);
    }
    if (buf.length > 4096) buf = buf.slice(-4096);
  }

  return {
    ingest,
    get commands() {
      return commands;
    },
    flush() {
      commands.length = 0;
      buf = '';
    },
  };
}

module.exports = { createCommandLogger };
