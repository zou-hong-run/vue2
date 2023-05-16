import babel from 'rollup-plugin-babel'
export default {
  input:"./src/index.js",
  output:{
    file:"./dist/vue.js", //出口
    name:"Vue",// 全局上增加一个Vue global.Vue
    format:"umd",// 打包格式
    sourcemap:true,// 可以调试代码
  },
  plugins:[
    babel({
      exclude:"node_modules/**",// 排除node_modules所有文件
    })
  ]
}