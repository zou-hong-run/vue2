// 匹配 a-zA-Z_其中的一个 匹配多个满足 -.0-9_a-zA-Z
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;//?可有可无

const startTagOpen = new RegExp(`^<${qnameCapture}`);// <div | <a:b
// console.log(startTagOpen);// 匹配到一个标签名
const endTag =  new RegExp(`^<\\/${qnameCapture}[^>]*>`);// </div |></div:aa>
// console.log(endTag);// 

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
// console.log(attribute);// dd="bb" 一共五个分组 匹配345分组
const startTagClose = /^\s*(\/?)>/;
// console.log(startTagClose);// div> | br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
// console.log(defaultTagRE);//{{}}

/**
 * 解析html,生成抽象语法树
 * @param {带解析的html} html 
 * @returns node
 */
function parseHTML(html){
    const TYPES = {
        ELEMENT_TYPE:1,
        TEXT_TYPE:3
    }
    const stack = [];// 用于存放元素；由 start,chars,end三个方法共同构建的树
    let currentParent;// 指向栈中的最后一个元素
    
    // 最终的抽象语法树
    let root;// 根节点
    /**
     * 创建一个抽象节点
     * @param {元素标签名} tag 
     * @param {元素属性} attrs 
     * @returns 返回一个对象
     */
    function createASTElement(tag,attrs){
        return {
            tag,
            type:TYPES.ELEMENT_TYPE,
            children:[],
            attrs,
            parent:null
        }
    }

    /**
     * 处理解析匹配到的开始标签和内容
     * @param {匹配开始标签名} tag 
     * @param {匹配开始标签属性} attrs 
     */
    function start(tag,attrs){
        // console.log(tag,attrs,"开始");
        let node = createASTElement(tag,attrs);
        if(!root){// 看一下是否是空树
            root = node;// 如果为空则当前节点为树根
        }
        // 如果有就添加
        if(currentParent){
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
    function chars(text){
        // console.log(text,"文本");
        text.replace(/\s/g,'') && currentParent.children.push({
            type:TYPES.TEXT_TYPE,
            text,
            parent:currentParent
        })
    }
    /**
     * 处理解析匹配到的结束标签标签
     * @param {匹配结束标签名} tag 
     */
    function end(tag){
        // console.log(tag,"结束");
        let node = stack.pop();// 弹出最后一个元素
        // 更新currentParent
        currentParent = stack[stack.length-1];
    }

    /**
     * 
     * @param {缩短的距离} len 
     */
    function advance(len){  
        html = html.substring(len);
    }
    /**
     * 将html中的开始标签中的 标签名 和属性解析出来
     * 并删除匹配到的内容
     * @returns {{tagName:'',attrs:[]}}
     */
    function parseStartTag(){
        let start = html.match(startTagOpen);
        if(start){
            const match = {
                tagName:start[1],// 标签名命名
                attrs:[]
            }
            advance(start[0].length)

            // 如果不是结束标签就一直匹配
            let attr,end;
            while(
                !(end = html.match(startTagClose)) && 
                (attr = html.match(attribute))
            ){
                advance(attr[0].length);
                // console.log({
                //     name:attr[1],
                //     value:attr[3]||attr[4]||attr[5]
                //   });
                match.attrs.push({
                    name:attr[1],
                    value:attr[3]||attr[4]||attr[5]
                })
            }
            if(end){
                advance(end[0].length)
            }
            // console.log(html);// 将< id="app">内容解析完毕
            return match;
        }

        return false;// 不是开始标签
    }
    // 当html被截取完了就停止了
    while(html){
        // console.log(html.indexOf('<'));<div>123</div>
        // 如果indexOf中的索引是0，说明是个标签，
        // 如果indexOf中的索引>0，则说明是结束标签位置
        let textEnd = html.indexOf('<');
        if(textEnd === 0){
            const startTagMatch = parseStartTag();
            if(startTagMatch){
                // console.log("开始标签 和属性",startTagMatch);

                start(startTagMatch.tagName,startTagMatch.attrs)
                // 跳过本次循环
                continue;
            }

            // 第一次匹配开始标签，后面的循环会进入匹配结束标签
            const endTagMatch = html.match(endTag);
            if(endTagMatch){
                // console.log("结束标签",endTagMatch);
                end(endTagMatch[1]);
                advance(endTagMatch[0].length);
                continue;
            }
        }
        //>0 textEnd是下一次循环的重新获得的值
        if(textEnd>0){
            // 继续截取文本内容 (中间可能是文本，或者空格)
            let text = html.substring(0,textEnd);// 匹配到的文本
            if(text){
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
/**
 * 将template转换为ast语法树
 * 生成render函数（render方法执行后的返回的结果就是 虚拟dom）
 * @param {带解析的模板} template 
 */
export function compileToFunction(template){

    let ast = parseHTML(template);
    console.log(ast);
}