// pages/recipe/recipelist/recipelist.js
var app = getApp();

Page({
  data: {
    begin:"",
    limit:"",

    startArray:[],      //开始时间列表
    startIndex:null,    //开始时间序号

    endArray:[],        //结束时间列表
    endIndex:null,      //结束时间序号

    addrArray:[],       //地址列表
    addrIndex:null,     //地址序号

    isNoMeeting: false, //判断有无可用时间段标志

    date: "",           //日期
    startTime: "",      //会议开始时间
    endTime: "",        //会议结束时间
    num: "",            //参会人数
    address:"",         //会议地点
    remark:"",          //备注
    compere:"",         //主持人
    selectTime:[],      //选择的时间段
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function (options) {
    var _this=this
    this.reset()        //重置预约会议页面

    //读取登陆状态
    wx.getStorage({     
      key:"openId",
      success: function(res) {   
        if(res.data==null)
        {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        } 
        else{
          _this.setData({
            openId:res.data
          }) 
          app.globalData.wx_id = res.data;
        }
      },
      //没有登录就跳转登录页面
      fail: function(res){
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    })

    //读取详情页面跳转的数据
    _this.setData({address: app.globalData.tempAddr});
    if(app.globalData.isReserve == true){
      _this.setData({date: app.globalData.date});
      this.Request();
      wx.showToast({
        title: '请稍候',
        icon:'loading',
        duration:1000,
        mask:true
      })
      //将详情页面选择的时间段更新到时间表中
      setTimeout(function(){
        const selectarray=[
          {beginTime:"07:00:00", endTime:"08:00:00",checked:false},
          {beginTime:"08:00:00", endTime:"09:00:00",checked:false},
          {beginTime:"09:00:00", endTime:"10:00:00",checked:false},
          {beginTime:"10:00:00", endTime:"11:00:00",checked:false},
          {beginTime:"11:00:00", endTime:"12:00:00",checked:false},
          {beginTime:"12:00:00", endTime:"13:00:00",checked:false},
          {beginTime:"13:00:00", endTime:"14:00:00",checked:false},
          {beginTime:"14:00:00", endTime:"15:00:00",checked:false},
          {beginTime:"15:00:00", endTime:"16:00:00",checked:false},
          {beginTime:"16:00:00", endTime:"17:00:00",checked:false},
          {beginTime:"17:00:00", endTime:"18:00:00",checked:false},
          {beginTime:"18:00:00", endTime:"19:00:00",checked:false},
          {beginTime:"19:00:00", endTime:"20:00:00",checked:false},
          {beginTime:"20:00:00", endTime:"21:00:00",checked:false},
          {beginTime:"21:00:00", endTime:"22:00:00",checked:false}
        ];
        if(app.globalData.isReserve==true){
          _this.setData({startTime: selectarray[app.globalData.startIndex].beginTime});
          console.log("开始时间："+selectarray[app.globalData.startIndex].beginTime)
          _this.BeginTime();
          _this.setData({endTime: selectarray[app.globalData.endIndex].endTime});
          console.log("结束时间："+_this.data.endTime)
          _this.EndTime()
          app.globalData.endIndex = null
          app.globalData.startIndex = null
          app.globalData.date = ""
        }
      },500)
    }
    wx.getStorage({ 
      key:"openId",
      success: function(res) {   
        if(res.data==null)
        {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        } 
        else{
          _this.setData({
            openId:res.data
          }) 
          app.globalData.wx_id = res.data;
        }
      },
      fail: function(res){
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    })
    var that = this;
    //请求会议室列表
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func: "show_meetingrooms_no_img",
        para: "",
      },
      header: {
        'content-Type': 'application/json'
      },
      success(res) {
        console.log("会议室");
        console.log(res);
        var addrList = [];
        for(var i=0;i<res.data.data.length;i++){
          if(res.data.data[i].status!="0"){
          addrList.push(res.data.data[i].room_add);
          }
        }
        that.setData({
          addrArray: addrList,
        });
        if(app.globalData.tempAddr!=""){
          for(var i=0;i<that.data.addrArray.length;i++){
            if(that.data.address==that.data.addrArray[i]){
              that.setData({addrIndex: i})
              app.globalData.tempAddr = ""
            }
          }
        }
      }
    });

    //计算当前时间并更新时间表，确保用户所选时间段有效
    var nowDate = new Date();
    let year = nowDate.getFullYear()
    let month = nowDate.getMonth()+1
    let day = nowDate.getDate()
    let begin = `${year}-${month}-${day}`
    
    var limitTime = nowDate.getTime()+365*24*60*60*1000;
    var limitDate = new Date(limitTime);
    let year_limit = limitDate.getFullYear()
    let month_limit = limitDate.getMonth()+1
    let day_limit = limitDate.getDate()
    var limit = `${year_limit}-${month_limit}-${day_limit}`

    this.setData({
      begin: begin,
      limit: limit,
    })
  },
    
  //提交会议信息
  submit:function(e){
    var data = e.detail.value;
    var that=this;
    console.log(data);

    this.setData({
      num: data.peopleNum,
      compere: data.compere,
    });
    if(data.remark!=""){
      this.setData({
        remark:data.remark,
      });
    }
    
    //提交的会议信息包含的内容
    var address = "\""+this.data.address+"\"";
    var date = "\""+this.data.date+"\"";
    var starttime = "\""+this.data.startTime+"\"";
    var endtime = "\""+this.data.endTime+"\"";
    var number = this.data.num;
    var use_name = "\""+app.globalData.wx_id+"\"";
    var remarks = "\""+this.data.remark+"\"";
    var compere = "\""+this.data.compere+"\""
    console.log(app.globalData.wx_id)
     wx.showLoading({
       title: '提交中',
       mask:true,
     })
    var para = address+","+date+","+starttime+","+endtime+","+number+","+use_name+","+remarks+","+compere;
    console.log(para);
    wx.request({
      url: 'http://43.136.15.38//ruangong/call_function.php',
      method: 'GET',
      data: {
        func:"insert_meeting",
        para:para,
      },
      header: {
        'content-Type': 'application/json'
      },
      success(res) {
        wx.hideLoading()
        console.log(res);
        if(res.data.valid==0){
          console.log(res);
          wx.showToast({
            title: '提交失败，请完善预约信息',
            icon: 'none',
            duration: 2000,
            mask:true
          });         
        }
        else{
          //提交成功后，判断是否复制会议信息
          wx.showModal({
            title: '提示',
            content: '提交成功，是否复制此会议信息？',
            mask:true,
            success: (res)=> {
              if (res.confirm) {
                wx.setClipboardData({
                  data: '会议室:\t\t'+that.data.address+
                  '\n日期:\t\t\t'+that.data.date+
                  '\n开始时间:\t'+that.data.startTime+
                  '\n结束时间:\t'+that.data.endTime+
                  '\n主持人:\t\t'+that.data.compere,
                  success: (res)=> {
                    wx.showToast({
                      icon:'success',
                      title: '已复制到剪贴板',
                      duration: 2000,
                      mask:true
                    })                      
                    setTimeout(function(){
                      that.reset();
                      wx.switchTab({
                        url: '../../pages/index/index',
                      });
                      console.log(res);
                      console.log("提交成功");
                      app.globalData.isReserve = false
                      },2000);
                  }
                })
              } else if (res.cancel) {
                console.log('取消')
                setTimeout(function(){
                  that.reset();
                  wx.switchTab({
                    url: '../../pages/index/index',
                  });
                  console.log(res);
                  console.log("提交成功");
                  app.globalData.isReserve = false
                  },1000);
              }
            }
         })
        }
      }
    });
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  //请求特定日期特定会议室的预约情况
  Request:function(){
    var that = this;
    var addr = this.data.address;
    var para = "\""+addr+"\","+"\""+this.data.date+"\"";
    console.log(para);
    var selectTime=[
      {beginTime:"07:00:00", endTime:"08:00:00",checked:false},
      {beginTime:"08:00:00", endTime:"09:00:00",checked:false},
      {beginTime:"09:00:00", endTime:"10:00:00",checked:false},
      {beginTime:"10:00:00", endTime:"11:00:00",checked:false},
      {beginTime:"11:00:00", endTime:"12:00:00",checked:false},
      {beginTime:"12:00:00", endTime:"13:00:00",checked:false},
      {beginTime:"13:00:00", endTime:"14:00:00",checked:false},
      {beginTime:"14:00:00", endTime:"15:00:00",checked:false},
      {beginTime:"15:00:00", endTime:"16:00:00",checked:false},
      {beginTime:"16:00:00", endTime:"17:00:00",checked:false},
      {beginTime:"17:00:00", endTime:"18:00:00",checked:false},
      {beginTime:"18:00:00", endTime:"19:00:00",checked:false},
      {beginTime:"19:00:00", endTime:"20:00:00",checked:false},
      {beginTime:"20:00:00", endTime:"21:00:00",checked:false},
      {beginTime:"21:00:00", endTime:"22:00:00",checked:false}
    ];

    var nowTime = (new Date()).getTime()
    var deleteTime = (new Date(this.data.date+" 00:00:00")).getTime()
    console.log("当前时间："+nowTime+"\n 今天时间："+deleteTime)
    //说明是今天的会议
    if(nowTime > deleteTime){
      for(let i=0;i<selectTime.length;i++){
        let deleteTime = (new Date(that.data.date+" "+selectTime[i].beginTime)).getTime()
        if(deleteTime > nowTime){
          selectTime = selectTime.slice(i)
          console.log(selectTime)
          break
        }
      }
    }

    if(this.data.address&&this.data.date){
      wx.request({
        url: 'http://43.136.15.38//ruangong/call_function.php',
        method: 'GET',
        data: {
          func: "query_addr_date",
          para:para,
        },
        header: {
          'content-Type': 'application/json'
        },
        success(res) {
          console.log("查询");
          console.log(res);

          var start = null;
          var end = null;
          if(res.data.data.length!=0){
            for(var i=0; i<res.data.data.length; i++){
              for(var j=0; j<selectTime.length;j++){
                if(res.data.data[i].begintime==selectTime[j].beginTime){
                  start = j;
                }
                if(res.data.data[i].endtime==selectTime[j].endTime){
                  end = j;
                }
              }
              if(start!=null){
                for(var k=start; k<=end; k++){
                  selectTime[k].checked = true;
                }
              }
            }
          }
          that.setData({
            selectTime:selectTime,
          });

          //根据返回的信息更新时间表
          var start = [];
          for(var i=0;i<selectTime.length;i++){
            if(selectTime[i].checked!=true){
              start.push(selectTime[i].beginTime);
            }
          }
          if(start.length==0){
            that.setData({
              isNoMeeting: true,
            });
            var title = '会议室'+that.data.address+'在该日无可用预约时段';
            console.log(title);
            wx.showToast({
              title: title,
              icon:"none",
              duration: 2000,
              mask:true
            });
          }else{
          that.setData({
            isNoMeeting: false,
            startArray: start,
          });
          }
        }
      });
    }
  },

  //地址选择器更新及数据更新
  SelectAddr: function(e){
    this.setData({
      addrIndex: e.detail.value,
    });
    this.setData({
      address: this.data.addrArray[this.data.addrIndex],
    });
    this.Request();
  },

  //日期选择器及数据更新
  SelectDate: function(e){
    this.setData({
      date: e.detail.value
    });
    this.Request();
  },

  //开始时间选择器及数据更新，并给出结束时间列表
  BeginTime: function(e){
    if(app.globalData.isReserve==false){
      console.log("直接预约，不选时间段")
      this.setData({
        startIndex: e.detail.value,  
      }); 
      console.log(e.detail.value);
    this.setData({
      startTime: this.data.startArray[this.data.startIndex],
    }); 
    }
    else{
      console.log("选了时间段")
      for(let i=0;i<this.data.startArray.length;i++){
        if(this.data.startTime == this.data.startArray[i]){
          this.setData({
            startIndex: i,
          });
        }
      }
      
    }
    console.log("开始时间赋值完毕")
    console.log(this.data.startArray)
    var end = [];
    for(var i=0;i<this.data.selectTime.length;i++){
      if(this.data.selectTime[i].beginTime==this.data.startTime){
        var j=i;
        while(this.data.selectTime[j].checked==false){
          end.push(this.data.selectTime[j].endTime);
          j++;
          if(j>=this.data.selectTime.length){
            break;
          }
        }
        break;
      }
    }
    console.log("结束时间赋值")
    console.log(end)
    this.setData({
      endArray:end,
    });
    console.log(this.data.endArray)
  },

//结束时间选择器及数据更新
  EndTime:function(e){
    if(app.globalData.isReserve==false){
      console.log("直接预约，不选时间段")
      this.setData({
        endIndex: e.detail.value,
      });
    this.setData({
      endTime: this.data.endArray[this.data.endIndex],
    });
    }
    else{
      console.log("选了时间段")
      for(let i=0;i<this.data.endArray.length;i++){
        if(this.data.endTime == this.data.endArray[i]){
          this.setData({
            endIndex: i,
          });
        }
      }
    }
  },

  //页面信息重置功能
  reset:function(){
    console.log("开始清理")
    if(app.globalData.startIndex==null){
      console.log("clear success")
      app.globalData.isReserve = false
    }
    this.setData({
      date: "",
      address:"",
      starttime: "",
      endtime: "",
      addrIndex: null,
      startIndex:null,
      endIndex:null,
      num:"",
      compere:"",
      isNoMeeting: false,
      remark:"",
    })
    // if(app.globalData.isReserve==true){
    //   console.log("选了时间段")
    //   app.globalData.endIndex = null
    //   app.globalData.startIndex = null
    //   app.globalData.date = ""
    //   app.globalData.isReserve=false
    // }
  }
 
 
})