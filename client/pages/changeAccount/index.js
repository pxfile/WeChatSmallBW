var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const App = getApp()

Page({
    data: {
        logged: !1,
        phoneNumber: '',
        autoCode: '',
        infoMess: '',
    },

    login() {
        this.signIn(this.goIndex)
    },
    goIndex() {
        App.WxService.switchTab('/pages/index/index')
    },
    showModal() {
        App.WxService.showModal({
            title: '友情提示',
            content: '获取用户登录状态失败，请重新登录',
            showCancel: !1,
        })
    },
    wechatDecryptData() {
        let code

        App.WxService.login()
            .then(data => {
                console.log('wechatDecryptData', data.code)
                code = data.code
                return App.WxService.getUserInfo()
            })
            .then(data => {
                return App.HttpService.wechatDecryptData({
                    encryptedData: data.encryptedData,
                    iv: data.iv,
                    rawData: data.rawData,
                    signature: data.signature,
                    code: code,
                })
            })
            .then(data => {
                console.log(data)
            })
    },
    wechatSignIn(cb) {
        if (App.WxService.getStorageSync('token')) return
        App.WxService.login()
            .then(data => {
                console.log('wechatSignIn', data.code)
                return App.HttpService.wechatSignIn({
                    code: data.code
                })
            })
            .then(res => {
                const data = res.data
                console.log('wechatSignIn', data)
                if (data.meta.code == 0) {
                    App.WxService.setStorageSync('token', data.data.token)
                    cb()
                } else if (data.meta.code == 40029) {
                    App.showModal()
                } else {
                    App.wechatSignUp(cb)
                }
            })
    },
    wechatSignUp(cb) {
        App.WxService.login()
            .then(data => {
                console.log('wechatSignUp', data.code)
                return App.HttpService.wechatSignUp({
                    code: data.code
                })
            })
            .then(res => {
                const data = res.data
                console.log('wechatSignUp', data)
                if (data.meta.code == 0) {
                    App.WxService.setStorageSync('token', data.data.token)
                    cb()
                } else if (data.meta.code == 40029) {
                    App.showModal()
                }
            })
    },
    signIn(cb) {
        this.loginWx(cb)
        // App.HttpService.signIn({
        //     username: 'admin',
        //     password: '123456',
        // })
        //     .then(res => {
        //         const data = res.data
        //         console.log(data)
        //         if (data.meta.code == 0) {
        //             App.WxService.setStorageSync('token', data.data.token)
        //             cb()
        //         }
        //     })
    },
    // 用户登录示例
    loginWx(cb) {
        if (this.data.logged) return

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    that.setData({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
                            })
                            App.WxService.setStorageSync('token', result.data.data)
                            cb()
                        },

                        fail(error) {
                            util.showModel('加载失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    //用户名和密码输入框事件
    phoneInput: function (e) {
        // console.log(e)
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    autoCodeInput: function (e) {
        this.setData({
            autoCode: e.detail.value
        })
    },
    //登录按钮点击事件，调用参数要用：this.data.参数；
    //设置参数值，要使用this.setData({}）方法
    loginBtnClick: function (a) {
        console.log(a)
        var that = this
        if (this.data.phoneNumber.length == 0 || this.data.autoCode.length == 0) {
            this.setData({
                infoMess: '温馨提示：用户名或验证码不能为空！',
            })
        } else {
            this.signIn(this.goIndex)
            // wx.request({
            //     url: 'http://www.tpshop.com/index.php?m=Api&c=User&a=login',
            //     data: {
            //         username: this.data.phoneNumber,
            //         password: this.data.autoCode,
            //         unique_id: '123456'
            //     },
            //     header: {
            //         'content-type': 'application/json'
            //     },
            //     success: function (res) {
            //         // console.log(res.data.result)
            //         if (res.data.status == -1) {
            //             userName:'缺少参数'
            //         } else {
            //             //存用户session
            //             // wx.setStorageSync('token', res.data.result.token)
            //             // wx.setStorageSync('user_id', res.data.result.user_id)
            //             // wx.setStorageSync('name', that.data.userN)
            //             // wx.setStorageSync('pwd', that.data.passW)
            //
            //
            //             wx.setStorage({
            //                 key: 'name',
            //                 data: res.data.result.mobile,
            //             })
            //             wx.setStorage({
            //                 key: 'token',
            //                 data: res.data.result.token,
            //             })
            //             //  wx.switchTab({
            //             wx.redirectTo({
            //                 url: '../my/my?name=' + res.data.result.mobile + '&pwd=' + that.data.passW + ''
            //             })
            //         }
            //     }
            // })
        }
    },
})