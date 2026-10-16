<template>
    <el-dialog
        :title="isEdit ? '编辑文章' : '新增文章'"
        v-model="dialogVisible"
        width="50%"
        @close="handleClose"
    >
        <!-- 表单数据，校验规则，表单引用，表单标签宽度 -->
        <!-- ref="formRef" 就是给表单贴了个标签，之后可以通过 formRef 这个变量操作这个表单。 -->
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="文章标题" prop="title">
                <el-input
                    v-model="formData.title"
                    placeholder="请输入文章标题"
                    maxlength="200"
                    show-word-limit
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="文章分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择文章分类">
                    <el-option
                        v-for="item in props.categories"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input
                    type="textarea"
                    v-model="formData.summary"
                    placeholder="请输入文章摘要(可选)"
                    maxlength="1000"
                    show-word-limit
                    :rows="4"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="标签" prop="tags">
                <el-select
                    v-model="formData.tagArray"
                    placeholder="请输入文章标签(逗号分隔)"
                    multiple
                    filterable
                    allow-create
                    style="width: 100%"
                >
                    <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                    <el-upload
                        class="avatar-uploader"
                        action="#"
                        :before-upload="beforeAvatarUpload"
                        :http-request="handleUploadRequest"
                        :show-file-list="false"
                        accept="image/*"
                    >
                        <div v-if="!imgUrl" class="cover-placeholder">
                            <p>点击上传封面</p>
                        </div>
                        <img v-else :src="imgUrl" class="cover-image" alt="封面图片" />
                    </el-upload>
                    <div v-if="imgUrl" class="cover-remove">
                        <el-button type="danger" size="mini" @click="handleRemove"
                            >移除封面</el-button
                        >
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
                <RichTextEditor
                    v-if="!btnPreview"
                    v-model="formData.content"
                    placeholder="请输入文章内容"
                    :maxCharCount="5000"
                    @change="handleContentChange"
                    @create="handleEditorCreated"
                    min-height="200px"
                />
                <!-- 预览时用预览内容替换编辑器 -->
                <div v-else class="content-preview" v-html="formData.content"></div>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="btnPreview = !btnPreview">{{
                btnPreview ? "隐藏预览" : "预览效果"
            }}</el-button>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit(formRef)" :loading="loading">{{
                isEdit ? "更新文章" : "创建文章"
            }}</el-button>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, nextTick, watch } from "vue";
import { ElMessage } from "element-plus";
import { uploadFile, createArticle, updateArticle } from "@/api/admin";
import { fileBaseUrl } from "@/config/index";
import RichTextEditor from "@/components/RichTextEditor.vue";
// 表单引用
const formRef = ref();

const btnPreview = ref(false);
// 表单数据
const formData = reactive({
    title: "",
    content: "",
    coverImage: "",
    categoryId: "",
    summary: "",
    tags: "",
    tagArray: [] as string[],
    id: "",
});
const commonTags = [
    "情绪管理",
    "焦虑",
    "抑郁",
    "压力",
    "睡眠",
    "冥想",
    "正念",
    "放松",
    "心理健康",
    "自我成长",
    "人际关系",
    "工作压力",
    "学习方法",
    "生活技巧",
];
// 校验规则
const rules = reactive({
    title: [
        { required: true, message: "请输入文章标题", trigger: "blur" },
        { max: 200, message: "文章标题最多200个字符", trigger: "blur" },
    ],
    categoryId: [{ required: true, message: "请选择文章分类", trigger: "change" }],
    content: [
        { required: true, message: "请输入文章内容", trigger: "blur" },
        { max: 5000, message: "文章内容最多5000个字符", trigger: "blur" },
    ],
});

const imgUrl = ref("");

// 计算属性,监听 modelValue 变化,更新 dialogVisible
/*
父组件用 v-model 传进来的值，
子组件通过这个计算属性读写：读的时候拿 props.modelValue，
写的时候通过 emit 通知父组件更新。
*/
const dialogVisible = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emit("update:modelValue", val);
    },
});
const handleClose = () => {
    btnPreview.value = false;
    // 重置表单
    formRef.value.resetFields();
    // 重置ID;
    businessId.value = null;
    // 重置标签;
    formData.tagArray = [];
    // 重置封面图片和数据
    handleRemove();
    // emit 通知父组件更新 modelValue 为 false
    emit("update:modelValue", false);
};
// 上传前校验
const beforeAvatarUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    // 校验文件大小
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isImage) {
        ElMessage.error("上传封面图片,请上传图片文件");
        return false;
    }
    if (!isLt5MB) {
        ElMessage.error("上传封面图片,文件大小不能超过5MB");
        return false;
    }
    return true;
};
const isEdit = computed(() => !!props.article?.id);

const businessId = ref<string | null>(null);
const handleUploadRequest = async ({ file }) => {
    // UUID生成
    businessId.value = crypto.randomUUID();
    const fileRes = await uploadFile(file, {
        businessId: businessId.value,
    });
    console.log(fileRes);
    // 拼接完整的图片地址
    imgUrl.value = fileBaseUrl + fileRes.filePath;
    formData.coverImage = fileRes.filePath;
};
const handleRemove = () => {
    imgUrl.value = "";
    formData.coverImage = "";
};
// 提交
const loading = ref(false);
const handleSubmit = async (formRef) => {
    formRef.validate((valid, fields) => {
        if (valid) {
            loading.value = true;
        }
        console.log(formData, "FormData");
        const submitData: Record<string, any> = {
            ...formData,
            tags: formData.tagArray.join(","),
        };
        delete submitData.tagArray;

        if (!isEdit.value) {
            submitData.id = businessId.value;
            createArticle(submitData).then((res) => {
                loading.value = false;
                emit("success");
            });
        } else {
            updateArticle(props.article.id, submitData).then((res) => {
                loading.value = false;
                emit("success");
            });
        }
    });
};

// 富文本内容改变时触发
const handleContentChange = (content) => {
    formData.content = content.html;
};
const editorInstance = ref(null);
const handleEditorCreated = (editor) => {
    editorInstance.value = editor;
    if (formData.content && editor) {
        nextTick(() => {
            editor.setHtml(formData.content);
        });
    }
};

// 我这个组件会往外发这两个事件，父组件可以用 @事件名 来监听
const emit = defineEmits(["update:modelValue", "success"]);
// 子组件接收父组件传递的 modelValue <-赋值- 父组件的dialogVisible 属性
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    categories: {
        type: Array,
        default: () => [],
    },
    article: {
        type: Object,
        default: null,
    },
});

// 监听 article 变化,更新 formData(放在 defineProps 之后,getter 才能立即读取 props)
watch(
    () => props.article,
    (newVal) => {
        if (newVal) {
            nextTick(() => {
                Object.assign(formData, newVal);
                // 使用现有ID
                businessId.value = newVal.id;
                // 封面Url
                imgUrl.value = fileBaseUrl + newVal.coverImage;
            });
        }
    },
);
</script>
<style lang="scss" scoped>
.cover-upload {
    display: inline-block;
}

/* 隐藏 el-upload 默认的上传区域样式，只保留我们自己的占位框 */
.avatar-uploader :deep(.el-upload) {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 未上传时的灰色占位框 */
.cover-placeholder {
    width: 200px;
    height: 120px;
    flex-direction: column;
    background-color: #f5f7fa;
    color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.cover-placeholder p {
    margin: 0;
}

.cover-image {
    width: 200px;
    height: 120px;
    display: block;
}
.cover-remove {
    margin-top: 10px;
}

/* 预览内容区域:与编辑器保持一致的边框与高度 */
.content-preview {
    width: 100%;
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #fff;
    line-height: 1.6;
}
</style>
