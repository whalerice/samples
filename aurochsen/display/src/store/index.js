import Vue from 'vue';
import Vuex from 'vuex';
// import VueAxios from "vue-axios";
import axios from "axios";

Vue.use(Vuex);
const url = 'https://httpbin.org'

export default new Vuex.Store({
  state: {
	team: [
		{ id: 1,teamName: 'Trade Master team',valued : 123589999,operating: 100000000,totalRate: 0.1, rateType: true},
		{ id: 2,teamName: 'Trade Master team',valued : 123589999,operating: 100000000,totalRate: 2.3589, rateType: true },
		{ id: 3,teamName: 'Trade Master team',valued : 123589999,operating: 100000000,totalRate: 2.3589, rateType: true },
		{ id: 4,teamName: 'Trade Master team',valued : 123589999,operating: 100000000,totalRate: 2.3589, rateType: true },
		{ id: 5,teamName: 'Trade Master team',valued : 123589999,operating: 100000000,totalRate: 0.0089, rateType: false },
	],
	today: {},
  },
  mutations: {
    initToday(state, data){
        console.log(data.origin);
        state.today = data;
    },
  },
  actions: {
      async getToday({ commit }) {
          try {
              const response = await axios.get(`${url}/get`);
              if (response.status === 200){
                  commit('initToday', response.data);
                  // setInterval(()=>{
                  //     commit('initToday', response.data);
                  // },5000)
              }
          }catch (error) {
              console.error(error)
          }
      }
  },
  modules: {
	
  }
})

