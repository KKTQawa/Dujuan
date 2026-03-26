// stores/counter.js
import { defineStore } from 'pinia'

export const useArchiveStore = defineStore('user', {
  state: () => ({
      archiveList:[],
  }),
  getters: {

  },
  actions: {
     getArchiveItem(id){
		 return this.archiveList.find(item => item.id === id)
	 }
  }
})