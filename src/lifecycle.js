/**
 * 给Vues实例身上拓展方法
 * @param {*} Vue 
 */
export function initLifeCycle(Vue){
	Vue.prototype._update = function(){
		console.log("update");
	}
	Vue.prototype._render = function(){
		console.log("render");
	}	
}
/**
 * 
 * @param {vue实例} vm 
 * @param {渲染根节点} el 
 */
export function mountComponent(vm,el){
	// 1.调用render方法产生虚拟节点 虚拟dom
	let vmDom = vm._render();// vm.$options.render()
	// 2、根据虚拟DOM产生真实dom
	vm._update(vmDom);

	// 3.将真实dom插入到el元素中
}
// 创造响应式数据，
// 模板转换成ast语法树，
// 将ast树转换为render函数(产生虚拟节点，使用响应式数据)，
// 每次节点更新可以只执行render函数
// 根据虚拟节点创造真实dom
