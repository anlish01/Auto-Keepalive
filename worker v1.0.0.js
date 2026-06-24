// HTML 前端模板 (Vue 3 + Tailwind CSS 弹窗与日志完全体版)
const UI_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>站点保活管理系统 - 专业版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script>
        // 【关键修复】强制 Tailwind 仅通过 class 识别深色模式，杜绝部分浏览器越权判定
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
    <style>
        /* 滚动条与基础控件美化 */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.7); }
        input[type="checkbox"] { accent-color: #3b82f6; }
    </style>
</head>
<body class="transition-colors duration-300 min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 p-6 font-sans">
    <div id="app" class="max-w-6xl mx-auto">
        
        <!-- 头部导航与操作区 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700/80">
            <div>
                <h1 class="text-2xl font-extrabold flex items-center gap-2.5 text-gray-900 dark:text-white">
                    <span>🌐</span> Auto-Keepalive <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-normal">Pro v1.0.0</span>
                </h1>
                <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">Cloudflare Serverless 多站点脉搏监控与多渠道推送中枢</p>
            </div>
            
            <div class="flex items-center gap-3 w-full md:w-auto justify-end">
                <span class="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium animate-pulse" v-if="hasUnsavedChanges">⚠️ 更改待保存</span>
                
                <button @click="saveConfig" class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-sm transition font-bold text-xs flex items-center gap-1.5">
                    <span>💾</span> 保存配置至服务器
                </button>
                
                <!-- 优化后的高颜值药丸形深浅模式开关 -->
                <button @click="toggleTheme" 
                        class="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm select-none"
                        :class="isDark ? 'bg-slate-950 text-amber-300 border-slate-700 hover:bg-slate-800' : 'bg-gray-50 text-slate-700 border-gray-200 hover:bg-gray-200'">
                    <span class="text-sm">{{ isDark ? '🌙' : '☀️' }}</span>
                    <span class="hidden sm:inline">{{ isDark ? '深色模式' : '浅色模式' }}</span>
                </button>
            </div>
        </div>

        <!-- 导航标签栏 -->
        <div class="flex border-b border-gray-200 dark:border-slate-700 mb-6 gap-2 overflow-x-auto pb-1">
            <button @click="currentTab = 'dashboard'" :class="currentTab === 'dashboard' ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                📊 运行概览
            </button>
            <button @click="currentTab = 'tasks'" :class="currentTab === 'tasks' ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                🔗 保活任务管理 ({{ config.tasks.length }})
            </button>
            <button @click="currentTab = 'channels'" :class="currentTab === 'channels' ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap">
                📢 通知渠道管理 ({{ config.channels.length }})
            </button>
            <button @click="currentTab = 'logs'" :class="currentTab === 'logs' ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'" class="py-2.5 px-5 rounded-t-xl transition text-sm whitespace-nowrap flex items-center gap-1.5">
                <span>📜</span> 运行日志
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300">{{ logs.length }}</span>
            </button>
        </div>

        <!-- 标签页主体区 -->
        <div class="min-h-[500px]">
            
            <!-- 1. 运行概览 -->
            <div v-if="currentTab === 'dashboard'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                        <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">总保活任务数</div>
                        <div class="text-4xl font-black text-gray-800 dark:text-white">{{ config.tasks.length }}</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                        <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">当前状态正常</div>
                        <div class="text-4xl font-black text-green-500 dark:text-green-400">{{ config.tasks.filter(t => t.status === 'ok').length }}</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center">
                        <div class="text-xs text-gray-400 dark:text-slate-400 mb-1 font-medium">当前状态异常</div>
                        <div class="text-4xl font-black text-red-500 dark:text-red-400">{{ config.tasks.filter(t => t.status === 'down').length }}</div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                        <h2 class="text-sm font-bold text-gray-800 dark:text-slate-200">实时任务脉搏清单</h2>
                        <button @click="loadConfig" class="text-xs bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-slate-600 transition flex items-center gap-1">
                            <span>🔄</span> 刷新状态
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-400 bg-gray-50/20 dark:bg-slate-900/20">
                                    <th class="p-4 font-semibold w-1/4">任务名称</th>
                                    <th class="p-4 font-semibold w-1/3">目标 URL</th>
                                    <th class="p-4 font-semibold w-1/6">当前状态</th>
                                    <th class="p-4 font-semibold">最近访问时间</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-slate-700/60">
                                <tr v-for="(task, idx) in config.tasks" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                                    <td class="p-4 font-bold text-gray-800 dark:text-slate-200">{{ task.name }}</td>
                                    <td class="p-4"><a :href="task.url" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline text-xs font-mono break-all">{{ task.url }}</a></td>
                                    <td class="p-4">
                                        <span v-if="task.status === 'ok'" class="px-2.5 py-1 bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/80 rounded-md text-xs font-medium">✅ 正常访问</span>
                                        <span v-else-if="task.status === 'down'" class="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/80 rounded-md text-xs font-medium">🚨 访问异常</span>
                                        <span v-else class="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-md text-xs font-medium">⏳ 等待轮询</span>
                                    </td>
                                    <td class="p-4 text-xs text-gray-400 dark:text-slate-400 font-mono">{{ formatTime(task.lastCheck) }}</td>
                                </tr>
                                <tr v-if="config.tasks.length === 0">
                                    <td colspan="4" class="p-12 text-center text-gray-400 dark:text-slate-500">暂无保活任务，请前往“保活任务管理”添加。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 2. 保活任务管理 -->
            <div v-if="currentTab === 'tasks'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                
                <!-- 新增任务专属表单区 -->
                <div class="p-5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                    <h3 class="font-extrabold text-sm text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                        <span>➕</span> 新增保活任务
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input v-model="newTask.name" placeholder="任务名称 (如: Koyeb节点1)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm">
                        <input v-model.number="newTask.interval" type="number" placeholder="轮询间隔 (分钟，如: 5)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm">
                        <input v-model="newTask.url" placeholder="完整 URL 地址 (http(s)://...)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm md:col-span-2 font-mono">
                    </div>
                    
                    <div class="mb-2 text-xs font-bold text-gray-500 dark:text-slate-400">分配通知渠道 (可多选):</div>
                    
                    <!-- 【浅色模式复选框容器变黑 Bug 彻底修复区】 -->
                    <div class="max-h-32 overflow-y-auto border border-gray-200 dark:border-slate-700 p-3 rounded-xl mb-4 bg-white dark:bg-slate-800">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition text-xs font-medium">
                                <input type="checkbox" :value="ch.name" v-model="newTask.notifyChannels" class="rounded border-gray-300">
                                <span class="truncate">{{ ch.name }}</span>
                            </label>
                        </div>
                        <div v-if="config.channels.length === 0" class="text-gray-400 dark:text-slate-500 text-xs py-2 text-center">尚未配置通知渠道，请先前往“渠道管理”添加。</div>
                    </div>

                    <button @click="addTask" class="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white p-3 rounded-xl transition font-bold text-sm shadow-sm">
                        确认添加新任务
                    </button>
                </div>

                <!-- 任务列表 -->
                <div class="space-y-3">
                    <h3 class="font-bold text-sm text-gray-700 dark:text-slate-300 px-1">📋 已配置任务列表</h3>
                    <div v-for="(task, idx) in config.tasks" :key="idx" class="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:shadow-md transition bg-white dark:bg-slate-800">
                        <div class="pr-4">
                            <div class="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                {{ task.name }} 
                                <span class="text-xs font-normal bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{{ task.interval }} 分钟/次</span>
                            </div>
                            <div class="text-xs text-gray-400 dark:text-slate-400 mt-1 font-mono truncate max-w-lg">{{ task.url }}</div>
                            <div class="text-xs mt-2 text-blue-600 dark:text-blue-400 font-medium">通知分发至: {{ task.notifyChannels.join(', ') || '静默不通知' }}</div>
                        </div>
                        <div class="flex gap-1.5 flex-shrink-0">
                            <!-- 触发弹窗编辑 -->
                            <button @click="openEditTaskModal(idx)" class="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">编辑</button>
                            <button @click="removeTask(idx)" class="text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">删除</button>
                        </div>
                    </div>
                    <div v-if="config.tasks.length === 0" class="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">任务列表为空</div>
                </div>
            </div>

            <!-- 3. 通知渠道管理 -->
            <div v-if="currentTab === 'channels'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto space-y-6">
                
                <!-- 新增渠道专属表单区 -->
                <div class="p-5 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700">
                    <h3 class="font-extrabold text-sm text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                        <span>➕</span> 新增推送渠道
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select v-model="newChannel.type" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm font-medium">
                            <option value="telegram">Telegram 机器人</option>
                            <option value="pushplus">PushPlus 推送加</option>
                            <option value="notifyx">NotifyX 码达推送 (官方内置)</option>
                            <option value="dingtalk">钉钉 (DingTalk)</option>
                            <option value="lark">飞书 (Lark)</option>
                            <option value="resend">Resend 邮件推送</option>
                            <option value="gotify">Gotify</option>
                            <option value="ntfy">Ntfy</option>
                            <option value="webhook">自定义通用 Webhook</option>
                        </select>
                        <input v-model="newChannel.name" placeholder="设置一个渠道别名 (如: 主力TG群)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-sm">
                    </div>
                    
                    <div class="space-y-3 mb-4">
                        <template v-if="newChannel.type === 'telegram'">
                            <input v-model="newChannel.token" placeholder="Bot Token (如: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.chatId" placeholder="Chat ID (如: -100123456789)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>
                        
                        <template v-if="newChannel.type === 'pushplus'">
                            <input v-model="newChannel.token" placeholder="PushPlus Token" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>

                        <template v-if="newChannel.type === 'notifyx'">
                            <input v-model="newChannel.token" placeholder="API 密钥 (Key)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <div class="text-xs text-gray-400 dark:text-slate-500 px-1">💡 已内置网关：POST https://www.notifyx.cn/api/v1/send/:key，仅需填入 Key。</div>
                        </template>

                        <template v-if="['dingtalk', 'lark'].includes(newChannel.type)">
                            <input v-model="newChannel.url" placeholder="完整 Webhook URL 地址" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.secret" placeholder="加签密钥 Secret (选填，留空则不校验签名)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>

                        <template v-if="newChannel.type === 'webhook'">
                            <input v-model="newChannel.url" placeholder="完整 Webhook URL 地址" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <textarea v-model="newChannel.headers" placeholder='自定义 Headers (JSON格式，选填)\n例如: {"Authorization": "Bearer token123"}' class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono" rows="2"></textarea>
                        </template>

                        <template v-if="newChannel.type === 'resend'">
                            <input v-model="newChannel.token" placeholder="Resend API Key" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.fromEmail" placeholder="发件邮箱 (From)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.toEmail" placeholder="收件邮箱 (To)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>

                        <template v-if="newChannel.type === 'gotify'">
                            <input v-model="newChannel.url" placeholder="Server URL (不带结尾/)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.token" placeholder="App Token" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>

                        <template v-if="newChannel.type === 'ntfy'">
                            <input v-model="newChannel.url" placeholder="Server URL (默认 https://ntfy.sh)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                            <input v-model="newChannel.topic" placeholder="订阅主题 (Topic)" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 text-xs font-mono">
                        </template>
                    </div>

                    <div class="flex gap-3 mt-2">
                        <button @click="testChannel" class="w-1/3 bg-slate-700 hover:bg-slate-800 text-white p-3 rounded-xl transition font-bold text-xs shadow-sm flex justify-center items-center gap-1.5">
                            <span>🔔</span> 测试发送
                        </button>
                        <button @click="addChannel" class="w-2/3 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition font-bold text-sm shadow-sm">
                            确认添加渠道
                        </button>
                    </div>
                </div>

                <!-- 渠道列表 -->
                <div class="space-y-3">
                    <h3 class="font-bold text-sm text-gray-700 dark:text-slate-300 px-1">📋 已配置渠道列表</h3>
                    <div v-for="(ch, idx) in config.channels" :key="idx" class="p-4 border border-gray-200 dark:border-slate-700 rounded-2xl flex justify-between items-center hover:shadow-md transition bg-white dark:bg-slate-800">
                        <div>
                            <div class="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2.5">
                                {{ ch.name }} 
                                <span class="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md uppercase font-bold">{{ ch.type }}</span>
                            </div>
                            <div class="flex gap-2 mt-2 font-mono">
                                <span class="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded" v-if="ch.secret">🔐 签名校验开</span>
                                <span class="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded" v-if="ch.headers">🛠️ 自定义Headers</span>
                                <span class="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded" v-if="ch.type === 'notifyx'">🔑 Key 已设</span>
                            </div>
                        </div>
                        <div class="flex gap-1.5">
                            <!-- 触发弹窗编辑 -->
                            <button @click="openEditChannelModal(idx)" class="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">编辑</button>
                            <button @click="removeChannel(idx)" class="text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-gray-200 dark:border-slate-700">删除</button>
                        </div>
                    </div>
                    <div v-if="config.channels.length === 0" class="text-center text-gray-400 dark:text-slate-500 py-8 text-sm">渠道列表为空</div>
                </div>
            </div>

            <!-- 4. 运行日志系统 (新增特性) -->
            <div v-if="currentTab === 'logs'" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 max-w-5xl mx-auto space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-700 pb-4 gap-2">
                    <div>
                        <h2 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>📜</span> 后台轮询监控结果日志
                        </h2>
                        <p class="text-xs text-gray-400 dark:text-slate-400 mt-0.5">自动截取并保留最近 100 次定时脉搏探测的原始记录</p>
                    </div>
                    <div class="flex gap-2 self-end sm:self-auto">
                        <button @click="clearLogs" class="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-red-200 dark:border-slate-600 transition font-medium">🗑️ 清空日志</button>
                        <button @click="fetchLogs" class="text-xs bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-600 transition font-bold flex items-center gap-1">🔄 刷新数据</button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 bg-gray-50/40 dark:bg-slate-900/40">
                                <th class="p-3 w-40 font-semibold">探测时间</th>
                                <th class="p-3 w-48 font-semibold">任务名称</th>
                                <th class="p-3 w-28 font-semibold">探测结果</th>
                                <th class="p-3 font-semibold">返回详情 / HTTP 耗时</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-slate-700/60 font-sans">
                            <tr v-for="(item, idx) in logs" :key="idx" class="hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition">
                                <td class="p-3 text-gray-400 dark:text-slate-400 font-mono whitespace-nowrap">{{ formatLogTime(item.time) }}</td>
                                <td class="p-3 font-bold text-gray-800 dark:text-slate-200">{{ item.taskName }}</td>
                                <td class="p-3">
                                    <span v-if="item.status === 'ok'" class="px-2 py-0.5 bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 rounded text-xs font-semibold">正常 (OK)</span>
                                    <span v-else class="px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 rounded text-xs font-semibold">异常 (Down)</span>
                                </td>
                                <td class="p-3 text-gray-600 dark:text-slate-300 font-mono truncate max-w-md" :title="item.detail">{{ item.detail }}</td>
                            </tr>
                            <tr v-if="logs.length === 0">
                                <td colspan="4" class="p-12 text-center text-gray-400 dark:text-slate-500 font-sans text-sm">暂无轮询日志记录</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- ==================== 模态框弹窗区 (Modal) ==================== -->
        
        <!-- 1. 任务编辑弹窗 Modal -->
        <div v-if="showTaskModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 class="font-black text-base text-blue-600 dark:text-blue-400 flex items-center gap-2"><span>✏️</span> 编辑保活任务</h3>
                    <button @click="showTaskModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl font-bold">&times;</button>
                </div>
                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">任务名称</label>
                        <input v-model="editingTask.name" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm font-bold">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">目标 URL 地址</label>
                        <input v-model="editingTask.url" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">访问间隔 (分钟)</label>
                        <input v-model.number="editingTask.interval" type="number" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">勾选通知渠道 (可多选)</label>
                        <div class="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 max-h-32 overflow-y-auto">
                            <label v-for="(ch, idx) in config.channels" :key="idx" class="flex items-center space-x-2 cursor-pointer text-xs font-medium">
                                <input type="checkbox" :value="ch.name" v-model="editingTask.notifyChannels" class="rounded border-gray-300">
                                <span class="truncate">{{ ch.name }}</span>
                            </label>
                            <div v-if="config.channels.length === 0" class="text-xs text-gray-400 col-span-2">暂无可用渠道</div>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                    <button @click="showTaskModal = false" class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition">取消</button>
                    <button @click="confirmEditTask" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition">保存修改</button>
                </div>
            </div>
        </div>

        <!-- 2. 渠道编辑弹窗 Modal -->
        <div v-if="showChannelModal" class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 class="font-black text-base text-purple-600 dark:text-purple-400 flex items-center gap-2"><span>✏️</span> 编辑消息推送渠道</h3>
                    <button @click="showChannelModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl font-bold">&times;</button>
                </div>
                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">渠道类型</label>
                            <select v-model="editingChannel.type" disabled class="w-full p-3 border rounded-xl bg-gray-200 dark:bg-slate-900 dark:border-slate-700 text-xs font-bold opacity-70 cursor-not-allowed">
                                <option :value="editingChannel.type">{{ editingChannel.type.toUpperCase() }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">渠道名称/别名</label>
                            <input v-model="editingChannel.name" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 text-sm font-bold">
                        </div>
                    </div>
                    
                    <template v-if="editingChannel.type === 'telegram'">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">Bot Token</label>
                            <input v-model="editingChannel.token" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">Chat ID</label>
                            <input v-model="editingChannel.chatId" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                    </template>
                    
                    <template v-if="editingChannel.type === 'pushplus'">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">PushPlus Token</label>
                            <input v-model="editingChannel.token" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                    </template>

                    <template v-if="editingChannel.type === 'notifyx'">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">NotifyX API 密钥 (Key)</label>
                            <input v-model="editingChannel.token" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                    </template>

                    <template v-if="['dingtalk', 'lark'].includes(editingChannel.type)">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">Webhook URL</label>
                            <input v-model="editingChannel.url" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">加签密钥 Secret (选填)</label>
                            <input v-model="editingChannel.secret" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                    </template>

                    <template v-if="editingChannel.type === 'webhook'">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">Webhook URL</label>
                            <input v-model="editingChannel.url" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">自定义 Headers (JSON)</label>
                            <textarea v-model="editingChannel.headers" rows="2" class="w-full p-3 border rounded-xl bg-gray-50 dark:bg-slate-900 dark:border-slate-700 font-mono text-xs"></textarea>
                        </div>
                    </template>
                </div>
                <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <button @click="testEditingChannel" class="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow flex gap-1 items-center transition"><span>🔔</span> 测试此配置</button>
                    <div class="flex gap-2">
                        <button @click="showChannelModal = false" class="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition">取消</button>
                        <button @click="confirmEditChannel" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition">保存修改</button>
                    </div>
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
                const logs = ref([]); // 日志数据队列
                
                const defaultChannel = () => ({ type: 'telegram', name: '', token: '', url: '', chatId: '', fromEmail: '', toEmail: '', topic: '', secret: '', headers: '' });
                const newChannel = ref(defaultChannel());
                const newTask = ref({ name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 });

                // 模态框(Modal)独立状态
                const showTaskModal = ref(false);
                const editingTaskIndex = ref(null);
                const editingTask = ref({});

                const showChannelModal = ref(false);
                const editingChannelIndex = ref(null);
                const editingChannel = ref({});
                const oldChannelNameForCascade = ref('');

                watch(() => config.value, () => {
                    hasUnsavedChanges.value = true;
                }, { deep: true });

                const toggleTheme = () => {
                    isDark.value = !isDark.value;
                    if (isDark.value) {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                    }
                };

                const formatTime = (ts) => {
                    if (!ts) return '尚未探测';
                    return new Date(ts).toLocaleString('zh-CN', { hour12: false });
                };

                const formatLogTime = (ts) => {
                    return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                };

                const loadConfig = async () => {
                    try {
                        const res = await fetch('/api/config');
                        if (res.ok) {
                            const data = await res.json();
                            if (data.tasks) {
                                config.value = data;
                                setTimeout(() => hasUnsavedChanges.value = false, 50);
                            }
                        }
                    } catch (e) {}
                    fetchLogs();
                };

                const fetchLogs = async () => {
                    try {
                        const res = await fetch('/api/logs');
                        if (res.ok) logs.value = await res.json();
                    } catch(e){}
                };

                const clearLogs = async () => {
                    if(!confirm('确定要彻底清空后台轮询监控日志吗？')) return;
                    try {
                        await fetch('/api/logs', { method: 'DELETE' });
                        logs.value = [];
                    } catch(e){}
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
                            alert('✅ 配置已成功保存到 Cloudflare KV 数据库并生效！');
                        } else alert('保存失败');
                    } catch (e) { alert('保存失败'); }
                };

                // ===== 测试发送 API =====
                const executeTest = async (payload) => {
                    try {
                        const res = await fetch('/api/test-channel', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.status === 'ok') alert('✅ 测试消息发送成功！请前往接收端核实。');
                        else alert('❌ 测试发送失败:\\n' + (data.message || '未知错误'));
                    } catch (e) { alert('❌ 网络异常:\\n' + e.message); }
                };

                const testChannel = () => {
                    if (!newChannel.value.type) return alert('请选择渠道类型');
                    executeTest(newChannel.value);
                };

                const testEditingChannel = () => {
                    executeTest(editingChannel.value);
                };

                // ===== 渠道操作 =====
                const addChannel = () => {
                    if (!newChannel.value.name) return alert('请填写渠道别名');
                    config.value.channels.push({ ...newChannel.value });
                    newChannel.value = defaultChannel();
                };

                const openEditChannelModal = (idx) => {
                    editingChannelIndex.value = idx;
                    editingChannel.value = JSON.parse(JSON.stringify(config.value.channels[idx]));
                    oldChannelNameForCascade.value = editingChannel.value.name;
                    showChannelModal.value = true;
                };

                const confirmEditChannel = () => {
                    if (!editingChannel.value.name) return alert('渠道名称不能为空');
                    const newName = editingChannel.value.name;
                    const oldName = oldChannelNameForCascade.value;

                    config.value.channels[editingChannelIndex.value] = { ...editingChannel.value };

                    // 级联更新绑定的任务
                    if (oldName !== newName) {
                        config.value.tasks.forEach(t => {
                            const idx = t.notifyChannels.indexOf(oldName);
                            if (idx !== -1) t.notifyChannels.splice(idx, 1, newName);
                        });
                    }
                    showChannelModal.value = false;
                };

                const removeChannel = (idx) => {
                    const chName = config.value.channels[idx].name;
                    config.value.tasks.forEach(t => {
                        const i = t.notifyChannels.indexOf(chName);
                        if (i !== -1) t.notifyChannels.splice(i, 1);
                    });
                    config.value.channels.splice(idx, 1);
                };

                // ===== 任务操作 =====
                const addTask = () => {
                    if (!newTask.value.name || !newTask.value.url) return alert('请完整填写任务名和URL');
                    config.value.tasks.push({ ...newTask.value });
                    newTask.value = { name: '', url: '', interval: 5, notifyChannels: [], status: 'pending', lastCheck: 0 };
                };

                const openEditTaskModal = (idx) => {
                    editingTaskIndex.value = idx;
                    editingTask.value = JSON.parse(JSON.stringify(config.value.tasks[idx]));
                    if (!editingTask.value.notifyChannels) editingTask.value.notifyChannels = [];
                    showTaskModal.value = true;
                };

                const confirmEditTask = () => {
                    if (!editingTask.value.name || !editingTask.value.url) return alert('任务名和 URL 不能为空');
                    config.value.tasks[editingTaskIndex.value] = { ...editingTask.value };
                    showTaskModal.value = false;
                };

                const removeTask = (idx) => config.value.tasks.splice(idx, 1);

                onMounted(() => {
                    const savedTheme = localStorage.getItem('theme');
                    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        isDark.value = true;
                        document.documentElement.classList.add('dark');
                    }
                    loadConfig();
                });

                return { 
                    isDark, currentTab, hasUnsavedChanges, toggleTheme, formatTime, formatLogTime,
                    config, logs, loadConfig, fetchLogs, clearLogs, saveConfig,
                    newChannel, addChannel, removeChannel, testChannel,
                    showChannelModal, editingChannel, openEditChannelModal, confirmEditChannel, testEditingChannel,
                    newTask, addTask, removeTask,
                    showTaskModal, editingTask, openEditTaskModal, confirmEditTask
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

        // API 路由: 测试发送
        if (url.pathname === '/api/test-channel' && request.method === 'POST') {
            const ch = await request.json();
            const testTime = new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
            const results = await sendNotifications([ch], "🔧 渠道配置连通性测试", `这是一条测试脉搏消息，如果您收到它，说明该通知渠道已成功接通！\n\n【测试时间】${testTime}`);
            
            const first = results[0];
            if (first && first.status === 'fulfilled') {
                return new Response(JSON.stringify({status: "ok"}), { headers: { 'Content-Type': 'application/json' } });
            } else {
                return new Response(JSON.stringify({status: "error", message: first ? first.reason.message : "未执行发送"}), { headers: { 'Content-Type': 'application/json' } });
            }
        }

        // API 路由: 运行日志拉取与清空
        if (url.pathname === '/api/logs') {
            if (request.method === 'GET') {
                const logs = await env.DB.get('SYSTEM_LOGS', 'json') || [];
                return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } });
            }
            if (request.method === 'DELETE') {
                await env.DB.put('SYSTEM_LOGS', '[]');
                return new Response('{"status":"ok"}', { headers: { 'Content-Type': 'application/json' } });
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

    // 定时轮询核心
    async scheduled(event, env, ctx) {
        const config = await env.DB.get('SYSTEM_CONFIG', 'json');
        if (!config || !config.tasks || config.tasks.length === 0) return;

        let logsQueue = await env.DB.get('SYSTEM_LOGS', 'json') || [];
        const now = Date.now();
        let needsSaveConfig = false;
        let minuteLogs = [];

        for (let task of config.tasks) {
            const intervalMs = (task.interval || 5) * 60 * 1000;
            
            if (now - (task.lastCheck || 0) >= intervalMs) {
                task.lastCheck = now;
                needsSaveConfig = true;

                let isSuccess = false;
                let detailMsg = "";
                const startTs = Date.now();

                try {
                    const res = await fetch(task.url, { 
                        method: 'GET',
                        headers: { 'User-Agent': 'Cloudflare-KeepAlive-Pro/1.0.0' },
                        cf: { cacheTtl: 0 } 
                    });
                    isSuccess = res.ok;
                    const rtt = Date.now() - startTs;
                    detailMsg = isSuccess ? `HTTP ${res.status} (${rtt}ms)` : `HTTP 状态异常: ${res.status}`;
                } catch (e) {
                    isSuccess = false;
                    detailMsg = `网络或DNS异常: ${e.message}`;
                }

                // 压入单条检测日志
                minuteLogs.push({
                    time: now,
                    taskName: task.name,
                    status: isSuccess ? 'ok' : 'down',
                    detail: detailMsg
                });

                const linkedChannels = config.channels.filter(c => task.notifyChannels.includes(c.name));
                const timeStr = new Date(now).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});

                if (!isSuccess) {
                    task.status = 'down';
                    const msg = `【任务名称】${task.name}\n【监控网址】${task.url}\n【发生时间】${timeStr}\n【异常详情】${detailMsg}`;
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

        if (needsSaveConfig) {
            await env.DB.put('SYSTEM_CONFIG', JSON.stringify(config));
        }

        // 持久化追加运行日志 (精准保留前100条)
        if (minuteLogs.length > 0) {
            logsQueue = [...minuteLogs, ...logsQueue].slice(0, 100);
            await env.DB.put('SYSTEM_LOGS', JSON.stringify(logsQueue));
        }
    }
};

// 通知推送辅助函数 (支持报错回显冒泡)
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
                res = await fetch(`https://www.notifyx.cn/api/v1/send/${ch.token}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title, content: message })
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
                const genericPayload = { text: combinedText, content: combinedText, msg_type: "text", title: title, message: message, desp: message };
                let customHeaders = { 'Content-Type': 'application/json' };
                if (ch.headers) {
                    try { customHeaders = { ...customHeaders, ...JSON.parse(ch.headers) }; } catch (e) {}
                }
                res = await fetch(ch.url, { method: 'POST', headers: customHeaders, body: JSON.stringify(genericPayload) });
                break;
                
            case 'resend':
                res = await fetch('https://api.resend.com/emails', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ch.token}` },
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
                res = await fetch(`${ntfyUrl}/${ch.topic}`, { method: 'POST', headers: { 'Title': encodeURIComponent(title) }, body: message });
                break;
        }

        if (res && !res.ok) {
            const errText = await res.text().catch(() => 'No Error Body');
            throw new Error(`HTTP ${res.status}: ${errText.substring(0, 150)}`);
        }
        return true;
    });

    return await Promise.allSettled(promises);
}