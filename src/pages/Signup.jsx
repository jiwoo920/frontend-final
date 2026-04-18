import { Link } from "react-router-dom";

export default function Signup() {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="page signupBg">
      <main className="signupPage">
        <div className="signupCanvas">
          <div className="signupFrame signupFrameTop" aria-hidden="true" />
          <div className="signupFrame signupFrameBottom" aria-hidden="true" />

          <section className="signupCard">
            <h1 className="signupTitle">밈 라이브러리</h1>
            <div className="signupBadge">당신이 찾고 있는 모든 밈을 한눈에</div>

            <form className="signupForm" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="이메일"
                className="signupInput"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="비밀번호"
                className="signupInput"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="비밀번호 확인"
                className="signupInput"
                autoComplete="new-password"
              />

              <button type="submit" className="signupSubmitBtn">
                회원가입
              </button>
            </form>

            <p className="signupBottomText">
              Already have an account? <Link to="/login">Log in now</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
