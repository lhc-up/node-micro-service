
/**
 * 方法异常捕获装饰器
 * 
 * 1、用此装饰器来修饰方法，方法中不需要再写try catch语句
 * 2、方法中用到Promise时，需要使用async await语法糖，否则异常无法被catch
 * 3、被修饰的方法中如果使用了try catch语句来捕获异常，如果异常可能是自身产生，则可以使用throw new Error('明确的提示信息')
 *  如果捕获到了其他方法或模块产生的异常，应使用throw error将该异常再往上抛，throw new Error会覆盖原始异常的调用堆栈，使代码变得不可追踪
 *  如果需要添加额外的提示信息，可在error.message上拼接
 *  如果被修饰的方法已属于原子模块，且更底层的异常提示信息无意义，也可以直接使用throw new Error抛出新的异常
 * 4、！！!被修饰的方法由于被async function包裹了一层，所以返回Promise
 * 
 * @param msg 附加的异常提示信息
 * @returns 
 */
export function CatchException(msg?: string) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const sourceMethod = descriptor.value;
        if (!sourceMethod) return;
        descriptor.value = async function (...args: any) {
            try {
                return await sourceMethod.apply(this, args);
            } catch (err: any) {
                if (err instanceof Error) {
                    err.message = (msg ? `[${msg}]` : '') + err.message;
                } else if (typeof err === 'string') {
                    err = (msg ? `[${msg}]` : '') + err;
                }
                throw err;
            }
        }
    }
}