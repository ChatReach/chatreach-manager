'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface AsyncComboboxProps<T> {
  /** Currently selected item, or null when nothing is selected. */
  value: T | null;
  /** Called when the selection changes. */
  onChange: (item: T | null) => void;
  /** Async search callback. Receives the (debounced) query and returns matching items. */
  search: (query: string) => Promise<T[]>;
  /** Unique, stable string key for an item — used for keys and selection comparison. */
  getOptionValue: (item: T) => string;
  /** Renders an option inside the dropdown list. */
  renderOption: (item: T) => ReactNode;
  /** Renders the selected item inside the trigger. Defaults to {@link renderOption}. */
  renderValue?: (item: T) => ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Empty-state message shown once a query has been typed and no results came back. */
  emptyMessage?: string;
  /** Hint shown before the user types anything. */
  idleMessage?: string;
  disabled?: boolean;
  className?: string;
  /** Debounce delay for the search callback, in ms. Defaults to 300. */
  debounceMs?: number;
}

export function AsyncCombobox<T>({
  value,
  onChange,
  search,
  getOptionValue,
  renderOption,
  renderValue,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  idleMessage = 'Type to search.',
  disabled,
  className,
  debounceMs = 300,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    (search_: string) => {
      if (!search_.trim()) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      search(search_)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    },
    [search],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch, debounceMs]);

  const handleSelect = (item: T) => {
    onChange(item);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const selectedValue = value ? getOptionValue(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          {value ? (
            <span className="truncate">{(renderValue ?? renderOption)(value)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searching ? 'Searching...' : query.trim() ? emptyMessage : idleMessage}
            </CommandEmpty>
            <CommandGroup>
              {results.map((item) => {
                const optionValue = getOptionValue(item);
                return (
                  <CommandItem
                    key={optionValue}
                    value={optionValue}
                    onSelect={() => handleSelect(item)}
                  >
                    {renderOption(item)}
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        selectedValue === optionValue ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
