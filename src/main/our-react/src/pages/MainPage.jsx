export default function MainPage({ onNavigate }) {
    return (
        <div style={styles.container}>
            {/* 헤더 */}
            <header style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.logo}>
                        <span style={styles.logoIcon}>🏛️</span>
                        <span style={styles.logoText}>우리동네 국회의원</span>
                    </div>
                    <nav style={styles.nav}>
                        <span style={styles.navItem}>의원 정보</span>
                        <span style={styles.navItem}>소통 게시판</span>
                        <span style={styles.navItem}>민원 현황</span>
                        <button
                            style={styles.logoutBtn}
                            onClick={() => {
                                sessionStorage.removeItem("token");
                                onNavigate("login");
                            }}
                        >
                            로그아웃
                        </button>
                    </nav>
                </div>
            </header>

            {/* 히어로 */}
            <section style={styles.hero}>
                <div style={styles.heroInner}>
                    <div style={styles.heroBadge}>🗺️ 내 지역구 찾기</div>
                    <h1 style={styles.heroTitle}>
                        우리 동네 국회의원,<br />
                        <span style={styles.heroAccent}>알고 소통하다</span>
                    </h1>
                    <p style={styles.heroSub}>
                        지역구 의원의 의정활동을 한눈에 확인하고<br />
                        직접 목소리를 전달하세요
                    </p>
                    <div style={styles.searchWrap}>
                        <select style={styles.select}>
                            <option>시/도 선택</option>
                            <option>서울특별시</option>
                            <option>경기도</option>
                            <option>부산광역시</option>
                        </select>
                        <select style={styles.select}>
                            <option>구/군 선택</option>
                        </select>
                        <button style={styles.searchBtn}>🔍 찾기</button>
                    </div>
                </div>
            </section>

            {/* 통계 */}
            <section style={styles.stats}>
                {[
                    { num: "300+", label: "국회의원 정보" },
                    { num: "17개", label: "시/도 지역" },
                    { num: "실시간", label: "의정활동 추적" },
                    { num: "AI", label: "법안 요약" },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <div style={styles.statNum}>{s.num}</div>
                        <div style={styles.statLabel}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* 주요 기능 */}
            <section style={styles.features}>
                <h2 style={styles.sectionTitle}>주요 기능</h2>
                <div style={styles.featureGrid}>
                    {[
                        {
                            icon: "👤",
                            title: "의원 프로필",
                            desc: "지역구 의원의 프로필, 공약, 발의 법안을 한눈에 확인하세요",
                        },
                        {
                            icon: "📋",
                            title: "민원 게시판",
                            desc: "지역 현안을 올리고 다른 주민들과 의견을 나눠보세요",
                        },
                        {
                            icon: "🌡️",
                            title: "소통 온도",
                            desc: "의원의 답변율과 행보 추적으로 소통 온도를 확인하세요",
                        },
                        {
                            icon: "🤖",
                            title: "AI 요약",
                            desc: "어려운 법안을 AI가 쉬운 언어로 요약해드립니다",
                        },
                    ].map((f, i) => (
                        <div key={i} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <div style={styles.featureTitle}>{f.title}</div>
                            <div style={styles.featureDesc}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 푸터 */}
            <footer style={styles.footer}>
                <div style={styles.footerInner}>
                    <span>© 2026 우리동네 국회의원. All rights reserved.</span>
                    <div style={styles.footerLinks}>
                        <span style={styles.footerLink}>이용약관</span>
                        <span style={styles.footerLink}>개인정보처리방침</span>
                        <span style={styles.footerLink}>문의하기</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Noto Sans KR', sans-serif",
        minHeight: "100vh",
        background: "#fff",
    },
    header: {
        position: "sticky",
        top: 0,
        background: "#fff",
        borderBottom: "1px solid #e8f5e9",
        zIndex: 100,
        padding: "0 24px",
    },
    headerInner: {
        maxWidth: "1100px",
        margin: "0 auto",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    logoIcon: { fontSize: "22px" },
    logoText: {
        fontSize: "16px",
        fontWeight: 700,
        color: "#1a1a1a",
    },
    nav: {
        display: "flex",
        alignItems: "center",
        gap: "24px",
    },
    navItem: {
        fontSize: "14px",
        color: "#555",
        cursor: "pointer",
    },
    logoutBtn: {
        padding: "8px 16px",
        background: "transparent",
        border: "1px solid #3d9970",
        borderRadius: "6px",
        color: "#3d9970",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
    },
    hero: {
        background: "linear-gradient(135deg, #f0f7f4 0%, #e8f5e9 100%)",
        padding: "80px 24px",
    },
    heroInner: {
        maxWidth: "700px",
        margin: "0 auto",
        textAlign: "center",
    },
    heroBadge: {
        display: "inline-block",
        background: "#e8f5e9",
        color: "#2e7d5e",
        padding: "6px 16px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 600,
        marginBottom: "20px",
    },
    heroTitle: {
        fontSize: "40px",
        fontWeight: 800,
        color: "#1a1a1a",
        lineHeight: 1.3,
        marginBottom: "16px",
    },
    heroAccent: {
        color: "#3d9970",
    },
    heroSub: {
        fontSize: "16px",
        color: "#666",
        lineHeight: 1.6,
        marginBottom: "32px",
    },
    searchWrap: {
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    select: {
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        fontSize: "14px",
        background: "#fff",
        cursor: "pointer",
        minWidth: "160px",
    },
    searchBtn: {
        padding: "12px 24px",
        background: "#3d9970",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
    },
    stats: {
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        padding: "40px 24px",
        background: "#fff",
        flexWrap: "wrap",
    },
    statCard: {
        textAlign: "center",
        padding: "24px 40px",
        background: "#f8fdf9",
        borderRadius: "12px",
        minWidth: "140px",
    },
    statNum: {
        fontSize: "28px",
        fontWeight: 800,
        color: "#3d9970",
        marginBottom: "4px",
    },
    statLabel: {
        fontSize: "13px",
        color: "#888",
    },
    features: {
        padding: "60px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
    },
    sectionTitle: {
        fontSize: "26px",
        fontWeight: 800,
        color: "#1a1a1a",
        textAlign: "center",
        marginBottom: "40px",
    },
    featureGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
    },
    featureCard: {
        padding: "28px",
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #e8f5e9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "transform 0.2s",
    },
    featureIcon: {
        fontSize: "32px",
        marginBottom: "12px",
    },
    featureTitle: {
        fontSize: "16px",
        fontWeight: 700,
        color: "#1a1a1a",
        marginBottom: "8px",
    },
    featureDesc: {
        fontSize: "13px",
        color: "#888",
        lineHeight: 1.6,
    },
    footer: {
        background: "#f8fdf9",
        borderTop: "1px solid #e8f5e9",
        padding: "24px",
    },
    footerInner: {
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "13px",
        color: "#888",
        flexWrap: "wrap",
        gap: "12px",
    },
    footerLinks: {
        display: "flex",
        gap: "16px",
    },
    footerLink: {
        cursor: "pointer",
        color: "#3d9970",
    },
};
