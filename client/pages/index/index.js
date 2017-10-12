//index.js
//获取应用实例
var app = getApp()
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        selectList: [],
        buyCount: 0,
        sumPrice: 0,
        showtab: 0,  //顶部选项卡索引
        showtabtype: '0', //选中类型
        tabnav: {},  //顶部选项卡数据
        startx: 0,  //开始的位置x
        endx: 0, //结束的位置x
        critical: 100, //触发切换标签的临界值
        marginleft: 0,  //滑动距离
        onpulldownrefresh: '下拉刷新...',
        onreachbottom: '上拉加载更多...',
    },

    onLoad() {
        this.fetchTabData(this.data.showtabtype);
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchTabData(this.data.showtabtype),
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
     * 请求TAB数据
     * @param tabtype
     */
    fetchTabData(tabtype) {
        console.log(this.data.start_num + tabtype);
        var that = this

        app.HttpService.getTabs()
            .then(res => {
                const data = res.data
                console.log(data)
                if (data.code == 0) {
                    that.setData({
                        tabnav: {
                            tabnum: data.data.length,
                            tabitem: JSON.stringify(data.data),
                        },
                        tab_info: data.data,
                    })

                    that.fetchListData(that.data.tab_info[0].seriesId, false)
                    that.removeStorageData();
                }
            })
    },

    /**
     * 上拉加载更多
     * @param tabtype
     */
    fetchListDataMore(tabType) {
        console.log(this.data.start_num + tabType);
        if (this.data.list.length === 0) return
        this.fetchListData(tabType, true, false)
    },

    /**
     * 请求商品列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(tabType, showLoading, isReachBottom) {
        if (showLoading) {
            util.showBusy('正在加载...')
        }
        var that = this
        app.HttpService.getGoodsList({
            seriesId: tabType,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                if (isReachBottom) {
                    that.setData({
                        list: data.data.concat(that.data.list),
                    })
                } else {
                    that.setData({
                        list: data.data,
                    })
                }
                wx.setStorageSync('shoppingcar' + that.data.showtabtype, that.data.list);
            } else {
                // util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    /**
     * 获取每个TAB下的数据
     * @param tabType
     * @param showLoading
     */
    fetchTabListData(tabType, showLoading) {
        this.setData({
            list: [],
        });
        var allGoods = wx.getStorageSync('shoppingcar' + this.data.showtabtype);
        if (allGoods) {
            this.setData({
                list: allGoods,
            });
        } else {
            this.fetchListData(tabType, showLoading, false)
        }
    },

    showLoading(titleStr) {
        wx.showToast({
            title: titleStr.toString(),
            icon: 'loading'
        })
    },

    hideLoading(){
        wx.hideToast()
    },

    /**
     * 减
     * @param e
     */
    decrease(e) {
        this.jiaj(e, false)
    },
    /**
     * 加
     * @param e
     */
    increase(e) {
        this.jiaj(e, true)
    },
    /**
     * 添加商品操作
     * @param e
     * @param boo
     */
    jiaj(e, boo){
        var id = e.currentTarget.dataset.id;
        var s = 0;
        var allGoods = this.data.list;
        for (var i = 0; i < allGoods.length; i++) {
            if (allGoods[i].goodsId == id) {
                if (boo) {
                    s = allGoods[i].num + 1;
                } else if (allGoods[i].num > 0) {
                    s = allGoods[i].num - 1;
                }
                allGoods[i].num = s;
                break;
            }
        }
        wx.setStorageSync('shoppingcar' + this.data.showtabtype, allGoods);
        this.setData({
            list: allGoods,
        });
        this.showAllGoods(id, boo);
    },
    /**
     * 商品总价，总个数操作
     * @param id
     * @param boo
     */
    showAllGoods(id, boo){
        var allGoods = wx.getStorageSync('shoppingcar' + this.data.showtabtype);
        var payCount = this.data.buyCount;
        var priceCount = this.data.sumPrice;
        var selectGoods = this.data.selectList;
        for (var i = 0; i < allGoods.length; i++) {
            if (allGoods[i].goodsId == id) {
                var price = allGoods[i].goodsPrice;
                if (boo) {
                    priceCount = priceCount + price;
                    payCount = payCount + 1;
                    selectGoods = this.data.selectList.concat(allGoods[i]);
                } else if (allGoods[i].num > 0 && payCount > 0 && priceCount > 0) {
                    priceCount = priceCount - price;
                    payCount = payCount - 1;
                    if (allGoods[i].num > 1) {
                        selectGoods.pop()
                    } else {
                        selectGoods = []
                        payCount = 0
                        priceCount = 0
                    }

                }
                break;
            }
        }
        this.setData({
            list: allGoods,
            buyCount: payCount,
            sumPrice: priceCount,
            selectList: selectGoods,
        });
        console.log("selectList--" + this.data.selectList.length)
        wx.setStorageSync('confirmGoods', this.data.selectList);
    },

    /**
     * 清除缓存数据
     */
    removeStorageData(){
        var allTabs = this.data.tab_info;
        for (var i = 0; i < allTabs.length; i++) {
            try {
                wx.removeStorageSync('shoppingcar' + allTabs[i].type)
            } catch (e) {
                console.log("shoppingcar")
            }
        }
    },
    /**
     * 去结算 预下单
     * @param e
     */
    goToOrder(e) {
        app.WxService.navigateTo('/pages/pay/pre/index?payMoney=' + this.data.sumPrice)
    },

    //------------------------------------------------------TAB------------------------------------------------------------------
    setTab: function (e) { //设置选项卡选中索引
        const edata = e.currentTarget.dataset;
        this.setData({
            start_num: 0,
            showtab: Number(edata.tabindex),
            showtabtype: edata.type,
        })
        this.fetchTabListData(edata.type, true);
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
        //     this.setData({
        //         start_num: 0,
        //         showtab: d.showtab - 1,
        //         showtabtype: d.tab_info[d.showtab - 1].type,
        //     });
        //     this.fetchListData(d.showtabtype, true,false);
        // } else if (d.endx - d.startx < -d.critical && d.showtab < this.data.tabnav.tabnum - 1) {
        //     this.setData({
        //         start_num: 0,
        //         showtab: d.showtab + 1,
        //         showtabtype: d.tab_info[d.showtab + 1].type,
        //     });
        //     this.fetchListData(d.showtabtype, true,false);
        // }
        // this.setData({
        //     startx: 0,
        //     endx: 0,
        //     marginleft: 0
        // })
    },
})
