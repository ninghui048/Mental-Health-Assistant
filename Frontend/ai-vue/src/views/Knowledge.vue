<template>
    <div>
        <!-- 父组件Knowledge，子组件PageHead -->
        <PageHead title="知识文章">
            <template v-slot:button>
                <!-- 新增按钮 -->
                <!-- 点击绑定事件,把 dialogVisible属性 设为 true,显示新增弹窗 -->
                <el-button @click="handleAdd" type="primary">新增</el-button>
            </template>
        </PageHead>
        <!-- 传递数据 -->
        <!-- v-bind="{x: 300, y: 400}" 表示将对象的所有属性绑定到 Son 标签上 -->
        <!-- v-on 自定义方法 -->
        <!-- v-on用于给元素（或组件）绑定事件监听器，是 Vue 中最常用的指令之一，缩写为 **`@`** -->
        <!-- @search="handleSearch" 表示当搜索按钮被点击时，调用 handleSearch 方法 -->
        <!-- 将方法作为参数传递给子组件，通过回调函数的方式 -->
        <TableSearch :formItem="formItem" @search="handleSearch" />
        <el-table :data="tableData" style="width: 100%; margin-top: 25px">
            <el-table-column width="400" prop="title" label="文章标题" fixed="left">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-icon><Timer /></el-icon>
                        <span>{{ scope.row.title }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="categoryId" label="分类" width="150">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <el-icon><Timer /></el-icon>
                        <span>{{ categoryMap[scope.row.categoryId] }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="authorName" label="作者" width="150">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ scope.row.authorName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="readCount" label="阅读量" width="100">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ scope.row.readCount }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="publishAt" label="发布时间" width="200">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <span>{{ scope.row.updatedAt }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作" width="230" fixed="right">
                <template #default="scope">
                    <el-button @click="handleEdit(scope.row)" type="primary" text>编辑</el-button>
                    <el-button
                        v-if="Number(scope.row.status) === 0 || Number(scope.row.status) === 2"
                        @click="handlePublish(scope.row)"
                        text
                        type="success"
                        >发布</el-button
                    >
                    <el-button
                        v-if="Number(scope.row.status) === 1"
                        @click="handleUnpublish(scope.row)"
                        text
                        type="warning"
                        >下线</el-button
                    >
                    <el-button @click="handleDelete(scope.row)" type="danger" text>删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
            background
            style="margin-top: 20px; justify-content: left"
            layout="prev, pager, next"
            :total="pagination.total"
            :page-size="pagination.size"
            @change="handleChange"
        />
        <!-- 它绑定的是子组件 ArticleDialog 的 modelValue 属性，并监听 update:modelValue 事件 -->
        <!-- 当 dialogVisible 变化时，会触发 update:modelValue 事件，将新的值传递给子组件 -->
        <!-- 父组件将属性 dialogVisible 绑定到子组件的 modelValue 属性上 -->
        <!-- 父传子 categories -->
        <ArticleDialog
            v-model:modelValue="dialogVisible"
            :article="currentArticle"
            :categories="categories"
            @success="handleSuccess"
        />
    </div>
</template>
<script lang="ts" setup>
// @ts-ignore 忽略 Vue 模块类型声明缺失的问题
import PageHead from "@/components/PageHead.vue";
import TableSearch from "@/components/TableSearch.vue";
import ArticleDialog from "@/components/ArticleDialog.vue";
import {
    categoryTree,
    articlePage,
    getArticleDetail,
    changeArticleStatus,
    deleteArticle,
} from "@/api/admin";

import { onMounted, ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const formItem = [
    {
        comp: "input",
        prop: "title",
        label: "文章标题",
        placeholder: "请输入文章标题",
    },
    {
        comp: "select",
        prop: "categoryId",
        label: "分类",
        placeholder: "请选择分类",
    },
    {
        comp: "select",
        prop: "status",
        label: "状态",
        placeholder: "请选择状态",
        options: [
            {
                label: "草稿",
                value: "0",
            },
            {
                label: "已发布",
                value: "1",
            },
            {
                label: "已下线",
                value: "2",
            },
        ],
    },
];
// 分页参数
const pagination = reactive({
    currentPage: 1,
    size: 8,
    total: 0,
});
// 搜索方法
const handleSearch = async (formData: any) => {
    // 合并分页参数和查询参数
    const params = {
        ...pagination,
        ...formData,
    };
    const { records, total } = await articlePage(params);
    tableData.value = records;
    pagination.total = total;
};
// 分类映射
const categoryMap = reactive({});
// 分类列表
const categories = ref([]);
// 文章列表
const tableData = ref([]);
// 新增和编辑
const dialogVisible = ref(false);

onMounted(async () => {
    const data = await categoryTree();
    categories.value = data.map((item: any) => {
        categoryMap[item.id] = item.categoryName;
        return {
            label: item.categoryName,
            value: item.id,
        };
    });
    formItem[1].options = categories.value;
    // 初始化查询
    handleSearch({});
});
const handleSuccess = () => {
    dialogVisible.value = false;
    // 刷新列表
    handleSearch({});
};
const currentArticle = ref<any>(null);
// 新增:清空当前文章,避免沿用上一次编辑的数据
const handleAdd = () => {
    currentArticle.value = null;
    dialogVisible.value = true;
};
const handleEdit = (row: any) => {
    if (!row.id) {
        // 新增
        currentArticle.value = null;
        dialogVisible.value = true;
    } else {
        // 编辑
        getArticleDetail(row.id).then((res) => {
            console.log(res, "编辑详情");
            currentArticle.value = res;
            dialogVisible.value = true;
        });
    }
};
// 发布文章
const handlePublish = (row: any) => {
    ElMessageBox.confirm(`确认发布文章 ${row.title}吗？`, "确认", {
        confirmButtonText: "确定发布",
        cancelButtonText: "取消",
        type: "info",
    }).then(() => {
        changeArticleStatus(row.id, { status: 1 }).then((res) => {
            ElMessage.success("发布成功");
            handleSearch({});
        });
    });
};
// 下线文章
const handleUnpublish = (row: any) => {
    ElMessageBox.confirm(`确认下线文章 ${row.title}吗？`, "确认", {
        confirmButtonText: "确定下线",
        cancelButtonText: "取消",
        type: "info",
    }).then(() => {
        changeArticleStatus(row.id, { status: 2 }).then((res) => {
            ElMessage.success("下线成功");
            handleSearch({});
        });
    });
};
// 分页改变时触发
const handleChange = (page: number) => {
    pagination.currentPage = page;
    handleSearch({});
};
const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确认删除文章${row.title}吗？`, "确认", {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "danger",
    }).then(() => {
        deleteArticle(row.id).then((res) => {
            ElMessage.success("删除成功");
            handleSearch({});
        });
    });
};
</script>
<style lang="scss" scoped></style>
