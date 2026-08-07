import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FlashcardDuel from '../pages/FlashcardDuel';
import { FLASHCARDS, FLASHCARD_TIERS } from '../data/interviewData';

vi.mock('../lib/useInterviewProgress', () => ({
  useInterviewProgress: () => ({ data: null, loaded: true, save: vi.fn(), clear: vi.fn() }),
}));

afterEach(() => cleanup());

describe('FlashcardDuel', () => {
  it('keeps the answered card on screen and grades it against its own answer', () => {
    const first = FLASHCARDS[0];
    const second = FLASHCARDS[1];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    expect(screen.getByText(first.question)).toBeTruthy();
    expect(screen.queryByText(second.question)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: first.answer }));

    expect(screen.getByText('Correct!')).toBeTruthy();
    expect(screen.getByText(first.explanation)).toBeTruthy();
    expect(screen.getByText(first.question)).toBeTruthy();
    expect(screen.queryByText(second.question)).toBeNull();
  });

  it('shows "Not quite." with the answered card\u2019s explanation when wrong, without advancing', () => {
    const first = FLASHCARDS[0];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    const wrong = first.options.find((o) => o !== first.answer);
    fireEvent.click(screen.getByRole('button', { name: wrong }));

    expect(screen.getByText('Not quite.')).toBeTruthy();
    expect(screen.getByText(first.explanation)).toBeTruthy();
    expect(screen.getByText(first.question)).toBeTruthy();
  });

  it('only advances to the next card after pressing "Next card"', () => {
    const first = FLASHCARDS[0];
    const second = FLASHCARDS[1];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: first.answer }));
    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));

    expect(screen.getByText(second.question)).toBeTruthy();
    expect(screen.queryByText(first.question)).toBeNull();
  });

  it('shows the correct tier/card position for the card on screen', () => {
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    expect(screen.getByText(`Tier 1/${FLASHCARD_TIERS.length} · Card 1/5`)).toBeTruthy();
    expect(screen.getByText(`Q1/${FLASHCARDS.length}`)).toBeTruthy();
  });

  it('regression: answering pwd keeps pwd on screen with pwd\u2019s feedback, never the next (clear) card\u2019s answer', () => {
    // Repro of the reported bug: cards 3 (pwd) and 4 (clear).
    const pwd = FLASHCARDS.find((c) => c.cmd === 'pwd');
    const clear = FLASHCARDS.find((c) => c.cmd === 'clear');
    expect(pwd).toBeTruthy();
    expect(clear).toBeTruthy();

    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    // Advance to card 3 (pwd) by answering the first two cards (ls, cd) correctly.
    for (const card of FLASHCARDS.slice(0, 2)) {
      expect(screen.getByText(card.question)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: card.answer }));
      fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    }

    // Now on pwd. Answer it correctly.
    expect(screen.getByText(pwd.question)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: pwd.answer }));

    // The card must stay on pwd, graded correct against pwd's answer,
    // showing pwd's explanation — NOT advancing to clear or showing clear's.
    expect(screen.getByText(pwd.question)).toBeTruthy();
    expect(screen.getByText('Correct!')).toBeTruthy();
    expect(screen.getByText(pwd.explanation)).toBeTruthy();
    expect(screen.queryByText(clear.question)).toBeNull();
    expect(screen.queryByText(clear.explanation)).toBeNull();

    // Advancing moves to clear with no feedback banner left behind.
    fireEvent.click(screen.getByRole('button', { name: 'Next card' }));
    expect(screen.getByText(clear.question)).toBeTruthy();
    expect(screen.queryByText('Not quite.')).toBeNull();
  });
});
