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
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    // console.log(code);
    return code;
  }

  /**
   * 将template转换为ast语法树
   * 将ast抽象语法树 转换成 模板字符串 
   * 将模板字符串 封装成 render函数
   * @param {带解析的模板} template 
   */
  function compileToFunction(template) {
    var ast = parseHTML(template);
    // console.log(ast);
    // 将抽象语法树，转换为render函数 _c创建元素，_v创建文本 _s=>JSON.stringif()
    // 模板引擎的原理，with + new Function
    var code = codegen(ast);
    code = "with(this){\n        return ".concat(code, ";\n    }");
    // 根据代码生成render函数
    var render = new Function(code);
    return render;
  }

  var id$1 = 0;

  /**
   * 为每个响应式数据Dep
   */
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; //属性的dep要收集watcher
      this.subs = []; // 这里存放着当前属性对应的watcher有哪些
    }
    /**
     * 响应式数据get的时候，dep会收集当前watcher
     */
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 收集watcher之前，让当前watcher记录当前dep
        // 收集watcher 处理一个存放多个相同的watcher问题
        // 当watcher记录dep
        Dep.target.addDep(this); // 将当前dep实例 传给调用 挂载组件时候调用的 Watcher
      }
      /**
       * 收集watcher
       * @param {*} watcher 
       */
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
        // console.log(this.subs);
      }
      /**
       * 通知更新
       */
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);
    return Dep;
  }(); // 静态属性，只有一份
  Dep.target = null;

  var id = 0;
  /**
   * 1.当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
   * 2.调用_render（）会取值 走到get上
   */
  var Watcher = /*#__PURE__*/function () {
    /**
     * 
     * @param {当前实例} vm 
     * @param {渲染函数} fn 
     */
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      // 不同组件，有不同的watcher，目前只有一个根实例
      this.id = id++;
      this.renderWatcher = options; // boolean 表示是否是一个渲染Watcher
      this.getter = fn; // 意味着调用这个函数可以发生取值操作，_render()
      this.deps = []; // 一个watcher存放多个dep 后续实现计算属性，和一些清理工作需要用到
      this.depsId = new Set();
      this.get();
    }
    /**
     * 让当前watcher记录dep
     * @param {*} dep 
     */
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应多个属性，重复的属性也不用重复记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住dep了而且去重了，此时让dep也记住watcher
        }
        // console.log(this.deps);
      }
      /**
       * 调用这个方法会触发响应式数据get方法-》触发dep收集-》
       */
    }, {
      key: "get",
      value: function get() {
        // 静态属性
        Dep.target = this; // 将watcher实例挂载到dep身上
        this.getter(); // 去vm上取值 触发响应式数据get -》触发dep收集
        Dep.target = null; // 清空实例
      }
      /**
       * 重新渲染
       */
    }, {
      key: "update",
      value: function update() {
        this.get();
      }
    }]);
    return Watcher;
  }(); // 需要给**每个属性**增加一个dep，目的就是收集watcher

  /**
   * h(),_c()
   * 创建虚拟元素节点
   * data=>attrs
   */
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var key = data === null || data === void 0 ? void 0 : data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vNode(vm, tag, key, data, children);
  }
  /**
   * _v()
   * 创建虚拟文本节点
   */
  function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text);
  }
  /**
   * ast做语法层面的转换 描述的是语法本身 div name:value v-for（js css html）
   * 虚拟dom描述的是dom元素，可以增加一些自定义属性 描述dom
   * 
   * @param {*} vm 
   * @param {*} tag 
   * @param {*} key 
   * @param {*} data 
   * @param {*} children 
   * @param {*} text 
   * @returns 
   */
  function vNode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function createElm(vNode) {
    var tag = vNode.tag,
      data = vNode.data,
      children = vNode.children,
      text = vNode.text;
    if (typeof tag === 'string') {
      // 将真实节点和虚拟节点对应起来，后续修改了属性方便更新
      vNode.el = document.createElement(tag);
      // console.log(vNode.el);
      // 更新真实节点上的元素属性
      patchProps(vNode.el, data);
      children.forEach(function (child) {
        vNode.el.appendChild(createElm(child));
      });
    } else {
      vNode.el = document.createTextNode(text);
    }
    return vNode.el;
  }
  function patch(oldVnode, vNode) {
    // 初渲染流程
    var isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      var elm = oldVnode; // 获取真实节点
      var parentElm = elm.parentNode; // 拿到父元素
      var newElm = createElm(vNode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }

  /**
   * 给Vues实例身上拓展方法
   * @param {*} Vue 
   */
  function initLifeCycle(Vue) {
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
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') {
        return value;
      }
      return JSON.stringify(value);
    };

    /**
     * 将虚拟节点转换成真实节点
     */
    Vue.prototype._update = function (vNode) {
      // console.log("update",vNode);
      var vm = this;
      var el = vm.$el;
      // console.log(vNode);
      // console.log(el);
      // 既有初始化的功能，又有更新的功能
      vm.$el = patch(el, vNode); // 拿到渲染完成后的新元素
    };

    Vue.prototype._render = function () {
      var vm = this;
      // console.log("render函数",vm.$options.render.toString());
      // console.log(typeof vm.$options.render);
      // 熏染的时候，会从实例中取值
      // 可以将属性和视图绑定起来
      return vm.$options.render.call(vm);
    };
  }
  /**
   * 
   * @param {vue实例} vm 
   * @param {渲染根节点} el 
   */
  function mountComponent(vm, el) {
    vm.$el = el;
    var updateComponent = function updateComponent() {
      // 1.调用render方法产生虚拟节点 虚拟dom
      var vmDom = vm._render(); // vm.$options.render()
      // 2、根据虚拟DOM产生真实dom
      vm._update(vmDom); // 3.将真实dom插入到el元素中
    };

    new Watcher(vm, updateComponent, true); // true表示是一个渲染Watcher
  }
  // 创造响应式数据，
  // 模板转换成ast语法树，
  // 将ast树转换为render函数[模板字符串拼接成的render函数](产生虚拟节点，使用响应式数据)，render产生虚拟dom
  // 每次节点更新可以只执行render函数
  // 根据虚拟节点创造真实dom

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
   * 代理数据
   * @param {重新定义数据的目标} target 
   * @param {目标的key} key 
   * @param {目标的value} value 
   */
  function defineReactive(target, key, value) {
    // 使用递归，对值为对象的数据，再次进行劫持
    observe(value); // 内部进行判断，如果value不是对象，则结束调用

    var dep = new Dep(); // 给每个属性增加一个dep

    Object.defineProperty(target, key, {
      // 取值的时候
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住当前watcher
        }

        return value;
      },
      // 修改的时候
      set: function set(newValue) {
        if (newValue === value) return;
        // 如果设置的值是一个对象，继续进行代理
        observe(newValue);
        value = newValue;
        dep.notify(); //通知更新
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
          // 需要对模板进行编译 生成render函数(由模板语法组成的函数)，
          // 调用render函数 通过模板语法产生虚拟节点
          var render = compileToFunction(template);
          ops.render = render; // jsx 最终会被 编译成h('xxx')
        }
      }
      // 有render方法
      // ops.render;// 最终就获取render方法
      mountComponent(vm, el); // 组件的挂载
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
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
