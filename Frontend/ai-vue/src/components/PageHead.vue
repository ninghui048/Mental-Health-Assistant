<template>
    <div class="page-head">
        <p class="page-title">{{ props.title }}</p>
        <div class="action-btn">
            <!-- 具名插槽语法(无name是默认插槽)，作用是在子组件里预留一个位置，让父组件往里塞自定义内容。 -->
            <slot name="button"></slot>
        </div>
    </div>
</template>
<script lang="ts" setup>
// 父传子
// 定义一个属性，用于接收父组件传递过来的 title 参数。
const props = defineProps({
    title: {
        type: String,
        default: "页面标题",
    },
});
</script>
<style lang="scss" scoped>
.page-head {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
}
.page-title {
    font-size: 24px;
    color: #203748;
}
.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
