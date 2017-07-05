let aopMap = new Map<any, AopData>();

export function iaop(target: Object, propertyKey: string | symbol, descriptor?)
{
    let data = new AopData();
    let _oldFunc;
    let newMethon = function (...args)
    {
        data.m_Begin.forEach(f =>
        {
            f();
        })
        _oldFunc(...args);
        data.m_Ending.forEach(f =>
        {
            f();
        })
    }
    if (!descriptor)
    {
        var getter = function ()
        {
            return newMethon;
        };
        var setter = function (newVal)
        {
            _oldFunc = newVal;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        })
    }
    else
    {
        _oldFunc = descriptor.value;
        descriptor.value = newMethon
    }
    aopMap.set(newMethon, data);
};
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