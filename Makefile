# Copyright 2026 KDesign contributors
# Licensed to the public under the Apache License 2.0.

include $(TOPDIR)/rules.mk

LUCI_TITLE:=KDesign theme settings
LUCI_DEPENDS:=+luci-base +luci-theme-kdesign
LUCI_PKGARCH:=all

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
