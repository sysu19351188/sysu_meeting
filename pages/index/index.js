// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    nbBackgroundColor: '#ffffff',   // 导航栏颜色
    indexData: null,                // 保存首页数据
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载前调用一次
    // console.log("onLoad");
    var that = this;
    // 调用数据库show_meetingrooms_no_img函数
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func: "show_meetingrooms_no_img",
        para: "",
      },
      header: {
        'content-Type': 'application/json'
      },
      // 调用成功时，返回所有的会议室信息，存入indexData
      success(res) {
        // console.log("index onLoad");
        // console.log(res);
        
        // 根据会议室地址，访问会议室图片
        for (let i = 0; i < res.data.data.length; i++) {
          // res.data.data[i].image = "data:image/jpeg;base64," + res.data.data[i].image;
          res.data.data[i].image = 'http://43.136.15.38//ruangong/call_function.php?func=show_meetingroom&para=\"'+res.data.data[i].room_add+"\"";
        }
        that.setData({indexData:res.data.data});
      },
    });
  },

})