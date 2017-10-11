//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
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
    },

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
            orderId: 'O340865160adc4e3193d279cc7dcde707',
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
                })
            } else {
                util.showModel('加载失败', error);
                console.log('request fail', error);
            }
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
    paySuccess(e){
        wx.navigateTo({
            url: '/pages/pay/index?id=' + e.target.dataset.id
        })
    }
})
