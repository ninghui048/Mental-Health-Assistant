import { createRouter, createWebHistory } from "vue-router";
import BackendLayout from "@/components/BackendLayout.vue";
import AuthLayout from "@/components/AuthLayout.vue";

// 路由配置
const bakenRoutes = [
    {
        path: "/back",
        redirect: "/back/dashboard",
        component: BackendLayout,
        children: [
            {
                path: "dashboard",
                component: () => import("@/views/Dashboard.vue"),
                meta: {
                    title: "数据分析",
                    icon: "PieChart",
                },
            },
            {
                path: "knowledge",
                component: () => import("@/views/Knowledge.vue"),
                meta: {
                    title: "知识文章",
                    icon: "ChatLineSquare",
                },
            },
            {
                path: "consultations",
                component: () => import("@/views/Consultations.vue"),
                meta: {
                    title: "咨询记录",
                    icon: "Message",
                },
            },
            {
                path: "emotional",
                component: () => import("@/views/Emotional.vue"),
                meta: {
                    title: "情绪日志",
                    icon: "User",
                },
            },
        ],
    },
    {
        path: "/auth",
        component: AuthLayout,
        children: [
            {
                path: "login",
                component: () => import("@/views/Login.vue"),
                meta: {
                    title: "登录",
                    icon: "Login",
                },
            },
            {
                path: "register",
                component: () => import("@/views/Register.vue"),
                meta: {
                    title: "注册",
                    icon: "User",
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes: bakenRoutes,
});

export default router;
