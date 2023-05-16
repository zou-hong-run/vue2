// 重写数组中的部分方法

let oldArrayProto = Array.prototype;// 获取数组的原型
export let newArrayProto = Object.create(oldArrayProto)

let methods = [// 找到所有的变异方法
  'push','pop','shift','unshift','reverse','sort','splice'
];
// concat slice 不会改变原来的数据
methods.forEach(method=>{
  // 代理newArrayProto身上的方法
  newArrayProto[method] = function(...args){// 重写数组的方法
    // console.log("method",method);
    // console.log("args",args);
    // 内部调用原来的方法 函数的劫持，切片编程
    const result = oldArrayProto[method].call(this,...args);
    // 对新添加的数据，再次进行劫持
    let inserted;// 需要进行劫持的代码
    let ob = this.__ob__;// 拿到Observe
    switch(method){
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice': // arr.splice(0,1,{a:1},{b:2})
        // 前两个参数是方法用的，需要截取一下，获取实际参数
        inserted = args.slice(2)
      default:
        break;
    }
    // console.log("inserted",inserted);
    if(inserted){
      // 对新增的内容进行观测
      ob.observeArray(inserted)
    }
    return result;
  }
})