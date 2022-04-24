import { E } from '../example/tt';
import { begin, end } from '../src/lib';

test("在函数开始的地方注入,并且测试不同的实例", () =>
{
    let e = new E();
    e.decrement();
    expect(e._Index).toBe(-1);

    begin(e, e.decrement, function ()
    {
        this._Index += 10;
    });
    e.decrement();
    expect(e._Index).toBe(8);


    let e2 = new E();
    e2.decrement();
    expect(e2._Index).toBe(-1);
});

test("测试删除注入", () =>
{
    let e = new E();

    let remove = begin(e, e.add, function (n)
    {
        this._Index++;
    });
    e.add(2);
    expect(e._Index).toBe(3);
    remove();//移除注入.
    e.add(2);
    expect(e._Index).toBe(5);
});

test("测试捕获参数", () =>
{
    let e = new E();

    let catchValue: number;
    let remove = begin(e, e.setIndex, function (i)
    {
        catchValue = i;
    });
    e.setIndex(5);
    expect(catchValue).toBe(5);

    // e.setIndex();
    // 这里不能通过测试. 因为默认构造参数无法捕获.
    // expect(catchValue).toBe(6);
});

test("测试捕获返回", () =>
{
    let e = new E();
    let res: any;
    end(e, e.getIndex, function (...args: Array<any>)
    {
        res = args[args.length - 1];
    });
    e.getIndex(3);
    expect(res).toBe(3);
});

test("测试修改参数", () =>
{
    let e = new E();
    begin(e, e.setIndex, function (...args)
    {
        args[0] = 222;
    });
    e.setIndex(1);
    expect(e._Index).toBe(1);
});


test("全局注入", () =>
{
    let e = new E();
    let callCout = 0;
    let remove = begin(e.update, () =>
    {
        callCout++;
    });
    let e2 = new E();
    e2.update();
    expect(callCout).toBe(1);

    e.update();
    expect(callCout).toBe(2);

    remove();
    let v: any;
    end(e.update, function (a)
    {
        v = a;
    });
    e.update("测试");
    expect(v).toBe("测试");
    e2._Index = 3;
    e2.update("");
});


test("once 单次注入", () =>
{
    let e = new E();

    let remove: () => void;

    let tem: any;
    remove = begin(e, e.add, function ()
    {
        tem = this;
        remove();
    });
    e.add(1);
    expect(tem).toBe(e);
    tem = null;
    e.add(2);
    expect(tem).toBe(null);
});


test("对象 同时注入2个函数", () =>
{
    let e = new E();
    let cout = 0;
    begin(e, e.decrement, () =>
    {
        cout++;
    });

    begin(e, e.increment, () =>
    {
        cout++;
    });

    e.decrement();
    e.increment();

    expect(cout).toBe(2);
});

test("对象注入两次", () =>
{
    let e = new E();

    let i = 0;
    begin(e, e.decrement, () =>
    {
        i++;
        console.log(i);
    });

    begin(e, e.decrement, () =>
    {
        i++;
        console.log(i);
    });

    e.decrement();

    expect(i).toBe(2);

});


test('中断注入', () =>
{
    let e = new E();


    //先注入的 后执行
    begin(e, e.decrement, () =>
    {
        e._Index = 6;
        throw "不应该执行,因为已经被中断";
    });

    //后注入的先执行
    begin(e, e.decrement, () =>
    {
        e._Index = 15;
        return true;//break
    });

    console.log(e._Index);

    e.decrement();

    console.log(e._Index);

    expect(e._Index).toBe(14);
});

test('类型感知', () =>
{
    let e = new E();

    begin(e, e.setIndex, (index) =>
    {
        expect(index).toBe(undefined);//默认参数无法拦截 请不要使用默认参数
    });

    end(e, e.setIndex, (i) =>
    {

    });

    e.setIndex();
});
