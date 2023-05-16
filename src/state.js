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
    initData()
  }
}

/**
 * 对 options.data 数据进行响应式拦截
 * @param {Vue实例对象} vm 
 */
function initData(vm){
  let data = vm.$options.data;// 可能是函数或对象
  data = typeof data === 'function'?data.call(vm):data;

}