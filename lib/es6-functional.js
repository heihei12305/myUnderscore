//https://github.com/mqyqingfeng/Blog/issues/56
//上面链接是讶羽大佬关于下面函数的分析解释
(function(){
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global)||
        this || {};
        //在浏览器中，除了window属性，我们也可以通过self属性直接访问到Window对象,同时self还可以支持Web Worker
        //Node环境中全局变量为 global
        //node vm（沙盒模型） 中不存在window,也不存在global变量，但我们却可以通过this访问到全局变量
        //在微信小程序中，window和global都是undefined，加上强制使用严格模式，this为undefined,就多了{}


    var ArrayProto = Array.prototype;

    var push = Array.push;

    //因为想要也支持面向对象的方式调用
    //_.reverse('hello') 函数式风格
    //_('hello').reverse();  面向对象风格
    var _ = function(obj){
        
        if(obj instanceof _){
            return obj;
        }
        //示例分析：_([1,2,3]):
            /* 1. 执行 this instanceof _ ,this指向 window,window instanceof _ 为 false,
        !操作符取反，所以执行 new _(obj).
               2.new _(obj)中，this指向实例对象，window instanceof _ 为 true,取反后，代码接着
        执行。
               3.执行 this._wrapped = obj, 函数执行结束。
               4.总结，_([1,2,3])返回一个对象，为{_wrapped:[1,2,3]},该对象原型指向_.prototype
            */
        if(!(this instanceof _)){
            return new _(obj);
        }
        this._wrapped = obj;
    };

    
    //exports.nodeType 防止<div id="exports"></div>产生的window.exports全局变量。
    if(typeof exports != 'undefined' && !exports.nodeType){
        if((typeof module != 'undefined' && !module.nodeType && module.exports)){
        //在nodeJs中，exports是module.exports 的一个引用，当你使用了module.exports = function(){}
        //实际上覆盖了module.exports,但是exports并未发生改变，为了避免后面在修改exports而导致不能正确输出
        //写成这样，将两者保持统一。
            exports = module.exports = _;
        } 
        exports._ = _;
    }else{
       //？不太懂部分,将_挂到全局属性_上
       root._ = _;
    }

    _.VERSION = '0.1';

    //最大安全数
    var MAX_ARRAY_INDEX  = Math.pow(2,53) - 1;

    //判断是否为类数组
    //类数组定义：拥有一个length 属性和若干索引属性的对象
    _.isArrayLike = function(collection){
        var length = collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }

   
    _.each = function(obj,callback){
        
    //一个源于jQuery的通用遍历方法，可用于遍历对象和数组
    //回调函数拥有两个参数：第一个为对象的成员或数组的索引，第二个为对应变量或内容
        //而且可以退出循环
        /*
            //数组遍历
            $.each([0,1,2],function(i,n){
                console.log('item # '+ i + ": " + n)
            })
            //item #0:0
            //item #1:1
            //item #2:2

            //对象遍历
            $.each({name;"John",lang:"JS"},function(i,n){
                console.log('name: '+ i + ",value: " + n)
            })
            //item name,value:John
            //name:lang,value:JS

            //退出循环
            $.each([0,1,2,3,4,5],function(i,n){
                if(i>2){
                    return false;
                }
                console.log("item #"+i+": " + n );
            });
            //item #0:0
            //item #1:1
            //item #2:2
         */

        var length,i = 0;

        //判断类数组对象和数组
        if(_.isArrayLike(obj)){
            //为数组时
            length = obj.length;
            for(;i<length;i++){
                //绑定this到当前遍历元素上，但是call对性能有一丢丢影响
                if(callback.call(obj[i],obj[i],i) === false){
                    //当回调函数返回false的时候，我们就中止循环
                    break;
                }
            }
        }else{
            //为对象时
            for( i in obj){
                if(callback.call(obj[i],obj[i],i) === false){
                    break;
                }
            }
        }
        return obj;
    }

    _.isFunction = function(obj){
        return typeof obj == 'function' || false;
    }
    
    //将obj中所有函数均push进names中
    _.functions = function(obj){
        var names = [];
        for(var key in obj){
            if(_.isFunction(obj[key])){
                names.push(key);
            }
        }
        return names.sort();
    }

    //_.reverse('abc') = 'cba';
    //字符串反转
    _.reverse = function(string){
        return string.split('').reverse().join('');
    }

    //为了支持链式调用，使得返回值中包含 `_chain : true`
    _.chain = function(obj){
        var instance = _(obj);
        instance._chain = true;
        return instance;
    }

    //为了判断是否有_.chain(),即是否采用链式调用
    var chainResult = function (instance, obj){
        return instance._chain?_(obj).chain():obj;
    }

    //将_上的方法复制到_.prototype上
    //因为_([1,2,3])返回一个为{_wrapped:[1,2,3]}的原型指向_.prototype的对象
    //为了调用_函数对象上的方法，我们要把_上的方法复制到_.prototype上
    _.mixin = function(obj){
        _.each(_.functions(obj),function(name){
            var func = _[name] = obj[name];
            //原型链的函数在这里定义！调用的时候就会跳到这里了。
            _.prototype[name] = function(){
                var args = [this._wrapped];
                
                push.apply(args,arguments);

                return chainResult(this,func.apply(_,args));
            };
        });

        return _;
    }

    //用于检查数组的内容是否为一个数字，自定义对象或者其他类型
    //如果数组中全部元素通过传入函数返回均为true，every函数返回true
    _.every = (arr,fn)=>{
        let result = true;
        for(const value of arr){
            result = result && fn(value);
            if(!result){
                break;
            }
        }
        return result;
    }

    //如果数组中的一个元素通过传入的函数返回为true,some函数就返回true
    _.some = (arr,fn)=>{
        let result = false;
        for(const value of arr){
            result = result || fn(value);
            if(result){
                break;
            }
        }
        return result;
    }

    //利用闭包可以记录上下文，实现类似柯里化效果
    //示例：_.tap("fun")((it)=>console.log("value is",it))
    //=>value is fun
    //=>fun
    _.tap = (value)=>
        (fn)=>{
            typeof(fn) === 'function' && fn(value);
            console.log(value);
        }
    
    /*unary任务是接受一个给定的多参数函数，并把它转换为一个只接受一个参数的函数
       可用来应对parseInt中的奇葩问题
       ['1','2','3'].map(unary(parseInt));
        =>[1,2,3]
    */
     _.unary = (fn) =>
        fn.length === 1
          ? fn
          : (arg) => fn(arg);
        
 
    //配合原生sort使用
    /*示例people = {{firsname:'ccfirstNeme',lastname:'aafirstNeme'},
                    {firsname:'bbfirstNeme',lastname:'bbfirstNeme'},
                    {firsname:'aafirstNeme',lastname:'ccfirstNeme'},
            people.sort(_.sortBy('lastname'))
        }*/
    _.sortBy = (property)=>{
        return (a,b)=>{
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result;
        }
    }

    /* 允许开发者只运行一次给定的函数
       依旧利用闭包可以保持上下文的特性完成
       利用apply绑定this指向，设置函数的上下文
    */
    _.once = (fn) =>{
        let done = false;
        return function (){
            return done ? undefined : ((done = true),fn.apply(this,arguments));
        }
    }


    //使函数记住其计算的结果
    _.memoized = (fn,hasher) => {
        const lookupTable = {};

        return (key)=>{
            var address = hasher ? hasher.apply(this,arguments) : key;
            // var address = key;
            return lookupTable[address] || (lookupTable[address] = fn(address));
        }
    }

    let fc = _.memoized((n)=>{
        if(n===0){
            return 1;
        }
        return n*fc(n-1);
    })


    //解决数组问题，投影函数（Projecting Function）,把函数应用于一个值并创建一个新值的过程称为投影。

    //遍历给定数组并使用当前索引作为参数调用传入的函数
    _.forEach = (array,fn)=>{
        for(const value of array){
            fn(value);
        }
    }

    //map与forEach非常相似，区别只是用一个新的数组捕获了结果。
    _.map = (array,fn)=>{
        let results = [];
        for(const value of array){
            results.push(fn(value));
        }
        return results;
    }

    //一个简单的过滤器，因为for of 的强大功能，使得它可以适用于数组和对象。
    _.filter = (array,fn)=>{
        let results = [];
        for(const value of array){
            (fn(value)) ? results.push(value) : undefined;
        }
        return results;
    }

    //把所有嵌套数组连接到一个数组中，也即数组扁平化
    /*数组扁平化小课堂开课啦：
        完全扁平化：
        1. 如果数组的元素都是数字，那么我们可以考虑使用toString方法，[1,[2,[3,4]]].toString().split(',').map((c)=>Number(c));
        2. 利用reduce+递归  
            flatten = (arr)=>arr.reduce((prev,next)=>prev.concat(Array.isArray(next)?flatten(next):next),[]);
        3. 利用...运算符，flatten = (arr)=>{while(arr.some(item=>Array.isArray(item))){
                                    arr = [].concat(...arr);
                                    }
                                    return arr;
                                }

        只去除一层：
        1. flatten = Function.apply.bind([].concat,[]);
                   = (arr)=>[].concat.apply([],arr);
                   = [].concat(...arr)
        2. [].concat(...arr);
            解释：a = [1,[3,2]] => [].concat(1,[3,2]) => [1].concat([3,2]) =>[1,3,2] 
    */
    _.flatten = (arr)=>{
        while(_.some(arr,item=>Array.isArray(item))){
            arr = [].concat(...arr);
        }
        return arr;
    }
    

    //设置累加器并遍历数组（记住累加器上一个值）以生成一个单一元素的过程称为归约数组
    //如果不传入初始值时，只可以遍历数组，但是如果传入初试值，可以遍历数组或者对象
    //所以推荐统一传入初始值
    
    _.reduce = (array,fn,initialValue)=>{
        let accumlator = initialValue === undefined ? array[0] : initialValue;

        if(initialValue === undefined){
            for(let i = 1,len = array.length;i<len;i++){
                accumlator = fn(accumlator,array[i]);
            }
        }else{
                for(const value of array){
                    accumlator = fn(accumlator,value);
                }
        }
        return accumlator;
    }

    //合并两个给定的数组
    _.zip = (leftArr,rightArr,fn)=>{
        let index,len,result = [];
        let [leftArrLen,rightArrLen] = [leftArr.length,rightArr.length];
        for(index = 0,len = Math.min(leftArrLen,rightArrLen);index<len;index++){
            result.push(fn(leftArr[index],rightArr[index]));
        }

        //如果两个数组长度不同，直接在result后面加上多出部分数组
        if(leftArrLen > rightArrLen){
            result = result.concat(leftArr.slice(rightArrLen,leftArrLen));
        }else if(leftArrLen < rightArrLen){
            result = result.concat(rightArr.slice(leftArrLen,rightArrLen));
        }
        return result;


    }

    var escapeMap = {
        '&' : '&amp;',
        '<' : '&lt;',
        '>' : '&gt;',
        '"' : '&quot;',
        "'" : '&#x27;',
        '`' : '&#x60;'
    }
    //将对象的key和value反转
    _.invert = (obj)=>{
        var result = {};
        var keys = Object.keys(obj);
        for(var i = 0,len = keys.length ;i < len;i++){
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    }
    var unescapeMap = _.invert(escapeMap);
    //为了防止XXS攻击
    //转义HTML字符串，替换&，<,>,',"和`字符为字符实体
    //以及反转义
    //_.escape('Curly , Larry & Moe');
    //=>'Curly , Larry &amp; Moe'
    const createEscaper = (map) =>{
        var escaper = (match)=>map[match];
        var source = '(?:'+Object.keys(map).join('|')+')';
        //source = "(?:&|<|>|"|'|`)"
        //或者"(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x60;)"
        var testRegexp = RegExp(source);
        //全局搜索，查找所有匹配项，而不是在第一个匹配项后停止
        var replaceRegexp = RegExp(source,'g');
        return (string)=>{
            string = string == null ? '' : '' + string;
            //replace 中第二个参数可以是个函数
            return testRegexp.test(string) ? string.replace(replaceRegexp,escaper):string;
        }
    }

    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);



    //在数学和计算机科学中，柯里化是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。
    /*
        function add(a,b){
            return a+b;
        }

        add(1,2);//3

        _.curry(add)(1)(2);//3
    */
    _.curry = (fn) => {
        if(typeof fn !== "function"){
            throw Error('No function provided');
        }

        return function curriedFn(...args){
            //...args 使得 args为一个数组
            if(args.length < fn.length){
                return function(){
                    return curriedFn.apply(null,args.concat(
                        //将arguments由类数组转换成数组
                        [].slice.call(arguments)
                    ));
                };
            }
            //当条件失败，由于参数列表的长度和函数参数的长度相等，if代码块将被略过，程序将调用。
            return fn.apply(null,args);
        };
    };

    //偏应用，柯里化是系数是从左往右填的，那如果是从右往左呢？
    //还没来得及写呢

    //复现jQuery中的extends,
    //来自讶羽大佬的[JavaScript专题之从零实现jQuery的extend](https://github.com/mqyqingfeng/Blog/issues/33)

    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;

    function isPlainObject(){
        var proto,Ctor;
        if(!obj || toString.call(obj) !== "[object Object"){
            return false;
        }
        proto = Object.getPrototypeOf(obj);
        if(!proto){
            return true;
        }
        Ctor = hasOwn.call(protom,"constructor") && proto.constructor;
        return typeof Ctor==="function" && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
    }


    _.extend = ()=>{
        //默认不进行深拷贝
        var deep = false;
        var name,options,src,copy,clone,copyIsArray;
        var length = arguments.length;
        //记录要复制的对象下标
        var i = 1;
        //第一个参数不传入布尔值的情况下，target默认是第一个参数
        var target = arguments[0] || {};
        //如果第一个参数是布尔值,第二个参数是target
        if(typeof target == "boolean"){
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        //如果target不是对象，我们是无法进行复制的，所以设为{}
        if(typeof target !== "object" && !isFunction(target)){
            target = {};
        }

        //循环遍历要复制的对象们
        for(;i<length;i++){
            //获取当前对象
            options = arguments[i];
            //要求不能为空，避免extend(a,,b)这种情况
            if(options !== null){
                for(name in options){
                    //目标属性值
                    src = target[name];
                    //要复制的对象的属性值
                    copy = options[name];

                    //解决循环引用
                    if(target === copy){
                        continue;
                    }

                    //要递归的对象必须是 plainObject 或者数组
                    if(deep && copy && (isPlainObject(copy) ||
                       (copyIsArray = Array.isArray(copy)))){
                           //要复制的对象属性值类型需要与目标属性值相同
                           if(copyIsArray){
                               copyIsArray = false;
                               clone = src && Array.isArray(src) ? src : [];
                           }else{
                               clone = src && isPlainObject(src) ? src : {};
                           }

                           target[name] = extend(deep,clone,copy);
                       }else if(copy !== undefined){
                           target[name] = copy;
                       }

                }
            }
        }
        return target;
    };


    //添加函数需要在mixin调用之前
    _.mixin(_);

    _.prototype.value = function(){
        return this._wrapped;
    }
})();


