import { parseHTML } from "./parse.js";
import { codegen } from "./codegen";

/**
 * 将template转换为ast语法树
 * 生成render函数（render方法执行后的返回的结果就是 虚拟dom）
 * @param {带解析的模板} template 
 */
export function compileToFunction(template){

    let ast = parseHTML(template);
    // console.log(ast);
    // 将抽象语法树，转换为render函数 _c创建元素，_v创建文本 _s=>JSON.stringif()
    // 模板引擎的原理，with + new Function
    let code = codegen(ast);
    code = `with(this){return ${code}}`;
    // 根据代码生成render函数
    let render = new Function(code);
    return render;
    
}