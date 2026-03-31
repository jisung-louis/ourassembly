import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './CongressOpinionPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { Avatar, SiteLayout } from '../../components/Common/Layout.jsx'
import { createDraftPost, findMemberSupplementalData } from '../../data/mockData.js'
import { getCongressmanDetail } from '../../services/congress.js'

const boardFilters = [
  { id: 'all', label: '전체' },
  { id: 'answered', label: '답변 완료' },
  { id: 'reviewing', label: '검토 중' },
  { id: 'pending', label: '답변 대기' },
]

const partyToneRules = [
  { keywords: ['국민의힘', '국민의미래', '국민통합당', '보수'], theme: 'amber' },
  { keywords: ['더불어민주당', '더불어민주연합', '민주진보당', '민주', '진보'], theme: 'emerald' },
  { keywords: ['조국혁신당', '정의미래당', '조국', '혁신'], theme: 'violet' },
]

function getAvatarTheme(party = '') {
  const matchedRule = partyToneRules.find((rule) =>
    rule.keywords.some((keyword) => party.includes(keyword)),
  )

  return matchedRule?.theme ?? 'violet'
}

function getAvatarLabel(name = '') {
  const normalizedName = name.replace(/\s+/g, '').replace(/의원$/, '')
  return normalizedName.slice(0, 2) || '?'
}

function pickFirstFilledValue(...values) {
  return values.find((value) => typeof value === 'string' && value.trim()) ?? ''
}

function buildBoardMember(detail, supplementalMember, memberId) {
  const name = pickFirstFilledValue(detail?.name, supplementalMember?.name, '이름 미상')
  const party = pickFirstFilledValue(detail?.party, supplementalMember?.party?.name)
  const district = pickFirstFilledValue(
    detail?.ward,
    supplementalMember?.district,
    supplementalMember?.districtShort,
  )

  return {
    id: memberId,
    name,
    district,
    photoUrl: pickFirstFilledValue(detail?.photoUrl),
    theme: getAvatarTheme(party),
    avatarLabel: getAvatarLabel(name),
    responseCount: supplementalMember?.responseCount ?? 0,
    boardPosts: Array.isArray(supplementalMember?.boardPosts) ? supplementalMember.boardPosts : [],
  }
}

export function CongressOpinionPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [boardFilter, setBoardFilter] = useState('all')
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [expandedPostId, setExpandedPostId] = useState(searchParams.get('post') ?? '')

  useEffect(() => {
    let ignore = false

    async function loadBoardMember() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const detail = await getCongressmanDetail(memberId)

        if (!ignore) {
          const supplementalMember = findMemberSupplementalData({
            id: memberId,
            name: detail?.name,
            ward: detail?.ward,
          })
          setMember(buildBoardMember(detail, supplementalMember, memberId))
        }
      } catch (error) {
        if (!ignore) {
          const supplementalMember = findMemberSupplementalData({ id: memberId })

          if (supplementalMember) {
            setMember(buildBoardMember(null, supplementalMember, memberId))
          } else {
            setMember(null)
            setErrorMessage(error.message)
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadBoardMember()

    return () => {
      ignore = true
    }
  }, [memberId])

  useEffect(() => {
    setExpandedPostId(searchParams.get('post') ?? '')
  }, [searchParams])

  const actions = [
    { to: '/', icon: 'arrowLeft', label: '검색으로 돌아가기' },
    { to: `/members/${memberId}`, icon: 'user', label: '프로필 보기' },
  ]

  if (isLoading) {
    return (
      <SiteLayout actions={actions} pageClassName="page page--board">
        <div className="page-container page-container--board">
          <section className="panel">
            <p className="body-copy">소통 게시판 정보를 불러오는 중입니다.</p>
          </section>
        </div>
      </SiteLayout>
    )
  }

  if (!member || errorMessage) {
    return (
      <SiteLayout actions={actions} pageClassName="page page--board">
        <div className="page-container page-container--board">
          <section className="panel">
            <p className="body-copy">{errorMessage || '소통 게시판 정보를 찾지 못했습니다.'}</p>
          </section>
        </div>
      </SiteLayout>
    )
  }

  const submittedPost = location.state?.submission ?? null
  const posts = submittedPost ? [submittedPost, ...member.boardPosts] : member.boardPosts
  const filteredPosts =
    boardFilter === 'all' ? posts : posts.filter((post) => post.status === boardFilter)
  const isSent = searchParams.get('sent') === '1'

  const handleSendMessage = (event) => {
    event.preventDefault()

    if (!draft.title.trim() || !draft.body.trim()) {
      return
    }

    navigate(`/members/${memberId}/board?sent=1`, {
      replace: true,
      state: {
        submission: createDraftPost(draft.title.trim(), draft.body.trim()),
      },
    })
  }

  const handleResetComposer = () => {
    setDraft({ title: '', body: '' })
    navigate(`/members/${memberId}/board`, { replace: true })
  }

  return (
    <SiteLayout actions={actions} pageClassName="page page--board">
      <div className="page-container page-container--board">
        <nav className="breadcrumb" aria-label="현재 위치">
          <Link className="breadcrumb__link" to="/">
            검색
          </Link>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <Link className="breadcrumb__link" to={`/members/${memberId}`}>
            {member.name}
          </Link>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <strong>소통 게시판</strong>
        </nav>

        <section className="panel panel--board-hero">
          <div className="board-hero">
            <div className="board-hero__profile">
              <Avatar member={member} size="lg" square />
              <div>
                <h1>국회의원과 소통하기</h1>
                <p>
                  <strong>{member.name}</strong>에게 메시지를 보내세요 · {member.district}
                </p>
              </div>
            </div>

            <div className="board-hero__status">
              <span className="status-pill status-pill--answered">
                <Icon className="status-pill__icon" name="checkCircle" />
                활동 중
              </span>
              <span className="board-hero__count">답변 완료 {member.responseCount}건</span>
            </div>
          </div>
        </section>

        <section className="panel panel--composer">
          <div className="section-heading">
            <div className="section-heading__main">
              <Icon className="section-heading__icon" name="send" />
              <div className="section-heading__text">
                <h2>메시지 작성</h2>
              </div>
            </div>
          </div>

          {isSent ? (
            <div className="composer-success">
              <div className="composer-success__icon-wrap">
                <Icon className="composer-success__icon" name="checkCircle" />
              </div>
              <div className="composer-success__body">
                <h3>메시지가 전달되었어요!</h3>
                <p>{member.name}에게 메시지가 접수되었습니다. 답변이 등록되면 게시판에 업데이트됩니다.</p>
              </div>
              <button className="button button--text" onClick={handleResetComposer} type="button">
                다른 메시지 보내기
              </button>
            </div>
          ) : (
            <form className="composer-form" onSubmit={handleSendMessage}>
              <label className="field-label field-label--required" htmlFor="message-title">
                제목 / 주제
              </label>
              <input
                id="message-title"
                className="composer-input"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="예) 골목길 보행 안전 시설 설치를 요청합니다"
                type="text"
                value={draft.title}
              />

              <label className="field-label field-label--required" htmlFor="message-body">
                내용
              </label>
              <div className="composer-textarea-wrap">
                <textarea
                  id="message-body"
                  className="composer-textarea"
                  maxLength={500}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  placeholder="건의사항, 지역 현안, 질문 등을 자세히 작성해 주세요..."
                  value={draft.body}
                />
                <span className="composer-counter">{draft.body.length}/500</span>
              </div>

              <div className="composer-note">
                <Icon className="composer-note__icon" name="clock" />
                <span>게시된 내용은 모든 시민에게 공개됩니다. 개인정보 및 민감한 내용은 포함하지 마세요.</span>
              </div>

              <button
                className={`button button--primary button--block ${draft.title && draft.body ? '' : 'is-disabled'}`}
                disabled={!draft.title.trim() || !draft.body.trim()}
                type="submit"
              >
                <Icon className="button__icon" name="send" />
                <span>메시지 보내기</span>
              </button>
            </form>
          )}
        </section>

        <section className="board-section">
          <div className="board-section__head">
            <div className="board-section__title-group">
              <div className="section-heading section-heading--compact">
                <div className="section-heading__main">
                  <Icon className="section-heading__icon" name="chat" />
                  <div className="section-heading__text">
                    <h2>소통 게시판</h2>
                  </div>
                </div>
              </div>
              <span className="board-section__count">{posts.length}건</span>
            </div>

            <div className="filter-row filter-row--compact">
              {boardFilters.map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-chip filter-chip--soft ${boardFilter === filter.id ? 'is-active' : ''}`}
                  onClick={() => setBoardFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="board-section__note">
            <Icon className="board-section__note-icon" name="checkCircle" />
            <span>답변 완료 게시글은 클릭하면 의원의 답변을 확인할 수 있습니다.</span>
          </div>

          <div className="board-post-list">
            {filteredPosts.map((post) => {
              const isExpanded = expandedPostId === post.id

              return (
                <article key={post.id} className="board-post-card">
                  <div className="board-post-card__top">
                    <div className="board-post-card__title-wrap">
                      <Icon className="board-post-card__chevron" name="chevronRight" />
                      <div>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                      </div>
                    </div>

                    <div className="board-post-card__actions">
                      <span className={`status-pill status-pill--${post.status}`}>
                        <Icon
                          className="status-pill__icon"
                          name={post.status === 'answered' ? 'checkCircle' : 'clock'}
                        />
                        {statusLabel(post.status)}
                      </span>
                    </div>
                  </div>

                  <div className="board-post-card__meta">
                    <div className="meta-row">
                      <Icon className="meta-row__icon" name="user" />
                      <span>{post.author}</span>
                    </div>
                    <div className="meta-row">
                      <Icon className="meta-row__icon" name="calendar" />
                      <span>{post.date}</span>
                    </div>

                    {post.status === 'answered' ? (
                      <button
                        className="text-action"
                        onClick={() => setExpandedPostId(isExpanded ? '' : post.id)}
                        type="button"
                      >
                        <Icon className="text-action__icon" name="chat" />
                        <span>{isExpanded ? '답변 숨기기' : '답변 보기'}</span>
                      </button>
                    ) : null}
                  </div>

                  {post.status === 'answered' && isExpanded ? (
                    <div className="board-post-card__answer">
                      <div className="board-post-card__answer-head">
                        <span className="qa-card__mark qa-card__mark--answer">A</span>
                        <strong>{member.name}</strong>
                      </div>
                      <p>{post.answer}</p>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}

function statusLabel(status) {
  if (status === 'answered') {
    return '답변 완료'
  }

  if (status === 'reviewing') {
    return '검토 중'
  }

  return '답변 대기'
}
