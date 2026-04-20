import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FIXED_MEME_TAGS, sanitizeKoreanTagInput } from "../tagData";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const INITIAL_TRENDING_COUNT = 4;

function HeartIcon() {
    return (
        <svg viewBox="0 0 24 24" className="heartIcon" aria-hidden="true" focusable="false">
            <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />
        </svg>
    );
}

function getNormalizedTagQuery(value) {
    return value.trim().toLowerCase();
}

function MemeCard({ meme, liked, onToggle }) {
    return (
        <article className="memeCard memeCardWithTitle">
            <div className="thumbBox">
                <Link to={`/meme/${meme.id}`} className="memeCardLink" aria-label={`${meme.title} 상세 보기`}>
                    <img
                        src={`${API}/uploads/${meme.filePath}`}
                        alt={meme.title}
                        className="thumbImage"
                        loading="lazy"
                    />
                </Link>
                <button
                    type="button"
                    className={`heartBtn${liked ? " isLiked" : ""}`}
                    onClick={() => onToggle(meme.id)}
                    aria-label={liked ? "좋아요 취소" : "좋아요"}
                    aria-pressed={liked}
                >
                    <HeartIcon />
                </button>
            </div>
            {meme.title && (
                <Link to={`/meme/${meme.id}`} className="memeCardTitleLink">
                    <p className="memeCardTitle">{meme.title}</p>
                </Link>
            )}
        </article>
    );
}

export default function Home() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [trendingMemes, setTrendingMemes] = useState([]);
    const [allMemes, setAllMemes] = useState([]);
    const [likedIds, setLikedIds] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [tagQuery, setTagQuery] = useState("");
    const [visibleTrendingCount, setVisibleTrendingCount] = useState(INITIAL_TRENDING_COUNT);

    const normalizedTagQuery = getNormalizedTagQuery(tagQuery);

    useEffect(() => {
        fetch(`${API}/api/memes/most-liked`)
            .then((res) => res.json())
            .then((data) => setTrendingMemes(Array.isArray(data) ? data : []))
            .catch(console.error);

        fetch(`${API}/api/memes`)
            .then((res) => res.json())
            .then((data) => setAllMemes(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchLikedIds = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch(`${API}/api/likes/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setLikedIds(Array.isArray(data) ? data.map((m) => m.id) : []);
            } catch (error) {
                console.error("좋아요 목록 불러오기 실패:", error);
            }
        };

        fetchLikedIds();
    }, [isAuthenticated, getAccessTokenSilently]);

    const filteredTrendingMemes = useMemo(() => {
        return trendingMemes.filter((meme) => {
            const memeTags = Array.isArray(meme.hashtags)
                ? meme.hashtags.map((item) => String(item.tag))
                : [];

            const matchesSelectedFilters =
                selectedFilters.length === 0 ||
                selectedFilters.some((tag) => memeTags.includes(tag));

            const matchesTagQuery =
                !normalizedTagQuery ||
                memeTags.some((tag) => tag.toLowerCase().includes(normalizedTagQuery));

            return matchesSelectedFilters && matchesTagQuery;
        });
    }, [trendingMemes, selectedFilters, normalizedTagQuery]);

    const filteredAllMemes = useMemo(() => {
        return allMemes.filter((meme) => {
            const memeTags = Array.isArray(meme.hashtags)
                ? meme.hashtags.map((item) => String(item.tag))
                : [];

            const matchesSelectedFilters =
                selectedFilters.length === 0 ||
                selectedFilters.some((tag) => memeTags.includes(tag));

            const matchesTagQuery =
                !normalizedTagQuery ||
                memeTags.some((tag) => tag.toLowerCase().includes(normalizedTagQuery));

            return matchesSelectedFilters && matchesTagQuery;
        });
    }, [allMemes, selectedFilters, normalizedTagQuery]);

    const visibleTrendingMemes = filteredTrendingMemes.slice(0, visibleTrendingCount);
    const canLoadMoreTrending = visibleTrendingCount < filteredTrendingMemes.length;

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
            const data = await res.json();

            setLikedIds((prev) =>
                data.liked ? [...prev, memeId] : prev.filter((id) => id !== memeId)
            );
        } catch (error) {
            console.error("좋아요 실패:", error);
        }
    };

    const toggleFilter = (tag) => {
        setSelectedFilters((prev) => {
            const next = prev.includes(tag)
                ? prev.filter((item) => item !== tag)
                : [...prev, tag];

            setVisibleTrendingCount(INITIAL_TRENDING_COUNT);
            return next;
        });
    };

    const handleTagQueryChange = (event) => {
        setTagQuery(sanitizeKoreanTagInput(event.target.value));
        setVisibleTrendingCount(INITIAL_TRENDING_COUNT);
    };

    const handleLoadMoreTrending = () => {
        setVisibleTrendingCount((prev) =>
            Math.min(prev + INITIAL_TRENDING_COUNT, filteredTrendingMemes.length)
        );
    };

    return (
        <div className="page homePage">
            <Navbar />

            <section className="hero">
                <h1>밈 라이브러리</h1>
                <p>당신이 찾고 있는 모든 밈을 한눈에</p>
            </section>

            <section className="chipRowWrap">
                <div className="chipRow homeFilterRow">
                    {FIXED_MEME_TAGS.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={`chip${selectedFilters.includes(filter) ? " chipActive" : ""}`}
                            onClick={() => toggleFilter(filter)}
                            aria-pressed={selectedFilters.includes(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                    <input
                        type="text"
                        className="homeTagSearchInput"
                        placeholder="태그 직접입력"
                        value={tagQuery}
                        onChange={handleTagQueryChange}
                        aria-label="태그 직접 입력 검색"
                    />
                </div>
            </section>

            <main className="homeContent">
                <section className="section homeSection">
                    <h2>인기 급 상승</h2>

                    <div className="cardGrid">
                        {visibleTrendingMemes.map((meme) => (
                            <MemeCard
                                key={meme.id}
                                meme={meme}
                                liked={likedIds.includes(meme.id)}
                                onToggle={toggleLike}
                            />
                        ))}
                    </div>

                    {visibleTrendingMemes.length === 0 && (
                        <p className="homeEmptyState">선택한 태그나 입력한 태그에 맞는 밈이 아직 없어요.</p>
                    )}

                    {canLoadMoreTrending && visibleTrendingMemes.length > 0 && (
                        <div className="moreWrap">
                            <button type="button" className="moreBtn" onClick={handleLoadMoreTrending}>
                                더보기
                            </button>
                        </div>
                    )}
                </section>

                <section className="section homeSection homeSectionWithDivider">
                    <h2>최신 밈</h2>

                    <div className="cardGrid">
                        {filteredAllMemes.slice(0, 4).map((meme) => (
                            <MemeCard
                                key={meme.id}
                                meme={meme}
                                liked={likedIds.includes(meme.id)}
                                onToggle={toggleLike}
                            />
                        ))}
                    </div>

                    {filteredAllMemes.length === 0 && (
                        <p className="homeEmptyState">선택한 태그나 입력한 태그에 맞는 밈이 아직 없어요.</p>
                    )}
                </section>
            </main>
        </div>
    );
}
