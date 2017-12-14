//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad(option) {
        this.setData({
            type: option.type//0,查看我的地址，1选择我的地址
        })
        this.fetchListData(false);
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(false),
            wx.stopPullDownRefresh();
    },

    /**
     * 上拉加载更多
     */
    onReachBottom() {
        this.setData({
            start_num: this.data.list.length,
        }),
            this.fetchListDataMore();
    },

    /**
     * 请求自提地址列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(isReachBottom) {
        util.showBusy('正在加载...')

        var that = this
        app.HttpService.getUserAddress({
            userId: app.WxService.getStorageSync('user_id')
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        list: that.data.list.concat(data.data),
                    })
                } else {
                    that.setData({
                        list: data.data,
                    })
                }
            } else {
                // util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code && (!isReachBottom || that.data.list),
            })
        })
    },

    /**
     * 上拉加载更多
     * @param tabtype
     */
    fetchListDataMore() {
        if (this.data.list.length === 0) return
        this.fetchListData(true)
    },

    /**
     * 选择地址
     * @param e
     */
    selectAddress(e){
        if (this.data.type == 0) {
            return
        }
        const edata = e.currentTarget.dataset;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        //快递地址
        prevPage.setData({
            storeId: edata.id,
            recipientAddress: edata.area + edata.address,
            recipient: edata.name,
            recipientPhone: edata.mobile,
            freightPrice: util.rd(10, 50),
            selectFreightAddress: false
        })
        wx.navigateBack()
    },

    /**
     * 编辑
     * @param e
     */
    toAddressEdit(e) {
        if (this.data.type != 0) {
            return
        }
        console.log(e)
        app.WxService.navigateTo('/pages/address/edit/index?id=' +
            encodeURIComponent(e.currentTarget.dataset.id) + '&name=' +
            encodeURIComponent(e.currentTarget.dataset.name) + '&mobile=' +
            encodeURIComponent(e.currentTarget.dataset.mobile) + '&area=' +
            encodeURIComponent(e.currentTarget.dataset.area) + '&address=' +
            encodeURIComponent(e.currentTarget.dataset.address) + '&isdefault=' +
            encodeURIComponent(e.currentTarget.dataset.isdefault) + '&type=1')
    },

    /**
     * 添加
     * @param e
     */
    toAddressAdd(e) {
        if (this.data.type != 0) {
            return
        }
        console.log(e)
        app.WxService.navigateTo('/pages/address/edit/index?type=0')
    },

    /**
     * 设置默认地址
     * @param e
     */
    setDefaultAddress(e) {
        if (this.data.type != 0) {
            return
        }
        var that = this
        const id = e.currentTarget.dataset.id
        app.HttpService.setAddressDef({
            userId: app.WxService.getStorageSync('user_id'),
            addressId: id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
                that.onPullDownRefresh()
            } else {
                util.showModel('设置默认失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    /**
     * 删除
     */
    toAddressDelete(e) {
        var that = this
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '温馨提示',
            content: '确定要删除吗?',
            success: function (res) {
                if (res.confirm) {
                    that.deleteAddress(id)
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    /**
     * 删除地址
     */
    deleteAddress(id){
        app.HttpService.deleteUserAddress({
            addressId: id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
            } else {
                util.showModel('删除地址失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
})
