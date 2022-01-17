const PRIVATE_KEY_LENGTH = 64;

const checkPrivateKeyLength = function(privateKey){
    if (
        !privateKey
        || (String(privateKey).indexOf('0x') === 0 && String(privateKey).length !== PRIVATE_KEY_LENGTH +2)
        || (String(privateKey).indexOf('0x') !== 0 && String(privateKey).length !== PRIVATE_KEY_LENGTH)
    )
         throw '私钥长度错误';
}
module.exports = checkPrivateKeyLength;