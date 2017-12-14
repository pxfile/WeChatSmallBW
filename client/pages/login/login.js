var util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        logged: !1,
        phoneNumber: '',
        authCode: '',
        infoMess: '',
        userInfo: {},
        verifyCodeTime: '获取验证码',
        buttonDisable: false,
    },
    onLoad() {
        this.getUserInfo()
    },
    /**
     * 获取用户信息
     */
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
        var that = this
        if (that.data.buttonDisable) return;
        if (mobile.length == 0) {
            util.showModel('温馨提示', '手机号不能为空！')
        } else {
            var regMobile = /^1\d{10}$/;
            if (!regMobile.test(mobile)) {
                util.showModel('温馨提示', '手机号有误，请重新操作！');
                that.setData({
                    phoneNumber: ''
                })
                return;
            }

            var c = 60;
            var intervalId = setInterval(function () {
                c = c - 1;
                that.setData({
                    verifyCodeTime: c + 's后重发',
                    buttonDisable: true
                })
                if (c == 0) {
                    clearInterval(intervalId);
                    that.setData({
                        verifyCodeTime: '获取验证码',
                        buttonDisable: false
                    })
                }
            }, 1000)

            util.showBusy('正在发送验证码...')
            app.HttpService.sendCode({
                mobile: mobile,
            }).then(res => {
                const data = res.data
                console.log(data)
                if (data.code == 0) {
                    util.showSuccess(data.message)
                    // that.setData({
                    //     authCode: data.data.verificationCode
                    // })
                } else {
                    util.showModel('正在发送验证码失败', data.message);
                    console.log('request fail', data.message);
                }
            })
        }
    },

    /**
     *用户登录
     */
    getUserLogin(mobile, verificationCode, userName, userAvatar){
        var that = this
        if (this.data.phoneNumber.length == 0 || this.data.authCode.length == 0) {
            util.showModel('温馨提示', '手机号或验证码不能为空！')
        } else {
            util.showBusy('正在登录...')
            app.HttpService.userLogin({
                mobile: mobile,
                verificationCode: verificationCode,
                userName: userName,
                userAvatar: userAvatar
            }).then(res => {
                const data = res.data
                console.log(data)
                if (data.code == 0) {
                    util.showSuccess(data.message)
                    that.setStorageSyncData(data.data.userId, data.data.mobile, data.data.userPic, data.data.userName)
                    that.goIndex()
                } else {
                    util.showModel('登录失败', data.message);
                    console.log('request fail', data.message);
                }
            })
        }
    },
    /**
     * 保存用户信息
     */
    setStorageSyncData(userId, mobile, userPic, userName){
        app.WxService.setStorageSync('user_id', userId)
        app.WxService.setStorageSync('mobile', mobile)
        app.WxService.setStorageSync('userPic', userPic)
        app.WxService.setStorageSync('userName', userName)
    },
    /**
     * 跳转首页
     */
    goIndex() {
        app.WxService.switchTab('/pages/index/index')
    },
})