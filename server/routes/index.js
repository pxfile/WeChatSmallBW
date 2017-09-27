/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const {auth: {authorizationMiddleware, validationMiddleware}} = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

//测试CGI
router.get('/demo', controllers.demo)

//首页-TAB数据
router.get('/index_tab', controllers.index_tab)
//首页-商品数据
router.get('/goods_list_0', controllers.goods_list_0)
router.get('/goods_list_1', controllers.goods_list_1)
router.get('/goods_list_2', controllers.goods_list_2)
router.get('/goods_list_3', controllers.goods_list_3)
router.get('/goods_list_4', controllers.goods_list_4)
//取货-商品列表
router.get('/pick_goods_list', controllers.pick_goods_list)
//订单-TAB数据
router.get('/order_tab', controllers.order_tab)
//订单-待付款
router.get('/order_list_0', controllers.order_list_0)
//订单-已完成
router.get('/order_list_1', controllers.order_list_1)
//订单详情-待付款
router.get('/goods_detail_0', controllers.goods_detail_0)
//订单详情-已完成
router.get('/goods_detail_1', controllers.goods_detail_1)
//订单确认
router.get('/order_confirm',controllers.order_confirm)
module.exports = router
