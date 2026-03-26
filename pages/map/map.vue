<template>

    <view class="map_container" @click='handleclick'>
      <canvas canvas-id="mapCanvas" id="mapCanvas" type="2d" class="canvas" @touchmove="handleTouchMove"
        @touchend="handleTouchEnd" @touchstart="handleTouchStart"></canvas>
		<view>
			<button @click="handlePlay">播放音频</button>
		</view>

<!--     <view class="infos">
		<view v-show="currentMarker">
		<image class="photo" :src="currentMarker?.photo" mode="aspectFill" @click="playAudio(currentMarker?.audio)"/>

       <audio v-if="currentMarker?.audio" class="audio" :src="currentMarker?.audio" controls poster='https://yanjiaomuguo.oss-cn-chengdu.aliyuncs.com/logo2.png'
           :name="currentMarker?.title||' '" :author="currentMarker?.detail||' '"></audio>  
		</view>
		  
      </view> -->

	</view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow,onLoad ,onPullDownRefresh,onReady,onHide} from "@dcloudio/uni-app"
import {map_url,mark_url,marker}from "@/utils/map.js"
const markers=ref([])
onLoad(()=>{
	console.log("map Loaded")

})
onShow(()=>{
	console.log("map Shown")
markers.value=marker
currentMarker.value=markers.value[0]
})
onReady(async() => {

  console.log("map ready")
  
	setTimeout(() => {
	  drawMap()    
	  }, 150);
})

onPullDownRefresh(async() => {
	if(isTouching.value)return
	await drawMap()    
	uni.stopPullDownRefresh();

})

const scale = ref(0.35) // 当前缩放比例
const offsetX = ref(0) // 地图的水平偏移
const offsetY = ref(0) // 地图的垂直偏移
let m_ofx=0
let m_ofy=0
const lastTouch = ref({}) // 用于存储上次触摸的位置,用于判断缩放
const isTouching = ref(false) // 判断是否正在触摸
const currentMarker = ref(null)
let audioCtx = null
let audioCache = {} // 缓存下载过的音频本地路径
const playAudio = (sound_url) => {
	  const src =sound_url|| currentMarker?.value.audio
	  if (!src) return
	  
	  if (!audioCtx) {
	  	  audioCtx = wx.createInnerAudioContext()
	  }
	  audioCtx.stop()
	  audioCtx.src = src
	  audioCtx.volume = 1.0
	  console.log('播放音频:', src)
	  audioCtx.play()
}
// 触摸开始
const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    // 单指滑动，记录起始点位置
	//console.log('touch start')
    isTouching.value = true
    lastTouch.value = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
    }
  } else if (e.touches.length === 2) {
    // 两指缩放
    const distance = getDistance(e.touches)
    lastTouch.value = {
      startDistance: distance,
    }
  }
}

// 触摸移动
const handleTouchMove = (e) => {
  if (isTouching.value && e.touches.length === 1) {
    // 单指滑动
    const deltaX = e.touches[0].clientX - lastTouch.value.startX
    const deltaY = e.touches[0].clientY - lastTouch.value.startY
    offsetX.value = lastTouch.value.offsetX + deltaX/scale.value
    offsetY.value = lastTouch.value.offsetY + deltaY/scale.value
	
	offsetX.value=Math.max(m_ofx,Math.min(0,offsetX.value))
	offsetY.value=Math.max(m_ofy,Math.min(0,offsetY.value))
    //console.log(`offsetX.value:${offsetX.value} offsetY.value:${offsetY.value}` )
    //console.log(`m_ofx:${m_ofx} m_ofy:${m_ofy}`)
    drawMap(false)
  } else if (e.touches.length === 2) {
    // 两指缩放
    const distance = getDistance(e.touches)
    const scaleFactor = distance / lastTouch.value.startDistance
    scale.value = Math.min(Math.max(scale_min,  scale.value* scaleFactor), scale_max) // 限制缩放比例
    lastTouch.value.startDistance = distance
    //console.log('scale.value:', scale.value)
	m_ofx = Math.min(0, W/scale.value- map_w)
	m_ofy = Math.min(0, H/scale.value- map_h)
	
	offsetX.value=Math.max(m_ofx,Math.min(0,offsetX.value))
	offsetY.value=Math.max(m_ofy,Math.min(0,offsetY.value))
   drawMap(false)
  }
}

// 触摸结束
const handleTouchEnd = () => {
	//console.log('touch end')
  isTouching.value = false
}
let zoom_x=0
let zoom_y=0
// 计算两点之间的距离（用于缩放）
const getDistance = (touches) => {
  const x1 = touches[0].clientX
  const y1 = touches[0].clientY
  const x2 = touches[1].clientX
  const y2 = touches[1].clientY
  zoom_x=(x1+x2)/2
  zoom_y=(y1+y2)/2
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

let W=0
let H=0
let map_w=0
let map_h=0
let Node = null
let canvasContext = null
let canvas=null
let image_ref=null
let image_marks=[]

let scale_max=1.5
let scale_min=0.5
const drawerRef=ref(null)
const drawMap = async (is_init = true) => {
  if (!canvasContext || !Node || !canvas) {
    const query = uni.createSelectorQuery()
    if (!query) {
      console.log('query is null')
      return
    }
    query.select('#mapCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        try {
          let { node, width, height } = res[0];
          canvas = node
		  if(!node){
			  console.log('node is null')
			  return
		  }
          canvasContext = canvas.getContext('2d');
          W = width
          H = height
          Node = canvas

          updateMap(is_init)
        } catch (error) {
          console.log("drawChart2D 绘制发生异常: " + error)
        }
      })

  } else {
    await updateMap(is_init)
  }
}
const handleclick = (e) => {
console.log(`off:${offsetX.value} ${offsetY.value} client ${e.touches[0].clientX} ${e.touches[0].clientY} scale:${scale.value}` )
  let x1 = e.touches[0].clientX/scale.value- offsetX.value
  let y1 = e.touches[0].clientY/scale.value- offsetY.value

  for (let i = 0; i < markers.value.length; i++) {
    let x2 = markers.value[i].left 
    let y2 = markers.value[i].top 
	console.log(`${markers.value[i].title} ${x1} ${y1} ${x2} ${y2}`)
    if (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) <= 50/scale.value) {
      console.log(`点击了${markers.value[i].title}`)
	  
		currentMarker.value=markers.value[i]
	  playAudio(currentMarker.value.audio)

	  uni.previewImage({
	    current: 0,
	    urls: currentMarker.value.pics
	  })
	  
	  break
    }
  }
}
let dpr=3
const updateMap = async (isinit = true) => {

  if (isinit) {
    dpr = uni.getSystemInfoSync().devicePixelRatio
    console.log('dpr:', dpr)
    const tempWidth = W * dpr
    const tempHeight = H * dpr
    //设置canvas真实分辨率
    canvas.width = tempWidth
    canvas.height = tempHeight
    console.log(`canvas h:${canvas.width} w:${canvas.height}`)
	
    //canvasContext.scale(dpr*scale.value, dpr*scale.value)
  }
  // 🚀 每次都重置 transform
  canvasContext.setTransform(1, 0, 0, 1, 0, 0)
  
  // 清空画布
  canvasContext.clearRect(0, 0, canvas.width, canvas.height)
  // 重新设置缩放
  canvasContext.translate(zoom_x, zoom_y)
  canvasContext.scale(dpr * scale.value, dpr * scale.value)
  canvasContext.translate(-zoom_x, -zoom_y)

  if (image_ref) {
    try {
      await canvasContext.drawImage(image_ref, offsetX.value, offsetY.value)
	  //画图标
      for (let i = 0; i < image_marks.length; i++) {
      await canvasContext.drawImage(image_marks[i], offsetX.value + markers.value[i].left, offsetY.value + markers.value[i].top,50,50)
      canvasContext.textAlign = 'center'    
      canvasContext.font = "24px PingFang SC"
      canvasContext.fillStyle = markers.value[i].color
      //canvasContext.fillText(markers.value[i].title, offsetX.value +markers.value[i].left+20,  offsetY.value +markers.value[i].top+70)
	  }
    } catch (error) {
      console.error('绘制出错:', error);
    }
    return
  }
  try {
	  //画地图
    uni.getImageInfo({
      src: map_url,
      success(res) {
        if (!map_w || !map_h) {
          console.log("get_image:", res)
          map_w = res.width
          map_h = res.height
          m_ofx = Math.min(0, W/scale.value - map_w)
          m_ofy = Math.min(0, H/scale.value - map_h)
          console.log(`map_w:${map_w},map_h:${map_h},m_ofx:${m_ofx},m_ofy:${m_ofy}`)
          
		  scale_min=Math.max(W/map_w,H/map_h)
		  console.log("scale_min:",scale_min)
        }
        const image = canvas.createImage()
        image.src = res.path
        image.onload = async () => {
          await canvasContext.drawImage(image, offsetX.value, offsetY.value)

          image_ref = image
        }

      },
      fail(err) {
        console.error('获取图片失败:', err);
      }
    })
	//画图标
    for (let i = 0; i < markers.value.length; i++) {
      uni.getImageInfo({
        src: mark_url,
        success(res) {
          console.log('get mark:', res.path)
          let img = canvas.createImage()
          img.src = res.path
          img.onload = async () => {
      await canvasContext.drawImage(img, offsetX.value + markers.value[i].left, offsetY.value + markers.value[i].top,50,50)
      canvasContext.textAlign = 'center'    
      canvasContext.font = "24px PingFang SC"
      canvasContext.fillStyle = markers.value[i].color
      //canvasContext.fillText(markers.value[i].title, offsetX.value +markers.value[i].left+20,  offsetY.value +markers.value[i].top+70)
			image_marks.push(img)
          }
        },
        fail(err) {
          console.error('获取图标失败:', err);
        }
      })

    }
  } catch (error) {
    console.error('绘制出错:', error);
  }

}
const tourl= (audioURL) => {
	console.log("click_url:",audioURL)
	

	  // uni.navigateTo({
	  //   url: `/pages/webview/webview?url=${encodeURIComponent(vr)}`
	  // })

}

</script>
<style lang="scss" scoped>
@import './map.scss';
</style>