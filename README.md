# KDesign 主题设置

`luci-app-kdesign` 是 [luci-theme-kdesign](https://github.com/kindyear/luci-theme-kdesign) 的 LuCI 可视化设置插件，用于在不编辑配置文件的情况下调整主题品牌和登录页外观。

## 功能

- 修改侧栏品牌名称、副标题和 Logo URL
- 修改登录页标题与副标题
- 选择内置背景、自定义图片 URL 或 Bing 每日壁纸
- 上传不超过 5 MiB 的 JPEG、PNG、WebP 或 GIF 背景图片
- 设置登录页背景色和图片暗化程度
- 设置桌面端侧栏默认折叠状态
- 修改页面底部文字
- 提供英文源界面和简体中文语言包

配置保存在 `/etc/config/kdesign`。删除配置或未安装本插件时，KDesign 主题会继续使用内置默认值。

## 依赖关系

本插件建议与 [luci-theme-kdesign](https://github.com/kindyear/luci-theme-kdesign) 一起安装：

- `luci-theme-kdesign`：主题本体
- `luci-app-kdesign`：可视化设置页面
- `luci-i18n-kdesign-zh-cn`：简体中文翻译

两个主包不声明强制依赖，可以在私有 feed、离线环境或不同升级周期中分别构建和更新。未安装主题时，本插件保存的设置不会影响其他 LuCI 主题。

## 安装

从 GitHub Releases 下载构建产物后执行：

```sh
opkg install ./luci-app-kdesign_*.ipk
opkg install ./luci-i18n-kdesign-zh-cn_*.ipk
```

安装完成后进入 **系统 → KDesign主题设置**。

主题本体请从 [luci-theme-kdesign Releases](https://github.com/kindyear/luci-theme-kdesign/releases) 下载并安装。

## 登录背景

背景来源支持：

- **内置背景**：使用主题默认登录页背景
- **上传图片**：浏览器和路由器端双重校验格式与 5 MiB 大小限制
- **自定义 URL**：填写路由器本地绝对 Web 路径或 HTTP(S) 地址
- **Bing 每日壁纸**：由路由器下载并缓存在本地，启用后每六小时检查一次更新

外部 URL 会由访问 LuCI 的浏览器直接请求。建议优先使用本地上传或 Bing 缓存，以避免浏览器跨域、远端失效或隐私问题。

## 语言

界面源文本使用英文，简体中文翻译位于 `po/zh_Hans/kdesign.po`。通过 LuCI/OpenWrt 构建系统会生成：

- `luci-app-kdesign`
- `luci-i18n-kdesign-zh-cn`

## OpenWrt SDK 构建

将仓库放入 `feeds/luci/applications/luci-app-kdesign` 或自定义 LuCI feed，再通过 OpenWrt 构建系统选择软件包。

仓库内 GitHub Actions 当前使用 OpenWrt 24.10 x86_64 SDK 构建适用于 opkg 的 IPK。普通推送到 `main` 会执行校验和构建；推送 `v*` 标签会自动创建 GitHub Release，并上传插件、简体中文语言包和 `SHA256SUMS`。

示例：

```sh
git tag v0.1.0
git push origin v0.1.0
```

## 安全说明

- 上传文件会在浏览器端检查 MIME 类型和大小，并由路由器端再次检查文件头和大小。
- 支持 JPEG、PNG、WebP 和 GIF，单个文件最大 5 MiB。
- Bing 下载结果会检查 URL、文件大小和 JPEG 文件头后再替换本地缓存。
- 插件的 rpcd ACL 仅开放指定临时上传路径与两个 KDesign 后台脚本。

## 许可证

本项目使用 Apache License 2.0。
