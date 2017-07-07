import { xaop } from '../src/index';
import { E } from '../example/tt';


test("在函数开始的地方注入,并且测试不同的实例", () =>
{
    let e = new E();
    e.decrement()

    expect(e.m_Index).toBe(-1);

    xaop.begin(e, e.decrement, function ()
    {
        this.m_Index += 10;
    })
    e.decrement();
    expect(e.m_Index).toBe(8);


    let e2 = new E();
    e2.decrement();
    expect(e2.m_Index).toBe(-1)
})

test("测试删除注入", () =>
{
    let e = new E()

    let remove = xaop.begin(e, e.add, function ()
    {
        this.m_Index++;
    })
    e.add(2);
    expect(e.m_Index).toBe(3)
    remove()//移除注入.
    e.add(2);
    expect(e.m_Index).toBe(5);
})

test("测试捕获参数", () =>
{
    let e = new E();

    let catchValue;
    let remove = xaop.begin(e, e.setIndex, function (i: number)
    {
        catchValue = i;
    })
    e.setIndex(5);
    expect(catchValue).toBe(5);
})

test("测试捕获返回", () =>
{
    let e = new E()
    let res;
    xaop.end(e, e.getIndex, function (...args: Array<any>)
    {
        res = args[args.length - 1];
    })
    e.getIndex(3);
    expect(res).toBe(3);
})

test("测试修改参数", () =>
{
    let e = new E();
    xaop.begin(e, e.setIndex, function (...args)
    {
        args[0] = 222;
    }
    )
    e.setIndex(1);
    expect(e.m_Index).toBe(1)
})


test("全局注入", () =>
{
    let e = new E();
    let callCout = 0;
    let remove = xaop.begin(e.update, () =>
    {
        callCout++;
    })
    let e2 = new E();
    e2.update();
    expect(callCout).toBe(1)

    e.update()
    expect(callCout).toBe(2)

    remove();
    let v;
    xaop.end(e.update, function (a)
    {
        console.log(this);
        v = a;
    })
    e.update("测试");
    expect(v).toBe("测试");
    e2.m_Index = 3;
    e2.update("")
})


test("once 单次注入", () =>
{
    let e = new E()

    let remove;

    let tem;
    remove = xaop.begin(e, e.add, function ()
    {
        tem = this;
        remove();
    })
    console.log(e);
    console.log(tem);

    e.add(1);
    expect(tem).toBe(e);
    tem = null;
    e.add(2);
    expect(tem).toBe(null);
})