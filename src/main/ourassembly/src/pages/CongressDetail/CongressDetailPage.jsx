import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import './CongressDetailPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { SiteLayout } from '../../components/Common/Layout.jsx'
import { getCongressmanDetail } from '../../services/congress.js'
import { getBillDetail, getBillSummary, getCongressmanBills } from '../../services/bill.js'
import {LoadingView} from "../../components/CongressDetail/LoadingView.jsx";
import {ErrorView} from "../../components/CongressDetail/ErrorView.jsx";
import {formatValue} from "../../utils/CongressDetail/formatValue.js";
import {TopNavigation} from "../../components/CongressDetail/TopNavigation.jsx";
import {ProfileCard} from "../../components/CongressDetail/ProfileCard.jsx";
import {PanelCard} from "../../components/CongressDetail/PanelCard.jsx";
import {findMemberSupplementalData} from "../../data/mockData.js";
import {RecentAnswersSection} from "../../components/CongressDetail/RecentAnswersSection.jsx";
import {RecentActivitiesSection} from "../../components/CongressDetail/RecentActivitiesSection.jsx";
import {RecentNewsSection} from "../../components/CongressDetail/RecentNewsSection.jsx";
import {Link} from "react-router-dom";
import { getStoredAuthUser } from '../../services/auth.js'
import { formatBillCount } from '../../utils/CongressDetail/billActivity.js'
import {getCongressmanNews} from "../../services/news.js";

const partyToneRules = [
  { keywords: ['국민의힘', '국민의미래', '국민통합당', '보수'], tone: 'amber', theme: 'amber' },
  { keywords: ['더불어민주당', '더불어민주연합', '민주진보당', '민주', '진보'], tone: 'green', theme: 'emerald' },
  { keywords: ['조국혁신당', '정의미래당', '조국', '혁신'], tone: 'violet', theme: 'violet' },
]

function getPartyPresentation(party = '') {
  const matchedRule = partyToneRules.find((rule) =>
      rule.keywords.some((keyword) => party.includes(keyword)),
  )

  if (!matchedRule) {
    return {
      tone: 'violet',
      theme: 'violet',
    }
  }

  return {
    tone: matchedRule.tone,
    theme: matchedRule.theme,
  }
}

function getAvatarLabel(name = '') {
  const normalizedName = name.replace(/\s+/g, '').replace(/의원$/, '')
  return normalizedName.slice(0, 2) || '?'
}

function createDetailFromSupplemental(member) {
  return {
    id: member.id,
    name: member.name,
    party: member.party?.name ?? '',
    photoUrl: '',
    email: member.email,
    career: member.biography,
    numberOfReElection: member.terms,
    tel: member.phone,
    address: member.office,
    ward: member.district,
    committee: member.committees,
  }
}

function getCommitteeList(member, supplementalMember) {
  if (Array.isArray(member?.committee) && member.committee.length > 0) {
    return member.committee.filter((value) => typeof value === 'string' && value.trim())
  }

  return Array.isArray(supplementalMember?.committees) ? supplementalMember.committees : []
}

function pickFirstFilledValue(...values) {
  return values.find((value) => typeof value === 'string' && value.trim()) ?? ''
}

export function CongressDetailPage() {
  const { memberId } = useParams()
  const currentUser = getStoredAuthUser()
  const headerGreeting = currentUser ? `${currentUser.name ?? '사용자'}님 환영합니다` : ''
  const [member, setMember] = useState(null)
  const [billActivities, setBillActivities] = useState({
    leadCount: 0,
    coCount: 0,
    leadBills: [],
    coBills: [],
  })
  const [billActivitiesError, setBillActivitiesError] = useState('')
  const [billActivitiesLoading, setBillActivitiesLoading] = useState(true)
  const [newsItems, setNewsItems] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState('')
  const [selectedNewsPage, setSelectedNewsPage] = useState(1)
  const [selectedBillRole, setSelectedBillRole] = useState('LEAD')
  const [selectedBillStatus, setSelectedBillStatus] = useState('all')
  const [selectedBillPage, setSelectedBillPage] = useState(1)
  const [expandedBillId, setExpandedBillId] = useState(null)
  const [billDetailsById, setBillDetailsById] = useState({})
  const [billDetailErrors, setBillDetailErrors] = useState({})
  const [loadingBillId, setLoadingBillId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasPhotoError, setHasPhotoError] = useState(false)
  const summaryPollingTimerRef = useRef(null)

  function stopSummaryPolling() {
    if (summaryPollingTimerRef.current) {
      window.clearTimeout(summaryPollingTimerRef.current)
      summaryPollingTimerRef.current = null
    }
  }

  useEffect(() => {
    stopSummaryPolling()
    setSelectedBillRole('LEAD')
    setSelectedBillStatus('all')
    setSelectedBillPage(1)
    setSelectedNewsPage(1)
    setExpandedBillId(null)
    setBillDetailsById({})
    setBillDetailErrors({})
  }, [memberId])

  useEffect(() => {
    stopSummaryPolling()
    setSelectedBillPage(1)
    setExpandedBillId(null)
  }, [selectedBillRole, selectedBillStatus])

  useEffect(() => () => {
    stopSummaryPolling()
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadCongressmanDetail() {
      setIsLoading(true)
      setErrorMessage('')
      setHasPhotoError(false)
      setBillActivitiesLoading(true)
      setBillActivitiesError('')
      setNewsLoading(true)
      setNewsError('')

      try {
        const [detailResult, billsResult, newsResult] = await Promise.allSettled([
          getCongressmanDetail(memberId),
          getCongressmanBills(memberId),
          getCongressmanNews(memberId)
        ])

        if (ignore) {
          return
        }

        if (detailResult.status === 'fulfilled') {
          setMember(detailResult.value)
        } else {
          const fallbackMember = findMemberSupplementalData({ id: memberId })

          if (fallbackMember) {
            setMember(createDetailFromSupplemental(fallbackMember))
          } else {
            setMember(null)
            setErrorMessage(detailResult.reason?.message ?? '국회의원 정보를 불러오지 못했습니다.')
          }
        }

        if (billsResult.status === 'fulfilled') {
          const nextBillActivities = billsResult.value ?? {
            leadCount: 0,
            coCount: 0,
            leadBills: [],
            coBills: [],
          }

          setBillActivities(nextBillActivities)

          if (nextBillActivities.leadCount === 0 && nextBillActivities.coCount > 0) {
            setSelectedBillRole('CO')
          }
        } else {
          setBillActivities({
            leadCount: 0,
            coCount: 0,
            leadBills: [],
            coBills: [],
          })
          setBillActivitiesError(
            billsResult.reason?.message ?? '의안 활동 정보를 불러오지 못했습니다.',
          )
        }

        if (newsResult.status === 'fulfilled') {
          setNewsItems(Array.isArray(newsResult.value) ? newsResult.value : [])
          setSelectedNewsPage(1)
        } else {
          setNewsItems([])
          setNewsError(
            newsResult.reason?.message ?? '뉴스 정보를 불러오지 못했습니다.',
          )
        }
      } catch (error) {
        if (!ignore) {
          const fallbackMember = findMemberSupplementalData({ id: memberId })

          if (fallbackMember) {
            setMember(createDetailFromSupplemental(fallbackMember))
          } else {
            setMember(null)
            setErrorMessage(error.message)
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
          setBillActivitiesLoading(false)
          setNewsLoading(false)
        }
      }
    }

    loadCongressmanDetail()

    return () => {
      ignore = true
    }
  }, [memberId])

  async function pollBillSummary(billId, attempt = 0) {
    const maxAttempts = 20

    try {
      const summary = await getBillSummary(billId)

      setBillDetailsById((prev) => ({
        ...prev,
        [billId]: {
          ...(prev[billId] ?? {}),
          summary: summary.summary,
          summaryStatus: summary.summaryStatus,
        },
      }))

      if (summary.summaryStatus === 'COMPLETED' || summary.summaryStatus === 'FAILED') {
        stopSummaryPolling()
        return
      }
    } catch (error) {
      if (attempt >= maxAttempts - 1) {
        setBillDetailErrors((prev) => ({
          ...prev,
          [billId]: error.message,
        }))
        stopSummaryPolling()
        return
      }
    }

    if (attempt >= maxAttempts - 1) {
      stopSummaryPolling()
      return
    }

    summaryPollingTimerRef.current = window.setTimeout(() => {
      pollBillSummary(billId, attempt + 1)
    }, 1500)
  }

  function startSummaryPollingIfNeeded(billId, detail) {
    if (!detail) {
      return
    }

    if (detail.summaryStatus === 'COMPLETED' || detail.summaryStatus === 'FAILED') {
      return
    }

    stopSummaryPolling()
    pollBillSummary(billId)
  }

  async function handleBillToggle(billId) {
    if (expandedBillId === billId) {
      stopSummaryPolling()
      setExpandedBillId(null)
      return
    }

    stopSummaryPolling()
    setExpandedBillId(billId)
    setLoadingBillId(billId)
    setBillDetailErrors((prev) => ({ ...prev, [billId]: '' }))

    try {
      const detail = await getBillDetail(billId)
      setBillDetailsById((prev) => ({
        ...prev,
        [billId]: detail,
      }))
      startSummaryPollingIfNeeded(billId, detail)
    } catch (error) {
      setBillDetailErrors((prev) => ({
        ...prev,
        [billId]: error.message,
      }))
    } finally {
      setLoadingBillId((current) => (current === billId ? '' : current))
    }
  }

  function handleBillPageChange(nextPage) {
    stopSummaryPolling()
    setSelectedBillPage(nextPage)
    setExpandedBillId(null)
  }

  const defaultActions = [{ to: '/', icon: 'arrowLeft', label: '검색으로 돌아가기' }]

  if (isLoading) {
    return (
      <SiteLayout actions={defaultActions} headerGreeting={headerGreeting} pageClassName="page page--detail">
        <LoadingView/>
      </SiteLayout>
    )
  }

  if (!member || errorMessage) {
    return (
      <SiteLayout actions={defaultActions} headerGreeting={headerGreeting} pageClassName="page page--detail">
        <ErrorView errorMessage={errorMessage}/>
      </SiteLayout>
    )
  }

  const supplementalMember = findMemberSupplementalData({
    id: memberId,
    name: member.name,
    ward: member.ward,
  })
  const isOwnCongressPage =
    currentUser?.role === 'congress' && currentUser?.congressmanId === memberId
  const partyPresentation = getPartyPresentation(member.party)
  const boardPath = `/members/${memberId}/board`
  const actions = [
    ...defaultActions,
    {
      to: boardPath,
      icon: isOwnCongressPage ? 'inbox' : 'send',
      label: isOwnCongressPage ? '내 의견함 보기' : '메시지 보내기',
      variant: 'primary',
    },
  ]
  const committees = getCommitteeList(member, supplementalMember)
  const posts = Array.isArray(supplementalMember?.boardPosts) ? supplementalMember.boardPosts.slice(0, 3) : []
  const profileStats = [
    { icon: 'user', label: '나이', value: '만 ' + formatValue(member?.age) + '세' },
    {
      icon: 'committee',
      label: '당선 횟수',
      value: formatValue(pickFirstFilledValue(member.numberOfReElection, supplementalMember?.terms)),
    },
    { icon: 'gavel', label: '대표 발의', value: formatBillCount(billActivities.leadCount) },
  ]
  const portraitMember = {
    avatarLabel: getAvatarLabel(member.name),
    districtShort: formatValue(supplementalMember?.districtShort ?? member.ward),
    name: formatValue(member.name),
    theme: partyPresentation.theme,
  }
  const contactRows = [
    {
      icon: 'mail',
      label: '이메일',
      value: formatValue(pickFirstFilledValue(member.email, supplementalMember?.email)),
    },
    {
      icon: 'phone',
      label: '전화',
      value: formatValue(pickFirstFilledValue(member.tel, supplementalMember?.phone)),
    },
    {
      icon: 'building',
      label: '사무실',
      value: formatValue(pickFirstFilledValue(member.address, supplementalMember?.office)),
    },
  ]

  const biography = formatValue(
    pickFirstFilledValue(member.career, supplementalMember?.biography),
    '등록된 약력 정보가 없습니다.',
  )
  const responseCount = supplementalMember?.responseCount ?? posts.filter((post) => post.answer).length
  const tagline =
    isOwnCongressPage
      ? '시민들이 남긴 의견을 확인하고 직접 답변할 수 있어요.'
      : supplementalMember?.tagline ??
        `${formatValue(member.name)} 의원에게 지역 현안, 건의사항, 질문을 직접 전달할 수 있어요.`
  const calloutTitle = isOwnCongressPage ? '답변이 필요한 의견을 확인해보세요' : '하고 싶은 말씀이 있으신가요?'
  const calloutDescription = isOwnCongressPage
    ? '시민들이 남긴 의견을 모아 보고 답변 상태를 관리할 수 있습니다.'
    : `${formatValue(member.name)}에게 직접 의견을 전달하고 답변을 받아보세요.`

  return (
    <SiteLayout actions={actions} headerGreeting={headerGreeting} pageClassName="page page--detail">
      <div className="page-container page-container--detail">
        <TopNavigation
          member={{
            ...member,
            ward: supplementalMember?.districtShort ?? member.ward,
          }}
        />

        <ProfileCard
            member={member}
            hasPhotoError={hasPhotoError}
            onPhotoError={setHasPhotoError}
            portraitMember={portraitMember}
            partyPresentation={partyPresentation}
            committees={committees}
            messageTo={boardPath}
            messageIcon={isOwnCongressPage ? 'inbox' : 'send'}
            messageLabel={isOwnCongressPage ? '내 의견함 보기' : '의원에게 메시지 보내기'}
            stats={profileStats}
            tagline={tagline}
        />
        <PanelCard content={biography} icon="book" title="약력" />
        <RecentAnswersSection boardPath={boardPath} posts={posts} responseCount={responseCount} />
        <RecentActivitiesSection
          billActivities={billActivities}
          billDetailsById={billDetailsById}
          billDetailErrors={billDetailErrors}
          errorMessage={billActivitiesError}
          expandedBillId={expandedBillId}
          isLoading={billActivitiesLoading}
          loadingBillId={loadingBillId}
          onBillToggle={handleBillToggle}
          onPageChange={handleBillPageChange}
          onRoleChange={setSelectedBillRole}
          onStatusChange={setSelectedBillStatus}
          currentPage={selectedBillPage}
          selectedRole={selectedBillRole}
          selectedStatus={selectedBillStatus}
        />
        <RecentNewsSection
            memberName={formatValue(member.name)}
            news={newsItems}
            isLoading={newsLoading}
            errorMessage={newsError}
            currentPage={selectedNewsPage}
            onPageChange={setSelectedNewsPage}
        />
        <PanelCard icon="mail" title="연락처">
          <div className="contact-list">
            {contactRows.map((row) => (
                <ContactRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </div>
        </PanelCard>
        <section className="callout">
          <div>
            <h2>{calloutTitle}</h2>
            <p>{calloutDescription}</p>
          </div>
          <Link className="button button--primary detail-callout__button" to={boardPath}>
            <Icon className="button__icon" name={isOwnCongressPage ? 'inbox' : 'send'} />
            <span>소통 게시판 바로가기</span>
          </Link>
        </section>
      </div>
    </SiteLayout>
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
