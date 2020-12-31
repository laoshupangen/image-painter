/* eslint-disable */
const ARROW_LENTH = 6
const ONE_DEGREE = Math.PI / 180
const defaultStyle = Object.freeze({
  strokeStyle: 'red',
  fillStyle: '#333',
  lineWidth: 1,
  font: ''
})

import defaultOption from './option'
const Painter = function (
  opt
) {
  const _painter = this
  _painter.canvas = null
  _painter.image = null
  _painter.actionStyle = {}
  _painter.vectors = {}
  _painter.drawType = null
  // 入参类型检查
  const isFunction = function (fn) {
    return typeof (fn) === 'function'
  }
  const isCanvasElement = function (el) {
    //  检查是否是canvas
    return (el instanceof HTMLCanvasElement)
  }
  const isBoolean = function (bl) {

    return typeof (bl) === 'boolean'
  }
  const errorHandle = function (msg) {
    console.error(msg)
  }
  const paramsCheck = function () {

    if (!_opt.canvas || !_opt.originImgSrc) {
      errorHandle('canvas或者图片src未配置')
      return false
    } else {
      if (!isCanvasElement(_opt.canvas)) {
        errorHandle('canvas属性不是画布元素')
        return false
      }

      return true
    }


  }

  const assign = function (target, origin) {
    // let obj = {}
    if (target && origin) {
      Object.keys(origin).forEach(key => {
        if (!target[key]) {
          target[key] = origin[key]
        }
      })
      return target
    }
    return null
  }

  if (!opt) {
    errorHandle('请配置初始属性')
    return
  }

  const _opt = assign(opt, defaultOption)
  if (!paramsCheck()) {
    return
  }
  // 初始变量
  const canvas = _opt.canvas

  let ctx = _opt.canvas.getContext('2d'), spx, spy
  // 偏移
  let imgX = 0, imgY = 0, translateX = 0, translateY = 0, offsetX, offsetY
  // 缩放
  let scaleType = 1, scaleValue = 1, scaleStep = 0.05
  // 旋转
  let rotateType = 1, rotateDeg = 0
  // 图层相关
  let actionArgs = []
  // mousewheel 
  let mousewheelTimeStamp

  // 原图图层
  let oCvs = document.createElement('canvas')
  const oCtx = oCvs.getContext('2d')


  let actions = []

  // 默认形状

  const defaultVectors = [{
    name: 'rect',
    fn: drawRect
  },{
    name:'circle',
    fn:drawCircle
  }]
  init()

  function init(src) {

    let img = new Image()
    let { canvasWidth, canvasHeight } = _opt
    img.src = src || _opt.originImgSrc
    img.onload = function () {
      _painter.image = img
      _opt.canvas.style.background = opt.canvasBackground
      _opt.canvas.width = (canvasWidth && canvasWidth > img.width) ? canvasWidth : img.width
      _opt.canvas.height = (canvasHeight && canvasHeight > img.height) ? canvasHeight : img.height
      oCvs.width = img.width
      oCvs.height = img.height
      let offset = getInitOffset()
      !_painter.canvas && (_painter.canvas = _opt.canvas)
      !offsetX && (offsetX = offset.x)
      !offsetY && (offsetY = offset.y)
      imgX = offsetX
      imgY = offsetY
      oCtx.clearRect(0, 0, oCvs.width, oCvs.height)
      oCtx.drawImage(_painter.image, 0, 0)
      update()
      _opt.canvas.addEventListener('mousewheel', mouseWheel, false)
      !src && setInitVectors()
    }


  }
  function setInitVectors() {
    defaultVectors.forEach(dv => {
      _painter.addVector({
        name: dv.name,
        draw: dv.fn
      })

    })
  }

  function update() {
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.drawImage(oCvs, 0, 0, oCvs.width, oCvs.height, imgX, imgY, oCvs.width * scaleValue, oCvs.height * scaleValue)
    // ctx.fillRect(imgX,imgY,oCvs.width * scaleValue,oCvs.height * scaleValue)
    // ctx.clip()
    
    if (actions.length > 0) {
      actions.forEach(action => {
        let c = action.canvas


        ctx.drawImage(c, 0, 0, c.width, c.height, imgX, imgY, c.width * scaleValue / action.scale, c.height * scaleValue / action.scale)
      })
    }
  }
  function mouseWheel(e) {
    // if (mousewheelTimeStamp) {
    //   let deltaTimeStamp = e.timeStamp - mousewheelTimeStamp
    //   // console.log('e', deltaTimeStamp)
    //   if(deltaTimeStamp>1000){
        
    //   }
    // }
    mousewheelTimeStamp = e.timeStamp
    scaleStep = 0.01
    if (e.wheelDelta) {
      if (e.wheelDelta < 0) {
        scaleType = 1
      } else {
        scaleType = -1
      }
    } else if (e.detail) {
      if (e.detail < 0) {
        scaleType = 1
      } else {
        scaleType = -1
      }
    }
    scaleAction(e)


  }

  function scaleAction(e) {
    let newScaleValue = scaleValue + scaleStep * scaleType
    imgX = (imgX - e.offsetX) * newScaleValue / scaleValue + e.offsetX
    imgY = (imgY - e.offsetY) * newScaleValue / scaleValue + e.offsetY
    scaleValue = newScaleValue
    update()
  }

  function getInitOffset() {
    let { canvasWidth, canvasHeight } = _opt
    let w = 0, h = 0

    if (canvasWidth && canvasWidth > _painter.image.width) {
      w = (canvasWidth - _painter.image.width) / 2
    }
    if (canvasHeight && canvasHeight > _painter.image.height) {
      h = (canvasHeight - _painter.image.height) / 2
    }
    return {
      x: w,
      y: h
    }
  }

  function drawRect(hb, x, y, x1, y1) {
    let style = assign(_painter.actionStyle, defaultStyle)
    hb.strokeStyle = style.strokeStyle
    hb.lineWidth = style.lineWidth
    let w = x1 - x
    let h = y1 - y
    hb.strokeRect(x, y, w, h)
  }
  function drawCircle(hb, x, y, x1, y1) {
    let style = assign(_painter.actionStyle, defaultStyle)
    hb.strokeStyle = style.strokeStyle
    hb.lineWidth = style.lineWidth
    hb.beginPath()
    let ox = (x + x1)/2
    let oy = (y + y1)/2
    let r = Math.sqrt((x1 - x)*(x1 - x)+(y1 - y)*(y1 - y))/2
    hb.arc(ox,oy,r,0,360*ONE_DEGREE)
    hb.closePath()
    hb.stroke()
  }
  function setActionStyle(styleObj) {
    _painter.actionStyle = assign(styleObj, defaultStyle)
  }

  function setDrawType(type) {
    _painter.drawType = type
    if (type !== 'text') {
      _painter.actionStyle = JSON.parse(JSON.stringify(defaultStyle))
    }
    let canvas = _painter.canvas

    canvas.addEventListener('mousedown', setStartPoint, false)
  }

  function setStartPoint(e) {
    if (!isPointInImage(e)) {
      return
    }
    spx = e.offsetX
    spy = e.offsetY
    canvas.addEventListener('mousemove', move, false)
    canvas.addEventListener('mouseup', stopMove, false)
    canvas.addEventListener('mouseleave', stopMove, false)
  }

  function move(e) {

    if (!isPointInImage(e)) {
      return
    }
    update()
    let drawType = _painter.drawType
    let cv = _painter.vectors[drawType]

    let ex = e.offsetX
    let ey = e.offsetY
    actionArgs = [ctx, spx, spy, ex, ey]
    
    let style = assign(_painter.actionStyle, defaultStyle)
    ctx.strokeStyle = style.strokeStyle
    ctx.globalCompositeOperation = 'source-atop'
    cv.apply(null, [ctx, spx, spy, ex, ey])
    
  }

  function stopMove(e) {
    // console.log('e',e)
    saveLayer()
    canvas.removeEventListener('mousemove', move, false)
    canvas.removeEventListener('mouseup', stopMove, false)
    canvas.removeEventListener('mouseleave', stopMove, false)
  }

  function saveLayer() {
    let temCvs = document.createElement('canvas')

    temCvs.width = oCvs.width * scaleValue
    temCvs.height = oCvs.height * scaleValue
    let temCtx = temCvs.getContext('2d')
    let style = assign(_painter.actionStyle, defaultStyle)
    temCtx.strokeStyle = style.strokeStyle
    temCtx.fillStyle = style.fillStyle
    let arg = JSON.parse(JSON.stringify(actionArgs))
    arg[0] = temCtx
    arg[1] = arg[1] - imgX
    arg[2] = arg[2] - imgY
    arg[3] = arg[3] - imgX
    arg[4] = arg[4] - imgY
    let cv = _painter.vectors[_painter.drawType]
    cv.apply(null, arg)
    actions.push({
      scale: scaleValue,
      imgX: imgX,
      imgY: imgY,
      rotate: rotateDeg,
      vector: cv,
      arg: arg,
      canvas: temCvs
    })
    temCvs = null
  }

  function isPointInImage(e) {
    let x = e.offsetX
    let y = e.offsetY
    let minx = Math.max(0, imgX)
    let maxx = Math.min(canvas.width, imgX + oCvs.width * scaleValue)
    let miny = Math.max(0, imgY)
    let maxy = Math.min(canvas.height, imgY + oCvs.height * scaleValue)
    if (x > minx && x < maxx && y > miny && y < maxy) {
      return true
    }
    return false
  }

  function cancleLastAction() {
    actions.pop()
    update()
  }

  function clearPainter() {
    // 重置初始变量
    actions = []
    imgX = offsetX
    imgY = offsetY
    scaleValue = 1
    scaleStep = 0.05
    // 移除事件
    canvas.removeEventListener('mousemove', move, false)
    canvas.removeEventListener('mouseup', stopMove, false)
    canvas.removeEventListener('mouseleave', stopMove, false)

    oCvs.width = _painter.image.width
    oCvs.height = _painter.image.height

    oCtx.clearRect(0, 0, oCvs.width, oCvs.height)
    oCtx.drawImage(_painter.image, 0, 0)
    
    update()
  }
  function getRotateCvs(r,ccvs,timg){
    let _timg = timg||ccvs
    
    let tcvs = document.createElement('canvas')
    let tctx = tcvs.getContext('2d')
    let rr =r? r*ONE_DEGREE:0
    
    let rw,rh
    switch(r){
      case 90:
        rw = _timg.width
        rh = -_timg.height
        tcvs.width = _timg.height
        tcvs.height = _timg.width
        
        break;
      case 270:case -90:
        rw = -_timg.width
        rh = _timg.height
        tcvs.width = _timg.height
        tcvs.height = _timg.width
        break;
      case 180:
        rw = -_timg.width
        rh = -_timg.height
        tcvs.width = _timg.width
        tcvs.height = _timg.height
        break;
      default:
        rw = _timg.width
        rh = _timg.height
        tcvs.width = rw
        tcvs.height = rh
    }
    tctx.rotate(rr)
    tctx.drawImage(_timg,0,0,_timg.width,_timg.height,0,0,rw,rh)
    tctx.rotate(-rr)
    return tcvs
  }
  function rotateAction(){
    let rcvs = getRotateCvs(rotateDeg,oCvs)
    
    oCvs.width = rcvs.width
    oCvs.height = rcvs.height
    oCtx.drawImage(rcvs,0,0)
    
    imgX = (canvas.width - oCvs.width*scaleValue)/2
    imgY = (canvas.height - oCvs.height*scaleValue)/2
    actions = actions.map(action=>{
      action.canvas = getRotateCvs(rotateDeg, action.canvas)
      return action
    })
    update()
    
  }
  function testO(){
    let tt = document.getElementById('ocvs')
    oCvs.id = 'ocvs'
    oCvs.style.position = 'fixed'
    oCvs.style.right = '10px'
    oCvs.style.top = '10px'
    if(tt){
      document.body.removeChild(tt)
    }
    document.body.appendChild(oCvs)
  }
 
  function clockwiseRotate(){
    rotateDeg = 90
    rotateAction()
  }
  function anticlockwiseRotate(){
   rotateDeg = -90
   rotateAction()
  }
  // 设置样式
  _painter.setActionStyle = setActionStyle
  // 绘制图形
  _painter.setDrawType = setDrawType
  // 撤销
  _painter.cancleLastAction = cancleLastAction

  // 清空重画
  _painter.clearPainter = clearPainter

  // 旋转-顺时针90度
  _painter.clockwiseRotate = clockwiseRotate
  // 逆时针旋转90度
  _painter.anticlockwiseRotate = anticlockwiseRotate
}
Painter.prototype.addVector = function ({ name, draw }) {
  if(typeof name !=='string'){
    console.error('vector name must be string')
    return
  }
  if(typeof draw !=='function'){
    console.error('vector draw must be function')
    return
  }
  let vs = this.vectors
  if (vs.hasOwnProperty(name)) return
  vs[name] = draw

  this.vectors = vs
}

export default Painter