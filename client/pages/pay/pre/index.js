//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({
    data: {
        date: '',
        storeId: '',
        address: '',
        storeManagerName: '',
        storePhone: '',
        showPickView: false,
        goodsList: [],
        payMoney: 0,
        orderId: '',
        price: '',
        selectAddress: true
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
        var list = wx.getStorageSync('confirmGoods');
        var pickTime = util.formatDate(new Date());
        console.log("pickTime--" + pickTime)
        this.setData({
            date: pickTime,
            address: '请选择自提地址',
            storeManagerName: '请选择自提地址',
            storePhone: '请选择自提地址',
            goodsList: list,
            payMoney: option.payMoney,
        })
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

    //确认订单
    getConfirmOrder(e){
        var userId = app.WxService.getStorageSync('user_id')
        this.fetchConfirmOrder(this.data.storeId, userId, this.data.date, this.data.goodsList);
    },

    /**
     * 预下单
     */
    fetchConfirmOrder(storeId, userId, pickTime, goodsList) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getConfirmOrder({
            storeId: 'S21c2d5c2ce67467fbf113bbc92b16bc8',
            userId: userId,
            pickTime: '2017-10-1',
            goodsList: '[{ "goodsId" : "G9e363fae1b08493286acd4d862f7a5e3", "goodsNum" : 20 }, { "goodsId" : "G1de330af1b3e41dda4a47be656f739ce", "goodsNum" : 50 } ]'
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                //TODO
                that.setData({
                    orderId: data.data.orderId,
                    price: data.data.price
                })
                that.goToOrderDetail();
            } else {
                util.showModel('加载失败', error);
                console.log('request fail', error);
            }
        })
    },
    /**
     * 跳转订单详情
     */
    goToOrderDetail(){
        app.WxService.navigateTo('/pages/order/detail/index?id=' + this.data.orderId + '&type=0')
    }
})
