let aopMap = new Map<any, AopData>();

class AopData
{
    m_Begin: Array<Function> = []
    m_Ending: Array<Function> = []
}

//全局注入.
export function iaop(target: Object, propertyKey: string | symbol, descriptor?)
{
    let injectFunctionData = new AopData();
    let _oldFunc;

    function call(funcArr: Array<Function>, obj: Object, ...args)
    {
        funcArr.forEach(f =>
        {
            f.call(obj, ...args);
        });
    }
    let newMethon = function (...args)
    {
        call(injectFunctionData.m_Begin, this, ...args);
        let res = _oldFunc.call(this, ...args);
        args.push(res);
        call(injectFunctionData.m_Ending, this, ...args);
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
    aopMap.set(newMethon, injectFunctionData);
};

enum InjectType
{
    begin = "__begin__",
    end = "__end__"
}

function getInject(injectType: InjectType)
{
    function injectAll(func: Function, injectFunction: Function)
    {
        if (!aopMap.has(func))
        {
            console.warn("不存在的注入.")
            return;
        }
        let data = aopMap.get(func);
        let farr: Array<Function>;
        switch (injectType)
        {
            case InjectType.begin:
                farr = data.m_Begin;
                break;
            case InjectType.end:
                farr = data.m_Ending;
                break;
            default:
                break;
        }
        farr.push(injectFunction);
        return function ()
        {
            let index = farr.indexOf(injectFunction);
            if (index != -1)
            {
                farr.splice(index, 1)
            }
        }
    }
    function injectObject(obj: Object, func: Function, injectFunction: Function)
    {
        let name = getFunctionName(obj, func);
        let beginName = getInjectFunctionArrayName(name, injectType);
        initInjectReplace(obj, name);

        let functionArr: Array<Function> = initInjectFunctionArray(obj, beginName);
        functionArr.push(injectFunction);
        return function ()
        {
            let index = functionArr.indexOf(injectFunction);
            if (index != -1)
                functionArr.splice(index, 1);
        };
    }
    return function inject(...args)
    {
        if (args.length === 2)
        {
            return injectAll.call(this, ...args);
        }
        else if (args.length === 3)
        {
            return injectObject.call(this, ...args);
        }
    }
}
export let begin = getInject(InjectType.begin);
export let end = getInject(InjectType.end);

function getInjectFunctionArrayName(name: string, type: InjectType)
{
    return type + name;
}
function initInjectFunctionArray(obj: Object, funcName: string): Array<Function>
{
    if (!obj.hasOwnProperty(funcName))
    {
        obj[funcName] = [];
    }
    return obj[funcName];
}
function callFunctionArray(obj: Object, name: string, ...args)
{
    let methonList: Array<Function> = obj[name];
    if (methonList)
    {
        methonList.forEach(
            f =>
            {
                f.call(obj, ...args);
            }
        );
    }
}
function initInjectReplace(obj: Object, funcName: string)
{
    const key = "__aopinit__" + funcName;
    if (!obj.hasOwnProperty(key))
    {
        obj[key] = true;
        let oldFunction: Function = obj[funcName];
        obj[funcName] = function (...args)
        {
            let call = function (type: InjectType)
            {
                callFunctionArray(obj, getInjectFunctionArrayName(funcName, type), ...args);
            }
            call(InjectType.begin);
            let res = oldFunction.call(obj, ...args);
            args.push(res);
            call(InjectType.end);
            return res;
        };
    }
}
export function getFunctionName(obj: Object, f: Function): string
{
    for (let key in obj)
    {
        if (obj[key] == f)
        {
            return key;
        }
    }
}