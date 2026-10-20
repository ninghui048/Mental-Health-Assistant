<template>
    <div class="consultation-container">
        <div class="sidebar">
            <!-- AI助手信息 -->
            <div class="ai-assistant-info">
                <div class="breathing-circle">
                    <el-image :src="iconUrl" style="width: 25px; height: 25px" alt="AI助手" />
                </div>
                <h3 class="assistant-name">宁渡AI助手</h3>
                <div class="online-status">
                    <div class="status-dot"></div>
                    在线服务中
                </div>
            </div>
            <!-- 情绪花园 -->
            <div class="emotion-garden">
                <div class="garden-header">
                    <div class="garden-title">情绪花园</div>
                </div>
                <div class="emotion-info">
                    <div class="emotion-name">中性</div>
                    <div class="emotion-score">50</div>
                </div>
                <div class="warm-tips">
                    <div class="emotion-status-text">
                        <span class="status-label">今天感觉</span>
                        <span class="status-emotion">{{
                            currentEmotion.isNegative ? "需要关注" : "很不错"
                        }}</span>
                    </div>
                    <div class="emotion-intensity">
                        <span class="intensity-dots">
                            <span
                                v-for="dot in 3"
                                :key="dot"
                                class="dot"
                                :class="{
                                    active: getIntensityClass(currentEmotion.emotionScore) >= dot,
                                }"
                            ></span>
                        </span>
                        <span class="intensity-text">
                            {{ getRiskText(currentEmotion.riskLevel) }}
                        </span>
                    </div>
                    <!-- 温暖建议卡片 -->
                    <div class="warm-suggestion" v-if="currentEmotion.suggestion">
                        <div class="suggestion-icon">💝</div>
                        <div class="suggestion-content">
                            <div class="suggestion-title">给你的小建议</div>
                            <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
                        </div>
                    </div>
                    <!-- 治愈行动 -->
                    <div
                        class="healing-actions"
                        v-if="currentEmotion.improvementSuggestions.length > 0"
                    >
                        <div class="actions-title">治愈小行动</div>
                        <div class="actions-list">
                            <div
                                v-for="action in currentEmotion.improvementSuggestions"
                                :key="action"
                                class="action-item"
                            >
                                <div class="action-icon">✨</div>
                                <div class="action-text">{{ action }}</div>
                            </div>
                        </div>
                    </div>
                    <!-- 风险提示 -->
                    <div
                        class="risk-notice"
                        v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1"
                    >
                        <div class="notice-icon">🤗</div>
                        <div class="notice-content">
                            <div class="notice-title">温馨提示</div>
                            <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 会话列表 -->
            <div class="session-history">
                <h4 class="section-title">会话列表</h4>
                <div class="session-list">
                    <div
                        v-for="session in sessionList"
                        :key="session.id"
                        @click="handleSessionClick(session)"
                        class="session-item"
                    >
                        <div class="session-info">
                            <div class="session-title">
                                <span>{{ session.sessionTitle }}</span>
                                <div class="session-meta">
                                    <span class="session-time">{{ session.startedAt }}</span>
                                </div>
                                <div class="session-preview">
                                    {{ session.lastMessageContent }}
                                </div>
                                <div class="session-stats">
                                    <span>
                                        <el-icon>
                                            <ChatRound />
                                        </el-icon>
                                        {{ session.messageCount || 0 }}
                                    </span>
                                    <span>
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        {{ session.durationMinutes || 0 }} 分钟
                                    </span>
                                </div>
                            </div>
                            <div class="session-actions">
                                <el-button
                                    text
                                    type="danger"
                                    size="small"
                                    @click.stop="handleDeleteSession(session.id)"
                                >
                                    <el-icon>
                                        <DeleteFilled />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat-main">
            <div class="chat-header">
                <div class="header-left">
                    <div class="chat-avatar">
                        <el-image :src="iconUrl1" style="width: 30px; height: 30px" />
                    </div>
                    <div class="chat-info">
                        <h2>AI助手</h2>
                        <p>您的贴心AI心理健康助手</p>
                    </div>
                </div>
                <el-button circle @click="createNewFrontendSession" title="新建会话">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-button>
            </div>
            <!-- 聊天消息区域 -->
            <div class="chat-messages" ref="chatMessagesRef">
                <!-- 欢迎用语 -->
                <div class="message-item ai-message" v-if="messages.length === 0">
                    <div class="message-avatar">
                        <el-image :src="iconUrl" style="width: 18px; height: 18px" />
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>
                                您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？
                            </p>
                        </div>
                        <div class="message-time">刚刚</div>
                    </div>
                </div>
                <!-- 消息列表 -->
                <div
                    v-for="msg in messages"
                    :key="msg.id"
                    class="message-item"
                    :class="msg.senderType === 1 ? 'user-message' : 'ai-message'"
                >
                    <div class="message-avatar">
                        <el-image
                            v-if="msg.senderType === 1"
                            style="width: 18px; height: 18px"
                            :src="iconUrl2"
                        ></el-image>
                        <el-image
                            v-if="msg.senderType === 2"
                            style="width: 18px; height: 18px"
                            :src="iconUrl"
                        ></el-image>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <!-- AI正在思考中 -->
                            <div
                                v-if="msg.senderType === 2 && isAiTyping && !msg.content"
                                class="typing-indicator"
                            >
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                            <!-- AI错误提示 -->
                            <div v-else-if="msg.isError" class="error-message">
                                <p>{{ msg.content }}</p>
                            </div>
                            <!-- AI正常返回消息 -->
                            <MarkdownRenderer
                                v-else-if="msg.senderType === 2 && !msg.isError"
                                :content="msg.content"
                                :is-ai-message="true"
                            />
                            <p
                                v-else-if="msg.content"
                                v-html="formatMessageContent(msg.content)"
                            ></p>
                        </div>
                        <div class="message-time">
                            {{
                                msg.senderType === 2 && isAiTyping ? "正在输入中..." : msg.createdAt
                            }}
                        </div>
                    </div>
                </div>
            </div>
            <!-- 消息输入区域 -->
            <div class="chat-input">
                <div class="input-container">
                    <el-input
                        v-model="userMessage"
                        placeholder="请输入您想要分享的内容..."
                        type="textarea"
                        :rows="3"
                        :disabled="isAiTyping"
                        @keydown="handleKeyDown"
                        class="message-input"
                        clearable
                    />
                    <div class="input-footer">
                        <span>按Enter发送，Shift+Enter换行</span>
                        <span>{{ userMessage.length }}/500</span>
                    </div>
                </div>
                <el-button
                    :disabled="!userMessage.trim() || userMessage.length > 500"
                    type="primary"
                    class="send-btn"
                    @click="sendMessage"
                >
                    <el-icon>
                        <Promotion />
                    </el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import {
    startSession,
    getSessionList,
    deleteSession,
    getSessionDetail,
    getSessionEmotion,
} from "@/api/frontend";
import { ElMessage } from "element-plus";
import { ChatRound, DeleteFilled } from "@element-plus/icons-vue";
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const iconUrl = new URL("@/assets/images/robot-fill.png", import.meta.url).href;
const iconUrl1 = new URL("@/assets/images/like.png", import.meta.url).href;
const iconUrl2 = new URL("@/assets/images/users.png", import.meta.url).href;

// 新建会话
const createNewFrontendSession = () => {
    // AI正在流式回复时不允许新建，避免流式回调写入已清空的列表
    if (isAiTyping.value) {
        ElMessage.error("AI助手正在输入中，请稍后");
        return;
    }
    // 创建一个新的会话对象
    const newSession = {
        sessionId: `temp_${Date.now()}`,
        status: "TEMP",
        sessionTitle: "新对话",
    };
    currentSession.value = newSession;
    // 清空对话区，恢复欢迎语
    messages.value = [];
    userMessage.value = "";
    // 重置情绪花园为默认状态
    currentEmotion.value = {
        primaryEmotion: "中性",
        emotionScore: 50,
        isNegative: false,
        riskLevel: 0,
        suggestion: "情绪状态平稳",
        improvementSuggestions: [],
    };
};

// 定义一个当前会话对象
const currentSession = ref(null);
const sessionList = ref([]);

// 定义对话消息
const messages = ref([]);
// 定义用户输入消息
const userMessage = ref("");
// 定义AI助手是否正在输入
const isAiTyping = ref(false);

// 情绪花园
const currentEmotion = ref({
    primaryEmotion: "中性",
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: "情绪状态平稳",
    improvementSuggestions: [],
});

const loadSessionEmotion = (sessionId) => {
    // 确保sessionID格式正确
    const id = sessionId.toString().startsWith("session_") ? sessionId : `session_${sessionId}`;

    getSessionEmotion(id).then((res) => {
        console.log(res);
        currentEmotion.value = res;
    });
};

const getIntensityClass = (score) => {
    if (score >= 61) {
        return 3;
    }
    if (score >= 31) {
        return 2;
    }
    return 1;
};

const getRiskText = (level) => {
    switch (level) {
        case 0:
            return "正常";
        case 1:
            return "关注";
        case 2:
            return "预警";
        case 3:
            return "危机";
        default:
            return "正常";
    }
};

// 定义处理键盘事件
const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// 用户发送消息
const sendMessage = () => {
    if (!userMessage.value.trim()) return;

    if (isAiTyping.value) {
        ElMessage.error("AI助手正在输入中，请稍后");
        return;
    }

    const message = userMessage.value.trim();
    userMessage.value = "";

    // 如果没有会话或者是临时会话，就需要创建一个新的会话
    if (currentSession.value.status === "TEMP") {
        startNewSession(message);
    } else {
        // 继续现有会话
        messages.value.push({
            id: Date.now(),
            senderType: 1,
            content: message,
            createAt: new Date().toISOString(),
        });
        startAIResponse(currentSession.value.sessionId, message);
    }
};

const startNewSession = (message) => {
    // 构建会话参数
    const sessionParams = {
        initialMessage: message,
    };
    if (currentSession.value.sessionTitle === "新对话") {
        sessionParams.sessionTitle = `AI助手 - ${new Date().toLocaleString()}`;
    } else {
        // 如果历史会话记录
        sessionParams.sessionTitle = currentSession.value.sessionTitle;
    }
    // 调用后端接口创建新会话
    startSession(sessionParams).then((res) => {
        console.log(res);
        // 将后端返回的数据转为前端会话格式
        const sessionData = {
            sessionId: res.sessionId,
            status: res.status,
            sessionTitle: sessionParams.sessionTitle,
        };
        // 如果当前是临时会话，更新数据
        if (currentSession.value && currentSession.value.status === "TEMP") {
            // 更新为正式会话
            Object.assign(currentSession.value, sessionData);
        } else {
            // 否则，创建一个新的会话
            currentSession.value = sessionData;
        }
        // 更新会话列表
        getSessionPage();

        // 添加初始用户消息
        messages.value.push({
            id: Date.now(),
            senderType: 1,
            content: message,
            createAt: new Date().toISOString(),
        });

        // 开始流式对话
        startAIResponse(currentSession.value.sessionId, message);
    });
};

const startAIResponse = (sessionId, userMessage) => {
    // 防止重复发送
    if (isAiTyping.value) {
        ElMessage.error("AI助手正在输入中，请稍后");
        return;
    }

    isAiTyping.value = true;

    const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderType: 2,
        content: "",
        createAt: new Date().toISOString(),
    };
    messages.value.push(aiMessage);

    // 调用流式接口
    const ctrl = new AbortController(); // 用来中止fetch请求
    fetchEventSource("/api/psychological-chat/stream", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Token: localStorage.getItem("token"),
            Accept: "text/event-stream",
        },
        body: JSON.stringify({
            sessionId,
            userMessage,
        }),
        signal: ctrl.signal,
        onopen: (response) => {
            console.log(response);
            if (response.headers.get("Content-Type") !== "text/event-stream") {
                ElMessage.error("服务器返回非流式数据");
            }
        },
        onmessage: (event) => {
            const raw = event.data.trim();
            if (!raw) return;
            const eventName = event.event;
            // 当前会话的AI消息
            const aiMessage = messages.value[messages.value.length - 1];

            if (eventName === "done") {
                isAiTyping.value = false;
                ctrl.abort();
                // 进行情绪分析
                loadSessionEmotion(currentSession.value.sessionId);
                return;
            }
            const payload = JSON.parse(raw);
            const ok = String(payload.code) === "200";
            if (ok && payload.data && payload.data.content) {
                aiMessage.content += payload.data.content;
            } else if (!ok) {
                // 错误回复的显示
                handleError(payload.message || "AI回复失败");
            }
        },
        onerror: (err) => {
            handleError(err || "AI回复失败");
            throw err;
        },
        onclose: () => {
            // 开始情绪分析
            loadSessionEmotion(currentSession.value.sessionId);
        },
    });
};

// 错误处理函数
const handleError = (error) => {
    // 当前会话的AI消息
    const aiMessage = messages.value[messages.value.length - 1];
    if (aiMessage) {
        aiMessage.content = "AI回复失败，请重试";
    }
    isAiTyping.value = false;
    ElMessage.error("AI回复失败，请重试");
};

const getSessionPage = () => {
    getSessionList({
        pageNum: 1,
        pageSize: 10,
    }).then((res) => {
        console.log(res);
        sessionList.value = res.records;
    });
};

// 获取会话数据
const handleSessionClick = (session) => {
    console.log(session, "session");
    // 点击会话时，获取会话详情
    getSessionDetail(session.id).then((res) => {
        console.log(res);
        messages.value = res;
    });
    loadSessionEmotion(session.id);
    // 更新当前会话对象数据
    const sessionData = {
        sessionId: "session_" + session.id,
        status: "ACTIVE",
        sessionTitle: session.sessionTitle,
    };
    currentSession.value = sessionData;
};

const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId).then((res) => {
        ElMessage.success("删除成功");
        getSessionPage();
    });
};

// 简单的换行逻辑
const formatMessageContent = (content) => {
    return content.replace(/\n/g, "<br>");
};

// 聊天消息容器引用
const chatMessagesRef = ref(null);

// 滚动到最新消息
const scrollToBottom = () => {
    nextTick(() => {
        const el = chatMessagesRef.value;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    });
};

// 监听消息变化（新消息 + 流式追加），自动滚到底部
watch(messages, scrollToBottom, { deep: true });

onMounted(() => {
    // 初始化时获取会话列表
    getSessionPage();
    // 初始化时创建一个新会话
    createNewFrontendSession();
});
</script>
<style scoped lang="scss">
$paper: #f5f3ee;
$card: #ffffff;
$ink: #2e332f;
$muted: #7a817b;
$faint: #a9aea9;
$hairline: rgba(46, 51, 47, 0.09);
$tea: #4a9c8c;
$tea-deep: #35796b;
$tea-tint: rgba(74, 156, 140, 0.09);
$amber: #b97f24;
$serif: "Noto Serif SC", "Songti SC", "STSong", serif;

// ========== 布局容器 ==========
.consultation-container {
    width: min(1280px, 100%);
    height: calc(100vh - 130px);
    min-height: 620px;
    margin: 0 auto;
    display: flex;
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
    overflow: hidden;
    background: $paper;

    // ========== 侧边栏：一张纸卡 + 细分隔线 ==========
    .sidebar {
        width: 324px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        background: $card;
        border: 1px solid $hairline;
        border-radius: 16px;
        padding: 22px 20px 8px;
        box-shadow: 0 2px 12px rgba(46, 51, 47, 0.07);
        scrollbar-width: thin;
        scrollbar-color: rgba(74, 156, 140, 0.25) transparent;

        &::-webkit-scrollbar {
            width: 5px;
        }
        &::-webkit-scrollbar-thumb {
            background: rgba(74, 156, 140, 0.22);
            border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }

        > * {
            flex-shrink: 0;
        }

        .ai-assistant-info,
        .emotion-garden,
        .session-history {
            padding: 18px 0;
            border-bottom: 1px solid $hairline;
        }
        .ai-assistant-info {
            padding-top: 0;
        }
        .session-history {
            border-bottom: none;
            padding-bottom: 12px;
        }

        .ai-assistant-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .breathing-circle {
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background: $tea-tint;
                border: 1px solid rgba(74, 156, 140, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                animation: breathing 4s ease-in-out infinite;
            }
            .assistant-name {
                font-family: $serif;
                font-size: 17px;
                font-weight: 600;
                color: $ink;
                margin: 0 0 5px;
                letter-spacing: 2px;
            }
            .online-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: $tea-deep;
                margin-top: 2px;
                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: $tea;
                    border-radius: 50%;
                    animation: pulse 2.4s ease-in-out infinite;
                }
            }
        }

        .emotion-garden {
            .garden-header {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                margin-bottom: 16px;
                .garden-title {
                    font-family: $serif;
                    font-size: 15px;
                    font-weight: 600;
                    color: $ink;
                    letter-spacing: 1.5px;
                }
            }

            .emotion-info {
                width: 88px;
                height: 88px;
                margin: 0 auto 16px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, $tea, $tea-deep);
                color: #fff;
                border: 2px solid rgba(255, 255, 255, 0.85);
                box-shadow: 0 6px 20px rgba(74, 156, 140, 0.28);
                .emotion-name {
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 3px;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                }
                .emotion-score {
                    font-size: 13px;
                    font-weight: 600;
                    opacity: 0.92;
                }
            }

            .warm-tips {
                .emotion-status-text {
                    margin-bottom: 10px;
                    text-align: center;
                    .status-label {
                        font-size: 13px;
                        color: $muted;
                        margin-right: 8px;
                    }
                    .status-emotion {
                        font-size: 12px;
                        font-weight: 600;
                        padding: 2px 12px;
                        border-radius: 999px;
                        display: inline-block;
                        color: $amber;
                        background: rgba(185, 127, 36, 0.1);
                    }
                }
                .emotion-intensity {
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    .intensity-dots {
                        display: flex;
                        gap: 5px;
                        .dot {
                            width: 7px;
                            height: 7px;
                            border-radius: 50%;
                            background: rgba(46, 51, 47, 0.12);
                            transition: all 0.3s ease;
                            &.active {
                                background: $tea;
                            }
                        }
                    }
                    .intensity-text {
                        font-size: 12px;
                        color: $muted;
                    }
                }

                .warm-suggestion {
                    padding: 2px 0 2px 12px;
                    border-left: 2px solid rgba(185, 127, 36, 0.45);
                    margin-bottom: 12px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    .suggestion-icon {
                        font-size: 16px;
                        flex-shrink: 0;
                    }
                    .suggestion-content {
                        flex: 1;
                        .suggestion-title {
                            font-size: 12px;
                            font-weight: 600;
                            color: $amber;
                            margin-bottom: 4px;
                            letter-spacing: 0.5px;
                        }
                        .suggestion-text {
                            font-size: 13px;
                            color: $ink;
                            line-height: 1.7;
                        }
                    }
                }

                .healing-actions {
                    margin-bottom: 12px;
                    .actions-title {
                        font-size: 12px;
                        font-weight: 600;
                        color: $muted;
                        margin-bottom: 8px;
                        letter-spacing: 0.5px;
                    }
                    .actions-list {
                        display: flex;
                        flex-direction: column;
                        .action-item {
                            padding: 8px 0 8px 12px;
                            border-top: 1px solid $hairline;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            .action-icon {
                                font-size: 12px;
                                color: $tea;
                                flex-shrink: 0;
                            }
                            .action-text {
                                font-size: 12px;
                                color: $ink;
                                line-height: 1.6;
                                flex: 1;
                            }
                        }
                    }
                }

                .risk-notice {
                    padding: 10px 12px;
                    border-radius: 10px;
                    background: rgba(176, 58, 75, 0.05);
                    border-left: 2px solid rgba(176, 58, 75, 0.4);
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    .notice-icon {
                        font-size: 16px;
                        flex-shrink: 0;
                    }
                    .notice-content {
                        flex: 1;
                        .notice-title {
                            font-size: 12px;
                            font-weight: 600;
                            color: #b03a4b;
                            margin-bottom: 4px;
                        }
                        .notice-text {
                            font-size: 12px;
                            color: $ink;
                            line-height: 1.6;
                        }
                    }
                }
            }
        }

        .session-history {
            .section-title {
                font-family: $serif;
                font-size: 15px;
                font-weight: 600;
                color: $ink;
                letter-spacing: 1.5px;
                margin: 0 0 6px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .session-list {
                max-height: 240px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(74, 156, 140, 0.25) transparent;
                .session-item {
                    position: relative;
                    padding: 11px 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s ease;

                    &:hover {
                        background: $tea-tint;
                        .session-actions {
                            opacity: 1;
                        }
                    }
                    &.active {
                        background: $tea-tint;
                        box-shadow: inset 2px 0 0 $tea;
                    }

                    .session-info {
                        min-width: 0;
                        .session-title {
                            .session-time {
                                font-size: 11px;
                                color: $faint;
                            }
                            .session-preview {
                                font-size: 12px;
                                color: $muted;
                                margin-bottom: 5px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                            .session-stats {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                span {
                                    font-size: 11px;
                                    color: $faint;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    .el-icon {
                                        font-size: 12px;
                                    }
                                }
                            }
                        }
                        .session-actions {
                            position: absolute;
                            top: 8px;
                            right: 6px;
                            opacity: 0.55;
                            transition: opacity 0.2s ease;
                        }
                    }
                }
                .no-sessions-text {
                    text-align: center;
                    padding: 20px 0 10px;
                    color: $muted;
                    font-size: 13px;
                }
            }
        }
    }

    // ========== 聊天主区域 ==========
    .chat-main {
        background: $card;
        border: 1px solid $hairline;
        border-radius: 16px;
        box-shadow: 0 2px 12px rgba(46, 51, 47, 0.07);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        min-width: 0;

        .chat-header {
            background: $card;
            border-bottom: 1px solid $hairline;
            padding: 16px 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;

            .header-left {
                display: flex;
                align-items: center;
                .chat-avatar {
                    width: 42px;
                    height: 42px;
                    background: $tea-tint;
                    border: 1px solid rgba(74, 156, 140, 0.25);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 13px;
                }
                .chat-info {
                    h2 {
                        font-family: $serif;
                        font-size: 18px;
                        font-weight: 600;
                        color: $ink;
                        margin: 0 0 3px;
                        letter-spacing: 2px;
                    }
                    p {
                        font-size: 12px;
                        color: $muted;
                        margin: 0;
                    }
                }
            }
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 26px 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 22px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(74, 156, 140, 0.28) transparent;

            &::-webkit-scrollbar {
                width: 6px;
            }
            &::-webkit-scrollbar-thumb {
                background: rgba(74, 156, 140, 0.22);
                border-radius: 6px;
            }
            &::-webkit-scrollbar-track {
                background: transparent;
            }

            .message-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                width: min(760px, 100%);
                margin: 0 auto;
                animation: fadeInUp 0.3s ease-out;

                .message-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                &.ai-message {
                    .message-avatar {
                        background: $tea-tint;
                        border: 1px solid rgba(74, 156, 140, 0.22);
                    }
                    .message-bubble {
                        background: transparent;
                        border: none;
                        padding: 4px 0 0;
                    }
                }
                &.user-message {
                    flex-direction: row-reverse;
                    .message-avatar {
                        background: $tea-deep;
                    }
                    .message-content {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                    }
                    .message-bubble {
                        background: $tea-deep;
                        color: #fff;
                        border-radius: 14px 14px 4px;
                        padding: 11px 16px;
                    }
                    .message-time {
                        text-align: right;
                    }
                }
                .message-content {
                    max-width: 78%;
                    min-width: 0;
                    .message-bubble {
                        font-size: 14px;
                        line-height: 1.85;
                        color: $ink;
                        word-break: break-word;
                        p {
                            margin: 0;
                        }
                        .typing-indicator {
                            display: flex;
                            gap: 5px;
                            padding: 8px 2px;
                            .typing-dot {
                                width: 7px;
                                height: 7px;
                                background: $tea;
                                border-radius: 50%;
                                animation: typing 1.4s ease-in-out infinite;
                                &:nth-child(2) {
                                    animation-delay: 0.18s;
                                }
                                &:nth-child(3) {
                                    animation-delay: 0.36s;
                                }
                            }
                        }
                        .error-message {
                            background: rgba(176, 58, 75, 0.06);
                            border-left: 2px solid rgba(176, 58, 75, 0.4);
                            border-radius: 8px;
                            padding: 9px 13px;
                            color: #8f2f3e;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                    }
                    .message-time {
                        font-size: 11px;
                        color: $faint;
                        margin-top: 5px;
                        padding: 0 2px;
                    }
                }
            }
        }

        .chat-input {
            border-top: 1px solid $hairline;
            padding: 16px 22px 14px;
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: $card;
            flex-shrink: 0;

            .input-container {
                flex: 1;
                min-width: 0;

                :deep(.el-textarea__inner) {
                    border-radius: 12px;
                    border: 1px solid $hairline;
                    background: $paper;
                    padding: 12px 15px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: $ink;
                    resize: none;
                    box-shadow: none;
                    transition:
                        border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;

                    &::placeholder {
                        color: $faint;
                    }
                    &:hover {
                        border-color: rgba(74, 156, 140, 0.35);
                    }
                    &:focus {
                        border-color: $tea;
                        background: $card;
                        box-shadow: 0 0 0 3px rgba(74, 156, 140, 0.13);
                        outline: none;
                    }
                }
                :deep(.el-input__count) {
                    background: transparent;
                }
            }
            .input-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: $faint;
                margin-top: 6px;
                padding: 0 2px;
            }
            .send-btn {
                height: 48px;
                width: 48px;
                border-radius: 50%;
                background: $tea-deep !important;
                border: none !important;
                transition:
                    background 0.2s ease,
                    transform 0.2s ease;
                flex-shrink: 0;

                &:not(.is-disabled):hover {
                    background: #2c6659 !important;
                    transform: translateY(-1px);
                }
                &.is-disabled {
                    background: rgba(46, 51, 47, 0.14) !important;
                }
            }
        }
    }
}

// ========== 动画 ==========
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.45;
    }
}

@keyframes breathing {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.06);
    }
}

@keyframes typing {
    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-4px);
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// ========== 响应式 ==========
@media (max-width: 1100px) {
    .consultation-container {
        flex-direction: column;
        height: auto;
        overflow: visible;
        overflow-x: clip;

        .sidebar {
            width: 100%;
            overflow: visible;
        }
        .chat-main {
            min-height: 72vh;
        }
    }
}
</style>
