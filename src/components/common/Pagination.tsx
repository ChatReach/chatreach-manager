'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  currentPage: number;
  pageSize: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizesItems = [10, 25, 50, 100, 250];

const Pagination = (props: Props) => {
  const { currentPage, pageSize, lastPage, onPageChange, onPageSizeChange } = props;

  const onChangeCurrentPage = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }

    if (direction === 'prev' && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
            page size: {pageSize}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {pageSizesItems.map((item) => (
            <DropdownMenuItem key={item} onClick={() => onPageSizeChange(item)}>
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="text-muted-foreground flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onChangeCurrentPage('prev')}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-sm font-medium">
          {currentPage}/{lastPage || 1}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onChangeCurrentPage('next')}
          disabled={currentPage >= lastPage}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
