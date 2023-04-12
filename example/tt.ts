import { begin, iaop, iaop2 } from '../src/index';
export class E
{
    _Index = 0;
    increment()
    {
        this._Index++;
    }
    decrement()
    {
        this._Index--;
    }
    setIndex(i = 6)
    {
        this._Index = i;
    }
    getIndex(add?: number): number
    {
        if (add)
        {
            return this._Index + add;
        }
        return this._Index;
    }
    add = (v: number) =>
    {
        this._Index += v;
        return this._Index;
    };


    @iaop
    update(n?: any)
    {

    }

    @iaop
    static test2()
    {

    }

    static test1()
    {

    }

    // @iaop
    // name = "string";
}


//Lock the __test__


iaop2(E, "test1");


begin(E.test1, () =>
{
    console.log("test1");
});

begin(E.test2, () =>
{
    console.log("test2");
});

begin(E.prototype.update, () =>
{
    console.log("update");
});

E.test1();
E.test2();


let e = new E();
begin(e.update, () =>
{
    console.log("update2");
});
e.update();

let e2 = new E();
e2.update();
