import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MemeDetail from "./pages/MemeDetail";
import MyPage from "./pages/MyPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import SearchResults from "./pages/SearchResults";
import UploadPage from "./pages/UploadPage";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/meme/:memeId" element={<MemeDetail />} />
            <Route
                path="/mypage"
                element={
                    <ProtectedRoute>
                        <MyPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/mypage/edit"
                element={
                    <ProtectedRoute>
                        <ProfileEditPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/mypage/upload"
                element={
                    <ProtectedRoute>
                        <UploadPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/users/:userId" element={<UserProfile />} />
        </Routes>
    );
}