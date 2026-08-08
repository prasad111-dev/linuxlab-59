import { describe, it, expect } from 'vitest';
import { cleanInlineMarkdown } from '../lib/format';
import { renderMarkdownish } from '../components/InterviewReport';

function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object' && node.props) return textOf(node.props.children);
  return '';
}

function flatten(els) {
  return els.map(textOf).join('\n');
}

describe('cleanInlineMarkdown', () => {
  it('strips bold, emphasis, and code markers', () => {
    expect(cleanInlineMarkdown('**Score:** 49/57')).toBe('Score: 49/57');
    expect(cleanInlineMarkdown('Run `grep` on the file')).toBe('Run grep on the file');
    expect(cleanInlineMarkdown('__Accuracy:__ 86%')).toBe('Accuracy: 86%');
    expect(cleanInlineMarkdown('*emphasis*')).toBe('emphasis');
  });

  it('never mangles glob patterns like *.log', () => {
    expect(cleanInlineMarkdown('grep "*.log"')).toBe('grep "*.log"');
  });
});

describe('renderMarkdownish', () => {
  const report = `## Verdict
You have a strong grasp of core navigation commands.

## Score
**Score:** 49/57

**Accuracy:** 86%

## Strengths
* **Navigation & File Ops:** Excellent.
* **System Info & Permissions:** Solid.

## Areas to improve
* **Searching/Filtering:** Confused \`grep\` with variable settings.

## Study plan
1. **Hands-on Testing:** Open a terminal and run \`man -k <keyword>\`.
2. **Process/Job Control:** Experiment with \`sleep 100 &\`.
3. **Command Validation:** Create a cheat sheet.`;

  it('renders headings, bullets and numbered lists without leaking markdown markers', () => {
    const els = renderMarkdownish(report);
    const flat = flatten(els);

    expect(flat).toContain('Verdict');
    expect(flat).toContain('Score: 49/57');
    expect(flat).toContain('Accuracy: 86%');
    expect(flat).toContain('Navigation & File Ops: Excellent.');
    expect(flat).toContain('Confused grep with variable settings.');
    expect(flat).toContain('1. Hands-on Testing: Open a terminal and run man -k <keyword>.');
    expect(flat).toContain('3. Command Validation: Create a cheat sheet.');

    // The core bug: no raw markdown punctuation should survive into the report.
    expect(flat).not.toMatch(/\*\*/);
    expect(flat).not.toMatch(/^\* |\s\* /m);
    expect(flat).not.toContain('`');
  });

  it('keeps the section headings as headings', () => {
    const els = renderMarkdownish(report);
    const headings = els.filter((e) => e && (e.type === 'h2' || e.type === 'h3')).map(textOf);
    expect(headings).toEqual(['Verdict', 'Score', 'Strengths', 'Areas to improve', 'Study plan']);
  });
});
