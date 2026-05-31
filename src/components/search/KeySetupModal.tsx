'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

const STORAGE_KEY = 'aniscope_openai_key';

interface KeySetupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function KeySetupModal({ open, onClose, onSave }: KeySetupModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed.startsWith('sk-')) {
      setError('Key must start with "sk-"');
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="OpenAI API Key">
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          NLP search uses OpenAI to understand natural language queries. Your key is stored
          locally in your browser and never sent to our servers.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          placeholder="sk-..."
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent"
        />
        {error && <p className="text-xs text-warning">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Save Key
          </button>
        </div>
      </div>
    </Modal>
  );
}
