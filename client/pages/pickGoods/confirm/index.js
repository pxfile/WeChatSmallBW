//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
Page({
    data: {
        pick_goods_confirm: {},
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
            url: `${config.service.host}/weapp/pick_goods_confirm`,
            login: false,
            success(result) {
                that.setData({
                    pick_goods_confirm: result.data.data,
                })
            },
            fail(error) {
                util.showModel('加载失败', error);
                console.log('request fail', error);
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
