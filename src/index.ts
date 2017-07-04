let aopMap = new Map<any, AopData>();
export function iaop()
{
    return function (target: Object, propertyKey: string, descriptor?: PropertyDescriptor)
    {
        if (!descriptor)
            descriptor = target[propertyKey];
        let data = new AopData();
        let methon = descriptor.value;
        descriptor.value = function (...args)
        {
            data.m_Begin.forEach(f =>
            {
                f();
            })
            methon.apply(this, args);
            data.m_Ending.forEach(f =>
            {
                f();
            })
        }
        aopMap.set(descriptor.value, data);
    };
}
class AopData
{
    m_Begin = []
    m_Ending = []
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