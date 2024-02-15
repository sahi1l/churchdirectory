export function $$(x) {
    let str="section#editPanel "+x;
    let result=$(str);
    return result;
}
//----------------------------------------
export function cmp(a,b) {
    if (a<b) {return -1;}
    if (a>b) {return 1;}
    return 0;
}
//----------------------------------------
export function print(...args) {
    let x = Error().stack.split("\n")[1].split(":").slice(-2).join(":")
    x = "["+x+"]"
    console.debug(x,...args);
}
//----------------------------------------
export function randomID() {
    return String(Math.floor(Math.random()*1e9))
}
//----------------------------------------
