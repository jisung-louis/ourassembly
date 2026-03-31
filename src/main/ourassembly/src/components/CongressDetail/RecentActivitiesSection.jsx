import { Icon } from '../Common/Icon.jsx'
import { SectionHeading } from './PanelCard.jsx'

const activityFilters = [
  { id: 'all', label: '전체' },
  { id: 'bill', label: '발의' },
  { id: 'question', label: '질의' },
  { id: 'debate', label: '토론' },
  { id: 'meeting', label: '회의' },
]

export function RecentActivitiesSection({ activities, selectedFilter, onFilterChange }) {
  const filteredActivities =
    selectedFilter === 'all'
      ? activities
      : activities.filter((activity) => activity.filter === selectedFilter)

  return (
    <section className="panel">
      <SectionHeading
        icon="book"
        title="최근 입법 활동"
        action={<span className="detail-section__meta">최근 {activities.length}건 활동</span>}
      />

      {activities.length > 0 ? (
        <>
          <div className="detail-filter-row">
            {activityFilters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-chip ${selectedFilter === filter.id ? 'is-active' : ''}`}
                onClick={() => onFilterChange(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="activity-list">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <article key={activity.id} className="activity-card">
                  <div className="activity-card__head">
                    <div className="activity-card__meta">
                      <span className={`category-pill category-pill--${activity.accent}`}>
                        {activity.category}
                      </span>
                      <span>{activity.meta}</span>
                    </div>
                    <Icon className="activity-card__arrow" name="chevronRight" />
                  </div>
                  <h3>{activity.title}</h3>
                </article>
              ))
            ) : (
              <p className="body-copy">선택한 유형의 입법 활동이 아직 없습니다.</p>
            )}
          </div>
        </>
      ) : (
        <p className="body-copy">최근 입법 활동 정보가 아직 없습니다.</p>
      )}
    </section>
  )
}
