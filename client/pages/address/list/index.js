//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        latitude: "",
        longitude: "",
        start_num: 0,
        list: [],
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad(option) {
        var that = this
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                console.log('定位：---》》' + JSON.stringify(res))
                var latitude = res.latitude
                var longitude = res.longitude
                var speed = res.speed
                var accuracy = res.accuracy
                that.setData({
                    latitude: latitude,
                    longitude: longitude,
                })
                that.fetchListData(latitude, longitude, false);
            }
        })
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(this.data.latitude, this.data.longitude, false),
            wx.stopPullDownRefresh();
    },

    /**
     * 上拉加载更多
     */
    onReachBottom() {
        this.setData({
            start_num: this.data.list.length,
        }),
            this.fetchListDataMore(this.data.latitude, this.data.longitude);
    },

    /**
     * 请求自提地址列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(latitude, longitude, isReachBottom) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getAllStore({
            lat: latitude,
            lng: longitude
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
                // util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code && (!isReachBottom || that.data.list),
            })
        })
    },

    /**
     * 上拉加载更多
     * @param tabtype
     */
    fetchListDataMore(longitude, dimension) {
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

        //自提地址
        prevPage.setData({
            storeId: edata.storeid,
            address: edata.address,
            storeManagerName: edata.storemanagermame,
            storePhone: edata.storephone,
            selectAddress: false
        })
        wx.navigateBack()
    },
})
