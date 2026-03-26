// stores/counter.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
      hasLogin: false,
      user:null,
	  nickname:null,
	  avatarUrl:null,
	  token:null,
  }),
  getters: {

  },
  actions: {
    login() {
        this.hasLogin = true
    },
	logout() {
		this.hasLogin = false,
		this.user = null,
		this.nickname = null,
		this.avatarUrl = null,
		this.token = null
	}
  }
})