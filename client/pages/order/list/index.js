//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        orderPayList: [],
        deliveryList: [],
        orderCompleteList: [],
        showtab: 0,  //顶部选项卡索引
        showtabtype: 0, //选中类型
        tab_info: {},
        tabnav: {},  //顶部选项卡数据
        startx: 0,  //开始的位置x
        endx: 0, //结束的位置x
        critical: 100, //触发切换标签的临界值
        marginleft: 0,  //滑动距离
        onpulldownrefresh: '下拉刷新...',
        onreachbottom: '上拉加载更多...',
        btnText: '支付',
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
                    "name": "待取货"
                },
                {
                    "type": 2,
                    "name": "已完成"
                }],
            tabnav: {
                tabnum: 3,
                tabitem: [
                    {
                        "type": 0,
                        "name": "待付款"
                    },
                    {
                        "type": 1,
                        "name": "待取货"
                    },
                    {
                        "type": 2,
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
    // onReachBottom() {
    //     var list;
    //     switch (this.data.showtabtype) {
    //         case 0:
    //             //待付款订单列表
    //             list = this.data.orderPayList
    //             break;
    //         case 1:
    //             //待取货订单列表
    //             list = this.data.deliveryList
    //             break;
    //         case 2:
    //             //已完成订单列表
    //             list = this.data.orderCompleteList
    //             break
    //         default:
    //             break;
    //     }
    //     this.setData({
    //         start_num: list.length,
    //     }),
    //         this.fetchListDataMore(this.data.showtabtype, list);
    // },

    /**
     * 请求订单列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(tabType, isReachBottom) {
        util.showBusy('正在加载...')
        var that = this
        var userId = app.WxService.getStorageSync('user_id')
        switch (tabType) {
            case 0:
                //待付款订单列表
                that.getOrderPayList(that, userId, isReachBottom)
                break;
            case 1:
                //待取货订单列表
                that.getDeliveryList(that, userId, isReachBottom)
                break;
            case 2:
                //已完成订单列表
                that.getOrderCompleteList(that, userId, isReachBottom)
                break
            default:
                break;
        }
    },

    /**
     * 待付款订单列表
     */
    getOrderPayList(that, userId, isReachBottom){
        app.HttpService.getOrderPayList({
            userId: userId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        orderPayList: that.data.orderPayList.concat(data.data),
                    })
                } else {
                    that.setData({
                        orderPayList: data.data,
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
    },

    /**
     *待取货订单列表
     */
    getDeliveryList(that, userId, isReachBottom){
        app.HttpService.getDeliveryList({
            userId: userId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        deliveryList: that.data.deliveryList.concat(data.data),
                    })
                } else {
                    that.setData({
                        deliveryList: data.data,
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
    },

    /**
     * 已完成订单列表
     */
    getOrderCompleteList(that, userId, isReachBottom){
        app.HttpService.getOrderCompleteList({
            userId: userId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        orderCompleteList: that.data.orderCompleteList.concat(data.data),
                    })
                } else {
                    that.setData({
                        orderCompleteList: data.data,
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
    },

    /**
     * 上拉加载更多
     * @param tabtype
     */
    fetchListDataMore(tabType, list) {
        if (list.length === 0) return
        this.fetchListData(tabType, true)
    },

    /**
     * 点击btn按钮
     * @param e
     */
    clickBtn(e){
        console.log('start')
        this.data.showtabtype == 0 ? this.clickPayBtn(e) : this.clickPickBtn(e)
    },

    //立即支付
    clickPayBtn(e){
        console.log('clickPayBtn')
        wx.navigateTo({
            url: '../confirm/index?id=' + encodeURIComponent(e.target.dataset.id)
        })
    },

    //事件处理函数
    clickPickBtn(e){
        console.log('clickPickBtn')
        wx.navigateTo({
            url: '/pages/pickGoods/confirm/index?id=' + encodeURIComponent(e.target.dataset.id)
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
            btnText: edata.type == 0 ? '支付' : '取货'
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
