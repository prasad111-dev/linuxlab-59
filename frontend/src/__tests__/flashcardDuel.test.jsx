import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FlashcardDuel from '../pages/FlashcardDuel';
import { FLASHCARDS } from '../data/interviewData';

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

    expect(screen.getByText('Tier 1/25 · Card 1/5')).toBeTruthy();
    expect(screen.getByText('Q1/125')).toBeTruthy();
  });
});
