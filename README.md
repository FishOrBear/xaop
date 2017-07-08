# xaop

Typescript 的Aop实现.
有关AOP编程,其实就是在函数的运行时注入相应的代码,以达到分离实现的目的.(简单的说就是这样...)

所以现在这个库用装饰器实现了一个注入工具.可以直接通过 obj.func 直接输入起始和结束,并且可以得到参数和返回结果.
下面这个例子简单的描述了这个库的使用


##安装
```
npm i xaop
```
##升级
```
npm publish
```
##全局注入
```ts
class E
{
    @iaop
    exec()
    {
        console.log("hello e");
    }
}

let e = new E();
let remove1 = xaop.begin(e.exec, () =>
{
    console.log("begin");
})

let remove2 = xaop.end(e.exec, function()
{
    //如果你不使用箭头函数 你可以捕获到this.
    console.log("end");
})

e.exec();
//begin
//hello e
//end
remove1();//清除注入
remove2();//清除注入
e.exec();
//hello e
```



##对象注入
```ts
class E
{
    exec()
    {
        console.log("hello e");
    }
}

let e=new E()
let e2=new E();
xaop.begin(e,e.exec,()=>{
    console.log("hello begin");
})

e.exec();
/*
hello begin
hello e
*/

//不影响e2的响应
e2.exec()
/*
hello e
*/
```