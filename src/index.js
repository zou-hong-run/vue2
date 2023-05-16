import { initMixin } from "./init";



/**
 * options:用户传入的选项 data,methods,computed,mounted....
 * 
 */
function Vue(options){
  // initMixin在Vue对象上拓展的_init方法的方法
  this._init(options)
}
initMixin(Vue)

export default Vue;