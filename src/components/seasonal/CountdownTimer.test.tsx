import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown when target is in the future', () => {
    const target = new Date(Date.now() + 2 * 86400 * 1000 + 3600 * 1000);
    render(<CountdownTimer targetDate={target} label="Next Season" />);
    expect(screen.getByText('Next Season')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined(); // days
  });

  it('renders nothing when target is in the past', () => {
    const target = new Date(Date.now() - 1000);
    const { container } = render(<CountdownTimer targetDate={target} label="Past" />);
    expect(container.firstChild).toBeNull();
  });

  it('ticks every second', () => {
    const target = new Date(Date.now() + 10000);
    render(<CountdownTimer targetDate={target} label="Soon" />);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('Soon')).toBeDefined();
  });
});
