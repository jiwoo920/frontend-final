import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * @typedef {{ id: number|string, nickname?: string, email?: string }} ProfileUser
 * @typedef {{ id: number|string, title: string, filePath: string, userId?: number|string }} ProfileMeme
 * @typedef {{ followingStatus?: boolean, followers?: number, following?: number }} FollowStatus
 */

function HeartIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          className="heartIcon"
          aria-hidden="true"
          focusable="false"
      >
        <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
      </svg>
  );
}

function LockIcon() {
  return (
      <svg
          viewBox="0 0 120 120"
          className="otherProfileLockIcon"
          aria-hidden="true"
          focusable="false"
      >
        <circle cx="60" cy="60" r="48" />
        <path d="M45 54V42a15 15 0 1 1 30 0v12" />
        <rect x="39" y="54" width="42" height="34" rx="3" />
        <path d="M60 67v8" />
      </svg>
  );
}

function OtherProfileMemeCard({ meme, liked, onToggle }) {
  return (
      <article className="profileMemeCard">
        <div className="profileThumbBox">
          <Link
              to={`/meme/${meme.id}`}
              className="memeCardLink"
              aria-label={`${meme.title} 상세 보기`}
          >
            <img
                src={`${API}/uploads/${meme.filePath}`}
                alt={meme.title}
                className="profileThumbImage"
                loading="lazy"
            />
          </Link>
          <button
              type="button"
              className={`profileHeartBtn${liked ? " isLiked" : ""}`}
              onClick={() => onToggle(meme.id)}
              aria-label={liked ? "좋아요 취소" : "좋아요"}
              aria-pressed={liked}
          >
            <HeartIcon />
          </button>
        </div>
      </article>
  );
}

export default function UserProfile() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [likedIds, setLikedIds] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  /** @type {[ProfileUser|null, Function]} */
  const [profile, setProfile] = useState(null);

  /** @type {[ProfileMeme[], Function]} */
  const [savedMemes, setSavedMemes] = useState([]);

  /** @type {[ProfileMeme[], Function]} */
  const [uploadedMemes, setUploadedMemes] = useState([]);

  const [isPrivate] = useState(false);

  const activeBoard = searchParams.get("tab") === "upload" ? "upload" : "saved";
  const isSavedBoardPrivate = activeBoard === "saved" && isPrivate;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await fetch(`${API}/api/users/${userId}`);
        if (!userRes.ok) {
          console.error("유저를 불러오지 못했습니다.");
          setProfile(null);
          setUploadedMemes([]);
          setSavedMemes([]);
          setLikedIds([]);
          setIsFollowing(false);
          setFollowersCount(0);
          setFollowingCount(0);
          return;
        }

        const foundUser = await userRes.json();

        if (!foundUser) {
          setProfile(null);
          setUploadedMemes([]);
          setSavedMemes([]);
          setLikedIds([]);
          setIsFollowing(false);
          setFollowersCount(0);
          setFollowingCount(0);
          return;
        }

        setProfile(foundUser);

        const allMemesRes = await fetch(`${API}/api/memes`);
        if (!allMemesRes.ok) {
          console.error("밈 목록을 불러오지 못했습니다.");
          setUploadedMemes([]);
        } else {
          /** @type {ProfileMeme[]|unknown} */
          const allMemes = await allMemesRes.json();

          const userUploadedMemes = Array.isArray(allMemes)
              ? allMemes.filter((meme) => String(meme.userId) === String(userId))
              : [];

          setUploadedMemes(userUploadedMemes);
        }

        const savedRes = await fetch(`${API}/api/saved/user/${userId}`);
        if (!savedRes.ok) {
          console.error("저장한 밈 목록을 불러오지 못했습니다.");
          setSavedMemes([]);
        } else {
          /** @type {ProfileMeme[]|unknown} */
          const savedData = await savedRes.json();
          setSavedMemes(Array.isArray(savedData) ? savedData : []);
        }

        if (isAuthenticated) {
          const token = await getAccessTokenSilently();

          const likedRes = await fetch(`${API}/api/likes/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!likedRes.ok) {
            console.error("좋아요 목록을 불러오지 못했습니다.");
            setLikedIds([]);
          } else {
            /** @type {ProfileMeme[]|unknown} */
            const likedData = await likedRes.json();
            setLikedIds(Array.isArray(likedData) ? likedData.map((m) => m.id) : []);
          }

          const followRes = await fetch(`${API}/api/follows/status?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!followRes.ok) {
            console.error("팔로우 상태를 불러오지 못했습니다.");
            setIsFollowing(false);
            setFollowersCount(0);
            setFollowingCount(0);
          } else {
            /** @type {FollowStatus} */
            const followData = await followRes.json();
            setIsFollowing(Boolean(followData.followingStatus));
            setFollowersCount(Number(followData.followers ?? 0));
            setFollowingCount(Number(followData.following ?? 0));
          }
        } else {
          setLikedIds([]);

          const followRes = await fetch(`${API}/api/follows/status?userId=${userId}`);
          if (!followRes.ok) {
            console.error("팔로우 상태를 불러오지 못했습니다.");
            setIsFollowing(false);
            setFollowersCount(0);
            setFollowingCount(0);
          } else {
            /** @type {FollowStatus} */
            const followData = await followRes.json();
            setIsFollowing(false);
            setFollowersCount(Number(followData.followers ?? 0));
            setFollowingCount(Number(followData.following ?? 0));
          }
        }
      } catch (error) {
        console.error("유저 프로필 불러오기 실패:", error);
        setProfile(null);
        setUploadedMemes([]);
        setSavedMemes([]);
        setLikedIds([]);
        setIsFollowing(false);
        setFollowersCount(0);
        setFollowingCount(0);
      }
    };

    void fetchProfileData();
  }, [userId, isAuthenticated, getAccessTokenSilently]);

  const visibleMemes = activeBoard === "upload" ? uploadedMemes : savedMemes;

  const toggleLike = async (memeId) => {
    if (!isAuthenticated) {
      alert("로그인 후 좋아요를 누를 수 있어요!");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API}/api/likes/toggle?memeId=${memeId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("좋아요 처리 실패");
        return;
      }

      const data = await res.json();

      setLikedIds((prev) =>
          data.liked ? [...prev, memeId] : prev.filter((id) => id !== memeId)
      );
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert("로그인 후 팔로우할 수 있어요!");
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(`${API}/api/follows/toggle?userId=${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("팔로우 처리 실패");
        alert("팔로우 처리에 실패했어요.");
        return;
      }

      /** @type {FollowStatus} */
      const data = await res.json();
      setIsFollowing(Boolean(data.followingStatus));
      setFollowersCount(Number(data.followers ?? 0));
      setFollowingCount(Number(data.following ?? 0));
    } catch (error) {
      console.error("팔로우 실패:", error);
      alert("팔로우 처리에 실패했어요.");
    }
  };

  if (!profile) {
    return <div>로딩 중...</div>;
  }

  return (
      <div className="page myPage">
        <Navbar />

        <main className="myPageContent">
          <section className="profileHero">
            <div className="profileIdentity">
              {profile.profileImagePath ? (
                  <img
                      src={`${API}/uploads/${profile.profileImagePath}`}
                      alt="프로필"
                      className="profileAvatarImg"
                  />
              ) : (
                  <div className="profileAvatar" aria-hidden="true" />
              )}

              <div className="profileCopy">
                <h1>{profile.nickname || profile.email?.split("@")[0] || `user ${profile.id}`}</h1>
                <p className="profileMeta">
                  <span>팔로잉 {followingCount}</span>
                  <span className="profileDot" aria-hidden="true">
                  •
                </span>
                  <span>팔로워 {followersCount}</span>
                </p>
                <button
                    type="button"
                    className={`otherProfileFollowBtn${isFollowing ? " isFollowing" : ""}`}
                    onClick={handleFollowToggle}
                    aria-pressed={isFollowing}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </div>
            </div>

            <div className="boardSwitch">
              <Link
                  to={`/users/${profile.id}`}
                  className={`boardSwitchBtn${activeBoard === "saved" ? " isActive" : ""}`}
              >
                <span className="boardSwitchTitle">저장 보드</span>
                <span className="boardSwitchCount">{savedMemes.length}</span>
              </Link>

              <Link
                  to={`/users/${profile.id}?tab=upload`}
                  className={`boardSwitchBtn${activeBoard === "upload" ? " isActive" : ""}`}
              >
                <span className="boardSwitchTitle">업로드</span>
                <span className="boardSwitchCount">{uploadedMemes.length}</span>
              </Link>
            </div>
          </section>

          {isSavedBoardPrivate ? (
              <section className="otherProfilePrivateState">
                <LockIcon />
                <h2>이 계정은 비공개 입니다</h2>
              </section>
          ) : (
              <>
                <section className="otherProfileSectionTitle">
                  <h2>{activeBoard === "upload" ? "업로드" : "저장 보드"}</h2>
                </section>

                <section className="myMemeGrid">
                  {visibleMemes.length > 0 ? (
                      visibleMemes.map((meme) => (
                          <OtherProfileMemeCard
                              key={meme.id}
                              meme={meme}
                              liked={likedIds.includes(meme.id)}
                              onToggle={toggleLike}
                          />
                      ))
                  ) : (
                      <p className="myBoardEmptyState">
                        {activeBoard === "upload"
                            ? "아직 업로드한 밈이 없어요!"
                            : "아직 저장한 밈이 없어요!"}
                      </p>
                  )}
                </section>
              </>
          )}
        </main>
      </div>
  );
}