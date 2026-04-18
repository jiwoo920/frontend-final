import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import {
  saveProfilePreferences,
  useProfilePreferences,
} from "../profilePreferences";

export default function ProfileEditPage() {
  const { user } = useAuth0();
  const profilePreferences = useProfilePreferences(user);
  const [nicknameInput, setNicknameInput] = useState(profilePreferences.nickname);
  const [emailInput, setEmailInput] = useState(profilePreferences.email);
  const [passwordInput, setPasswordInput] = useState("");
  const [privacyValue, setPrivacyValue] = useState(profilePreferences.isProfilePrivate);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setNicknameInput(profilePreferences.nickname);
    setEmailInput(profilePreferences.email);
    setPrivacyValue(profilePreferences.isProfilePrivate);
  }, [
    profilePreferences.email,
    profilePreferences.isProfilePrivate,
    profilePreferences.nickname,
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nickname = nicknameInput.trim();
    const email = emailInput.trim();

    if (!nickname) {
      setErrorMessage("닉네임을 입력해 주세요.");
      setFeedbackMessage("");
      return;
    }

    if (!email) {
      setErrorMessage("이메일을 입력해 주세요.");
      setFeedbackMessage("");
      return;
    }

    saveProfilePreferences(user, {
      nickname,
      email,
      isProfilePrivate: privacyValue,
    });

    setErrorMessage("");
    setFeedbackMessage(
      passwordInput.trim()
        ? "프로필을 저장했어요. 비밀번호는 Auth0 계정 설정에서 따로 관리돼요."
        : "프로필을 저장했어요."
    );
    setPasswordInput("");
  };

  return (
    <div className="page myPage profileEditPage">
      <Navbar />

      <main className="myPageContent">
        <section className="profileEditShell">
          <div className="profileEditHeader">
            <div>
              <h1>프로필 수정</h1>
              <p>앱에서 보이는 닉네임, 이메일과 저장보드 공개 여부를 바꿀 수 있어요.</p>
            </div>

            <Link to="/mypage" className="profileEditBackBtn">
              마이페이지로 돌아가기
            </Link>
          </div>

          <form className="profileEditForm" onSubmit={handleSubmit}>
            <div className="profileEditField">
              <label htmlFor="profile-nickname">닉네임</label>
              <input
                id="profile-nickname"
                type="text"
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                required
              />
            </div>

            <div className="profileEditField">
              <label htmlFor="profile-email">이메일</label>
              <input
                id="profile-email"
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                required
              />
            </div>

            <div className="profileEditField">
              <label htmlFor="profile-password">새 비밀번호</label>
              <input
                id="profile-password"
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="Auth0 계정 설정에서 관리돼요"
              />
              <p>비밀번호 변경은 Auth0 로그인 계정 설정에서 처리돼요.</p>
            </div>

            <div className="profileEditField">
              <span className="profileEditLabel">저장보드 공개 설정</span>
              <div className="profileEditPrivacyRow" aria-label="저장 보드 공개 설정">
                <button
                  type="button"
                  className={`profileEditPrivacyBtn${!privacyValue ? " isActive" : ""}`}
                  onClick={() => setPrivacyValue(false)}
                  aria-pressed={!privacyValue}
                >
                  공개
                </button>
                <button
                  type="button"
                  className={`profileEditPrivacyBtn${privacyValue ? " isActive" : ""}`}
                  onClick={() => setPrivacyValue(true)}
                  aria-pressed={privacyValue}
                >
                  비공개
                </button>
              </div>
            </div>

            {errorMessage && <p className="profileEditMessage isError">{errorMessage}</p>}
            {feedbackMessage && (
              <p className="profileEditMessage isSuccess">{feedbackMessage}</p>
            )}

            <div className="profileEditActions">
              <Link to="/mypage" className="profileEditCancelBtn">
                취소
              </Link>
              <button type="submit" className="profileEditSaveBtn">
                저장
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
