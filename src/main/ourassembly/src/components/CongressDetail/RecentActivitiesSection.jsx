import { useMemo } from 'react'
import { Icon } from '../Common/Icon.jsx'
import { SectionHeading } from './PanelCard.jsx'
import {
  billRoleTabs,
  billStatusFilters,
  formatDateLabel,
  getBillDetailChip,
  getBillSummaryBucket,
  getBillSummaryChip,
  getProposerNames,
} from '../../utils/CongressDetail/billActivity.js'

function FilterChip({ isActive, label, count, onClick }) {
  return (
    <button
      className={`bill-filter-chip ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span className="bill-filter-chip__count">{count}</span>
    </button>
  )
}

function RoleTab({ isActive, label, count, onClick }) {
  return (
    <button
      className={`bill-role-tab ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  )
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

  return [
    1,
    'ellipsis-left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-right',
    totalPages,
  ]
}

export function RecentActivitiesSection({
  billActivities,
  isLoading,
  errorMessage,
  selectedRole,
  selectedStatus,
  onRoleChange,
  onStatusChange,
  expandedBillId,
  onBillToggle,
  billDetailsById,
  loadingBillId,
  billDetailErrors,
  currentPage,
  onPageChange,
}) {
  const selectedRoleBills = selectedRole === 'CO' ? billActivities.coBills : billActivities.leadBills
  const displayedRoleLabel = selectedRole === 'CO' ? '공동 발의' : '대표 발의'
  const filteredBills =
    selectedStatus === 'all'
      ? selectedRoleBills
      : selectedRoleBills.filter((bill) => getBillSummaryBucket(bill) === selectedStatus)
  const itemsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(filteredBills.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedBills = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage
    return filteredBills.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredBills, safeCurrentPage])
  const paginationItems = buildPaginationItems(totalPages, safeCurrentPage)

  return (
    <section className="panel">
      <SectionHeading
        icon="book"
        title="최근 입법 활동"
        action={
          !isLoading ? (
            <span className="detail-section__meta">
              {selectedRoleBills.length}건 {displayedRoleLabel}
            </span>
          ) : null
        }
      />

      {isLoading ? (
        <p className="body-copy">의안 활동 정보를 불러오는 중입니다.</p>
      ) : errorMessage ? (
        <p className="body-copy">{errorMessage}</p>
      ) : selectedRoleBills.length > 0 ? (
        <>
          <div className="bill-role-tabs">
            {billRoleTabs.map((tab) => {
              const count = tab.id === 'CO' ? billActivities.coCount : billActivities.leadCount

              return (
                <RoleTab
                  key={tab.id}
                  count={count}
                  isActive={selectedRole === tab.id}
                  label={tab.label}
                  onClick={() => onRoleChange(tab.id)}
                />
              )
            })}
          </div>

          <div className="bill-filter-row">
            {billStatusFilters.map((filter) => {
              const count =
                filter.id === 'all'
                  ? selectedRoleBills.length
                  : selectedRoleBills.filter((bill) => getBillSummaryBucket(bill) === filter.id).length

              return (
                <FilterChip
                  key={filter.id}
                  count={count}
                  isActive={selectedStatus === filter.id}
                  label={filter.label}
                  onClick={() => onStatusChange(filter.id)}
                />
              )
            })}
          </div>

          <div className="bill-activity-list">
            {filteredBills.length > 0 ? (
              paginatedBills.map((bill) => {
                const summaryChip = getBillSummaryChip(bill)
                const isExpanded = expandedBillId === bill.billId
                const detail = billDetailsById[bill.billId]
                const detailChip = getBillDetailChip(detail)
                const leadNames = getProposerNames(detail?.proposers, 'LEAD')
                const coNames = getProposerNames(detail?.proposers, 'CO')
                const isDetailLoading = loadingBillId === bill.billId
                const detailError = billDetailErrors[bill.billId]

                return (
                  <article
                    key={`${selectedRole}-${bill.billId}`}
                    className={`bill-activity-card ${isExpanded ? 'is-expanded' : ''}`}
                  >
                    <button
                      className="bill-activity-card__button"
                      onClick={() => onBillToggle(bill.billId)}
                      type="button"
                      aria-expanded={isExpanded}
                    >
                      <div className="bill-activity-card__head">
                        <div className="bill-activity-card__meta">
                          <span className={`bill-status-pill bill-status-pill--${summaryChip.tone}`}>
                            <Icon className="bill-status-pill__icon" name={summaryChip.icon} />
                            <span>{summaryChip.label}</span>
                          </span>
                          <span>{formatDateLabel(bill.proposeDate, '발의')}</span>
                        </div>
                        <Icon
                          className={`bill-activity-card__arrow ${isExpanded ? 'is-expanded' : ''}`}
                          name="chevronRight"
                        />
                      </div>
                      <h3>{bill.billName}</h3>
                    </button>

                    {isExpanded ? (
                      <div className="bill-activity-card__detail">
                        {isDetailLoading ? (
                          <div className="bill-detail__loading">
                            <span className="bill-detail__spinner" aria-hidden="true" />
                            <p className="body-copy">의안 상세 정보를 불러오는 중입니다.</p>
                          </div>
                        ) : detailError ? (
                          <p className="body-copy">{detailError}</p>
                        ) : detail ? (
                          <>
                            <div className="bill-detail__feature">
                              <div className="bill-detail__feature-head">
                                <span className={`bill-status-pill bill-status-pill--${detailChip.tone}`}>
                                  <Icon className="bill-status-pill__icon" name={detailChip.icon} />
                                  <span>{detailChip.label}</span>
                                </span>
                                <span className="bill-detail__committee">{detail.committeeName || '소관위 정보 없음'}</span>
                              </div>
                              <div className="bill-detail__feature-copy">
                                <span className="bill-detail__feature-label">제안 이유 및 주요 내용 요약</span>
                                <p>
                                  제안 이유 및 주요 내용 요약은 준비 중입니다. 추후 국회 의안 상세 원문을
                                  바탕으로 AI 요약이 이 영역에 표시됩니다.
                                </p>
                              </div>
                            </div>

                            <div className="bill-detail__meta-grid">
                              <div className="bill-detail__proposer-group">
                                <span className="bill-detail__label">공동 발의</span>
                                <p>{coNames.length > 0 ? coNames.join(', ') : '정보 없음'}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="body-copy">상세 정보가 아직 없습니다.</p>
                        )}
                      </div>
                    ) : null}
                  </article>
                )
              })
            ) : (
              <p className="body-copy">선택한 조건의 입법 활동이 아직 없습니다.</p>
            )}
          </div>

          {filteredBills.length > itemsPerPage ? (
            <div className="bill-pagination">
              {paginationItems.map((item, index) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    className={`bill-pagination__button ${safeCurrentPage === item ? 'is-active' : ''}`}
                    onClick={() => onPageChange(item)}
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
        <p className="body-copy">최근 입법 활동 정보가 아직 없습니다.</p>
      )}
    </section>
  )
}
