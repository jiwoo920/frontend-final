import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth0();
    const location = useLocation();

    if (isLoading) return <div>로딩 중...</div>;

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    return children;
}