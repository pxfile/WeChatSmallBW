//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
Page({
    data: {
        goods_detail: {},
    },

    onLoad(option) {
        this.setData({
            id: option.id,
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
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    //事件处理函数
    clickConfirmBtn(e){
        wx.navigateTo({
            url: '../confirm/index?id=' + e.target.dataset.id
        })
    },
})
