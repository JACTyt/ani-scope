'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try: "relaxing slice of life after work" or "mecha with political themes"'
        className={`flex-1 rounded-lg border border-border bg-surface px-4 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none transition-colors ${large ? 'py-3 text-base' : 'py-2 text-sm'}`}
      />
      <Button type="submit" size={large ? 'lg' : 'md'}>Search</Button>
    </form>
  );
}
