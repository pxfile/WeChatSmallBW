//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        count_down_pay: '30:00',//等待支付倒计时文案显示
        order_cancel: false,//超时订单取消
        goods_detail: {},
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad(option) {
        this.setData({
            id: decodeURIComponent(option.id),
            type: option.type
        })
        this.fetchListData(this.data.id, this.data.type)
    },

    /**
     * 请求订单列表
     */
    fetchListData(id, type) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getOrderDetail({
            orderId: id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    goods_detail: data.data,
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
        var c = 30 * 60;//等待30分钟
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

    // 位数不足补零
    fillZeroPrefix(num){
        return num < 10 ? "0" + num : num
    },

    //事件处理函数
    clickConfirmBtn(e){
        wx.navigateTo({
            url: '../confirm/index?id=' + encodeURIComponent(e.target.dataset.id)
        })
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
    }
})
