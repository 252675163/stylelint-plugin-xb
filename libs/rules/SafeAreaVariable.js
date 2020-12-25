const stylelint = require("stylelint");
const mutil = require("../util")
const ruleName =`${mutil.PLUGIN_PREFIX}/safe-area-variable`;
const declarationValueIndex = require("stylelint/lib/utils/declarationValueIndex")

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected ...",
});
const EnvReg = /(^|\W+)(env\()/g
const ConstantReg = /(^|\W+)(constant\()/g
module.exports = stylelint.createPlugin(ruleName, function (
  primaryOption,
  secondaryOptionObject,
  context
) {
  return function (root, result) {
    
    let judgObj = {}
    root.walkDecls(decl=>{
      let envRes = EnvReg.test(decl.value) 
      let constantReg = ConstantReg.test(decl.value) 
      if(constantReg||envRes){
        let item = judgObj[decl.prop] = judgObj[decl.prop] || []
        item.push({node:decl,isEnv:envRes})
      }
    })
    let errKey = []
    for(let key in judgObj){
      const item = judgObj[key]
       // 如果env在上面,需要调换顺序
      if(item.length===2&&item[0].isEnv){
        errKey.push(key)
        if(context.fix){
          let temp = item[0].node.value
          item[0].node.value=item[1].node.value
          item[1].node.value=temp
        }
       
      }else if(item.length===1){
        //只有一项需要补上
        errKey.push(key)
      }
    }
    if(errKey.length>0){
      errKey.forEach(key=>{
        let item = judgObj[key]
        let flag = item.length === 2
        item.forEach(invalid=>{
          stylelint.utils.report({
            message: flag?'env需要在constant下方':'constant和env需要联用',
            node: invalid.node,
            index: declarationValueIndex(invalid.node),
            result,
            ruleName,
          });
        })
        
      })
    }
    // ... some logic ...
    
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;