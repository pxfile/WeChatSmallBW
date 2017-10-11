import WxRequest from '../assets/plugins/wx-request/lib/index'

class HttpService extends WxRequest {
    constructor(options) {
        super(options)
        this.$$prefix = ''
        this.$$path = {
            wechatSignUp: '/user/wechat/sign/up',
            wechatSignIn: '/user/wechat/sign/in',
            decryptData: '/user/wechat/decrypt/data',
            signIn: '/user/userLogin',
            signOut: '/user/sign/out',
            index_tab: '/brand/getAll',
            goods_list: '/brand/goodsList',
            take_delivery_list: '/order/takeDeliveryList',
            order_complete_list: '/order/orderComplete',
            order_pay_list: '/order/orderPayList',
            order_detail: '/order/orderDetail',
            get_all_store: '/store/getAll',
            confirm_order: '/order/confirmOrder',
            pay_order: '/order/payOrder',
            get_qr_code: '/order/getQrCode',
        }
        this.interceptors.use({
            request(request) {
                request.header = request.header || {}
                // request.header['content-type'] = 'application/json'
                request.header['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
                if (request.url.indexOf('/api') !== -1 && wx.getStorageSync('token')) {
                    request.header.Authorization = 'Bearer ' + wx.getStorageSync('token')
                }
                wx.showLoading({
                    title: '加载中',
                })
                return request
            },
            requestError(requestError) {
                wx.hideLoading()
                return Promise.reject(requestError)
            },
            response(response) {
                wx.hideLoading()
                if (response.statusCode === 401) {
                    wx.removeStorageSync('token')
                    wx.redirectTo({
                        url: '/pages/login/index'
                    })
                }
                return response
            },
            responseError(responseError) {
                wx.hideLoading()
                return Promise.reject(responseError)
            },
        })
    }

    wechatSignUp(params) {
        return this.postRequest(this.$$path.wechatSignUp, {
            data: params,
        })
    }

    wechatSignIn(params) {
        return this.postRequest(this.$$path.wechatSignIn, {
            data: params,
        })
    }

    wechatDecryptData(params) {
        return this.postRequest(this.$$path.decryptData, {
            data: params,
        })
    }

    signIn(params) {
        return this.postRequest(this.$$path.signIn, {
            data: params,
        })
    }

    signOut() {
        return this.postRequest(this.$$path.signOut)
    }

    //品牌系列
    getTabs() {
        return this.postRequest(this.$$path.index_tab)
    }

    //系列商品列表
    getGoodsList(params) {
        return this.postRequest(this.$$path.goods_list, {
            data: params,
        })
    }

    //待取货列表
    getDeliveryList(params) {
        return this.postRequest(this.$$path.take_delivery_list, {
            data: params,
        })
    }

    //完成订单列表
    getOrderCompleteList(params) {
        return this.postRequest(this.$$path.order_complete_list, {
            data: params,
        })
    }

    //待付款列表
    getOrderPayList(params) {
        return this.postRequest(this.$$path.order_pay_list, {
            data: params,
        })
    }

    //订单详情
    getOrderDetail(params) {
        return this.postRequest(this.$$path.order_detail, {
            data: params,
        })
    }

    //预下单
    getConfirmOrder(params) {
        return this.postRequest(this.$$path.confirm_order, {
            data: params,
        })
    }

    //自提地址列表
    getAllStore(params) {
        return this.postRequest(this.$$path.get_all_store, {
            data: params,
        })
    }

    //订单支付
    getPayOrder(params) {
        return this.postRequest(this.$$path.pay_order, {
            data: params,
        })
    }

    //获取取货二维码
    getQrCode(params) {
        return this.postRequest(this.$$path.get_qr_code, {
            data: params,
        })
    }

    delCartByUser(id) {
        return this.deleteRequest(`${this.$$path.cart}/${id}`)
    }

    clearCartByUser() {
        return this.postRequest(`${this.$$path.cart}/clear`)
    }

    getAddressList(params) {
        return this.getRequest(this.$$path.address, {
            data: params,
        })
    }

    getAddressDetail(id) {
        return this.getRequest(`${this.$$path.address}/${id}`)
    }

    postAddress(params) {
        return this.postRequest(this.$$path.address, params)
    }

    putAddress(id, params) {
        return this.putRequest(`${this.$$path.address}/${id}`, {
            data: params,
        })
    }

    deleteAddress(id, params) {
        return this.deleteRequest(`${this.$$path.address}/${id}`)
    }

    getDefalutAddress() {
        return this.getRequest(`${this.$$path.address}/default`)
    }

    setDefalutAddress(id) {
        return this.postRequest(`${this.$$path.address}/default/${id}`)
    }

    getOrderList(params) {
        return this.getRequest(this.$$path.order, {
            data: params,
        })
    }

    // getOrderDetail(id) {
    //     return this.getRequest(`${this.$$path.order}/${id}`)
    // }

    postOrder(params) {
        return this.postRequest(this.$$path.order, {
            data: params,
        })
    }

    putOrder(id, params) {
        return this.putRequest(`${this.$$path.order}/${id}`, {
            data: params,
        })
    }

    deleteOrder(id, params) {
        return this.deleteRequest(`${this.$$path.order}/${id}`)
    }
}

export default HttpService