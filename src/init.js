import { initState } from "./state";

/**
 * 用于给Vue实例身上拓展方法
 * @param {Vue实例对象} Vue 
 */
export function initMixin(Vue){
  /**
   * 用于初始化操作
   */
  Vue.prototype._init = function(options){
    const vm = this;
    // 将用户传入的配置数据装载到Vue实例身上，方便其他方法获取配置数据
    vm.$options = options;

    initState(vm);
  } 
}
