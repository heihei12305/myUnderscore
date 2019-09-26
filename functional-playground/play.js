import _ from '../lib/es6-functional.js'

// var array = [1,2,3];
// _.tap("fun")((it)=>console.log("value is",it))
// console.log(['1','2','3'].map(_.unary(parseInt)));

// var doPayment = _.once(()=>{
//     console.log("Payment is done");
// })x

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


let a = [1,2,3,4];
// console.log(_.reduce(a,(acc,next)=>acc+next,0));
let b = [];
console.log(_.zip(a,b,()=>1));
