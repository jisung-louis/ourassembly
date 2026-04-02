import { Icon } from '../Common/Icon.jsx'

export function FindButton({ query, onCurrentLocation, label = '내 국회의원 찾기' }) {
    return (
        <>
            {onCurrentLocation ? (
                <button
                    className="button button--soft"
                    onClick={onCurrentLocation}
                    type="button"
                >
                    <Icon className="button__icon" name="spark" />
                    <span>현재 위치 자동 감지</span>
                </button>
            ) : null}

            <button
                className={`button button--primary button--block ${query.trim() ? '' : 'is-disabled'}`}
                disabled={!query.trim()}
                type="submit"
            >
                {label}
            </button>
        </>
    )
}