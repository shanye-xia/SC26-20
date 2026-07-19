# Code Snake：代码节点贪吃蛇

> 课程演示项目 · Vue 3 + TypeScript + Pinia + Canvas

一款面向编程初学者的教育向网页游戏：保留传统贪吃蛇操作，但地图中不再刷新普通食物，而是随机出现**代码节点**。玩家必须按照正确程序结构依次吃掉节点，右侧代码面板会以代码骨架和 `?` 占位展示进度，并随收集进度逐步点亮对应片段，最终在“玩”的过程中理解代码执行顺序。当前版本使用 **Canvas 2D** 渲染游戏区，结合 Vue 3 + Pinia 管理状态。

## Quick Start

环境要求：

- Node.js 18+，建议 Node.js 20 或 22
- npm 9+
- Git
- 现代桌面浏览器，建议 Chrome / Edge
- 游戏依赖键盘操作，当前不面向移动端触屏优化

从 0 开始运行：

```bash
git clone git@github.com:shanye-xia/SC26-20.git
cd SC26-20
npm install
npm run dev
```

如果没有配置 GitHub SSH key，可以使用 HTTPS 拉取：

```bash
git clone https://github.com/shanye-xia/SC26-20.git
```

浏览器打开终端输出的本地地址，通常是 `http://localhost:5173/`。

常用命令：

```bash
npm run test       # 运行单元测试
npm run build      # 类型检查并构建生产包
npm run preview    # 预览构建结果
```

Windows PowerShell 如果拦截 `npm.ps1`，可以改用：

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

---

## 目录

- [核心玩法](#核心玩法)
- [关卡类型](#关卡类型)
- [错误惩罚](#错误惩罚)
- [页面布局](#页面布局)
- [技术方案](#技术方案)
- [视觉与交互设计](#视觉与交互设计)
- [当前范围](#当前范围)
- [关卡示例](#关卡示例)
- [数据格式](#数据格式)
- [开发计划](#开发计划)
- [风险点与应对](#风险点与应对)

### 已确认的核心决策

- **关卡类型**：当前实现 10 个「代码顺序关」，线性推进，也支持选择已解锁关卡。
- **渲染方式**：游戏区使用 **Canvas 2D** 渲染，高清 Canvas（DPR 适配 + resize 重算），非游戏区 UI 使用 **Naive UI**。
- **移动方式**：离散网格跳跃，无平滑插值；支持方向键 + WASD；禁止 180° 反向掉头；缓存最后一次输入。
- **快捷键**：`P` 暂停/继续，`R` 在失败后重试、通关后进入下一关，`Space` 发射投射物。
- **节点策略**：每关始终只有 1 个当前正确目标节点 + 若干干扰节点；干扰节点数量由关卡的 `distractorCount` 决定。
- **得分规则**：吃对 +10 分，无连击，通关剩余生命不加奖励。
- **错误惩罚**：扣 1 生命 + 蛇身额外增长 2 格 + 屏幕红色闪烁 + 底部错误提示。
- **代码面板**：使用 `codeTemplate` 自动拼接代码骨架；未收集片段显示 `?`，已收集片段高亮。
- **外部库**：`naive-ui`（UI）、`lucide-vue-next`（图标）、`nanoid`（ID 生成）。
- **扩展机制**：部分关卡包含障碍、护盾、无敌、攻击、生命恢复和困难模式。
- **平台**：以桌面网页端键盘控制为主；当前不提供移动端虚拟方向键和音效。

1. 使用键盘方向键（或 WASD）控制小蛇在 15×15 网格中移动。
2. 地图中随机出现若干代码节点（文案会适当缩短以适配单格显示），例如：
   - `for`、`let i=0`、`i<5`、`i++`、`log(i)`
   - 干扰节点：`if`、`return`、`i>5`
3. 玩家必须按正确程序结构依次吃掉正确节点：
   ```
   for → let i=0 → i<5 → i++ → log(i)
   ```
4. 每吃到一个正确节点，蛇身增长，得分 **+10**，代码面板对应片段被点亮。
5. 吃到错误节点会触发惩罚；撞墙、撞到障碍或撞到自身会导致失败，护盾可抵消一次伤害，无敌可在持续时间内免疫伤害。

---

## 关卡类型

当前已实现的关卡都是「代码顺序关」。下面表格中的其他类型是类型定义中预留的扩展方向，尚未做成可玩关卡。

| 类型 | 说明 | 示例 |
|------|------|------|
| **代码顺序关** | 按正确顺序收集代码片段 | for 循环、变量定义、函数调用 |
| **程序输出关** | 给出目标输出，选择能组成正确程序的节点 | 目标输出 `0 1 2 3 4` |
| **Bug 修复关** | 错误代码中吃掉正确替换节点 | 把 `i > 5` 改成 `i < 5` |
| **语法配对关** | 依次收集成对结构 | `if → condition → { → statement → }` |
| **算法流程关** | 按算法执行顺序收集 | 读取数据 → 初始化 → 循环处理 → 输出 |

---

## 错误惩罚

当前版本采用**扣生命值 + 蛇身额外增长两格**，原因：

- 规则直观，玩家立刻理解“吃错要付出代价”。
- 实现简单，不改变核心游戏循环。
- 蛇身变长会让后续规划更难，形成自然的难度递增。

错误发生时同时触发：

- 生命值 -1
- 蛇身额外增长 2 格
- 屏幕边缘红色闪烁
- 底部红色错误提示

---

## 页面布局

页面采用“**编辑器风格 + 游戏化分区**”的三段式布局。游戏主区使用 **Canvas 2D** 渲染，右侧代码面板与顶部/底部信息区使用 Vue 组件 + Naive UI：

```
┌─────────────────────────────────────────────────────┐
│  HUD：关卡目标 + 进度提示                              │
│  “关卡 1：变量赋值”                                  │
│  进度：let → ? → ? → ?                               │
├────────────────────────────────┬────────────────────┤
│                                │  CODE PANEL        │
│   GAME BOARD                   │  当前代码 / 进度     │
│   贪吃蛇游戏区                  │  let ? ? ?;        │
│                                │    // ...          │
│   [网格地图]                    │  }                 │
│                                │                    │
│                                │  [提示 / 错误信息]   │
├────────────────────────────────┴────────────────────┤
│  STATUS BAR：生命值 ♥♥♥   得分 120   长度 8          │
└─────────────────────────────────────────────────────┘
```

### 区块说明

| 区块 | 组件 | 说明 |
|------|------|------|
| 顶部 | `HUD` | 关卡标题、学习目标、节点进度条 |
| 左侧中 | `GameBoard` | 贪吃蛇主游戏区，15×15 网格 |
| 右侧 | `CodePanel` | 关卡选择、当前代码、进度、道具状态、错误信息 |
| 底部 | `StatusBar` | 生命值、得分、当前长度 |
| 覆盖层 | `LevelModal` | 通关结算、完整代码展示、知识点解释 |

---

## 技术方案

### 技术栈

- **框架**：Vue 3（Composition API）
- **语言**：TypeScript（开启 `strict: true`）
- **状态管理**：Pinia（单一 `gameStore` 集中管理所有游戏状态）
- **渲染**：游戏区使用 **Canvas 2D**（高清 Canvas，DPR 适配）；非游戏区 UI 使用 **Naive UI**
- **图标**：`lucide-vue-next`
- **ID 生成**：`nanoid`
- **构建工具**：Vite
- **测试**：Vitest（核心工具函数单元测试）
- **关卡数据**：静态 JSON

### 项目目录结构

```text
codeSnake/
├── public/
│   └── levels/                 # 关卡 JSON 静态资源
│       ├── level-01.json
│       ├── ...
│       └── level-10.json
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css        # 全局样式、CSS 变量主题
│   ├── components/
│   │   ├── GameBoard.vue       # Canvas 游戏区
│   │   ├── CodePanel.vue       # 右侧代码面板（Naive UI）
│   │   ├── HUD.vue             # 顶部目标 + 进度
│   │   ├── StatusBar.vue       # 底部状态栏
│   │   ├── DebugPanel.vue      # 开发环境调试面板
│   │   └── LevelModal.vue      # 结算弹窗
│   ├── composables/
│   │   ├── useGameLoop.ts      # requestAnimationFrame 游戏循环
│   │   └── useInput.ts         # 键盘方向键监听
│   ├── constants/
│   │   └── game.ts             # 网格大小、默认速度等常量
│   ├── stores/
│   │   └── gameStore.ts        # Pinia 全局状态
│   ├── types/
│   │   └── game.ts             # 核心 TypeScript 类型定义
│   ├── utils/
│   │   ├── grid.ts             # 网格、碰撞、随机空位生成
│   │   ├── snake.ts            # 移动、增长、方向切换
│   │   ├── canvas.ts           # Canvas 高清缩放、绘制辅助
│   │   ├── nodes.ts            # 节点生成、顺序校验
│   │   └── levelLoader.ts      # fetch 关卡 JSON
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 关键模块职责

| 模块 | 职责 |
|------|------|
| `stores/gameStore.ts` | 唯一数据源，包含状态与 actions（tick、转向、吃节点、道具、切关） |
| `composables/useGameLoop.ts` | 控制帧率与暂停，定时调用 store 的 `tick` |
| `composables/useInput.ts` | 监听方向键、WASD、暂停、重试和开火快捷键 |
| `utils/grid.ts` | 纯函数：越界检测、自身碰撞、障碍和随机空位生成 |
| `utils/snake.ts` | 纯函数：计算下一帧蛇身，处理增长 |
| `utils/canvas.ts` | Canvas 高清缩放、网格绘制、节点、障碍、道具、投射物和粒子绘制 |
| `utils/nodes.ts` | 节点生成、顺序校验、干扰节点随机抽取 |
| `components/GameBoard.vue` | Canvas 渲染容器，监听 resize，调用绘制函数 |
| `components/CodePanel.vue` | 关卡选择、代码展示、进度提示、困难模式和道具状态 |

### 核心数据模型

```typescript
interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type NodeType = 'CORRECT' | 'DISTRACTOR';
type PowerUpType = 'SHIELD' | 'INVINCIBLE' | 'SHOT' | 'HEALTH';
type LevelType = 'order' | 'output' | 'bugfix' | 'matching' | 'flow';
type GameStatus =
  | 'IDLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_PASSED'
  | 'LEVEL_FAILED'
  | 'ALL_LEVELS_CLEARED';

interface CodeNode {
  id: string;
  label: string;
  type: NodeType;
  position: Position;
  orderIndex?: number; // 仅 CORRECT 节点有效
}

interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
}

interface ActiveEffects {
  shield: number;
  invincibleMs: number;
  shots: number;
}

interface Projectile {
  id: string;
  position: Position;
  direction: Direction;
}

interface Snake {
  body: Position[];
  direction: Direction;
  nextDirection: Direction;
}

interface LevelConfig {
  id: number;
  type: LevelType;
  title: string;
  description: string;
  speed: number;              // 毫秒/帧，每关独立配置
  lives: number;              // 初始生命值
  distractorCount: number;    // 干扰节点数量
  initialSnakeLength?: number;
  obstacleCount?: number;
  powerUps?: PowerUpType[];
  correctOrder: string[];
  codeTemplate: string;       // 代码骨架模板，使用 {1} {2} 等占位符
  distractors: string[];
  rules?: string;
  explanation: string;
  difficulty?: number;
}

interface GameState {
  status: GameStatus;
  levelIndex: number;
  maxUnlockedLevel: number;
  levelConfig: LevelConfig | null;
  lives: number;
  score: number;
  snake: Snake;
  obstacles: Position[];
  nodes: CodeNode[];
  powerUps: PowerUp[];
  projectiles: Projectile[];
  activeEffects: ActiveEffects;
  collectedCount: number;
  speed: number;              // 当前关卡实际速度
  growCounter: number;
  errorFlash: boolean;        // 是否正在显示错误红色闪烁
  hardMode: boolean;
}
```

### 关键技术实现点

#### 1. 蛇移动

- 采用离散时间步，由 `useGameLoop` 驱动；每关通过 JSON 的 `speed` 配置移动间隔。
- 存储 `direction`（当前方向）和 `nextDirection`（下一帧生效方向），避免同一 tick 内多次输入导致自撞。
- 每 tick 计算新头部：`newHead = head + directionVector`。
- 未吃节点：头部入队，尾部出队。
- 吃到正确节点：头部入队，连续 1 帧不缩尾（增长 1 格）。
- 吃到错误节点：头部入队，连续 2 帧不缩尾（额外增长 2 格）。

#### 2. 碰撞检测

- 越界：`head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 15`
- 自身碰撞：新头部位置是否出现在蛇身数组中。
- 障碍碰撞：新头部位置是否命中 `obstacles`。
- 撞墙、撞障碍、撞自身默认触发 `LEVEL_FAILED`；护盾可抵消一次伤害，无敌可在持续时间内免疫伤害。

#### 3. 节点生成

- 维护“已占位置”集合：蛇身 + 现有节点 + 障碍 + 道具。
- 每次生成时随机抽取网格空位，保证节点不重叠。
- 每收集一个正确节点后，销毁旧节点，重新生成下一正确节点和新的干扰节点。
- 干扰节点数量由关卡配置的 `distractorCount` 决定。
- 干扰节点文案从 `distractors` 数组中随机抽取，并去重；当前正确节点不会作为干扰项生成。

#### 4. 顺序判断

- 维护 `collectedCount` 作为当前应收集的索引。
- 正确节点携带 `orderIndex`。
- 当蛇头与节点位置重合：
  - 若 `node.type === 'CORRECT' && node.orderIndex === collectedCount`：正确，点亮代码面板对应行。
  - 否则：判定为错误，触发惩罚逻辑。

#### 5. 惩罚逻辑

- 错误吃节点且没有护盾/无敌保护时：
  1. `lives -= 1`
  2. 蛇身立即额外增长 2 格（通过延迟缩尾实现）
  3. 游戏面板红色闪烁 200ms
  4. 若 `lives <= 0`，进入 `LEVEL_FAILED`

#### 6. 道具与投射物

- 护盾：抵消一次撞击或吃错节点。
- 无敌：一段时间内免疫伤害。
- 攻击：按空格发射投射物，可击碎障碍。
- 生命：恢复 1 点生命，但不超过当前关卡配置的初始生命上限。

#### 7. Canvas 渲染细节

- 使用高清 Canvas：`canvas.width = cssWidth * DPR`，`ctx.scale(DPR, DPR)`。
- 监听容器 resize，重新计算 `cellSize` 和 Canvas 尺寸。
- 绘制顺序：背景 → 网格线 → 障碍 → 节点 → 道具 → 投射物 → 蛇身 → 特效。
- 节点文字使用 `ctx.fillText` 居中绘制，文案已缩短以适配单格。
- 蛇身各节之间保留 1~2px 间隙。
- 正确节点被吃：8~12 个绿色小方块粒子向外散开，生命周期 200~300ms。
- 错误惩罚：半透明红色矩形覆盖 Canvas 200ms。

#### 8. 关卡状态机

```
IDLE -> PAUSED（加载关卡后等待开始）
PAUSED -> PLAYING（方向键 / WASD / 继续）
PLAYING -> PAUSED -> PLAYING
PLAYING -> LEVEL_PASSED
PLAYING -> LEVEL_FAILED
LEVEL_PASSED -> PAUSED（下一关加载后等待开始）
LEVEL_FAILED -> PAUSED（重试当前关卡后等待开始）
```

- 所有状态变更由 `gameStore` 统一管理。
- `LevelModal.vue` 根据状态显示关卡结算和操作按钮。
- `ALL_LEVELS_CLEARED` 是保留的全部通关状态，最后一关状态流仍是后续优化重点。

#### 9. 胜负判定

- 关卡胜利：`collectedCount === correctOrder.length`，进入 `LEVEL_PASSED`。
- 关卡失败：`lives <= 0`，或在没有保护效果时发生撞墙、撞障碍、撞自身。
- 当前共有 10 关，通关后解锁下一关，最大解锁到第 10 关。

---

## 视觉与交互设计

### 组件分层

```
App.vue
├── HUD.vue
├── GameBoard.vue
├── CodePanel.vue
├── StatusBar.vue
├── DebugPanel.vue（仅开发环境）
└── LevelModal.vue
```

### 颜色主题（暗色代码编辑器风格）

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg-primary` | `#1e1e2e` | 页面主背景 |
| `--bg-panel` | `#2a2a3c` | 面板背景 |
| `--bg-code` | `#1a1b26` | 代码区背景 |
| `--grid-line` | `#3b3d52` | 网格线 |
| `--text-primary` | `#cdd6f4` | 主文字 |
| `--text-secondary` | `#a6adc8` | 次要文字 |
| `--accent-keyword` | `#f38ba8` | 关键字（for / if） |
| `--accent-variable` | `#f9e2af` | 变量 / 得分 |
| `--accent-string` | `#a6e3a1` | 字符串 / 正确节点 |
| `--accent-function` | `#89b4fa` | 函数 / 提示 |
| `--accent-error` | `#f38ba8` | 错误 / 扣血 |
| `--accent-health` | `#f7768e` | 生命值 |
| `--accent-snake` | `#89dceb` | 蛇身 |
| `--accent-node` | `#b4befe` | 普通代码节点 |
| `--border` | `#45475a` | 面板边框 |

### 字体建议

- **代码字体**：`"JetBrains Mono", "Fira Code", "Cascadia Code", monospace`
- **界面字体**：`"Inter", "PingFang SC", "Microsoft YaHei", sans-serif`

### 间距与网格

- 页面外层间距：`16px`
- 面板内边距：`16px ~ 20px`
- 网格单元尺寸：由 Canvas 容器尺寸和 15×15 网格动态计算
- 圆角：`8px`（面板）、`4px`（按钮/节点）、`12px`（弹窗）
- 间距体系：`4 / 8 / 12 / 16 / 24 / 32px`

### 元素设计

| 元素 | 设计 |
|------|------|
| 正确节点 | 绿色发光边框，背景 `--accent-string`，显示代码片段 |
| 干扰节点 | 虚线边框，背景 `--bg-panel`，文字 `--text-secondary` |
| 当前目标节点 | 外圈脉冲动画，高亮当前应吃的节点 |
| 蛇头 | 圆角矩形，颜色略亮于蛇身，可带眼睛方向标识 |
| 蛇身 | 等宽段组成的链式结构，颜色 `--accent-snake` |
| 障碍 | 墙体样式，命中后失败或消耗保护效果 |
| 道具 | 护盾、无敌、攻击、生命恢复四类图标化节点 |
| 投射物 | 由空格触发，可击碎障碍 |
| 地图网格 | 背景 `--bg-code`，网格线 `--grid-line` |
| 生命值 | 实心/空心爱心 `♥ ♥ ♥`，扣血时闪烁变红 |
| 进度提示 | 已收集和当前节点显示文本，后续未解锁节点显示 `?` |

### 动效与反馈

- **吃到正确节点**：绿色粒子爆炸、代码片段从灰色渐变到彩色、得分数字跳动 `+10`。
- **错误惩罚**：屏幕红色闪烁、底部红色错误提示、生命值减少。
- **关卡结算**：弹窗从中心缩放进入，展示完整点亮后的代码与知识点卡片。
- **代码点亮**：300ms 过渡 `color` 与 `opacity`。

### 响应式与可访问性

- **宽屏（> 768px）**：左右分栏，游戏区占 2/3，代码区占 1/3。
- **窄屏（<= 768px）**：单列堆叠，游戏区在上，代码区在下；当前没有屏幕虚拟方向键。
- 支持键盘操作：`WASD` / `方向键` 控制移动，`P` 暂停/继续，`R` 重试或进入下一关，`Space` 发射投射物。
- 动画遵循 `prefers-reduced-motion`。
- 暗色主题使用 CSS 变量统一管理，主要文本和背景保持高对比度。

---

## 当前范围

### 已实现

- 传统方向键贪吃蛇（15×15 网格）
- 每关独立配置生命值、速度、初始长度和难度
- 正确节点与干扰节点生成
- 顺序判断与蛇身增长
- 错误惩罚（扣生命 + 额外增长 2 格）
- 10 个固定代码顺序关
- 障碍墙、护盾、无敌、攻击、生命恢复道具
- 困难模式开关
- 开发环境调试面板
- 关卡结算和代码解释

### 暂不做

- 后端服务、用户登录、存档同步。
- 本地持久化进度（localStorage 等）。
- 关卡编辑器、动态生成关卡。
- 音效：当前无音效，仅视觉反馈。
- 复杂动画库、移动端手势、虚拟方向键。
- 多人联机、排行榜。
- 算法流程关中真正的流程图拖拽交互（仅通过节点选择实现）。

---

## 关卡示例

| 关卡 | 类型 | 主题 |
|------|------|------|
| 1 | 代码顺序关 | 变量赋值：`let score = 0` |
| 2 | 代码顺序关 | if 条件判断：`if (score > 10) { ... }` |
| 3 | 代码顺序关 | for 循环：`for (let i = 0; i < 5; i++) { ... }` |
| 4 | 代码顺序关 | 数组遍历：输出数组每个元素 |
| 5 | 代码顺序关 | 简单函数调用：`function greet() { ... }` |
| 6 | 代码顺序关 | 布尔判断组合 |
| 7 | 代码顺序关 | 数组追加 |
| 8 | 代码顺序关 | guard clause 提前返回 |
| 9 | 代码顺序关 | async/await 异步读取 |
| 10 | 代码顺序关 | try/catch 错误处理 |

---

## 数据格式

```json
{
  "id": 3,
  "type": "order",
  "title": "补全 for 循环",
  "description": "按照正确的 for 循环结构依次吃掉代码节点。",
  "speed": 200,
  "lives": 3,
  "distractorCount": 3,
  "initialSnakeLength": 5,
  "obstacleCount": 5,
  "difficulty": 3,
  "powerUps": ["SHIELD"],
  "correctOrder": [
    "for",
    "let i=0",
    "i<5",
    "i++",
    "log(i)"
  ],
  "codeTemplate": "{1} ({2}; {3}; {4}) {\n  {5};\n}",
  "distractors": [
    "if",
    "return",
    "i>5",
    "while",
    "i--"
  ],
  "explanation": "for 循环由初始化、条件判断、步进语句和循环体组成。初始化只在循环开始时执行一次；每次迭代先判断条件，条件为真时执行循环体，然后执行步进语句。"
}
```

**约束**：`correctOrder` 长度必须与 `codeTemplate` 中的占位符数量一致，关卡加载时校验。`initialSnakeLength`、`obstacleCount`、`powerUps`、`rules`、`difficulty` 为可选字段。

---

## 开发计划

当前仓库尚未拆出独立计划文档，近期重点如下：

1. 修正全部通关状态流。
2. 统一 README 与实际 10 关口径。
3. 补齐 `gameStore.ts` 主流程测试。
4. 校验并平衡 10 个关卡配置。

---

## 风险点与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| 快速连续按键导致 180° 掉头自杀 | 玩家体验差 | `nextDirection` 缓存 + 禁止反向 |
| 同一 tick 内多次转向 | 逻辑异常 | 只保存最后一次输入，下一 tick 统一生效 |
| 节点生成在蛇身、障碍或已有节点上 | 关卡卡住 | 生成前遍历 `occupied` 集合，确保位置唯一 |
| 蛇身增长实现出错 | 蛇长度或位置异常 | 将“增长”抽象为“连续 N 帧不缩尾”的计数器 |
| 状态机分散在多个组件 | 难以调试 | 所有状态变更集中在 `gameStore` |
| 游戏循环在组件卸载后未清理 | 多个循环并行 | `useGameLoop` 在挂载时启动、卸载时取消动画帧 |
| Canvas resize 后坐标计算错误 | 节点/蛇偏移 | resize 时重新计算 `cellSize` 并重绘 |
| 关卡文案含有特殊字符 | 代码面板显示错误 | 使用普通字符串数组，避免直接执行代码 |

---

## 重点设计提示

真正需要重点设计的不是技术，而是：

> **如何让代码节点足够短、容易识别，同时保证正确顺序不会产生歧义。**

因此当前项目最好继续使用“代码关键词和语句块”，不要把单个括号、分号拆成独立节点。这样既能降低实现难度，也更像真正的贪吃蛇游戏，课程展示可行性较高。
