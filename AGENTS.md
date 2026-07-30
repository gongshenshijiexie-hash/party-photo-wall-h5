# Codex开发规则

请先完整阅读：

1. README.md
2. docs/H5-spec.txt
3. index.html
4. css/style.css
5. js/main.js
6. assets/images中的四张照片

开发要求：

- 只使用原生HTML、CSS和JavaScript。
- 不使用任何CDN或第三方框架。
- 不修改或重命名原始图片。
- 不添加标题、Logo、按钮和说明文字。
- 不创建重复页面。
- 保持9:16移动端布局。
- 页面加载后自动播放。
- 点击或轻触页面完整重播。
- 快速连续点击不能叠加动画。
- 所有计时器必须集中管理，并在重播前清理。
- 支持prefers-reduced-motion。
- 先完成index.html项目版。
- 暂时不要生成Base64或standalone.html。
- 完成后执行语法检查、资源检查和本地服务器检查。
- 浏览器工具不可用时要明确说明，不得伪造截图。
- 创建Pull Request，但不要直接合并。
