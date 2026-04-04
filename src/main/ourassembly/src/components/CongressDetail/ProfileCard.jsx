import {formatValue} from "../../utils/CongressDetail/formatValue.js";
import {Portrait} from "../Common/Layout.jsx";
import {Icon} from "../Common/Icon.jsx";
import {Link} from "react-router-dom";

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
}) {
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
                        <div>
                            <h1 className="profile-hero__name">{formatValue(member.name)}</h1>
                            <p className="profile-hero__district">{formatValue(member.ward)}</p>
                        </div>
                        <span className={`party-badge party-badge--${partyPresentation.tone}`}>
                            {formatValue(member.party)}
                        </span>
                    </div>

                    <div className="profile-stat-grid">
                        {stats.map((stat) =>
                        (
                            <article key={stat.label} className="profile-stat">
                                <Icon className="profile-stat__icon" name={stat.icon} />
                                <div>
                                    <span className="profile-stat__label">{stat.label}</span>
                                    <strong>{stat.value}</strong>
                                </div>
                            </article>
                        ))}
                    </div>

                    {committees.length > 0 ? (
                        <div className="committee-row">
                            <img src="/committee.svg"/>
                            {committees.map((badge) => (
                                <span key={badge} className="committee-pill">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    ) : null}
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
    )
}
