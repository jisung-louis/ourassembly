export function formatValue(value, fallback = '정보 없음') {
    if (typeof value !== 'string') {
        return fallback
    }

    const normalizedValue = value.trim()
    return normalizedValue || fallback
}