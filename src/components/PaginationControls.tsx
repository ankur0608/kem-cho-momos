
interface PaginationStatusWrapperProps {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationStatusWrapper({
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    onPageChange,
}: PaginationStatusWrapperProps) {

    // --- Calculation for Display Text ---
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    // Ensure we don't display a number higher than the total items
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const displayRange = totalItems === 0
        ? "0"
        : `${startItem}-${endItem}`;

    return (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">

            {/* 1. Status Text Area (Matching the style of your report) */}
            <p className="text-sm text-gray-600 font-medium text-center sm:text-left">
                Showing <span className="font-bold text-gray-900">{displayRange}</span> of <span className="font-bold text-gray-900">{totalItems}</span> products
            </p>

            {/* 2. Pagination Controls Area */}
            <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
                {/* We use the simple Previous/Next buttons only for this design */}
                <button
                    className="px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-white hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm font-semibold text-sm flex-1 sm:flex-none"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Previous
                </button>
                <button
                    className="px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-white hover:text-rose-600 transition-colors bg-white shadow-sm font-semibold text-sm flex-1 sm:flex-none"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>


        </div>
    );
}

