/**
 * 该对象上有一些方法，调用这些方法可以对数据进行响应式代理
 */
class Observe{
  constructor(data){
    this.walk(data);
  }
  /**
   * 循环该对象所有keys，对所有属性进行代理劫持
   * @param {待劫持的数据对象} data 
   */
  walk(data){
    // 重新定义属性
    Object.keys(data).forEach(key=> defineReactive(data,key,data[key]))
  }
}
/**
 * 
 * @param {重新定义数据的目标} target 
 * @param {目标的key} key 
 * @param {目标的value} value 
 */
export function defineReactive(target,key,value){
  // 使用递归，对值为对象的数据，再次进行劫持
  observe(value);// 内部进行判断，如果value不是对象，则结束调用
  Object.defineProperty(target,key,{
    // 取值的时候
    get(){
      return value;
    },
    // 修改的时候
    set(newValue){
      if(newValue===value)return;
      value = newValue;
    }
  })

}
/**
 * 劫持用户的数据，进行响应式代理
 * 会判断用户的数据里面是不是还是对象
 * 如果还是对象，则会递归调用代理
 * @param {用户选项data中的数据} data 
 */
export function observe(data){
  if(typeof data !== 'object'||data === null){
    return;// 只对对象做劫持
  }
  // 如果一个对象被劫持了，那就不需要再被劫持了
  // 要判断一个对象是否被劫持过了，
  // 可以增添一个实例，用实例来判断是否被劫持过

  return new Observe(data);
}