import { InjectType } from "./type";

//aop注入数据的缓存
let aopMap = new WeakMap<any, AopData>();


/**
 * 保存被注入的函数列表
 */
class AopData
{
    //函数开始执行时的调用函数列表
    m_Begin: Array<Function> = []
    //函数结束执行时调用的函数列表
    m_Ending: Array<Function> = []
}

/**
 * 函数调用
 * 
 * @param {Function[]} funcList 函数列表
 * @param {Object} object 源对象
 * @param {any} args 参数列表
 */
function functionCall(funcList: Function[], object: Object, ...args: any[])
{
    for (let f of funcList)
    {
        if (f.call(object, ...args)) //如果函数返回true 那么结束注入.
            return;
    }
}

/**
 * 全局注入装饰器.
 * 
 * @param {Object} target 目标类
 * @param {(string | symbol)} propertyKey 装饰key
 * @param {any} [descriptor] 描述
 */
export function iaop(target: Object, propertyKey: string | symbol, descriptor?: any)
{
    //声明注入数据
    let injectData = new AopData();
    //缓存旧的函数
    let _oldFunc;

    //构建新的函数
    let newFunction = function (...args)
    {
        //调用起始注入的函数列表
        functionCall(injectData.m_Begin, this, ...args);
        //调用原始的函数
        let res = _oldFunc.call(this, ...args);
        //将原始结果加入到参数列表中
        args.push(res);
        //调用结束的注入
        functionCall(injectData.m_Ending, this, ...args);
        return res;
    }
    if (!descriptor)
    {
        let getter = function ()
        {
            if (typeof _oldFunc == "function")
                return newFunction;
            else
            {
                console.warn("warning:this is not a function!")
                return _oldFunc
            }
        };
        let setter = function (newVal)
        {
            _oldFunc = newVal;
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
    else
    {
        _oldFunc = descriptor.value;
        descriptor.value = newFunction
    }
    aopMap.set(newFunction, injectData);
}


/**
 * 返回注入方法.
 */
function Inject(injectType: InjectType): Function
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
        farr.unshift(injectFunction);

        if (farr.length > 20)
            console.warn("aop注入函数个数超过20", injectFunction);

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
        functionArr.unshift(injectFunction);

        if (functionArr.length > 20)
            console.warn("aop注入函数个数超过20", injectFunction);

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

export let begin = Inject(InjectType.begin);
export let end = Inject(InjectType.end);

/**
 * 获得注入的函数名称.
 */
function getInjectFunctionArrayName(name: string, type: InjectType): string
{
    return type + name;
}

/**
 * 初始化注入.
 */
function initInjectFunctionArray(obj: Object, funcName: string): Array<Function>
{
    if (!obj.hasOwnProperty(funcName))
    {
        obj[funcName] = [];
    }
    return obj[funcName];
}

function callFunctionArray(thisArg: Object, name: string, ...args: any[])
{
    let funcList: Array<Function> = thisArg[name];
    if (funcList)
    {
        functionCall(funcList, thisArg, ...args);
    }
}

function callInjectFunctionList(target: Object, funcName: string, type: InjectType, ...args)
{
    callFunctionArray(target, getInjectFunctionArrayName(funcName, type), ...args);
}

/**
 * 初始化注入
 * 
 * @param {Object} target 目标对象
 * @param {string} funcName 目标函数
 */
function initInjectReplace(target: Object, funcName: string)
{
    const key = Symbol.for("__aopinit__" + funcName);
    if (!target.hasOwnProperty(key))
    {
        target[key] = true;
        let oldFunction: Function = target[funcName];
        target[funcName] = function (...args)
        {
            callInjectFunctionList(target, funcName, InjectType.begin, ...args);
            let res = oldFunction.call(target, ...args);
            args.push(res);
            callInjectFunctionList(target, funcName, InjectType.end, ...args);
            return res;
        };
    }
}

/**
 * 返回函数的名称.稳妥起见,你应该传入 {class}.prototype.{function}
 */
export function getFunctionName(target: Object, func: Function): string
{
    if (func.name)
        return func.name;
    for (let key in target)
    {
        if (target[key] == func)
        {
            return key;
        }
    }
}
