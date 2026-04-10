import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './CongressOpinionPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { Avatar, SiteLayout } from '../../components/Common/Layout.jsx'
import { findMemberSupplementalData } from '../../data/mockData.js'
import { getStoredAuthUser } from '../../services/auth.js'
import { getCongressmanDetail } from '../../services/congress.js'
import {
  checkSimilarOpinion,
  createAnswer,
  createClusterAnswer,
  createOpinion,
  deleteClusterAnswer,
  deleteAnswer,
  getClusterOpinions,
  getCongressmanOpinions,
  updateClusterAnswer,
  updateAnswer,
} from '../../services/opinion.js'

const OPINION_PAGE_SIZE = 5

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

function mapOpinionToBoardPost(opinion, sectionKey) {
  const answer = mapBoardAnswer(opinion.answer)

  return {
    uiKey: `${sectionKey}:OPINION:${opinion.id}`,
    type: 'OPINION',
    id: String(opinion.id),
    title: opinion.title ?? '제목 없음',
    excerpt: opinion.content ?? '',
    author: opinion.name ?? '익명',
    date: formatBoardDate(opinion.createdAt),
    status: normalizeBoardStatus(opinion.status, answer),
    answer,
  }
}

function mapClusterToBoardPost(cluster, sectionKey) {
  const answer = mapBoardAnswer(cluster.answer)

  return {
    uiKey: `${sectionKey}:CLUSTER:${cluster.id}`,
    type: 'CLUSTER',
    id: String(cluster.id),
    title: cluster.title ?? '관련 의견 묶음',
    excerpt: cluster.content ?? '',
    author: '',
    date: formatBoardDate(cluster.createdAt),
    status: normalizeBoardStatus(cluster.status, answer),
    answer,
    opinionCount: typeof cluster.opinionCount === 'number' ? cluster.opinionCount : 0,
  }
}

function mapBoardItem(item, sectionKey) {
  return item?.type === 'CLUSTER'
    ? mapClusterToBoardPost(item, sectionKey)
    : mapOpinionToBoardPost(item, sectionKey)
}

function mapBoardItems(items, sectionKey) {
  return Array.isArray(items) ? items.map((item) => mapBoardItem(item, sectionKey)) : []
}

function filterPosts(posts, boardFilter) {
  return boardFilter === 'all' ? posts : posts.filter((post) => post.status === boardFilter)
}

function paginatePosts(posts, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const start = currentPage * pageSize

  return {
    totalPages,
    currentPage,
    items: posts.slice(start, start + pageSize),
  }
}

function formatDaysAgo(daysAgo) {
  if (daysAgo <= 0) {
    return '오늘'
  }

  return `${daysAgo}일 전`
}

function buildBoardNote(isOwnBoard, boardMode) {
  if (isOwnBoard && boardMode === 'CLUSTER') {
    return '클러스터 카드에 답변을 달면 해당 묶음 전체 의견에 답변 상태가 반영됩니다.'
  }

  if (isOwnBoard) {
    return '답변 대기 게시글에는 바로 답변을 달 수 있고, 등록한 답변은 수정하거나 삭제할 수 있습니다.'
  }

  if (boardMode === 'CLUSTER') {
    return '비슷한 의견을 묶어서 보여줍니다. 답변 완료 카드에서 의원 답변을 확인할 수 있습니다.'
  }

  return '답변 완료 게시글은 클릭하면 의원의 답변을 확인할 수 있습니다.'
}

export function CongressOpinionPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentUser = getStoredAuthUser()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [boardFilter, setBoardFilter] = useState('all')
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [expandedPostKey, setExpandedPostKey] = useState('')
  const [boardSections, setBoardSections] = useState({
    clusterPosts: [],
    opinionPosts: [],
    myOpinionPosts: [],
  })
  const [opinionPage, setOpinionPage] = useState(0)
  const [myOpinionPage, setMyOpinionPage] = useState(0)
  const [clusterOpinionPages, setClusterOpinionPages] = useState({})
  const [boardMode, setBoardMode] = useState('LIST')
  const [isBoardUpdating, setIsBoardUpdating] = useState(false)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [boardErrorMessage, setBoardErrorMessage] = useState('')
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [answerEditor, setAnswerEditor] = useState(null)
  const [answerErrorMessage, setAnswerErrorMessage] = useState('')
  const [answerErrorPostId, setAnswerErrorPostId] = useState('')
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const [deletingAnswerId, setDeletingAnswerId] = useState('')
  const [similarOpinionModal, setSimilarOpinionModal] = useState({
    open: false,
    showAnswer: false,
    isSubmitting: false,
    data: null,
    draft: null,
  })

  const isOwnBoard =
    currentUser?.role === 'congress' && currentUser?.congressmanId === memberId
  const headerGreeting = currentUser ? `${currentUser.name ?? '사용자'}님 환영합니다` : ''

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAnswerEditor(null)
    setAnswerErrorMessage('')
    setAnswerErrorPostId('')
    setDeletingAnswerId('')
    setExpandedPostKey('')
    setClusterOpinionPages({})
    setOpinionPage(0)
    setMyOpinionPage(0)
    setSimilarOpinionModal({
      open: false,
      showAnswer: false,
      isSubmitting: false,
      data: null,
      draft: null,
    })
  }, [memberId])

  useEffect(() => {
    setOpinionPage(0)
    setMyOpinionPage(0)
  }, [boardFilter])

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
    let ignore = false

    async function loadOpinions() {
      setIsLoadingPosts(true)
      setBoardErrorMessage('')

      try {
        const board = await getCongressmanOpinions(memberId)

        if (!ignore) {
          setBoardMode(board.boardMode)
          setIsBoardUpdating(board.updating)
          setBoardSections({
            clusterPosts: mapBoardItems(board.clusterItems, 'board-cluster'),
            opinionPosts: mapBoardItems(board.opinionItems, 'board-opinion'),
            myOpinionPosts: mapBoardItems(board.myOpinionItems, 'my-opinion'),
          })
          setClusterOpinionPages({})
        }
      } catch (error) {
        if (!ignore) {
          setBoardMode('LIST')
          setIsBoardUpdating(false)
          setBoardSections({
            clusterPosts: [],
            opinionPosts: [],
            myOpinionPosts: [],
          })
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

  const refreshBoard = async () => {
    const board = await getCongressmanOpinions(memberId)
    setBoardMode(board.boardMode)
    setIsBoardUpdating(board.updating)
    setBoardSections({
      clusterPosts: mapBoardItems(board.clusterItems, 'board-cluster'),
      opinionPosts: mapBoardItems(board.opinionItems, 'board-opinion'),
      myOpinionPosts: mapBoardItems(board.myOpinionItems, 'my-opinion'),
    })
    setClusterOpinionPages({})
  }

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

  const clusterPosts = boardSections.clusterPosts
  const opinionPosts = boardSections.opinionPosts
  const myOpinionPosts = boardSections.myOpinionPosts
  const filteredClusterPosts = filterPosts(clusterPosts, boardFilter)
  const filteredOpinionPosts = filterPosts(opinionPosts, boardFilter)
  const filteredMyOpinionPosts = filterPosts(myOpinionPosts, boardFilter)
  const pagedOpinionPosts = paginatePosts(filteredOpinionPosts, opinionPage, OPINION_PAGE_SIZE)
  const pagedMyOpinionPosts = paginatePosts(filteredMyOpinionPosts, myOpinionPage, OPINION_PAGE_SIZE)
  const answeredCount = [...clusterPosts, ...opinionPosts].filter((post) => post.status === 'answered').length
  const shouldShowMyOpinionSection = !isOwnBoard && Boolean(currentUser)
  const isSent = searchParams.get('sent') === '1'
  const boardHeroTitle = isOwnBoard ? '내 의견함' : '국회의원과 소통하기'
  const boardHeroDescription = isOwnBoard
    ? '에게 전달된 시민 의견을 확인하고 답변을 남겨보세요.'
    : `에게 메시지를 보내세요 · ${member.district}`

  const closeSimilarOpinionModal = (force = false) => {
    if (!force && similarOpinionModal.isSubmitting) {
      return
    }

    setSimilarOpinionModal({
      open: false,
      showAnswer: false,
      isSubmitting: false,
      data: null,
      draft: null,
    })
  }

  const submitOpinionDraft = async (opinionDraft) => {
    await createOpinion({
      congressmanId: memberId,
      title: opinionDraft.title.trim(),
      content: opinionDraft.body.trim(),
    })

    await refreshBoard()
    setLoading(false);

    navigate(`/members/${memberId}/board?sent=1`, {
      replace: true,
    })

    setDraft({ title: '', body: '' })
  }

  const loadClusterOpinionPage = async (clusterId, page = 0) => {
    setClusterOpinionPages((current) => ({
      ...current,
      [clusterId]: {
        ...(current[clusterId] ?? {}),
        isLoading: true,
        error: '',
      },
    }))

    try {
      const clusterPage = await getClusterOpinions({ clusterId, page, size: 5 })

      setClusterOpinionPages((current) => ({
        ...current,
        [clusterId]: {
          ...clusterPage,
          isLoading: false,
          error: '',
          items: mapBoardItems(clusterPage.items, `cluster-detail:${clusterId}:page:${clusterPage.page}`),
        },
      }))
    } catch (error) {
      setClusterOpinionPages((current) => ({
        ...current,
        [clusterId]: {
          ...(current[clusterId] ?? {}),
          isLoading: false,
          error: error.message,
          items: current[clusterId]?.items ?? [],
        },
      }))
    }
  }

  const toggleClusterDetails = async (post) => {
    const nextExpandedKey = expandedPostKey === post.uiKey ? '' : post.uiKey
    setExpandedPostKey(nextExpandedKey)

    if (nextExpandedKey && !clusterOpinionPages[post.id]) {
      await loadClusterOpinionPage(Number(post.id), 0)
    }
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!draft.title.trim() || !draft.body.trim()) {
      return
    }

    setSubmitErrorMessage('')

    try {
      setLoading(true);
      const nextDraft = {
        title: draft.title.trim(),
        body: draft.body.trim(),
      }

      const similarityResult = await checkSimilarOpinion({
        congressmanId: memberId,
        title: nextDraft.title,
        content: nextDraft.body,
      })

      if (similarityResult.matched) {
        setSimilarOpinionModal({
          open: true,
          showAnswer: false,
          isSubmitting: false,
          data: similarityResult,
          draft: nextDraft,
        })
        setLoading(false);
        return
      }

      await submitOpinionDraft(nextDraft)
    } catch (error) {
      setSubmitErrorMessage(error.message)
      setLoading(false);
    }
  }

  const handleResetComposer = () => {
    setDraft({ title: '', body: '' })
    setSubmitErrorMessage('')
    navigate(`/members/${memberId}/board`, { replace: true })
  }

  const handleSubmitDespiteSimilarity = async () => {
    if (!similarOpinionModal.draft) {
      return
    }

    setSimilarOpinionModal((current) => ({
      ...current,
      isSubmitting: true,
    }))

    try {
      await submitOpinionDraft(similarOpinionModal.draft)
      closeSimilarOpinionModal(true)
    } catch (error) {
      setSubmitErrorMessage(error.message)
      setSimilarOpinionModal((current) => ({
        ...current,
        isSubmitting: false,
      }))
    }
  }

  const openAnswerEditor = (post, mode) => {
    setExpandedPostKey(post.uiKey)
    setAnswerErrorMessage('')
    setAnswerErrorPostId(post.id)
    setAnswerEditor({
      answerId: mode === 'edit' ? post.answer?.id ?? '' : '',
      content: mode === 'edit' ? post.answer?.content ?? '' : '',
      isDirect: mode === 'edit' ? Boolean(post.answer?.isDirect) : true,
      mode,
      postId: post.id,
      postType: post.type,
    })
  }

  const closeAnswerEditor = () => {
    if (answerEditor?.mode === 'create') {
      setExpandedPostKey('')
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
      if (answerEditor.mode === 'edit') {
        if (answerEditor.postType === 'CLUSTER') {
          await updateClusterAnswer({
            answerId: Number(answerEditor.answerId),
            content: answerEditor.content.trim(),
            isDirect: answerEditor.isDirect,
          })
        } else {
          await updateAnswer({
            answerId: Number(answerEditor.answerId),
            content: answerEditor.content.trim(),
            isDirect: answerEditor.isDirect,
          })
        }
      } else if (answerEditor.postType === 'CLUSTER') {
        await createClusterAnswer({
          clusterId: Number(answerEditor.postId),
          content: answerEditor.content.trim(),
          isDirect: answerEditor.isDirect,
        })
      } else {
        await createAnswer({
          opinionId: Number(answerEditor.postId),
          content: answerEditor.content.trim(),
          isDirect: answerEditor.isDirect,
        })
      }

      await refreshBoard()
      setAnswerEditor(null)
      setAnswerErrorMessage('')
      setAnswerErrorPostId('')
      setExpandedPostKey('')
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
      if (post.type === 'CLUSTER') {
        await deleteClusterAnswer(Number(post.answer.id))
      } else {
        await deleteAnswer(Number(post.answer.id))
      }
      await refreshBoard()

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

  const renderClusterDetail = (post, isExpanded) => {
    if (post.type !== 'CLUSTER' || !isExpanded) {
      return null
    }

    const clusterDetail = clusterOpinionPages[post.id]

    return (
      <div className="cluster-detail">
        <div className="cluster-detail__head">
          <strong>이 묶음에 포함된 개별 의견</strong>
          <span>{clusterDetail?.totalCount ?? post.opinionCount ?? 0}건</span>
        </div>

        {clusterDetail?.isLoading ? (
          <p className="cluster-detail__feedback">개별 의견을 불러오는 중입니다.</p>
        ) : clusterDetail?.error ? (
          <p className="board-form__feedback board-form__feedback--error">{clusterDetail.error}</p>
        ) : !clusterDetail?.items?.length ? (
          <p className="cluster-detail__feedback">묶인 개별 의견이 없습니다.</p>
        ) : (
          <>
            <div className="cluster-detail__list">
              {clusterDetail.items.map((item) => (
                <article key={item.uiKey} className="cluster-detail__item">
                  <div className="cluster-detail__item-head">
                    <strong>{item.title}</strong>
                    <span>{item.date}</span>
                  </div>
                  <p className="cluster-detail__item-content">{item.excerpt}</p>
                  <div className="cluster-detail__item-meta">
                    <span>{item.author}</span>
                    <span>{statusLabel(item.status)}</span>
                  </div>
                  {item.answer?.content ? (
                    <div className="cluster-detail__item-answer">
                      <div className="cluster-detail__item-answer-head">
                        <strong>{item.answer.author ?? member.name}</strong>
                        <span>{item.answer.date}</span>
                      </div>
                      <p>{item.answer.content}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="cluster-detail__pagination">
              <button
                className="button button--text"
                disabled={clusterDetail.page <= 0 || clusterDetail.isLoading}
                onClick={() => loadClusterOpinionPage(Number(post.id), clusterDetail.page - 1)}
                type="button"
              >
                이전 5개
              </button>
              <span>{clusterDetail.page + 1} 페이지</span>
              <button
                className="button button--text"
                disabled={!clusterDetail.hasNext || clusterDetail.isLoading}
                onClick={() => loadClusterOpinionPage(Number(post.id), clusterDetail.page + 1)}
                type="button"
              >
                다음 5개
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderPostCard = (post) => {
    const hasAnswer = Boolean(post.answer?.content)
    const isExpanded = expandedPostKey === post.uiKey
    const isEditingAnswer = answerEditor?.postId === post.id && answerEditor.mode === 'edit'
    const isCreatingAnswer = answerEditor?.postId === post.id && answerEditor.mode === 'create'
    const shouldShowPublicAnswer = !isOwnBoard && hasAnswer && isExpanded
    const shouldShowOwnedAnswer = isOwnBoard && hasAnswer && !isEditingAnswer
    const shouldShowAnswerForm = isCreatingAnswer || isEditingAnswer

    return (
      <article key={post.uiKey} className="board-post-card">
        <div className="board-post-card__top">
          <div className="board-post-card__title-wrap">
            <Icon className="board-post-card__chevron" name="chevronRight" />
            <div>
              <h3>{post.title}</h3>
              {post.type === 'CLUSTER' ? (
                <span className="board-post-card__summary-badge">유사 의견 묶음</span>
              ) : null}
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
          {post.type === 'CLUSTER' ? (
            <div className="meta-row">
              <Icon className="meta-row__icon" name="chat" />
              <span>의견 {post.opinionCount}건 묶음</span>
            </div>
          ) : (
            <div className="meta-row">
              <Icon className="meta-row__icon" name="user" />
              <span>{post.author}</span>
            </div>
          )}
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

          {post.type === 'CLUSTER' ? (
            <button className="text-action" onClick={() => toggleClusterDetails(post)} type="button">
              <Icon className="text-action__icon" name="chat" />
              <span>{isExpanded ? '묶음 닫기' : '묶음 보기'}</span>
            </button>
          ) : null}

          {!isOwnBoard && post.type !== 'CLUSTER' && hasAnswer ? (
            <button
              className="text-action"
              onClick={() => setExpandedPostKey(isExpanded ? '' : post.uiKey)}
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

        {renderClusterDetail(post, isExpanded)}
      </article>
    )
  }

  const renderPagination = (currentPage, totalPages, onChange) => {
    if (totalPages <= 1) {
      return null
    }

    return (
      <div className="list-pagination">
        <button
          className="button button--text"
          disabled={currentPage <= 0}
          onClick={() => onChange(currentPage - 1)}
          type="button"
        >
          이전 {OPINION_PAGE_SIZE}개
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button
          className="button button--text"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onChange(currentPage + 1)}
          type="button"
        >
          다음 {OPINION_PAGE_SIZE}개
        </button>
      </div>
    )
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
                {boardMode === 'CLUSTER' ? '클러스터 모드' : '일반 리스트'}
              </span>
              {isBoardUpdating ? (
                <span className="status-pill status-pill--reviewing board-hero__updating">
                  <Icon className="status-pill__icon" name="clock" />
                  클러스터 갱신 중
                </span>
              ) : null}
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
                  disabled={!draft.title.trim() || !draft.body.trim() || loading}
                  type="submit"
                >
                  <Icon className="button__icon" name="send" />
                  <span>{loading ? "메시지 보내는 중..." : "메시지 보내기"}</span>
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
              <span className="board-section__count">
                묶인 의견 {clusterPosts.length}건 · 일반 의견 {opinionPosts.length}건
              </span>
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
            <span>{buildBoardNote(isOwnBoard, boardMode)}</span>
          </div>

          {isLoadingPosts ? (
            <section className="panel">
              <p className="body-copy">게시글 목록을 불러오는 중입니다.</p>
            </section>
          ) : boardErrorMessage ? (
            <section className="panel">
              <p className="body-copy">{boardErrorMessage}</p>
            </section>
          ) : filteredClusterPosts.length === 0 && filteredOpinionPosts.length === 0 ? (
            <section className="panel">
              <p className="body-copy">아직 등록된 게시글이 없습니다.</p>
            </section>
          ) : (
            <div className="board-section__groups">
              {filteredClusterPosts.length > 0 ? (
                <div className="board-subsection">
                  <div className="board-subsection__head">
                    <h3>묶인 의견</h3>
                    <span>{filteredClusterPosts.length}건</span>
                  </div>
                  <div className="board-post-list">{filteredClusterPosts.map(renderPostCard)}</div>
                </div>
              ) : null}

              {filteredOpinionPosts.length > 0 ? (
                <div className="board-subsection">
                  <div className="board-subsection__head">
                    <h3>일반 의견</h3>
                    <span>{filteredOpinionPosts.length}건</span>
                  </div>
                  <div className="board-post-list">{pagedOpinionPosts.items.map(renderPostCard)}</div>
                  {renderPagination(pagedOpinionPosts.currentPage, pagedOpinionPosts.totalPages, setOpinionPage)}
                </div>
              ) : null}
            </div>
          )}
        </section>

        {shouldShowMyOpinionSection ? (
          <section className="board-section">
            <div className="board-section__head">
              <div className="board-section__title-group">
                <div className="section-heading section-heading--compact">
                  <div className="section-heading__main">
                    <Icon className="section-heading__icon" name="user" />
                    <div className="section-heading__text">
                      <h2>내 의견</h2>
                    </div>
                  </div>
                </div>
                <span className="board-section__count">{myOpinionPosts.length}건</span>
              </div>
            </div>

            {filteredMyOpinionPosts.length === 0 ? (
              <section className="panel">
                <p className="body-copy">아직 이 의원에게 남긴 의견이 없습니다.</p>
              </section>
            ) : (
              <div className="board-subsection">
                <div className="board-post-list">{pagedMyOpinionPosts.items.map(renderPostCard)}</div>
                {renderPagination(pagedMyOpinionPosts.currentPage, pagedMyOpinionPosts.totalPages, setMyOpinionPage)}
              </div>
            )}
          </section>
        ) : null}

        {similarOpinionModal.open && similarOpinionModal.data ? (
          <div className="similar-modal-backdrop" onClick={() => closeSimilarOpinionModal()} role="presentation">
            <div
              aria-modal="true"
              className="similar-modal-card"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="similar-modal__head">
                <div>
                  <span className="similar-modal__eyebrow">유사한 답변 안내</span>
                  <h2>이미 비슷한 답변이 있습니다</h2>
                </div>
                <button
                  aria-label="모달 닫기"
                  className="similar-modal__close"
                  onClick={() => closeSimilarOpinionModal()}
                  type="button"
                >
                  <Icon name="close" />
                </button>
              </div>

              <p className="similar-modal__message">
                이미 이 의견과 <strong>{similarOpinionModal.data.similarityPercent}%</strong> 비슷한 의견에 대해{' '}
                <strong>{formatDaysAgo(similarOpinionModal.data.daysAgo)}</strong> 국회의원이 답변을 남겼습니다.
              </p>

              <div className="similar-modal__cluster">
                <strong>{similarOpinionModal.data.clusterTitle || '관련 의견 묶음'}</strong>
                <p>{similarOpinionModal.data.clusterContent || '등록된 클러스터 요약이 없습니다.'}</p>
              </div>

              {similarOpinionModal.showAnswer && similarOpinionModal.data.answer?.content ? (
                <div className="similar-modal__answer">
                  <div className="similar-modal__answer-head">
                    <strong>{similarOpinionModal.data.answer.name ?? member.name}</strong>
                    <span>{formatBoardDate(similarOpinionModal.data.answer.createdAt)}</span>
                  </div>
                  <p>{similarOpinionModal.data.answer.content}</p>
                </div>
              ) : null}

              <div className="similar-modal__actions">
                <button
                  className="button button--text"
                  onClick={() =>
                    setSimilarOpinionModal((current) => ({
                      ...current,
                      showAnswer: !current.showAnswer,
                    }))
                  }
                  type="button"
                >
                  {similarOpinionModal.showAnswer ? '답변 숨기기' : '답변 보기'}
                </button>
                <button
                  className="button button--primary"
                  disabled={similarOpinionModal.isSubmitting}
                  onClick={handleSubmitDespiteSimilarity}
                  type="button"
                >
                  {similarOpinionModal.isSubmitting ? '등록 중...' : '그래도 의견 남기기'}
                </button>
                <button className="button button--text" onClick={() => closeSimilarOpinionModal()} type="button">
                  아니오
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
