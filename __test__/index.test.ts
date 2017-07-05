import { xaop, iaop } from '../src/index';
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
});

//双注入
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

//独立注入 不影响
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

