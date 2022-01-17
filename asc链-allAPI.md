## asc链-npm包

###该sdk默认usdt端口是在btc浏览器端口+1，使用usdt时，port填入btc浏览器节点的端口，与运维确认。

##获取连接
```
var BlockchainSdk = require("blockchain_sdk");
var provider = {
	chainType: BlockChainSdk.chainType.USDT
	// 测试网络 47.244.21.59
	host: '127.0.0.1',
	port: 3001,
	testnet: true //标志是否为测试网络
	user: "bitcoin", // http basic验证，如果节点没有设置，就不用填
	password: "password",  //btcoin有设置验证，填入的账户密码如例即可
	// properties: 111 //只有BTCC才需要添加该参数，正式网: 2147484121, 测试网: 2147484959
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
// nonce  optional  eth独有的字段，代表当前地址在发送第几个交易，eth交易必填
/**
* return{object} txData
{
	txHash{string} //交易hash
	codingTx{string} //编码过的交易结构体，用来发送
}
**/
// ！！！创建交易, 需要自己在redis（设置五分钟）维护nonce，五分钟内从redis获取，否则从接口获取，非eth交易忽略此条，并且无需传入nonce参数。
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

## 查询某个区块的所有交易
```
/**
* @desc 返回的transaction结构和上面的查询交易接口一致，不同的是数组存储
**/
// numberOrHash //输入区块高度或者区块hash
var transactions = await blockchainSdk.getTransactionByBlock(numberOrHash)
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

##创建种子
```
/**
@return{string} // 'draw goddess slight depth object umbrella sun slide indoor direct pond welcome'

**/
	var seed = BlockchainSdk.createSeed()
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
    var priv = blockchainSdk .getPrivateKeyBySeed(seed);
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

## 根据地址分页查询交易 （第三方服务， 不允许在服务端使用）
```
/**
	@param obj {
		@param address {string} // 查询地址
 		@param page {int} // 最小单位为1
		@param  size {int}
		@param  stauts {string} // 状态 success failed pending 不传则全部搜索
		@param  addressType {int}  //查询地址的种类  1 代表只搜索发送者， 2代表只搜索接收者， 3代表全部搜索，默认是3
		@param  amountSort {int}  //1 按金额从小到大排序，-1相反, 不传默认按时间排序
	}

* @desc 返回的transaction结构和上面的查询交易接口一致，不同的是数组存储
**/
var block = await blockchainSdk.getTxsByAddress({
    address: '0x987d7cb3de15d8c9c8e3f3a992b1e32f977d20d0', 
    // address: '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b',
    page: 1, 
    size: 10, 
    addressType: 1,
    status: 'failed',
	// amountSort: 1
})
```

## 根据地址分页查询erc20交易 （第三方服务， 不允许在服务端使用）
```
	@param obj {
		@param contract {string} // 合约地址
		@param address {string} // 查询地址
 		@param page {int} // 最小单位为1
		@param  size {int}
		@param  stauts {string} // 状态 success failed pending  不传则全部搜索
		@param  addressType {int}  //查询地址的种类  1 代表只搜索发送者， 2代表只搜索接收者， 3代表全部搜索，默认是3
		@param  amountSort {int}  //1 按金额从小到大排序，-1相反, 不传默认按时间排序

	}
var block = await blockchainSdk.getErc20TxsByAddress({
	contract:  '0xasd......',
    address: '0x987d7cb3de15d8c9c8e3f3a992b1e32f977d20d0', 
    // address: '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b',
    page: 1, 
    size: 10, 
    addressType: 1,
    status: 'failed' ,
	// amountSort: 1
})
```


## 根据地址查询所有的所有的pending交易 （第三方服务， 不允许在服务端使用）
```
/**
	@param obj {
		@param address {string} // 查询地址
		@param  addressType {int}  //查询地址的种类  1 代表只搜索发送者， 2代表只搜索接收者， 3代表全部搜索，默认是3
		@param  amountSort {int}  //1 按金额从小到大排序，-1相反, 不传默认按时间排序
	}

* @desc 返回的transaction结构和上面的查询交易接口一致，不同的是数组存储
**/
var block = await blockchainSdk.getPendingTxsByAddress({
    address: '0x987d7cb3de15d8c9c8e3f3a992b1e32f977d20d0', 
    // address: '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b',
    addressType: 1,
	// amountSort: 1
})
```

## 根据地址查询所有的所有的pending的erc20交易 （第三方服务， 不允许在服务端使用）
```
	@param obj {
		@param contract {string} // 合约地址
		@param address {string} // 查询地址
		@param  addressType {int}  //查询地址的种类  1 代表只搜索发送者， 2代表只搜索接收者， 3代表全部搜索，默认是3
		@param  amountSort {int}  //1 按金额从小到大排序，-1相反, 不传默认按时间排序

	}
var block = await blockchainSdk.getPendingErc20TxsByAddress({
	contract:  '0xasd......',
    address: '0x987d7cb3de15d8c9c8e3f3a992b1e32f977d20d0', 
    // address: '0xac37c62e0d6f35b9c0adf7a289d1731d6246b85b',
    addressType: 1,
	// amountSort: 1
})
```

