# Code Snake：代码节点贪吃蛇

> 课程演示项目 · Vue 3 + TypeScript + Pinia + Canvas

一款面向编程初学者的教育向网页游戏：保留传统贪吃蛇操作，但地图中不再刷新普通食物，而是随机出现**代码节点**。玩家必须按照正确程序结构依次吃掉节点，右侧代码面板会随进度逐步点亮，最终在”玩”的过程中理解代码执行顺序。Demo 阶段使用 **Canvas 2D** 渲染游戏区，结合 Vue 3 + Pinia 管理状态。Demo 阶段使用 **Canvas 2D** 渲染游戏区，结合 Vue 3 + Pinia 管理状态。

---

## 目录

- [核心玩法](#核心玩法)
- [关卡类型](#关卡类型)
- [错误惩罚](#错误惩罚)
- [页面布局](#页面布局)
- [技术方案](#技术方案)
- [视觉与交互设计](#视觉与交互设计)
- [Demo 范围](#demo-范围)
- [关卡示例](#关卡示例)
- [数据格式](#数据格式)
- [开发计划](#开发计划)
- [风险点与应对](#风险点与应对)

### 已确认的核心决策

- **关卡类型**：Demo 只做「代码顺序关」，5 关线性推进。
- **渲染方式**：游戏区使用 **Canvas 2D** 渲染，高清 Canvas（DPR 适配 + resize 重算），非游戏区 UI 使用 **Naive UI**。
- **移动方式**：离散网格跳跃，无平滑插值；支持方向键 + WASD；禁止 180° 反向掉头；缓存最后一次输入。
- **快捷键**：`P` 暂停/继续，`R` 重试当前关卡。
- **节点策略**：每关始终只有 1 个当前正确目标节点 + 2~3 个干扰节点；干扰节点从 `distractors` 随机抽取。
- **得分规则**：吃对 +10 分，无连击，通关剩余生命不加奖励。
- **错误惩罚**：扣 1 生命 + 蛇身额外增长 2 格 + 屏幕红色闪烁 + 底部错误提示。
- **代码面板**：使用 `codeTemplate` 自动拼接代码骨架；`correctOrder` 长度必须与模板占位符数量一致。
- **外部库**：`naive-ui`（UI）、`lucide-vue-next`（图标）、`nanoid`（ID 生成）。
- **平台**：只支持桌面网页端，键盘控制；Demo 阶段不做移动端虚拟方向键和音效。

1. 使用键盘方向键（或 WASD）控制小蛇在 15×15 网格中移动。
2. 地图中随机出现若干代码节点（文案会适当缩短以适配单格显示），例如：
   - `for`、`let i=0`、`i<5`、`i++`、`log(i)`
   - 干扰节点：`if`、`return`、`i>5`
3. 玩家必须按正确程序结构依次吃掉正确节点：
   ```
   for → let i=0 → i<5 → i++ → log(i)
   ```
4. 每吃到一个正确节点，蛇身增长，得分 **+10**，代码面板对应片段被点亮。
5. 吃到错误节点会触发惩罚；撞墙或撞到自身则关卡失败。

---

## 关卡类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **代码顺序关** | 按正确顺序收集代码片段 | for 循环、变量定义、函数调用 |
| **程序输出关** | 给出目标输出，选择能组成正确程序的节点 | 目标输出 `0 1 2 3 4` |
| **Bug 修复关** | 错误代码中吃掉正确替换节点 | 把 `i > 5` 改成 `i < 5` |
| **语法配对关** | 依次收集成对结构 | `if → condition → { → statement → }` |
| **算法流程关** | 按算法执行顺序收集 | 读取数据 → 初始化 → 循环处理 → 输出 |

---

## 错误惩罚

Demo 阶段采用**扣生命值 + 蛇身额外增长两格**，原因：

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
│  HEADER：关卡目标 + 进度提示                           │
│  “关卡 1：补全 for 循环”                              │
│  进度：for → let i = 0 → ? → ?                       │
├────────────────────────────────┬────────────────────┤
│                                │  CODE PANEL        │
│   GAME BOARD                   │  当前代码 / 可编辑区 │
│   贪吃蛇游戏区                  │  for (...) {       │
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
| 顶部 | `Header` | 关卡标题、学习目标、节点进度条 |
| 左侧中 | `GameBoard` | 贪吃蛇主游戏区，15×15 网格 |
| 右侧 | `CodePanel` | 当前代码骨架、补全提示、错误信息 |
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
│       ├── level-02.json
│       ├── level-03.json
│       ├── level-04.json
│       └── level-05.json
├── src/
│   ├── assets/
│   │   └── styles/
│       │   └── main.css        # 全局样式、CSS 变量主题
│   ├── components/
│   │   ├── GameBoard.vue       # Canvas 游戏区
│   │   ├── CodePanel.vue       # 右侧代码面板（Naive UI）
│   │   ├── HUD.vue             # 顶部目标 + 进度
│   │   ├── StatusBar.vue       # 底部状态栏
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
| `stores/gameStore.ts` | 唯一数据源，包含状态与 actions（tick、转向、吃节点、切关） |
| `composables/useGameLoop.ts` | 控制帧率与暂停，定时调用 store 的 `tick` |
| `composables/useInput.ts` | 防止 180° 反向掉头，缓存 `nextDirection` 到下一 tick 生效 |
| `utils/grid.ts` | 纯函数：越界检测、自身碰撞、随机空位生成 |
| `utils/snake.ts` | 纯函数：计算下一帧蛇身，处理增长 |
| `utils/canvas.ts` | Canvas 高清缩放、网格绘制、文字居中等辅助函数 |
| `utils/nodes.ts` | 节点生成、顺序校验、干扰节点随机抽取 |
| `components/GameBoard.vue` | Canvas 渲染容器，监听 resize，调用绘制函数 |
| `components/CodePanel.vue` | 根据 `collectedCount` 点亮已收集的代码片段 |

### 核心数据模型

```typescript
interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type NodeType = 'CORRECT' | 'DISTRACTOR';
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
  distractorCount: number;    // 干扰节点数量（建议 2~3）
  correctOrder: string[];
  codeTemplate: string;       // 代码骨架模板，使用 {1} {2} 等占位符
  distractors: string[];
  explanation: string;
  difficulty?: number;
}

interface GameState {
  status: GameStatus;
  levelIndex: number;
  levelConfig: LevelConfig | null;
  lives: number;
  score: number;
  snake: Snake;
  nodes: CodeNode[];
  collectedCount: number;
  speed: number;              // 当前关卡实际速度
  errorFlash: boolean;        // 是否正在显示错误红色闪烁
}
```

### 关键技术实现点

#### 1. 蛇移动

- 采用离散时间步（每 200ms 一帧），由 `useGameLoop` 驱动。
- 存储 `direction`（当前方向）和 `nextDirection`（下一帧生效方向），避免同一 tick 内多次输入导致自撞。
- 每 tick 计算新头部：`newHead = head + directionVector`。
- 未吃节点：头部入队，尾部出队。
- 吃到正确节点：头部入队，连续 1 帧不缩尾（增长 1 格）。
- 吃到错误节点：头部入队，连续 2 帧不缩尾（额外增长 2 格）。

#### 2. 碰撞检测

- 越界：`head.x < 0 || head.x >= 15 || head.y < 0 || head.y >= 15`
- 自身碰撞：新头部位置是否出现在蛇身数组中。
- 撞墙 / 撞自身直接触发 `LEVEL_FAILED`。

#### 3. 节点生成

- 维护“已占位置”集合：蛇身 + 现有节点。
- 每次生成时随机抽取网格空位，保证节点不重叠。
- 每收集一个正确节点后，销毁旧节点，重新生成下一正确节点和新的干扰节点。
- 干扰节点数量由关卡配置的 `distractorCount` 决定（建议 2~3）。
- 干扰节点文案从 `distractors` 数组中随机抽取，允许重复。

#### 4. 顺序判断

- 维护 `collectedCount` 作为当前应收集的索引。
- 正确节点携带 `orderIndex`。
- 当蛇头与节点位置重合：
  - 若 `node.type === 'CORRECT' && node.orderIndex === collectedCount`：正确，点亮代码面板对应行。
  - 否则：判定为错误，触发惩罚逻辑。

#### 5. 惩罚逻辑

- 错误吃节点时：
  1. `lives -= 1`
  2. 蛇身立即额外增长 2 格（通过延迟缩尾实现）
  3. 游戏面板红色闪烁 200ms
  4. 若 `lives <= 0`，进入 `LEVEL_FAILED`

#### 6. Canvas 渲染细节

- 使用高清 Canvas：`canvas.width = cssWidth * DPR`，`ctx.scale(DPR, DPR)`。
- 监听容器 resize，重新计算 `cellSize` 和 Canvas 尺寸。
- 绘制顺序：背景 → 网格线 → 节点 → 蛇身 → 特效。
- 节点文字使用 `ctx.fillText` 居中绘制，文案已缩短以适配单格。
- 蛇身各节之间保留 1~2px 间隙。
- 正确节点被吃：8~12 个绿色小方块粒子向外散开，生命周期 200~300ms。
- 错误惩罚：半透明红色矩形覆盖 Canvas 200ms。

#### 7. 关卡状态机

```
IDLE -> PLAYING
PLAYING -> PAUSED -> PLAYING
PLAYING -> LEVEL_PASSED
PLAYING -> LEVEL_FAILED
LEVEL_PASSED -> IDLE（下一关） / ALL_LEVELS_CLEARED（第五关后）
LEVEL_FAILED -> IDLE（重试）
```

- 所有状态变更由 `gameStore` 统一管理。
- `GameBoard.vue` 根据状态显示遮罩和结算弹窗。

#### 8. 胜负判定

- 关卡胜利：`collectedCount === correctOrder.length`，进入 `LEVEL_PASSED`。
- 关卡失败：`lives <= 0` 或发生撞墙/自身碰撞。
- 全部通关：完成第 5 关后进入 `ALL_LEVELS_CLEARED`。

---

## 视觉与交互设计

### 组件分层

```
App.vue
├── Header.vue
│   ├── LevelTitle.vue
│   └── ProgressBar.vue
├── GameBoard.vue
│   ├── GridMap.vue
│   ├── Snake.vue
│   ├── FoodNode.vue
│   └── EffectLayer.vue
├── CodePanel.vue
│   ├── CodeSkeleton.vue
│   ├── CodeHint.vue
│   └── ErrorToast.vue
├── StatusBar.vue
│   ├── HealthIndicator.vue
│   ├── ScoreDisplay.vue
│   └── LengthDisplay.vue
└── LevelModal.vue
    ├── ResultCode.vue
    └── KnowledgeCard.vue
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

- 页面外层间距：`16px`（桌面）/ `8px`（移动端）
- 面板内边距：`16px ~ 20px`
- 网格单元尺寸：`20px`（桌面）/ `16px`（移动端）
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
| 地图网格 | 背景 `--bg-code`，网格线 `--grid-line` |
| 生命值 | 实心/空心爱心 `♥ ♥ ♥`，扣血时闪烁变红 |
| 进度提示 | 已点亮节点显示彩色，未解锁显示 `?` |

### 动效与反馈

- **吃到正确节点**：绿色粒子爆炸、代码片段从灰色渐变到彩色、得分数字跳动 `+10`。
- **错误惩罚**：屏幕边缘红色闪烁、错误节点破碎动画、爱心缩小、底部红色错误提示。
- **关卡结算**：弹窗从中心缩放进入，展示完整点亮后的代码与知识点卡片。
- **代码点亮**：300ms 过渡 `color` 与 `opacity`。

### 响应式与可访问性

- **桌面端（>= 1024px）**：左右分栏，游戏区占 2/3，代码区占 1/3。
- **平板端（768px ~ 1023px）**：上下分栏，代码区位于游戏区下方。
- **移动端（< 768px）**：单列堆叠，游戏区自动缩小，代码区可折叠，提供屏幕虚拟方向键。
- 支持键盘完全操作：`WASD` / `方向键` 控制移动，`Enter` 暂停/继续。
- 动画遵循 `prefers-reduced-motion`。
- 文字与背景对比度符合 WCAG AA 标准。

---

## Demo 范围

### 必须做

- 传统方向键贪吃蛇（15×15 网格）
- 3 条初始生命值
- 正确节点与干扰节点生成
- 顺序判断与蛇身增长
- 错误惩罚（扣生命 + 额外增长 2 格）
- 5 个固定关卡
- 关卡结算和代码解释

### 不做（Demo 阶段）

- 后端服务、用户登录、存档同步。
- 本地持久化进度（localStorage 等）。
- 关卡编辑器、动态生成关卡。
- 音效：Demo 阶段无音效，仅视觉反馈。
- 复杂动画库、移动端手势、虚拟方向键。
- 多人联机、排行榜。
- 算法流程关中真正的流程图拖拽交互（仅通过节点选择实现）。

---

## 关卡示例

| 关卡 | 类型 | 主题 |
|------|------|------|
| 1 | 代码顺序关 | 变量赋值：`let count = 0` |
| 2 | 代码顺序关 | if 条件判断：`if (score > 10) { ... }` |
| 3 | 代码顺序关 | for 循环：`for (let i = 0; i < 5; i++) { ... }` |
| 4 | 代码顺序关 | 数组遍历：输出数组每个元素 |
| 5 | 代码顺序关 | 简单函数调用：`function greet() { ... }` |

---

## 数据格式

```json
{
  "id": 1,
  "type": "order",
  "title": "补全 for 循环",
  "description": "按照正确的 for 循环结构依次吃掉代码节点。",
  "speed": 200,
  "lives": 3,
  "distractorCount": 3,
  "correctOrder": [
    "for",
    "let i=0",
    "i<5",
    "i++",
    "log(i)"
  ],
  "codeTemplate": "for ({1}; {2}; {3}) {\n  {4};\n}",
  "distractors": [
    "if",
    "return",
    "i>5"
  ],
  "explanation": "for 循环由初始化、条件判断、步进语句和循环体组成。初始化只在循环开始时执行一次；每次迭代先判断条件，条件为真时执行循环体，然后执行步进语句。"
}
```

**约束**：`correctOrder` 长度必须与 `codeTemplate` 中的占位符数量一致，关卡加载时校验。

---

## 开发计划

| 阶段 | 时间 | 目标 | 可验证交付物 |
|------|------|------|--------------|
| 1 | 第 1 天 | 项目搭建 + 类型 + 5 关 JSON | 能 `npm run dev`，控制台无类型错误 |
| 2 | 第 2 天 | 网格渲染 + 蛇移动 + 键盘输入 | 蛇在 15×15 网格中移动，不撞墙 |
| 3 | 第 3 天 | 碰撞 + 节点生成 + 基础增长 | 撞墙失败，吃正确节点增长 1 格 |
| 4 | 第 4 天 | 顺序判断 + 惩罚 + 代码面板 | 正确顺序点亮代码，错误扣生命并增长 2 格 |
| 5 | 第 5 天 | 关卡状态机 + 结算 + 解释 | 5 关可打通，结算面板显示解释 |
| 6 | 第 6 天 | 样式优化 + 边界测试 | 无明显 bug，课程演示流畅 |

---

## 风险点与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| 快速连续按键导致 180° 掉头自杀 | 玩家体验差 | `nextDirection` 缓存 + 禁止反向 |
| 同一 tick 内多次转向 | 逻辑异常 | 只保存最后一次输入，下一 tick 统一生效 |
| 节点生成在蛇身或已有节点上 | 关卡卡住 | 生成前遍历 `occupied` 集合，确保位置唯一 |
| 蛇身增长实现出错 | 蛇长度或位置异常 | 将“增长”抽象为“连续 N 帧不缩尾”的计数器 |
| 状态机分散在多个组件 | 难以调试 | 所有状态变更集中在 `gameStore` |
| 游戏循环在暂停/重试时未清理 | 多个循环并行 | `useGameLoop` 暴露 `start/stop` 并在切换状态时调用 |
| Canvas resize 后坐标计算错误 | 节点/蛇偏移 | resize 时重新计算 `cellSize` 并重绘 |
| 关卡文案含有特殊字符 | 代码面板显示错误 | 使用普通字符串数组，避免直接执行代码 |

---

## 重点设计提示

真正需要重点设计的不是技术，而是：

> **如何让代码节点足够短、容易识别，同时保证正确顺序不会产生歧义。**

因此 Demo 最好先使用“代码关键词和语句块”，不要把单个括号、分号拆成独立节点。这样既能降低实现难度，也更像真正的贪吃蛇游戏，课程展示可行性较高。

## 快速启动

本项目基于 Vite + Vue 3。首次运行先安装依赖：

```bash
npm install
```

启动本地开发环境：

```bash
npm run dev
```

浏览器打开终端输出的本地地址，通常是 `http://localhost:5173/`。

常用命令：

```bash
npm run build      # 类型检查并构建生产包
npm run preview    # 预览构建结果
npm run test       # 运行单元测试
```
