## asc链-npm包

##获取连接
```
// npm install @xu10000/blockchain_sdk@4.0.0
var BlockchainSdk = require("blockchain_sdk");
var provider = {
	chainType: BlockChainSdk.chainType.ETH
	// 测试网络 git.ezoonet.com
	host: 'git.ezoonet.com',
	port: 8100,
	testnet: true //标志是否为测试网络
}
var blockchainSdk = New BlocchainSdk(provider)
```

## 创建公私玥
```
/**
* @return{object}
{
	@param{string} publicKey: 'xxxx....',
	@param{string} privateKey: 'zxcc...'
}
**/
var block =  blockchainSdk.createKeypair()
```

## 获取最新区块
```
/**
* @return{object}
{
	@param{int} height //区块高度
	@param{string} hash //区块hash
	@param{int} timestamp //戳
}
**/
var block = await blockchainSdk.getLastBlock()
```
##发送交易
```
// privateKey 发送者的私钥
// amount 和 fee都必须是字符串整形
// nonce  optional  eth独有的字段，代表当前地址在发送第几个交易，eth交易必填(该接口必须从服务端接口获取！)
/**
* return{object} txData
{
	txHash{string} //交易hash
	codingTx{string} //编码过的交易结构体，用来发送
}
**/
// ！！！因为是demo,所以该nonce直接从链上获取，开发时必须从接口获取
var nonce = await blockchainSdk.getNonce(address);
var txData = await blockchainSdk.createTx (privateKey, recipientAddress, amount, fee, null/**发送时合约地址默认为空**/, data/**备注信息**/, nonce)
// 发送交易
var  txHash =  await blockchainSdk.send(txData)
```
##发送erc20交易
```
// privateKey 发送者的私钥
// amount 和 fee都必须是字符串整形
// nonce 和普通交易一样，只有eth才有这个参数，并且需要获取
/**
* return{object} txData
{
	hash{string} //交易hash
	codingTx{string} //编码过的交易结构体，用来发送
}
**/
// 创建交易
var fee = await sdk.getTokenAverageFee(sender, recipient, value, contract)
var txData = await blockchainSdk.createTx (privateKey, recipientAddress, amount, fee, erc20Sender, erc20Recipient, data/**备注信息**/, nonce)
// 发送交易
var  txHash =  await blockchainSdk.send(txData)
```
### 查询交易
```
/**
@ desc 返回通用格式的交易
* @return{object}
{
	status: 'pending', //交易状态 success failed pendding
	blockHeight: 11111 //区块高度
	txHash: 'asdzxcxzc...'
	isErc20: true //判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
	sender: '0xaaa....',
	recipent: '0x0000...',
	erc20Sender: '0xbbb....',
	erc20Recipent: '0xccc....',
	amount: '1000',
	fee: '200',
	data: 'xxx....' //附带信息
}
**/
var tx = await blockchainSdlk.getTransaction(txhash)

```

##查询账户余额
```
/**
* @return balance //整形字符串
**/
var balance = await blockchainSdk.getBalance(address)
```

## 获取erc2余额

```
/**
* @return balance //整形字符串
**/
var balance = await blockchainSdk.getErc20Balance(contract, address)
```

## 获取代币名称

```
/**
* @return balance //整形字符串
**/
var balance = await blockchainSdk.getErc20Symbol(contract)
```

## 获取地址
```
var address =  blockchainSdk.getAddress(publicKey)
```

##获取公钥和地址
```
/**
* @desc 由私钥获取公钥和地址
@return{object} 
{
	@param{string} address
	@param{string} publicKey
}
**/
var account =  sdk.getPublicKeyAndAddress(privateKey)
```

##获取最近区块的平均手续费
```
/**
* @desc 获取最近区块的平均手续费
@return{string} 

**/
var fee = await sdk.getAverageFee()
```

##获取最近区块的代币平均手续费

```
/**
* @desc 获取最近区块的平均手续费
@return{string} 
{
	@param{string} sender 
	@param{string} recipient
  @param{string} amount
  @param{string} contract // 代币的合约地址
}
**/
var fee = await sdk.getTokenAverageFee(sender, recipient, amount, contract)
```

##创建种子

```
/**
@return{string} // 'draw goddess slight depth object umbrella sun slide indoor direct pond welcome'

**/
	// 中文则是BlockchainSdk.CHINESE
	var seed = BlockchainSdk.createSeed(BlockchainSdk.ENGLISH)
    console.log(`成功创建种子成功： ${seed}`);
```

##验证种子
```
/**
@param {string} seed //种子
@return{bool} 

**/
	var flag = BlockchainSdk.validSeed(seed)
    console.log(`检查种子是否成功： ${flag}`);
```

##根据种子获取私钥
```
/**
@return{string} 

**/ // ！！一个大写一个小写，不一样
	var seed = BlockchainSdk.createSeed()
    var priv = blockchainSdk.getPrivateKeyBySeed(seed);
```


##验证地址是否合法
```
/**@param {string} address
** @return{bool}  
**/ !! 验证地址前缀0x必须带，否则都返回false
	// 合法返回true,否则flase
	var flag = BlockchainSdk.checkAddress('0x1232ww...');
```

## 根据高度或hash获取区块信息
```
/**@param height {int}  // 高度
* @return{object}
{
	@param{int} height //区块高度
	@param{string} hash //区块hash
	@param{int} timestamp //戳
}
**/
var block = await blockchainSdk.getBlock(height)
```
