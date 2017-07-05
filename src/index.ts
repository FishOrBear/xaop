let aopMap = new Map<any, AopData>();


function call(funcArr, ...args)
{
    funcArr.forEach(f =>
    {
        f(...args)
    });
}
export function iaop(target: Object, propertyKey: string | symbol, descriptor?)
{
    let data = new AopData();
    let _oldFunc;
    let newMethon = function (...args)
    {
        call(data.m_Begin, ...args);
        let res = _oldFunc.call(this, ...args);
        args.push(res);
        call(data.m_Ending, ...args);
        return res;
    }
    if (!descriptor)
    {
        var getter = function ()
        {
            if (typeof _oldFunc == "function")
                return newMethon;
            else
            {
                console.warn("warning:this is not a function!")
                return _oldFunc
            }
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
        arr.push(call);
        return () =>
        {
            let index = arr.indexOf(call);
            if (index != -1)
            {
                arr.splice(index, 1)
            }
        }
    }
}