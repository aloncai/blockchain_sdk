/**
 * blockchain_sdk
 * 入口文件，用于和区块链交互
 */

let _BlockChainSdk = require("./blockchainSdk");
let Mnemonic = require('bitcore-mnemonic');
let BigNumber = require('bignumber.js');
let chainType = require("./constants").chainType;
const v = '0';
const r = '0x0';
const s = '0x0';
let BlockchainSdk = function(provider) {
	console.log("provider: ", JSON.stringify(provider));

	this.sdk = new _BlockChainSdk(provider)
}

/**
 * @desc 链的类型 usdt = 1 eth = 2
 */
BlockchainSdk.chainType = chainType;
BlockchainSdk.ENGLISH = Mnemonic.Words.ENGLISH
BlockchainSdk.CHINESE = Mnemonic.Words.CHINESE

/**
 * @desc 创建交易
 **/
BlockchainSdk.prototype.createTx = async function(privateKey, recipient, amount, fee, contract, data, nonce) {
	return this.sdk.createTx(privateKey, recipient, amount, fee, contract, data, nonce)
}	

BlockchainSdk.prototype.getTokenAverageFee = async function(sender, recipient, value, contract) {
	return this.sdk.getTokenAverageFee(sender, recipient, value, contract)
}

/**
 * @desc 发送交易
 * @param{object} txData
 * {
 * 		@param{string}txHash
 * 		@param{string}codingTx //编码过的交易，可直接发送
 * }
 **/
BlockchainSdk.prototype.send = async function(txData) {
	return this.sdk.send(txData)
}

/**
 * @desc 查询用户余额
 */
BlockchainSdk.prototype.getBalance = async function(address) {
	return this.sdk.getBalance(address)
}

/**
 * @desc 查询用户erc20余额
 */
BlockchainSdk.prototype.getErc20Balance = async function(contract, address) {
	return this.sdk.getErc20Balance(contract, address)
}


BlockchainSdk.prototype.getErc20Symbol = async function(contract) {
	return this.sdk.getErc20Symbol(contract)
}

BlockchainSdk.prototype.getErc20Decimal = async function(contract) {
	return this.sdk.getErc20Decimal(contract)
}


/**
 * @desc 查询交易
 * @return {object}
 * 	{
	status: 'pending', //交易状态 success failed pendding
	blockHeight: 11111 //区块高度
	txHash: 'asdzxcxzc...'
	isErc20: true //判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
	sender: '0xaaa....',
	recipient: '0x0000...',
	erc20Sender: '0xbbb....',
	erc20Recipeint: '0xccc....',
	amount: '1000',
	fee: '200'
}
 */
BlockchainSdk.prototype.findTx = async function(txHash, otherMessage) {
	return this.sdk.findTx(txHash, otherMessage)
}

/**
 * @desc 查询区块内的所有交易
 * @param {int | string} numberOrHash  //区块高度或hash
 */
BlockchainSdk.prototype.findTxByBlock = async function(numberOrHash) {
	return this.sdk.findTxByBlock(numberOrHash)
}

/**
 * 查询区块头部
 */
BlockchainSdk.prototype.findBlockHeaderByBlock = async function(numberOrHash) {
        return this.sdk.findBlockHeaderByBlock(numberOrHash)
    }

BlockchainSdk.prototype.getLastBlock = async function() {
	return this.sdk.getLastBlock()
}

BlockchainSdk.prototype.createKeypair = function() {
	return this.sdk.createKeypair()
}

BlockchainSdk.prototype.getPublicKeyAndAddress = function(privateKey) {
	return this.sdk.getPublicKeyAndAddress(privateKey)
}


BlockchainSdk.prototype.getAddress = function(publicKey) {
	return this.sdk.getAddress(publicKey)
}

BlockchainSdk.prototype.getAverageFee = function() {
	return this.sdk.getAverageFee()
}
// eth独有接口
BlockchainSdk.prototype.getNonce = function(address) {
	return this.sdk.getNonce(address)
}
// 版本二的接口，预留内容
let v2 = {

}
// 根据种子创建私钥
BlockchainSdk.prototype.getPrivateKeyBySeed = function(seed) {
	return this.sdk.getPrivateKeyBySeed(seed)
}

// 验证地址是否合法
BlockchainSdk.prototype.checkAddress = function(addr) {
	return this.sdk.checkAddress(addr)
}


// 获取区块信息
/**
 *  @param {int} timestamp
 * @param {int} height
 * @param {string} hash
 */
BlockchainSdk.prototype.getBlock = async function(numberOrHash) {
	return await this.sdk.getBlock(numberOrHash)
}

BlockchainSdk.prototype.getTxsByAddress = async function(addr, page, size) {
	return await this.sdk.getTxsByAddress(addr, page, size)
}

BlockchainSdk.prototype.getErc20TxsByAddress = async function(obj) {
	return await this.sdk.getErc20TxsByAddress(obj)
}

BlockchainSdk.prototype.getPendingTxsByAddress = async function(addr) {
	return await this.sdk.getPendingTxsByAddress(addr)
}

BlockchainSdk.prototype.getPendingErc20TxsByAddress = async function(obj) {
	return await this.sdk.getPendingErc20TxsByAddress(obj)
}

// 注册成为矿工
BlockchainSdk.prototype.registerMiner = async function(privateKey, fee, nonce) {
	return await this.sdk.registerMiner(privateKey, fee, nonce)
}

// 获取所有矿工信息
BlockchainSdk.prototype.getAllDelegateMiners = async function() {
	let heightObj = await this.getLastBlock();
	height = "0x" + new BigNumber(heightObj.height).toString(16);
	let queryObj = {"jsonrpc":"2.0","method":"eth_getAllDelegateMiners","params":[height],"id":67}
	return await this.sdk.rpcRequest(queryObj)
}

// 获取代理矿工上所有股东信息
BlockchainSdk.prototype.getAllStakeHolders = async function(address) {
	let heightObj = await this.getLastBlock();
	height = "0x" + new BigNumber(heightObj.height).toString(16);
	let queryObj = {"jsonrpc":"2.0","method":"eth_getAllStakeHolders","params":[address, height],"id":67}
	return await this.sdk.rpcRequest(queryObj)
}

// 获取股东所抵押的所有矿工信息
BlockchainSdk.prototype.getAllDepositMiners = async function(address) {
	let heightObj = await this.getLastBlock();
	height = "0x" + new BigNumber(heightObj.height).toString(16);
	let queryObj = {"jsonrpc":"2.0","method":"eth_getAllDepositMiners","params":[address, height],"id":67}
	return await this.sdk.rpcRequest(queryObj)
}

// 为代理矿工抵押资金
BlockchainSdk.prototype.stakeForMiner = async function(nonce, fee, privateKey, address, amount) {
	return await this.sdk.stakeOrRecallMiner(nonce, fee, privateKey, address, amount)
}

// 撤回抵押资金
BlockchainSdk.prototype.recallForMiner = async function(nonce, fee, privateKey, address) {
	return await this.sdk.stakeOrRecallMiner(nonce, fee, privateKey, address, '0', 3)
}
//====================直接调用函数，不通过实例============================
BlockchainSdk.createSeed = function(language) {
	let code = new Mnemonic(language);
	return code.toString();
}

BlockchainSdk.validSeed = function(seed) {
	let valid = Mnemonic.isValid(seed);
	return valid
}

// ================== sc 合约独有 ====================
/**
 * sc　合约设置　
 * @param resonateContract　共振合约
 * @param miningContract　挖矿合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.setScContract = async function(resonateContract, miningContract) {
	return this.sdk.setScContract(resonateContract, miningContract)
}

BlockchainSdk.prototype.getScMessage = async function(obj) {
	return this.sdk.getScMessage(obj)
}

BlockchainSdk.prototype.approve = async function (privateKey, spender, amount, fee, contract, nonce) {
	return this.sdk.approve(privateKey, spender, amount, fee, contract, nonce);
}

BlockchainSdk.prototype.allowance = async function (contract, owner, spender) {
	return this.sdk.allowance(contract, owner, spender);
}

BlockchainSdk.prototype.sendScMessage = async function (obj) {
	return this.sdk.sendScMessage(obj);
}


BlockchainSdk.prototype.v2 = v2;


/**
 * 共振 最后一次共振的高度
 * @param obj { 'contract': '0x000001'}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.lastHeightAboutResonate = async function (obj) {
	return this.sdk.lastHeightAboutResonate(obj);
};

/**
 * 共振 用户最后一次共振的高度
 * @param obj { contract: '', address: ''} 共振合约　用户地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.lastDayOfAccountAboutResonate = async function (obj) {
	return this.sdk.lastDayOfAccountAboutResonate(obj);
}

/**
 * 共振　某个地址的充值的eth数量（还为共振成功）
 * @param obj　{contract: '', address: ''} 共振合约　用户地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.balanceOfEthAboutResonate = async function (obj) {
	return this.sdk.balanceOfEthAboutResonate(obj);
}

/**
 * 共振　某个用户最后共振的周期
 * @param obj　{contract: '', address: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.lastCycleOfAccountAboutResonate = async function (obj) {
	return this.sdk.lastCycleOfAccountAboutResonate(obj);
}

/**
 * 共振　当前周期和剩余的高度数量
 * @param obj { 'contract': '0x000001'}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.todayAndRemainHeightAboutResonate = async function (obj) {
	return this.sdk.todayAndRemainHeightAboutResonate(obj);
}

/**
 * 共振　上次共振中奖充值的eth数量
 * @param obj　{contract: '', address: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.preLuckEthAboutResonate = async function (obj) {
	return this.sdk.preLuckEthAboutResonate(obj);
}
/**
 * 共振　第一次共振的高度
 * @param obj { 'contract': '0x000001'}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.firstHeightAboutResonate = async function (obj) {
	return this.sdk.firstHeightAboutResonate(obj);
}

/**
 * 共振 总共振的eth量
 * @param obj　{contract: ''}　共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.totalEthAboutResonate = async function (obj) {
	return this.sdk.totalEthAboutResonate(obj);
}

/**
 * 共振　某个周期所有eth中奖人的充值总额
 * @param obj { 'contract': '0x000001'，　day: 1}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.luckEthDayOfRewardAboutResonate = async function (obj) {
	return this.sdk.luckEthDayOfRewardAboutResonate(obj);
}

/**
 * 共振　某个周期　共振的eth量
 * @param obj { 'contract': '0x000001'，　day: 1}　共振合约　天数
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.resonateEthDay = async function (obj) {
	return this.sdk.resonateEthDay(obj);
}

/**
 * 共振　某个用户抽奖中的eth
 * @param obj　{contract: '', address: ''}　共振合约　用户地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.balanceOfRewardEthAboutResonate = async function (obj) {
	return this.sdk.balanceOfRewardEthAboutResonate(obj);
}

/**
 * 共振　共振的 本期中签率
 * @param obj　{contract: ''}　共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.getRateAboutResonate = async function (obj) {
	return this.sdk.getRateAboutResonate(obj);
}

/**
 * 共振　抽奖 本期中签率
 * @param obj　{contract: ''}　共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.getEthRateAboutResonate = async function (obj) {
  return this.sdk.getEthRateAboutResonate(obj);
};

/**
 * 挖矿　查看节点钱包是否注册
 * @param obj　{contract: '', address: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.isRegisterAboutMining = async function (obj) {
	return this.sdk.isRegisterAboutMining(obj);
}

/**
 * 挖矿　某个的抽成是否领取了
 * @param obj　{contract: '', day: 1 }
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.isBonusAboutMining = async function (obj) {
	return this.sdk.isBonusAboutMining(obj);
}

/**
 * 挖矿　当前周期和剩余高度数量
 * @param obj　{contract: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.currentCycleAndRemainHeightAboutMining = async function (obj) {
	return this.sdk.currentCycleAndRemainHeightAboutMining(obj);
}
/**
 * 挖矿　用户当前高度的正在挖矿的数量
 * @param obj　{contract: '', address: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.miningAmountNow = async function (obj) {
	return this.sdk.miningAmountNow(obj);
}
/**
 * 挖矿　获取某个用户的所有订单信息
 * @param obj {contract: '', address: ''}
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.miningOrders = async function (obj) {
	return this.sdk.miningOrders(obj);
}


BlockchainSdk.prototype.dailyMining = async function (obj) {
	return this.sdk.dailyMining(obj);
}


/**
 * 共振　允许某个账号对我的账户进行一定额度的代币代扣
 * @param privateKey　允许人的私钥
 * @param spender　代扣者
 * @param amount　允许金额
 * @param tokenContract　允许代扣的币种地址合约
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.approveAboutResonate = async function(privateKey, spender, amount, tokenContract, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.approve(
		privateKey,
		spender,
		amount,
		fee,
		tokenContract,
		nonce,
	)
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送resonateApprove交易， hash： ${txHash}`)
	return txHash;
}

/**
 * 共振　往合约内存代币
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.depositAboutResonate = async function(contract, privateKey, amount, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		amount,
		funcName: 'deposit',
		params: [],
		needValue: true,
	})
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	console.log(`成功创建交易depositAboutResonate， hash： ${txData.txHash}`)
	return txData;
}

/**
 * 共振　开启彩蛋
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.openEasterEggAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'openEasterEgg',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送openEasterEgg交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 共振　绑定开发者地址　邀请人　地址　幸运钱包地址　彩蛋钱包地址
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param developerAddress　开发者地址
 * @param investorAddress　邀请者地址
 * @param luckWalletAddress　共振钱包地址
 * @param easterEggWalletAddress　彩蛋钱包地址
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.bindAboutResonate = async function (contract, privateKey, developerAddress, investorAddress, luckWalletAddress, easterEggWalletAddress, nonce, fee) {
	const sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'bind',
		params: [developerAddress, investorAddress, luckWalletAddress, easterEggWalletAddress]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送bind交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 共振　如果已经充值过，第二天调用该接口继续共振
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.resonateAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'resonate',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送resonate交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 共振　构建参与共振的交易体
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.buildResonateAboutResonate = async function (contract, privateKey, nonce, fee) {
  const sdk = this.sdk;
  let txData = await sdk.sendScMessage({
    privateKey,
    fee,
    nonce,
    contract,
    funcName: 'resonate',
    params: []
  });
  console.log(`buildResonateAboutResonate　txData: ${JSON.stringify(txData)}`);
  return txData;
};

/**
 * 共振　下注
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.stackAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'stack',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	console.log(`成功创建stack交易， hash： ${txData.txHash}`);
	return txData;
};

/**
 * 共振　取出抽奖中的eth奖励
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.withdrawRewardEthAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'withdrawRewardEth',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送withdrawRewardEthAboutResonate交易， hash： ${txHash}`)
	return txHash;
};
/**
 * 共振　取出共振未成功的eth
 * @param contract　共振合约
 * @param privateKey　私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.withdrawEthAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'withdrawEth',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送withdrawEthAboutResonate交易， hash： ${txHash}`)
	return txHash;
};

/**
 *　每天抽成
 * @param contract 共振合约
 * @param privateKey 私钥
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.cutAboutResonate = async function (contract, privateKey, nonce, fee) {
	const sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'cut',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送cut交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 共振　某天可以参加抽奖的人数
 * @param obj { contract: ''} 共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.peoplesTodayAboutResonate　= async function (obj) {
	return this.sdk.peoplesTodayAboutResonate(obj);
};

/**
 * 共振　获取最后100个中奖的人
 * @param obj { contract: ''} 共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.easterEggPeopleAboutResonate　= async function (obj) {
	return this.sdk.easterEggPeopleAboutResonate(obj);
};

/**
 * 共振　获取用户彩蛋的中奖金额
 * @param obj { contract: '0x12'， address: '0x111' } 共振合约 要查询的用户地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.getEggRewardAboutResonate　= async function (obj) {
	return this.sdk.getEggRewardAboutResonate(obj);
};

/**
 * 共振　获取彩蛋总奖金
 * @param obj { contract: ''} 共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.totalEasterEggBalanceAboutResonate　= async function (obj) {
	return this.sdk.totalEasterEggBalanceAboutResonate(obj);
};

/**
 * 共振　共振是否结束
 * @param obj { contract: ''} 共振合约
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.isOverAboutResonate = async function (obj) {
	return this.sdk.isOverAboutResonate(obj);
};

/**
 * 挖矿　允许某个账号对我的账户进行一定额度的代币代扣
 * @param privateKey　允许人的私钥
 * @param spender　代扣者
 * @param amount　允许金额
 * @param tokenContract　允许代扣的币种地址合约
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.approveAboutMining = async function(privateKey, spender, amount, tokenContract, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.approve(
		privateKey,
		spender,
		amount,
		fee,
		tokenContract,
		nonce,
	)
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送approveAboutMining交易， hash： ${txHash}`)
	return txHash;
}

/**
 * 挖矿　往合约里存代币
 * @param contract　挖矿合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param address　邀请人　无请填字符串　0
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.depositAboutMining = async function(contract, privateKey, amount, address, nonce, fee) {
	let sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'deposit',
		params: address !== '0' ? [amount, address] : [ amount ]
	})
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送交易depositAboutMining， hash： ${txHash}`)
	return txHash;
}

/**
 * 挖矿　抽成
 * @param contract　挖矿合约
 * @param privateKey　私钥
 * @param day　第几天
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.cutAboutMining = async function (contract, privateKey, day, nonce, fee) {
	let sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'cut',
		params: [day]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送cutAboutMining交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 挖矿　提出挖矿结束的订单奖励
 * @param contract　挖矿合约
 * @param privateKey　挖矿合约
 * @param indexs　是个数据
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.withdrawAboutMining =　async function (contract, privateKey, indexs, nonce, fee) {
	let sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'withdraw',
		params: [indexs]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送withdrawAboutMining交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 挖矿　注册邀请人节点
 * @param contract　挖矿合约
 * @param privateKey　挖矿合约
 * @param parent　邀请人地址
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.registerParentAboutMining =　async function (contract, privateKey, parent, nonce, fee) {
	let sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'registerParent',
		params: [parent]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送registerParentAboutMining交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 挖矿　充值后挖矿结束，点击再次挖矿
 * @param contract　挖矿合约
 * @param privateKey　私钥
 * @param orderIndex　是个包含订单序号的数组
 * @param parentAddress　邀请人地址　可不填
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.mining = async function (contract, privateKey, orderIndex, parentAddress='0', nonce, fee) {
	let sdk = this.sdk;
	// 创建交易
	let txData = await sdk.sendScMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'mining',
		params: parentAddress === '0' ? [ orderIndex ] : [ orderIndex, parentAddress ],
	});　
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送mining交易， hash： ${txHash}`)
	return txHash;
};

/**
 * 挖矿 第一次挖矿的高度
 * @param obj
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.firstHeightMining = async function (obj) {
  return this.sdk.firstHeightMining(obj);
};

/**
 * otc 挂单
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param tokenGet　要获取的token
 * @param amountGet 要获取的数量
 * @param tokenGive　支付的token
 * @param amountGive 要支付的数量
 * @param expires　过期的区块高度
 * @param nonce　
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.orderOtc =　async function (contract, privateKey, tokenGet, amountGet, tokenGive, amountGive, expires, nonce, fee) {
	let sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'order',
		params: [tokenGet, amountGet, tokenGive, amountGive, expires, nonce]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送orderOtc交易， hash： ${txHash}`)
	return txData;
};

/**
 *　otc 取消挂单
 * @param contract otc合约
 * @param privateKey 私钥
 * @param tokenGet 要获取的token
 * @param amountGet 要获取的数量
 * @param tokenGive 支付的token
 * @param amountGive 要支付的数量
 * @param expires 过期的区块高度
 * @param orderNonce 相关订单的nonce
 * @param v 加密信息
 * @param r　加密信息
 * @param s　加密信息
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.cancelOrderOtc =  async function(contract, privateKey, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, nonce, fee) {
	let sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'cancelOrder',
		params: [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, v, r, s]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送cancelOrderOtc交易， hash： ${txHash}`)
	return txData;
};

/**
 * otc 成交挂单
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param tokenGet　要获取的token
 * @param amountGet　要获取的数量
 * @param tokenGive　支付的token
 * @param amountGive　要支付的数量
 * @param expires　过期的区块高度
 * @param orderNonce 订单关联nonce
 * @param user　购买人
 * @param amount　购买的数量
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.tradeOtc = async function(contract, privateKey, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, amount, nonce, fee) {
	let sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'trade',
		params: [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, v, r, s, amount]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送tradeOtc交易， hash： ${txHash}`)
	return txData;
};

/**
 * otc 测试交易
 * @param tokenGet　要获取的token
 * @param amountGet　要获取的数量
 * @param tokenGive　支付的token
 * @param amountGive　要支付的数量
 * @param expires　过期的区块高度
 * @param orderNonce 订单关联nonce
 * @param user　购买人
 * @param amount　购买的数量
 * @param sender 购买地址
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.testTradeOtc = async function(tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, amount, sender) {
	return this.sdk.testTradeOtc(tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, amount, sender);
};


BlockchainSdk.prototype.ordersOtc = async function(address, txHash) {
	return this.sdk.ordersOtc(address, txHash);
};

/**
 * otc 设置otc协议
 * @param otcContract　otc 协议
 * @returns {*}
 */
BlockchainSdk.prototype.setOtcContract = function(otcContract) {
	return this.sdk.setOtcContract(otcContract)
};
/**
 * otc　允许某个账号对我的账户进行一定额度的代币代扣
 * @param privateKey　允许人的私钥
 * @param spender　代扣者
 * @param amount　允许金额
 * @param tokenContract　允许代扣的币种地址合约
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.approveOtc = async function(privateKey, spender, amount, tokenContract, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.approve(
		privateKey,
		spender,
		amount,
		fee,
		tokenContract,
		nonce,
	)
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	let txHash = await sdk.send(txData);
	console.log(`成功发送approveOtc交易， hash： ${txHash}`)
	return txHash;
}

/**
 * otc　往合约内存代币
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param tokenAddress token合约地址
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.depositTokenOtc = async function(contract, privateKey, amount, tokenAddress, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'depositToken',
		params: [tokenAddress, amount]
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送交易depositTokenOtc， hash： ${txHash}`)
	return txData;
};

/**
 * otc　取出在合约里面存的代币
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param tokenAddress token合约地址
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.withdrawTokenOtc = async function(contract, privateKey, amount, tokenAddress, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'withdrawToken',
		params: [tokenAddress, amount]
	});
	console.log(`withdrawTokenOtc: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送交易withdrawTokenOtc， hash： ${txHash}`)
	return txData;
};

/**
 * otc　往合约内存ETH
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.depositETHOtc = async function(contract, privateKey, amount, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		amount,
		needValue: true,
		funcName: 'deposit',
		params: []
	});
	console.log(`txhash: ${JSON.stringify(txData)}`);
	// 发送交易
	// let txHash = await sdk.send(txData);
	// console.log(`成功发送交易depositETHOtc， hash： ${txHash}`)
	return txData;
};

/**
 * otc 查看用户 在合约里有多少的指定代币(包含eh)
 * @param address 用户地址
 * @param tokenAddress　代币地址, 如果是eth默认不填
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.balanceOfTokenOtc = async function(address, tokenAddress) {
	return this.sdk.balanceOfTokenOtc(address, tokenAddress);
};

/**
 * otc　取出合约内存的ETH
 * @param contract　otc合约
 * @param privateKey　私钥
 * @param amount　金额
 * @param nonce
 * @param fee
 * @returns {Promise<void>}
 */
BlockchainSdk.prototype.withdrawETHOtc = async function(contract, privateKey, amount, nonce, fee) {
	const sdk = this.sdk;
	let txData = await sdk.sendOtcMessage({
		privateKey,
		fee,
		nonce,
		contract,
		funcName: 'withdraw',
		params: [amount]
	});
	console.log(`withdrawETHOtc: ${JSON.stringify(txData)}`);
	// 发送交易
	// console.log(`成功发送交易withdrawETHOtc， hash： ${txHash}`)
	return txData;
};

/**
 * otc 获取otc合约的管理员
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.getOtcContractAdmin = async function() {
	return this.sdk.getOtcContractAdmin()
};

/**
 * otc 存代币
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.depositToken = async function() {
	return this.sdk.depositToken()
};

/**
 * otc 发送otc合约交易信息
 * @param obj
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.sendOtcMessage = async function (obj) {
	return this.sdk.sendOtcMessage(obj);
}

/**
 * 获取原声的交易数据
 * @param txHash
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.getRowTransaction = async function (txHash) {
	return this.sdk.getRowTransaction(txHash);
}

/**
 * otc 用户代币余额查询
 * @param tokenContractAddress
 * @param userAddress
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.tokens = async function (tokenContractAddress, userAddress) {
	return this.sdk.tokens(tokenContractAddress, userAddress);
};

/**
 * otc 成交手续费
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.feeMake = async function () {
	return this.sdk.feeMake();
};

/**
 * otc 退还款手续费
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.feeRebate = async function () {
	return this.sdk.feeRebate();
};

/**
 *
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.feeTake = async function () {
	return this.sdk.feeTake();
};

/**
 * otc 手续费存放的账户地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.feeAccount = async function () {
	return this.sdk.feeAccount();
};


BlockchainSdk.prototype.accountLevelsAddr = async function () {
	return this.sdk.accountLevelsAddr();
};

/**
 * otc 挂单已经成交的量
 * @param tokenGet　要获取的token
 * @param amountGet　要获取的数量
 * @param tokenGive　支付的token
 * @param amountGive　要支付的数量
 * @param expires　过期的区块高度
 * @param nonce 订单关联nonce
 * @param user　订单发布的地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.amountFilled = async function(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user) {
	return this.sdk.amountFilled(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user);
};

/**
 * otc 挂单可成交的量
 * @param tokenGet　要获取的token
 * @param amountGet　要获取的数量
 * @param tokenGive　支付的token
 * @param amountGive　要支付的数量
 * @param expires　过期的区块高度
 * @param nonce 订单关联nonce
 * @param user　订单发布的地址
 * @returns {Promise<*>}
 */
BlockchainSdk.prototype.availableVolume = async function(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user) {
	return this.sdk.availableVolume(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user);
};

module.exports = BlockchainSdk;
