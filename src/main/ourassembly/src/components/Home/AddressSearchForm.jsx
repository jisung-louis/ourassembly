import { Icon } from '../Common/Icon.jsx'
import { FindButton } from './FindButton.jsx'

export function AddressSearchForm({
                                      query,
                                      results,
                                      feedback,
                                      onQueryChange,
                                      onSubmit,
                                      onSelect,
                                      onCurrentLocation,
                                  }) {
    return (
        <form className="search-form" onSubmit={onSubmit}>
            <label className="field-label" htmlFor="home-address">
                내 주소 입력
            </label>

            <div className="input-shell">
                <Icon className="input-shell__icon" name="mapPin" />
                <input
                    id="home-address"
                    className="input-shell__input"
                    type="text"
                    placeholder="예) 잠실동, 성산동, 송도5동"
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
                        <span className="sr-only">주소 입력 지우기</span>
                    </button>
                ) : null}

                {results.length > 0 && query.trim() ? (
                    <div className="search-dropdown search-dropdown--address">
                        <div className="search-dropdown__header">{results.length}개의 주소</div>
                        <ul className="search-dropdown__list">
                            {results.map((result) => (
                                <li key={result.id}>
                                    <button
                                        className="search-dropdown__item search-dropdown__item--member"
                                        onClick={() => onSelect(result.congressmanId)}
                                        type="button"
                                    >
                                        <Icon className="search-dropdown__item-icon" name="mapPin" />
                                        <div className="search-dropdown__member">
                                            <div className="search-dropdown__member-head">
                                                <strong>{result.fullAddress}</strong>
                                            </div>
                                            <span className="search-dropdown__member-meta">
                        {result.congressmanName ?? '담당 국회의원 정보 없음'}
                                                {result.congressmanWard ? ` · ${result.congressmanWard}` : ''}
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

            <FindButton
                query={query}
                onCurrentLocation={onCurrentLocation}
            />
        </form>
    )
}