import { observe } from "./observe/index";

/**
 * 初始化用户状态 data,props,methods,watch...
 * @param {Vue实例对象} vm 
 */
export function initState(vm){
  const opts = vm.$options;// 获取所有的选项
  // if(opts.props){
  //   initProps
  // }
  if(opts.data){
    initData(vm)
  }
}
/**
 * 
 * @param {实例} vm 
 * @param {代理数据} target 
 * @param {代理数据的key} key 
 */
function proxy(vm,target,key){
  // vm.name ==> vm._data.name
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key]
    },
    set(newValue){
      vm[target][key] = newValue
    }
  })
}
/**
 * 对 options.data 数据进行响应式拦截
 * @param {Vue实例对象} vm 
 */
function initData(vm){
  // 将对象上的数据重新 赋值了一份，data和源对象断开连接
  let data = vm.$options.data;// 可能是函数或对象
  data = typeof data === 'function'?data.call(vm):data;
  // 给实例对象设置上data，可以获取到代理劫持后的数据
  vm._data = data
  // 对数据进行劫持 vue2采用defineProperty
  observe(data);
  // 将vm._data上的所有数据代理直接代理到实例对象上
  for(let key in data){
    proxy(vm,'_data',key)
  }

}