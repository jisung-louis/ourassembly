import { Icon } from '../Common/Icon.jsx'
import { homeInfoCards } from '../../data/mockData.js'

export function InfoCardGrid() {
    return (
        <div className="info-card-grid">
            {homeInfoCards.map((card) => (
                <article key={card.id} className="info-card">
                    <div className="info-card__icon-wrap">
                        <Icon className="info-card__icon" name={card.icon} />
                    </div>
                    <strong className="info-card__title">{card.title}</strong>
                    <p className="info-card__description">{card.description}</p>
                </article>
            ))}
        </div>
    )
}