import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import {
  saveProfilePreferences,
  useProfilePreferences,
} from "../profilePreferences";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ProfileEditPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const profilePreferences = useProfilePreferences(user);
  const [nicknameInput, setNicknameInput] = useState(profilePreferences.nickname);
  const [emailInput, setEmailInput] = useState(profilePreferences.email);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setNicknameInput(profilePreferences.nickname);
    setEmailInput(profilePreferences.email);
  }, [profilePreferences.email, profilePreferences.nickname]);

  useEffect(() => {
    // 현재 프로필 이미지 불러오기
    const fetchProfile = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profileImagePath) {
            setProfileImageUrl(`${API}/uploads/${data.profileImagePath}`);
          }
        }
      } catch (err) {
        console.error("프로필 이미지 불러오기 실패:", err);
      }
    };
    fetchProfile();
  }, [getAccessTokenSilently]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/users/me/profile-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfileImageUrl(`${API}/uploads/${data.profileImagePath}`);
        setFeedbackMessage("프로필 사진이 변경됐어요.");
      } else {
        setErrorMessage("프로필 사진 업로드에 실패했어요.");
      }
    } catch (err) {
      console.error("프로필 사진 업로드 실패:", err);
      setErrorMessage("프로필 사진 업로드에 실패했어요.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nickname = nicknameInput.trim();
    if (!nickname) {
      setErrorMessage("닉네임을 입력해 주세요.");
      setFeedbackMessage("");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) {
        setErrorMessage("닉네임 저장에 실패했어요.");
        return;
      }
    } catch (err) {
      console.error("닉네임 저장 실패:", err);
      setErrorMessage("닉네임 저장에 실패했어요.");
      return;
    }

    saveProfilePreferences(user, { ...profilePreferences, nickname });
    setErrorMessage("");
    setFeedbackMessage("프로필을 저장했어요.");
  };

  return (
      <div className="page myPage profileEditPage">
        <Navbar />
        <main className="myPageContent">
          <section className="profileEditShell">
            <div className="profileEditHeader">
              <div>
                <h1>프로필 수정</h1>
                <p>프로필 사진과 닉네임을 바꿀 수 있어요.</p>
              </div>
              <Link to="/mypage" className="profileEditBackBtn">
                마이페이지로 돌아가기
              </Link>
            </div>

            <form className="profileEditForm" onSubmit={handleSubmit}>
              {/* 프로필 사진 */}
              <div className="profileEditField">
                <span className="profileEditLabel">프로필 사진</span>
                <div className="profileImageEditRow">
                  <div className="profileImagePreview">
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt="프로필" className="profileImagePreviewImg" />
                    ) : (
                        <div className="profileImagePreviewEmpty" />
                    )}
                  </div>
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="srOnlyInput"
                      onChange={handleImageChange}
                  />
                  <div className="profileImageChangeBtnWrap">
                    <button
                        type="button"
                        className="profileImageChangeBtn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                    >
                      {imageUploading ? "업로드 중..." : "프로필 사진 변경"}
                    </button>
                    <p className="profileImageHint">JPG, PNG, WEBP 업로드 가능</p>
                  </div>
                </div>
              </div>

              {/* 닉네임 */}
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

              {/* 이메일 */}
              <div className="profileEditField">
                <label htmlFor="profile-email">이메일</label>
                <input
                    id="profile-email"
                    type="email"
                    value={emailInput}
                    disabled
                    className="profileEditInputDisabled"
                />
                <p>이메일은 Auth0 계정에서 관리돼요.</p>
              </div>

              {/* 비밀번호 */}
              <div className="profileEditField">
                <span className="profileEditLabel">비밀번호 변경</span>
                <p>비밀번호 변경은 Auth0 로그인 화면에서 Forgot Password를 이용해주세요.</p>
              </div>

              {errorMessage && <p className="profileEditMessage isError">{errorMessage}</p>}
              {feedbackMessage && <p className="profileEditMessage isSuccess">{feedbackMessage}</p>}

              <div className="profileEditActions">
                <Link to="/mypage" className="profileEditCancelBtn">취소</Link>
                <button type="submit" className="profileEditSaveBtn">저장</button>
              </div>
            </form>
          </section>
        </main>
      </div>
  );
}