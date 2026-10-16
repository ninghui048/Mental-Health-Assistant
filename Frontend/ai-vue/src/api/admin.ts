import service from "@/utils/request";

export function login(data: any) {
    return service.post("/user/login", data);
}
export function categoryTree() {
    return service.get("/knowledge/category/tree");
}

export function articlePage(params: any) {
    return service.get("/knowledge/article/page", { params: params });
}
export function uploadFile(data: any, businessInfo: any) {
    const formData = new FormData();
    formData.append("file", data);
    formData.append("businessType", "ARTICLE");
    formData.append("businessId", businessInfo.businessId);
    formData.append("businessField", "cover");

    return service.post("/file/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function createArticle(data: any) {
    return service.post("/knowledge/article", data);
}
export function getArticleDetail(id: string) {
    return service.get(`/knowledge/article/${id}`);
}
export function updateArticle(id: string, data: any) {
    return service.put(`/knowledge/article/${id}`, data);
}

export function changeArticleStatus(id: string, data: any) {
    return service.put(`/knowledge/article/${id}/status`, data);
}

export function deleteArticle(id: string) {
    return service.delete(`/knowledge/article/${id}`);
}
