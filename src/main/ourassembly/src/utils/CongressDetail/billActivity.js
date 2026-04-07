const SUMMARY_REVIEW_STAGES = new Set([
  'COMMITTEE_REFERRED',
  'COMMITTEE_PRESENTED',
  'COMMITTEE_PROCESSED',
  'LAW_REFERRED',
  'LAW_PRESENTED',
  'LAW_PROCESSED',
  'PLENARY_PRESENTED',
])

const TERMINAL_DISCARDED_RESULTS = new Set([
  'ALTERNATIVE_DISCARDED',
  'DISCARDED',
  'WITHDRAWN',
  'REJECTED',
])

const TERMINAL_PASSED_RESULTS = new Set([
  'PASSED',
  'ORIGINAL_PASSED',
  'AMENDED_PASSED',
])

export const billStatusFilters = [
  { id: 'all', label: '전체' },
  { id: 'proposed', label: '발의' },
  { id: 'review', label: '심사 중' },
  { id: 'passed', label: '통과' },
  { id: 'discarded', label: '폐기' },
]

export const billRoleTabs = [
  { id: 'LEAD', label: '대표 발의' },
  { id: 'CO', label: '공동 발의' },
]

export function formatBillCount(count) {
  if (typeof count !== 'number' || Number.isNaN(count)) {
    return '정보 없음'
  }

  return `${count}건`
}

export function formatDateLabel(date, suffix = '') {
  if (typeof date !== 'string' || !date.trim()) {
    return '정보 없음'
  }

  return suffix ? `${date} ${suffix}` : date
}

export function getBillSummaryBucket(bill) {
  if (!bill) {
    return 'proposed'
  }

  if (TERMINAL_DISCARDED_RESULTS.has(bill.currentResult)) {
    return 'discarded'
  }

  if (
    TERMINAL_PASSED_RESULTS.has(bill.currentResult) ||
    bill.currentStage === 'PLENARY_RESOLVED' ||
    bill.currentStage === 'GOVERNMENT_TRANSFERRED' ||
    bill.currentStage === 'PROMULGATED'
  ) {
    return 'passed'
  }

  if (SUMMARY_REVIEW_STAGES.has(bill.currentStage)) {
    return 'review'
  }

  return 'proposed'
}

export function getBillSummaryChip(bill) {
  const bucket = getBillSummaryBucket(bill)

  switch (bucket) {
    case 'passed':
      return { label: '통과', tone: 'passed', icon: 'checkCircle' }
    case 'discarded':
      return { label: '폐기', tone: 'discarded', icon: 'close' }
    case 'review':
      return { label: '심사 중', tone: 'review', icon: 'clock' }
    case 'proposed':
    default:
      return { label: '발의', tone: 'proposed', icon: 'book' }
  }
}

export function getBillDetailChip(detail) {
  if (!detail) {
    return { label: '상세 정보 없음', tone: 'default', icon: 'book' }
  }

  if (detail.currentResult === 'ALTERNATIVE_DISCARDED') {
    return { label: '대안 반영 폐기', tone: 'discarded', icon: 'close' }
  }

  if (detail.currentResult === 'DISCARDED') {
    return { label: '폐기', tone: 'discarded', icon: 'close' }
  }

  if (detail.currentResult === 'WITHDRAWN') {
    return { label: '철회', tone: 'discarded', icon: 'close' }
  }

  if (detail.currentResult === 'REJECTED') {
    return { label: '부결', tone: 'discarded', icon: 'close' }
  }

  if (detail.currentStage === 'PROMULGATED') {
    return { label: '공포', tone: 'passed', icon: 'checkCircle' }
  }

  if (detail.currentStage === 'GOVERNMENT_TRANSFERRED') {
    return { label: '정부 이송', tone: 'passed', icon: 'checkCircle' }
  }

  if (
    detail.currentStage === 'PLENARY_RESOLVED' ||
    TERMINAL_PASSED_RESULTS.has(detail.currentResult)
  ) {
    return { label: '본회의 통과', tone: 'passed', icon: 'checkCircle' }
  }

  if (detail.currentStage === 'PLENARY_PRESENTED') {
    return { label: '본회의 심사 중', tone: 'review', icon: 'clock' }
  }

  if (
    detail.currentStage === 'LAW_REFERRED' ||
    detail.currentStage === 'LAW_PRESENTED' ||
    detail.currentStage === 'LAW_PROCESSED'
  ) {
    return { label: '법사위 심사 중', tone: 'review', icon: 'clock' }
  }

  if (
    detail.currentStage === 'COMMITTEE_REFERRED' ||
    detail.currentStage === 'COMMITTEE_PRESENTED' ||
    detail.currentStage === 'COMMITTEE_PROCESSED'
  ) {
    return { label: '위원회 심사 중', tone: 'review', icon: 'clock' }
  }

  return { label: '발의', tone: 'proposed', icon: 'book' }
}

export function buildBillTimeline(detail) {
  if (!detail) {
    return []
  }

  return [
    { label: '제안일', value: detail.proposeDate },
    { label: '소관위 회부', value: detail.committeeReferredDate },
    { label: '소관위 상정', value: detail.committeePresentedDate },
    {
      label: '소관위 처리',
      value: joinTimelineValue(detail.committeeProcessedDate, detail.committeeProcessResult),
    },
    { label: '법사위 회부', value: detail.lawReferredDate },
    { label: '법사위 상정', value: detail.lawPresentedDate },
    {
      label: '법사위 처리',
      value: joinTimelineValue(detail.lawProcessedDate, detail.lawProcessResult),
    },
    { label: '본회의 상정', value: detail.plenaryPresentedDate },
    {
      label: '본회의 의결',
      value: joinTimelineValue(detail.plenaryResolvedDate, detail.plenaryResult),
    },
    { label: '정부 이송', value: detail.governmentTransferDate },
    {
      label: '공포',
      value: joinTimelineValue(detail.promulgationDate, detail.promulgationLawName),
    },
  ].filter((item) => typeof item.value === 'string' && item.value.trim())
}

export function getProposerNames(proposers, role) {
  if (!Array.isArray(proposers)) {
    return []
  }

  return proposers
    .filter((proposer) => proposer.role === role)
    .map((proposer) => proposer.name)
    .filter((name) => typeof name === 'string' && name.trim())
}

function joinTimelineValue(date, label) {
  if (typeof date === 'string' && date.trim() && typeof label === 'string' && label.trim()) {
    return `${date} · ${label}`
  }

  if (typeof date === 'string' && date.trim()) {
    return date
  }

  if (typeof label === 'string' && label.trim()) {
    return label
  }

  return ''
}
