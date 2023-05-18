let id = 0;

/**
 * 为每个响应式数据Dep
 */
class Dep{
    constructor(){
        this.id = id++;//属性的dep要收集watcher
        this.subs = [];// 这里存放着当前属性对应的watcher有哪些
    }
    /**
     * 响应式数据get的时候，dep会收集当前watcher
     */
    depend(){
        // 收集watcher之前，让当前watcher记录当前dep
        // 收集watcher 处理一个存放多个相同的watcher问题
        // 当watcher记录dep
        Dep.target.addDep(this);// 将当前dep实例 传给调用 挂载组件时候调用的 Watcher

    }
    /**
     * 收集watcher
     * @param {*} watcher 
     */
    addSub(watcher){
        this.subs.push(watcher);
        // console.log(this.subs);
    }
    /**
     * 通知更新
     */
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update()
        })
    }
}
// 静态属性，只有一份
Dep.target = null;
export default Dep;