<template>
    <!-- v-model指令可以完成双向数据绑定效果 -->
    <el-form ref="ruleFormRef" :model="formData">
        <el-row :gutter="24">
            <template v-for="item in formItemAttr" :key="item.prop">
                <el-col v-bind="item.col">
                    <el-form-item :label="item.label" :prop="item.prop">
                        <component
                            v-model="formData[item.prop]"
                            :is="isComp(item.comp)"
                            :placeholder="item.placeholder"
                        >
                            <!-- 虚拟包裹元素"，本身不渲染任何真实 DOM 元素 -->
                            <template v-if="item.comp === 'select'">
                                <el-option label="全部" value="" />
                                <el-option
                                    v-for="opt in item.options"
                                    :key="opt.value"
                                    :label="opt.label"
                                    :value="opt.value"
                                />
                            </template>
                        </component>
                    </el-form-item>
                </el-col>
            </template>
        </el-row>
        <el-row>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset(ruleFormRef)">重置</el-button>
        </el-row>
    </el-form>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from "vue";

const isComp = (comp: string) => {
    return {
        input: "elInput",
        select: "elSelect",
    }[comp];
};
// 表单数据
const ruleFormRef = ref();
const formData = reactive({});

const handleSearch = () => {
    // 触发自定义事件"search"，将表单数据作为参数传递给父组件
    emit("search", formData);
};
const handleReset = (ruleFormRef: any) => {
    // 先重置表单数据，然后在查询
    if (!ruleFormRef) return;
    ruleFormRef.resetFields();
    emit("search", formData);
};

const formItemAttr = computed(() => {
    const { formItem } = props;
    formItem.forEach((item: any) => {
        item.col = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    });
    return formItem;
});

// 定义组件的属性, 用于接收父组件传递过来的参数
const props = defineProps({
    formItem: {
        type: Array,
        default: () => [],
    },
});
// 可以向外发出哪些自定义事件"，并返回 `emit` 函数供调用
const emit = defineEmits(["search", "reset"]);
</script>
<style lang="scss" scoped></style>
