import { compileToFunction } from "./compiler/index";
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
    if(options.el){
      vm.$mount(options.el)
    }

  } 
  /**
   * 对根元素，或者自定义模板，进行模板解析
   * @param {根元素} el 
   */
  Vue.prototype.$mount = function(el){
    // console.log(el);
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;
    // 如果没有render函数
    if(!ops.render){
      let template;
      // 没有写模板，但是有el，使用 #app内部的元素作为模板渲染数据
      if(!ops.template&&el){
        template = el.outerHTML
      }else{
        // 写了模板
        if(el){
          template = ops.template
        }
      }
      if(template){
        // 需要对模板进行编译 生成render函数
        const render = compileToFunction(template);
        ops.render = render;
      }
    }
    // 有render方法
    ops.render;// 最终就获取render方法
  }
}
