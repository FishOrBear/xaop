# xaop
```ts
class E
{
    @iaop()
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

let remove2 = xaop.end(e.exec, () =>
{
    console.log("end");
})

e.exec();
//begin
//hello e
//end
remove1();
remove2();
e.exec();
//hello e
```
