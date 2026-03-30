import { LogoMark } from '../../../components/Icon.jsx'

export function HomeHeroSection() {

  return (
    <section className="home-hero">
      <div className="home-hero__badge">
        <div className="home-hero__brandmark">
          <LogoMark className="home-hero__brandicon" />
        </div>
      </div>

      <div className="home-hero__copy">
        <h1>우리동네 국회의원</h1>
        <p>내 지역구를 대표하는 국회의원을 바로 찾고, 직접 의견을 전달해 보세요.</p>
      </div>
    </section>
  )
}
