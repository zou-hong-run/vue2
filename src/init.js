import { compileToFunction } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

/**
 * 用于给Vue实例身上拓展方法
 * @param {Vue实例对象} Vue 
 */
export function initMixin(Vue) {
	/**
	 * 用于初始化操作
	 */
	
	Vue.prototype._init = function (options) {
		const vm = this;
		// 将用户传入的配置数据装载到Vue实例身上，方便其他方法获取配置数据
		// 将vue.$mixin上面的数据，和用户传入的数据混入到一起
		vm.$options = mergeOptions(this.constructor.options,options);// 混入

		callHook(vm,'beforeCreate')

		initState(vm);

		callHook(vm,'create')

		if (options.el) {
			vm.$mount(options.el)
		}

	}
	/**
	 * 对根元素，或者自定义模板，进行模板解析
	 * @param {根元素} el 
	 */
	Vue.prototype.$mount = function (el) {
		// console.log(el);
		const vm = this;
		el = document.querySelector(el);
		let ops = vm.$options;
		// 如果没有render函数
		if (!ops.render) {
			let template;
			// 没有写模板，但是有el，使用 #app内部的元素作为模板渲染数据
			if (!ops.template && el) {
				template = el.outerHTML
			} else {
				// 写了模板
				if (el) {
					template = ops.template
				}
			}
			if (template) {
				// 需要对模板进行编译 生成render函数(由模板语法组成的函数)，
				// 调用render函数 通过模板语法产生虚拟节点
				const render = compileToFunction(template);
				ops.render = render;// jsx 最终会被 编译成h('xxx')
			}
		}
		// 有render方法
		// ops.render;// 最终就获取render方法
		mountComponent(vm, el);// 组件的挂载
	}

}
