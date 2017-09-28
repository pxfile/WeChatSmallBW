//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({
    data: {
        date: '',
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
    fetchListData(id) {
        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/order_confirm`,
            login: false,
            success(result) {
                that.setData({
                    goods_detail: result.data.data,
                    date: result.data.data.time,
                })
            },
            fail(error) {
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

    //事件处理函数
    bindViewTap(e){
        wx.navigateTo({
            url: '../detail/detail?id=' + e.target.dataset.id
        })
    },

})
