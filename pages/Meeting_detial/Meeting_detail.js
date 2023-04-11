// pages/Meeting_detial/Meeting_detail.js
// 个人会议预约记录详情页面
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:""   // 从个人页面传入的会议预约记录信息
  },
  // 分享会议函数
  shareMeeting:function(){
    var that = this;
    // 将会议信息复制到剪贴板
    wx.setClipboardData({
      data: '会议室:\t\t'+that.data.item.address+
                  '\n日期:\t\t\t'+that.data.item.day+
                  '\n开始时间:\t'+that.data.item.begintime+
                  '\n结束时间:\t'+that.data.item.endtime+
                  '\n主持人:\t\t'+that.data.item.host,
      success: function () {
        wx.hideLoading()
        wx.showToast({
          title: '会议信息已复制',
        })
      }
    })
  },
  // 取消会议函数
  cancelMeeting:function(){
    var that=this;
    // 判断会议状态，不允许用户取消已结束的会议
    if (this.data.item.status=="已结束") {
      wx.showToast({
        title: '会议已结束',
        icon: 'error',
        duration: 1500
      })
    } else {
      // 弹出提示框，用户再次确认是否取消会议
      wx.showModal({
        title:"提示",
        content:"是否取消会议？",
        confirmColor:"red",
        success(res){
          // 确认后向服务器发送请求取消会议，在服务器中删除该会议预约记录
          if (res.confirm){
            wx.request({
              url: 'http://43.136.15.38//ruangong/call_function.php',
              method: 'GET',
              data: {
                func: "delete_meeting",
                para: "\"" + that.data.item.id + "\"",
              },
              header: {
                'content-Type': 'application/json'
              },
              success(res) {
                console.log("delete_meeting_res")
                console.log(res)
              }
            })
            // 弹出提示框通知会议成功取消，返回个人主页
            wx.showToast({
              title: '预约已取消',
              icon: 'success',
              duration: 1500
            })
            setTimeout(()=>
            {
              wx.switchTab({
                url: '/pages/User/User',
              })
            }, 1500); 
          } else if(res.cancel){// 用户取消操作，不执行取消会议操作
            console.log("取消")
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 接收从User页面传递的会议相关信息并存入本页面data中
    var item = JSON.parse(options.item_)
    this.setData({
      item:item
    })
    console.log(item)
    wx.setNavigationBarTitle({
      title: '会议信息',
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