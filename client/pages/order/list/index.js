//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        showtab: 0,  //顶部选项卡索引
        showtabtype: '0', //选中类型
        tab_info: {},
        tabnav: {},  //顶部选项卡数据
        startx: 0,  //开始的位置x
        endx: 0, //结束的位置x
        critical: 100, //触发切换标签的临界值
        marginleft: 0,  //滑动距离
        onpulldownrefresh: '下拉刷新...',
        onreachbottom: '上拉加载更多...',
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad() {
        this.setData({
            tab_info: [
                {
                    "type": 0,
                    "name": "待付款"
                },
                {
                    "type": 1,
                    "name": "已完成"
                }],
            tabnav: {
                tabnum: 2,
                tabitem: [
                    {
                        "type": 0,
                        "name": "待付款"
                    },
                    {
                        "type": 1,
                        "name": "已完成"
                    }],
            },
        })
        this.fetchListData(this.data.showtabtype, false);
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(this.data.showtabtype, false),
            wx.stopPullDownRefresh();
    },

    /**
     * 上拉加载更多
     */
    onReachBottom() {
        this.setData({
            start_num: this.data.list.length,
        }),
            this.fetchListDataMore(this.data.showtabtype);
    },

    /**
     * 请求订单列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(tabType, isReachBottom) {
        util.showBusy('正在加载...')
        var that = this
        if (tabType > 0) {
            //完成订单列表
            app.HttpService.getOrderCompleteList({
                userId: app.WxService.getStorageSync('user_id'),
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
                            'prompt.hidden': data.data.length,
                        })
                    }
                } else {
                    util.showModel('加载失败', data.message);
                    console.log('request fail', data.message);
                    that.setData({
                        'prompt.hidden': 0 && !isReachBottom,
                    })
                }
            })
        } else {
            //待付款列表
            app.HttpService.getOrderPayList({
                userId: app.WxService.getStorageSync('user_id'),
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
                            'prompt.hidden': data.data.length,
                        })
                    }
                } else {
                    util.showModel('加载失败', data.message);
                    console.log('request fail', data.message);
                    that.setData({
                        'prompt.hidden': 0 && !isReachBottom,
                    })
                }
            })
        }

    },

    /**
     * 上拉加载更多
     * @param tabtype
     */
    fetchListDataMore(tabType) {
        if (this.data.list.length === 0) return
        this.fetchListData(tabType, true)
    },

    //立即支付
    clickPayBtn(e){
        wx.navigateTo({
            url: '../confirm/index?id=' + encodeURIComponent(e.target.dataset.id)
        })
    },

    //------------------------------------------------------TAB------------------------------------------------------------------
    setTab: function (e) { //设置选项卡选中索引
        const edata = e.currentTarget.dataset;
        console.log("edata" + edata);
        this.setData({
            start_num: 0,
            showtab: Number(edata.tabindex),
            showtabtype: edata.type,
        })
        this.fetchListData(edata.type, false);
    },
    scrollTouchstart: function (e) {
        let px = e.touches[0].pageX;
        this.setData({
            startx: px
        })
    },
    scrollTouchmove: function (e) {
        let px = e.touches[0].pageX;
        let d = this.data;
        this.setData({
            endx: px,
        })
        if (px - d.startx < d.critical && px - d.startx > -d.critical) {
            this.setData({
                marginleft: px - d.startx
            })
        }
    },
    scrollTouchend: function (e) {
        // let d = this.data;
        // if (d.endx - d.startx > d.critical && d.showtab > 0) {
        //     console.log("scrollTouchend--1");
        //     this.setData({
        //         start_num: 0,
        //         showtab: d.showtab - 1,
        //         showtabtype: d.tab_info[d.showtab - 1].type,
        //     });
        //     this.fetchListData(d.showtabtype, false);
        // } else if (d.endx - d.startx < -d.critical && d.showtab < this.data.tabnav.tabnum - 1) {
        //     console.log("scrollTouchend--2");
        //     this.setData({
        //         start_num: 0,
        //         showtab: d.showtab + 1,
        //         showtabtype: d.tab_info[d.showtab + 1].type,
        //     });
        //     this.fetchListData(d.showtabtype, false);
        // }
        // this.setData({
        //     startx: 0,
        //     endx: 0,
        //     marginleft: 0
        // })
    },
})
