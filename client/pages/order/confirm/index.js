//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')

Page({
    data: {
        showtab: 0,  //顶部选项卡索引
        showtabtype: 0, //选中类型
        tab_info: {},
        tabnav: {},  //顶部选项卡数据
        startx: 0,  //开始的位置x
        endx: 0, //结束的位置x
        critical: 100, //触发切换标签的临界值
        marginleft: 0,  //滑动距离
        date: '',
        startDate: '',
        endDate: '',
        selectAddressDes: '',
        addressDes: '',
        address: '',
        managerNameDes: '',
        storeManagerName: '',
        storePhone: '',
        showPickView: false,
        goods_detail: {},
        orderId: '',
        payMoney: 0,
        price: 0,
        recipientAddress: '',//快递地址
        recipient: '',//收件人名称
        recipientPhone: '',//收件人电话号码
        freightPriceSame: 0,//运费
        prompt: {
            hidden: !0,
            icon: '../../../assets/images/iconfont-empty.png',
        },
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
        var startDate = util.formatDate(new Date());
        var endTime = util.formatDate(new Date('2017-12-31'))
        this.setData({
            tab_info: [
                {
                    "type": 0,
                    "name": "快递"
                },
                {
                    "type": 1,
                    "name": "自提"
                }],
            tabnav: {
                tabnum: 2,
                tabitem: [
                    {
                        "type": 0,
                        "name": "快递"
                    },
                    {
                        "type": 1,
                        "name": "自提"
                    }],
            },
            addressDes: '快递地址',
            managerNameDes: '收件人',
            id: decodeURIComponent(option.id),
            startDate: startDate,
            endDate: endTime,
            selectAddressDes: '请选择快递地址'
        })
        this.fetchListData(this.data.id)
    },
    /**
     * 请求订单列表
     */
    fetchListData(orderId) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getOrderDetail({
            orderId: orderId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    date: data.data.pickTime,
                    address: data.data.storeAddress,
                    storeManagerName: data.data.storeManagerName,
                    storePhone: data.data.storePhone,
                    goods_detail: data.data,
                    orderId: data.data.orderId,
                    recipientAddress: data.data.recipientAddress,//快递地址
                    recipient: data.data.recipient,//快递员人名称
                    recipientPhone: data.data.recipientPhone,//快递员电话号码
                    freightPriceSame: data.data.freightPrice,//运费
                    payMoney: data.data.payMoney,
                    price: that.data.showtabtype == 0 ? util.accAdd(util.fMoney(data.data.payMoney, 2), util.fMoney(data.data.freightPrice, 2)) : util.fMoney(data.data.payMoney, 2),
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

    //选择自提时间
    selectPickTime(e){
        this.setData({
            showPickView: true,
        })
    },

    //选择自提地址
    selectAddress(e){
        var url = this.data.showtabtype == 0 ? '/pages/address/userList/index?type=1' : '/pages/address/list/index'
        wx.navigateTo({
            url: url
        })
    },

    //支付成功
    clickPay(e){
        if (this.data.orderId.length == 0 || this.data.price == 0) {
            util.showModel('温馨提示', '查无订单！');
        } else {
            this.payOff()
        }
    },

    /**
     * 登录发起支付
     */
    payOff() {
        var that = this;
        wx.login({
            success: function (res) {
                that.getOpenId(res.code);
                console.log('登录发起支付：---》》' + JSON.stringify(res))
            },
            fail: (res)=> {
                console.log('登录发起支付：---》》' + JSON.stringify(res))
            },
        });

    },
    //获取openid
    getOpenId (code) {
        var that = this
        app.HttpService.getOpenId({
            code: code,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                var openId = data.data.openid;
                //下单
                that.xiadan(openId);
                console.log('发起支付：---》》' + JSON.stringify(data))
            } else {
                console.log('获取openid：---》》' + JSON.stringify(data))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
    //下单
    xiadan (openId) {
        var that = this
        app.HttpService.payGetOrder({
            openId: openId,
            totFee: that.data.price,
            body: '百威-啤酒',
            orderId: that.data.orderId
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                var prepay_id = data.data;
                console.log("统一下单返回 prepay_id:" + prepay_id);
                that.sign(prepay_id);
            } else {
                console.log('下单：---》》' + JSON.stringify(data))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
    //签名
    sign (prepay_id) {
        var that = this
        app.HttpService.paySign({
            repayId: prepay_id,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.requestPayment(data.data);
                console.log('发起支付：---》》' + JSON.stringify(res))
            } else {
                console.log('签名：---》》' + JSON.stringify(res))
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },
    //申请支付
    requestPayment (obj) {
        var that = this
        wx.requestPayment({
            'timeStamp': obj.timeStamp,
            'nonceStr': obj.nonceStr,
            'package': obj.package,
            'signType': obj.signType,
            'paySign': obj.paySign,
            'success' (res) {
                that.fetchPayOrder(this.data.orderId, this.data.price);
            },
            'fail': function (res) {
                console.log('申请支付：---》》' + JSON.stringify(res))
            },
            complete: ()=> {
                console.log('申请支付结束')
            }
        })
    },

    /**
     * 订单支付
     */
    fetchPayOrder(orderId, price) {
        util.showBusy('正在加载...')
        var that = this
        app.HttpService.getPayOrder({
            orderId: orderId,
            price: price,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                util.showSuccess(data.message)
                that.goToPaySuccess(orderId, data.code)
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    goToPaySuccess(orderId, type){
        wx.navigateTo({
            url: '/pages/pay/confirm/index?id=' + encodeURIComponent(orderId) + "&type=" + encodeURIComponent(type)
        })
    },

    //------------------------------------------------------TAB------------------------------------------------------------------
    setTab: function (e) { //设置选项卡选中索引
        const edata = e.currentTarget.dataset;
        console.log("edata" + edata);
        this.setData({
            addressDes: edata.type == 0 ? '快递地址' : '自提地址',
            managerNameDes: edata.type == 0 ? '收件人' : '店长',
            selectAddressDes: edata.type == 0 ? '请选择快递地址' : '请选择自提地址',
            showtab: Number(edata.tabindex),
            showtabtype: edata.type,
            price: edata.type == 0 ? util.accAdd(util.fMoney(this.data.payMoney, 2), util.fMoney(this.data.freightPriceSame, 2)) : util.fMoney(this.data.payMoney, 2),
        })
        console.log("price-->" + this.data.price);
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
