import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
    saveProfilePreferences,
    useProfilePreferences,
} from "../profilePreferences";

export default function MyPageHero({
                                       activeBoard,
                                       savedCount = 0,
                                       likedCount = 0,
                                       uploadCount = 0,
                                   }) {
    const { user, logout } = useAuth0();
    const profilePreferences = useProfilePreferences(user);
    const nickname = profilePreferences.nickname || (user?.email ? user.email.split("@")[0] : "");
    const isProfilePrivate = profilePreferences.isProfilePrivate;

    const handlePrivacyChange = (nextIsPrivate) => {
        saveProfilePreferences(user, {
            ...profilePreferences,
            isProfilePrivate: nextIsPrivate,
        });
    };

    return (
        <section className="profileHero">
            <div className="profileIdentity">
                <div className="profileAvatar" aria-hidden="true" />

                <div className="profileCopy">
                    <div className="profileHeadingRow">
                        <h1>{nickname}</h1>
                        <button
                            type="button"
                            className="profileLogoutBtn"
                            onClick={() =>
                                logout({
                                    logoutParams: {
                                        returnTo: `${window.location.origin}/login`,
                                    },
                                })
                            }
                        >
                            로그아웃
                        </button>
                    </div>

                    <p className="profileMeta">
                        <span>팔로잉 47</span>
                        <span className="profileDot" aria-hidden="true">
              •
            </span>
                        <span>팔로워 2</span>
                    </p>

                    <Link to="/mypage/edit" className="profileEditBtn">
                        프로필 수정
                    </Link>
                </div>
            </div>

            <div className="profileBoardPanel">
                <div className="boardSwitch">
                    <Link
                        to="/mypage"
                        className={`boardSwitchBtn${activeBoard === "saved" ? " isActive" : ""}`}
                    >
                        <span className="boardSwitchTitle">저장 보드</span>
                        <span className="boardSwitchCount">{savedCount}</span>
                    </Link>

                    <Link
                        to="/mypage?tab=liked"
                        className={`boardSwitchBtn${activeBoard === "liked" ? " isActive" : ""}`}
                    >
                        <span className="boardSwitchTitle">좋아요</span>
                        <span className="boardSwitchCount">{likedCount}</span>
                    </Link>

                    <Link
                        to="/mypage?tab=upload"
                        className={`boardSwitchBtn${activeBoard === "upload" ? " isActive" : ""}`}
                    >
                        <span className="boardSwitchTitle">업로드</span>
                        <span className="boardSwitchCount">{uploadCount}</span>
                    </Link>
                </div>

                {activeBoard === "saved" && (
                    <div className="profileVisibilityRow" aria-label="저장 보드 공개 설정">
                        <button
                            type="button"
                            className={`profileVisibilityBtn${!isProfilePrivate ? " isActive" : ""}`}
                            onClick={() => handlePrivacyChange(false)}
                            aria-pressed={!isProfilePrivate}
                        >
                            공개
                        </button>
                        <button
                            type="button"
                            className={`profileVisibilityBtn${isProfilePrivate ? " isActive" : ""}`}
                            onClick={() => handlePrivacyChange(true)}
                            aria-pressed={isProfilePrivate}
                        >
                            비공개
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
