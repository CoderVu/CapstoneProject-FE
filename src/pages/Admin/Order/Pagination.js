import React from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
  showItemsPerPage = true,
}) => {
  // Start index and end index for displaying "showing X - Y of Z items" text
  const startIndex = totalItems > 0 ? currentPage * itemsPerPage + 1 : 0;
  const endIndex = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  // Function to render page numbers, with logic to handle many pages
  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage, endPage;

    if (totalPages <= 5) {
      // If we have 5 or fewer pages, show all
      startPage = 0;
      endPage = totalPages - 1;
    } else {
      // If we have more than 5 pages, calculate which ones to show
      if (currentPage <= 2) {
        startPage = 0;
        endPage = 4;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 5;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`p-2 w-10 border-t border-b border-gray-300 ${
            currentPage === i
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {showItemsPerPage && (
        <div className="flex items-center">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600 mr-2">
            Hiển thị:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md text-sm p-1"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>

            <option value="1000">1000</option>
          
          </select>
        </div>
      )}

      <p className="text-sm text-gray-600">
        Hiển thị {startIndex} - {endIndex} trong số {totalItems} mục
      </p>

      <div className="flex items-center">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="p-2 border border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Trang đầu</span>
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 border-t border-b border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Trang trước</span>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex">{renderPageNumbers()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          className="p-2 border-t border-b border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Trang sau</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          className="p-2 border border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="sr-only">Trang cuối</span>
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
