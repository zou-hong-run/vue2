import { parseHTML } from "./parse.js";
import { codegen } from "./codegen";

/**
 * 将template转换为ast语法树
 * 将ast抽象语法树 转换成 模板字符串 
 * 将模板字符串 封装成 render函数
 * @param {带解析的模板} template 
 */
export function compileToFunction(template){

    let ast = parseHTML(template);
    // console.log(ast);
    // 将抽象语法树，转换为render函数 _c创建元素，_v创建文本 _s=>JSON.stringif()
    // 模板引擎的原理，with + new Function
    let code = codegen(ast);
    code = `with(this){
        return ${code};
    }`;
    // 根据代码生成render函数
    let render = new Function(code);
    return render;
    
}