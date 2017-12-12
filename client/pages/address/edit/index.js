const App = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        id: '',
        name: '',
        mobile: '',
        area: '',
        address: '',
        isdefault: '',
        type: 0,
        is_def: 0,
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
                is_def: decodeURIComponent(option.isdefault) == 0,
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
        // const params = e.detail.value
        // const id = this.data.id
        //
        // console.log(params)
        //
        // if (!this.WxValidate.checkForm(e)) {
        //     const error = this.WxValidate.errorList[0]
        //     App.WxService.showModal({
        //         title: '友情提示',
        //         content: `${error.param} : ${error.msg}`,
        //         showCancel: !1,
        //     })
        //     return false
        // }
        //
        // // App.HttpService.putAddress(id, params)
        // this.address.updateAsync({id: id}, params)
        //     .then(res => {
        //         const data = res.data
        //         console.log(data)
        //         if (data.meta.code == 0) {
        //             this.showToast(data.meta.message)
        //         }
        //     })
        if (this.data.name.length == 0) {
            util.showModel('温馨提示', '联系人不能为空！')
        } else if (this.data.mobile.length == 0) {
            util.showModel('温馨提示', '联系方式不能为空！')
        } else if (this.data.area.length == 0) {
            console.log('area-----', this.data.area);
            util.showModel('温馨提示', '所在地区不能为空！')
        } else if (this.data.address.length == 0) {
            util.showModel('温馨提示', '详细地址不能为空！')
        } else {
            if (this.data.type > 0) {
                //编辑地址
            } else {
                //添加地址
            }
            // var userAddress = new this.UserAddress(this.data.id, this.data.name, this.data.mobile, this.data.area, this.data.address, this.data.isdefault)
            this.showToast('保存成功')
        }
    },
    /**
     * 删除
     */
    delete(e) {
        // this.address.deleteAsync({id: this.data.id})
        //     .then(res => {
        //         const data = res.data
        //         console.log(data)
        //         if (data.meta.code == 0) {
        //             this.showToast(data.meta.message)
        //         }
        //     })
        var that = this
        wx.showModal({
            title: '温馨提示',
            content: '确定要删除吗?',
            success: function (res) {
                if (res.confirm) {
                    that.showToast('删除成功')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    showToast(message) {
        App.WxService.showToast({
            title: message,
            icon: 'success',
            duration: 1500,
        })
            .then(() => App.WxService.navigateBack())
    },
    /**
     * 选择所在地区
     */
    chooseLocation() {
        App.WxService.chooseLocation()
            .then(data => {
                console.log(data)
                if (data.address) {
                    this.setData({
                        area: data.address
                    })
                }
            })
    },
})