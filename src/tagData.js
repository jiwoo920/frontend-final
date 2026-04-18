export const FILE_TYPE_TAGS = [
    { value: "이미지", label: "사진" },
    { value: "gif", label: "GIF" },
];

export const AGE_TAGS = ["10대", "20대", "30대"];

export const FIXED_MEME_TAGS = [
    ...FILE_TYPE_TAGS.map((tag) => tag.value),
    ...AGE_TAGS,
];

export function sanitizeKoreanTagInput(value) {
    return value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣\s]/g, "").replace(/\s+/g, " ");
}