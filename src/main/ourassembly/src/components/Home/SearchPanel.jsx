import { Icon } from '../Common/Icon.jsx'
import { AddressSearchForm } from './AddressSearchForm.jsx'
import { NameSearchForm } from './NameSearchForm.jsx'

export function SearchPanel({
                                mode,
                                onModeChange,
                                addressQuery,
                                addressResults,
                                addressFeedback,
                                onAddressQueryChange,
                                onAddressSubmit,
                                onAddressSelect,
                                onCurrentLocation,
                                nameQuery,
                                nameResults,
                                nameFeedback,
                                onNameQueryChange,
                                onNameSubmit,
                                onNameSelect,
                            }) {
    return (
        <div className="search-panel">
            <div className="search-tabs" role="tablist" aria-label="검색 방식">
                <button
                    className={`search-tabs__button ${mode === 'address' ? 'is-active' : ''}`}
                    onClick={() => onModeChange('address')}
                    role="tab"
                    type="button"
                >
                    <Icon className="search-tabs__icon" name="mapPin" />
                    <span>주소로 찾기</span>
                </button>
                <button
                    className={`search-tabs__button ${mode === 'name' ? 'is-active' : ''}`}
                    onClick={() => onModeChange('name')}
                    role="tab"
                    type="button"
                >
                    <Icon className="search-tabs__icon" name="searchUser" />
                    <span>이름으로 찾기</span>
                </button>
            </div>

            {mode === 'address' ? (
                <AddressSearchForm
                    query={addressQuery}
                    results={addressResults}
                    feedback={addressFeedback}
                    onQueryChange={onAddressQueryChange}
                    onSubmit={onAddressSubmit}
                    onSelect={onAddressSelect}
                    onCurrentLocation={onCurrentLocation}
                />
            ) : (
                <NameSearchForm
                    query={nameQuery}
                    results={nameResults}
                    feedback={nameFeedback}
                    onQueryChange={onNameQueryChange}
                    onSubmit={onNameSubmit}
                    onSelect={onNameSelect}
                />
            )}
        </div>
    )
}