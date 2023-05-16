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

