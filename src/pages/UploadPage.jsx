import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import MyPageHero from "../components/MyPageHero";
import {
    AGE_TAGS,
    FILE_TYPE_TAGS,
    FIXED_MEME_TAGS,
    sanitizeKoreanTagInput,
} from "../tagData";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function RequiredStar() {
    return (
        <span className="uploadRequiredStar" aria-hidden="true">
      *
    </span>
    );
}

function UploadArrowIcon() {
    return (
        <svg
            viewBox="0 0 80 80"
            className="uploadDropIcon"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M40 50V19" />
            <path d="m27 32 13-13 13 13" />
            <path d="M24 46v12c0 3.3 2.7 6 6 6h20c3.3 0 6-2.7 6-6V46" />
        </svg>
    );
}

function getFileTypeValidationMessage(selectedFileType, file) {
    if (!selectedFileType || !file) {
        return "";
    }

    const lowerCaseName = file.name.toLowerCase();
    const isGifFile = lowerCaseName.endsWith(".gif");

    if (selectedFileType === "gif" && !isGifFile) {
        return "GIF 파일을 선택해주세요.";
    }

    if (selectedFileType === "이미지" && isGifFile) {
        return "사진 파일을 선택해주세요.";
    }

    return "";
}

export default function UploadPage() {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [memeName, setMemeName] = useState("");
    const [customTagInput, setCustomTagInput] = useState("");
    const [selectedFileType, setSelectedFileType] = useState("");
    const [selectedAgeTags, setSelectedAgeTags] = useState([]);
    const [customTags, setCustomTags] = useState([]);
    const [tagFeedback, setTagFeedback] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitFeedback, setSubmitFeedback] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const applySelectedFile = (file) => {
        if (!file) return;

        setSelectedFile(file);
        setFileName(file.name);
        setFieldErrors((prev) => ({
            ...prev,
            file: "",
            fileType: getFileTypeValidationMessage(selectedFileType, file),
        }));
        setSubmitFeedback("");
    };

    const handleBrowse = () => {
        inputRef.current?.click();
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        applySelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        applySelectedFile(file);
    };

    const handleCustomTagInputChange = (event) => {
        const nextValue = event.target.value;
        const sanitizedValue = sanitizeKoreanTagInput(nextValue);

        setCustomTagInput(sanitizedValue);
        setTagFeedback(
            nextValue === sanitizedValue
                ? ""
                : "직접입력 태그는 한글과 공백만 입력할 수 있어요."
        );
        setSubmitFeedback("");
    };

    const addTag = () => {
        const nextTag = customTagInput.trim();

        if (!nextTag) return;

        const isDuplicate =
            customTags.includes(nextTag) ||
            FILE_TYPE_TAGS.some((tag) => tag.value === nextTag || tag.label === nextTag) ||
            AGE_TAGS.includes(nextTag) ||
            FIXED_MEME_TAGS.includes(nextTag);

        if (isDuplicate) {
            setTagFeedback("이미 선택했거나 추가한 태그예요.");
            setCustomTagInput("");
            return;
        }

        setCustomTags((prev) => [...prev, nextTag]);
        setCustomTagInput("");
        setTagFeedback("");
        setSubmitFeedback("");
    };

    const handleTagKeyDown = (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        addTag();
    };

    const handleNameChange = (event) => {
        setMemeName(event.target.value);
        setFieldErrors((prev) => ({ ...prev, memeName: "" }));
        setSubmitFeedback("");
    };

    const handleFileTypeSelect = (fileType) => {
        setSelectedFileType(fileType);
        setFieldErrors((prev) => ({
            ...prev,
            fileType: getFileTypeValidationMessage(fileType, selectedFile),
        }));
        setSubmitFeedback("");
    };

    const handleAgeSelect = (ageTag) => {
        setSelectedAgeTags((prev) =>
            prev.includes(ageTag) ? prev.filter((tag) => tag !== ageTag) : [...prev, ageTag]
        );
        setFieldErrors((prev) => ({ ...prev, age: "" }));
        setSubmitFeedback("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextErrors = {};
        const trimmedName = memeName.trim();
        const fileTypeError = getFileTypeValidationMessage(selectedFileType, selectedFile);

        if (!trimmedName) {
            nextErrors.memeName = "이름을 입력해주세요.";
        }

        if (!selectedFile) {
            nextErrors.file = "사진을 추가해주세요.";
        }

        if (!selectedFileType) {
            nextErrors.fileType = "파일 종류를 선택해주세요.";
        } else if (fileTypeError) {
            nextErrors.fileType = fileTypeError;
        }

        if (selectedAgeTags.length === 0) {
            nextErrors.age = "나이를 하나 이상 선택해주세요.";
        }

        setFieldErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setSubmitFeedback("");
            return;
        }

        setIsUploading(true);

        try {
            const token = await getAccessTokenSilently();

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", trimmedName);

            formData.append("mediaType", selectedFileType);
            selectedAgeTags.forEach((tag) => formData.append("ageGroups", tag));

            const selectedFixedTags = [
                ...(selectedFileType ? [selectedFileType] : []),
                ...selectedAgeTags,
            ];

            const allTags = [...new Set([...selectedFixedTags, ...customTags])];
            allTags.forEach((tag) => formData.append("tags", tag));

            const res = await fetch(`${API}/api/memes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("업로드 실패");
            }

            setSubmitFeedback("업로드가 완료됐어요.");
            navigate("/mypage?tab=upload");
        } catch (error) {
            console.error("업로드 에러:", error);
            setSubmitFeedback("업로드 실패했어요. 다시 시도해주세요.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="page myPage">
            <Navbar />

            <main className="myPageContent">
                <MyPageHero activeBoard="upload" />

                <section className="uploadEditorLayout">
                    <div
                        className={`uploadDropzone${isDragging ? " isDragging" : ""}${
                            fieldErrors.file ? " isError" : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="srOnlyInput"
                            accept=".png,.jpg,.jpeg,.gif"
                            onChange={handleFileSelect}
                        />

                        <UploadArrowIcon />
                        <h2>
                            Drop the meme <RequiredStar />
                        </h2>
                        <p>PNG, JPEG, or GIF up to 25MB</p>
                        <button type="button" className="browseFilesBtn" onClick={handleBrowse}>
                            Browse Files
                        </button>

                        {fileName && <span className="selectedFileName">{fileName}</span>}
                        {fieldErrors.file && <p className="uploadFieldError">{fieldErrors.file}</p>}
                    </div>

                    <form className="uploadFormPanel" onSubmit={handleSubmit}>
                        <label className="uploadFieldLabel" htmlFor="memeName">
                            이름 <RequiredStar />
                        </label>
                        <input
                            id="memeName"
                            className={`uploadTextInput${fieldErrors.memeName ? " isError" : ""}`}
                            value={memeName}
                            onChange={handleNameChange}
                            aria-invalid={Boolean(fieldErrors.memeName)}
                        />
                        {fieldErrors.memeName && <p className="uploadFieldError">{fieldErrors.memeName}</p>}

                        <div className="uploadFieldGroup">
                            <span className="uploadFieldLabel">
                                파일 종류 <RequiredStar />
                            </span>
                            <div className="uploadTagRow" aria-label="파일 종류 목록">
                                {FILE_TYPE_TAGS.map((tag) => (
                                    <button
                                        key={tag.value}
                                        type="button"
                                        className={`uploadTagChip${selectedFileType === tag.value ? " isSelected" : ""}`}
                                        onClick={() => handleFileTypeSelect(tag.value)}
                                        aria-pressed={selectedFileType === tag.value}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.fileType && <p className="uploadFieldError">{fieldErrors.fileType}</p>}
                        </div>

                        <div className="uploadFieldGroup">
                            <span className="uploadFieldLabel">
                                나이 <RequiredStar />
                            </span>
                            <div className="uploadTagRow" aria-label="나이 목록">
                                {AGE_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`uploadTagChip${selectedAgeTags.includes(tag) ? " isSelected" : ""}`}
                                        onClick={() => handleAgeSelect(tag)}
                                        aria-pressed={selectedAgeTags.includes(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.age && <p className="uploadFieldError">{fieldErrors.age}</p>}
                        </div>

                        <div className="uploadFieldGroup">
                            <span className="uploadFieldLabel">카테고리</span>

                            <div className="uploadTagRow" aria-label="기본 카테고리 목록">
                                {FIXED_MEME_TAGS.map((tag) => (
                                    <span key={tag} className="uploadTagChip isCustomTag">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="uploadTagInputRow">
                                <input
                                    type="text"
                                    className="uploadTagDirectInput"
                                    placeholder="한글 태그를 직접 입력하세요"
                                    value={customTagInput}
                                    onChange={handleCustomTagInputChange}
                                    onKeyDown={handleTagKeyDown}
                                />
                                <button type="button" className="uploadTagAddBtn" onClick={addTag}>
                                    추가
                                </button>
                            </div>

                            {customTags.length > 0 && (
                                <div className="uploadTagRow uploadCustomTagRow" aria-label="직접 입력한 태그">
                                    {customTags.map((tag) => (
                                        <span key={tag} className="uploadTagChip isCustomTag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className={`uploadTagHint${tagFeedback ? " isError" : ""}`}>
                                {tagFeedback || "직접입력 태그는 한글로만 추가할 수 있어요."}
                            </p>
                        </div>

                        <button type="submit" className="uploadSubmitBtn" disabled={isUploading}>
                            {isUploading ? "업로드 중..." : "업로드"}
                        </button>

                        <p className="uploadRequiredNote">* 표시는 필수 입력 항목입니다.</p>
                        {submitFeedback && (
                            <p className={`uploadFormFeedback${submitFeedback.includes("실패") ? "" : " isSuccess"}`}>
                                {submitFeedback}
                            </p>
                        )}
                    </form>
                </section>
            </main>
        </div>
    );
}