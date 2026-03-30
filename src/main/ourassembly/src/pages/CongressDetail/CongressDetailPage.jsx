import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './CongressDetailPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { Portrait, SiteLayout } from '../../components/Common/Layout.jsx'
import { getCongressmanDetail } from '../../services/congress.js'

const partyToneRules = [
  { keyword: '국민의힘', tone: 'amber', theme: 'amber' },
  { keyword: '보수', tone: 'amber', theme: 'amber' },
  { keyword: '민주', tone: 'green', theme: 'emerald' },
  { keyword: '진보', tone: 'green', theme: 'emerald' },
  { keyword: '개혁', tone: 'green', theme: 'emerald' },
  { keyword: '조국', tone: 'violet', theme: 'violet' },
  { keyword: '혁신', tone: 'violet', theme: 'violet' },
]

function getPartyPresentation(party = '') {
  const matchedRule = partyToneRules.find((rule) => party.includes(rule.keyword))

  if (!matchedRule) {
    return {
      tone: 'violet',
      theme: 'ocean',
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

function formatValue(value, fallback = '정보 없음') {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalizedValue = value.trim()
  return normalizedValue || fallback
}

export function CongressDetailPage() {
  const { memberId } = useParams()
  const [member, setMember] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasPhotoError, setHasPhotoError] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadCongressmanDetail() {
      setIsLoading(true)
      setErrorMessage('')
      setHasPhotoError(false)

      try {
        const detail = await getCongressmanDetail(memberId)

        if (!ignore) {
          setMember(detail)
        }
      } catch (error) {
        if (!ignore) {
          setMember(null)
          setErrorMessage(error.message)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadCongressmanDetail()

    return () => {
      ignore = true
    }
  }, [memberId])

  const actions = [{ to: '/', icon: 'arrowLeft', label: '검색으로 돌아가기' }]

  if (isLoading) {
    return (
      <SiteLayout actions={actions} pageClassName="page page--detail">
        <div className="page-container page-container--detail">
          <section className="panel">
            <p className="body-copy">국회의원 정보를 불러오는 중입니다.</p>
          </section>
        </div>
      </SiteLayout>
    )
  }

  if (!member || errorMessage) {
    return (
      <SiteLayout actions={actions} pageClassName="page page--detail">
        <div className="page-container page-container--detail">
          <section className="panel">
            <p className="body-copy">{errorMessage || '국회의원 정보를 찾지 못했습니다.'}</p>
          </section>
        </div>
      </SiteLayout>
    )
  }

  const partyPresentation = getPartyPresentation(member.party)
  const portraitMember = {
    avatarLabel: getAvatarLabel(member.name),
    districtShort: formatValue(member.ward),
    name: formatValue(member.name),
    theme: partyPresentation.theme,
  }
  const contactRows = [
    { icon: 'mail', label: '이메일', value: formatValue(member.email) },
    { icon: 'phone', label: '전화', value: formatValue(member.tel) },
    { icon: 'building', label: '사무실 주소', value: formatValue(member.address) },
  ]
  const badges = [member.party, member.ward].filter((value) => typeof value === 'string' && value.trim())

  return (
    <SiteLayout actions={actions} pageClassName="page page--detail">
      <div className="page-container page-container--detail">
        <nav className="breadcrumb" aria-label="현재 위치">
          <Link className="breadcrumb__link" to="/">
            검색
          </Link>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <span>{formatValue(member.ward)}</span>
          <Icon className="breadcrumb__icon" name="chevronRight" />
          <strong>{formatValue(member.name)}</strong>
        </nav>

        <section className="panel panel--profile">
          <div className="panel__accent" />
          <div className="profile-hero">
            {member.photoUrl && !hasPhotoError ? (
              <div className="profile-photo">
                <img
                  alt={`${formatValue(member.name)} 프로필 사진`}
                  className="profile-photo__image"
                  onError={() => setHasPhotoError(true)}
                  src={member.photoUrl}
                />
              </div>
            ) : (
              <Portrait member={portraitMember} />
            )}

            <div className="profile-hero__content">
              <div className="profile-hero__headline">
                <div>
                  <h1 className="profile-hero__name">{formatValue(member.name)}</h1>
                  <p className="profile-hero__district">{formatValue(member.ward)}</p>
                </div>
                <span className={`party-badge party-badge--${partyPresentation.tone}`}>
                  {formatValue(member.party)}
                </span>
              </div>

              <div className="profile-stat-grid">
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="landmark" />
                  <div>
                    <span className="profile-stat__label">정당</span>
                    <strong>{formatValue(member.party)}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="committee" />
                  <div>
                    <span className="profile-stat__label">당선 횟수</span>
                    <strong>{formatValue(member.numberOfReElection)}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="mapPin" />
                  <div>
                    <span className="profile-stat__label">지역구</span>
                    <strong>{formatValue(member.ward)}</strong>
                  </div>
                </article>
                <article className="profile-stat">
                  <Icon className="profile-stat__icon" name="phone" />
                  <div>
                    <span className="profile-stat__label">대표 연락처</span>
                    <strong>{formatValue(member.tel)}</strong>
                  </div>
                </article>
              </div>

              {badges.length > 0 ? (
                <div className="committee-row">
                  {badges.map((badge) => (
                    <span key={badge} className="committee-pill">
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="profile-cta">
            <p>국회 공개 데이터를 기반으로 지역구와 연락처 정보를 확인할 수 있습니다.</p>
          </div>
        </section>

        <section className="panel">
          <SectionHeading icon="book" title="약력" />
          <p className="body-copy body-copy--multiline">
            {formatValue(member.career, '등록된 약력 정보가 없습니다.')}
          </p>
        </section>

        <section className="panel">
          <SectionHeading icon="mapPin" title="지역구 및 사무실 정보" />
          <p className="body-copy body-copy--multiline">
            지역구: {formatValue(member.ward)}
            {'\n'}
            사무실 주소: {formatValue(member.address)}
          </p>
        </section>

        <section className="panel">
          <SectionHeading icon="mail" title="연락처" />

          <div className="contact-list">
            {contactRows.map((row) => (
              <ContactRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}

function SectionHeading({ title, icon }) {
  return (
    <div className="section-heading">
      <div className="section-heading__main">
        <Icon className="section-heading__icon" name={icon} />
        <div className="section-heading__text">
          <h2>{title}</h2>
        </div>
      </div>
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
