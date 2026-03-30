export function ErrorView({errorMessage}) {
    return (
        <div className="page-container page-container--detail">
            <section className="panel">
                <p className="body-copy">{errorMessage || '국회의원 정보를 찾지 못했습니다.'}</p>
            </section>
        </div>
    )
}