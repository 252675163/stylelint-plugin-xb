module.exports = {
    PLUGIN_PREFIX:'xb-style',
    messageFormat:function(ruleName,message){
        if(message){
            return `${message} (${ruleName})`
        }else{
            return `${ruleName}`
        }
    }
}