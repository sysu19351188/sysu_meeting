// pages/bindEmail/bindEmail.js
// var charsCode = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var charsCode = ['0','1','2','3','4','5','6','7','8','9'];

Page({

  sendEmail() {
    wx.cloud.callFunction({
      name: "sendEmail",
      success(res) {
        console.log("发送成功", res)
      },
      fail(res) {
        console.log("发送失败", res)
      }
    })
  },
  
  /**
   * 页面的初始数据
   */
  data: {
    nCode: 0,
    nUserCode: 0,
  },
  handleToAddress(e) {
    this.setData({
      toAddress: e.detail.value,
    })
  },
  
  handleClick() {
      var nCode = "";
      for(var i = 0; i < 6 ; i ++) {
          var id = Math.ceil(Math.random()*9);
          nCode += charsCode[id];
      }
      this.setData({
       nCode: nCode,
     })
     console.log(nCode)

    wx.showLoading({
      title: '发送中'
    })
  
    const {toAddress} = this.data
    wx.cloud.callFunction({
      name: 'sendEmail',
      data: {
        to: toAddress,
        nCode: nCode,
      },
      success: res => {
        wx.hideLoading()
        console.log("result:--")
        console.log(res)
        wx.showToast({
          title: '发送成功'
        })
      },
      fail: err =>{
        wx.hideLoading()

        console.log(err)
      }
    })
  },
  handleToCode(e) {
    this.setData({
      nUserCode: e.detail.value,
    })
  },
  submitEmail() {
    if(this.nUserCode == this.nCode) {
      console.log("success11")
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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