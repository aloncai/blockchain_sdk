var BlockchainSdk = require('../lib/index');
var provider = {
    chainType: BlockchainSdk.chainType.BTC,
    // host: '47.244.21.59',
    //host: 'https://btc.fscoin.club',// 正式环境
    host: '47.75.223.192',//T钱包节点
    port: 3002,
    testnet: true, //标志是否为测试网络
    user: "bitcoin", // http basic验证，如果节点没有设置，就不用填
    password: "password"  //btcoin有设置验证，填入的账户密码如例即可
}
var sdk = new BlockchainSdk(provider);
var recipient = 'msYSwDhj4fTpdJ1tFo6AfUrorx4CdpZrcL';
var privateKey = '92iCU7sB9gmHeErXKwENA1rtn81oM2xGPLN5KRh9tBi4aD1KGQE'

var sendtx = async function() {
    // 创建交易
    var txData = await sdk.createTx(
        privateKey,
        recipient,
        '7000', // btc数量
        '4000', //btc数量  //btc的发送也要用btc作为手续费
        "哈哈》？"
    )
    console.log(`txhash: ${JSON.stringify(txData)}`);
    // 发送交易
    var  txHash = await sdk.send(txData);
    console.log(`成功发送交易， hash： ${txHash}`)
}

var getBalance = async function() {
    var balance = await sdk.getBalance('13stNWnht5Ax9zeoae1oXPKYRJFrinZog3');
    console.log(`查询用户${recipient}余额成功： ${balance}`)
}

var findTx = async function() {

    try {
        // var tx = 'de5e337bc2db77b3f418689dbb9e3f437f60bb5f092486e1a55104147a635ccb'
        var tx = '3f706c9517ee05b2ff175bc6a2accd266810972cb936955d3489072ff05d4e76'
        var txData = await sdk.findTx(tx)
        console.log(`tx: ${JSON.stringify(txData)}` )

     }catch(err) {
        console.log(err);
    }
}

var findTransactionByBlock = async function () {
    // 可输入区块hash和高度
    var numberOrHash = 1607068
    var txData = await sdk.findTxByBlock(numberOrHash)

    // for (var i = 0; i < txData.length; i++) {
    //     for(var j = i+1; j < txData.length; j++) {
    //         if(txData[i].txHash == txData[j].txHash) {
    //             throw "sadasds"
    //         }
    //     }
    // }
    console.log(`查询交易成功： ${JSON.stringify(txData)}`)
}

var getLaskBlock = async function () {

    var blockData = await sdk.getLastBlock()

    console.log(`查最新区块成功： ${JSON.stringify(blockData)}`)
}

var createKeypair = function() {
    var keypair =  sdk.createKeypair()

    console.log(`创建公私玥成功： ${JSON.stringify(keypair)}`)
}

var getPublicKeyAndAddress = function() {
    var account =  sdk.getPublicKeyAndAddress('cTcHc5WoJ2GSFNDZU7r27xuiQyfimH3amozfh6HqhboztJFkmWz2')
    console.log(`成功获取公钥和地址： ${JSON.stringify(account)}`)
}

var getAddress = function() {

    var account =  sdk.getPublicKeyAndAddress(privateKey)

    var address =  sdk.getAddress(account.publicKey)

    console.log(`成功获取地址： ${address}`)
}

var getAverageFee = async function() {
    var fee = await sdk.getAverageFee()
    console.log(`获取平均手续费： ${fee}`)
}

var createSeed = function() {
    var seed = BlockchainSdk.createSeed()
    console.log(`成功创建种子成功： ${seed}`);
}

var getPrivateKeyBySeed = function() {
    var seed = BlockchainSdk.createSeed()
    var priv = sdk.getPrivateKeyBySeed(seed);
    console.log(`根据种子 ${seed} 获取私钥成功： ${priv}`);
}


var getTxsByAddress = async function(obj) {
    var arr = await sdk.getTxsByAddress(obj);
    console.log('getTxsByAddress 成功：')
    console.log(arr);
}

var getPendingTxsByAddress = async function(obj) {
    var arr = await sdk.getPendingTxsByAddress(obj);
    console.log('getPendingTxsByAddress 成功：')
    console.log(arr);
}

var validSeed = async function(seed) {
    var flag = await BlockchainSdk.validSeed(seed);
    console.log(`检查种子是否成功： ${flag}`);
}

var checkAddress = function(addr) {
    var flag = sdk.checkAddress(addr);
    console.log(`地址是否合法： ${flag}`);
}
// 发送交易
// sendtx()

//查询余额
// getBalance()

//查询交易
// findTx()

//查询某个区块的所有交易
 findTransactionByBlock()

//查询最新区块
//getLaskBlock();

//创建公私玥
// createKeypair();

// 由私钥获取公钥和地址
// getPublicKeyAndAddress()

//公钥转地址
// getAddress();

// 获取平均手续费
// getAverageFee()

// 创建种子
// createSeed()
//  检查输入的种子
// validSeed("valve split circle comic useless property galaxy history faculty enroll reason only")
// 根据种子获取私钥
// getPrivateKeyBySeed()

// 根据地址分页查询交易 （第三方服务， 不允许在服务端使用）
// getTxsByAddress({
//         address: 'n3BphLes2uvsrLxR9HE4R6UiAsdqkK3Vtd',
//         page: 1,
//         size: 5,
//         addressType: 1,
//         // status: 'failed',
//         // amountSort: 1,
//         time: Date.now(),
//         day:9,
//     })

// 根据地址分页查询所有pending交易 （第三方服务， 不允许在服务端使用）
// getPendingTxsByAddress({
//         address: 'mpgCFVpewymKS982pZjMdgcHTiaxFtY4LV',
//         addressType: 1,
//         // amountSort: 1
//     })

// checkAddress(recipient)
