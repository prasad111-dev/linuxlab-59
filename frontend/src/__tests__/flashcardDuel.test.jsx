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
  it('keeps the answered card on screen without revealing the answer or explanation', () => {
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

    // The card must stay put — no advancing, no correct/wrong reveal, no explanation.
    expect(screen.getByText(first.question)).toBeTruthy();
    expect(screen.queryByText(second.question)).toBeNull();
    expect(screen.queryByText('Correct!')).toBeNull();
    expect(screen.queryByText('Not quite.')).toBeNull();
    expect(screen.queryByText(first.explanation)).toBeNull();
  });

  it('only advances to the next card after pressing "Next card"', () => {
    const first = FLASHCARDS[0];
    const second = FLASHCARDS[1];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Next card/ });
    expect(nextBtn.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: first.answer }));
    fireEvent.click(screen.getByRole('button', { name: /Next card/ }));

    expect(screen.getByText(second.question)).toBeTruthy();
    expect(screen.queryByText(first.question)).toBeNull();
  });

  it('lets the user go back to a completed question and change the answer', () => {
    const first = FLASHCARDS[0];
    const second = FLASHCARDS[1];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: first.answer }));
    fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    expect(screen.getByText(second.question)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Previous/ }));
    expect(screen.getByText(first.question)).toBeTruthy();

    // Change the answer on the completed question — still no correctness reveal.
    const wrong = first.options.find((o) => o !== first.answer);
    fireEvent.click(screen.getByRole('button', { name: wrong }));
    expect(screen.queryByText('Correct!')).toBeNull();
    expect(screen.queryByText('Not quite.')).toBeNull();

    // And move forward again.
    fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    expect(screen.getByText(second.question)).toBeTruthy();
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

  it('jumps straight back to an earlier quiz via the unlocked tier icons', () => {
    const first = FLASHCARDS[0];
    const sixth = FLASHCARDS[5];
    render(
      <MemoryRouter>
        <FlashcardDuel />
      </MemoryRouter>
    );

    // Complete the first tier (5 cards) to unlock tier 2.
    for (const card of FLASHCARDS.slice(0, 5)) {
      fireEvent.click(screen.getByRole('button', { name: card.answer }));
      fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    }
    expect(screen.getByText(sixth.question)).toBeTruthy();

    // Click the first tier icon at the top -> straight back to quiz 1.
    fireEvent.click(screen.getByRole('button', { name: `Go to tier 1: ${FLASHCARD_TIERS[0].name}` }));
    expect(screen.getByText(first.question)).toBeTruthy();
    expect(screen.queryByText(sixth.question)).toBeNull();

    // And a locked tier is not clickable.
    expect(screen.queryByRole('button', { name: `Go to tier ${FLASHCARD_TIERS.length}: ${FLASHCARD_TIERS[FLASHCARD_TIERS.length - 1].name}` })).toBeNull();
  });

  it('regression: answering pwd keeps pwd on screen and never leaks the next (clear) card', () => {
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
      fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    }

    // Now on pwd. Answer it correctly — the card stays on screen with no feedback.
    expect(screen.getByText(pwd.question)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: pwd.answer }));

    expect(screen.getByText(pwd.question)).toBeTruthy();
    expect(screen.queryByText('Correct!')).toBeNull();
    expect(screen.queryByText(pwd.explanation)).toBeNull();
    expect(screen.queryByText(clear.question)).toBeNull();
    expect(screen.queryByText(clear.explanation)).toBeNull();

    // Advancing moves to clear.
    fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    expect(screen.getByText(clear.question)).toBeTruthy();
    expect(screen.queryByText('Correct!')).toBeNull();
  });
});
