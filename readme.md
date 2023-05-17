# 源码分析

## 环境搭建

rollup打包类库,体积较小,专注打包类库

安装rollup以及 babel插件

```

npm i rollup rollup-plugin-babel @babel/core @babel/preset-env -D 
```

```

```

rollup -rw  r指定配置文件,w监听项目文件变化

```
// rollup.config.js
export default {
  input:"./src/index.js",
  output:{
    file:"./dist/vue.js", //出口
    name:"Vue",// 全局上增加一个Vue global.Vue
    format:"umd",// 打包格式
    sourcemap:true,// 可以调试代码
  }
}
```

- index.js代码主入口
  - 调用init.js的InitMixin方法
- init.js将给Vue扩展其他方法的文件 
  - `_init_` 调用state.js里面的initState方法，进行数据响应式代理
  - `$mount` 
    - 调用 compile/index方法将模板编译成ast,然后通过ast产生虚拟节点
    - 调用lifecycle.js mountCompent()将虚拟节点渲染到页面上
- state.js专门初始化数据的文件 初始化props,data,computed,watch...等 调用
  - initState() 对用户数据进行响应式拦截 调用observe/index.js里面的observe
- observe/index.js 进行数据的响应式代理
  - Observe() 这个对象上有一些方法可以对数据进行响应代理
  - walk()代理普通对象上的数据
  - observeArray()代理数组上的数据 使用observe/array.js里面的newArrayProto重写数组的部分方法
- observe/array.js 对数组的方法进行劫持，将数组的数据进行响应式代理
- compiler/index.js 将模板编译成ast $mount方法调用该文件中的函数
  - compileToFunction(template) 
    - 该方法调用 compile/parse.js里面的parseHTML(),
    - 和comple/codegen.js里面的codegen()方法
- compile/codgen.js 将ast语法树编译成render函数
  - codegen() 通过抽象语法树 产生render
  - getProps()
  - getChildren()
- compiler/parse.js
  - parseHTML() 解析模板生成ast抽象语法树
    - advance()
    - createASTElement()
    - start(),chars(),end()
- lifecycle.js 对vue扩展`_update`,`_render方法`，
  - initLifeCycle给Vue拓展`_update,_render,_c,_v,_s`方法
    - `_render函数调用render函数[render内部是一个模板语法字符串]调用该函数，该函数会调用_c,_v,_s等方法，这些方法调用vdom/index.js里面的方法创建虚拟节点，最终返回完整的虚拟节点`
  - mountComponent方法
- vdom/index.js 创建虚拟节点
  - createElementVNode 接受模板字符里面的参数，然后组装返回一个新节点
  - createTextVnode