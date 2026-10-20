<template>
    <div class="frontend-layout">
        <div class="navbar-container">
            <div class="brand-section">
                <el-image
                    style="height: 50px; width: 50px"
                    :src="iconURL"
                    alt="logo"
                    class="brand-logo"
                />
                <h1 class="brand-name">AI 助手</h1>
            </div>
            <div class="nav-section">
                <router-link class="nav-link" to="/">首页</router-link>
                <router-link class="nav-link" to="/consultation" v-if="isLoggedIn"
                    >AI咨询</router-link
                >
                <router-link class="nav-link" to="/emotion-diary" v-if="isLoggedIn"
                    >情绪日记</router-link
                >
                <router-link class="nav-link" to="/frontendknowledge">知识库</router-link>
                <el-button v-if="isLoggedIn" class="logout-btn" @click="handleLogout" size="medium"
                    >退出登录</el-button
                >
                <template v-else>
                    <router-link to="/auth/login" class="nav-link">登录</router-link>
                    <router-link to="/auth/register" class="nav-link">
                        <el-button type="primary" size="medium"> 注册 </el-button>
                    </router-link>
                </template>
            </div>
        </div>

        <div class="main-content">
            <router-view></router-view>
        </div>
        <div class="footer-container">
            <div class="footer-bottom">
                <p>&copy; 2026 AI助手. All rights reserved.</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { logout } from "@/api/admin";
const router = useRouter();
const iconURL = new URL("@/assets/images/机器人.png", import.meta.url).href;

const isLoggedIn = ref(false);
onMounted(() => {
    isLoggedIn.value = localStorage.getItem("token") !== null;
});

const handleLogout = () => {
    logout().then(() => {
        // 清除缓存
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        // 跳转到登录页
        router.push("/auth/login");
    });
};
</script>
<style lang="scss" scoped>
.frontend-layout {
    // 与咨询页纸感底色统一（Consultation.vue 的 $paper）
    background-color: #f5f3ee;
    min-height: 100vh;

    .navbar-container {
        max-width: 1200px;
        height: 100%;
        margin: 0 auto;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .brand-section {
            display: flex;
            align-items: center;

            .brand-name {
                margin-left: 10px;
                font-size: 24px;
                font-weight: 600;
                color: #333;
            }
        }

        .nav-section {
            display: flex;
            align-items: center;
            gap: 40px;

            .nav-link {
                color: #4b5563;
                font-size: 16px;
                font-weight: 500;

                &:hover {
                    color: #4a90e2;
                }
            }
        }
    }

    .footer-container {
        background: #1f2937;
        color: white;
        padding: 15px 0;
        margin-top: auto;

        .footer-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 10px;
            text-align: center;
        }
    }
}
</style>
