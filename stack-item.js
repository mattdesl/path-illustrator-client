//stacks an item onto a list but only up to a certain capacity,
//then starts shifting the first elements out
module.exports = function(list, item, capacity) {
    var ret = null
    if (typeof capacity !== 'number')
        list.push(item)
    else {
        if (list.length < capacity)
            list.push(item)
        else {
            ret = list.shift()
            list.push(item)
        }
    }
    return ret
} 