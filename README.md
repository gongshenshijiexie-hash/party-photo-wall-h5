# 派对连续抓拍照片墙H5

这是一个9:16竖屏派对照片定格动画。

## 动画流程

四张派对照片依次全屏出现：

1. 全屏抓拍
2. 相机闪光
3. 画面定格
4. 缩小成拍立得照片
5. 飞入不同位置
6. 最终组成不规则照片墙

## 素材

- assets/images/01_party.png
- assets/images/02_party.png
- assets/images/03_party.png
- assets/images/04_party.png

## 技术方案

- 原生HTML
- 原生CSS
- 原生JavaScript
- 不使用CDN
- 不使用第三方框架
- 所有素材使用本地相对路径

## 本地预览

在项目根目录运行：

python3 -m http.server 8765

然后在浏览器打开：

http://127.0.0.1:8765

## 构建离线单文件

在项目根目录运行：

```bash
python3 build_standalone.py
```

构建结果为 `dist/party-photo-wall.html`。该文件会内嵌项目的 CSS、JavaScript
和四张 PNG 图片，可以通过 `file://` 直接离线运行。生成文件仅作为最终交付物，
不提交到项目仓库。

## 详细需求

见：

docs/H5-spec.txt

## Codex开发规则

见：

AGENTS.md
