import { createElementVNode, createTextVNode } from "./vdom/index"

function patchProps(el,props){
	for(let key in props){
		if(key === 'style'){
			for(let styleName in props.style){
				el.style[styleName] = props.style[styleName]
			}
		}else{
			el.setAttribute(key,props[key]);
		}
		
	}
}

function createElm(vNode){
	let {tag,data,children,text} = vNode;
	if(typeof tag === 'string'){
		// 将真实节点和虚拟节点对应起来，后续修改了属性方便更新
		vNode.el = document.createElement(tag);
		// console.log(vNode.el);
		// 更新真实节点上的元素属性
		patchProps(vNode.el,data);
		children.forEach(child=>{
			vNode.el.appendChild(createElm(child));
		})
	}else{
		vNode.el = document.createTextNode(text);
	}
	return vNode.el;
}

function patch(oldVnode,vNode){
	// 初渲染流程
	const isRealElement = oldVnode.nodeType;
	if(isRealElement){
		const elm = oldVnode;// 获取真实节点
		const parentElm = elm.parentNode;// 拿到父元素
		let newElm = createElm(vNode);
		parentElm.insertBefore(newElm,elm.nextSibling)
		parentElm.removeChild(elm);
		return newElm;
	}else{
		// diff算法
	}
}

/**
 * 给Vues实例身上拓展方法
 * @param {*} Vue 
 */
export function initLifeCycle(Vue){
	// render函数
	/**
	 *   _c(
	 * 		'div',
	 * 		{
	 * 			id:"app",
	 * 			style:{
	 * 				"color":"yellow",
	 * 				"font-size":" 24px"
	 * 			}
	 * 		},
	 * 		_v("我是一段文字"),
	 * 		_c(
	 * 			'div',
	 * 			{
	 * 				style:{
	 * 					"color":"red"
	 * 				}
	 * 			},
	 * 			_v(_s(id)+"hello"+_s(name)+"456789")
	 * 		),
	 * 		_c(
	 * 			'span',
	 * 			null,
	 * 			_v("world")
	 * 		)
	 * 	);
	*/

	Vue.prototype._c = function(){
		return createElementVNode(this,...arguments)
	}

	Vue.prototype._v = function(){
		return createTextVNode(this,...arguments)
	}

	Vue.prototype._s = function(value){
		if(typeof value !== 'object'){
			return (value)
		}
		return JSON.stringify(value)

		
	}

	/**
	 * 将虚拟节点转换成真实节点
	 */
	Vue.prototype._update = function(vNode){
		// console.log("update",vNode);
		const vm = this;
		const el = vm.$el;
		// console.log(vNode);
		// console.log(el);
		// 既有初始化的功能，又有更新的功能
		vm.$el = patch(el,vNode);// 拿到渲染完成后的新元素
	}

	Vue.prototype._render = function(){
		const vm = this;
		// console.log("render函数",vm.$options.render.toString());
		// console.log(typeof vm.$options.render);
		// 熏染的时候，会从实例中取值
		// 可以将属性和视图绑定起来
		return vm.$options.render.call(vm);
	}	
}
/**
 * 
 * @param {vue实例} vm 
 * @param {渲染根节点} el 
 */
export function mountComponent(vm,el){
	vm.$el = el;
	// 1.调用render方法产生虚拟节点 虚拟dom
	let vmDom = vm._render();// vm.$options.render()
	// 2、根据虚拟DOM产生真实dom
	vm._update(vmDom);

	// 3.将真实dom插入到el元素中
}
// 创造响应式数据，
// 模板转换成ast语法树，
// 将ast树转换为render函数[模板字符串拼接成的render函数](产生虚拟节点，使用响应式数据)，render产生虚拟dom
// 每次节点更新可以只执行render函数
// 根据虚拟节点创造真实dom
