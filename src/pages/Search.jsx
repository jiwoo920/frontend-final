import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="page loginBg">
      <Navbar />

      <main className="loginPageFigma">
        <div className="loginDecor loginDecorTop" />
        <div className="loginDecor loginDecorBottom" />

        <section className="loginBox">
          <h1 className="loginMainTitle">밈 라이브러리</h1>
          <div className="loginSubBadge">당신이 찾고 있는 모든 밈을 한눈에</div>

          <form className="loginFormFigma">
            <input
              type="text"
              placeholder="이름"
              className="loginInputFigma"
            />
            <input
              type="email"
              placeholder="이메일"
              className="loginInputFigma"
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="loginInputFigma"
            />

            <button type="submit" className="loginSubmitBtn">
              회원가입
            </button>
          </form>

          <p className="loginBottomText">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </section>
      </main>
    </div>
  );
}