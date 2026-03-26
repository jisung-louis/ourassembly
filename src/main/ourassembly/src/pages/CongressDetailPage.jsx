import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon.jsx'
import { Portrait, SiteLayout } from '../components/Layout.jsx'
import { getMemberById } from '../data/mockData.js'

const activityFilters = [
  { id: 'all', label: '전체' },
  { id: 'bill', label: '발의' },
  { id: 'question', label: '질의' },
  { id: 'debate', label: '토론' },
  { id: 'meeting', label: '회의' },
]

export function CongressDetailPage() {
  const { memberId } = useParams()
  const member = getMemberById(memberId)
  const [activityFilter, setActivityFilter] = useState('all')

  if (!member) {
    return <Navigate replace to="/" />
  }

  const answeredPosts = member.boardPosts.filter((post) => post.status === 'answered')
  const visibleActivities =
    activityFilter === 'all'
      ? member.activities
      : member.activities.filter((item) => item.filter === activityFilter)

  const actions = [
    { to: '/', icon: 'arrowLeft', label: '검색으로 돌아가기' },
    { to: `/members/${member.id}/board`, icon: 'chat', label: '메시지 보내기', variant: 'primary' },
  ]

  return (
    <SiteLayout actions={actions} pageClassName="page page--detail">
      <div className="page-container page-container--detail">
        <nav className="breadcrumb" aria-label="현재 위치">
          <Link className="breadcrumb__link" to="/">
            검색
          </Link>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <span>{member.districtShort}</span>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <strong>{member.name}</strong>
        </nav>

        <section className="panel panel--profile">
          <div className="panel__accent" />
          <div className="profile-hero">
            <Portrait member={member} />

            <div className="profile-hero__content">
              <div className="profile-hero__headline">
                <div>
                  <h1 className="profile-hero__name">{member.name}</h1>
                  <p className="profile-hero__district">{member.district}</p>
                </div>
                <span className={`party-badge party-badge--${member.party.tone}`}>
                  {member.party.name}
                </span>
              </div>

              <div className="profile-stat-grid">
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="user" />
                  <div>
                    <span className="profile-stat__label">나이</span>
                    <strong>{member.age}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="committee" />
                  <div>
                    <span className="profile-stat__label">당선 횟수</span>
                    <strong>{member.terms}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="calendar" />
                  <div>
                    <span className="profile-stat__label">재직 기간</span>
                    <strong>{member.tenure}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="inbox" />
                  <div>
                    <span className="profile-stat__label">대표 발의</span>
                    <strong>{member.bills}</strong>
                  </div>
                </article>
              </div>

              <div className="committee-row">
                {member.committees.map((committee) => (
                  <span key={committee} className="committee-pill">
                    {committee}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-cta">
            <p>{member.tagline}</p>
            <Link className="button button--primary button--wide" to={`/members/${member.id}/board`}>
              <Icon className="button__icon" name="send" />
              <span>의원에게 메시지 보내기</span>
              <Icon className="button__icon button__icon--trail" name="chevronRight" />
            </Link>
          </div>
        </section>

        <section className="panel">
          <SectionHeading icon="book" title="약력" />
          <p className="body-copy">{member.biography}</p>
        </section>

        <section className="panel">
          <SectionHeading
            actionLabel="전체 보기"
            actionTo={`/members/${member.id}/board`}
            badge={`${answeredPosts.length}건 답변 완료`}
            icon="chat"
            title="최근 답변"
          />

          <div className="qa-list">
            {answeredPosts.map((post) => (
              <article key={post.id} className="qa-card">
                <Link className="qa-card__question" to={`/members/${member.id}/board?post=${post.id}`}>
                  <span className="qa-card__mark qa-card__mark--question">Q</span>
                  <div className="qa-card__content">
                    <h3>{post.title}</h3>
                    <div className="meta-row">
                      <span>{post.author}</span>
                      <span className="meta-row__dot" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Icon className="qa-card__arrow" name="chevronRight" />
                </Link>

                <div className="qa-card__answer">
                  <span className="qa-card__mark qa-card__mark--answer">A</span>
                  <p>{post.answer}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeading icon="gavel" title="최근 입법 활동" />

          <div className="filter-row">
            {activityFilters.map((filter) => {
              const count =
                filter.id === 'all'
                  ? member.activities.length
                  : member.activities.filter((activity) => activity.filter === filter.id).length

              return (
                <button
                  key={filter.id}
                  className={`filter-chip ${activityFilter === filter.id ? 'is-active' : ''}`}
                  onClick={() => setActivityFilter(filter.id)}
                  type="button"
                >
                  {filter.label} {count}
                </button>
              )
            })}
          </div>

          <div className="activity-list">
            {visibleActivities.map((activity) => (
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
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeading caption={`${member.name} 관련 보도`} icon="newspaper" title="관련 최근 뉴스" />

          <ol className="news-list">
            {member.news.map((article, index) => (
              <li key={article.id} className="news-list__item">
                <span className="news-list__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="news-list__body">
                  <h3>{article.title}</h3>
                  <div className="meta-row">
                    <span className={`source-pill source-pill--${index % 4}`}>{article.source}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
                <Icon className="news-list__arrow" name="chevronRight" />
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <SectionHeading icon="mail" title="연락처" />

          <div className="contact-list">
            <ContactRow icon="mail" label="이메일" value={member.email} />
            <ContactRow icon="phone" label="전화" value={member.phone} />
            <ContactRow icon="building" label="사무실" value={member.office} />
          </div>
        </section>

        <section className="callout callout--cta">
          <div>
            <h2>하고 싶은 말씀이 있으신가요?</h2>
            <p>{member.name}에게 직접 의견을 전달하고 답변을 받아보세요.</p>
          </div>
          <Link className="button button--primary" to={`/members/${member.id}/board`}>
            <Icon className="button__icon" name="send" />
            <span>소통 게시판 바로가기</span>
          </Link>
        </section>
      </div>
    </SiteLayout>
  )
}

function SectionHeading({ title, icon, badge, caption, actionTo, actionLabel }) {
  return (
    <div className="section-heading">
      <div className="section-heading__main">
        <Icon className="section-heading__icon" name={icon} />
        <div className="section-heading__text">
          <h2>{title}</h2>
          {caption ? <span className="section-heading__caption">{caption}</span> : null}
        </div>
        {badge ? <span className="section-heading__badge">{badge}</span> : null}
      </div>

      {actionTo && actionLabel ? (
        <Link className="section-heading__action" to={actionTo}>
          <span>{actionLabel}</span>
          <Icon className="section-heading__action-icon" name="chevronRight" />
        </Link>
      ) : null}
    </div>
  )
}

function ContactRow({ icon, label, value }) {
  return (
    <div className="contact-row">
      <Icon className="contact-row__icon" name={icon} />
      <div>
        <span className="contact-row__label">{label}</span>
        <strong className="contact-row__value">{value}</strong>
      </div>
    </div>
  )
}
