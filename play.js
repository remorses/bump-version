const prefix = 'hero'
let pattern = new RegExp('\\[bump if ' + prefix + '\\]')
console.log(pattern)
// pattern = /\[bump if x\]/
const found = `

[bump if hero]


`.search(pattern)
console.log(found)