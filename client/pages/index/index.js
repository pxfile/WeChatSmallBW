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

        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/index_tab`,
            login: false,
            success(result) {
                util.showSuccess('加载成功')
                that.setData({
                    tabnav: {
                        tabnum: 5,
                        tabitem: JSON.stringify(result.data),
                    },
                    tab_info: result.data.data,
                })
                that.fetchListData(that.data.showtabtype, false)
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
    fetchListDataMore(tabType) {
        console.log(this.data.start_num + tabType);
        if (this.data.list.length === 0) return

        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/goods_list_` + tabType,
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

    /**
     * 请求商品列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(tabType, showLoading) {
        if (showLoading) {
            util.showBusy('正在加载...')
        }
        var that = this
        qcloud.request({
            url: `${config.service.host}/weapp/goods_list_` + tabType,
            login: false,
            success(result) {
                if (showLoading) {
                    util.showSuccess('加载成功')
                }
                that.setData({
                    list: result.data.data,
                })
            },
            fail(error) {
                if (showLoading) {
                    util.showModel('加载失败', error);
                }
                console.log('request fail', error);
            }
        })
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

    //事件处理函数
    bindViewTap(e){
        wx.navigateTo({
            url: '../detail/detail?id=' + e.target.dataset.id
        })
    },

    //------------------------------------------------------TAB------------------------------------------------------------------
    setTab: function (e) { //设置选项卡选中索引
        const edata = e.currentTarget.dataset;
        this.setData({
            start_num: 0,
            showtab: Number(edata.tabindex),
            showtabtype: edata.type,
        })
        this.fetchListData(edata.type, true);
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
        //     this.fetchListData(d.showtabtype, true);
        // } else if (d.endx - d.startx < -d.critical && d.showtab < this.data.tabnav.tabnum - 1) {
        //     this.setData({
        //         start_num: 0,
        //         showtab: d.showtab + 1,
        //         showtabtype: d.tab_info[d.showtab + 1].type,
        //     });
        //     this.fetchListData(d.showtabtype, true);
        // }
        // this.setData({
        //     startx: 0,
        //     endx: 0,
        //     marginleft: 0
        // })
    },
})
