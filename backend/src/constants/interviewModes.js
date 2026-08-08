/**
 * Single source of truth for interview-prep drill modes on the backend.
 * The frontend keeps its own richer registry (titles/icons/content) in
 * frontend/src/data/interviewData.js — the mode strings must stay in sync.
 */

const INTERVIEW_MODES = [
  'flashcard',
  'quest',
  'typing',
  'terminal-mission',
  'admin-tickets',
  'permission-puzzle',
  'wrong-command',
  'incident-response',
  'build-command',
  'command-detective',
  'escape-room',
  'command-battle',
  'career-mode',
  'fix-mistake',
  'command-speedrun',
  'production-checklist',
  'virtual-lab',
  'command-chain',
  'interview-simulation',
  'daily-challenge',
  'predict-output',
  'scenario-generator',
  'career-simulator',
  'top-145-questions',
];

const MODE_SET = new Set(INTERVIEW_MODES);

function isInterviewMode(mode) {
  return MODE_SET.has(String(mode || '').trim());
}

/** Short human-readable label for a mode (used by reports and UI fallbacks). */
function modeLabel(mode) {
  const labels = {
    flashcard: 'Flashcard Duel',
    quest: 'Quest Mode',
    typing: 'Typing Shooter',
    'terminal-mission': 'Terminal Mission',
    'admin-tickets': 'Admin Ticket Queue',
    'permission-puzzle': 'Permission Puzzle',
    'wrong-command': 'Find the Wrong Command',
    'incident-response': 'Incident Response',
    'build-command': 'Build the Command',
    'command-detective': 'Command Detective',
    'escape-room': 'Linux Escape Room',
    'command-battle': 'Command Battle',
    'career-mode': 'Junior to Senior Career',
    'fix-mistake': 'Fix My Mistake',
    'command-speedrun': 'Command Speedrun',
    'production-checklist': 'Production Checklist',
    'virtual-lab': 'Virtual Linux Lab',
    'command-chain': 'Command Chain',
    'interview-simulation': 'Interview Simulation',
    'daily-challenge': 'Daily Linux Challenge',
    'predict-output': 'Predict the Output',
    'scenario-generator': 'Scenario Generator',
    'career-simulator': 'Career Simulator',
    'top-145-questions': 'Top 145 Interview Questions',
  };
  return labels[mode] || String(mode || 'Linux').replace(/[-_]/g, ' ');
}

module.exports = { INTERVIEW_MODES, isInterviewMode, modeLabel };
