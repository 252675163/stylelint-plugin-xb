const stylelint = require("stylelint");
const declarationValueIndex = require("stylelint/lib/utils/declarationValueIndex")
const mutil = require("../util")
const ruleName =`${mutil.PLUGIN_PREFIX}/primary-color`;
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected ...",
});
const hexReg = /#([0-9A-Za-z]+)/
let checks = [{hex:'007aff',rgb:'0,122,255',vname:'@primary-color'}]
const rgbReg = /rgba?\(([\.0-9,]+)\)/i
module.exports = stylelint.createPlugin(ruleName, function (
  primaryOption,
  secondaryOptionObject,
  context
) {
  return function (root, result) {
    if(!primaryOption||!secondaryOptionObject||secondaryOptionObject.length===0){
      return
    }
    checks = secondaryOptionObject
    let invalids = []
    root.walkDecls(decl=>{
      let hexRes =  decl.value.match(hexReg)
      let rgbRes =  decl.value.match(rgbReg)
      if(hexRes&&hexRes[1]){
        invalid = checks.forEach(check=>{
          if(check.hex.toLocaleLowerCase()===hexRes[1].toLocaleLowerCase()){
            invalids.push({message:mutil.messageFormat(ruleName,`颜色请使用变量${check.vname}替换`),index:declarationValueIndex(decl)+hexRes.index,node:decl,correctValue:decl.value.replace(hexReg,check.vname)})
          }
        })
      }else if(rgbRes&&rgbRes[1]){
        invalid = checks.forEach(check=>{
          let checkrgbArr = check.rgb.split(/\W*,\W*/)
          let rgbResArr = rgbRes[1].split(/\W*,\W*/)
          let flag = checkrgbArr.every((checkrgb,index)=>{
            return checkrgb ===rgbResArr[index]
          })
          
          if(flag){
            invalids.push({message:mutil.messageFormat(ruleName,`颜色请使用变量${check.vname}替换`),index:declarationValueIndex(decl)+rgbRes.index,node:decl,correctValue:decl.value.replace(rgbReg,check.vname)})
          }
        })
      }
    })  
    
    
    if(invalids.length>0){
      if(context.fix){
        for(let item of invalids){
          item.node.value = item.correctValue
        }
        return
      }
      invalids.forEach(invalid=>{
        stylelint.utils.report({
          message: invalid.message,
					node: invalid.node,
					index: invalid.index,
					result,
					ruleName,
        });
      })
    }
    // ... some logic ...
    
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;