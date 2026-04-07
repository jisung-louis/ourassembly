export const todayLabel = '2026년 3월 26일'

export const homeInfoCards = [
  {
    id: 'privacy',
    icon: 'shield',
    title: '개인정보 보호',
    description: '주소는 저장되지 않아요',
  },
  {
    id: 'official',
    icon: 'landmark',
    title: '공식 국회 데이터 기반',
    description: '항상 최신 정보 제공',
  },
  {
    id: 'contact',
    icon: 'chat',
    title: '직접 의견 전달',
    description: '국회의원에게 바로 메시지를 전하세요',
  },
]

export const nameQuickFilters = [
  { label: '김 씨 의원', query: '김' },
  { label: '이 씨 의원', query: '이' },
  { label: '박 씨 의원', query: '박' },
  { label: '정 씨 의원', query: '정' },
  { label: '최 씨 의원', query: '최' },
]

export const addressSuggestions = [
  { id: 'addr-1', label: '서울특별시 송파구 잠실동', memberId: 'song-naeun' },
  { id: 'addr-2', label: '서울특별시 송파구 잠실본동', memberId: 'song-naeun' },
  { id: 'addr-3', label: '서울특별시 송파구 잠실2동', memberId: 'song-naeun' },
  { id: 'addr-4', label: '서울특별시 송파구 잠실6동', memberId: 'song-naeun' },
  { id: 'addr-5', label: '서울특별시 서초구 잠원동', memberId: 'song-naeun' },
]

function buildGenericBoardPosts(authorName) {
  return [
    {
      id: `${authorName}-board-1`,
      title: '보행자 안전 시설 개선 요청',
      excerpt:
        '어두운 골목길과 횡단보도 주변 조명이 부족해 야간 보행이 불편하다는 의견을 전달드립니다.',
      author: '정태용',
      date: '2026년 3월 20일',
      status: 'answered',
      answer:
        '관할 구청과 협의해 예산 반영 가능 여부를 검토하겠습니다. 필요 구간은 현장 점검 후 우선순위를 정해 개선하겠습니다.',
    },
    {
      id: `${authorName}-board-2`,
      title: '동네 공원 편의시설 정비 건의',
      excerpt:
        '산책로 노후화와 벤치 부족 문제를 정비해달라는 주민 의견이 꾸준히 접수되고 있습니다.',
      author: '김서윤',
      date: '2026년 3월 12일',
      status: 'reviewing',
    },
    {
      id: `${authorName}-board-3`,
      title: '지역 청소년 진로 프로그램 확대 제안',
      excerpt:
        '중학생 대상 공공기관 연계 진로체험 프로그램을 정례화하면 좋겠다는 학부모 제안입니다.',
      author: '이하린',
      date: '2026년 2월 28일',
      status: 'pending',
    },
  ]
}

function buildGenericActivities(areaLabel) {
  return [
    {
      id: `${areaLabel}-activity-1`,
      category: '발의',
      filter: 'bill',
      accent: 'amber',
      meta: '2026-03-18 발의',
      title: `${areaLabel} 생활 인프라 개선을 위한 특별법 일부개정법률안`,
    },
    {
      id: `${areaLabel}-activity-2`,
      category: '질의',
      filter: 'question',
      accent: 'sky',
      meta: '2026-03-07 질의',
      title: `${areaLabel} 교통 취약지역 예산 집행 현황 관련 질의`,
    },
    {
      id: `${areaLabel}-activity-3`,
      category: '토론',
      filter: 'debate',
      accent: 'violet',
      meta: '2026-02-21 토론',
      title: `${areaLabel} 돌봄 정책 연속성 강화를 위한 전문가 토론회`,
    },
    {
      id: `${areaLabel}-activity-4`,
      category: '회의',
      filter: 'meeting',
      accent: 'emerald',
      meta: '2026-02-04 회의',
      title: `${areaLabel} 주민 생활환경 점검을 위한 현장 간담회`,
    },
  ]
}

function buildGenericNews(name) {
  return [
    {
      id: `${name}-news-1`,
      title: `${name}, 지역 맞춤형 생활 SOC 예산 확보 논의`,
      source: '한국일보',
      date: '2026-03-12',
    },
    {
      id: `${name}-news-2`,
      title: `${name}, 주민 간담회서 생활 민원 대응 계획 밝혀`,
      source: '경향신문',
      date: '2026-02-27',
    },
    {
      id: `${name}-news-3`,
      title: `${name}, 복지 사각지대 해소 위한 법안 검토`,
      source: '정책브리프',
      date: '2026-01-19',
    },
  ]
}

function createMember({
  id,
  theme,
  avatarLabel,
  name,
  district,
  districtShort,
  partyName,
  partyTone,
  age,
  terms,
  bills,
  committees,
  biography,
  office,
  email,
  phone,
  tagline,
  activityCountLabel = '활동 중',
  responseCount = 1,
  boardPosts,
  activities,
  news,
}) {
  return {
    id,
    theme,
    avatarLabel,
    name,
    district,
    districtShort,
    searchKeywords: [name, district, districtShort, partyName],
    party: { name: partyName, tone: partyTone },
    age,
    terms,
    bills,
    committees,
    biography,
    office,
    email,
    phone,
    tagline,
    activityCountLabel,
    responseCount,
    boardPosts,
    activities,
    news,
  }
}

const kimJisuBoardPosts = [
  {
    id: 'jisu-post-1',
    title: '마포구 버스 노선 폐지에 대한 우려',
    excerpt:
      '14번 버스 노선이 폐지되면서 저희 지역 어르신들의 동네 의원 방문하기가 매우 어려워졌습니다. 대중교통에 의존하는 주민들이 많은데 대안 노선 마련이 시급합니다…',
    author: '이수진',
    date: '2026년 3월 14일',
    status: 'answered',
    answer:
      '소중한 의견 감사합니다. 14번 버스 노선 폐지로 불편을 겪고 계신 주민 여러분께 진심으로 공감합니다. 저는 지난주 서울시 교통기획과에 공식 면담을 요청하였고, 대체 수요응답형 버스와 정류장 이전 방안을 함께 검토하고 있습니다.',
  },
  {
    id: 'jisu-post-2',
    title: '마포 공원 주변 가로등 추가 설치 요청',
    excerpt:
      '최근 야간 안전 사고 이후 많은 주민들이 공원 입구 주변의 안전에 불안감을 느끼고 있습니다. 주로 보행로와 공원 출입구에 가로등 두 개 설치를 요청드립니다…',
    author: '박민준',
    date: '2026년 3월 10일',
    status: 'answered',
    answer:
      '빠르게 확인하겠습니다. 마포시설관리공단과 현장 점검을 잡았고, 공원 경계 보행구간을 우선 개선 대상으로 올려두었습니다. 조명 위치와 밝기 기준을 주민 의견과 함께 반영하겠습니다.',
  },
  {
    id: 'jisu-post-3',
    title: '마포구 빈 공터 공동 텃밭 조성 제안',
    excerpt:
      '우리 주민 모임에서 동네를 활용한 공동 텃밭 조성 제안을 마련했습니다. 지역 공동체 결속을 강화하고 도시 농업에 대한 주민 참여를 늘리는 좋은 기회가 될 것입니다…',
    author: '최서윤',
    date: '2026년 3월 7일',
    status: 'reviewing',
  },
  {
    id: 'jisu-post-4',
    title: '공공임대주택 건설 일정 후속 문의',
    excerpt:
      '마포구 공공임대주택 사업 일정이 발표된 지 18개월이 지났는데 진행 상황에 대한 공지 안내가 없어 주민들이 많이 궁금해하고 있습니다. 업데이트 부탁드립니다…',
    author: '정태용',
    date: '2026년 3월 1일',
    status: 'pending',
  },
  {
    id: 'jisu-post-5',
    title: '무상급식 확대 지지 서명 전달',
    excerpt:
      '노들학교 두 아이를 둔 학부모로서 무상급식을 중학교까지 확대하는 정책을 적극 지지합니다. 관련 데이터를 보면 학생 출석률과 학업 성취도가 분명히 향상되는 것을 확인할 수 있습니다…',
    author: '강혜린',
    date: '2026년 2월 22일',
    status: 'answered',
    answer:
      '서명과 의견 전달에 감사드립니다. 교육청 및 복지위원회와 함께 관련 지표를 검토 중이며, 취약계층 학생 지원과 단계적 확대 방안을 함께 논의하고 있습니다.',
  },
]

const members = [
  createMember({
    id: 'kim-jisu',
    theme: 'emerald',
    avatarLabel: '김지',
    name: '김지수 의원',
    district: '서울특별시 마포구 갑',
    districtShort: '서울 마포-갑',
    partyName: '민주진보당',
    partyTone: 'green',
    age: '만 54세',
    terms: '3선',
    bills: '5건',
    committees: [
      '보건복지위원회 (위원장)',
      '도시계획특별위원회',
      '예산결산특별위원회',
    ],
    biography:
      '김지수 의원은 서울 마포구에서 10년 이상 지역 주민을 대표해 왔습니다. 보건복지 행정가이자 지역 활동가 출신으로, 공공의료 접근성 향상, 주거 안정, 대중교통 개선에 앞장서 왔습니다.',
    office: '국회의사당 214호, 서울특별시 영등포구',
    email: 'js.kim@assembly.go.kr',
    phone: '02-788-2214',
    tagline: '김지수 의원에게 지역 현안, 건의사항, 질문을 직접 전달할 수 있어요.',
    responseCount: 3,
    boardPosts: kimJisuBoardPosts,
    activities: [
      {
        id: 'jisu-act-1',
        category: '발의',
        filter: 'bill',
        accent: 'amber',
        meta: '2026-02-11 발의',
        title: '공공의료기관 접근성 강화법 일부개정법률안',
      },
      {
        id: 'jisu-act-2',
        category: '질의',
        filter: 'question',
        accent: 'sky',
        meta: '2026-03-05 질의',
        title: '지역 대중교통 취약계층 이동권 보장 예산 점검',
      },
      {
        id: 'jisu-act-3',
        category: '토론',
        filter: 'debate',
        accent: 'violet',
        meta: '2026-01-28 토론',
        title: '임대차 제도 개편을 위한 공개 정책 토론회 참석',
      },
      {
        id: 'jisu-act-4',
        category: '회의',
        filter: 'meeting',
        accent: 'emerald',
        meta: '2025-12-03 회의',
        title: '노인 돌봄 서비스 확대 법안 후속 간담회',
      },
      {
        id: 'jisu-act-5',
        category: '발의',
        filter: 'bill',
        accent: 'amber',
        meta: '2026-01-07 발의',
        title: '도시 소규모 공공녹지 확충에 관한 도시공원법 일부개정법률안',
      },
    ],
    news: [
      {
        id: 'jisu-news-1',
        title: "김지수 의원, '공공의료기관 접근성 강화법' 발의…의료 취약 지역 해소 기대",
        source: '한국일보',
        date: '2026-02-11',
      },
      {
        id: 'jisu-news-2',
        title: '"마포구 버스 노선 복구, 주민 요구 반드시 관철" 김지수 의원 현장 간담회',
        source: '경향신문',
        date: '2026-03-15',
      },
      {
        id: 'jisu-news-3',
        title: '노인 돌봄 서비스 확대법 본회의 통과…월 최대 40시간 방문 서비스 제공',
        source: '복지뉴스',
        date: '2025-12-03',
      },
      {
        id: 'jisu-news-4',
        title: '김지수 의원, 주거안정특별위 간담회서 “임대차 3법 보완 시급” 강조',
        source: '매일경제',
        date: '2026-01-28',
      },
    ],
  }),
  createMember({
    id: 'song-naeun',
    theme: 'ocean',
    avatarLabel: '송나',
    name: '송나은 의원',
    district: '서울특별시 송파구 을',
    districtShort: '서울 송파-을',
    partyName: '국민통합당',
    partyTone: 'amber',
    age: '만 48세',
    terms: '재선',
    bills: '3건',
    committees: ['국토교통위원회', '지방분권특별위원회'],
    biography:
      '송나은 의원은 서울 동남권 생활 교통과 주거 환경 개선에 집중해 온 도시정책 전문가입니다. 역세권 보행환경 개선, 통학 안전 예산 확보, 소규모 생활 SOC 확충을 주요 과제로 추진하고 있습니다.',
    office: '의원회관 402호, 서울특별시 영등포구',
    email: 'naeun.song@assembly.go.kr',
    phone: '02-788-3102',
    tagline: '송나은 의원에게 생활 교통과 주거 환경에 대한 의견을 전해보세요.',
    responseCount: 2,
    boardPosts: buildGenericBoardPosts('song-naeun'),
    activities: buildGenericActivities('송파구'),
    news: buildGenericNews('송나은 의원'),
  }),
  createMember({
    id: 'kim-minjun',
    theme: 'amber',
    avatarLabel: '김민',
    name: '김민준 의원',
    district: '대구광역시 수성구 갑',
    districtShort: '대구 수성-갑',
    partyName: '국민통합당',
    partyTone: 'amber',
    age: '만 51세',
    terms: '재선',
    bills: '4건',
    committees: ['산업통상자원중소벤처기업위원회'],
    biography:
      '김민준 의원은 지역 산업 육성과 창업 생태계 조성을 중심으로 입법 활동을 이어가고 있습니다. 청년 일자리와 중소기업 지원 예산 확보에 강점을 보이고 있습니다.',
    office: '의원회관 516호, 서울특별시 영등포구',
    email: 'minjun.kim@assembly.go.kr',
    phone: '02-788-4271',
    tagline: '김민준 의원에게 산업과 민생 정책에 대한 의견을 보내보세요.',
    responseCount: 2,
    boardPosts: buildGenericBoardPosts('kim-minjun'),
    activities: buildGenericActivities('수성구'),
    news: buildGenericNews('김민준 의원'),
  }),
  createMember({
    id: 'kim-sua',
    theme: 'emerald',
    avatarLabel: '김수',
    name: '김수아 의원',
    district: '인천광역시 남동구 을',
    districtShort: '인천 남동-을',
    partyName: '민주진보당',
    partyTone: 'green',
    age: '만 46세',
    terms: '초선',
    bills: '2건',
    committees: ['환경노동위원회'],
    biography:
      '김수아 의원은 생활 환경과 돌봄 정책을 주요 의제로 삼고 있으며, 지역 커뮤니티 기반의 기후 적응 정책을 발굴하는 데 집중하고 있습니다.',
    office: '의원회관 305호, 서울특별시 영등포구',
    email: 'sua.kim@assembly.go.kr',
    phone: '02-788-1842',
    tagline: '김수아 의원에게 환경과 돌봄 정책에 대한 제안을 남겨보세요.',
    responseCount: 1,
    boardPosts: buildGenericBoardPosts('kim-sua'),
    activities: buildGenericActivities('남동구'),
    news: buildGenericNews('김수아 의원'),
  }),
  createMember({
    id: 'kim-taeyang',
    theme: 'violet',
    avatarLabel: '김태',
    name: '김태양 의원',
    district: '광주광역시 광산구 갑',
    districtShort: '광주 광산-갑',
    partyName: '정의미래당',
    partyTone: 'violet',
    age: '만 42세',
    terms: '초선',
    tenure: '2024년 - 현재',
    bills: '3건',
    committees: ['행정안전위원회'],
    biography:
      '김태양 의원은 청년 정책과 지역 분권, 생활 안전 의제를 중심으로 활동하고 있습니다. 현장 간담회와 시민 정책 제안 창구를 적극 활용하는 편입니다.',
    office: '의원회관 611호, 서울특별시 영등포구',
    email: 'taeyang.kim@assembly.go.kr',
    phone: '02-788-6724',
    tagline: '김태양 의원에게 청년 정책과 생활 안전 관련 의견을 전달해보세요.',
    responseCount: 1,
    boardPosts: buildGenericBoardPosts('kim-taeyang'),
    activities: buildGenericActivities('광산구'),
    news: buildGenericNews('김태양 의원'),
  }),
]

export { members }

function normalizeMemberIdentity(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[–—-]/g, '')
}

export function getMemberById(memberId) {
  return members.find((member) => member.id === memberId) ?? null
}

export function findMemberSupplementalData({ id, name, ward, age } = {}) {
  const normalizedId = normalizeMemberIdentity(id)
  const normalizedName = normalizeMemberIdentity(name)
  const normalizedWard = normalizeMemberIdentity(ward)
  const normalizedAge = normalizeMemberIdentity(age)
  return (
    members.find((member) => {
      if (normalizedId && normalizeMemberIdentity(member.id) === normalizedId) {
        return true
      }

      if (normalizedName && normalizeMemberIdentity(member.name) === normalizedName) {
        return true
      }

      if (!normalizedWard) {
        return false
      }

      return [member.district, member.districtShort].some(
        (district) => normalizeMemberIdentity(district) === normalizedWard,
      )
    }) ?? null
  )
}

export function searchMembersByQuery(query) {
  const normalized = query.trim()

  if (!normalized) {
    return []
  }

  return members.filter((member) =>
    member.searchKeywords.some((keyword) => keyword.toLowerCase().includes(normalized.toLowerCase())),
  )
}

export function searchAddresses(query) {
  const normalized = query.trim()

  if (!normalized) {
    return []
  }

  return addressSuggestions.filter((address) => address.label.includes(normalized))
}

export function createDraftPost(title, body) {
  return {
    id: `draft-${title}`,
    title,
    excerpt: body,
    author: '정태용',
    date: todayLabel,
    status: 'pending',
  }
}
