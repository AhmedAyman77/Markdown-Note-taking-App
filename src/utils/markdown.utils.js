import { marked } from "marked";

export const renderMarkdown = (mdText) => {
    return marked.parse(mdText);
};