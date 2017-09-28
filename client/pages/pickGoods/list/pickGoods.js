var app = getApp()
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        onpulldownrefresh: '下拉刷新...',
        onreachbottom: '上拉加载更多...',
    },

    onLoad() {
        this.fetchTabData();
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchTabData();
        wx.stopPullDownRefresh();
    },
    /**
     * 上拉加载更多
     */
    onReachBottom() {
        this.setData({
            start_num: this.data.list.length,
        }),
            this.fetchListDataMore();
    },

    /**
     * 请求商品列表
     */
    fetchTabData: function () {
        console.log(this.data.start_num);

        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/pick_goods_list`,
            login: false,
            success(result) {
                util.showSuccess('加载成功')
                that.setData({
                    list: result.data.data,
                })
            },
            fail(error) {
                util.showModel('加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    /**
     * 上拉加载更多
     */
    fetchListDataMore() {
        if (this.data.list.length === 0) return
        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/pick_goods_list`,
            login: false,
            success(result) {
                util.showSuccess('加载成功')
                that.setData({
                    list: that.data.list.concat(result.data.data),
                })
            },
            fail(error) {
                util.showModel('加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    //事件处理函数
    clickPickBtn(e){
        wx.navigateTo({
            url: '../confirm/index?id=' + e.target.dataset.id
        })
    },
})
