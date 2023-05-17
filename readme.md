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
- init.js将给Vue扩展其他方法的文件 `_init_`,`$mount`
- state.js专门初始化数据的文件 初始化props,data,computed,watch...等 调用observe.js进行数据代理
- observe/index.js 进行数据的响应式代理
- observe/array.js 对数组的方法进行劫持，将数组的数据进行响应式代理
- compiler/index.js 将模板编译成ast $mount方法调用该文件中的函数
  - parseHTML()
    - advance()
    - createASTElement()
    - start(),chars(),end()
- 