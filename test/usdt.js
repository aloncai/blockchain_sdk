var BlockchainSdk = require('../lib/index');
var provider = {
    chainType: BlockchainSdk.chainType.USDT,
    // host: '103.75.1.94', //mainnet
    host: '47.244.21.59',
    // host: '47.56.112.123',//T钱包节点
    port: 3001, //公司服务的端口
    testnet: true,
    // testnet: true, //标志是否为测试网络
    user: "bitcoin", // http basic验证，如果节点没有设置，就不用填
    password: "password",  //btcoin有设置验证，填入的账户密码如例即可
}
var sdk = new BlockchainSdk(provider);
var recipient = '3JJmBeeoBgFDULP4CJAXVLzivud2vihwQm';  //mainnet
var privateKey = '5JgbqQR43FduyPUdt3h4WjJzA7U9JsqyaB2QtD3fSBReKmpxens';
// var recipient = 'msYSwDhj4fTpdJ1tFo6AfUrorx4CdpZrcL';
// var privateKey = '92iCU7sB9gmHeErXKwENA1rtn81oM2xGPLN5KRh9tBi4aD1KGQE'

var sendtx = async function() {
    // 创建交易
    var txData = await sdk.createTx(
        privateKey, 
        recipient,
        '1030', // usdt数量
        '23003', //btc数量  //usdt的发送也要用btc作为手续费
        "哈哈？"
    )
    console.log(`txhash: ${JSON.stringify(txData)}`);
    // txData.txHash = '0200000001ea676523d4019a4dec60267218858429c5873d9c629b903696985c17b48451a6010000006b483045022100be66848ef187751772f8231538b194fbc01bca76561dffb1513de41156c2bc8b02202431446bd39a514ef9db0265b3713baebb14527258650fd420f80b992fa7608d012102e8a578c52584eea4a3f2b7db4a137fa9f2a15875f22e7ef184b85f7a56c42bebfeffffff0322020000000000001976a914c5fc63520c1082c37b76d7d402f7e15fcebcd40c88ac0000000000000000166a146f6d6e69000000000000001f00000000000186a009f20600000000001976a9141f8fee93ee7e093d570b4066806d937ab8169bd788ac00000000'

    // 发送交易
    var  txHash = await sdk.send(txData);
    console.log(`成功发送交易， hash： ${txHash}`)

    // var txData = await sdk.createTx(
    //     privateKey, 
    //     recipient,
    //     '100', // usdt数量
    //     '4002' //btc数量  //usdt的发送也要用btc作为手续费
    // )
    // console.log(`txhash: ${JSON.stringify(txData)}`);
    // // txData.txHash = '0200000001ea676523d4019a4dec60267218858429c5873d9c629b903696985c17b48451a6010000006b483045022100be66848ef187751772f8231538b194fbc01bca76561dffb1513de41156c2bc8b02202431446bd39a514ef9db0265b3713baebb14527258650fd420f80b992fa7608d012102e8a578c52584eea4a3f2b7db4a137fa9f2a15875f22e7ef184b85f7a56c42bebfeffffff0322020000000000001976a914c5fc63520c1082c37b76d7d402f7e15fcebcd40c88ac0000000000000000166a146f6d6e69000000000000001f00000000000186a009f20600000000001976a9141f8fee93ee7e093d570b4066806d937ab8169bd788ac00000000'

    // // 发送交易
    // var  txHash = await sdk.send(txData);
    // console.log(`成功发送交易， hash： ${txHash}`)
}

var getBalance = async function(recipient) {
    var balance = await sdk.getBalance(recipient);
    console.log(`查询用户${recipient}余额成功： ${balance}`)
}

var findTx = async function() {

    var txData = await sdk.findTx('8c6538b75825f416abc3a0c21edf4ff10b623aff8f2d8906a7c0c40ada40535c')

    console.log(`查询交易成功： ${JSON.stringify(txData)}`)
}

var findTransactionByBlock = async function () {
        new Promise(async (resolve, reject) => {
            console.log(new Date())
            var x = []
            // 可输入区块hash和高度
            var numberOrHash = '000000002ee241f844e34ea32391c0303a34958ec8d76a746d0c45a1c2bad0a0'
            var x = await sdk.findTxByBlock(1577770)
            console.log(JSON.stringify(x))
        }).catch(err => {
            console.log(err)
        })
    console.log(new Date())
    
}

var getLaskBlock = async function () {
        while(true) {
            var blockData = await sdk.getLastBlock()

            console.log(`查最新区块成功： ${JSON.stringify(blockData)}`)

        }
}

var createKeypair = function() {
    for (let i =0 ; i <10; i++) {
        var keypair =  sdk.createKeypair()
        var address = sdk.getPublicKeyAndAddress(keypair.privateKey).address
    console.log(`创建私玥成功： ${JSON.stringify(keypair.privateKey)}   地址: ${address}`)
    }
}

var getPublicKeyAndAddress = function() {
    var account =  sdk.getPublicKeyAndAddress(privateKey)
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

var getPrivateKeyBySeed = function() {
    var seed = BlockchainSdk.createSeed()
    var priv = sdk.getPrivateKeyBySeed(seed);
    console.log(`根据种子 ${seed} 获取私钥成功： ${priv}`);
}

var getTxsByAddress = async function(obj) {
    var arr = await sdk.getTxsByAddress(obj);
    console.log(`获取交易信息 ${JSON.stringify(arr)}`);
}

var getPendingTxsByAddress = async function(obj) {
    var arr = await sdk.getPendingTxsByAddress(obj);
    console.log(`获取pending交易信息 ${JSON.stringify(arr)}`);
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
// 
//查询余额
// getBalance('mkmWwT798UV8vCR6Ry3Siqu5G6rNGFaCSw')

//查询交易
// findTx()

//查询某个区块的所有交易
// findTransactionByBlock()

//查询最新区块
getLaskBlock();

//创建公私玥
// createKeypair();

// 由私钥获取公钥和地址
// getPublicKeyAndAddress()

//公钥转地址
// getAddress();
// 获取平均手续费
// getAverageFee()

// 根据种子获取私钥
// getPrivateKeyBySeed()

// 根据地址分页查询交易 （第三方服务， 不允许在服务端使用）
// getTxsByAddress({
//     address: 'mkVpmF7qrDSWHpSnLfmDiT83KJBKsGa2S1', 
//     page: 1, 
//     size: 10, 
//     addressType: 1,
//     // status: 'failed',
//     amountSort: 1
// })

// 根据地址查询所有pending交易 （第三方服务， 不允许在服务端使用）
// getPendingTxsByAddress({
//     address: '1CxAJMkVtrmY87vymePmyZEhqkaysAyPKg', 
//     addressType: 1,
//     amountSort: 1
// })

// checkAddress(recipient)

//  检查输入的种子
// validSeed("valve split circle comic useless property galaxy history faculty enroll reason only")