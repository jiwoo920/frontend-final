import { useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useProfilePreferences } from "../profilePreferences";

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="navIcon" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
        </svg>
    );
}

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const { isAuthenticated, user, logout } = useAuth0();
    const profilePreferences = useProfilePreferences(user);

    const isAuthPage =
        location.pathname === "/login" || location.pathname === "/signup";

    const nickname = profilePreferences.nickname || (user?.email ? user.email.split("@")[0] : "");

    const searchQueryFromUrl =
        location.pathname === "/search"
            ? new URLSearchParams(location.search).get("q") ?? ""
            : "";

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const rawValue = searchInputRef.current?.value ?? "";
        const nextQuery = rawValue.trim();

        if (!nextQuery) {
            navigate("/search");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    };

    return (
        <header className="topbar">
            <div className="topLeft">
                <NavLink to="/" className="logoMark" aria-label="홈으로 이동">
                    <span></span>
                    <span></span>
                </NavLink>

                <form
                    key={`${location.pathname}${location.search}`}
                    className="searchPill"
                    onSubmit={handleSearchSubmit}
                >
                    <button type="submit" className="searchIcon searchSubmitBtn" aria-label="제목 검색">
                        <SearchIcon />
                    </button>
                    <input
                        ref={searchInputRef}
                        placeholder="제목 검색"
                        aria-label="밈 제목 검색"
                        defaultValue={searchQueryFromUrl}
                    />
                </form>
            </div>

            {!isAuthPage && (
                <div className="topRight">
                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to="/mypage"
                                className={({ isActive }) =>
                                    `profileLink${isActive ? " profileLinkActive" : ""}`
                                }
                            >
                                {nickname}님
                            </NavLink>

                            <button
                                type="button"
                                className="forgotBtn"
                                onClick={() =>
                                    logout({
                                        logoutParams: {
                                            returnTo: `${window.location.origin}/login`,
                                        },
                                    })
                                }
                                style={{ marginLeft: "8px" }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className="profileLink">
                            로그인
                        </NavLink>
                    )}
                </div>
            )}
        </header>
    );
}
