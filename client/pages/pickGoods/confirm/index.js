//index.js
//获取应用实例
var app = getApp()
var util = require('../../../utils/util.js')
var QR = require('../../../utils/wxqrcode.js')
Page({
    data: {
        orderTime: '',
        address: '',
        storeManagerName: '',
        storePhone: '',
        orderQrCode: '',
        qrcode: ''
    },

    onLoad(option) {
        this.setData({
            id: option.id,
            orderTime: option.orderTime,
            address: option.address,
            storeManagerName: option.storeManagerName,
            storePhone: option.storePhone
        })
        this.getQrCode(this.data.id)
    },

    /**
     * 获取取货二维码
     */
    getQrCode(orderId) {
        util.showBusy('正在加载...')
        var that = this
        let qrcodeSize = that.getQRCodeSize()
        app.HttpService.getQrCode({
            orderId: orderId,
        }).then(res => {
            const data = res.data
            console.log(data)
            if (data.code == 0) {
                that.setData({
                    orderQrCode: data.data.orderQrCode,
                })
                that.createQRCode(that.data.orderQrCode, qrcodeSize)
            } else {
                util.showModel('加载失败', data.message);
                console.log('request fail', data.message);
            }
        })
    },

    //事件处理函数
    sweepCode(e){
        wx.navigateTo({
            url: '../complete/index'
        })
    },

    //适配不同屏幕大小的canvas
    getQRCodeSize: function () {
        var size = 0;
        try {
            var res = wx.getSystemInfoSync();
            var scale = 750 / 163; //不同屏幕下QRcode的适配比例；设计稿是750宽
            var width = res.windowWidth / scale;
            size = width;

        } catch (e) {
            // Do something when catch error
            console.log("获取设备信息失败" + e);
        }
        return size;
    },
    createQRCode: function (text, size) {
        //调用插件中的draw方法，绘制二维码图片
        let that = this
        console.log('QRcode: ', text, size)
        let _img = QR.createQrCodeImg(text, {
            size: parseInt(size)
        })

        that.setData({
            'qrcode': _img
        })
    },
})
