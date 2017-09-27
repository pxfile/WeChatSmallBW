//index.js
var app = getApp()
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
      requestResult: {},
        canIUseClipboard: wx.canIUse('setClipboardData')
    },

    testCgi: function () {
        util.showBusy('正在加载...')
        var that = this
        qcloud.request({
          url: `${config.service.host}/weapp/index_tab`,
            login: false,
            success (result) {
                util.showSuccess('加载成功')
                that.setData({
                  requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('加载失败', error);
                console.log('request fail', error);
            }
        })
    },

    copyCode: function (e) {
        var codeId = e.target.dataset.codeId
        wx.setClipboardData({
            data: code[codeId - 1],
            success: function () {
                util.showSuccess('复制成功')
            }
        })
    }
})

var code = [
`router.get('/demo', controllers.demo)`,
`module.exports = ctx => {
    ctx.state.data = {
        msg: 'Hello World'
    }
}`
]
