(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // 匹配 a-zA-Z_其中的一个 匹配多个满足 -.0-9_a-zA-Z
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //?可有可无

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // <div | <a:b
  // console.log(startTagOpen);// 匹配到一个标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // </div |></div:aa>
  // console.log(endTag);// 

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
  // console.log(attribute);// dd="bb" 一共五个分组 匹配345分组
  var startTagClose = /^\s*(\/?)>/;
  // console.log(startTagClose);// div> | br/>
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  // console.log(defaultTagRE);//{{}}

  var TYPES = {
    ELEMENT_TYPE: 1,
    TEXT_TYPE: 3
  };
  /**
   * 解析html,生成抽象语法树
   * @param {带解析的html} html 
   * @returns node
   */
  function parseHTML(html) {
    var stack = []; // 用于存放元素；由 start,chars,end三个方法共同构建的树
    var currentParent; // 指向栈中的最后一个元素

    // 最终的抽象语法树
    var root; // 根节点
    /**
     * 创建一个抽象节点
     * @param {元素标签名} tag 
     * @param {元素属性} attrs 
     * @returns 返回一个对象
     */
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: TYPES.ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    /**
     * 处理解析匹配到的开始标签和内容
     * @param {匹配开始标签名} tag 
     * @param {匹配开始标签属性} attrs 
     */
    function start(tag, attrs) {
      // console.log(tag,attrs,"开始");
      var node = createASTElement(tag, attrs);
      if (!root) {
        // 看一下是否是空树
        root = node; // 如果为空则当前节点为树根
      }
      // 如果有就添加
      if (currentParent) {
        node.parent = currentParent;
        // 把自己添加给父元素
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node;
    }
    /**
     * 处理解析匹配到的文本
     * @param {匹配到的文本} text 
     */
    function chars(text) {
      // console.log(text,"文本");
      text.replace(/\s/g, '') && currentParent.children.push({
        type: TYPES.TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    /**
     * 处理解析匹配到的结束标签标签
     * @param {匹配结束标签名} tag 
     */
    function end(tag) {
      // console.log(tag,"结束");
      stack.pop(); // 弹出最后一个元素
      // 更新currentParent
      currentParent = stack[stack.length - 1];
    }

    /**
     * 
     * @param {缩短的距离} len 
     */
    function advance(len) {
      html = html.substring(len);
    }
    /**
     * 将html中的开始标签中的 标签名 和属性解析出来
     * 并删除匹配到的内容
     * @returns {{tagName:'',attrs:[]}}
     */
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名命名
          attrs: []
        };
        advance(start[0].length);

        // 如果不是结束标签就一直匹配
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          // console.log({
          //     name:attr[1],
          //     value:attr[3]||attr[4]||attr[5]
          //   });
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        // console.log(html);// 将< id="app">内容解析完毕
        return match;
      }
      return false; // 不是开始标签
    }
    // 当html被截取完了就停止了
    while (html) {
      // console.log(html.indexOf('<'));<div>123</div>
      // 如果indexOf中的索引是0，说明是个标签，
      // 如果indexOf中的索引>0，则说明是结束标签位置
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          // console.log("开始标签 和属性",startTagMatch);

          start(startTagMatch.tagName, startTagMatch.attrs);
          // 跳过本次循环
          continue;
        }

        // 第一次匹配开始标签，后面的循环会进入匹配结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          // console.log("结束标签",endTagMatch);
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }
      //>0 textEnd是下一次循环的重新获得的值
      if (textEnd > 0) {
        // 继续截取文本内容 (中间可能是文本，或者空格)
        var text = html.substring(0, textEnd); // 匹配到的文本
        if (text) {
          chars(text);
          advance(text.length);
          // console.log("匹配到的文本:",text);
          // console.log("待解析的字符串:",html);
        }
      }
    }
    // console.log(html,root);
    return root;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
   * 解析抽象语法树中的属性
   * @param {属性} attrs 
   * @returns 
   */
  function genProps(attrs) {
    var str = ''; // {name,value}
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(";").forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  /**
   * 处理元素节点继续转换成抽象语法树
   * 处理文本节点
   * @param {*} node 
   * @returns 
   */
  function gen(node) {
    if (node.type === TYPES.ELEMENT_TYPE) {
      // ele:1,text:3
      return codegen(node);
    } else {
      // 文本

      var text = node.text.trim();
      // test方法会向后继续匹配
      if (!defaultTagRE.test(text)) {
        // console.log(text,"没有{{}}");
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // console.log(text,"包含{{}}");
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          // console.log(match[1]);
          var index = match.index; // 匹配的位置{{name}}123{{age}}456789
          // console.log('-'+text+'-','====',match,"==",index,"匹配的索引位置");
          if (index > lastIndex) {
            // 123
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          // {{name}}
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          // 456789
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  /**
   * 解析语法树中的孩子
   * @param {抽象语法树中的函数} children 
   * @returns 
   */
  function genChildren(children) {
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }
  /**
   * 通过抽象语法树产生render函数
   * @param {抽象语法树} {tag: 'div', type: 1, children: Array(3), attrs: [{name:aa,value:bb}], parent: null}
   * @returns // _c(节点，属性，孩子)
   */
  function codegen(ast) {
    var children = genChildren(ast.children);
    // _c(节点，属性，孩子)
    var code = "\n    _c('".concat(ast.tag, "',\n        ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', "\n        ").concat(ast.children.length > 0 ? ",".concat(children) : '', "\n    )");
    return code;
  }

  /**
   * 将template转换为ast语法树
   * 生成render函数（render方法执行后的返回的结果就是 虚拟dom）
   * @param {带解析的模板} template 
   */
  function compileToFunction(template) {
    var ast = parseHTML(template);
    // console.log(ast);
    // 将抽象语法树，转换为render函数 _c创建元素，_v创建文本 _s=>JSON.stringif()
    // 模板引擎的原理，with + new Function
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    // 根据代码生成render函数
    var render = new Function(code);
    return render;
  }

  // 重写数组中的部分方法

  var oldArrayProto = Array.prototype; // 获取数组的原型
  var newArrayProto = Object.create(oldArrayProto);
  var methods = [
  // 找到所有的变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  // concat slice 不会改变原来的数据
  methods.forEach(function (method) {
    // 代理newArrayProto身上的方法
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 重写数组的方法
      // console.log("method",method);
      // console.log("args",args);
      // 内部调用原来的方法 函数的劫持，切片编程
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      // 对新添加的数据，再次进行劫持
      var inserted; // 需要进行劫持的代码
      var ob = this.__ob__; // 拿到Observe
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          // arr.splice(0,1,{a:1},{b:2})
          // 前两个参数是方法用的，需要截取一下，获取实际参数
          inserted = args.slice(2);
      }
      // console.log("inserted",inserted);
      if (inserted) {
        // 对新增的内容进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  /**
   * 该对象上有一些方法，调用这些方法可以对数据进行响应式代理
   */
  var Observe = /*#__PURE__*/function () {
    // 一开始进入该方法，一定是一个对象，然后才是其他东西
    function Observe(data) {
      _classCallCheck(this, Observe);
      // 想当于给数据加了一个标识，如果数据上有这个属性，说明被观测过
      // data.__ob__ = this;// Observe对象挂载到数据身上，方便使用
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      // 判断用户是否是一个数组
      if (Array.isArray(data)) {
        // 重写数组的方法 7的变异方法 可以修改数组本身
        // 调用data向上查询方法的时候，被调用被劫持的函数
        data.__proto__ = newArrayProto;
        // "[a,{b:13}]",数组中的对象要进行响应式劫持
        this.observeArray(data);
      } else {
        // 不是数组的情况
        this.walk(data);
      }
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
      /**
       * 监听数组中的对象数据
       * @param {待监听的数据} data 
       */
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 对数组中的 对象 数据进行监听，不是对象的数据
        // 被observe return掉了
        data.forEach(function (item) {
          return observe(item);
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
        // 如果设置的值是一个对象，继续进行代理
        observe(newValue);
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
    if (data.__ob__ instanceof Observe) {
      // 标识该对象已经被代理过了
      return data.__ob__;
    }
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
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    /**
     * 对根元素，或者自定义模板，进行模板解析
     * @param {根元素} el 
     */
    Vue.prototype.$mount = function (el) {
      // console.log(el);
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      // 如果没有render函数
      if (!ops.render) {
        var template;
        // 没有写模板，但是有el，使用 #app内部的元素作为模板渲染数据
        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          // 写了模板
          if (el) {
            template = ops.template;
          }
        }
        if (template) {
          // 需要对模板进行编译 生成render函数
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
      // 有render方法
      ops.render; // 最终就获取render方法
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
