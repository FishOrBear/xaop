

import { xaop } from '../src/index';
import { E } from '../example/tt';


test("空测试", () =>
{
    expect(1).toBe(1)
})


// test("箭头函数 注入开始", () =>
// {
//     let e = new E();
//     let f = e.add

//     e.add(1);
//     expect(e.m_Index).toBe(1)



//     let tem;
//     let remove = xaop.begin(e.add, e, (v: number) =>
//     {
//         tem = v;
//     })
//     e.add(2);
//     expect(tem).toBe(2);

//     expect(e.m_Index).toBe(3)

//     e.add(3)
//     expect(tem).toBe(3)

//     remove()
//     e.add(1)
//     expect(tem).toBe(3)

//     //
// })

// test("箭头函数 注入结束", () =>
// {
//     let e = new E();
//     let f = e.add

//     let param
//     let res
//     let remove = xaop.end(e.add, e, (v: number, r: number) =>
//     {
//         param = v;
//         res = r;
//     })

//     e.add(1);

//     expect(e.m_Index).toBe(1);
//     expect(param).toBe(1);
//     expect(res).toBe(1);

//     remove()

//     remove = xaop.end(e.add, e, (v: number, r: number) =>
//     {
//         e.m_Index = 3;
//     })
//     e.add(100)
//     expect(e.m_Index).toBe(3)
//     remove()
// })