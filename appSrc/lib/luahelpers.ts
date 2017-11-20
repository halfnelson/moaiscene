export function escapeLuaString(str: string) {
    return str.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"");
}

export function jsArrayToLua(val: Array<any>): string {
    var properties = val.map(v => jsValueToLua(v)).join(",\n");
    return "{ "+ properties + " }"
}

export function jsObjectToLua(val: any): string {
    if (val.__tolua) {
        return val.__tolua();
    }
    var properties = Object.getOwnPropertyNames(val).map(name => {
        return name + " = " + jsValueToLua(val[name]) 
    }).join(",\n");
    return "{ "+ properties + " }"
}
const LuaExpressionPrefix: string = "$="

export function jsStringToLua(val: string): string {
     if (val.startsWith(LuaExpressionPrefix)) {
         return val.substring(LuaExpressionPrefix.length);
     }
     return '"'+escapeLuaString(val)+'"'
}

export function jsValueToLua(val: any): string {
    if (typeof val == "string") {
        return jsStringToLua(val);
    } 
    
    if (typeof val == "undefined") return "Nil"

    if (typeof val == "boolean") return val ? "true" : "false"

    if (typeof val == "number") return val.toString()

    if (val === null || val === undefined) {
        return "Nil"
    }

    if (typeof val == "object") return  Array.isArray(val) ? jsArrayToLua(val) :  jsObjectToLua(val) 

    throw new Error(`Could not convert JS type to lua: ${typeof val}`);
}

export function jsArgsToLua(args: IArguments): string {
    return Array.from(arguments).map(v=> jsValueToLua(v)).join(", ");
}