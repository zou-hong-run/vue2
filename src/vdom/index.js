
/**
 * h(),_c()
 * 创建虚拟元素节点
 * data=>attrs
 */
export function createElementVNode(vm,tag,data={},...children){
    let key = data?.key;
    if(key){
        delete data.key
    }
    return vNode(vm,tag,key,data,children)
}
/**
 * _v()
 * 创建虚拟文本节点
 */
export function createTextVNode(vm,text){
    return vNode(vm,undefined,undefined,undefined,undefined,text)
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
function vNode(vm,tag,key,data,children,text){
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}