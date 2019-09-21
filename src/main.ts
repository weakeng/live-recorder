import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'iview/dist/styles/iview.css';
// import '../iview-theme/dist/iview.css';
/*import { Icon,Button, Table,Modal,Input,Select,Option,RadioGroup,Radio,Message,Switch } from 'iview';
Vue.component('Input', Input);
Vue.component('Switch', Switch);
Vue.component('Message', Message);
Vue.component('RadioGroup', RadioGroup);
Vue.component('Select', Select);
Vue.component('Radio', Radio);
Vue.component('Option', Option);
Vue.component('Modal', Modal);
Vue.component('Button', Button);
Vue.component('Table', Table);
Vue.component('Icon', Icon);
Vue.config.productionTip = false;
Vue.prototype.$Message = Message;*/
import iview from 'iview';
Vue.use(iview);
Vue.prototype.recorder_timer=null;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
