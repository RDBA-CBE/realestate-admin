import { useEffect, useState } from 'react';

const Paginations = (props) => {
    const { activeNumber, totalPage, currentPages } = props;
    const totalPages = Math.ceil(totalPage / 10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(currentPages);
    }, [currentPages]);

    const handlePrevClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            activeNumber(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            activeNumber(currentPage + 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        activeNumber(pageNumber);
    };

    const renderPageNumbers = () => {
        let pageNumbers = [];
        const pageBuffer = 2;

        if (totalPages <= 6) {
            // If total pages are small, just show all the pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else if (currentPage <= 3) {
            // Show first 5 pages and '... last'
            for (let i = 1; i <= Math.min(5, totalPages); i++) {
                pageNumbers.push(i);
            }
            if (totalPages > 5) pageNumbers.push('...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            // Show '1 ... last 5 pages'
            pageNumbers.push(1, '...');
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Show '1 ... currentPage-2 currentPage currentPage+2 ... totalPages'
            pageNumbers.push(1, '...');
            for (let i = currentPage - pageBuffer; i <= currentPage + pageBuffer; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push('...', totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className="pagination-container">
            <button
                className="prev-button"
                onClick={handlePrevClick}
                disabled={currentPage === 1}
                style={{
                    color: currentPage === 1 ? 'grey' : 'black',
                    cursor: currentPage === 1 ? 'default' : ' pointer',
                }}
            >
                Prev
            </button>

            <div className="page-numbers">
                {renderPageNumbers().map((pageNumber, index) => (
                    <button
                        key={index}
                        className={`page-button ${pageNumber === currentPage ? 'active' : ''}`}
                        onClick={() => typeof pageNumber === 'number' && handlePageClick(pageNumber)}
                        disabled={pageNumber === '...' || pageNumber === currentPage}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>

            <button
                className="next-button"
                style={{
                    color: currentPage === totalPages ? 'grey' : 'black',
                    cursor: currentPage === totalPages ? 'default' : ' pointer',
                }}
                onClick={handleNextClick}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Paginations;
