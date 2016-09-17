import { jsValueToLua } from './lib/editor'

console.log( jsValueToLua({
    int: 12,
    str: "hi",
    bool: true,
    array: [1,2,3],
    obj: { a: "a", b: "b", nested: {
        c: "c", d: "d"
    }},
    null: null,
    undefined: undefined
}))