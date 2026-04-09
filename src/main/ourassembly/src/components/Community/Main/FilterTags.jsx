export function FilterTags({ district, keyword, totalCount, onClearDistrict, onClearKeyword }) {
  if (district === '전체' && !keyword) return null

  return (
    <div className="comm-filters">
      {district !== '전체' && (
        <span className="comm-filter-tag comm-filter-tag--district">
          {district}
          <button className="comm-filter-tag__x" onClick={onClearDistrict} type="button">✕</button>
        </span>
      )}
      {keyword && (
        <span className="comm-filter-tag comm-filter-tag--keyword">
          &ldquo;{keyword}&rdquo;
          <button className="comm-filter-tag__x" onClick={onClearKeyword} type="button">✕</button>
        </span>
      )}
      <span className="comm-filter-count">{totalCount}개의 게시글</span>
    </div>
  )
}
