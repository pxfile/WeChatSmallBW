//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        count_down_pay: '30:00',//等待支付倒计时文案显示
        order_cancel: false,//超时订单取消
        price: 0,
        payMoney: 0,
        goods_detail: {},
        addressDes: '',
        managerNameDes: '',
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad(option) {
        this.setData({
            orderId: decodeURIComponent(option.id),
            type: option.type,//0待付款，1已完成
            from: option.from,//0来自预下单，1来自订单列表
        })
        console.log("from" + option.from)
        this.fetchListData(this.data.orderId)
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
                    goods_detail: data.data,
                    addressDes: data.data.storeAddress ? '自提地址' : '收货地址',
                    managerNameDes: data.data.storeAddress ? '店长：' : '收件人：',
                    payMoney: data.data.payMoney,
                    price: !data.data.storeAddress ? util.accAdd(util.fMoney(data.data.payMoney, 2), util.fMoney(data.data.freightPrice, 2)) : util.fMoney(data.data.payMoney, 2),
                })
                that.countDownPayTime()
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code,
            })
        })
    },

    //支付等待时间的倒计时处理
    countDownPayTime(){
        var that = this;
        var c = this.data.from === 0 ? 30 * 60 : this.getCountDownPayTime() * 60;//等待30分钟
        console.log("倒计时：" + c)
        var intervalId = setInterval(function () {
            c = c - 1;
            var min = that.fillZeroPrefix(Math.floor(c / 60))
            var sec = that.fillZeroPrefix(Math.floor(c % 60))
            that.setData({
                count_down_pay: min + '：' + sec,//14：35
            })
            if (c == 0) {
                clearInterval(intervalId);
                that.setData({
                    order_cancel: true
                })
            }
        }, 1000)
    },

    /**
     * 获取当前时间-下单时间=订单倒计时
     * @returns {number}
     */
    getCountDownPayTime(){
        console.log("orderTime" + this.data.goods_detail.orderTime)
        var stringTime = this.data.goods_detail.orderTime;
        var currentDate = new Date();
        var differTime = currentDate.getTime() - new Date(stringTime).getTime()
        var remainTime = 30 - Math.floor(differTime / (60 * 1000))
        return remainTime > 0 ? remainTime : 30
    },

    // 位数不足补零
    fillZeroPrefix(num){
        return num < 10 ? "0" + num : num
    },

    //支付事件处理函数
    clickConfirmBtn(e){
        if (this.data.orderId.length == 0) {
            util.showModel('温馨提示', '查无订单！');
        } else {
            this.payOff()
        }
    },
    //取消订单
    clickCancelBtn(e){
        wx.showModal({
            title: '温馨提示',
            content: '确定要取消订单吗?',
            success: function (res) {
                if (res.confirm) {
                    wx.navigateBack();
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    /**
     * 登录发起支付
     */
    payOff() {
        var that = this;
        wx.login({
            success: function (res) {
                that.getOpenId(res.code);
                console.log('登录发起支付：---》》' + JSON.stringify(res))
            },
            fail: (res)=> {
                console.log('登录发起支付：---》》' + JSON.stringify(res))
            },
        });

    },
    //获取openid
    getOpenId (code) {
        var that = this
        app.HttpService.getOpenId({
            code: code,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                var openId = data.data.openid;
                //下单
                that.xiadan(openId);
                console.log('发起支付：---》》' + JSON.stringify(data))
            } else {
                console.log('获取openid：---》》' + JSON.stringify(data))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
    //下单
    xiadan (openId) {
        var that = this
        app.HttpService.payGetOrder({
            openId: openId,
            totFee: that.data.price,
            body: '百威-啤酒'
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                var prepay_id = data.data;
                console.log("统一下单返回 prepay_id:" + prepay_id);
                that.sign(prepay_id);
            } else {
                console.log('下单：---》》' + JSON.stringify(data))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
    //签名
    sign (prepay_id) {
        var that = this
        app.HttpService.paySign({
            repayId: prepay_id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.requestPayment(data.data);
                console.log('发起支付：---》》' + JSON.stringify(res))
            } else {
                console.log('签名：---》》' + JSON.stringify(res))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
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
            'success' (res) {
                that.fetchPayOrder(this.data.orderId, this.data.price);
            },
            'fail': function (res) {
                console.log('申请支付：---》》' + JSON.stringify(res))
            },
            complete: ()=> {
                console.log('申请支付结束')
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
                util.showSuccess(data.message)
                that.goToPaySuccess(orderId, data.code)
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    goToPaySuccess(orderId, type){
        wx.navigateTo({
            url: '/pages/pay/confirm/index?id=' + encodeURIComponent(orderId) + "&type=" + encodeURIComponent(type)
        })
    },
})
