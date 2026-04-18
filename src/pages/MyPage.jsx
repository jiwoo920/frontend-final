import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import MyPageHero from "../components/MyPageHero";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const boardFilters = ["모든 밈", "귀여운 밈", "욕", "학교", "연애"];

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" className="heartIcon" aria-hidden="true" focusable="false">
            <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 24 24" className="uploadActionIcon" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" className="deleteIcon" aria-hidden="true" focusable="false">
            <path d="M8 8v10" />
            <path d="M12 8v10" />
            <path d="M16 8v10" />
            <path d="M5 5h14" />
            <path d="M9 5V3h6v2" />
            <path d="M7 5l1 16h8l1-16" />
        </svg>
    );
}

function ProfileMemeCard({ meme, liked, onToggle, onDelete, showDelete = false }) {
    return (
        <article className="profileMemeCard">
            <div className="profileThumbBox">
                <img
                    src={`${API}/uploads/${meme.filePath}`}
                    alt={meme.title}
                    className="profileThumbImage"
                    loading="lazy"
                />
                <button
                    type="button"
                    className={`profileHeartBtn${liked ? " isLiked" : ""}`}
                    onClick={() => onToggle(meme.id)}
                    aria-label={liked ? "좋아요 취소" : "좋아요"}
                    aria-pressed={liked}
                >
                    <HeartIcon />
                </button>
                {showDelete && (
                    <button
                        type="button"
                        className="profileDeleteBtn"
                        onClick={() => onDelete(meme.id)}
                        aria-label={`${meme.title || "밈"} 삭제`}
                        title="삭제"
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>
        </article>
    );
}

export default function MyPage() {
    const [searchParams] = useSearchParams();
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const [activeFilter, setActiveFilter] = useState(boardFilters[0]);
    const [savedMemes, setSavedMemes] = useState([]);
    const [likedMemes, setLikedMemes] = useState([]);
    const [uploadedMemes, setUploadedMemes] = useState([]);
    const [likedIds, setLikedIds] = useState([]);
    const activeTab = searchParams.get("tab");
    const activeBoard = activeTab === "upload" || activeTab === "liked" ? activeTab : "saved";

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        const fetchData = async () => {
            try {
                const token = await getAccessTokenSilently();

                const [savedRes, likedRes, uploadedRes] = await Promise.all([
                    fetch(`${API}/api/saved/my`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API}/api/likes/my`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API}/api/memes/my`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const savedData = await savedRes.json();
                const likedData = await likedRes.json();
                const uploadedData = await uploadedRes.json();

                setSavedMemes(Array.isArray(savedData) ? savedData : []);
                setLikedMemes(Array.isArray(likedData) ? likedData : []);
                setLikedIds(Array.isArray(likedData) ? likedData.map((m) => m.id) : []);
                setUploadedMemes(Array.isArray(uploadedData) ? uploadedData : []);
            } catch (error) {
                console.error("데이터 불러오기 실패:", error);
            }
        };

        fetchData();
    }, [isLoading, isAuthenticated, getAccessTokenSilently]);

    const toggleLike = async (memeId) => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API}/api/likes/toggle?memeId=${memeId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                alert("좋아요 처리에 실패했어요.");
                return;
            }

            const data = await res.json();

            setLikedIds((prev) =>
                data.liked
                    ? [...new Set([...prev, memeId])]
                    : prev.filter((id) => id !== memeId)
            );

            if (!data.liked) {
                setLikedMemes((prev) => prev.filter((m) => m.id !== memeId));
            } else {
                const likedMeme =
                    savedMemes.find((meme) => meme.id === memeId) ||
                    uploadedMemes.find((meme) => meme.id === memeId);

                if (likedMeme) {
                    setLikedMemes((prev) =>
                        prev.some((meme) => meme.id === memeId) ? prev : [...prev, likedMeme]
                    );
                }
            }
        } catch (error) {
            console.error("좋아요 실패:", error);
        }
    };

    const deleteUploadedMeme = async (memeId) => {
        const targetMeme = uploadedMemes.find((meme) => meme.id === memeId);
        const shouldDelete = window.confirm(
            `${targetMeme?.title || "이 밈"}을 삭제할까요?`
        );

        if (!shouldDelete) return;

        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API}/api/memes/${memeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                alert("삭제에 실패했어요.");
                return;
            }

            setUploadedMemes((prev) => prev.filter((meme) => meme.id !== memeId));
            setSavedMemes((prev) => prev.filter((meme) => meme.id !== memeId));
            setLikedMemes((prev) => prev.filter((meme) => meme.id !== memeId));
            setLikedIds((prev) => prev.filter((id) => id !== memeId));
        } catch (error) {
            console.error("밈 삭제 실패:", error);
            alert("삭제에 실패했어요.");
        }
    };

    if (isLoading) return <div>로딩 중...</div>;

    return (
        <div className="page myPage">
            <Navbar />
            <main className="myPageContent">
                <MyPageHero
                    activeBoard={activeBoard}
                    savedCount={savedMemes.length}
                    likedCount={likedMemes.length}
                    uploadCount={uploadedMemes.length}
                />

                {activeBoard === "saved" ? (
                    <>
                        <section className="myFilterRow" aria-label="밈 필터">
                            {boardFilters.map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    className={`myFilterChip${activeFilter === filter ? " isActive" : ""}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </section>

                        <section className="myMemeGrid">
                            {savedMemes.length > 0 ? (
                                savedMemes.map((meme) => (
                                    <ProfileMemeCard
                                        key={meme.id}
                                        meme={meme}
                                        liked={likedIds.includes(meme.id)}
                                        onToggle={toggleLike}
                                    />
                                ))
                            ) : (
                                <p className="myBoardEmptyState">아직 저장한 밈이 없어요!</p>
                            )}
                        </section>
                    </>
                ) : activeBoard === "liked" ? (
                    <section className="myMemeGrid">
                        {likedMemes.length > 0 ? (
                            likedMemes.map((meme) => (
                                <ProfileMemeCard
                                    key={meme.id}
                                    meme={meme}
                                    liked={likedIds.includes(meme.id)}
                                    onToggle={toggleLike}
                                />
                            ))
                        ) : (
                            <p className="myBoardEmptyState">아직 좋아요한 밈이 없어요!</p>
                        )}
                    </section>
                ) : (
                    <>
                        <section className="uploadHeaderRow">
                            <h2>업로드 된 밈</h2>
                            <Link to="/mypage/upload" className="uploadActionBtn">
                                <PlusIcon />
                                업로드
                            </Link>
                        </section>

                        <section className="myMemeGrid">
                            {uploadedMemes.length > 0 ? (
                                uploadedMemes.map((meme) => (
                                    <ProfileMemeCard
                                        key={meme.id}
                                        meme={meme}
                                        liked={likedIds.includes(meme.id)}
                                        onToggle={toggleLike}
                                        onDelete={deleteUploadedMeme}
                                        showDelete={true}
                                    />
                                ))
                            ) : (
                                <p className="myBoardEmptyState">아직 업로드한 밈이 없어요!</p>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
