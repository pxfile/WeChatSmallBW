//index.js
//获取应用实例
var app = getApp()
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({
    data: {
        date: '',
        address: '',
        storeManagerName: '',
        storePhone: '',
        showPickView: false,
        goods_detail: {},
        orderId: '',
        price: '',
        prompt: {
            hidden: !0,
        },
    },

    /**
     * 选择时间
     * @param e
     */
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        })
    },

    onLoad(option) {
        this.setData({
            id: option.id,
        })
        this.fetchListData(this.data.id)
    },
    /**
     * 请求订单列表
     */
    fetchListData(orderId) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getOrderDetail({
            orderId: orderId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    date: data.data.pickTime,
                    address: data.data.storeAddress,
                    storeManagerName: data.data.storeManagerName,
                    storePhone: data.data.storePhone,
                    goods_detail: data.data,
                    orderId: data.data.orderId,
                    price: data.data.payMoney,
                })
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code,
            })
        })
    },

    //选择自提时间
    selectPickTime(e){
        this.setData({
            showPickView: true,
        })
    },

    //选择自提地址
    selectAddress(e){
        wx.navigateTo({
            url: '/pages/address/index'
        })
    },

    //支付成功
    clickPay(e){
        if (this.data.orderId.length == 0 || this.data.price.length == 0) {
            util.showModel('温馨提示', '查无订单！');
        } else {
            this.fetchPayOrder(this.data.orderId, this.data.price);
        }
    },
    /**
     * 订单支付
     */
    fetchPayOrder(orderId, price) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getPayOrder({
            orderId: orderId,
            price: price,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.goToPaySuccess(orderId)
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    goToPaySuccess(orderId){
        wx.navigateTo({
            url: '/pages/pay/confirm/index?id=' + orderId
        })
    }
})
