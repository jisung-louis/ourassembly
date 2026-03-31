import {formatValue} from "../../utils/CongressDetail/formatValue.js";
import {Link} from "react-router-dom";
import {Icon} from "../Common/Icon.jsx";

export function TopNavigation({member}) {
    return (
        <nav className="breadcrumb" aria-label="현재 위치">
            <Link className="breadcrumb__link" to="/">
                검색
            </Link>
            <Icon className="breadcrumb__icon" name="chevronRight" />
            <span>{formatValue(member.ward)}</span>
            <Icon className="breadcrumb__icon" name="chevronRight" />
            <strong>{formatValue(member.name)}</strong>
        </nav>
    )
}