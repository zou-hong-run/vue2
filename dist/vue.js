(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /**
   * 该对象上有一些方法，调用这些方法可以对数据进行响应式代理
   */
  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      this.walk(data);
    }
    /**
     * 循环该对象所有keys，对所有属性进行代理劫持
     * @param {待劫持的数据对象} data 
     */
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);
    return Observe;
  }();
  /**
   * 
   * @param {重新定义数据的目标} target 
   * @param {目标的key} key 
   * @param {目标的value} value 
   */
  function defineReactive(target, key, value) {
    // 使用递归，对值为对象的数据，再次进行劫持
    observe(value); // 内部进行判断，如果value不是对象，则结束调用
    Object.defineProperty(target, key, {
      // 取值的时候
      get: function get() {
        return value;
      },
      // 修改的时候
      set: function set(newValue) {
        if (newValue === value) return;
        value = newValue;
      }
    });
  }
  /**
   * 劫持用户的数据，进行响应式代理
   * 会判断用户的数据里面是不是还是对象
   * 如果还是对象，则会递归调用代理
   * @param {用户选项data中的数据} data 
   */
  function observe(data) {
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象做劫持
    }
    // 如果一个对象被劫持了，那就不需要再被劫持了
    // 要判断一个对象是否被劫持过了，
    // 可以增添一个实例，用实例来判断是否被劫持过

    return new Observe(data);
  }

  /**
   * 初始化用户状态 data,props,methods,watch...
   * @param {Vue实例对象} vm 
   */
  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    // if(opts.props){
    //   initProps
    // }
    if (opts.data) {
      initData(vm);
    }
  }
  /**
   * 
   * @param {实例} vm 
   * @param {代理数据} target 
   * @param {代理数据的key} key 
   */
  function proxy(vm, target, key) {
    // vm.name ==> vm._data.name
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  /**
   * 对 options.data 数据进行响应式拦截
   * @param {Vue实例对象} vm 
   */
  function initData(vm) {
    // 将对象上的数据重新 赋值了一份，data和源对象断开连接
    var data = vm.$options.data; // 可能是函数或对象
    data = typeof data === 'function' ? data.call(vm) : data;
    // 给实例对象设置上data，可以获取到代理劫持后的数据
    vm._data = data;
    // 对数据进行劫持 vue2采用defineProperty
    observe(data);
    // 将vm._data上的所有数据代理直接代理到实例对象上
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  /**
   * 用于给Vue实例身上拓展方法
   * @param {Vue实例对象} Vue 
   */
  function initMixin(Vue) {
    /**
     * 用于初始化操作
     */
    Vue.prototype._init = function (options) {
      var vm = this;
      // 将用户传入的配置数据装载到Vue实例身上，方便其他方法获取配置数据
      vm.$options = options;
      initState(vm);
    };
  }

  /**
   * options:用户传入的选项 data,methods,computed,mounted....
   * 
   */
  function Vue(options) {
    // initMixin在Vue对象上拓展的_init方法的方法
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
