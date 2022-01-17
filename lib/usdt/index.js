var bitcoin = require("bitcoinjs-lib");
var request = require('request-promise-native')
var Bignumber = require('bignumber.js')
var Base64 = require('js-base64').Base64
var usdtConfig = require('../config').usdt
var async = require('async')
var sha256 = require('js-sha256')
var bs58 = require('bs58')

const {browserAddress, browserAddressTest} = require('../config.json');

var UsdtSdk = function(provider) {
	if (!provider.user || !provider.password) {
		throw 'usdt节点的连接需要basic authorization用户名和密码';
	}
	// 标志是否测试网络，方便调用时查询
	this.testnet = provider.testnet;
	// `https://test-insight.swap.online/insight-api`  测试环境的第三方api
	//`https://insight.bitpay.com/api` //正式环境的第三方api
	this.host = provider.host
	this.port = provider.port
	this.basicAuthorization = 'Basic ' + Base64.encode(`${provider.user}:${provider.password}`)
	// 浏览器端口
	// this.url = `http://${this.host}:${this.port}/insight-api`;
	// usdt 节点默认为浏览器端口+1
	var hasProtocol = /^https?:\/\//.test(this.host)
	this.rpcUrl = `${hasProtocol ? '' : 'http://'}${this.host}${hasProtocol ? '' : `:${this.port+2}`}`;
	// this.rpcUrl = `http://${this.host}:${this.port+2}`; // 3003 nginx解决跨域转发到 3002
	// 获取手续费的地点
	// this.insightUrl = provider.testnet?`http://${this.host}:${this.port}/insight-api` :`https://insight.bitpay.com/api`;
	this.insightUrl = provider.testnet?`http://${this.host}:3001/insight-api` :`https://insight.bitpay.com/api`;
	this.net = provider.testnet === true
			? bitcoin.networks.testnet
			: bitcoin.networks.bitcoin
    const ip = provider.testnet === true? browserAddressTest: browserAddress;
	this.privateUrl = `${ip}:7022/api/v1/transaction?chainName=usdt`

    this.pendingPrivateUrl = `${ip}:7022/api/v1/getPendingTransactionByAddress`;
	if(provider.properties) {
		this.properties = provider.properties
	} else {
		this.properties = this.testnet? 2: 31;
	}

}

UsdtSdk.prototype.createSimpleSend = async function (senderKey, recipient_address, amount, feeValue, message) {

		// 因为btc的精度不会超过js所能表示的整型精度，
		// 所以直接用js加减是没问题，但对外提供的sdk需要保持统一，所以要输入字符串整型
		amount = parseInt(amount);
		feeValue = parseInt(feeValue);
		var tx = new bitcoin.TransactionBuilder(this.net)
		tx.setVersion(1)

		var sender_p2pkh = senderKey.getAddress()

		var unspents = await this.fetchUnspents(sender_p2pkh)

		var fundValue     = 546 // dust

		var totalUnspent  = unspents.reduce((summ, { amount }) => {
			// 乘以10的八次方，获取最小单位
			var satoshis = new Bignumber(amount).times(100000000).toNumber();
			return summ + satoshis;
		}, 0)

		var skipValue   = totalUnspent - fundValue - feeValue;

		if ( totalUnspent < feeValue + fundValue) {
			throw new Error(`Total less than fee: totalUnspent: $${totalUnspent} < feeValue: ${feeValue} + fundValue: ${fundValue}`)
		}

		unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
		// usdt固定位数代表相应的含义，所以位数不足的要补0
		amount = this.fillUpZero(amount.toString(16), 16)
		// 在对应链上的properties, 正式网是31,测试网是2
		let _properties = this.fillUpZero(this.properties.toString(16), 12)
		var simple_send = [
				"6f6d6e69", // omni
				"0000",     // version
				//"000000000002", // 31 for Tether testnet
				_properties,
				//"000000003B9ACA00" // amount = 10 * 100 000 000 in HEX
				amount
		].join('')

		var data =  Buffer.from(simple_send, "hex")  // NEW** data must be an Array(Buffer)

		var dataScript = bitcoin.script.nullData.output.encode(data)
		// data = Buffer.from(data, 'utf8')

		tx.addOutput(recipient_address, fundValue) // should be first!
		tx.addOutput(dataScript, 0)
		tx.addOutput(sender_p2pkh, skipValue)
		// 添加备注
		if (message) {
			message = Buffer.from(message, 'utf8')
      		var messageScript = bitcoin.script.nullData.output.encode(message)
		    // data = Buffer.from(data, 'utf8')
			tx.addOutput(messageScript, 1000)
		}
		unspents.forEach((unspent, index) => {
			tx.sign(index, senderKey)
		})
		return tx
}



UsdtSdk.prototype.fetchUnspents = async function(address) {
	return request(`${this.insightUrl}/addr/${address}/utxo/`)
		.then(JSON.parse)
}

/**
 * @desc 发送交易
 * @param{string} privateKey
 * @param{string} recipientAddress
 * @param{string} amount
 * @param{string} fee
 * */

UsdtSdk.prototype.createTx = async function(privateKey, recipientAddress, amount, fee, data = '') {

		if (typeof amount != 'string' || typeof fee != 'string') {
			throw 'amount 和 fee 必须是字符串';
		}

		var	bigAmount = new Bignumber(amount), bigFee = new Bignumber(fee);


		if (!bigAmount.isInteger() || !bigFee.isInteger()) {
			throw 'amount 和 fee必须是字符串整型';
		}

		var senderKey = bitcoin.ECPair.fromWIF(privateKey, this.net)

		// 创建交易
		var tx = await this.createSimpleSend(senderKey, recipientAddress, amount, fee, data)
		var txRaw = tx.buildIncomplete()
		//返回交易
		return {
			txHash: txRaw.getId(),
			codingTx: txRaw.toHex()
		}
}

UsdtSdk.prototype.send = async function(txData) {
	await request({
		url: `${this.rpcUrl}`,
		method: 'post',
		headers: {
			"Authorization": this.basicAuthorization,
			"Content-type": "application/json"
		},
		json: true,
		body: {
			method: "sendrawtransaction",
			params: [txData.codingTx]
		}
	})

	return txData.txHash;
}

//查询余额
UsdtSdk.prototype.getBalance = async function(address) {

	var balanceData = await request.post(`${this.rpcUrl}`, {
	json: true,
		headers: {
			Authorization: this.basicAuthorization
		},
		body: {
			jsonrpc: '1.0',
			id: '',
			method: 'omni_getbalance',
			params: [address, this.properties]
		}
	});
	// 返回以最小单位的整型字符串
	var balance = new Bignumber(balanceData.result.balance).times(100000000).toString()
	return balance;
}
// 把字符串不足size位的用0补充
UsdtSdk.prototype.fillUpZero = function(str, size) {
	var len = str.length;
	// 需要补充gap个0
	var gap = size - len;
	for (var i = 0; i < gap; i++) {
		str = "0" + str;
	}
	return str;

}

//查询交易
UsdtSdk.prototype.findTx = async function(txHash) {
	// var txData = await request(`${this.url}/tx/${txHash}`);
	// txData = JSON.parse(txData)
	// var commontx = this.getCommonTx(txData)

	// return commontx
	var txData = await request({
		url: `${this.rpcUrl}`,
		method: 'post',
		headers: {
			"Authorization": this.basicAuthorization,
			"Content-type": "application/json"
		},
		json: true,
		body: {
			method: "getrawtransaction",
			params: [txHash]
		}
	})

	let tx = bitcoin.Transaction.fromHex(txData.result)
	// console.log(txHash)

	var commontx = await this.getCommonTx(tx, txHash)
	return commontx;
}

/**
 *
 * @param {object} txData //链上返回的数据对象
 * @return {object} //返回通用格式的对象
 */
UsdtSdk.prototype.getCommonTx = async function(txData, txHash) {
	//只取第一个input发送方
	try {
		var that = this;

		var usdtTx = await request({
			url: `${this.rpcUrl}`,
			method: 'post',
			headers: {
				"Authorization": this.basicAuthorization,
				"Content-type": "application/json"
			},
			json: true,
			body: {
				method: "omni_gettransaction",
				params: [txHash]
			}
		})

		usdtTx = usdtTx.result;

		// 返回通用的交易格式
		var commonData = {
			status: 'success', //交易状态 success failed pendding
			blockHeight: usdtTx.block,
			txHash: txHash,
			isErc20: false, //判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
			sender: usdtTx.sendingaddress,
			recipient: usdtTx.referenceaddress, //只取第一个地址
			erc20Sender: null,
			erc20Recipient: null,
			amount: new Bignumber(usdtTx.amount).times(100000000).toString(),
			fee: new Bignumber(usdtTx.fee).times(100000000).toString(),
			data: '',
			timeStamp: usdtTx.blocktime
		}

		for (let i = 0; i < txData.outs.length; i++) {
			let out = txData.outs[i];
			// 是备注吗, 不是6f6d6e69，即是备注
			let asm = bitcoin.script.toASM(out.script);
			if(/^OP_RETURN (?!6f6d6e69)/.test(asm)) {
				let hexStr = new Buffer(asm.slice(10), 'hex')
		　　　　 commonData.data = hexStr.toString()
			}
		}

		return commonData;
	} catch(err) {

		throw err;
	}
	// ==============
	// var fee = txData.fees? new Bignumber(txData.fees).times(100000000).toString(): '0'
	// var that =this;
	// var commonData = {
	// 	status: success, //交易状态 success failed pendding
	// 	blockHeight: otherMessage.height,
	// 	txHash: txData.txid,
	// 	isErc20: false, //判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
	// 	sender: null,
	// 	recipient: null, //暂时为空，下面再判断
	// 	erc20Sender: null,
	// 	erc20Recipient: null,
	// 	amount: null,
	// 	fee,
	// 	data: '',
	// 	timeStamp: otherMessage.time
	// }
	// txData.vout.forEach(vout => {
	// 	// 是备注吗, 不是6f6d6e69，即是备注
	// 	if(/^OP_RETURN (?!6f6d6e69)/.test(vout.scriptPubKey.asm)) {
	// 		let hexStr = new Buffer(vout.scriptPubKey.asm.slice(10), 'hex')
	// 　　　　 commonData.data = hexStr.toString()
	// 		return
	// 	}
	// 	// 查找usdt交易
	// 	if(/^OP_RETURN 6f6d6e69/.test(vout.scriptPubKey.asm)) {
	// 		// 如果是正式网络，要判断version
	// 		if(!that.testnet && vout.scriptPubKey.asm.slice(26, 34) != '0000001f') {
	// 			return commonData
	// 		}
	// 		commonData.sender = txData.vin[0].addr
	// 		commonData.recipient = txData.vout[0].scriptPubKey.addresses? txData.vout[0].scriptPubKey.addresses[0]: null
	// 		commonData.amount = vout.scriptPubKey.asm.slice(-16)
	// 		// 转为10进制
	// 		commonData.amount = parseInt(commonData.amount, 16).toString()
	// 	}
	// })

	// return commonData;
}

UsdtSdk.prototype.findTxByBlock = async function (numberOrHash) {
	// 存放通用交易
	var commontxs = [], that = this, block = {}, otherMessage = {};
	return new Promise(async function(resolve, reject) {
		try {

			// 如果是hash,则获取高度
			if (typeof numberOrHash == 'string') {
				console.log('>>>>>>>>>>>>>>>>>>>>>>　start', numberOrHash)
				let blockData = await request(`${that.insightUrl}/block/${numberOrHash}`);
				console.log('>>>>>>>>>>>>>>>>>>>>>> sencod', numberOrHash)
				blockData = JSON.parse(blockData);
				numberOrHash = blockData.height;
			}
			console.log('that.rpcUrl', that.rpcUrl)
			var txData = await request.post(`${that.rpcUrl}`, {
				json: true,
					headers: {
						Authorization: that.basicAuthorization
					},
					body: {
						jsonrpc: '1.0',
						id: '',
						method: 'omni_listblocktransactions',
						params: [numberOrHash]
					}
				});

			// 使用async库并发查询，每次查20条
			async.eachOfLimit(txData.result, 60, async function(txid) {
				var commonTx = await that.findTx(txid)
				commontxs.push(commonTx)
			}, function(err) {
				if (err) {
					reject('并发查询交易出错');
				}

				return resolve(commontxs)
			})
		}catch(err) {
			console.log(err)
			reject(err)
		}
	})

}


UsdtSdk.prototype.getLastBlock = async function() {
	var blockData = await request(`${this.insightUrl}/blocks?limit=1`).then(JSON.parse);

	var block = {
		height: blockData.blocks[0].height,
		hash: blockData.blocks[0].hash
	}

	 return block;
}

UsdtSdk.prototype.createKeypair = function() {

	var keyPair = bitcoin.ECPair.makeRandom({
		network: this.net
	})
	var privateKey = keyPair.toWIF();
	keyPair = {
		publicKey: keyPair.getPublicKeyBuffer().toString('hex'),
		privateKey: privateKey,
	}

	return keyPair
}

UsdtSdk.prototype.getPublicKeyAndAddress = function(privateKey) {

	var keypair = bitcoin.ECPair.fromWIF(privateKey, this.net)

	var publicKey = keypair.getPublicKeyBuffer().toString('hex')
	var address = keypair.getAddress();

	return {
		publicKey,
		address
	}
}

UsdtSdk.prototype.getAddress = function(publicKey) {
    // 将公钥转换为地址
	// var pubkey = [];
	// for(var i = 0; i < publicKey.length; i+=2)
	// {
    // 	pubkey.push(parseInt(publicKey.substring(i, i + 2), 16));
	// }
	// pubkey = Uint8Array.from(pubkey)

	throw '该函数没有找到相应的方法，需要自行转行，先注释';

}

UsdtSdk.prototype.getAverageFee = async function() {
	var fee = await request(`${this.insightUrl}/utils/estimatefee?nbBlocks=10`).then(JSON.parse);
	var bigFee = new Bignumber(fee[10]).times(120000000).toFixed(0);
	return bigFee;
}

UsdtSdk.prototype.getPrivateKeyBySeed = function(seed) {
	const privateKey = sha256(seed);
	const prefix = this.testnet? "ef": "80";
	const step1 = Buffer.from( prefix + privateKey, 'hex');
	const step2 = sha256(step1);
	const step3 = sha256(Buffer.from(step2, 'hex'));
	const checksum = step3.substring(0, 8);
	const step4 = step1.toString('hex') + checksum;
	const privateKeyWIF = bs58.encode(Buffer.from(step4, 'hex'));
	return privateKeyWIF;
}

UsdtSdk.prototype.getTxsByAddress = async function (obj) {
	const {address, page, size, status, addressType, amountSort, time, day} = obj
    let params = "";

    if(!address || !page || !size) {
        throw '请输入 address page size'
    }

    params = `&address=${address}&page=${page}&pageSize=${size}`

    if(status) {
        params = params + `&status=${status}`
    }

    if(addressType) {
        params = params + `&addressType=${addressType}`
	}

	if(amountSort) {
        params = params + `&amountSort=${amountSort}`
    }
    if(time && day) {
        params += `&time=${time}&day=${day}`
    }

	var txData = await request.get(`http://${this.privateUrl + params}`);

	let txs = JSON.parse(txData).data
	return txs;
}

// 是否有效的地址
UsdtSdk.prototype.checkAddress = function (address) {
	try {
		var net = this.testnet? bitcoin.networks.testnet: bitcoin.networks.bitcoin;
		bitcoin.address.toOutputScript(address, net)
		return true;
	} catch(err) {
		return false;
	}
}

UsdtSdk.prototype.getPendingTxsByAddress = async function (obj) {

    const { address, page, size, addressType, amountSort } = obj
    let params = "txType=usdt";

    if (!address) {
        throw '请输入 address'
    }

    params += `&address=${address}`;

    if (page) params += `&page=${page}`;
    if (size) params += `&pageSize=${size}`;

    if (addressType) {
        params = params + `&addressType=${addressType}`
    }

    if (amountSort) {
        params = params + `&amountSort=${amountSort}`
    }
    let txs = await request(`http://${this.pendingPrivateUrl}?${params}`);
    return JSON.parse(txs).data;

}


module.exports = UsdtSdk;
