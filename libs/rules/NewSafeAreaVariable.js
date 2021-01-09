const stylelint = require("stylelint");
const mutil = require("../util")
const ruleName = `${mutil.PLUGIN_PREFIX}/new-safe-area-variable`;
const declarationValueIndex = require("stylelint/lib/utils/declarationValueIndex")

// import * as postcss from 'postcss'
const postcss = require('postcss')
const Declaration = require('postcss/lib/declaration')



const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected ...",
});
const EnvReg = /env\(\s*safe-area-inset-(\w+)\)/g
const ConstantReg = /constant\(\s*safe-area-inset-(\w+)\)/g
const VarReg = /var\(\s*--safe-area-inset-(\w+)\)/g
const NOFIX = false
module.exports = stylelint.createPlugin(ruleName, function (
  primaryOption,
  secondaryOptionObject,
  context
) {
  return function (root, result) {
    root.walkRules((rule, index) => {
      let obj = {}
      let arr = []
      let offset = 0
      rule.each((decl, i) => {
        let envRes = EnvReg.test(decl.value)
        let ConstantRes = ConstantReg.test(decl.value)
        let VarRes = VarReg.test(decl.value)
        let item = null
        if (envRes || ConstantRes || VarRes) {
          obj[decl.prop] = obj[decl.prop] || {}
          item = obj[decl.prop]
        }
        if (envRes) {
          item.env = {
            index: i,
            value: decl.value,
            prop: decl.prop,
            type: 'del'
          }

        } else if (ConstantRes) {
          item.constant = {
            index: i,
            value: decl.value,
            prop: decl.prop,
            type: 'del'
          }

        } else if (VarRes) {
          item.var = {
            index: i,
            value: decl.value,
            prop: decl.prop
          }
        }
        if (item) {
          obj[decl.prop] = item
        }
      })
      for (let propKey in obj) {
        let item = obj[propKey]
        let len = Object.keys(item)
        if (len.length === 0) {
          return
        } else if ((item.constant || item.env)) {
          // item.constant.type ='del'
          let copy = item.constant || item.env
          let fixVar = !item.var
          
          let maxindex = 0
          if(!item.constant)maxindex = item.env.index
          else if(!item.env)maxindex = item.constant.index
          else{
            maxindex = item.constant.index > item.env.index ? item.constant.index : item.env.index
          }
          if(fixVar){
            item.var = {
              type: 'add',
              prop: copy.prop,
              index: maxindex,
              value: copy.value.replace(ConstantReg, 'var(--safe-area-inset-$1)')
            }
          }
          if (NOFIX) {
            if (!item.env || (item.constant && item.constant.index < item.env.index)) {
              rule.nodes[item.constant.index + offset].remove()
              offset--
              if (item.env) {
                rule.nodes[item.env.index + offset].remove()
                offset--
              }
            } else {
              if (item.env) {
                rule.nodes[item.env.index + offset].remove()
                offset--
              }
              if (item.constant) {
                rule.nodes[item.constant.index + offset].remove()
                offset--
              }
            }
            if(fixVar){
              rule.insertAfter(rule.nodes[item.var.index + offset + 1], new Declaration({ prop: item.var.prop, value: item.var.value }))
              offset++
            }
          }
        }
      }
      if(NOFIX){
        stylelint.utils.report({
          message: null,
          node: rule,
          result,
          ruleName,
        });
      }else{
        for (let propKey in obj) {
          let item = obj[propKey]
          for (let dKey in item) {
            let sitme = item[dKey]
            if (!sitme.type || sitme.type === 'del') {
              let newValue = ''
              if(context.fix){
                newValue = dKey==='env'?sitme.value.replace(EnvReg, 'var(--safe-area-inset-$1)') :sitme.value.replace(ConstantReg, 'var(--safe-area-inset-$1)')
                rule.nodes[sitme.index].value = newValue
              }
              stylelint.utils.report({
                message: '利用var来代替使用env和constant属性',
                node:rule.nodes[sitme.index],
                index:declarationValueIndex(rule.nodes[sitme.index]),
                result,
                ruleName,
              });
            }
          }
        }
      }
    })
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;