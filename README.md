# luci-app-kdesign

KDesign 主题的 LuCI 配置插件。当前支持：

- 自定义侧栏品牌名称、副标题和 Logo URL
- 自定义登录页标题、副标题、背景图片、背景色和遮罩强度
- 上传不超过 5 MiB 的 JPEG、PNG、WebP 或 GIF 背景图片
- 选择 Bing 每日壁纸并在路由器本地缓存，每六小时检查更新
- 设置桌面端侧栏的默认折叠状态
- 自定义页面底部文字

配置保存在 `/etc/config/kdesign`。未安装本插件或删除配置时，`luci-theme-kdesign` 会继续使用内置默认值。

请与 `luci-theme-kdesign` 一同安装；两个包不声明强制依赖，因此可以在私有 feed 或离线环境中分别构建、升级。

## 语言

界面源文本使用英文，简体中文翻译位于 `po/zh_Hans/kdesign.po`。通过 LuCI/OpenWrt 构建系统编译时会同时生成：

- `luci-app-kdesign`：设置插件与英文源文本
- `luci-i18n-kdesign-zh-cn`：简体中文语言包

背景图片和 Logo 可填写路由器本地的绝对 Web 路径（推荐），也可填写 `http://` 或 `https://` URL。外部 URL 会由访问 LuCI 的浏览器直接请求。
