const strats = {};//策略模式
const LIFECYCLE = [
    'beforeCreate', 'created',
];
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {// 如果儿子有父亲有，父是数组
            if (p) {
                return p.concat(c)
            } else {
                // 父不是数组，儿子是数组
                return [c]
            }
        } else {
            // 没有儿子，直接返回
            return p;
        }
    }
});
// strats.data = function () { }
// strats.computed = function () { }
// strats.watch = function () { }

 
export function mergeOptions(parent, child) {
    const options = {};
    for (let key in parent) {
        mergeField(key);
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            // 不在策略中以儿子为主
            options[key] = child[key] || parent[key];
        }
    }
    return options;
}