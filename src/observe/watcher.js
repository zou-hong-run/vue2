import Dep from "./dep";

let id = 0;
/**
 * 1.当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
 * 2.调用_render（）会取值 走到get上
 */

class Watcher{
    /**
     * 
     * @param {当前实例} vm 
     * @param {渲染函数} fn 
     */
    constructor(vm,fn,options){// 不同组件，有不同的watcher，目前只有一个根实例
        this.id = id++;
        this.renderWatcher = options;// boolean 表示是否是一个渲染Watcher
        this.getter = fn;// 意味着调用这个函数可以发生取值操作，_render()
        this.deps = [];// 一个watcher存放多个dep 后续实现计算属性，和一些清理工作需要用到
        this.depsId = new Set();
        this.get();
    }
    /**
     * 让当前watcher记录dep
     * @param {*} dep 
     */
    addDep(dep){// 一个组件对应多个属性，重复的属性也不用重复记录
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); // watcher已经记住dep了而且去重了，此时让dep也记住watcher
        }
        // console.log(this.deps);
    }
    /**
     * 调用这个方法会触发响应式数据get方法-》触发dep收集-》
     */
    get(){
        // 静态属性
        Dep.target = this;// 将watcher实例挂载到dep身上
        this.getter();// 去vm上取值 触发响应式数据get -》触发dep收集
        Dep.target = null;// 清空实例
    }
    /**
     * 重新渲染
     */
    update(){
        
        this.get();
    }
}
// 需要给**每个属性**增加一个dep，目的就是收集watcher
// 一个视图（组件）中 有多少个属性 （n个属性会对应一个视图）===》n个dep对应一个watcher
// 一个属性 对应多个视图（组件）==》 一个dep对应多个组件 wacher
// 多对多关系
export default Watcher;