import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'iview/dist/styles/iview.css';
import iview from 'iview';
import Util from "@/vendor/Util";
import path from "path";

Vue.use(iview);
Vue.prototype.recorder_timer = null;
Vue.prototype.cmdList = {};


new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
