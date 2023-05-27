import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {

    
    // 静态方法
    Vue.options = {};
    
    Vue.mixin = function (mixin) {
        // 用户的选项和全局的options合并
        this.options = mergeOptions(this.options, mixin);
        return this;
    }
}
