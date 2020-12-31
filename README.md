### painter

使用画布对图片进行操作。包括缩放，绘制矩形，绘制自定义形状，撤销操作等。
缩放暂时支持滚轮缩放

使用
<br/>
1.添加包 npm i image-painter 或者 yarn add image-painter
<br/>
2.建立.vue文件
<br/>
```
<template>
 <div class="image_draw_wrapper">
      <div class="btn">
          <button @click="setDrawType('circle')">圆</button>
          <button @click="setDrawType('rect')">矩形</button>
          <button @click="setDrawType('auto')">自定义</button>
          <button @click="cancleLastAction">撤销</button>
          <button @click="clearPainter">重置</button>
          <button @click="clockwiseRotate">顺时针旋转</button>
           <button @click="anticlockwiseRotate">逆时针旋转</button>
      </div>
       <canvas ref="cvs"></canvas>
    </div>
</template>
<script>

import Painter from 'image-painter'

export default{
data(){
        return{
            painter:null,
           
        }
    },
    methods:{
        <!-- 绘制 -->
      setDrawType(type){
        <!-- type:默认可选值：【'rect','circle'】 支持自定义type用法见下文-->
       this.painter.setDrawType(type)
       if(type === 'rect'){
           <!-- 设置样式 属性strokeStyle,fillStyle,lineWidth. -->

           this.painter.setActionStyle({
            strokeStyle:'yellow'
           })
       }
      },
      <!-- 撤销 -->
      cancleLastAction(){
        this.painter.cancleLastAction()
      }
      <!-- 重置 -->
      clearPainter(){
        this.painter.clearPainter()
      },
      <!-- 顺时针 -->
      clockwiseRotate(){
        this.painter.clockwiseRotate()
      },
      <!-- 逆时针 -->
      anticlockwiseRotate(){
        this.painter.anticlockwiseRotate()
      }
    },
    mounted(){
    
      this.painter = new Painter({
          <!-- 画布元素 -->
          canvas:this.$refs.cvs,
          <!-- 图片src 本地测试示例-->
          originImgSrc:require('../assets/tuoqi.jpeg'),
          <!-- 设置画布宽高 -->
          canvasWidth:400,
          canvasHeight:500,
          <!-- 设置画布背景 -->
          canvasBackground:'grey'
      })
    //   自定义轨迹。支持自定义的轨迹 圆、椭圆等，默认的vector暂时只有矩形。其他的可以自己添加
      this.painter.addVector({
          <!-- name为自定义的名称，用于setDrawType内的type -->
          name:'auto',
          draw:function(ctx,x,y,x1,y1){
            <!-- 可在自定义轨迹中定义样式，若未设置，则保持默认样式或setActionStyle中设置的样式-->
            //   ctx.strokeStyle = 'blue'
              ctx.beginPath()
              ctx.moveTo(x,y)
              ctx.lineTo(x1,y1)
              ctx.closePath()
              
              ctx.stroke()
          }
      })
      
    }

</script>
```
<br/>
3.新增重置，恢复至初始状态<br/>
4.新增旋转<br/>

