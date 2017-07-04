let aopMap = new Map<any, AopData>();
export function iaop()
{
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor)
    {
        let data = new AopData(target, propertyKey, descriptor);
        aopMap.set(data.exec, data);
    };
}
class AopData
{
    m_Method: any;

    m_Begin = [];
    m_Ending = []
    m_Target
    constructor(target: Object, propertyKey: string, descriptor: PropertyDescriptor)
    {
        this.m_Method = descriptor.value;
        descriptor.value = this.exec;
        this.m_Target = target
    }
    exec = (...args) =>
    {
        this.m_Begin.forEach(f =>
        {
            f.apply(this.m_Target, args);
        })
        let res = this.m_Method.apply(this.m_Target, args);
        args.push(res);
        this.m_Ending.forEach(f =>
        {
            f.apply(this.m_Target, args);
        })
        return res;
    }
}

export namespace xaop
{
    export function begin(f: any, call)
    {
        return registeredFunc(aopMap.get(f).m_Begin, call);
    }
    export function end(f: any, call)
    {
        return registeredFunc(aopMap.get(f).m_Ending, call);
    }

    function registeredFunc(arr: Array<any>, call)
    {
        var index = arr.length;
        arr.push(call);
        return () =>
        {
            arr.splice(index, 1);
        }
    }
}