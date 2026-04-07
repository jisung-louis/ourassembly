import { useMemo } from 'react'
import { Icon } from '../Common/Icon.jsx'
import { SectionHeading } from './PanelCard.jsx'

function formatPublishedDate(value) {
  if (!value) {
    return '날짜 정보 없음'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ko-KR')
}

function buildPaginationItems(totalPages, currentPage) {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, 6, 'ellipsis-right', totalPages]
  }

  if (currentPage >= totalPages - 4) {
    return [1, 'ellipsis-left', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis-left', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-right', totalPages]
}

export function RecentNewsSection({
  memberName,
  news,
  isLoading = false,
  errorMessage = '',
  currentPage = 1,
  onPageChange,
}) {
  const itemsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(news.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedNews = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage // 5개씩 페이지네이션
    return news.slice(startIndex, startIndex + itemsPerPage)
  }, [news, safeCurrentPage])
  const paginationItems = buildPaginationItems(totalPages, safeCurrentPage)

  return (
    <section className="panel">
      <SectionHeading
        icon="newspaper"
        title="관련 최근 뉴스"
        action={<span className="detail-section__meta">{memberName} 관련 보도</span>}
      />

      {isLoading ? (
        <p className="body-copy">관련 뉴스를 불러오는 중입니다.</p>
      ) : errorMessage ? (
        <p className="body-copy">{errorMessage}</p>
      ) : news.length > 0 ? (
        <>
          <ol className="news-list">
            {paginatedNews.map((item, index) => {
              const visibleIndex = (safeCurrentPage - 1) * itemsPerPage + index + 1

              return (
                <li key={item.id} className="news-list__item">
                  <a
                    className="news-list__link"
                    href={item.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="news-list__index">{String(visibleIndex).padStart(2, '0')}</span>
                    <div className="news-list__body">
                      <h3>{item.title}</h3>
                      <div className="meta-row">
                        <span className={`source-pill source-pill--${index % 4}`}>{item.company || '언론사 미상'}</span>
                        <span>{formatPublishedDate(item.publishedAt)}</span>
                      </div>
                    </div>
                    <Icon className="news-list__arrow" name="chevronRight" />
                  </a>
                </li>
              )
            })}
          </ol>

          {news.length > itemsPerPage ? (
            <div className="bill-pagination">
              {paginationItems.map((item, index) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    className={`bill-pagination__button ${safeCurrentPage === item ? 'is-active' : ''}`}
                    onClick={() => onPageChange?.(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ) : (
                  <span key={`${item}-${index}`} className="bill-pagination__ellipsis">
                    ...
                  </span>
                ),
              )}
            </div>
          ) : null}
        </>
      ) : (
        <p className="body-copy">관련 뉴스가 아직 없습니다.</p>
      )}
    </section>
  )
}
