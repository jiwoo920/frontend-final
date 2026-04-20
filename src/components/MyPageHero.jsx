import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { saveProfilePreferences, useProfilePreferences } from "../profilePreferences";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function MyPageHero({ activeBoard, savedCount = 0, uploadCount = 0 }) {
    const { user, logout, getAccessTokenSilently } = useAuth0();
    const profilePreferences = useProfilePreferences(user);
    const isProfilePrivate = profilePreferences.isProfilePrivate;
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [dbNickname, setDbNickname] = useState(null);
    const nickname = dbNickname || profilePreferences.nickname || (user?.email ? user.email.split("@")[0] : "");

    const handlePrivacyChange = (nextIsPrivate) => {
        saveProfilePreferences(user, {
            ...profilePreferences,
            isProfilePrivate: nextIsPrivate,
        });
    };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const meRes = await fetch(`${API}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!meRes.ok) return;
                const meData = await meRes.json();

                if (meData.profileImagePath) {
                    setProfileImageUrl(`${API}/uploads/${meData.profileImagePath}`);
                }
                if (meData.nickname) {
                    setDbNickname(meData.nickname);
                }

                const followRes = await fetch(`${API}/api/follows/status?userId=${meData.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!followRes.ok) return;
                const followData = await followRes.json();
                setFollowStats({ followers: followData.followers, following: followData.following });
            } catch (error) {
                console.error("프로필 정보 불러오기 실패:", error);
            }
        };

        fetchData();
    }, [user, getAccessTokenSilently]);

    return (
        <section className="profileHero">
            <div className="profileIdentity">
                {profileImageUrl ? (
                    <img src={profileImageUrl} alt="프로필" className="profileAvatarImg" />
                ) : (
                    <div className="profileAvatar" aria-hidden="true" />
                )}

                <div className="profileCopy">
                    <div className="profileHeadingRow">
                        <h1>{nickname}</h1>
                    </div>

                    <p className="profileMeta">
                        <span>팔로잉 {followStats.following}</span>
                        <span className="profileDot" aria-hidden="true">•</span>
                        <span>팔로워 {followStats.followers}</span>
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
