import { xaop } from '../src/index';
import { E } from '../example/tt';

//注入开始
test('inject begin', () =>
{
    let e = new E();
    expect(e.m_Index).toBe(0);
    xaop.begin(e.increment, () =>
    {
        e.m_Index++;
    })
    e.increment();
    expect(e.m_Index).toBe(2);



    //箭头函数
    e.add(1);
    expect(e.m_Index).toBe(3);
});

//双实例 注入
test('inject two begin', () =>
{
    let e = new E();
    expect(e.m_Index).toBe(0);
    xaop.begin(e.increment, () =>
    {
        e.m_Index++;
    })
    xaop.begin(e.increment, () =>
    {
        e.m_Index++;
    })
    e.increment();
    expect(e.m_Index).toBe(3);
});

//独立注入 不影响另外的实体
test('inject two begin2. independent inject', () =>
{
    let e = new E();
    expect(e.m_Index).toBe(0);
    xaop.begin(e.increment, () =>
    {
        e.m_Index++;
    })
    xaop.begin(e.increment, () =>
    {
        e.m_Index++;
    })
    e.increment();
    expect(e.m_Index).toBe(3);

    let e2 = new E()
    e2.increment()
    expect(e2.m_Index).toBe(1)
});

//注入 捕捉参数
test("inject get param", () =>
{
    let e = new E()
    //注入开始执行
    let tempValue: number
    xaop.begin(e.setIndex, (i: number) =>
    {
        tempValue = i;
    })
    e.setIndex(5);
    expect(tempValue).toBe(5)


})

test("注入函数结束 捕获参数", () =>
{
    let e = new E()
    let param: number;
    let resV: number;
    xaop.end(e.getIndex, (i: number, res: number) =>
    {
        param = i;
        resV = res;
    })
    e.getIndex(1);
    expect(param).toBe(1)
    expect(resV).toBe(1)

    e.getIndex();
    expect(param).toBe(0);
});