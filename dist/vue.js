(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  /**
   * 初始化用户状态 data,props,methods,watch...
   * @param {Vue实例对象} vm 
   */
  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    // if(opts.props){
    //   initProps
    // }
    if (opts.data) {
      initData();
    }
  }

  /**
   * 对 options.data 数据进行响应式拦截
   * @param {Vue实例对象} vm 
   */
  function initData(vm) {
    var data = vm.$options.data; // 可能是函数或对象
    data = typeof data === 'function' ? data.call(vm) : data;
  }

  /**
   * 用于给Vue实例身上拓展方法
   * @param {Vue实例对象} Vue 
   */
  function initMixin(Vue) {
    /**
     * 用于初始化操作
     */
    Vue.prototype._init = function (options) {
      var vm = this;
      // 将用户传入的配置数据装载到Vue实例身上，方便其他方法获取配置数据
      vm.$options = options;
      initState(vm);
    };
  }

  /**
   * options:用户传入的选项 data,methods,computed,mounted....
   * 
   */
  function Vue(options) {
    // initMixin在Vue对象上拓展的_init方法的方法
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
