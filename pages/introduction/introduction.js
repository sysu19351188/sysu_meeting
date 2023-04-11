const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addr: "null",         // 会议室地址
    capacity: null,       // 会议室容量
    labels: null,         // 会议室标签
    introduction: null,   // 会议室介绍
    image: null,          // 会议室图片
    status: 1,            // 会议室可用性
    occupied: null,       // 会议室已被预约的时间
    page: 0,              // 周数
    weekDates: [],        // 本周日期
    slot: [],             // 预约矩阵，7 * 15，每一个元素表示某个时间点的预约情况
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // 加载页面前，从主页读出会议室详细信息
  onLoad(options) {
    var that = this;
    // that.data.period = new GetPeriod();
    that.setData({addr: options.addr});
    // console.log("onLoad")
    that.setData({
      capacity: options.capacity,
      labels: options.labels,
      introduction: options.introduction,
      image: 'http://43.136.15.38//ruangong/call_function.php?func=show_meetingroom&para=\"'+options.addr+"\"",
      status: options.status,
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
  // 每次刷新页面时，调用数据库query_weekdates函数和query_addr_page函数查询指定时间段的日期和预约情况
  // 传入查询时间与当前周的相差
  onShow(options) {
    var that = this;
    // var date = time.toLocaleDateString().split('/').join('-');
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func: "query_weekdates",
        para: that.data.page,
      },
      header: {
        'content-Type': 'application/json'
      },
      // 调用成功时，返回指定时间的一周日期
      success(res) {
        // console.log("query query_mon_sun");
        // console.log(res);
        that.setData({
          weekDates: res.data.data[0],
        });
      },
    });
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func: "query_addr_page",
        para: "\""+that.data.addr+"\"," + that.data.page,
      },
      header: {
        'content-Type': 'application/json'
      },
      success(res) {
        // 调用成功时，返回指定时间的一周预约情况
        that.setData({occupied: res.data.data});
        // 更新预约矩阵
        var tempSlot = [];
        for (let i = 0; i < 8; i++) {
          tempSlot[i] = new Array();
          for (let j = 0; j < 15; j++) {
            tempSlot[i][j] = 0;
          }
        }
        for (let i = 0; i < that.data.occupied.length; i++) {
          let bt = Number(that.data.occupied[i].begintime) - 7;
          let et = Number(that.data.occupied[i].endtime) - 7;
          let wd = that.data.occupied[i].weekday;
          for (let j = bt; j < et; j++) {
            tempSlot[wd][j] = 1;
          }
        }
        that.setData({slot: tempSlot});
      },
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

  },

  // 点击预约此会议室后触发，跳转到预约界面
  jumpReserve(e) {
    var that = this;
    // 初始化起止时间，在预约矩阵上标记
    let startTime = [-1,-1];
    let endTime = [-1,-1];
    // 更新用户选择的起止时间，并检查是否是合法的连续时间段
    for (let i = 1; i < 8; i++) {
      for (let j = 0; j < 15; j++) {
        if (that.data.slot[i][j] == 2) {
          if (startTime[0] == -1) {
            startTime[0] = i;
            startTime[1] = j;
            endTime[0] = i;
            endTime[1] = j;
          }
          else if (i == endTime[0] && j == endTime[1]+1) {
            endTime[1] = j;
          }
          else {
            // 时间段不连续，清空用户选择的时间
            let tempSlot = that.data.slot;
            for (let m = 1; m < 8; m++) {
              for (let n = 0; n < 15; n++) {
                if (tempSlot[m][n] == 2) {
                  tempSlot[m][n] = 0;
                }
              }
            }
            that.setData({slot: tempSlot});
            wx.showToast({
              title: '时间段不连续',
              icon: 'error',
              duration: 1000,
            })
            return;
          }
        }
      }
    }
    // 如果用户没有选择日期，直接进入，则不传入起止时间
    // console.log("选择日期与否")
    // console.log(that.data.weekDates[startTime[0]])
    if(that.data.weekDates[startTime[0]]){
      app.globalData.date = that.data.weekDates[startTime[0]];
      app.globalData.startIndex = startTime[1];
      app.globalData.endIndex = endTime[1];
      app.globalData.isReserve = true
    }
    // console.log("app_Date: "+app.globalData.date)
    // console.log("app_startIndex:"+String(app.globalData.startIndex))
    // console.log("app_endIndex:"+String(app.globalData.endIndex))
    // console.log("app_isReserve:"+String(app.globalData.isReserve))
    app.globalData.tempAddr = e.currentTarget.dataset.item
    var url = "../../pages/My_meeting/My_meeting"
    // console.log("传入"+startTime[1]+"-"+endTime[1]);
    
    // 导航到预约会议界面
    wx.switchTab({
      url: url,
    });
  },

  // 点击“上周”按钮触发
  // 将周数减一
  prevWeek() {
    var that = this;
    that.setData({page: that.data.page - 1});
    this.onShow();
  },

  // 点击“下周”按钮触发
  // 将周数加一
  nextWeek() {
    var that = this;
    that.setData({page: that.data.page + 1});
    this.onShow();
  },

  // 对选定预约矩阵的格子，更换用户选择的标志
  // 如果用户点击了某个空闲时段，该时段转为待预约状态
  // 如果用户点击了某个待预约状态，该时段转为空闲时段
  shiftPeriod(e) {
    var that = this;
    let i = e.currentTarget.dataset.i;
    let j = e.currentTarget.dataset.j;
    let tempSlot = that.data.slot;
    let time = that.data.weekDates[i]+" "+(j+7).toString()+":00:00";
    let selectTime = new Date(time);
    let nowTime = new Date();
    if(selectTime.getTime()<nowTime.getTime()){
      return
    }
    tempSlot[i][j] = 2 - that.data.slot[i][j];
    that.setData({slot: tempSlot});
  }
})