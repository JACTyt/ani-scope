import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeySetupModal } from './KeySetupModal';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('KeySetupModal', () => {
  beforeEach(() => localStorageMock.clear());

  it('shows validation error for invalid key format', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<KeySetupModal open onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText('sk-...'), { target: { value: 'bad-key' } });
    fireEvent.click(screen.getByText('Save Key'));
    expect(screen.getByText('Key must start with "sk-"')).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves valid key to localStorage and calls onSave', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<KeySetupModal open onClose={onClose} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText('sk-...'), { target: { value: 'sk-testkey123' } });
    fireEvent.click(screen.getByText('Save Key'));
    expect(localStorageMock.getItem('aniscope_openai_key')).toBe('sk-testkey123');
    expect(onSave).toHaveBeenCalledWith('sk-testkey123');
    expect(onClose).toHaveBeenCalled();
  });
});
