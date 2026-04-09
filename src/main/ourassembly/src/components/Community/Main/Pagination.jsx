export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="comm-pagination">
      <button className="comm-pg-btn" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={`comm-pg-btn ${p === currentPage ? 'is-active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="comm-pg-btn" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>›</button>
    </div>
  )
}
