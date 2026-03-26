export function LogoMark({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="37" height="37" rx="12" fill="#FFFFFF" stroke="#E7E5E4" />
      <circle cx="14" cy="14" r="5.5" fill="#F59E0B" />
      <circle cx="26" cy="14" r="5.5" fill="#EF4444" />
      <circle cx="14" cy="26" r="5.5" fill="#047857" />
      <circle cx="26" cy="26" r="5.5" fill="#0EA5E9" />
      <path
        d="M14 19.5L20 14M20 14L26 19.5M20 14V26"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 1.8,
}

export function Icon({ name, className = '', title }) {
  const label = title ? <title>{title}</title> : null

  switch (name) {
    case 'arrowLeft':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M19 12H5M12 19L5 12L12 5" />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M9 6L15 12L9 18" />
        </svg>
      )
    case 'mapPin':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path
            {...iconProps}
            d="M12 20C15.5 16.4 18 13.7 18 10.5C18 7 15.3 4.5 12 4.5C8.7 4.5 6 7 6 10.5C6 13.7 8.5 16.4 12 20Z"
          />
          <circle {...iconProps} cx="12" cy="10.5" r="2.2" />
        </svg>
      )
    case 'searchUser':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <circle {...iconProps} cx="10.5" cy="8.5" r="3.5" />
          <path {...iconProps} d="M4.5 18C5.8 15.6 7.9 14.5 10.5 14.5C13.1 14.5 15.2 15.6 16.5 18" />
          <path {...iconProps} d="M17 9.5H21M19 7.5V11.5" />
        </svg>
      )
    case 'close':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M8 8L16 16M16 8L8 16" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M12 4L18 6.5V10.8C18 14.6 15.5 17.8 12 19.5C8.5 17.8 6 14.6 6 10.8V6.5L12 4Z" />
          <path {...iconProps} d="M9.2 11.8L11 13.5L14.8 9.8" />
        </svg>
      )
    case 'landmark':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M4 9H20M6 9V17M10 9V17M14 9V17M18 9V17M3 20H21M12 4L20 8H4L12 4Z" />
        </svg>
      )
    case 'chat':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M6.5 17.5L4.5 19.5V7.5C4.5 6.4 5.4 5.5 6.5 5.5H17.5C18.6 5.5 19.5 6.4 19.5 7.5V15.5C19.5 16.6 18.6 17.5 17.5 17.5H6.5Z" />
        </svg>
      )
    case 'send':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M20 4L4.5 11.2L10.8 13.1L12.8 19.5L20 4Z" />
          <path {...iconProps} d="M10.5 13.2L20 4" />
        </svg>
      )
    case 'book':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M6.5 5.5H15.5C17.2 5.5 18.5 6.8 18.5 8.5V18.5H9.5C7.8 18.5 6.5 17.2 6.5 15.5V5.5Z" />
          <path {...iconProps} d="M6.5 8.5H15.5" />
        </svg>
      )
    case 'inbox':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M5.5 7.5L4.5 18.5H19.5L18.5 7.5H5.5Z" />
          <path {...iconProps} d="M4.8 14.5H9L10.5 16H13.5L15 14.5H19.2" />
        </svg>
      )
    case 'gavel':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M14 5L19 10M8 11L13 16M6 18L18 6M10.5 3.5L16.5 9.5L13.5 12.5L7.5 6.5L10.5 3.5ZM5.5 13.5L11.5 19.5L8.5 22.5L2.5 16.5L5.5 13.5Z" />
        </svg>
      )
    case 'newspaper':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M6.5 6.5H17.5V17.5C17.5 18.6 16.6 19.5 15.5 19.5H8.5C7.4 19.5 6.5 18.6 6.5 17.5V6.5Z" />
          <path {...iconProps} d="M17.5 8.5H20V17C20 18.4 18.9 19.5 17.5 19.5" />
          <path {...iconProps} d="M9.5 10H14.5M9.5 13H14.5M9.5 16H12.5" />
        </svg>
      )
    case 'mail':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M5 7.5H19V17.5H5V7.5Z" />
          <path {...iconProps} d="M5 8L12 13L19 8" />
        </svg>
      )
    case 'phone':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M7.5 5.5L10 8L8.5 10.5C9.8 13.1 10.9 14.2 13.5 15.5L16 14L18.5 16.5L16.6 19C16.2 19.5 15.5 19.8 14.9 19.7C9.8 19 5 14.2 4.3 9.1C4.2 8.5 4.5 7.8 5 7.4L7.5 5.5Z" />
        </svg>
      )
    case 'building':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M7 20V6.5L12 4.5L17 6.5V20M4.5 20H19.5M10 9.5H11M13 9.5H14M10 12.5H11M13 12.5H14M10 15.5H11M13 15.5H14" />
        </svg>
      )
    case 'checkCircle':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <circle {...iconProps} cx="12" cy="12" r="8.5" />
          <path {...iconProps} d="M8.5 12L11 14.5L15.5 10" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <circle {...iconProps} cx="12" cy="12" r="8.5" />
          <path {...iconProps} d="M12 8V12L15 13.8" />
        </svg>
      )
    case 'user':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <circle {...iconProps} cx="12" cy="8.5" r="3.5" />
          <path {...iconProps} d="M5.5 18C6.9 15.7 9.1 14.5 12 14.5C14.9 14.5 17.1 15.7 18.5 18" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M6 5.5H18V18.5H6V5.5Z" />
          <path {...iconProps} d="M8.5 3.5V7.5M15.5 3.5V7.5M6 9.5H18" />
        </svg>
      )
    case 'committee':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M7.5 6.5H16.5M7.5 10.5H16.5M7.5 14.5H12.5" />
          <path {...iconProps} d="M6.5 4.5H17.5C18.1 4.5 18.5 4.9 18.5 5.5V18.5L15.5 16.5L12.5 18.5L9.5 16.5L6.5 18.5V5.5C6.5 4.9 6.9 4.5 7.5 4.5Z" />
        </svg>
      )
    case 'spark':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden={!title}>
          {label}
          <path {...iconProps} d="M12 3.5L13.7 8.3L18.5 10L13.7 11.7L12 16.5L10.3 11.7L5.5 10L10.3 8.3L12 3.5Z" />
        </svg>
      )
    default:
      return null
  }
}
