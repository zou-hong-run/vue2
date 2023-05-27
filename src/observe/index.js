import { newArrayProto } from "./array";
import Dep from "./dep";

/**
 * 该对象上有一些方法，调用这些方法可以对数据进行响应式代理
 */
class Observe {
	// 一开始进入该方法，一定是一个对象，然后才是其他东西
	constructor(data) {
		// data可能是对象，也可能是数组
		// 给每个对象都增加依赖收集 给数组或对象增加东西的时候可以通过dep异步更新
		this.dep = new Dep();

		// 想当于给数据加了一个标识，如果数据上有这个属性，说明被观测过
		// data.__ob__ = this;// Observe对象挂载到数据身上，方便使用
		Object.defineProperty(data, '__ob__', {
			value: this,
			enumerable: false
		})
		// 判断用户是否是一个数组
		if (Array.isArray(data)) {
			// 重写数组的方法 7的变异方法 可以修改数组本身
			// 调用data向上查询方法的时候，被调用被劫持的函数
			data.__proto__ = newArrayProto;
			// "[a,{b:13}]",数组中的对象要进行响应式劫持
			this.observeArray(data);
		} else {// 不是数组的情况
			this.walk(data);
		}
	}
	/**
	 * 循环该对象所有keys，对所有属性进行代理劫持
	 * @param {待劫持的数据对象} data 
	 */
	walk(data) {
		// 重新定义属性
		Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
	}
	/**
	 * 监听数组中的对象数据
	 * @param {待监听的数据} data 
	 */
	observeArray(data) {
		// 对数组中的 对象 数据进行监听，不是对象的数据
		// 被observe return掉了
		data.forEach(item => observe(item))
	}
}
function dependArray(value){
	for (let index = 0; index < value.length; index++) {
		let current = value[index];
		current.__ob__?.dep.depend();
		if(Array.isArray(current)){
			dependArray(current);
		}
		
	}
}

/**
 * 代理数据
 * @param {重新定义数据的目标} target 
 * @param {目标的key} key 
 * @param {目标的value} value 
 */
export function defineReactive(target, key, value) {
	// 使用递归，对值为对象的数据，再次进行劫持
	// 内部进行判断，如果value不是对象，则结束调用
	let childOb = observe(value);// childOb.dep用来依赖收集
	let dep = new Dep();// 给每个属性增加一个dep
	Object.defineProperty(target, key, {
		// 取值的时候
		get() {
			if (Dep.target) {
				dep.depend();// 让这个属性的收集器记住当前watcher
				if(childOb){
					childOb.dep.depend();//让数组本身也实现依赖收集 让watcher记住这个dep
					if(Array.isArray(value)){
						dependArray(value);
					}
				}
			}
			return value;
		},
		// 修改的时候
		set(newValue) {
			if (newValue === value) return;
			// 如果设置的值是一个对象，继续进行代理
			observe(newValue);
			value = newValue;
			dep.notify();//通知更新
		}
	})

}
/**
 * 劫持用户的数据，进行响应式代理
 * 会判断用户的数据里面是不是还是对象
 * 如果还是对象，则会递归调用代理
 * @param {用户选项data中的数据} data 
 */
export function observe(data) {
	if (typeof data !== 'object' || data === null) {
		return;// 只对对象做劫持
	}

	// 如果一个对象被劫持了，那就不需要再被劫持了
	// 要判断一个对象是否被劫持过了，
	// 可以增添一个实例，用实例来判断是否被劫持过
	if (data.__ob__ instanceof Observe) {
		// 标识该对象已经被代理过了
		return data.__ob__;
	}

	return new Observe(data);
}