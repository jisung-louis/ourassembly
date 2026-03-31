import { Icon } from '../Common/Icon.jsx'
import { SectionHeading } from './PanelCard.jsx'

export function RecentNewsSection({ memberName, news }) {
  return (
    <section className="panel">
      <SectionHeading
        icon="newspaper"
        title="관련 최근 뉴스"
        action={<span className="detail-section__meta">{memberName} 관련 보도</span>}
      />

      {news.length > 0 ? (
        <ol className="news-list">
          {news.map((item, index) => (
            <li key={item.id} className="news-list__item">
              <span className="news-list__index">{String(index + 1).padStart(2, '0')}</span>
              <div className="news-list__body">
                <h3>{item.title}</h3>
                <div className="meta-row">
                  <span className={`source-pill source-pill--${index % 4}`}>{item.source}</span>
                  <span>{item.date}</span>
                </div>
              </div>
              <Icon className="news-list__arrow" name="chevronRight" />
            </li>
          ))}
        </ol>
      ) : (
        <p className="body-copy">관련 뉴스가 아직 없습니다.</p>
      )}
    </section>
  )
}
