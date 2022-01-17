var BlockchainSdk = require('../lib/index');
var provider = {
    chainType: BlockchainSdk.chainType.ETH,
    host: '192.168.1.119', //测试
    port: 8545,
    testnet: true, //标志是否为测试网络
}


var sdk = new BlockchainSdk(provider);
var recipient = '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b';
// var contract = '0x3943330a1fc80154e2027b428f07b13dffbc28ae'
// var privateKey = 'C4A083DB3430ADA4F865D8545E81B6CADBCE433DCBA25E817AD33420AD55BC71'
// var recipient = '0x1182cd7b6399fdc2f2facadc324d04a0fdfae262';  //正式网络
var contract = '0x5f75a5A8573BEEBd67A945a3e8AE7b0085942Ab5'
var privateKey = '0x374848A2586E0EC183263D9032E4F7F35C3E2EDBA0B67D9EEF6FCDB48C287B27'
var sendtx = async function () {
    try {
        // 获取发送者地址
        var sender = await sdk.getPublicKeyAndAddress(privateKey).address;
        console.log(`sender: ${sender}`)
        // 获取nonce
        var nonce = await sdk.getNonce(sender);
        console.log(`当前交易的nonce为： ${nonce}`)
        // 获取平均手续费
        var fee = await sdk.getAverageFee()
        // 创建交易
        var txData = await sdk.createTx(
            privateKey,
            recipient,
            '10000000000000000', // eth数量
            fee,
            null,
            "",
            nonce,
        )
        console.log(`txhash: ${JSON.stringify(txData)}`);
        // 发送交易
        var txHash = await sdk.send(txData);
        console.log(`成功发送交易， hash： ${txHash}`)
    } catch (err) {
        throw err;
    }
}

var sendErc20tx = async function () {
    // 获取发送者地址
    var sender = await sdk.getPublicKeyAndAddress(privateKey).address;
    // 获取nonce
    var nonce = await sdk.getNonce(sender);
    var value = '100000000';
    console.log(`当前交易的nonce为： ${nonce}`)
    // 获取平均手续费
    var fee = await sdk.getTokenAverageFee(sender, recipient, value, contract)
    // 创建交易
    var txData = await sdk.createTx(
        privateKey,
        recipient,
        value, // 代币数量
        fee, //btc数量  //usdt的发送也要用btc作为手续费
        contract,
        "",
        nonce
    )
    console.log(`txhash: ${JSON.stringify(txData)}`);
    // 发送交易
   var txHash = await sdk.send(txData);
   console.log(`成功发送交易， hash： ${txHash}`)
}

var getBalance = async function (recipient) {
    var balance = await sdk.getBalance(recipient);
    console.log(`查询用户${recipient}余额成功： ${balance}`)
}

var getErc20Balance = async function (contract, recipient) {
    var balance = await sdk.getErc20Balance(contract, recipient);
    console.log(`查询用户${recipient}余额成功： ${balance}`)
}

var getErc20Symbol = async function (contract) {
    var symbol = await sdk.getErc20Symbol(contract);
    console.log(`查询合约symbol成功： ${symbol}`)
}

var getErc20Decimal = async function (contract) {
    var decimal = await sdk.getErc20Decimal(contract);
    console.log(`查询合约decimal成功： ${decimal}`)
}

var findTx = async function (tx) {

    var txData = await sdk.findTx(tx, true)

    console.log(`查询交易成功： ${JSON.stringify(txData)}`)
}

var findErc20Tx = async function (tx) {

    var txData = await sdk.findTx(tx)

    console.log(`查询交易成功： ${JSON.stringify(txData)}`)
}

var findTransactionByBlock = async function (numberOrHash) {
    var arr = []
    // 可输入区块hash和高度
    for(let i =0; i< 10; i++) {
        arr.push(sdk.findTxByBlock(numberOrHash++))
    }
    // arr.push(sdk.findTxByBlock(numberOrHash))
    var x = await Promise.all(arr)
        .catch(err=> {
            throw new Error(err)
        });

        // for (let i = 0 ;i < x[0].length; i++) {
        //     console.log(i)
        //     if( x[0][i].txHash == '0xa504cb9aa76371130ee8f7425645e2237d2b71970cbdca22833983e192b3e523' ) {
        //         console.log(x[0][i]);
        //     }
        // }
       console.log('都查询了', x)
    //console.log(`查询交易成功： ${JSON.stringify(txData)}`)
}

var getLaskBlock = async function () {

    var blockData = await sdk.getLastBlock()

    console.log(`查最新区块成功： ${JSON.stringify(blockData)}`)
}

var createKeypair = async function () {
    var keypair = await sdk.createKeypair()
    var address = sdk.getPublicKeyAndAddress(privateKey).address
    console.log(`创建公私玥成功： ${JSON.stringify(keypair)} 地址： ${address}`)
}

var getPublicKeyAndAddress = function (privateKey) {
    var account = sdk.getPublicKeyAndAddress(privateKey)
    console.log(`成功获取公钥和地址： ${JSON.stringify(account)}`)
}
var getAddress = function (privateKey) {

    var account = sdk.getPublicKeyAndAddress(privateKey)

    var address = sdk.getAddress(account.publicKey)

    console.log(`成功获取地址： ${address}`)
}

var getNonce = async function(address) {
    var nonce = await sdk.getNonce(address);
    console.log(`成功获取${address} nonce: ${nonce}`);
}

var getAverageFee = async function() {
    var averageFee = await sdk.getAverageFee()
    console.log(`成功获取eth链上平均手续费： ${averageFee}`);
}

// FIXME:原本是同步方法， 但是改为适用于IMToken的时候，它为异步方法。尴尬
var getPrivateKeyBySeed = function(seed) {
    var priv = sdk.getPrivateKeyBySeed(seed);
    console.log(`根据种子 ${seed} 获取私钥成功： ${priv}`);
}

var checkAddress = function(addr) {
    var flag = sdk.checkAddress(addr);
    console.log(`地址是否合法： ${flag}`);
}

var getBlock = async function(numberOrHash) {
    var data = await sdk.getBlock(numberOrHash);
    console.log(`获取区块信息 ${JSON.stringify(data)}`);
}

var getTxsByAddress = async function(obj) {
    var arr = await sdk.getTxsByAddress(obj);
    console.log(`获取交易信息 ${JSON.stringify(arr)}`);
}

var getErc20TxsByAddress = async function(obj) {
    var arr = await sdk.getErc20TxsByAddress(obj);
    console.log(`获取交易信息 ${JSON.stringify(arr)}`);
}

var getPendingTxsByAddress = async function(obj) {
    var arr = await sdk.getPendingTxsByAddress(obj);
    console.log(`获取pending交易信息 ${JSON.stringify(arr)}`);
}

var getPendingErc20TxsByAddress = async function(obj) {
    var arr = await sdk.getPendingErc20TxsByAddress(obj);
    console.log(`获取pending交易信息 ${JSON.stringify(arr)}`);
}

var validSeed = async function(seed) {
    var flag = await BlockchainSdk.validSeed(seed);
    console.log(`检查种子是否成功： ${flag}`);
}

var getTokenAverageFee = async function() {
    // rinkeby usdt: 0xA27213A604aA67a728aC274795591F71AEfDa45B
    // rinkeby ztc: 0x8FE3DFf2B05DB2A2740ED356Eae9ae9e5FeF11cc
    var sender = '0x987D7cB3De15d8c9c8e3F3a992B1e32f977d20d0';
    var recipient = '0x83a8Fb504D271da3D3C5b306B86c4e19De239906';
    var  value = '1000000000000000';
    var  contract = '0x8FE3DFf2B05DB2A2740ED356Eae9ae9e5FeF11cc'
    var averageFee = await sdk.getTokenAverageFee(sender, recipient, value, contract)
    console.log(`成功获取eth链上代币平均手续费： ${averageFee}`);
}
//创建公私玥
// createKeypair();

//查询余额
// getBalance('0xb5231a31fef7ae28e9c894ec80af7fbcccd0663f')

// getErc20Balance('0x825906fe3f5dfb1b87d265b59f6952bba9a6de79', '0xf24a2674208b7b5ec2f2863dcb65938ef82dc180')
// getErc20Symbol(contract)
// getErc20Decimal(contract)

//查询交易
// findTx('0xd1ef3239ff67ac9878841833048d72165bb4aa83858a78a1dcb0dcaab7b2b6e9', true)
//findTx('0xa504cb9aa76371130ee8f7425645e2237d2b71970cbdca22833983e192b3e523') // 正式网络
// findErc20Tx('0x663098a30b21e077c5f4b3df973d6293c9f9642bc4fc75b6b91e00cef8eff56c')

//查询某个区块的所有交易
// findTransactionByBlock(8831247)

//查询最新区块
// getLaskBlock();

// 由私钥获取公钥和地址
// getPublicKeyAndAddress('0xB68643F16EA6D08B738D772C614656CDE1B04F0994D7EB27C50AC0D00E0D504E')

//公钥转地址
// getAddress('0x8ae501a2a422217334f80daea4ffffcc5dd0f4d54dabffa7c2e5827b27c39406');

// 获取nonce
// getNonce('0xc445de1f8a813b36e791c1f507d7da0e173b1ece')

// 获取平均手续费
// getAverageFee() 

// 获取代币平均手续费
// getTokenAverageFee()

// 发送交易
// sendtx()
sendErc20tx()

// 根据种子获取私钥
// getPrivateKeyBySeed('延 伐 厅 度 狱 奇 塔 逐 挑 臣 岛 防');

// 查询地址是否合法
// checkAddress('0x25576cf5eee80DfB41B8095B529fe7fdC143d720')

// 根据高度或hash查询区块信息
// getBlock('0x506e5c0e69e50cf220577a11b9b6e33ecf5ab7b03f4b446e4abdb8bd5ae79193')

// 根据地址分页查询交易 （第三方服务， 不允许在服务端使用）
// getTxsByAddress({
//     address: '0x16ce33b66f67ac71ff2532e4c8e159cb8c9dc10a',
//     // address: '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b',
//     page: 1,
//     size: 10,
//     addressType: 1,
//     // status: 'failed'
//     amountSort: 1
// })

// 根据地址查询所有pending交易 （第三方服务， 不允许在服务端使用）
// getPendingTxsByAddress({
//     address: '0xb1964f8c47369ff11209755da79feab29a73d51f',
//     addressType: 1,
//     amountSort: 1
// })

// 根据地址分页查询erc20交易 （第三方服务， 不允许在服务端使用）
// getErc20TxsByAddress({
//     contract: '0xb1964f8c47369ff11209755da79feab29a73d51f',
//     address: '0xb1964f8c47369ff11209755da79feab29a73d51f',
//     page: 1,
//     size: 10,
//     addressType: 1,
//     // status: 'failed'
//     amountSort: 1

// })

// 根据地址查询所有pendingerc20交易 （第三方服务， 不允许在服务端使用）
// getPendingErc20TxsByAddress({
//     contract: '0x1f8587ad54788e3a568c1c18fc41f32790ddfe89',
//     address: '0xc1281cd544053dd641261dcbe429d4f0d99533ed',
//     addressType: 1,
//     amountSort: 1

// })

//  检查输入的种子
// validSeed("延 伐 厅 度 狱 奇 塔 逐 挑 臣 岛 防")

//     var seed = BlockchainSdk.createSeed()
// console.log(seed)