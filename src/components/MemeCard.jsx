import { Link } from "react-router-dom";

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

export default function MemeCard({ meme, liked, onToggle, showTitle = false }) {
  return (
    <article className={`memeCard${showTitle ? " memeCardWithTitle" : ""}`}>
      <div className="thumbBox">
        <Link
          to={`/meme/${meme.id}`}
          className="memeCardLink"
          aria-label={`${meme.title} 상세 보기`}
        >
          <img src={meme.image} alt={meme.alt} className="thumbImage" loading="lazy" />
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

      {showTitle && (
        <Link to={`/meme/${meme.id}`} className="memeCardTitleLink">
          <h3 className="memeCardTitle">{meme.title}</h3>
        </Link>
      )}
    </article>
  );
}
