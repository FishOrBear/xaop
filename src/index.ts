
export function iaop(target: Object, propertyKey: string | symbol, descriptor?)
{

};

export namespace xaop
{
    enum InjectType
    {
        begin = "__begin__",
        end = "__end__"
    }

    function getInject(injectType: InjectType)
    {
        return function inject(obj: Object, func: Function, injectFunction: Function)
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
    }
    export let begin = getInject(InjectType.begin);
    export let end = getInject(InjectType.end);

    function getInjectFunctionArrayName(name: string, type: InjectType)
    {
        return type + name;
    }
    function initInjectFunctionArray(obj: Object, funcName: string): Array<Function>
    {
        if (!obj[funcName])
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
        const key = "__aop__init";
        if (!obj[key])
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
    function getFunctionName(obj: Object, f: Function): string
    {
        for (let key in obj)
        {
            if (obj[key] == f)
            {
                return key;
            }
        }
    }
}