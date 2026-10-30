<div align="center">

# 截图套壳 ShotFrame

给截图套上手机、平板、笔记本、浏览器边框，加背景、标题和 3D 倾斜，一键导出高清 PNG。
**纯前端，图片不上传，不用注册，不用 API Key。**

[在线使用](https://woodti.github.io/shotframe/) · [English](./README.en.md)

![ShotFrame 演示](./docs/demo.gif)

</div>

## 功能

- **7 种边框**：无边框（可调圆角）、浏览器窗口（可改网址）、Mac 窗口、手机、平板、笔记本、显示器；浅色 / 深色主题，4 种机身颜色，横竖屏切换
- **背景**：10 种渐变、纯色、自定义颜色和角度、模糊原图、透明
- **标题文字**：主标题 + 副标题，放在截图上方或下方，颜色按背景自动选深浅，做 App Store 截图、小红书配图都合适
- **多图拼接**：最多 4 张截图并排拼成一张图
- **3D 倾斜**：左转、右转、后仰（真实透视），以及带厚度的等距视角
- **导出**：PNG 下载或直接复制到剪贴板，清晰度默认跟随原图分辨率
- 拖拽、粘贴（Ctrl/⌘ + V）、多选上传都支持；设置自动记住

## 本地运行

需要 Node.js 20+。

```bash
git clone https://github.com/woodti/shotframe.git
cd shotframe
npm install
npm run dev
```

## 部署

`npm run build` 生成的 `dist/` 是纯静态文件，放到任何静态托管上都能用（资源路径是相对的，放子目录也没问题）。

- **GitHub Pages**：Fork 后在仓库 Settings → Pages 里把 Source 选成 *GitHub Actions*，推送到 `main` 就会自动部署（工作流见 `.github/workflows/pages.yml`）
- **Vercel / Netlify / Cloudflare Pages**：导入仓库，构建命令 `npm run build`，输出目录 `dist`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woodti/shotframe)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/woodti/shotframe)

## 实现

- Vite + React + TypeScript，没有其他运行时依赖（图标用 lucide-react）
- 所有设备边框都是在 Canvas 上原创绘制的近似造型，没有使用任何厂商的官方素材图
- Canvas 2D 没有透视变换，3D 倾斜是把画面切成细条、每条按深度缩放后拼出来的
- 渲染引擎在 [`src/render.ts`](./src/render.ts)，界面在 [`src/App.tsx`](./src/App.tsx)

## 声明

iPhone、iPad、MacBook 等是 Apple Inc. 的商标。本项目与 Apple 无关，边框只是通用设备造型。

## 协议

[MIT](./LICENSE)
