export const getVisiblePages = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage < 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage <= totalPages - 2) {
    return Array.from({ length: 5 }, (_, index) => currentPage - 2 + index);
  }

  return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
};
