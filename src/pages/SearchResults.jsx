import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MemeCard from "../components/MemeCard";
import { FIXED_MEME_TAGS, sanitizeKoreanTagInput } from "../tagData";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();

  const [allMemes, setAllMemes] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const titleQuery = searchParams.get("q") ?? "";
  const normalizedTitleQuery = normalizeText(titleQuery);
  const normalizedTagQuery = normalizeText(tagQuery);

  useEffect(() => {
    fetch(`${API}/api/memes`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("밈 목록을 불러오지 못했습니다.");
          }
          return res.json();
        })
        .then((data) => {
          setAllMemes(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error(err);
          setError("검색 데이터를 불러오는 중 문제가 발생했어요.");
          setAllMemes([]);
        })
        .finally(() => {
          setLoading(false);
        });
  }, []);

  const searchedMemes = useMemo(() => {
    if (!normalizedTitleQuery) {
      return [];
    }

    return allMemes.filter((meme) => {
      const memeTitle = normalizeText(meme.title);

      const memeTags = Array.isArray(meme.hashtags)
          ? meme.hashtags.map((item) => normalizeText(item.tag))
          : [];

      const matchesTitle = memeTitle.includes(normalizedTitleQuery);

      const matchesSelectedFilters =
          selectedFilters.length === 0 ||
          selectedFilters.some((tag) => memeTags.includes(normalizeText(tag)));

      const matchesTagQuery =
          !normalizedTagQuery ||
          memeTags.some((tag) => tag.includes(normalizedTagQuery));

      return matchesTitle && matchesSelectedFilters && matchesTagQuery;
    });
  }, [allMemes, normalizedTitleQuery, normalizedTagQuery, selectedFilters]);

  const toggleLike = (id) => {
    setLikedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFilter = (tag) => {
    setSelectedFilters((prev) =>
        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleTagQueryChange = (event) => {
    setTagQuery(sanitizeKoreanTagInput(event.target.value));
  };

  return (
      <div className="page homePage">
        <Navbar />

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

        <main className="homeContent searchResultsContent">
          <section className="section searchResultsSection">
            {loading ? (
                <p className="homeEmptyState">검색 데이터를 불러오는 중...</p>
            ) : error ? (
                <p className="homeEmptyState">{error}</p>
            ) : searchedMemes.length > 0 ? (
                <div className="cardGrid">
                  {searchedMemes.map((meme) => (
                      <MemeCard
                          key={meme.id}
                          meme={{
                            ...meme,
                            image: `${API}/uploads/${meme.filePath}`,
                            alt: meme.title || "밈 이미지",
                          }}
                          liked={likedIds.includes(meme.id)}
                          onToggle={toggleLike}
                          showTitle={true}
                      />
                  ))}
                </div>
            ) : (
                <p className="homeEmptyState">
                  {titleQuery
                      ? "검색한 제목과 선택한 태그에 맞는 밈이 없어요."
                      : "제목을 입력해 밈을 검색해보세요."}
                </p>
            )}
          </section>
        </main>
      </div>
  );
}