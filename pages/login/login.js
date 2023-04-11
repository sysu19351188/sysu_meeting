// pages/login/login.js
// 登录页面

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,  // 用户信息
    openId:""   // 唯一ID
  },
  // 登录函数
  toLogin(e){
    var that = this;
    var openId = ""
    // 获取用户openId
    wx.login({
      success(res){
        if (res.code){
          let code = res.code
          let appid = "wxc755ab530f5aff5d"
          let secret = "8ce52f44567d3bc2137bce42ccbda0d9"
          wx.request({
            url: 'http://43.136.15.38//ruangong/get_wx_id.php',
            method: 'GET',
            data: {
            // 将res.code发送到服务端
            code: code,
            appid: appid,
            secret: secret
            },
            success: function(res){
              console.log("wx_id_res")
              console.log(res.data)
              // 成功获取用户openId，存入缓存，用于其他操作
              openId = res.data.openid
              that.setData({
                openId: res.data.openid
              })
              wx.setStorage({
              key:"openId",
              data: res.data.openid,
              success:function(){
                console.log('数据存储成功')
                }
              })
              app.globalData.wx_id = res.data.openid
            }
          })
        } else{
          console.log("登录失败2" + res.errMsg)
        }
      }
    })
    // 获取用户昵称、头像
    wx.getUserProfile({
      desc: '授权登录，确认身份信息',
      success(res){
        console.log('success get user info',res)
        that.setData({
          userInfo: res.userInfo
        })
        console.log(res.userInfo)
        wx.setStorageSync('userInfo', res.userInfo)
        wx.switchTab({
          url: '/pages/index/index',
        })
        // 判断是否为新用户，是则在数据库为新用户创建个人信息条目
        wx.request({
          url: 'http://43.136.15.38//ruangong/call_function.php',
          method: 'GET',
          data: {
            func: "show_user",
            para: "\"" + that.data.openId + "\"",
          },
          header: {
            'content-Type': 'application/json'
          },
          success(res) {
            if (res.data.data.length==0) // 返回结果为空，说明数据库中不存在用户信息，判断用户为新用户
            {
              // 为新用户在服务器中进行注册，存储必要的用户信息
              wx.request({
                url: 'http://43.136.15.38//ruangong/call_function.php',
                method: 'GET',
                data: {
                  func: "insert_user",
                  para: "\"" + that.data.openId + "\",\"" + that.data.userInfo.nickName + "\"",
                },
                header: {
                  'content-Type': 'application/json'
                },
                success(res) {}
              })
            } else{
              // 数据库中存在用户数据，判断用户不是新用户，则获取用户信息并存入本地缓存
              var n_userInfo = that.data.userInfo
              n_userInfo.nickName = res.data.data[0].name
              // 存入本地缓存与data
              that.setData({
                userInfo: n_userInfo
              })
              wx.setStorageSync('userInfo', n_userInfo)
            }
          },
        })
      },
      fail(res){
        console.log('fail',res)
      }
    })
  },
  // 退出登录函数，早期测试时使用，小程序正常工作时不会显示退出登录按钮
  toLogout:function(){
    var that = this;
    // 再次确认用户是否退出登录
    wx.showModal({
      title:"提示",
      content:"是否退出登录？",
      confirmColor:"red",
      success(res){
        if (res.confirm){
          that.setData({
            userInfo:null
          })
          wx.setStorageSync('userInfo', null)
          that.setData({
            userInfo:null
          })
          wx.showToast({
            title: '成功退出登录',
            icon: 'success',
            duration: 1500
          })
          setTimeout(()=>
          {
            wx.redirectTo({
              url: '/pages/login/login',
            })
          }, 1500); 
        } else if(res.cancel){
          console.log("取消")
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this;
    wx.setNavigationBarTitle({
      title: '登录页面',
    })
    that.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})