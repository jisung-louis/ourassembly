import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './CongressDetailPage.css'
import { Icon } from '../../components/Common/Icon.jsx'
import { Portrait, SiteLayout } from '../../components/Common/Layout.jsx'
import { getCongressmanDetail } from '../../services/congress.js'
import {LoadingView} from "../../components/CongressDetail/LoadingView.jsx";
import {ErrorView} from "../../components/CongressDetail/ErrorView.jsx";
import {formatValue} from "../../utils/CongressDetail/formatValue.js";
import {TopNavigation} from "../../components/CongressDetail/TopNavigation.jsx";
import {ProfileCard} from "../../components/CongressDetail/ProfileCard.jsx";
import {PanelCard} from "../../components/CongressDetail/PanelCard.jsx";

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
        <LoadingView/>
      </SiteLayout>
    )
  }

  if (!member || errorMessage) {
    return (
      <SiteLayout actions={actions} pageClassName="page page--detail">
        <ErrorView errorMessage={errorMessage}/>
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

  const congressAdditionalInfo = {
    career: {
      icon: "book",
      title: "약력",
      content: formatValue(member.career, '등록된 약력 정보가 없습니다.')
    },
    wardAndOffice: {
      icon: "mapPin",
      title: "지역구 및 사무실 정보",
      content:
          `지역구: ${formatValue(member.ward)}
          사무실 주소: ${formatValue(member.address)}`
    },
    contact: {
      icon: "mail",
      title: "연락처",
      content: null
    }
  }

  return (
    <SiteLayout actions={actions} pageClassName="page page--detail">
      <div className="page-container page-container--detail">
        <TopNavigation member={member}/>

        <ProfileCard
            member={member}
            hasPhotoError={hasPhotoError}
            onPhotoError={setHasPhotoError}
            portraitMember={portraitMember}
            partyPresentation={partyPresentation}
        />
        <PanelCard {...congressAdditionalInfo.career}/>
        <PanelCard {...congressAdditionalInfo.wardAndOffice}/>
        <PanelCard {...congressAdditionalInfo.contact}>
          <div className="contact-list">
            {contactRows.map((row) => (
                <ContactRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
            ))}
          </div>
        </PanelCard>
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