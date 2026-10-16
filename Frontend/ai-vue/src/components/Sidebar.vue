<template>
    <el-aside :width="isCollapse ? '64px' : '264px'">
        <el-menu
            :collapse="isCollapse"
            :collapse-transition="false"
            default-active="2"
            class="menu-style"
        >
            <div class="brand">
                <el-image
                    style="width: 50px; height: 50px; margin-right: 10px"
                    :src="iconUrl"
                    alt="logo"
                />
                <div v-show="!isCollapse" class="info-card">
                    <h1 class="brand-title">AI助手</h1>
                    <p class="brand-subtitle">管理后台</p>
                </div>
            </div>
            <el-menu-item
                @click="selectMenu"
                v-for="item in router.options.routes[0].children"
                :key="item.path"
                :index="item.path"
            >
                <el-icon><component :is="item.meta?.icon" /></el-icon>
                <span>{{ item.meta?.title }}</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

// 导入仓库
import { useAdminStore } from "@/stores/admin";

// 实例化仓库
const adminStore = useAdminStore();

const router = useRouter();
const iconUrl = new URL("@/assets/images/机器人.png", import.meta.url).href;

// 计算属性  进行监听
// 执行计算逻辑，只要计算属性关联的任意属性值发生变化，计算属性的函数就会被调用一次。
// 但如果计算属性关联的所有属性值都没有发生变化，计算属性的值会自动从缓存中获取。因此计算属性是支持缓存的。
// 计算属性返回的也是一个 Ref 响应式对象。
// 普通数据变了，计算属性会自动重新算一遍，用到它的地方也会自动更新。
const isCollapse = computed(() => {
    return adminStore.isCollapsed;
});

const selectMenu = (key: any) => {
    // console.log(key)
    const currentRoute = router.options.routes[0];
    router.push(`${currentRoute.path}/${key.index}`);
};
</script>
<style lang="scss" scoped>
.menu-style {
    height: 100%;
    .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        background-color: #fff;
        border-bottom: 1px solid #e5e7eb;
        .info-card {
            .brand-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #1f2937;
            }
            .brand-subtitle {
                font-size: 14px;
                color: #6b7280;
            }
        }
    }
}
</style>
