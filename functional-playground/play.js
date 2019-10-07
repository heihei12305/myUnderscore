import _ from '../lib/es6-functional.js'

// let a = ()=>{
//     // console.log(typeof arg);
//     let b = [1,2,3];
//     let d = arguments;
//     let e = [].slice.call(arguments); 
//     // let c = arg;
//     b[1]++;
// }
// a(1,2,3);

function add(a,b){
    return a+b;
}

console.log(add(1,2));//3

console.log(_.curry(add)(1)(2));//3

// var array = [1,2,3];
// _.tap("fun")((it)=>console.log("value is",it))
// console.log(['1','2','3'].map(_.unary(parseInt)));

// var doPayment = _.once(()=>{
//     console.log("Payment is done");
// })

// doPayment();
// doPayment();

// var array = [1,2,3,4];
// console.log(_.filter(_.map(array,(a)=>{
//     return a % 2;
// }),(a)=>{
//     return 1;
// }))



// // console.log(_.escape('Curly, Larry & Moe'));
// // console.log(_.unescape('Curly, Larry &amp; Moe'));
// let a = [1,[2,[3,4]]];
// console.log(_.flatten(a));


// let a = [1,2,3,4];
// // console.log(_.reduce(a,(acc,next)=>acc+next,0));
// let b = [2,1,2];
// console.log(_.zip(a,b,(l,r)=>l+r));


// let a = {
//     1:1,
//     2:2,
//     3:'a',
//     length:3
// }


// console.log(_.isArrayLike(a));


// _.forEach([1,2,3],(a)=>
// 	_.tap(a)(()=>{
// 		console.log(a);
//     })
// )




// let fc = _.memoized((n)=>{
//     if(n===0){
//         return 1;
//     }
//     return n*fc(n-1);
// })
// console.time(1)
// console.log(fc(10));
// console.timeEnd(1);
// console.time(2);
// console.log(fc(11));
// console.timeEnd(2);


