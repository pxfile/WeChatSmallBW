//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
Page({
    data: {
        start_num: 0,
        list: [],
        lists: [],
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
    },

    onLoad(option) {
        this.setData({
            type: option.type//0,查看我的地址，1选择我的地址
        })
        this.fetchListData(false);
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh() {
        this.setData({
            start_num: 0,
        }),
            this.fetchListData(false),
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
     * 请求自提地址列表
     * @param tabType
     * @param showLoading
     */
    fetchListData(isReachBottom) {
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
                that.getUserAddress();
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
    fetchListDataMore() {
        if (this.data.list.length === 0) return
        this.fetchListData(true)
    },

    /**
     * 选择地址
     * @param e
     */
    selectAddress(e){
        if (this.data.type == 0) {
            return
        }
        const edata = e.currentTarget.dataset;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        //快递地址
        prevPage.setData({
            storeId: edata.storeid,
            recipientAddress: edata.address,
            recipient: edata.storemanagermame,
            recipientPhone: edata.storephone,
            //todo
            freightPrice: util.rd(10, 50),
            selectFreightAddress: false
        })
        wx.navigateBack()
    },

    /**
     * 编辑
     * @param e
     */
    toAddressEdit(e) {
        if (this.data.type != 0) {
            return
        }
        console.log(e)
        app.WxService.navigateTo('/pages/address/edit/index?id=' +
            encodeURIComponent(e.currentTarget.dataset.id) + '&name=' +
            encodeURIComponent(e.currentTarget.dataset.name) + '&mobile=' +
            encodeURIComponent(e.currentTarget.dataset.mobile) + '&area=' +
            encodeURIComponent(e.currentTarget.dataset.area) + '&address=' +
            encodeURIComponent(e.currentTarget.dataset.address) + '&isdefault=' +
            encodeURIComponent(e.currentTarget.dataset.isdefault) + '&type=1')
    },

    /**
     * 添加
     * @param e
     */
    toAddressAdd(e) {
        if (this.data.type != 0) {
            return
        }
        console.log(e)
        app.WxService.navigateTo('/pages/address/edit/index?type=0')
    },

    /**
     * 设置默认地址
     * @param e
     */
    setDefaultAddress(e) {
        if (this.data.type != 0) {
            return
        }
        const id = e.currentTarget.dataset.id
        app.HttpService.setDefalutAddress(id)
            .then(res => {
                const data = res.data
                console.log(data)
                if (data.meta.code == 0) {
                    this.onPullDownRefresh()
                }
            })
    },
    /**
     * 删除
     */
    toAddressDelete(e) {
        // this.address.deleteAsync({id: this.data.id})
        //     .then(res => {
        //         const data = res.data
        //         console.log(data)
        //         if (data.meta.code == 0) {
        //             this.showToast(data.meta.message)
        //         }
        //     })
        var that = this
        wx.showModal({
            title: '温馨提示',
            content: '确定要删除吗?',
            success: function (res) {
                if (res.confirm) {
                    that.onPullDownRefresh()
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    getUserAddress(){
        var allList = this.data.list;
        var tempList = [];
        for (var i = 0; i < allList.length; i++) {
            var goodsParam = new this.UserAddress(allList[i].storeId, allList[i].storeManagerName, allList[i].storePhone, allList[i].storeAddress, allList[i].storeAddress, parseInt(i % 2))
            tempList.push(goodsParam)
        }

        this.setData({
            lists: tempList
        })
    },

    UserAddress(id, name, mobile, area, address, isDefault){
        this.id = id;
        this.name = name;
        this.mobile = mobile;
        this.area = area;
        this.address = address;
        this.isDefault = isDefault;
    }
})
