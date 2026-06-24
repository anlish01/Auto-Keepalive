// HTML 前端模板 (Vue 3 + Tailwind CSS 包含通道编辑)
const UI_HTML = `
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>站点保活管理系统 - 专业版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        :root[data-theme="dark"] { background-color: #1a202c; color: #cbd5e0; }
        :root[data-theme="dark"] .bg-white { background-color: #2d3748; }
        :root[data-theme="dark"] .bg-gray-50 { background-color: #2a3441; }
        :root[data-theme="dark"] .text-gray-800 { color: #f7fafc; }
        :root[data-theme="dark"] .text-gray-500 { color: #a0aec0; }
        :root[data-theme="dark"] .border-gray-200, :root[data-theme="dark"] .border-gray-100 { border-color: #4a5568; }
        :root[data-theme="dark"] input, :root[data-theme="dark"] select, :root[data-theme="dark"] textarea { background-color: #4a5568; color: white; border-color: #718096; }
        :root[data-theme="dark"] th { background-color: #4a5568; color: #e2e8f0; }
    </style>
</head>
<body class="transition-colors duration-200 min-h-screen p-6">
    <div id="app" class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
                🌐 自动保活系统面板
            </h1>
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500" v-if="hasUnsavedChanges">⚠️ 有未保存的更改</span>
                <button @click="saveConfig" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition font-bold text-sm">
                    💾 保存配置到服务器
                </button>
                <button @click="toggleTheme" class="p-2 rounded bg-gray-200 dark:bg-gray-700 text-sm">
                    {{ isDark ? '🌞 浅色模式' : '🌙 深色模式' }}
                </button>
            </div>
        </div>

        <div class="flex border-b border-gray-200 mb-6">
            <button @click="currentTab = 'dashboard'" :class="currentTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'" class="py-3 px-6 transition">
                📊 概览仪表盘
            </button>
            <button @click="currentTab = 'tasks'" :class="currentTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'" class="py-3 px-6 transition">
                🔗 保活任务管理
            </button>
            <button @click="currentTab = 'channels'" :class="currentTab === 'channels' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'" class="py-3 px-6 transition">
                📢 通知渠道管理
            </button>
        </div>

        <div class="min-h-[500px]">
            
            <div v-if="currentTab === 'dashboard'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center">
                        <div class="text-gray-500 mb-2">总任务数</div>
                        <div class="text-4xl font-bold text-gray-800">{{ config.tasks.length }}</div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center">
                        <div class="text-gray-500 mb-2">正常运行</div>
                        <div class="text-4xl font-bold text-green-500">{{ config.tasks.filter(t => t.status === 'ok').length }}</div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center">
                        <div class="text-gray-500 mb-2">异常告警</div>
                        <div class="text-4xl font-bold text-red-500">{{ config.tasks.filter(t => t.status === 'down').length }}</div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                        <h2 class="text-lg font-semibold">任务运行清单</h2>
                        <button @click="loadConfig" class="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded transition">
                            🔄 刷新最新状态
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="p-4 font-semibold text-sm w-1/4">任务名称</th>
                                    <th class="p-4 font-semibold text-sm w-1/3">目标地址</th>
                                    <th class="p-4 font-semibold text-sm w-1/6">当前状态</th>
                                    <th class="p-4 font-semibold text-sm">最近访问时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(task, idx) in config.tasks" :key="idx" class="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td class="p-4 font-medium">{{ task.name }}</td>
                                    <td class="p-4"><a :href="task.url" target="_blank" class="text-blue-500 hover:underline text-sm break-all">{{ task.url }}</a></td>
                                    <td class="p-4">
                                        <span v-if="task.status === 'ok'" class="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs">✅ 正常访问</span>
                                        <span v-else-if="task.status === 'down'" class="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs">🚨 访问异常</span>
                                        <span v-else class="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs">⏳ 等待检测</span>
                                    </td>
                                    <td class="p-4 text-sm text-gray-500">{{ formatTime(task.lastCheck) }}</td>
                                </tr>
                                <tr v-if="config.tasks.length === 0">
                                    <td colspan="4" class="p-8 text-center text-gray-500">暂无保活任务，请切换到“保活任务管理”标签页进行添加。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div v-if="currentTab === 'tasks'" class="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-4xl mx-auto">
                <h2 class="text-xl font-semibold mb-4">🔗 保活任务配置</h2>
                
                <div class="mb-6 p-4 bg-gray-50 rounded border border-gray-200 transition-colors" :class="{'bg-blue-50 dark:bg-blue-900': editingTaskIndex !== null}">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg text-blue-600">{{ editingTaskIndex !== null ? '✏️ 编辑任务' : '➕ 添加新任务' }}</h3>
                        <button v-if="editingTaskIndex !== null" @click="cancelEditTask" class="text-sm text-gray-500 hover:text-gray-700 underline">取消编辑</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input v-model="newTask.name" placeholder="任务名称 (如: 我的博客)" class="w-full p-2 border rounded">
                        <input v-model.number="newTask.interval" type="number" placeholder="访问间隔 (分钟)" class="w-full p-2 border rounded">
                        <input v-model="newTask.url" placeholder="完整 URL 地址 (http(s)://...)" class="w-full p-2 border rounded md:col-span-2">
                    </div>
                    
                    <div class="mb-3 text-sm font-semibold">分配通知渠道 (可多选):</div>
                    <div class="max-h-32 overflow-y-auto border p-3 rounded mb-4 bg-white dark:bg-gray-800">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                <input type="checkbox" :value="ch.name" v-model="newTask.notifyChannels">
                                <span class="text-sm truncate">{{ ch.name }}</span>
                            </label>
                        </div>
                        <div v-if="config.channels.length === 0" class="text-gray-400 text-xs">尚未配置通知渠道，请先前往“渠道管理”添加。</div>
                    </div>

                    <button @click="saveTask" class="w-full text-white p-2 rounded transition font-bold" :class="editingTaskIndex !== null ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'">
                        {{ editingTaskIndex !== null ? '保存修改' : '确认添加任务' }}
                    </button>
                </div>

                <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                    <h3 class="font-bold mb-2">📋 已有任务列表</h3>
                    <div v-for="(task, idx) in config.tasks" :key="idx" class="p-4 border rounded flex justify-between items-center hover:shadow-md transition" :class="{'border-blue-400 bg-blue-50 dark:bg-blue-900': editingTaskIndex === idx}">
                        <div>
                            <div class="font-bold text-lg">{{ task.name }} <span class="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-600 ml-2">{{ task.interval }} 分钟/次</span></div>
                            <div class="text-sm text-gray-500 mt-1">{{ task.url }}</div>
                            <div class="text-xs mt-2 text-blue-600">推送至: {{ task.notifyChannels.join(', ') || '不发送通知' }}</div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="editTask(idx)" class="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded transition border border-transparent hover:border-blue-200 text-sm">编辑</button>
                            <button @click="removeTask(idx)" class="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition border border-transparent hover:border-red-200 text-sm">删除</button>
                        </div>
                    </div>
                    <div v-if="config.tasks.length === 0" class="text-center text-gray-500 py-4">列表为空</div>
                </div>
            </div>

            <div v-if="currentTab === 'channels'" class="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-4xl mx-auto">
                <h2 class="text-xl font-semibold mb-4">📢 消息推送渠道配置</h2>
                
                <div class="mb-6 p-4 bg-gray-50 rounded border border-gray-200 transition-colors" :class="{'bg-purple-50 dark:bg-purple-900': editingChannelIndex !== null}">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg text-purple-600">{{ editingChannelIndex !== null ? '✏️ 编辑渠道' : '➕ 添加新渠道' }}</h3>
                        <button v-if="editingChannelIndex !== null" @click="cancelEditChannel" class="text-sm text-gray-500 hover:text-gray-700 underline">取消编辑</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select v-model="newChannel.type" class="w-full p-2 border rounded">
                            <option value="telegram">Telegram</option>
                            <option value="pushplus">PushPlus</option>
                            <option value="notifyx">NotifyX (码达)</option>
                            <option value="dingtalk">钉钉 (DingTalk)</option>
                            <option value="lark">飞书 (Lark)</option>
                            <option value="resend">Resend (Email)</option>
                            <option value="gotify">Gotify</option>
                            <option value="ntfy">Ntfy</option>
                            <option value="webhook">自定义 Webhook</option>
                        </select>
                        <input v-model="newChannel.name" placeholder="设置一个渠道别名 (如: 运维群)" class="w-full p-2 border rounded">
                    </div>
                    
                    <div class="space-y-3 mb-4">
                        <template v-if="newChannel.type === 'telegram'">
                            <input v-model="newChannel.token" placeholder="Bot Token" class="w-full p-2 border rounded">
                            <input v-model="newChannel.chatId" placeholder="Chat ID" class="w-full p-2 border rounded">
                        </template>
                        
                        <template v-if="['pushplus'].includes(newChannel.type)">
                            <input v-model="newChannel.token" placeholder="PushPlus Token" class="w-full p-2 border rounded">
                        </template>

                        <template v-if="['notifyx'].includes(newChannel.type)">
                            <input v-model="newChannel.token" placeholder="API 密钥 (Key)" class="w-full p-2 border rounded font-mono text-sm">
                            <div class="text-xs text-gray-500 mt-1">💡 接口已内置为 POST https://www.notifyx.cn/api/v1/send/:key，仅需填写 Key。</div>
                        </template>

                        <template v-if="['dingtalk', 'lark'].includes(newChannel.type)">
                            <input v-model="newChannel.url" placeholder="完整 Webhook URL 地址" class="w-full p-2 border rounded">
                            <input v-model="newChannel.secret" placeholder="加签密钥 (选填，留空则不校验签名)" class="w-full p-2 border rounded">
                        </template>

                        <template v-if="newChannel.type === 'webhook'">
                            <input v-model="newChannel.url" placeholder="完整 Webhook URL 地址" class="w-full p-2 border rounded">
                            <textarea v-model="newChannel.headers" placeholder='自定义请求头 (JSON格式，选填)\n例如: {"Authorization": "Bearer token123"}' class="w-full p-2 border rounded text-sm font-mono" rows="3"></textarea>
                        </template>

                        <template v-if="newChannel.type === 'resend'">
                            <input v-model="newChannel.token" placeholder="Resend API Key" class="w-full p-2 border rounded">
                            <input v-model="newChannel.fromEmail" placeholder="发件邮箱 (From)" class="w-full p-2 border rounded">
                            <input v-model="newChannel.toEmail" placeholder="收件邮箱 (To)" class="w-full p-2 border rounded">
                        </template>

                        <template v-if="newChannel.type === 'gotify'">
                            <input v-model="newChannel.url" placeholder="Server URL (不带结尾/)" class="w-full p-2 border rounded">
                            <input v-model="newChannel.token" placeholder="App Token" class="w-full p-2 border rounded">
                        </template>

                        <template v-if="newChannel.type === 'ntfy'">
                            <input v-model="newChannel.url" placeholder="Server URL (默认 https://ntfy.sh)" class="w-full p-2 border rounded">
                            <input v-model="newChannel.topic" placeholder="订阅主题 (Topic)" class="w-full p-2 border rounded">
                        </template>
                    </div>

                    <div class="flex gap-4 mt-2">
                        <button @click="testChannel" class="w-1/3 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition font-bold flex justify-center items-center gap-2">
                            <span>🔔</span> 测试发送
                        </button>
                        <button @click="saveChannel" class="w-2/3 text-white p-2 rounded transition font-bold" :class="editingChannelIndex !== null ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'">
                            {{ editingChannelIndex !== null ? '保存渠道修改' : '确认添加渠道' }}
                        </button>
                    </div>
                </div>

                <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                    <h3 class="font-bold mb-2">📋 已配置渠道列表</h3>
                    <div v-for="(ch, idx) in config.channels" :key="idx" class="p-4 border rounded flex justify-between items-center hover:shadow-md transition" :class="{'border-purple-400 bg-purple-50 dark:bg-purple-900': editingChannelIndex === idx}">
                        <div>
                            <div class="font-bold text-lg flex items-center gap-2">
                                {{ ch.name }} 
                                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{{ ch.type }}</span>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" v-if="ch.secret">🔐 签名保护开启</span>
                                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" v-if="ch.headers">🛠️ 自定义Headers</span>
                                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" v-if="ch.type === 'notifyx'">🔑 已配置密钥</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="editChannel(idx)" class="text-purple-600 hover:bg-purple-50 px-3 py-1 rounded transition border border-transparent hover:border-purple-200 text-sm">编辑</button>
                            <button @click="removeChannel(idx)" class="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition border border-transparent hover:border-red-200 text-sm">删除</button>
                        </div>
                    </div>
                    <div v-if="config.channels.length === 0" class="text-center text-gray-500 py-4">列表为空</div>
                </div>
            </div>

        </div>
    </div>

    <script>
        const { createApp, ref, onMounted, watch } = Vue;

        createApp({
            setup() {
                const isDark = ref(false);
                const currentTab = ref('dashboard');
                const hasUnsavedChanges = ref(false);
                const config = ref({ tasks: [], channels: [] });
                
                const defaultChannel = () => ({ type: 'telegram', name: '', token: '', url: '', chatId: '', fromEmail: '', toEmail: '', topic: '', secret: '', headers: '' });
                const newChannel = ref(defaultChannel());
                const editingChannelIndex = ref(null);
                
                const editingTaskIndex = ref(null);
                const newTask = ref({ name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 });

                watch(() => config.value, () => {
                    hasUnsavedChanges.value = true;
                }, { deep: true });

                const toggleTheme = () => {
                    isDark.value = !isDark.value;
                    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
                    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
                };

                const formatTime = (ts) => {
                    if (!ts) return '尚未执行检测';
                    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
                };

                const loadConfig = async () => {
                    try {
                        const res = await fetch('/api/config');
                        if (res.ok) {
                            const data = await res.json();
                            if (data.tasks) {
                                config.value = data;
                                setTimeout(() => hasUnsavedChanges.value = false, 100);
                            }
                        }
                    } catch (e) { console.error('加载配置失败'); }
                };

                const saveConfig = async () => {
                    try {
                        const res = await fetch('/api/config', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config.value)
                        });
                        if (res.ok) {
                            hasUnsavedChanges.value = false;
                            alert('✅ 配置已成功保存到 Cloudflare KV！');
                        } else alert('保存失败');
                    } catch (e) { alert('保存失败'); }
                };

                // ===== 测试发送逻辑 =====
                const testChannel = async () => {
                    if (!newChannel.value.type) return alert('请选择渠道类型');
                    if (['telegram', 'pushplus', 'notifyx', 'resend', 'gotify'].includes(newChannel.value.type) && !newChannel.value.token) {
                        return alert('请填写 Token 或 API密钥');
                    }
                    if (newChannel.value.type === 'ntfy' && !newChannel.value.url) newChannel.value.url = 'https://ntfy.sh';
                    
                    try {
                        const res = await fetch('/api/test-channel', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newChannel.value)
                        });
                        const data = await res.json();
                        if (data.status === 'ok') {
                            alert('✅ 测试请求发送成功！请前往接收端查看是否收到通知。');
                        } else {
                            alert('❌ 测试发送失败:\\n' + (data.message || '未知错误'));
                        }
                    } catch (e) {
                        alert('❌ 请求发生网络错误:\\n' + e.message);
                    }
                };

                // ===== 渠道操作 (新增与修改) =====
                const saveChannel = () => {
                    if (!newChannel.value.name) return alert('请输入渠道名称/别名');
                    if (newChannel.value.type === 'ntfy' && !newChannel.value.url) newChannel.value.url = 'https://ntfy.sh';
                    if (newChannel.value.type === 'webhook' && newChannel.value.headers) {
                        try { JSON.parse(newChannel.value.headers); } 
                        catch(e) { return alert('自定义请求头 JSON 格式错误，请检查！'); }
                    }

                    if (editingChannelIndex.value !== null) {
                        const oldChannelName = config.value.channels[editingChannelIndex.value].name;
                        const newChannelName = newChannel.value.name;

                        config.value.channels[editingChannelIndex.value] = { ...newChannel.value };

                        if (oldChannelName !== newChannelName) {
                            config.value.tasks.forEach(task => {
                                const indexInTask = task.notifyChannels.indexOf(oldChannelName);
                                if (indexInTask !== -1) {
                                    task.notifyChannels.splice(indexInTask, 1, newChannelName);
                                }
                            });
                        }
                        editingChannelIndex.value = null;
                    } else {
                        config.value.channels.push({ ...newChannel.value });
                    }
                    newChannel.value = defaultChannel();
                };

                const editChannel = (idx) => {
                    editingChannelIndex.value = idx;
                    newChannel.value = JSON.parse(JSON.stringify(config.value.channels[idx]));
                };

                const cancelEditChannel = () => {
                    editingChannelIndex.value = null;
                    newChannel.value = defaultChannel();
                };

                const removeChannel = (idx) => {
                    if (editingChannelIndex.value === idx) cancelEditChannel();
                    
                    const channelName = config.value.channels[idx].name;
                    config.value.tasks.forEach(task => {
                        const indexInTask = task.notifyChannels.indexOf(channelName);
                        if (indexInTask !== -1) task.notifyChannels.splice(indexInTask, 1);
                    });
                    
                    config.value.channels.splice(idx, 1);
                };

                // ===== 任务操作 =====
                const saveTask = () => {
                    if (!newTask.value.name || !newTask.value.url) return alert('请完整填写任务信息');
                    if (editingTaskIndex.value !== null) {
                        const oldTask = config.value.tasks[editingTaskIndex.value];
                        config.value.tasks[editingTaskIndex.value] = {
                            ...newTask.value,
                            status: oldTask.status,
                            lastCheck: oldTask.lastCheck
                        };
                        editingTaskIndex.value = null;
                    } else {
                        config.value.tasks.push({ ...newTask.value });
                    }
                    newTask.value = { name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 };
                };

                const editTask = (idx) => {
                    editingTaskIndex.value = idx;
                    newTask.value = JSON.parse(JSON.stringify(config.value.tasks[idx]));
                    if (!newTask.value.notifyChannels) newTask.value.notifyChannels = [];
                };

                const cancelEditTask = () => {
                    editingTaskIndex.value = null;
                    newTask.value = { name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 };
                };

                const removeTask = (idx) => {
                    if (editingTaskIndex.value === idx) cancelEditTask(); 
                    config.value.tasks.splice(idx, 1);
                };

                onMounted(() => {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark') toggleTheme();
                    loadConfig();
                });

                return { 
                    isDark, currentTab, hasUnsavedChanges, toggleTheme, formatTime, 
                    config, testChannel,
                    newChannel, editingChannelIndex, saveChannel, editChannel, cancelEditChannel, removeChannel,
                    newTask, editingTaskIndex, saveTask, editTask, cancelEditTask, removeTask, 
                    saveConfig, loadConfig 
                };
            }
        }).mount('#app');
    </script>
</body>
</html>
`;

// --- Web Crypto API 签名辅助函数 ---

async function generateDingTalkSignature(secret, timestamp) {
    const signStr = timestamp + '\n' + secret;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signStr));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function generateLarkSignature(secret, timestamp) {
    const signStr = timestamp + '\n' + secret;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(signStr), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new Uint8Array(0));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// --- Worker 后端逻辑 ---

export default {
    async fetch(request, env, ctx) {
        const authHeader = request.headers.get('Authorization');
        const expectedAuth = `Basic ${btoa(`${env.ADMIN_USER}:${env.ADMIN_PASS}`)}`;
        
        if (!authHeader || authHeader !== expectedAuth) {
            return new Response('Unauthorized', {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic realm="Keepalive System Panel"' }
            });
        }

        const url = new URL(request.url);

        // API 路由: 渠道测试
        if (url.pathname === '/api/test-channel' && request.method === 'POST') {
            const ch = await request.json();
            const testTime = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
            const results = await sendNotifications([ch], "🔧 渠道配置测试", `这是一条测试消息，如果您能看到它，说明该通知渠道已配置成功！\n\n【测试时间】${testTime}`);
            
            const firstResult = results[0];
            if (firstResult && firstResult.status === 'fulfilled') {
                return new Response(JSON.stringify({status: "ok"}), { headers: { 'Content-Type': 'application/json' } });
            } else {
                const errMsg = firstResult ? firstResult.reason.message : "未执行发送";
                return new Response(JSON.stringify({status: "error", message: errMsg}), { headers: { 'Content-Type': 'application/json' } });
            }
        }

        if (url.pathname === '/api/config') {
            if (request.method === 'GET') {
                const data = await env.DB.get('SYSTEM_CONFIG', 'json') || { tasks: [], channels: [] };
                return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
            }
            if (request.method === 'POST') {
                const body = await request.json();
                await env.DB.put('SYSTEM_CONFIG', JSON.stringify(body));
                return new Response('{"status":"ok"}', { headers: { 'Content-Type': 'application/json' } });
            }
        }

        return new Response(UI_HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    },

    async scheduled(event, env, ctx) {
        const config = await env.DB.get('SYSTEM_CONFIG', 'json');
        if (!config || !config.tasks || config.tasks.length === 0) return;

        const now = Date.now();
        let needsSave = false;

        for (let task of config.tasks) {
            const intervalMs = (task.interval || 5) * 60 * 1000;
            
            if (now - (task.lastCheck || 0) >= intervalMs) {
                task.lastCheck = now;
                needsSave = true;

                let isSuccess = false;
                let errMsg = "";

                try {
                    const res = await fetch(task.url, { 
                        method: 'GET',
                        headers: { 'User-Agent': 'Cloudflare-Worker-KeepAlive/10.0' },
                        cf: { cacheTtl: 0 } 
                    });
                    isSuccess = res.ok;
                    if (!isSuccess) errMsg = `HTTP 状态异常: ${res.status} ${res.statusText}`;
                } catch (e) {
                    isSuccess = false;
                    errMsg = `网络或解析错误: ${e.message}`;
                }

                const linkedChannels = config.channels.filter(c => task.notifyChannels.includes(c.name));
                const timeStr = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});

                if (!isSuccess) {
                    task.status = 'down';
                    const msg = `【任务名称】${task.name}\n【监控网址】${task.url}\n【发生时间】${timeStr}\n【异常详情】${errMsg}`;
                    await sendNotifications(linkedChannels, "🚨 站点保活失败", msg);
                } else {
                    if (task.status === 'down') {
                        const msg = `【任务名称】${task.name}\n【监控网址】${task.url}\n【发生时间】${timeStr}\n【当前状态】已恢复正常访问`;
                        await sendNotifications(linkedChannels, "✅ 站点恢复正常", msg);
                    }
                    task.status = 'ok';
                }
            }
        }

        if (needsSave) {
            await env.DB.put('SYSTEM_CONFIG', JSON.stringify(config));
        }
    }
};

// 通知推送辅助函数 (深度错误冒泡重构版)
async function sendNotifications(channels, title, message) {
    const promises = channels.map(async (ch) => {
        const combinedText = `${title}\n\n${message}`;
        let res;
        
        switch (ch.type) {
            case 'telegram':
                res = await fetch(`https://api.telegram.org/bot${ch.token}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: ch.chatId, text: combinedText })
                });
                break;
                
            case 'pushplus':
                res = await fetch('https://www.pushplus.plus/send', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: ch.token, title: title, content: message, template: 'txt' })
                });
                break;

            case 'notifyx':
                // 【精准适配】严格遵照截图中的官方 API 文档
                const notifyxApiUrl = `https://www.notifyx.cn/api/v1/send/${ch.token}`;
                res = await fetch(notifyxApiUrl, {
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        title: title, 
                        content: message
                    })
                });
                break;
                
            case 'dingtalk':
                let dingUrl = ch.url;
                if (ch.secret) {
                    const timestamp = Date.now().toString();
                    const sign = await generateDingTalkSignature(ch.secret, timestamp);
                    dingUrl += (dingUrl.includes('?') ? '&' : '?') + `timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
                }
                res = await fetch(dingUrl, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ msgtype: 'text', text: { content: combinedText } })
                });
                break;
                
            case 'lark':
                let larkBody = { msg_type: 'text', content: { text: combinedText } };
                if (ch.secret) {
                    const timestamp = Math.floor(Date.now() / 1000).toString();
                    const sign = await generateLarkSignature(ch.secret, timestamp);
                    larkBody.timestamp = timestamp;
                    larkBody.sign = sign;
                }
                res = await fetch(ch.url, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(larkBody)
                });
                break;
                
            case 'webhook':
                const genericPayload = {
                    text: combinedText,
                    content: combinedText,
                    msg_type: "text",
                    title: title,
                    message: message,
                    desp: message
                };
                
                let customHeaders = { 'Content-Type': 'application/json' };
                if (ch.headers) {
                    try {
                        const parsedHeaders = JSON.parse(ch.headers);
                        customHeaders = { ...customHeaders, ...parsedHeaders };
                    } catch (e) { /* Ignore header parse errors silently here */ }
                }
                
                res = await fetch(ch.url, {
                    method: 'POST', headers: customHeaders,
                    body: JSON.stringify(genericPayload)
                });
                break;
                
            case 'resend':
                res = await fetch('https://api.resend.com/emails', {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ch.token}` },
                    body: JSON.stringify({ from: ch.fromEmail, to: ch.toEmail, subject: title, text: message })
                });
                break;
                
            case 'gotify':
                const gotifyUrl = ch.url.endsWith('/') ? ch.url.slice(0, -1) : ch.url;
                res = await fetch(`${gotifyUrl}/message?token=${ch.token}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title, message: message, priority: 5 })
                });
                break;
                
            case 'ntfy':
                const ntfyUrl = ch.url.endsWith('/') ? ch.url.slice(0, -1) : ch.url;
                res = await fetch(`${ntfyUrl}/${ch.topic}`, {
                    method: 'POST',
                    headers: { 'Title': encodeURIComponent(title) },
                    body: message
                });
                break;
        }

        // --- 错误向上冒泡拦截 (供测试端抓取) ---
        if (res && !res.ok) {
            const errText = await res.text().catch(() => 'No Error Body');
            throw new Error(`HTTP ${res.status}: ${errText.substring(0, 150)}`);
        }
        
        return true;
    });

    // 批量等待并允许静默吞掉定时器里的失败，但在单独测试时可以抽出错误
    return await Promise.allSettled(promises);
}
