import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";



/**
 * options:用户传入的选项 data,methods,computed,mounted....
 * 
 */
function Vue(options){
  // initMixin在Vue对象上拓展的_init方法的方法
  this._init(options)
}
Vue.prototype.$nextTick = nextTick;

initMixin(Vue);

initLifeCycle(Vue);

initGlobalAPI(Vue);




export default Vue;
