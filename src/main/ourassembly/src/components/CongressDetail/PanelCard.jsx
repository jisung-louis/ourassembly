import {Icon} from "../Common/Icon.jsx";

export function PanelCard({icon, title, content, children}) {
    return(
        <section className="panel">
            <SectionHeading icon={icon} title={title} />
            <p className="body-copy body-copy--multiline">
                {content}
            </p>
            {children}
        </section>

    )
}

function SectionHeading({ title, icon }) {
    return (
        <div className="section-heading">
            <div className="section-heading__main">
                <Icon className="section-heading__icon" name={icon} />
                <div className="section-heading__text">
                    <h2>{title}</h2>
                </div>
            </div>
        </div>
    )
}