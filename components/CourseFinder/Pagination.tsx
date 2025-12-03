import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  totalItems: number
  currentPage: number
  perPage: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, currentPage, perPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / perPage)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages - 1)
      } else if (currentPage >= totalPages - 3) {
        pages.push(0)
        pages.push("...")
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i)
      } else {
        pages.push(0)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-[#A51C30]">{currentPage * perPage + 1}</span> to{" "}
          <span className="font-semibold text-[#A51C30]">{Math.min((currentPage + 1) * perPage, totalItems)}</span> of{" "}
          <span className="font-semibold text-[#A51C30]">{totalItems.toLocaleString()}</span> courses
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-2 rounded-lg border flex items-center gap-1 transition-colors ${
              currentPage === 0
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-[#A51C30]/5 hover:border-[#A51C30]/30"
            }`}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                      currentPage === page
                        ? "bg-[#A51C30] text-white border-[#A51C30] shadow-sm"
                        : "border-gray-300 text-gray-700 hover:bg-[#A51C30]/5 hover:border-[#A51C30]/30 hover:text-[#A51C30]"
                    }`}
                  >
                    {(page as number) + 1}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-3 py-2 rounded-lg border flex items-center gap-1 transition-colors ${
              currentPage === totalPages - 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-[#A51C30]/5 hover:border-[#A51C30]/30"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination