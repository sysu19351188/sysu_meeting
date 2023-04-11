// pages/Setting/Setting.js
// 设置页面
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:'',    // 用户信息
    openId:"",      // 唯一ID
    hideController:true   // 昵称修改组件显示控制变量
  },
  tobindEmail:function(){
    wx.navigateTo({
      url: '/pages/bindEmail/bindEmail',
    })
  },
  // 早期测试时添加的更换头像函数，后期舍弃该功能
  changeProfile:function(){
    var that = this;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        console.log(res.tempFilePaths + "修改页面")
        var avatar = res.tempFilePaths;
        var uI = that.data.userInfo;
        uI.avatarUrl = avatar;
        that.setData({
          userInfo: uI
        })
        wx.setStorageSync('userInfo', uI)
        wx.showToast({
          title: '头像上传成功',
          icon:'success',
          duration: 1500
        })
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '头像上传失败',
          icon:'error',
          duration: 1500
        })
      },
      complete: function () {
        // complete
      }
    })
  },
   // 绑定邮箱
   bindEmail:function(e){
    console.log(e.detail.value);
    var val = e.detail.value.email;
    var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/; 
    if(reg.test(val)){
      console.log('输入正确');
    }else{
      console.log('输入不正确');
    }
  },
  // 修改昵称函数
  changeNickname:function(){
    // 修改hideController为false，显示昵称修改组件
    this.setData({
      hideController:false
    })
  },
  // 新昵称上传函数
  refreshNickname:function(e){
    // 接收昵称修改组件传递的新昵称
    var changeUI=e.detail.userInfo
    var that=this;
    // 向服务器发起请求，将新昵称存入服务器
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func: "update_user",
        para: "\"" + that.data.openId + "\",\"" + changeUI.nickName + "\"",
      },
      header: {
        'content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          userInfo:changeUI
        })
        // 新昵称成功上传至服务器，同步修改本地缓存
        wx.setStorageSync('userInfo', changeUI)
      }
    })
  },
  // 退出登录函数
  Logout:function(){
    var that = this;
    // 弹出提示框，用户再次确认是否退出登录
    wx.showModal({
      title:"提示",
      content:"是否退出登录？",
      confirmColor:"red",
      success(res){
        // 确认退出，清除本地登录缓存记录
        if (res.confirm){
          that.setData({
            userInfo:null
          })
          wx.setStorageSync('userInfo', null)
          that.setData({
            userInfo:null
          })
          wx.setStorageSync('openId', null)
          that.setData({
            openId:null
          })
          // 弹出成功退出登录提示框
          wx.showToast({
            title: '成功退出登录',
            icon: 'success',
            duration: 1500
          })
          setTimeout(()=>
          {
            // 跳转至主页
            wx.switchTab({
              url: '../index/index',
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
    // 加载本地缓存，读取必要用户信息
    var user_Info=wx.getStorageSync('userInfo');
    var openId = wx.getStorageSync('openId')
    this.setData({
      userInfo:user_Info,
      openId:openId,
      hideController:true
    });
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
    // 加载本地缓存，读取必要用户信息，默认隐藏昵称修改组件
    var user_Info=wx.getStorageSync('userInfo');
    var openId = wx.getStorageSync('openId')
    this.setData({
      userInfo:user_Info,
      openId:openId,
      hideController:true
    });
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