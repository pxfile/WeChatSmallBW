const app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        id: '',
        name: '',
        mobile: '',
        area: '',
        address: '',
        isdefault: 0,
        type: 0,
    },
    onLoad(option) {
        if (decodeURIComponent(option.type) > 0) {
            this.setData({
                id: decodeURIComponent(option.id),
                name: decodeURIComponent(option.name),
                mobile: decodeURIComponent(option.mobile),
                area: decodeURIComponent(option.area),
                address: decodeURIComponent(option.address),
                isdefault: decodeURIComponent(option.isdefault),
                type: decodeURIComponent(option.type),
            })
        }
    },

    //用户名输入框事件
    nameInput(e){
        console.log(e)
        this.setData({
            name: e.detail.value
        })
    },

    //电话号码输入框事件
    mobileInput(e){
        console.log(e)
        this.setData({
            mobile: e.detail.value
        })
    },

    //详细地址输入框事件
    addressInput(e){
        console.log(e)
        this.setData({
            address: e.detail.value
        })
    },

    /**
     * 设置默认
     * @param e
     */
    listenerSwitch(e){
        console.log('switch类型开关当前状态-----', e.detail.value);
        if (e.detail.value && this.data.id) {
            this.setDefaultAddress()
        }
        this.setData({
            isdefault: e.detail.value ? 0 : 1
        })
    },

    /**
     * 保存并使用
     * @param e
     * @returns {boolean}
     */
    save(e) {
        if (this.data.name.length == 0) {
            util.showModel('温馨提示', '联系人不能为空！')
        } else if (this.data.mobile.length == 0) {
            util.showModel('温馨提示', '联系方式不能为空！')
        } else if (this.data.area.length == 0) {
            util.showModel('温馨提示', '所在地区不能为空！')
        } else if (this.data.address.length == 0) {
            util.showModel('温馨提示', '详细地址不能为空！')
        } else {
            var that = this
            if (this.data.type > 0) {
                //编辑地址
                app.HttpService.updateUserAddress({
                    addressId: that.data.id,
                    name: that.data.name,
                    mobile: that.data.mobile,
                    area: that.data.area,
                    address: that.data.address,
                    isDef: that.data.isdefault
                }).then(res => {
                    const data = res.data
                    console.log(data)
                    if (data.code == 0) {
                        util.showSuccess(data.message)
                        that.showToast('修改地址成功')
                    } else {
                        util.showModel('修改地址失败', data.message);
                        console.log('request fail', data.message);
                    }
                })
            } else {
                //添加地址
                app.HttpService.addUserAddress({
                    userId: app.WxService.getStorageSync('user_id'),
                    name: that.data.name,
                    mobile: that.data.mobile,
                    area: that.data.area,
                    address: that.data.address,
                    isDef: that.data.isdefault
                }).then(res => {
                    const data = res.data
                    console.log(data)
                    if (data.code == 0) {
                        util.showSuccess(data.message)
                        that.showToast('添加地址成功')
                    } else {
                        util.showModel('添加地址失败', data.message);
                        console.log('request fail', data.message);
                    }
                })
            }
        }
    },
    /**
     * 删除
     */
    delete(e) {
        var that = this
        wx.showModal({
            title: '温馨提示',
            content: '确定要删除吗?',
            success: function (res) {
                if (res.confirm) {
                    that.deleteAddress()
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    /**
     * 删除地址
     */
    deleteAddress(){
        var that = this
        app.HttpService.deleteUserAddress({
            addressId: that.data.id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
                that.showToast('删除地址成功')
            } else {
                util.showModel('删除地址失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    /**
     * 设置默认地址
     */
    setDefaultAddress() {
        app.HttpService.setAddressDef({
            userId: app.WxService.getStorageSync('user_id'),
            addressId: this.data.id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
            } else {
                util.showModel('设置默认失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    /**
     * show Toast and navigate back
     * @param message
     */
    showToast(message) {
        app.WxService.showToast({
            title: message,
            icon: 'success',
            duration: 1500,
        })
            .then(() => app.WxService.navigateBack())
    },

    /**
     * 选择所在地区
     */
    chooseLocation() {
        var _page = this;
        wx.chooseLocation({
            success: res=> {
                console.log(res);
                if (res.address) {
                    this.setData({
                        area: res.address
                    })
                }
            },
            fail(){
                _page.getSetting()
            },
            complete(){

            }
        })
    },

    getSetting(){
        var _page = this;
        // 检查当前设置
        wx.getSetting({
            success(res) {
                if (!res['scope.userLocation']) {
                    console.log(res)
                    // 设置询问
                    _page.openSetting()
                } else {
                    _page.chooseAddress()
                }
            }
        })
    },

    openSetting(){
        var _page = this;
        wx.openSetting({
            success: function (res) {
                if (res.authSetting["scope.userLocation"]) {
                    //这里是授权成功之后 填写你重新获取数据的js
                    _page.chooseAddress()
                }
            }
        })
    },

    chooseAddress(){
        wx.chooseLocation({
            success: res=> {
                console.log(res);
                if (res.address) {
                    this.setData({
                        area: res.address
                    })
                }
            },
            fail(){
            },
            complete(){

            }
        })
    }
})