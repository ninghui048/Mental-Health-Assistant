import service from "@/utils/request";

export const register = (data: any) => {
    return service.post("/user/add", data);
};

export const startSession = (data: any) => {
    return service.post("/psychological-chat/session/start", data);
};

export const getSessionList = (params: any) => {
    return service.get("/psychological-chat/sessions", { params });
};

export const deleteSession = (sessionId: string) => {
    return service.delete(`/psychological-chat/sessions/${sessionId}`);
};

export const getSessionDetail = (sessionId: string) => {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`);
};

export const getSessionEmotion = (sessionId: string) => {
    return service.get(`/psychological-chat/session/${sessionId}/emotion`);
};

export const addEmotionDiary = (data: any) => {
    return service.post("/emotion-diary", data);
};

export const getKnowledgeList = (params: any) => {
    return service.get("/knowledge/article/page", { params });
};

export const getKnowledgeDetail = (articleId: string) => {
    return service.get(`/knowledge/article/${articleId}`);
};
