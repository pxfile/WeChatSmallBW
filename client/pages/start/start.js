const app = getApp()

Page({
    data: {
        indicatorDots: !1,
        autoplay: !1,
        current: 0,
        interval: 3000,
        duration: 1000,
        circular: !1,
    },
    onLoad() {
    },
    onShow() {
    },
    bindload(e) {
        setTimeout(app.WxService.getStorageSync('user_id') ? this.goIndex : this.goLogin, 3000)
    },
    goIndex() {
        app.WxService.switchTab('/pages/index/index')
    },
    goLogin() {
        app.WxService.redirectTo('/pages/login/login')
    },
})
