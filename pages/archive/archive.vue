<template>
	<view class="archive_container">

		<uni-search-bar v-model="searchValue" placeholder="请输入你想要了解的珍品~~~" @focus="onSearchBarFocus"
			@blur="onSearchBarBlur" @confirm="search" @cancel="onSearchBarCancel"></uni-search-bar>

		<view class="archive_list">
			<view v-for="archiveItem in filtered_archiveList" :key="archiveItem.id" class="archive_item"
				@click="showDetail(archiveItem.id)">
				<view style="font-size: 42rpx;font-weight: bold;">{{ archiveItem.name }}</view>
				<view style="font-size: 20rpx;">{{archiveItem.create_date}}</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app"
import { local_url, cloud_url } from '@/utils/url.js'
import { useArchiveStore } from '@/store/archiveStore'
const archiveStore = useArchiveStore()


onShow(async () => {
	console.log("Archive Loaded")
	await init_data();
})
onPullDownRefresh(async () => {
	await init_data();
	uni.stopPullDownRefresh();
})
const init_data = async () => {
	try {
		const res = await uni.request({
			method: 'GET',
			url: `${cloud_url}/api/archive/getAllArchives`,
		})
		console.log("getAllArchives:", res.data)
		if (res.data?.success) {
			archiveStore.archiveList = res.data.archiveList
		}
	} catch (e) {
		console.log(e)
	}
}

const filtered_archiveList = computed(() => {
	if(!archiveStore.archiveList){
		return []
	}
	if(!searchValue){
		console.log("filtered:",archiveStore.archiveList)
		return archiveStore.archiveList	;
	}
  const filteredList = archiveStore.archiveList.filter((item) => {
    return item.name.includes(searchValue.value)
  })
  console.log('filtered:',filteredList)
  return filteredList || []
})

const searchValue = ref('')
const onSearchBarFocus = () => {
	console.log("Search Bar Focused")
}
const onSearchBarBlur = () => {
	console.log("Search Bar Blurred")
}
const search = () => {
	console.log("Searching for: " + searchValue.value)
}
const onSearchBarCancel = () => {
	console.log("Search Bar Canceled")
}
const showDetail = (id) => {
  uni.navigateTo({
    url: `/pages/archiveDetail/archiveDetail?id=${id}`
  })
}


</script>
<style lang="scss" scoped>
@import './archive.scss';
</style>