import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_BASE_URL;

/**
 * @typedef {{ id?: number|string, tag: string }} MemeTag
 * @typedef {{ id: number|string, title: string, filePath: string, hashtags?: MemeTag[] }} Meme
 * @typedef {{ id: number|string, author: string, text: string, createdAt?: string }} CommentItem
 * @typedef {{ saved: boolean }} SavedStatus
 */

export default function MemeDetail() {
    const { memeId } = useParams();
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    /** @type {[Meme|null, Function]} */
    const [meme, setMeme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /** @type {[CommentItem[], Function]} */
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const loadMeme = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`${API}/api/memes/${memeId}`);
                if (!res.ok) {
                    setError("밈 정보를 불러오는 중 문제가 발생했어요.");
                    setMeme(null);
                    return;
                }

                /** @type {Meme} */
                const data = await res.json();
                setMeme(data);
            } catch (err) {
                console.error("밈 상세 조회 실패:", err);
                setError("밈 정보를 불러오는 중 문제가 발생했어요.");
                setMeme(null);
            } finally {
                setLoading(false);
            }
        };

        void loadMeme();
    }, [memeId]);

    useEffect(() => {
        const loadComments = async () => {
            try {
                const res = await fetch(`${API}/api/comments?memeId=${memeId}`);
                if (!res.ok) {
                    setComments([]);
                    return;
                }

                /** @type {CommentItem[]|unknown} */
                const data = await res.json();
                setComments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("댓글 불러오기 실패:", err);
                setComments([]);
            }
        };

        void loadComments();
    }, [memeId]);

    useEffect(() => {
        const loadSavedStatus = async () => {
            if (!isAuthenticated) {
                setIsSaved(false);
                return;
            }

            try {
                const token = await getAccessTokenSilently();

                const res = await fetch(`${API}/api/saved/check?memeId=${memeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    setIsSaved(false);
                    return;
                }

                /** @type {SavedStatus} */
                const data = await res.json();
                setIsSaved(Boolean(data.saved));
            } catch (err) {
                console.error("저장 상태 조회 실패:", err);
                setIsSaved(false);
            }
        };

        void loadSavedStatus();
    }, [memeId, isAuthenticated, getAccessTokenSilently]);

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            alert("로그인 후 댓글을 작성할 수 있어요!");
            return;
        }

        const next = commentInput.trim();
        if (!next) return;

        try {
            const token = await getAccessTokenSilently();

            const res = await fetch(`${API}/api/comments?memeId=${memeId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: next }),
            });

            if (!res.ok) {
                alert("댓글 등록에 실패했어요.");
                return;
            }

            /** @type {CommentItem} */
            const savedComment = await res.json();
            setComments((prev) => [...prev, savedComment]);
            setCommentInput("");
        } catch (err) {
            console.error("댓글 등록 실패:", err);
            alert("댓글 등록에 실패했어요.");
        }
    };

    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            alert("로그인 후 저장할 수 있어요!");
            return;
        }

        try {
            const token = await getAccessTokenSilently();

            const res = await fetch(`${API}/api/saved?memeId=${memeId}`, {
                method: isSaved ? "DELETE" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                alert("저장 처리에 실패했어요.");
                return;
            }

            /** @type {SavedStatus} */
            const data = await res.json();
            setIsSaved(Boolean(data.saved));
        } catch (err) {
            console.error("저장 처리 실패:", err);
            alert("저장 처리에 실패했어요.");
        }
    };

    if (loading) {
        return (
            <div className="page">
                <Navbar />
                <main className="detailPage">
                    <p>불러오는 중...</p>
                </main>
            </div>
        );
    }

    if (error || !meme) {
        return (
            <div className="page">
                <Navbar />
                <main className="detailPage">
                    <p>{error || "밈을 찾을 수 없어요."}</p>
                </main>
            </div>
        );
    }

    const tags = Array.isArray(meme.hashtags) ? meme.hashtags : [];

    return (
        <div className="page">
            <Navbar />

            <main className="detailPage">
                <section className="detailCard">
                    <div className="detailImageWrap">
                        <img
                            src={`${API}/uploads/${meme.filePath}`}
                            alt={meme.title || "밈 이미지"}
                            className="detailImage"
                        />
                    </div>

                    <div className="detailInfo">
                        <h1 className="detailTitle">{meme.title}</h1>

                        <button
                            type="button"
                            className="detailSaveBtn"
                            onClick={handleSaveToggle}
                        >
                            {isSaved ? "저장됨" : "저장"}
                        </button>

                        {tags.length > 0 && (
                            <div className="detailTagRow">
                                {tags.map((tagObj) => (
                                    <span
                                        key={tagObj.id ?? tagObj.tag}
                                        className="detailTagChip"
                                    >
                                        #{tagObj.tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="detailCommentsSection">
                    <h2>댓글</h2>

                    <form className="detailCommentForm" onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(event) => setCommentInput(event.target.value)}
                            placeholder="댓글을 입력하세요"
                            className="detailCommentInput"
                        />
                        <button type="submit" className="detailCommentSubmitBtn">
                            등록
                        </button>
                    </form>

                    <div className="detailCommentList">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="detailCommentItem">
                                    <p className="detailCommentAuthor">{comment.author}</p>
                                    <p className="detailCommentText">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="detailEmptyComments">아직 댓글이 없어요.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}