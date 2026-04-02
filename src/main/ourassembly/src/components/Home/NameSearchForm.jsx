import { Avatar } from '../Common/Layout.jsx'
import { Icon } from '../Common/Icon.jsx'
import { nameQuickFilters } from '../../data/mockData.js'
import { FindButton } from './FindButton.jsx'

const partyToneRules = [
    { keyword: '국민의힘', tone: 'amber' },
    { keyword: '보수', tone: 'amber' },
    { keyword: '민주', tone: 'green' },
    { keyword: '진보', tone: 'green' },
    { keyword: '개혁', tone: 'green' },
    { keyword: '조국', tone: 'violet' },
    { keyword: '혁신', tone: 'violet' },
]

function getPartyTone(party = '') {
    return partyToneRules.find((r) => party.includes(r.keyword))?.tone ?? 'violet'
}

function getAvatarTheme(party = '') {
    const tone = getPartyTone(party)
    if (tone === 'green') return 'emerald'
    if (tone === 'amber') return 'amber'
    return 'violet'
}

function getAvatarLabel(name = '') {
    return name.replace(/\s+/g, '').replace(/의원$/, '').slice(0, 2) || '?'
}

export function NameSearchForm({
                                   query,
                                   results,
                                   feedback,
                                   onQueryChange,
                                   onSubmit,
                                   onSelect,
                               }) {
    return (
        <form className="search-form" onSubmit={onSubmit}>
            <label className="field-label" htmlFor="home-name">
                국회의원 이름 검색
            </label>

            <div className="input-shell">
                <Icon className="input-shell__icon" name="searchUser" />
                <input
                    id="home-name"
                    className="input-shell__input"
                    type="text"
                    placeholder="예) 김, 박준혁"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                />
                {query ? (
                    <button
                        className="input-shell__clear"
                        onClick={() => onQueryChange('')}
                        type="button"
                    >
                        <Icon className="input-shell__clear-icon" name="close" />
                        <span className="sr-only">이름 입력 지우기</span>
                    </button>
                ) : null}

                {results.length > 0 && query.trim() ? (
                    <div className="search-dropdown search-dropdown--members">
                        <div className="search-dropdown__header">{results.length}명의 의원</div>
                        <ul className="search-dropdown__list search-dropdown__list--members">
                            {results.map((member) => (
                                <li key={member.congressmanId}>
                                    <button
                                        className="search-dropdown__item search-dropdown__item--member"
                                        onClick={() => onSelect(member.congressmanId)}
                                        type="button"
                                    >
                                        <Avatar
                                            member={{
                                                avatarLabel: getAvatarLabel(member.congressmanName),
                                                name: member.congressmanName,
                                                photoUrl: member.congressmanPhotoUrl,
                                                theme: getAvatarTheme(member.congressmanParty),
                                            }}
                                            size="sm"
                                        />
                                        <div className="search-dropdown__member">
                                            <div className="search-dropdown__member-head">
                                                <strong>{member.congressmanName}</strong>
                                                <span className={`party-badge party-badge--${getPartyTone(member.congressmanParty)}`}>
                          {member.congressmanParty ?? '정당 정보 없음'}
                        </span>
                                            </div>
                                            <span className="search-dropdown__member-meta">
                        {member.congressmanWard ?? '지역구 정보 없음'}
                      </span>
                                        </div>
                                        <Icon className="search-dropdown__item-arrow" name="chevronRight" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>

            {feedback ? (
                <p className={`search-form__feedback ${feedback.tone === 'error' ? 'is-error' : ''}`}>
                    {feedback.text}
                </p>
            ) : null}

            {!query.trim() ? (
                <div className="quick-chip-row">
                    {nameQuickFilters.map((filter) => (
                        <button
                            key={filter.label}
                            className="quick-chip"
                            onClick={() => onQueryChange(filter.query)}
                            type="button"
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            ) : null}

            <FindButton
                query={query}
                label="내 국회의원 찾기"
            />
        </form>
    )
}