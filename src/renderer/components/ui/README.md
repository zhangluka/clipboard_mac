# Shadcn UI 组件库

这个项目使用了基于 shadcn/ui 设计规范的自定义组件库，为剪贴板管理器提供了现代化的用户界面。

## 组件列表

### 基础组件

- **Button** - 按钮组件，支持多种变体和尺寸
- **Card** - 卡片容器，包含 Header、Title、Description、Content、Footer 子组件
- **Input** - 输入框组件
- **Label** - 标签组件
- **Badge** - 徽章组件，支持多种颜色变体

### 布局组件

- **ScrollArea** - 滚动区域组件，提供自定义滚动条
- **Separator** - 分隔线组件
- **Progress** - 进度条组件

### 交互组件

- **Dialog** - 对话框组件，支持触发器和内容区域
- **Popover** - 弹出框组件
- **Tooltip** - 工具提示组件
- **Switch** - 开关组件
- **Toggle** - 切换按钮组件

### 展示组件

- **Avatar** - 头像组件
- **Skeleton** - 骨架屏组件
- **Tabs** - 标签页组件

## 使用示例

### Button 组件

```tsx
import { Button } from "@/components/ui";

<Button variant="default">默认按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button size="lg">大尺寸</Button>
<Button size="sm">小尺寸</Button>
```

### Card 组件

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
  </CardHeader>
  <CardContent>卡片内容区域</CardContent>
  <CardFooter>卡片底部</CardFooter>
</Card>;
```

### Dialog 组件

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";

<Dialog>
  <DialogTrigger>打开对话框</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>对话框标题</DialogTitle>
      <DialogDescription>对话框描述</DialogDescription>
    </DialogHeader>
    对话框内容
  </DialogContent>
</Dialog>;
```

## 设计规范

### 颜色系统

- **Primary**: 主色调，用于主要交互元素
- **Secondary**: 次要色调，用于辅助功能
- **Destructive**: 危险色，用于删除等危险操作
- **Muted**: 柔和色，用于背景和边框
- **Accent**: 强调色，用于突出显示

### 间距系统

- 使用 Tailwind CSS 的 spacing scale
- 组件内部间距统一为 `p-4`、`p-3`、`p-2` 等
- 组件间间距使用 `gap-2`、`gap-3`、`gap-4` 等

### 圆角系统

- 统一使用 `rounded-md`、`rounded-lg` 等
- 保持一致的圆角半径

## 主题支持

组件库支持 CSS 变量主题系统，可以在 `:root` 中自定义颜色变量：

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* 其他颜色变量... */
}
```

## 最佳实践

1. **组合使用**: 组件设计为可组合的，可以自由搭配使用
2. **语义化**: 使用语义化的组件名称和结构
3. **一致性**: 保持界面元素的一致性
4. **可访问性**: 所有交互组件都支持键盘导航和屏幕阅读器
