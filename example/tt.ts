import { iaop } from '../src/index';
export class E
{
    m_Index = 0;
    increment()
    {
        this.m_Index++;
    }
    decrement()
    {
        this.m_Index--;
    }
    setIndex(i)
    {
        this.m_Index = i;
    }
    getIndex(add?: number): number
    {
        if (add)
        {
            return this.m_Index + add;
        }
        return this.m_Index;
    }
    add = (v: number) =>
    {
        this.m_Index += v;
        return this.m_Index;
    }
}


//Lock the __test__