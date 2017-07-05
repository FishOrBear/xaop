import { iaop } from '../src/index';
export class E
{
    m_Index = 0;
    @iaop
    increment()
    {
        this.m_Index++;
    }
    @iaop
    decrement()
    {
        this.m_Index--;
    }
    @iaop
    setIndex(i)
    {
        this.m_Index = i;
    }
    @iaop
    getIndex(add?: number)
    {
        if (add)
        {
            return this.m_Index + add;
        }
        return this.m_Index;
    }
}


//Lock the __test__