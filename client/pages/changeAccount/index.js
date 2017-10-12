var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const App = getApp()

Page({
    data: {
        logged: !1,
        phoneNumber: '',
        authCode: '',
        infoMess: '',
        userInfo: {},
    },
    onLoad() {
        this.getUserInfo()
    },
    /**
     * 获取用户信息
     */
    getUserInfo() {
        const userInfo = App.globalData.userInfo

        if (userInfo) {
            this.setData({
                userInfo: userInfo
            })
            return
        }

        App.getUserInfo()
            .then(data => {
                console.log(data)
                this.setData({
                    userInfo: data
                })
            })
    },

    //发送验证码
    sendCode(e){
        this.sendAuthCode(this.data.phoneNumber)
    },

    //用户名和密码输入框事件
    phoneInput(e){
        console.log(e)
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    //验证码输入框事件
    autoCodeInput(e) {
        this.setData({
            authCode: e.detail.value
        })
    },
    //登录按钮点击事件，调用参数要用：this.data.参数；
    //设置参数值，要使用this.setData({}）方法
    loginBtnClick(a) {
        console.log(a)
        this.getUserLogin(this.data.phoneNumber, this.data.authCode, this.data.userInfo.nickName, this.data.userInfo.avatarUrl)
    },
    /**
     * 发送验证码
     */
    sendAuthCode(mobile) {
        util.showBusy('正在发送验证码...')
        var that = this
        App.HttpService.sendCode({
            mobile: mobile,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
                that.setData({
                    authCode: data.verificationCode
                })
            } else {
                util.showModel('正在发送验证码', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    /**
     *用户登录
     */
    getUserLogin(mobile, verificationCode, userName, userAvatar){
        var that = this
        if (this.data.phoneNumber.length == 0 || this.data.authCode.length == 0) {
            this.setData({
                infoMess: '温馨提示：用户名或验证码不能为空！',
            })
        } else {
            util.showBusy('正在登录...')
            App.HttpService.userLogin({
                mobile: mobile,
                verificationCode: verificationCode,
                userName: userName,
                userAvatar: userAvatar
            }).then(res => {
                const data = res.data
                console.log(data)
                if (data.code == 0) {
                    util.showSuccess(data.message)
                    //存用户session
                    wx.setStorageSync('user_id', data.userId)
                    wx.setStorageSync('mobile', data.mobile)
                    wx.setStorageSync('userPic', data.userPic)
                    wx.setStorageSync('userName', data.userName)
                    that.goIndex()
                } else {
                    util.showModel('登录失败', data.message);
                    console.log('request fail', data.message);
                }
            })
        }
    },
    goIndex() {
        App.WxService.switchTab('/pages/index/index')
    },
})