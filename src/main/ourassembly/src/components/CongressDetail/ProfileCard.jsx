import { useState } from 'react';
import { formatValue } from "../../utils/CongressDetail/formatValue.js";
import { Portrait } from "../Common/Layout.jsx";
import { Icon } from "../Common/Icon.jsx";
import { Link } from "react-router-dom";

export function ProfileCard({
    member,
    hasPhotoError,
    onPhotoError,
    portraitMember,
    partyPresentation,
    committees,
    stats,
    tagline,
    messageTo,
    messageLabel = '의원에게 메시지 보내기',
    messageIcon = 'send',
    isOwnCongressPage,
}) {
    const [isFollowing, setIsFollowing] = useState(false);

    return (
        <section className="panel panel--profile">
            <div className="panel__accent" />
            <div className="profile-hero">
                {member.photoUrl && !hasPhotoError ? (
                    <div className="profile-photo">
                        <img
                            alt={`${formatValue(member.name)} 프로필 사진`}
                            className="profile-photo__image"
                            onError={() => onPhotoError(true)}
                            src={member.photoUrl}
                        />
                    </div>
                ) : (
                    <Portrait member={portraitMember} />
                )}

                <div className="profile-hero__content">
                    <div className="profile-hero__headline">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>

                            {!isOwnCongressPage && (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#f8fafc',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    width: 'fit-content',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <Icon name="bell" style={{ fontSize: '0.8rem', color: '#eab308' }} />
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                                        팔로우 시 의원 정보를 실시간 알림으로 받습니다
                                    </span>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <h1 className="profile-hero__name" style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
                                    {formatValue(member.name)}
                                </h1>

                                {!isOwnCongressPage && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => setIsFollowing(!isFollowing)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 16px',
                                                borderRadius: '30px',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                border: 'none',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                backgroundColor: isFollowing ? '#2563eb' : '#f1f5f9',
                                                color: isFollowing ? '#fff' : '#475569',
                                                boxShadow: isFollowing ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                                            }}
                                        >
                                            <Icon name={isFollowing ? 'check' : 'plus'} />
                                            <span>{isFollowing ? '팔로잉' : '팔로우'}</span>
                                        </button>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1 }}>followers</span>
                                            <strong style={{ fontSize: '0.9rem', color: '#334155' }}>1,245</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="profile-hero__district" style={{ margin: 0, color: '#64748b', fontWeight: '500' }}>
                                {formatValue(member.ward)}
                            </p>
                        </div>

                        <span className={`party-badge party-badge--${partyPresentation.tone}`} style={{ height: 'fit-content' }}>
                            {formatValue(member.party)}
                        </span>
                    </div>

                    <div className="profile-stat-grid">
                        {stats.map((stat) => (
                            <article key={stat.label} className="profile-stat">
                                <Icon className="profile-stat__icon" name={stat.icon} />
                                <div>
                                    <span className="profile-stat__label">{stat.label}</span>
                                    <strong>{stat.value}</strong>
                                </div>
                            </article>
                        ))}
                    </div>

                    {committees.length > 0 && (
                        <div className="committee-row">
                            <img src="/committee.svg" alt="" />
                            {committees.map((badge) => (
                                <span key={badge} className="committee-pill">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-cta">
                <p>{tagline}</p>
                {messageTo ? (
                    <Link className="button button--primary button--wide profile-cta__button" to={messageTo}>
                        <Icon className="button__icon" name={messageIcon} />
                        <span>{messageLabel}</span>
                        <Icon className="button__icon button__icon--trail" name="chevronRight" />
                    </Link>
                ) : null}
            </div>
        </section>
    );
}