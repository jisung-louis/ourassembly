import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './CongressOpinionPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { Avatar, SiteLayout } from '../../components/Common/Layout.jsx'
import { findMemberSupplementalData } from '../../data/mockData.js'
import { getStoredAuthUser } from '../../services/auth.js'
import { getCongressmanDetail } from '../../services/congress.js'
import {
  createAnswer,
  createOpinion,
  deleteAnswer,
  getCongressmanOpinions,
  updateAnswer,
} from '../../services/opinion.js'

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
  }
}

function formatBoardDate(value) {
  if (!value) {
    return '날짜 정보 없음'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '날짜 정보 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function normalizeBoardStatus(status = '', answer = null) {
  const normalized = status.trim()

  if (answer?.content) {
    return 'answered'
  }

  if (normalized === 'answered' || normalized === '답변완료') {
    return 'answered'
  }

  if (normalized === 'reviewing' || normalized === '검토중' || normalized === '검토 중') {
    return 'reviewing'
  }

  return 'pending'
}

function mapBoardAnswer(answer) {
  if (!answer?.content) {
    return null
  }

  return {
    id: String(answer.id),
    author: answer.name ?? '답변자',
    content: answer.content,
    createdAt: answer.createdAt ?? '',
    date: formatBoardDate(answer.createdAt),
    isDirect: Boolean(answer.isDirect),
  }
}

function mapOpinionToBoardPost(opinion) {
  const answer = mapBoardAnswer(opinion.answer)

  return {
    id: String(opinion.id),
    title: opinion.title ?? '제목 없음',
    excerpt: opinion.content ?? '',
    author: opinion.name ?? '익명',
    date: formatBoardDate(opinion.createdAt),
    status: normalizeBoardStatus(opinion.status, answer),
    answer,
  }
}

function applyAnswerToPosts(posts, postId, answer) {
  return posts.map((post) =>
    post.id === String(postId)
      ? {
          ...post,
          status: 'answered',
          answer: mapBoardAnswer(answer),
        }
      : post,
  )
}

function removeAnswerFromPosts(posts, postId) {
  return posts.map((post) =>
    post.id === String(postId)
      ? {
          ...post,
          status: 'pending',
          answer: null,
        }
      : post,
  )
}

export function CongressOpinionPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentUser = getStoredAuthUser()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [boardFilter, setBoardFilter] = useState('all')
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [expandedPostId, setExpandedPostId] = useState(searchParams.get('post') ?? '')
  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [boardErrorMessage, setBoardErrorMessage] = useState('')
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [answerEditor, setAnswerEditor] = useState(null)
  const [answerErrorMessage, setAnswerErrorMessage] = useState('')
  const [answerErrorPostId, setAnswerErrorPostId] = useState('')
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const [deletingAnswerId, setDeletingAnswerId] = useState('')

  const isOwnBoard =
    currentUser?.role === 'congress' && Number(currentUser?.congressmanId) === Number(memberId)
  const headerGreeting = currentUser ? `${currentUser.name ?? '사용자'}님 환영합니다` : ''

  useEffect(() => {
    setAnswerEditor(null)
    setAnswerErrorMessage('')
    setAnswerErrorPostId('')
    setDeletingAnswerId('')
  }, [memberId])

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

  useEffect(() => {
    let ignore = false

    async function loadOpinions() {
      setIsLoadingPosts(true)
      setBoardErrorMessage('')

      try {
        const opinions = await getCongressmanOpinions(memberId)

        if (!ignore) {
          setPosts(opinions.map(mapOpinionToBoardPost))
        }
      } catch (error) {
        if (!ignore) {
          setPosts([])
          setBoardErrorMessage(error.message)
        }
      } finally {
        if (!ignore) {
          setIsLoadingPosts(false)
        }
      }
    }

    loadOpinions()

    return () => {
      ignore = true
    }
  }, [memberId])

  const actions = [
    { to: '/', icon: 'arrowLeft', label: '검색으로 돌아가기' },
    { to: `/members/${memberId}`, icon: 'user', label: '프로필 보기' },
  ]

  if (isLoading) {
    return (
      <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page page--board">
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
      <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page page--board">
        <div className="page-container page-container--board">
          <section className="panel">
            <p className="body-copy">{errorMessage || '소통 게시판 정보를 찾지 못했습니다.'}</p>
          </section>
        </div>
      </SiteLayout>
    )
  }

  const submittedPost = location.state?.submission ?? null
  const visiblePosts = submittedPost ? [submittedPost, ...posts] : posts
  const filteredPosts =
    boardFilter === 'all' ? visiblePosts : visiblePosts.filter((post) => post.status === boardFilter)
  const answeredCount = posts.filter((post) => post.status === 'answered').length
  const isSent = searchParams.get('sent') === '1'
  const boardHeroTitle = isOwnBoard ? '내 의견함' : '국회의원과 소통하기'
  const boardHeroDescription = isOwnBoard
    ? '에게 전달된 시민 의견을 확인하고 답변을 남겨보세요.'
    : `에게 메시지를 보내세요 · ${member.district}`

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!draft.title.trim() || !draft.body.trim()) {
      return
    }

    setSubmitErrorMessage('')

    try {
      const createdOpinion = await createOpinion({
        congressmanId: Number(memberId),
        title: draft.title.trim(),
        content: draft.body.trim(),
      })

      navigate(`/members/${memberId}/board?sent=1`, {
        replace: true,
        state: {
          submission: mapOpinionToBoardPost(createdOpinion),
        },
      })
    } catch (error) {
      setSubmitErrorMessage(error.message)
    }
  }

  const handleResetComposer = () => {
    setDraft({ title: '', body: '' })
    setSubmitErrorMessage('')
    navigate(`/members/${memberId}/board`, { replace: true })
  }

  const openAnswerEditor = (post, mode) => {
    setExpandedPostId(post.id)
    setAnswerErrorMessage('')
    setAnswerErrorPostId(post.id)
    setAnswerEditor({
      answerId: mode === 'edit' ? post.answer?.id ?? '' : '',
      content: mode === 'edit' ? post.answer?.content ?? '' : '',
      isDirect: mode === 'edit' ? Boolean(post.answer?.isDirect) : true,
      mode,
      postId: post.id,
    })
  }

  const closeAnswerEditor = () => {
    if (answerEditor?.mode === 'create') {
      setExpandedPostId('')
    }

    setAnswerEditor(null)
    setAnswerErrorMessage('')
    setAnswerErrorPostId('')
  }

  const handleAnswerSubmit = async (event) => {
    event.preventDefault()

    if (!answerEditor?.content.trim()) {
      return
    }

    setIsSavingAnswer(true)
    setAnswerErrorMessage('')
    setAnswerErrorPostId(answerEditor.postId)

    try {
      const savedAnswer =
        answerEditor.mode === 'edit'
          ? await updateAnswer({
              answerId: Number(answerEditor.answerId),
              content: answerEditor.content.trim(),
              isDirect: answerEditor.isDirect,
            })
          : await createAnswer({
              opinionId: Number(answerEditor.postId),
              content: answerEditor.content.trim(),
              isDirect: answerEditor.isDirect,
            })

      setPosts((currentPosts) => applyAnswerToPosts(currentPosts, answerEditor.postId, savedAnswer))
      setAnswerEditor(null)
      setAnswerErrorMessage('')
      setAnswerErrorPostId('')
      setExpandedPostId('')
    } catch (error) {
      setAnswerErrorMessage(error.message)
    } finally {
      setIsSavingAnswer(false)
    }
  }

  const handleAnswerDelete = async (post) => {
    if (!post.answer?.id) {
      return
    }

    const shouldDelete = window.confirm('등록한 답변을 삭제하시겠습니까?')

    if (!shouldDelete) {
      return
    }

    setDeletingAnswerId(post.answer.id)
    setAnswerErrorMessage('')
    setAnswerErrorPostId(post.id)

    try {
      await deleteAnswer(Number(post.answer.id))
      setPosts((currentPosts) => removeAnswerFromPosts(currentPosts, post.id))

      if (answerEditor?.postId === post.id) {
        setAnswerEditor(null)
      }

      setAnswerErrorMessage('')
      setAnswerErrorPostId('')
    } catch (error) {
      setAnswerErrorMessage(error.message)
    } finally {
      setDeletingAnswerId('')
    }
  }

  return (
    <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page page--board">
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
                <h1>{boardHeroTitle}</h1>
                <p>
                  <strong>{member.name}</strong> {boardHeroDescription}
                </p>
              </div>
            </div>

            <div className="board-hero__status">
              <span className="status-pill status-pill--answered">
                <Icon className="status-pill__icon" name="checkCircle" />
                활동 중
              </span>
              <span className="board-hero__count">답변 완료 {answeredCount}건</span>
            </div>
          </div>
        </section>

        {!isOwnBoard ? (
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

                {submitErrorMessage ? (
                  <p className="board-form__feedback board-form__feedback--error">{submitErrorMessage}</p>
                ) : null}

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
        ) : null}

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
              <span className="board-section__count">{visiblePosts.length}건</span>
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
            <span>
              {isOwnBoard
                ? '답변 대기 게시글에는 바로 답변을 달 수 있고, 등록한 답변은 수정하거나 삭제할 수 있습니다.'
                : '답변 완료 게시글은 클릭하면 의원의 답변을 확인할 수 있습니다.'}
            </span>
          </div>

          {isLoadingPosts ? (
            <section className="panel">
              <p className="body-copy">게시글 목록을 불러오는 중입니다.</p>
            </section>
          ) : boardErrorMessage ? (
            <section className="panel">
              <p className="body-copy">{boardErrorMessage}</p>
            </section>
          ) : filteredPosts.length === 0 ? (
            <section className="panel">
              <p className="body-copy">아직 등록된 게시글이 없습니다.</p>
            </section>
          ) : (
            <div className="board-post-list">
              {filteredPosts.map((post) => {
                const hasAnswer = Boolean(post.answer?.content)
                const isExpanded = expandedPostId === post.id
                const isEditingAnswer =
                  answerEditor?.postId === post.id && answerEditor.mode === 'edit'
                const isCreatingAnswer =
                  answerEditor?.postId === post.id && answerEditor.mode === 'create'
                const shouldShowPublicAnswer = !isOwnBoard && hasAnswer && isExpanded
                const shouldShowOwnedAnswer = isOwnBoard && hasAnswer && !isEditingAnswer
                const shouldShowAnswerForm = isCreatingAnswer || isEditingAnswer

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

                      {isOwnBoard && !hasAnswer ? (
                        <button
                          className="text-action"
                          onClick={() => (isCreatingAnswer ? closeAnswerEditor() : openAnswerEditor(post, 'create'))}
                          type="button"
                        >
                          <Icon className="text-action__icon" name="chat" />
                          <span>{isCreatingAnswer ? '작성 취소' : '답변하기'}</span>
                        </button>
                      ) : null}

                      {!isOwnBoard && hasAnswer ? (
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

                    {shouldShowAnswerForm ? (
                      <div className="board-post-card__answer">
                        <form className="answer-form" onSubmit={handleAnswerSubmit}>
                          <div className="board-post-card__answer-head">
                            <div className="board-post-card__answer-author">
                              <span className="qa-card__mark qa-card__mark--answer">A</span>
                              <strong>{isEditingAnswer ? '답변 수정' : '답변 작성'}</strong>
                            </div>
                          </div>

                          <label className="field-label field-label--required" htmlFor={`answer-body-${post.id}`}>
                            답변 내용
                          </label>
                          <div className="composer-textarea-wrap">
                            <textarea
                              id={`answer-body-${post.id}`}
                              className="composer-textarea answer-form__textarea"
                              maxLength={500}
                              onChange={(event) =>
                                setAnswerEditor((current) =>
                                  current
                                    ? {
                                        ...current,
                                        content: event.target.value,
                                      }
                                    : current,
                                )
                              }
                              placeholder="시민 의견에 대한 답변을 작성해 주세요."
                              value={answerEditor?.postId === post.id ? answerEditor.content : ''}
                            />
                            <span className="composer-counter">
                              {answerEditor?.postId === post.id ? answerEditor.content.length : 0}/500
                            </span>
                          </div>

                          <label className="answer-form__checkbox">
                            <input
                              checked={answerEditor?.postId === post.id ? answerEditor.isDirect : false}
                              onChange={(event) =>
                                setAnswerEditor((current) =>
                                  current
                                    ? {
                                        ...current,
                                        isDirect: event.target.checked,
                                      }
                                    : current,
                                )
                              }
                              type="checkbox"
                            />
                            <span>국회의원이 직접 답변했습니다</span>
                          </label>

                          {answerErrorMessage && answerErrorPostId === post.id ? (
                            <p className="board-form__feedback board-form__feedback--error">{answerErrorMessage}</p>
                          ) : null}

                          <div className="answer-form__actions">
                            <button
                              className="button button--primary"
                              disabled={!answerEditor?.content.trim() || isSavingAnswer}
                              type="submit"
                            >
                              <span>{isSavingAnswer ? '저장 중...' : isEditingAnswer ? '답변 수정' : '답변 등록'}</span>
                            </button>
                            <button className="button button--text" onClick={closeAnswerEditor} type="button">
                              <span>취소</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}

                    {shouldShowOwnedAnswer || shouldShowPublicAnswer ? (
                      <div className="board-post-card__answer">
                        <div className="board-post-card__answer-head">
                          <div className="board-post-card__answer-author">
                            <span className="qa-card__mark qa-card__mark--answer">A</span>
                            <strong>{post.answer?.author ?? member.name}</strong>
                            <span className={`answer-author-pill ${post.answer?.isDirect ? 'is-direct' : 'is-staff'}`}>
                              {post.answer?.isDirect ? '의원 직접 답변' : '의원실 작성'}
                            </span>
                          </div>
                          <span className="board-post-card__answer-date">{post.answer?.date}</span>
                        </div>

                        <p>{post.answer?.content}</p>

                        {isOwnBoard ? (
                          <div className="board-post-card__answer-controls">
                            <button className="text-action" onClick={() => openAnswerEditor(post, 'edit')} type="button">
                              <span>수정하기</span>
                            </button>
                            <button
                              className="text-action text-action--danger"
                              disabled={deletingAnswerId === post.answer?.id}
                              onClick={() => handleAnswerDelete(post)}
                              type="button"
                            >
                              <span>{deletingAnswerId === post.answer?.id ? '삭제 중...' : '삭제하기'}</span>
                            </button>
                          </div>
                        ) : null}

                        {answerErrorMessage && answerErrorPostId === post.id ? (
                          <p className="board-form__feedback board-form__feedback--error">{answerErrorMessage}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
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
