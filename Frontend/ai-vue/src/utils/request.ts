import axios from "axios";
import { ElMessage } from "element-plus";

// 创建axios实例
const service = axios.create({
    baseURL: "/api", // 请求前缀
    timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["token"] = token;
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    },
);
// 登录过期统一处理:清空本地登录信息并跳回登录页
const handleAuthExpired = (msg?: string) => {
    // 已在登录页时不重复提示和跳转,避免死循环
    if (window.location.pathname === "/auth/login") return;
    ElMessage.error(msg || "登录过期，请重新登录");
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/auth/login";
};
// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        const { data, config } = response;
        // 处理业务状态码
        if (data.code === "200") {
            return data.data;
        }
        if (String(data.code) === "-1") {
            if (!config.url?.includes("/login")) {
                handleAuthExpired(data.msg);
            } else {
                ElMessage.error(data.msg || "登录过期，请重新登录");
            }
            // 中断调用链,不要把 response 交给调用方的 then
            return Promise.reject(data);
        }

        return response;
    },
    (error) => {
        // 后端安全过滤器对未登录/过期 token 直接返回 HTTP 401/403(空 body),
        // 走不到上面的成功回调,必须在这里处理
        const status = error.response?.status;
        const url: string = error.config?.url || "";
        if ((status === 401 || status === 403) && !url.includes("/login")) {
            handleAuthExpired();
        }
        // 对请求错误做些什么
        return Promise.reject(error);
    },
);
export default service;
