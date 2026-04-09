import { DISTRICTS } from '../../../services/districts.js'

export function DistrictSelect({ value, onChange, excludeAll = false, disabled = false }) {
  const options = excludeAll ? DISTRICTS.filter((d) => d !== '전체') : DISTRICTS

  return (
    <div className="comm-select-wrap">
      <select
        className={`comm-select ${(!value || value === '전체') ? 'comm-select--placeholder' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {excludeAll
          ? <option value="" disabled>지역을 선택해 주세요</option>
          : <option value="전체">전체 지역</option>
        }
        {options.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <span className="comm-select-arrow">▾</span>
    </div>
  )
}
