import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Login() {
    const {
        loginWithRedirect,
        isAuthenticated,
        isLoading,
        user,
        getAccessTokenSilently,
    } = useAuth0();

    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath =
        typeof location.state?.from === "string" ? location.state.from : "/";

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const syncUser = async () => {
            try {
                const token = await getAccessTokenSilently();
                const nickname = user.email ? user.email.split("@")[0] : "user";

                await fetch(`${API}/api/users/sync`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        nickname,
                    }),
                });
            } catch (error) {
                console.error("유저 sync 실패:", error);
            } finally {
                navigate(redirectPath, { replace: true });
            }
        };

        syncUser();
    }, [isAuthenticated, user, getAccessTokenSilently, navigate, redirectPath]);

    if (isLoading) return <div>로딩 중...</div>;

    return (
        <div className="page loginBg">
            <main className="loginPageFigma">
                <div className="loginCanvas">
                    <div className="loginDecor loginDecorTop" aria-hidden="true" />
                    <div className="loginDecor loginDecorBottom" aria-hidden="true" />

                    <section className="loginBox">
                        <h1 className="loginMainTitle">밈 라이브러리</h1>
                        <div className="loginSubBadge">당신이 찾고 있는 모든 밈을 한눈에</div>

                        <form
                            className="loginFormFigma"
                            onSubmit={(e) => {
                                e.preventDefault();
                                loginWithRedirect({
                                    authorizationParams: {
                                        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                                    },
                                });
                            }}
                        >
                            <input
                                type="text"
                                placeholder="이메일"
                                className="loginInputFigma"
                                autoComplete="username"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="loginInputFigma"
                                autoComplete="current-password"
                            />

                            <div className="loginOptionsRow">
                                <label className="rememberRow">
                                    <input type="checkbox" />
                                    <span>로그인 상태 유지</span>
                                </label>

                                <button type="button" className="forgotBtn">
                                    비밀번호 찾기
                                </button>
                            </div>

                            <button type="submit" className="loginSubmitBtn">
                                로그인
                            </button>
                        </form>

                        <p className="loginBottomText">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    loginWithRedirect({
                                        authorizationParams: {
                                            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                                            screen_hint: "signup",
                                        },
                                    });
                                }}
                            >
                                Sign up now
                            </Link>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
