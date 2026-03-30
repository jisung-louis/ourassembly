import {formatValue} from "../../utils/CongressDetail/formatValue.js";
import {Portrait} from "../Common/Layout.jsx";
import {Icon} from "../Common/Icon.jsx";

export function ProfileCard({member, hasPhotoError, onPhotoError, portraitMember, partyPresentation}) {

    const badges = [member.party, member.ward].filter((value) => typeof value === 'string' && value.trim())
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
                        <article className="profile-stat">
                            <Icon className="profile-stat__icon" name="landmark" />
                            <div>
                                <span className="profile-stat__label">정당</span>
                                <strong>{formatValue(member.party)}</strong>
                            </div>
                        </article>
                        <article className="profile-stat">
                            <Icon className="profile-stat__icon" name="committee" />
                            <div>
                                <span className="profile-stat__label">당선 횟수</span>
                                <strong>{formatValue(member.numberOfReElection)}</strong>
                            </div>
                        </article>
                        <article className="profile-stat">
                            <Icon className="profile-stat__icon" name="mapPin" />
                            <div>
                                <span className="profile-stat__label">지역구</span>
                                <strong>{formatValue(member.ward)}</strong>
                            </div>
                        </article>
                        <article className="profile-stat">
                            <Icon className="profile-stat__icon" name="phone" />
                            <div>
                                <span className="profile-stat__label">대표 연락처</span>
                                <strong>{formatValue(member.tel)}</strong>
                            </div>
                        </article>
                    </div>

                    {badges.length > 0 ? (
                        <div className="committee-row">
                            {badges.map((badge) => (
                                <span key={badge} className="committee-pill">
                      {badge}
                    </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="profile-cta">
                <p>국회 공개 데이터를 기반으로 지역구와 연락처 정보를 확인할 수 있습니다.</p>
            </div>
        </section>
    )
}