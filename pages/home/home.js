// pages/home/home.js
Page({
  // 重新选取照片
  reChoose() {
    this.setData({
      src: '',
      faceInfo:'',
      token:''
    })

  },
  // 选取图片
  choosePhoto() {
    var pageThis = this//注意pageThis类型需为PageOptions
    wx.chooseImage({
      count: 1,//一张图片
      sizeType: ['original'],
      sourceType: ['album'],//从相册选取
      success: function (res) {
        console.log(res)
        if (res.errMsg == 'chooseImage:ok' && res.tempFilePaths.length != 0) {
          pageThis.setData({
            src: res.tempFilePaths[0]
          }, () => {
            pageThis.getFaceInfo()
          })

        }
      },
    })

  },
  // 拍照
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        }, () => {
          this.getFaceInfo()//获取颜值数据
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  // 切换摄像头
  reverse() {
    this.setData({
      dev_position: this.data.dev_position == "front" ? "back" : "front"
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    sHeight: 0,
    dev_position: "front",
    src: "",
    token: "",
    faceInfo:{},
    // 将脸部信息进行映射
    mapInfo:{
      gender:{
        male:'男性',
        female:'女性'
      },
      expression:{
        none:'不笑',
        smile:'微笑',
        laugh:'大笑'
      },
      glasses:{
        none:'无眼镜',
        common:'普通眼镜',
        sun:'墨镜'
      },
      emotion:{
        angry:'愤怒',
        disgust:'厌恶',
        fear:'恐惧',
        happy:'高兴',
        sad:'伤心',
        surprise:'惊讶',
        neutral:'无表情',
        pouty:'撅嘴',
        grimace:'鬼脸'
      },
      face_shape:{
        square:'正方形',
        triangle:'三角形',
        oval:'椭圆',
        heart:'心形',
        round:'圆形'
      },
      face_type:{
        human:'真实人脸',
        cartoon:'卡通人脸'
      }
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取设备信息
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      sHeight: sysInfo.screenHeight
    })
    // console.log(sysInfo)

  },


  // <!-- 调用百度API测颜值 -->
  // <!-- 1.获取Token -->
  // <!-- 2.设置参数 -->
  // <!-- 3.发起请求，把参数发送到人工智能API接口 -->
  getFaceInfo() {
    //  1.获取token
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=Yavr1RsWKby6tQUXOe2syPwE&client_secret=LjSErSgR5hAs9I2sbDE2E5pYBN3xRE35',
      method: 'POST',
      success: (res) => {
        // console.log(res)
        this.setData({
          token: res.data.access_token
        }, () => {
          this.setParams()//设置参数
        })

      }
    })

  },

  // 2.设置参数
  setParams() {
    const params={
      // 图片
      image:'',
      //设置发送到服务器的图片的格式为BASE64
      image_type:'BASE64',
      // 希望人脸检测完后，服务器返回哪些颜值数据
      face_field:'age,gender,beauty,expression,glasses,emotion,face_shape,face_type',
      liveness_control:'NORMAL'
    }

    // 图片转为BASE64格式,然后传给params.image
    const fsm=wx.getFileSystemManager()
    fsm.readFile({
      // 文件路径
      filePath:this.data.src,
      // 编码格式
      encoding:'base64',
      success:(res)=>{
        // console.log(res)
        params.image=res.data
        // console.log(params)
        // 发送请求
        this.testFace(params)

      }
    })

  },

  // 发起请求，获取脸部数据
  testFace(params){
    wx.showLoading({
      title: '脸部数据解析中...',
    })
    wx.request({
      // 请求类型
      method:'POST',
      // 请求地址
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token='+this.data.token,
      // 请求头
      header:{
        "Content-Type":'application/json'
      },
      // 请求体
      data:params,
      success:(res)=>{
        // console.log(res)
        // 
        if (res.errMsg == 'request:ok' && res.data.result!=null&&res.data.result.face_num!=0){
          var face = res.data.result.face_list[0]
          // console.log(face)
          this.setData({
            faceInfo:face
          })
        }
        
        
      },
      complete:()=>{
        wx.hideLoading()
      }

    })

  }


})