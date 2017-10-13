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
        selectGoods: [],
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
        console.log("list--" + list.length)
        this.setData({
            date: pickTime,
            address: '请选择自提地址',
            storeManagerName: '请选择自提地址',
            storePhone: '请选择自提地址',
            goodsList: list,
            payMoney: option.payMoney,
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
        console.log("this.data.storeId.length--" + this.data.storeId.length)
        if (this.data.storeId.length == 0) {
            util.showModel('温馨提示', '自提地址不能为空！');
        } else {
            this.getSelectGoods()
            this.fetchConfirmOrder(this.data.storeId, app.WxService.getStorageSync('user_id'), this.data.date, JSON.stringify(this.data.selectGoods));
        }
    },

    getSelectGoods(){
        var allGoods = this.data.goodsList;
        var selectList = [];
        for (var i = 0; i < allGoods.length; i++) {
            var goodsParam = new this.GoodsParam(allGoods[i].goodsId, allGoods[i].num)
            selectList.push(goodsParam)
        }

        this.setData({
            selectGoods: selectList
        })
    },

    /**
     * 选择商品列表的参数
     * @param goodsId
     * @param goodsNum
     * @constructor
     */
    GoodsParam(goodsId, goodsNum){
        this.goodsId = goodsId;
        this.goodsNum = goodsNum;
    },

    /**
     * 预下单
     */
    fetchConfirmOrder(storeId, userId, pickTime, goodsList)
    {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getConfirmOrder({
            storeId: storeId,
            userId: userId,
            pickTime: pickTime,
            goodsList: goodsList
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    orderId: data.data.orderId,
                    price: data.data.price
                })
                that.goToOrderDetail();
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    }
    ,
    /**
     * 跳转订单详情
     */
    goToOrderDetail()
    {
        app.WxService.navigateTo('/pages/order/detail/index?id=' + this.data.orderId + '&type=0')
    }
})
