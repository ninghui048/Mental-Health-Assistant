import { createRouter, createWebHistory } from "vue-router";
import BackendLayout from "@/components/BackendLayout.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import FrontendLayout from "@/components/FrontendLayout.vue";

//  前端路由
const frontendRoutes = [
    {
        path: "/",
        redirect: "",
        component: FrontendLayout,
        children: [
            {
                path: "",
                component: () => import("@/views/Home.vue"),
            },
            {
                path: "consultation",
                component: () => import("@/views/Consultation.vue"),
            },
            {
                path: "emotion-diary",
                component: () => import("@/views/Emotion-diary.vue"),
            },
            {
                path: "frontendknowledge",
                component: () => import("@/views/FrontendKnowledge.vue"),
            },
            {
                path: "frontendknowledge/article/:id",
                component: () => import("@/views/articleDetail.vue"),
            },
        ],
    },
];

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
    routes: [...frontendRoutes, ...bakenRoutes],
});

// 路由前置守卫
// 没有登录没有权限访问后台
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token");
    // 当前用户是否登录
    if (token) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        // 鉴权
        if (userInfo.userType == 2) {
            if (to.path.startsWith("/back")) {
                next();
            } else {
                next("/back/dashboard");
            }
        } else if (userInfo.userType == 1) {
            // 用户端账号只能访问前台路由
            if (to.path.startsWith("/back") || to.path.startsWith("/auth")) {
                next("/");
            } else {
                next();
            }
        }
    } else {
        if (to.path.startsWith("/back")) {
            // 如果是访问后台页面，那么跳转岛登录页
            next("/auth/login");
        } else {
            next();
        }
    }
});

export default router;
