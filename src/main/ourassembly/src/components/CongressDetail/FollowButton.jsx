<div className="profile-hero__headline">
    {/* 이름과 버튼, 숫자를 하나의 그룹으로 묶음 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="profile-hero__name">{formatValue(member.name)}</h1>

            {!isOwnCongressPage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            backgroundColor: isFollowing ? '#6366f1' : '#fff',
                            color: isFollowing ? '#fff' : '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        {isFollowing ? '✓ 팔로잉' : '+ 팔로우'}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        <strong style={{ color: '#64748b' }}>1,245</strong>명
                    </span>
                </div>
            )}
        </div>
        <p className="profile-hero__district">{formatValue(member.ward)}</p>
    </div>

    {/* 정당 배지는 그대로 유지 */}
    <span className={`party-badge party-badge--${partyPresentation.tone}`}>
        {formatValue(member.party)}
    </span>
</div>