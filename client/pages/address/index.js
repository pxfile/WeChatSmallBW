//index.js
//获取应用实例
var app = getApp()
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
        this.fetchListData(this.data.longitude, this.data.dimension, false);
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(this.data.longitude, this.data.dimension, false),
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
     * 请求自提地址列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(longitude, dimension, isReachBottom) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getAllStore({
            lat: '41.046854',
            lng: '127.070082'
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        list: that.data.list.concat(data.data),
                    })
                } else {
                    that.setData({
                        list: data.data,
                    })
                }
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
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
        this.fetchListData(longitude, dimension, true)
    },

    //选择地址
    selectAddress(e){
        const edata = e.currentTarget.dataset;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
            storeId: edata.storeid,
            address: edata.address,
            storeManagerName: edata.storemanagermame,
            storePhone: edata.storephone,
            selectAddress: false
        }),
            wx.navigateBack()
    },
})
