import { TYPES,defaultTagRE } from "./parse.js";
/**
 * 解析抽象语法树中的属性
 * @param {属性} attrs 
 * @returns 
 */
function genProps(attrs){
    let str = '';// {name,value}
    for(let i=0;i<attrs.length;i++){
        let attr = attrs[i];
        if(attr.name === 'style'){
            let obj = {};
            attr.value.split(";").forEach(item=>{
                let [key,value] = item.split(':');
                obj[key] = value;
            })
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`;
}
/**
 * 处理元素节点继续转换成抽象语法树
 * 处理文本节点
 * @param {*} node 
 * @returns 
 */
function gen(node){
    
    if(node.type=== TYPES.ELEMENT_TYPE){// ele:1,text:3
        return codegen(node);
    }else{
        // 文本
        
        let text = node.text.trim()
        // test方法会向后继续匹配
        if(!defaultTagRE.test(text)){
            // console.log(text,"没有{{}}");
            return `_v(${JSON.stringify(text)})`
        }else{
            // console.log(text,"包含{{}}");
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)){
                // console.log(match[1]);
                let index = match.index;// 匹配的位置{{name}}123{{age}}456789
                // console.log('-'+text+'-','====',match,"==",index,"匹配的索引位置");
                if(index>lastIndex){
                    // 123
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))
                }
                // {{name}}
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length;
            }
            if(lastIndex<text.length){
                // 456789
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`

        }
    }
}
/**
 * 解析语法树中的孩子
 * @param {抽象语法树中的函数} children 
 * @returns 
 */
function genChildren(children){
    if(children){
        return children.map(child=>gen(child)).join(',')
    }
}
/**
 * 通过抽象语法树产生render函数
 * @param {抽象语法树} {tag: 'div', type: 1, children: Array(3), attrs: [{name:aa,value:bb}], parent: null}
 * @returns // _c(节点，属性，孩子)
 */
export function codegen(ast){
    let children = genChildren(ast.children);
    // _c(节点，属性，孩子)
    let code = `
    _c('${ast.tag}',
        ${ast.attrs.length>0?genProps(ast.attrs):'null'}
        ${ast.children.length>0?`,${children}`:''}
    )`;
    return code
}