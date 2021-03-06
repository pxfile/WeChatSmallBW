//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        phone: '',
        items: [
            {
                icon: '../../assets/images/iconfont-addr.png',
                text: '收货地址',
                path: '/pages/address/userList/index?type=0',
                type: 0
            },
            {
                icon: '../../assets/images/iconfont-help.png',
                text: '更换账号',
                path: '/pages/changeAccount/index',
                type: 0
            },
            {
                icon: '../../assets/images/iconfont-kefu.png',
                text: '联系客服',
                path: '400-1999',
                type: 1
            },
            // {
            //     icon: '../../assets/images/iconfont-help.png',
            //     text: '常见问题',
            //     path: '/pages/help/list/index',
            // },
        ],
        settings: [
            {
                icon: '../../assets/images/iconfont-clear.png',
                text: '清除缓存',
                path: '0.0KB'
            },
            {
                icon: '../../assets/images/iconfont-about.png',
                text: '关于我们',
                path: '/pages/about/index'
            },
        ]
    },
    onLoad() {
        if (!app.WxService.getStorageSync('user_id')) {
            wx.redirectTo({
                url: '/pages/login/login'
            })
            return
        }
        this.setData({
            phone: app.WxService.getStorageSync('mobile')
        })
        this.getUserInfo()
        this.getStorageInfo()
    },
    navigateTo(e) {
        const type = e.currentTarget.dataset.type
        const path = e.currentTarget.dataset.path

        switch (type) {
            case 1:
                app.WxService.makePhoneCall({
                    phoneNumber: path
                })
                break
            default:
                app.WxService.navigateTo(path)
        }
    },
    getUserInfo() {
        const userInfo = app.globalData.userInfo

        if (userInfo) {
            this.setData({
                userInfo: userInfo
            })
            return
        }

        app.getUserInfo()
            .then(data => {
                console.log(data)
                this.setData({
                    userInfo: data
                })
            })
    },
    getStorageInfo() {
        app.WxService.getStorageInfo()
            .then(data => {
                console.log(data)
                this.setData({
                    'settings[0].path': `${data.currentSize}KB`
                })
            })
    },
    bindtap(e) {
        const index = e.currentTarget.dataset.index
        const path = e.currentTarget.dataset.path

        switch (index) {
            case 0:
                app.WxService.showModal({
                    title: '友情提示',
                    content: '确定要清除缓存吗？',
                })
                    .then(data => data.confirm == 1 && app.WxService.clearStorage())
                break
            default:
                app.WxService.navigateTo(path)
        }
    },
    logout() {
        app.WxService.showModal({
            title: '友情提示',
            content: '确定要退出吗？',
        })
            .then(data => data.confirm == 1 && this.signOut())
    },
    signOut() {
        util.showBusy('正在退出登录...')
        app.HttpService.userLogout({
            mobile: app.WxService.getStorageSync('mobile'),
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
                app.WxService.removeStorageSync('user_id')
                app.WxService.removeStorageSync('token')
                app.WxService.redirectTo('/pages/index/index')
                app.WxService.switchTab('/pages/index/index')
            } else {
                util.showModel('退出登录失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
})