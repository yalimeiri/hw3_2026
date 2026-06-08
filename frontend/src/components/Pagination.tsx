export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const a = currentPage;
    const n = totalPages;

    if (n <= 5) {
      return Array.from({ length: n }, (_, i) => i + 1);
    } else {
      if (a < 3) {
        return Array.from({ length: 5 }, (_, i) => i + 1);
      } else if (3 <= a && a <= n - 2) {
        return Array.from({ length: 5 }, (_, i) => a - 2 + i);
      } else {
        return Array.from({ length: 5 }, (_, i) => n - 4 + i);
      }
    }
    return [];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginTop: "10px",
      }}
    >
      <button
        className="neon-btn"
        name="first"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>

      <button
        className="neon-btn"
        name="previous"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          className="neon-btn"
          name={`page-${num}`}
          onClick={() => onPageChange(num)}
          disabled={num === currentPage}
          style={{ fontWeight: num === currentPage ? "bold" : "normal" }}
        >
          {num}
        </button>
      ))}

      <button
        className="neon-btn"
        name="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>

      <button
        className="neon-btn"
        name="last"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    </div>
  );
}
