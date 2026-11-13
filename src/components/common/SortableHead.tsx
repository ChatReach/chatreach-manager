'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Sort {
  column: string;
  direction: 'asc' | 'desc';
}

interface Props {
  column: string;
  /** The active sort, or null while the list uses its default order. */
  sort: Sort | null;
  onSortChange: (sort: Sort | null) => void;
  className?: string;
  children: React.ReactNode;
}

/** Newest first, which is what the lists show until a column is sorted. */
export const DEFAULT_SORT = 'created_at:desc';

export const sortParam = (sort: Sort | null) => (sort ? `${sort.column}:${sort.direction}` : DEFAULT_SORT);

/** A table header that sorts by its column: ascending, then descending, then back to the default order. */
const SortableHead = ({ column, sort, onSortChange, className, children }: Props) => {
  const isActive = sort?.column === column;
  const Icon = !isActive ? ChevronsUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <TableHead
      className={className}
      aria-sort={!isActive ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending'}
    >
      <button
        type="button"
        className="hover:text-foreground -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1"
        onClick={() => {
          if (!isActive) onSortChange({ column, direction: 'asc' });
          else onSortChange(sort.direction === 'asc' ? { column, direction: 'desc' } : null);
        }}
      >
        {children}
        <Icon className={cn('size-3.5', !isActive && 'opacity-40')} />
      </button>
    </TableHead>
  );
};

export default SortableHead;
