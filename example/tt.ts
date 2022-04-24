import { iaop } from '../src/index';
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

    static test()
    {

    }

    // @iaop
    // name = "string";
}


//Lock the __test__
