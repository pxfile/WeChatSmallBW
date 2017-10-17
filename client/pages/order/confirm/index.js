//index.js
//获取应用实例
var app = getApp()
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
            icon: '../../../assets/images/iconfont-empty.png',
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
            this.payOff()
        }
    },

    /**
     * 发起支付
     */
    payOff() {
        var that = this;
        wx.login({
            success: function (res) {
                that.getOpenId(res.code);
            }
        });

    },
    //获取openid
    getOpenId (code) {
        var that = this;
        wx.request({
            url: 'https://www.see-source.com/weixinpay/GetOpenId',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {'code': code},
            success: function (res) {
                var openId = res.data.openid;
                that.xiadan(openId);
            }
        })
    },
    //下单
    xiadan (openId) {
        var that = this;
        wx.request({
            url: 'https://www.see-source.com/weixinpay/xiadan',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {'openid': openId},
            success: function (res) {
                var prepay_id = res.data.prepay_id;
                console.log("统一下单返回 prepay_id:" + prepay_id);
                that.sign(prepay_id);
            }
        })
    },
    //签名
    sign (prepay_id) {
        var that = this;
        wx.request({
            url: 'https://www.see-source.com/weixinpay/sign',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {'repay_id': prepay_id},
            success: function (res) {
                that.requestPayment(res.data);

            }
        })
    },
    //申请支付
    requestPayment (obj) {
        var that = this
        wx.requestPayment({
            'timeStamp': obj.timeStamp,
            'nonceStr': obj.nonceStr,
            'package': obj.package,
            'signType': obj.signType,
            'paySign': obj.paySign,
            'success': function (res) {
                that.fetchPayOrder(this.data.orderId, this.data.price);
            },
            'fail': function (res) {
            }
        })
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
