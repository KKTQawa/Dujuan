<template>
  <view class="archive_container">
	  
    <view class="video">
      <video
        v-if="archive_item.video_url"
        :src="archive_item.video_url"
        controls
      />
    </view>
	
    <view class="info">
      <view class="name">{{ archive_item.name }}</view>
      <view class="meta">
<!--        <view style="font-weight:bold;font-size:30rpx;">匠人：</view>
		<text>{{ archive_item.craftman }}</text> -->
		<!-- <view style="font-weight:bold;font-size:30rpx;">{{ archive_item.material }}</view> -->
  <view class="pic-list">
    <view 
      class="pic-card"
      v-for="(pic, index) in archive_item.show_pic_list"
      :key="index"
    >
      <!-- 图片 -->
      <image
        :src="pic.url"
        mode="aspectFill"
        class="pic-item"
        @click="preview(index)"
      ></image>

      <!-- 说明 -->
      <view class="pic-detail">
        {{ pic.detail }}
      </view>

    </view>
  </view>
      </view>
    </view>

    <view class="date">
      创建时间：{{ archive_item.create_date }}
    </view>

    <view class="id">
      档案编号：{{ archive_item.id }}
    </view>

    <view class="qr">
      <image
        v-if="archive_item.QR"
        :src="archive_item.QR"
        mode="widthFix"
      />
    </view>
  </view>
</template>
<script setup>
	import { ref, onMounted,computed } from 'vue'
	import { onShow,onLoad } from "@dcloudio/uni-app"
	import { useArchiveStore } from '@/store/archiveStore'
	const archiveStore=useArchiveStore()
	const archive_item=ref({})
	const id=ref("0")
	onLoad((options) => {
		console.log("options:",options)
		try{
			  const params = new URLSearchParams(
			    decodeURIComponent(options.scene)
			  )
			  id.value = params.get("id")
		}catch(e){
			console.log(e)
			id.value=options.id||"0"
		}finally{
			console.log("init_id:",id.value)
		}

	})
	onShow(() => {
		//console.log("archiveStore:",archiveStore.archiveList)
		archive_item.value=archiveStore.getArchiveItem(id.value)
		console.log("archive_item:",archive_item.value)
	})
const preview = (index) => {
	console.log(archive_item.value.show_pic_list)
	let urls=[]
	for(let i=0;i<archive_item.value.show_pic_list.length;i++){
		urls.push(archive_item.value.show_pic_list[i].url)
	}
  uni.previewImage({
    current: archive_item.value.show_pic_list[index].url,
    urls: urls
  })
}
</script>

<style lang="scss" scoped>
@import './archiveDetail.scss';
</style>