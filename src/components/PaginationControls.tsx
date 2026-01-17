import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        
        {/* First page */}
        <PaginationItem>
          <PaginationLink
            {...(currentPage !== 1 && { onClick: () => onPageChange(1) })}
            isActive={currentPage === 1}
            className={currentPage !== 1 ? 'cursor-pointer' : ''}
          >
            1
          </PaginationLink>
        </PaginationItem>
        
        {/* Left ellipsis */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        
        {/* Pages around current */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer"
            >
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {currentPage !== 1 && currentPage !== totalPages && (
          <PaginationItem>
            <PaginationLink isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(currentPage + 1)}
              className="cursor-pointer"
            >
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        
        {/* Right ellipsis */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        
        {/* Last page */}
        <PaginationItem>
          <PaginationLink
            {...(currentPage !== totalPages && { onClick: () => onPageChange(totalPages) })}
            isActive={currentPage === totalPages}
            className={currentPage !== totalPages ? 'cursor-pointer' : ''}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
