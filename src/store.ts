import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    timer:null,
  },
  mutations: {
     setTimer(state, timer) {
            state.timer=timer;
        }
  },
  actions: {

  }
})
