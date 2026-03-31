import {Icon} from "../Common/Icon.jsx";

export function PanelCard({icon, title, content, children}) {
    return(
        <section className="panel">
            <SectionHeading icon={icon} title={title} />
            {content ? (
                <p className="body-copy body-copy--multiline">
                    {content}
                </p>
            ) : null}
            {children}
        </section>

    )
}

export function SectionHeading({ title, icon, badge, action }) {
    return (
        <div className="section-heading">
            <div className="section-heading__main">
                <Icon className="section-heading__icon" name={icon} />
                <div className="section-heading__text">
                    <h2>{title}</h2>
                    {badge}
                </div>
            </div>
            {action}
        </div>
    )
}
