# Copyright 2026 KDesign contributors
# Licensed to the public under the Apache License 2.0.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=KDesign 主题设置
LUCI_DESCRIPTION:=为 luci-theme-kdesign 提供品牌名称、登录页背景、Bing 每日壁纸和侧栏默认状态等可视化配置。
# Keep the settings package independently buildable. It is harmless without
# KDesign and starts affecting the UI as soon as luci-theme-kdesign is present.
LUCI_DEPENDS:=+luci-base +uclient-fetch +jsonfilter
LUCI_PKGARCH:=all

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
