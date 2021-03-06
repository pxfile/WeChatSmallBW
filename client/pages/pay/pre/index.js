//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')

Page({
    data: {
        type: 0,//0:收货地址，1：自提地址
        date: '',
        startDate: '',
        endDate: '',
        storeId: '',
        addressDes: '请选择快递地址',
        address: '',
        managerNameDes: '收件人',
        storeManagerName: '',
        storePhone: '',
        showPickView: false,
        goodsList: [],
        selectGoods: [],
        payMoney: 0,
        orderId: '',
        price: '',
        addressId: '',
        recipientAddress: '',//快递地址
        recipient: '',//收件人名称
        recipientPhone: '',//收件人电话号码
        freightPrice: 0,//运费
        selectAddress: true,//选择自提地址
        selectFreightAddress: true,//选择快递地址
        payAllPrice: 0
    },

    /**
     * 选择时间
     * @param e
     */
    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        })
    },

    onLoad(option) {
        var list = wx.getStorageSync('confirmGoods');
        var pickTime = util.formatTime(new Date());
        var endTime = util.formatTime(new Date('2030-12-31'))
        console.log("pickTime--" + pickTime)
        var money = decodeURIComponent(option.payMoney)
        this.setData({
            date: pickTime,
            goodsList: list,
            payMoney: money,
            payAllPrice: money,
            startDate: pickTime,
            endDate: endTime,
            radio_info: [
                {
                    "type": 0,
                    "name": "快递",
                    'checked': true
                },
                {
                    "type": 1,
                    "name": "自提",
                    "checked": false
                }],
        })
        this.getDefaultAddress()
    },

    //获取默认地址
    getDefaultAddress(){
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getDefaultAddress({
            userId: app.WxService.getStorageSync('user_id'),
        }).then(res => {
            const data = res.data
            console.log(data)
            var freightPrice = util.rd(10, 20)
            if (data.code == 0) {
                that.setData({
                    selectFreightAddress: false,
                    addressId: data.data.addressId,
                    recipientAddress: data.data.area + data.data.address,
                    recipient: data.data.name,
                    recipientPhone: data.data.mobile,
                    freightPrice: freightPrice,
                    payAllPrice: util.accAdd(util.fMoney(that.data.payMoney, 2), util.fMoney(freightPrice, 2)),
                })
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
            that.setData({
                'prompt.hidden': !data.code,
            })
        })
    },

    //选择取货方式 获取该组件的id
    radio(e) {
        this.setData({
            type: e.currentTarget.dataset.id,
            addressDes: e.currentTarget.dataset.id == 0 ? '请选择快递地址' : '请选择自提地址',
            managerNameDes: e.currentTarget.dataset.id == 0 ? '收件人' : '店长',
        })
        console.log(e.currentTarget.dataset.id)
    },

    //选择自提时间
    selectPickTime(e){
        this.setData({
            showPickView: true,
        })
    },

    //选择自提地址
    selectAddress(e){
        var url = this.data.type == 0 ? '/pages/address/userList/index?type=1&price=' + encodeURIComponent(this.data.payMoney) : '/pages/address/list/index'
        wx.navigateTo({
            url: url
        })
    },

    //确认订单
    getConfirmOrder(e){
        if (this.data.type != 0 && this.data.storeId.length == 0) {
            util.showModel('温馨提示', '自提地址不能为空！');
        } else if (this.data.type == 0 && this.data.addressId.length == 0) {
            util.showModel('温馨提示', '收货地址不能为空！');
        } else {
            this.getSelectGoods()
            this.fetchConfirmOrder(this.data.storeId, app.WxService.getStorageSync('user_id'), this.data.date, JSON.stringify(this.data.selectGoods), this.data.freightPrice, this.data.addressId);
        }
    },

    /**
     * 获取所选商品
     */
    getSelectGoods(){
        var allGoods = this.data.goodsList;
        var selectList = [];
        for (var i = 0; i < allGoods.length; i++) {
            var goodsParam = new this.GoodsParam(allGoods[i].goodsId, allGoods[i].num)
            selectList.push(goodsParam)
        }

        this.setData({
            selectGoods: selectList
        })
    },

    /**
     * 选择商品列表的参数
     * @param goodsId
     * @param goodsNum
     * @constructor
     */
    GoodsParam(goodsId, goodsNum){
        this.goodsId = goodsId;
        this.goodsNum = goodsNum;
    },

    /**
     * 预下单
     */
    fetchConfirmOrder(storeId, userId, pickTime, goodsList, freightPrice, addressId){
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getConfirmOrder({
            storeId: this.data.type != 0 ? storeId : '',
            userId: userId,
            pickTime: pickTime,
            goodsList: goodsList,
            freightPrice: this.data.type != 0 ? 0 : freightPrice,
            addressId: this.data.type != 0 ? '' : addressId
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    orderId: data.data.orderId,
                    price: data.data.price
                })
                that.goToOrderDetail();
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    }
    ,
    /**
     * 跳转订单详情
     */
    goToOrderDetail(){
        app.WxService.navigateTo('/pages/order/detail/index?id=' + encodeURIComponent(this.data.orderId) + '&type=0&from=0')
    }
})
