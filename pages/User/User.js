// pages/User/User.js
// 个人页面
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,  // 用户个人信息
    openId:"",      // 用户唯一ID
    myMeeting:[]    // 用户会议预约记录
  },
  // 跳转至设置页面函数
  toSetting:function(){
    wx.navigateTo({
      url: '/pages/Setting/Setting',
    })
  },
  // 跳转至会议预约详情页面函数
  viewDetail:function(e){
    // 接收会议预约信息并传值给详情页面
    var item = e.currentTarget.dataset.item;
    var item_ = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/Meeting_detial/Meeting_detail?item_=' + item_,
    })
  },
  // 在设置页面修改新昵称后，更新本页面data中的用户信息
  refreshNickname:function(e){
    var changeUI=e.detail.userInfo;
    console.log("error")
    this.setData({
      userInfo:changeUI
    })
  },
  // 退出登录函数，开发早期将退出登录模块设置在个人页面中，后将退出登录模块移至设置页面，不再使用该函数
  Logout:function(){
    var that = this;
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
    // 局部函数，用于计算某次会议预约记录的日期与本地时间相差的天数
    function countDay(y, m, d){
      var sum = 0
      var ms = [0,31,28,31,30,31,30,31,31,30,31,30,31]
      for (let i = 0; i < m; i++) {
        sum += ms[i]
      }
      sum += d
      if((y % 4 == 0 && y % 100 != 0 || y % 400 == 0) && m >= 3){
        sum += 1
      }
      return sum
    }
    // 加载缓存：用户昵称、头像、唯一ID，判断本地是否有登录缓存记录
    wx.getStorage({ 
      key:"userInfo",
      success: function(res) {   
        // 若本地无用户信息缓存记录，跳转至登录界面
        if(res.data==null)
        {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        } 
        else{
          that.setData({
            userInfo:res.data
          })
          wx.getStorage({ 
            key:"openId",
            success: function(res) {   
              // 若本地无用户openId缓存记录，跳转至登录界面
              if(res.data==null)
              {
                wx.redirectTo({
                  url: '/pages/login/login',
                })
              } 
              else{
                that.setData({
                  openId:res.data
                }) 
                app.globalData.wx_id = res.data;
                console.log(app.globalData.wx_id)
                // 加载用户预约会议信息
                wx.request({
                  url: 'http://43.136.15.38//ruangong/call_function.php',
                  method: 'GET',
                  data: {
                    func: "query_wx_id",
                      para: "\"" + that.data.openId + "\"",
                  },
                  header: {
                    'content-Type': 'application/json'
                  },
                  success(res) {
                    console.log("query_wx_id_res")
                    console.log(res)
                    // 将从服务器读取的会议信息存入本页面data中
                    var myMeeting = res.data.data
                    // 获取本地时间
                    var myDate = new Date();
                    var year = myDate.getFullYear()
                    if (myDate.getMonth() + 1 < 10) {
                      var month = "0" + (myDate.getMonth() + 1)
                    } else {
                      var month = (myDate.getMonth() + 1).toString()
                    }
                    if (myDate.getDate() < 10) {
                      var day = "0" + (myDate.getDate())
                    } else {
                      var day = (myDate.getDate()).toString()
                    }
                    var hour = (myDate.getHours()).toString()
                    var ymd = year + "-" + month + "-" + day
                    console.log(ymd)
                    var outOfDate_id = []
                    var outOfDate_index = []
                    // 根据会议时间，对比本地时间，判断从服务器中获取的会议记录的状态（未开始、进行中、已结束）
                    for (let index = 0; index < myMeeting.length; index++) {
                      // 0,1,2分别代表未开始，进行中，已结束
                      var status = -1;
                      if (myMeeting[index].day > ymd) {
                        status = 0;
                      } else if (myMeeting[index].day < ymd) {
                        status = 2;
                        // 对于已结束的会议，判断距离本地时间是否超过7天，将自动删除7天之前的会议预约记录
                        var count = 0
                        var y_ = Number(myMeeting[index].day.substring(0,4))
                        var m_ = Number(myMeeting[index].day.substring(5,7))
                        var d_ = Number(myMeeting[index].day.substring(8,10))
                        count += (Number(year) - y_) * 365
                        count -= countDay(y_,m_,d_)
                        count += countDay(Number(year),Number(month),Number(day))
                        while (y_ != Number(year)) {
                          console.log("闰")
                          if (count > 0) {
                            if(y_ % 4 == 0 && y_ % 100 != 0 || y_ % 400 == 0) {
                              count += 1
                            }
                            y_++
                          } else {
                            if (y_ % 4 == 0 && y_ % 100 != 0 || y_ % 400 == 0) {
                              y_--
                            }
                          }
                        }
                        if (count >= 7) {
                          outOfDate_id.push(myMeeting[index].id)
                          outOfDate_index.push(index)
                        }
                      } else {
                        if (myMeeting[index].begintime.substring(0,2) > hour) {
                          status = 0;
                        } else if (myMeeting[index].endtime.substring(0,2) <= hour) {
                          status = 2;
                        } else {
                          status = 1;
                        }
                      }
                      // 在会议信息中添加会议的状态描述文本
                      if (status==0) {
                        myMeeting[index].status = "未开始"
                      } else if (status==1) {
                        myMeeting[index].status = "进行中"
                      } else if (status==2) {
                        myMeeting[index].status = "已结束"
                      } else {
                        console.log("状态异常")
                        myMeeting[index].status = "未知"
                      }
                    }
                    // 删除七天以前的预约记录
                    for (let i = 0; i < outOfDate_id.length; i++) {
                      wx.request({
                        url: 'http://43.136.15.38//ruangong/call_function.php',
                        method: 'GET',
                        data: {
                          func: "delete_meeting",
                          para: "\"" + outOfDate_id[i] + "\"",
                        },
                        header: {
                          'content-Type': 'application/json'
                        },
                        success(res) {}
                      })
                    }
                    outOfDate_index.sort((a,b)=>{return b-a})
                    for (let i = 0; i < outOfDate_index.length; i++) {
                      myMeeting.splice(outOfDate_index[i], 1)
                    }
                    console.log(myMeeting)
                    that.setData({
                      myMeeting: myMeeting
                    })
                  }
                })
              }
            },
            // 获取用户信息缓存失败，跳转至登录界面
            fail: function(res){
              wx.redirectTo({
                url: '/pages/login/login',
              })
            } 
          })
        }
      },
      // 获取用户openId缓存失败，跳转至登录界面
      fail: function(res){
        wx.redirectTo({
          url: '/pages/login/login',
        })
      } 
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
    var that=this;
    // 局部函数，用于计算某次会议预约记录的日期与本地时间相差的天数
    function countDay(y, m, d){
      var sum = 0
      var ms = [0,31,28,31,30,31,30,31,31,30,31,30,31]
      for (let i = 0; i < m; i++) {
        sum += ms[i]
      }
      sum += d
      if((y % 4 == 0 && y % 100 != 0 || y % 400 == 0) && m >= 3){
        sum += 1
      }
      return sum
    }
    // 加载缓存：用户昵称、头像、唯一ID，判断本地是否有登录缓存记录
    wx.getStorage({ 
      key:"userInfo",
      success: function(res) {
        // 若本地无用户信息缓存记录，跳转至登录界面   
        if(res.data==null)
        {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        } 
        else{
          that.setData({
            userInfo:res.data
          })
          wx.getStorage({ 
            key:"openId",
            success: function(res) {   
              // 若本地无用户openId缓存记录，跳转至登录界面
              if(res.data==null)
              {
                wx.redirectTo({
                  url: '/pages/login/login',
                })
              } 
              else{
                that.setData({
                  openId:res.data
                })    
                app.globalData.wx_id = res.data;
                // 加载用户预约会议信息
                wx.request({
                  url: 'http://43.136.15.38//ruangong/call_function.php',
                  method: 'GET',
                  data: {
                    func: "query_wx_id",
                    para: "\"" + that.data.openId + "\"",
                    // para: "\"" + "wx_19351078" + "\"",
                  },
                  header: {
                    'content-Type': 'application/json'
                  },
                  success(res) {
                    console.log("query_wx_id_res")
                    console.log(res)
                    // 将从服务器读取的会议信息存入本页面data中
                    var myMeeting = res.data.data
                    // 获取本地时间
                    var myDate = new Date();
                    var year = myDate.getFullYear()
                    if (myDate.getMonth() + 1 < 10) {
                      var month = "0" + (myDate.getMonth() + 1)
                    } else {
                      var month = (myDate.getMonth() + 1).toString()
                    }
                    if (myDate.getDate() < 10) {
                      var day = "0" + (myDate.getDate())
                    } else {
                      var day = (myDate.getDate()).toString()
                    }
                    var hour = (myDate.getHours()).toString()
                    var ymd = year + "-" + month + "-" + day
                    console.log(ymd)
                    var outOfDate_id = []
                    var outOfDate_index = []
                    // 根据会议时间，对比本地时间，判断从服务器中获取的会议记录的状态（未开始、进行中、已结束）
                    for (let index = 0; index < myMeeting.length; index++) {
                      // 0,1,2分别代表未开始，进行中，已结束
                      var status = -1;
                      if (myMeeting[index].day > ymd) {
                        status = 0;
                      } else if (myMeeting[index].day < ymd) {
                        status = 2;
                        // 对于已结束的会议，判断距离本地时间是否超过7天，将自动删除7天之前的会议预约记录
                        var count = 0
                        var y_ = Number(myMeeting[index].day.substring(0,4))
                        var m_ = Number(myMeeting[index].day.substring(5,7))
                        var d_ = Number(myMeeting[index].day.substring(8,10))
                        count += (Number(year) - y_) * 365
                        count -= countDay(y_,m_,d_)
                        count += countDay(Number(year),Number(month),Number(day))
                        while (y_ != Number(year)) {
                          console.log("闰")
                          if (count > 0) {
                            if(y_ % 4 == 0 && y_ % 100 != 0 || y_ % 400 == 0) {
                              count += 1
                            }
                            y_++
                          } else {
                            if (y_ % 4 == 0 && y_ % 100 != 0 || y_ % 400 == 0) {
                              y_--
                            }
                          }
                        }
                        if (count >= 7) {
                          outOfDate_id.push(myMeeting[index].id)
                          outOfDate_index.push(index)
                        }
                      } else {
                        console.log("hour")
                        console.log(hour)
                        console.log(myMeeting[index].begintime.substring(0,2))
                        console.log(myMeeting[index].endtime.substring(0,2))
                        if (myMeeting[index].begintime.substring(0,2) > hour) {
                          status = 0;
                        } else if (myMeeting[index].endtime.substring(0,2) <= hour) {
                          status = 2;
                        } else {
                          status = 1;
                        }
                      }
                      // 在会议信息中添加会议的状态描述文本
                      if (status==0) {
                        myMeeting[index].status = "未开始"
                      } else if (status==1) {
                        myMeeting[index].status = "进行中"
                      } else if (status==2) {
                        myMeeting[index].status = "已结束"
                      } else {
                        console.log("状态异常")
                        myMeeting[index].status = "未知"
                      }
                    }
                    // 删除七天以前的预约记录
                    for (let i = 0; i < outOfDate_id.length; i++) {
                      wx.request({
                        url: 'http://43.136.15.38//ruangong/call_function.php',
                        method: 'GET',
                        data: {
                          func: "delete_meeting",
                          para: "\"" + outOfDate_id[i] + "\"",
                        },
                        header: {
                          'content-Type': 'application/json'
                        },
                        success(res) {}
                      })
                    }
                    outOfDate_index.sort((a,b)=>{return b-a})
                    for (let i = 0; i < outOfDate_index.length; i++) {
                      myMeeting.splice(outOfDate_index[i], 1)
                    }
                    console.log(myMeeting)
                    that.setData({
                      myMeeting: myMeeting
                    })
                  }
                })
              }
            },
            // 获取用户信息缓存失败，跳转至登录界面
            fail: function(res){
              wx.redirectTo({
                url: '/pages/login/login',
              })
            } 
          })
        }
      },
      // 获取用户openId缓存失败，跳转至登录界面
      fail: function(res){
        wx.redirectTo({
          url: '/pages/login/login',
        })
      } 
    })
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