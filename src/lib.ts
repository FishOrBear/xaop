import { InjectType } from "./type";

type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];
type FunctionPropertys<T> = { [K in keyof T]: T[K] extends (...args: any) => any ? T[K] : never }[keyof T];
type ChangeReturnType<T extends (...args: any) => any, R> = (...args: Parameters<T>) => R;

//aop注入数据的缓存
let aopMap = new WeakMap<any, AopData>();


/**
 * 保存被注入的函数列表
 */
class AopData
{
    //函数开始执行时的调用函数列表
    _Begin: Array<Function> = [];
    //函数结束执行时调用的函数列表
    _Ending: Array<Function> = [];
}

/**
 * 函数调用
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
 * 全局注入装饰器 @iaop
 * @param {Object} target 目标类
 * @param {(string | symbol)} propertyKey 装饰key
 * @param {any} [descriptor] 描述
 */
export function iaop<T extends Object>(target: T, propertyKey: FunctionPropertyNames<T>, descriptor?: any)
{
    //声明注入数据
    let injectData = new AopData();
    //缓存旧的函数
    let _oldFunc: Function;

    //构建新的函数
    let newFunction = function (...args)
    {
        //调用起始注入的函数列表
        functionCall(injectData._Begin, this, ...args);
        //调用原始的函数
        let res = _oldFunc.call(this, ...args);
        //将原始结果加入到参数列表中
        args.push(res);
        //调用结束的注入
        functionCall(injectData._Ending, this, ...args);
        return res;
    };
    if (!descriptor)
    {
        let getter = function ()
        {
            if (typeof _oldFunc == "function")
                return newFunction;//包装注入
            else
            {
                console.error("错误:iaop装饰器只能用于函数");
                return _oldFunc;
            }
        };
        let setter = function (newVal: Function)
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
        descriptor.value = newFunction;
    }
    aopMap.set(newFunction, injectData);
}

//@ts-ignore
function decorate(decorators, target, key, desc)
{
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    //@ts-ignore
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * 手动装饰器
 * @param target A.prototype
 * @param propertyKey "hello"
 */
export function iaop2<T extends Object>(target: T, propertyKey: FunctionPropertyNames<T>)
{
    decorate([iaop], target, propertyKey, null);
}

/**
 * 返回注入方法.
 */
function Inject(injectType: InjectType): Function
{
    function injectAll<F extends (...args: any) => any, I extends ChangeReturnType<F, boolean | void>>(func: F, injectFunction: I)
    {
        if (!aopMap.has(func))
        {
            console.error("错误:注入失败!无法全局注入该函数,因为该函数没有@iaop");
            return;
        }
        let data = aopMap.get(func);
        let farr: Array<Function>;
        switch (injectType)
        {
            case InjectType.begin:
                farr = data._Begin;
                break;
            case InjectType.end:
                farr = data._Ending;
                break;
            default:
                break;
        }
        farr.unshift(injectFunction);

        if (farr.length > 20)
            console.warn("警告:aop注入函数个数超过20!请检查注入是否正常销毁!", injectFunction);

        return function ()
        {
            let index = farr.indexOf(injectFunction);
            if (index != -1)
                farr.splice(index, 1);
        };
    }
    function injectObject<T extends Object, F extends FunctionPropertys<T>, I extends ChangeReturnType<F, boolean | void>>(obj: T, func: F, injectFunction: I)
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
    return function inject(...args: any[])
    {
        if (args.length === 2)
            return injectAll.call(this, ...args);
        else if (args.length === 3)
            return injectObject.call(this, ...args);
    };
}

interface IInject
{
    /**
    * 全局注入 注意:默认参数无法捕获
    * @param func 被注入的函数,需要先用`@iaop`装饰器包裹
    * @param injectFunction 注入函数 当函数返回true时,不再执行后续的注入函数
     * @returns 销毁本次注入的函数
    */
    <F extends (...args: any) => any, I extends ChangeReturnType<F, boolean | void>>(func: F, injectFunction: I): (() => void) | undefined;
    /**
     * 对象注入 注意:默认参数无法捕获
     * @param obj 被注入的对象
     * @param func 被注入的对象的函数
     * @param injectFunction 注入函数 当函数返回true时,不再执行后续的注入函数
     * @returns 销毁本次注入的函数
     */
    <T extends Object, F extends FunctionPropertys<T>, I extends ChangeReturnType<F, boolean | void>>(obj: T, func: F, injectFunction: I): (() => void | undefined);
}

export let begin = Inject(InjectType.begin) as IInject;
export let end = Inject(InjectType.end) as IInject;

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
        obj[funcName] = [];
    return obj[funcName];
}

function callFunctionArray(thisArg: Object, name: string, ...args: any[])
{
    let funcList: Array<Function> = thisArg[name];
    if (funcList)
        functionCall(funcList, thisArg, ...args);
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
function initInjectReplace<T extends Object>(target: T, funcName: string)
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
        if (target[key] == func)
            return key;
}
