import { xaop, begin } from '../src/index';
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
// //注入开始
// test('inject begin', () =>
// {
//     let e = new E();
//     expect(e.m_Index).toBe(0);
//     xaop.begin(e.increment, e, () =>
//     {
//         e.m_Index++;
//     })
//     e.increment();
//     expect(e.m_Index).toBe(2);
//     //箭头函数
//     e.add(1);
//     expect(e.m_Index).toBe(3);
// });

// //双实例 注入
// test('inject two begin', () =>
// {
//     let e = new E();
//     expect(e.m_Index).toBe(0);
//     xaop.begin(e.increment, e, () =>
//     {
//         e.m_Index++;
//     })
//     xaop.begin(e.increment, e, () =>
//     {
//         e.m_Index++;
//     })
//     e.increment();
//     expect(e.m_Index).toBe(3);
// });

// //独立注入 不影响另外的实体
// test('inject two begin2. independent inject', () =>
// {
//     let e = new E();
//     let e2 = new E()

//     expect(e.m_Index).toBe(0);
//     xaop.begin(e.increment, e, () =>
//     {
//         e.m_Index++;
//     })
//     e.increment();
//     expect(e.m_Index).toBe(2);
//     e2.increment()
//     expect(e2.m_Index).toBe(1)

//     expect(e.m_Index).toBe(2);
// });

// //注入 捕捉参数
// test("inject get param", () =>
// {
//     let e = new E()
//     //注入开始执行
//     let tempValue: number
//     xaop.begin(e.setIndex, e, (i: number) =>
//     {
//         tempValue = i;
//     })
//     e.setIndex(5);
//     expect(tempValue).toBe(5)


// })

// test("注入函数结束 捕获参数", () =>
// {
//     let e = new E()
//     let param: number;
//     let resV: number;
//     xaop.end(e.getIndex, e, (i: number, res: number) =>
//     {
//         param = i;
//         resV = res;
//     })
//     e.getIndex(1);
//     expect(param).toBe(1)
//     expect(resV).toBe(1)

//     e.getIndex();
//     expect(param).toBe(0);
// });


// test("注入 获得this", () =>
// {
//     let e = new E()
//     let oldValue;
//     xaop.begin(e.setIndex, e, function ()
//     {
//         oldValue = this.getIndex();
//     })
//     e.setIndex(3);
//     expect(e.m_Index).toBe(3);
//     expect(oldValue).toBe(0);
// })

