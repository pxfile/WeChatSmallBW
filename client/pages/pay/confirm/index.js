//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        goods_detail: {},
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
        icon_src: '',
        pay_des: '',
    },

    onLoad(option) {
        var id = decodeURIComponent(option.id)
        var type = decodeURIComponent(option.type)
        this.setData({
            id: id,
            type: type,
            icon_src: type == 0 ? '../../../assets/images/iconfont-complete.png' : '../../../assets/images/iconfont-warning.png',
            pay_des: type == 0 ? '支付成功' : '支付失败',
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
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code,
            })
        })
    },
})
