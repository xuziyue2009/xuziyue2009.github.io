# xuziyue2009.github.io

xzy 的个人网站。

## 功能

- **小工具** — 离子反应模拟器、质数判断、分解质因数、设备可靠性历史记录
- **小游戏** — 数字华容道、找不同（长字符串对比）
- **博客** — 笔记与杂谈
- **文件下载**
- **全站搜索**
- **亮色/暗色主题** — 一键切换，自动记忆
- **PWA 支持** — 可安装到桌面，离线访问

## 链接

🔗 [xuziyue2009.github.io](https://xuziyue2009.github.io/)

## 发布清单

更新网站后，建议执行以下步骤：

1. 将 `style.css?v=XXXXXX`、`components.js?v=XXXXXX`、`script.js?v=XXXXXX` 中的版本号更新为当天日期（格式 `YYYYMMDD`），确保浏览器获取最新版本而非缓存旧版
2. 更新 `sw.js` 中的 `CACHE_NAME` 版本号，使 Service Worker 刷新缓存
3. 如果新增了页面，记得更新 `searchIndex.json` 和 `sitemap.xml`
