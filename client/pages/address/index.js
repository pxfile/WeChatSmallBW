//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        longitude: "",
        dimension: "",
        start_num: 0,
        list: [],
    },

    onLoad() {
        this.fetchListData();
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(this.data.longitude, this.data.dimension),
            wx.stopPullDownRefresh();
    },

    /**
     * 上拉加载更多
     */
    onReachBottom() {
        this.setData({
            start_num: this.data.list.length,
        }),
            this.fetchListDataMore(this.data.longitude, this.data.dimension);
    },

    /**
     * 请求订单列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(longitude, dimension) {
        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/address_list`,
            login: false,
            success(result) {
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
     * @param tabtype
     */
    fetchListDataMore(longitude, dimension) {
        console.log(this.data.start_num + tabType);
        if (this.data.list.length === 0) return

        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/order_list_` + tabType,
            login: false,
            success(result) {
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

    //选择地址
    selectAddress(e){
        const edata = e.currentTarget.dataset;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
            address: edata.address
        }),
        wx.navigateBack()
    },
})
