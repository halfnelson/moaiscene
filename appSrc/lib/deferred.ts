export class Deferred<T> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = function(val?: any) { console.log("resolving", val);  resolve(val); };
            this.reject = reject;
        })
    }

}