const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function myPromise (fn) {
    const that = this;      // 函数可能异步执行，用于获取正确的 this 对象
    that.state = PENDING;
    that.value = null;      // 保存 resolve 或者 reject 中传入的值
    // 保存 then 中的回调
    // 当执行完 Promise 时状态可能还是等待中，这时候应该把 then 中的回调保存起来用于状态改变时使用
    that.resolvedCallbacks = [];
    that.rejectedCallbacks = [];

    function resolve(value) {
        if (that.state === PENDING) {       // Promise/A+ 规范规定只有等待态才可以改变状态
            that.state = RESOLVED;
            that.value = value;
            that.resolvedCallbacks.map(cb => cb(that.value));       // 遍历回调数组并执行
        }
    }
    
    function reject(value) {
        if (that.state === PENDING) {
            that.state = REJECTED;
            that.value = value;
            that.rejectedCallbacks.map(cb => cb(that.value));
        }
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

// then 函数
myPromise.prototype.then = function (onFullfilled, onRejected) {
    const that = this;
    // 两个参数是可选参数，先判断两个参数是否为 function
    // 不是 function 时，需要创建一个函数赋值给对应的参数
    onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : rea => { throw rea };

    if (that.state === PENDING) {
        that.resolvedCallbacks.push(onFullfilled);
        that.rejectedCallbacks.push(onRejected);
    }

    if (that.state === RESOLVED) {
        onFullfilled(that.value);
    }

    if (that.state === REJECTED) {
        onRejected(that.value);
    }
}