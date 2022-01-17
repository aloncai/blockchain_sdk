var bitcoin = require("bitcoinjs-lib");
var request = require('request-promise-native')
var Bignumber = require('bignumber.js')
var Base64 = require('js-base64').Base64
var async = require('async')
var sha256 = require('js-sha256')
var bs58 = require('bs58')

const {browserAddress, browserAddressTest} = require('../config.json');

var BtcSdk = function(provider) {
	if (!provider.user || !provider.password) {
		throw 'btc节点的连接需要basic authorization用户名和密码';
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
	var hasProtocol = /^https?:\/\//.test(this.host)
	this.rpcUrl = `${hasProtocol ? '' : 'http://'}${this.host}${hasProtocol ? '' : `:${this.port}`}`;
	// this.rpcUrl = `http://${this.host}:3003`
	// 获取手续费的地点
	// this.insightUrl = provider.testnet?`http://${this.host}:${this.port}/insight-api` :`https://insight.bitpay.com/api`;
	this.insightUrl = provider.testnet?`http://${this.host}:3001/insight-api` :`https://insight.bitpay.com/api`;
	this.net = provider.testnet === true
			? bitcoin.networks.testnet
			: bitcoin.networks.bitcoin
    const ip = provider.testnet === true? browserAddressTest: browserAddress;
    this.privateUrl = `${ip}:7022/api/v1/transaction?chainName=btc`;
    this.pendingPrivateUrl = `${ip}:7022/api/v1/getPendingTransactionByAddress`;
}

BtcSdk.prototype.createSimpleSend = async function (senderKey, recipient_address, amount, feeValue, data) {

		// 因为btc的精度不会超过js所能表示的整型精度，
		// 所以直接用js加减是没问题，但对外提供的sdk需要保持统一，所以要输入字符串整型
		amount = parseInt(amount);
		feeValue = parseInt(feeValue);
		var tx = new bitcoin.TransactionBuilder(this.net)
		tx.setVersion(1)

		var sender_p2pkh = senderKey.getAddress();
		var unspents = await this.fetchUnspents(sender_p2pkh)

		var fundValue     = amount // 发送数量

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


		tx.addOutput(recipient_address, fundValue) // should be first!
		tx.addOutput(sender_p2pkh, skipValue)
		// 添加备注
		if (data) {
			data = Buffer.from(data, 'utf8')
      		var dataScript = bitcoin.script.nullData.output.encode(data)
		    // data = Buffer.from(data, 'utf8')
			tx.addOutput(dataScript, 1000)
		}

		unspents.forEach((unspent, index) => {
			tx.sign(index, senderKey)
		})
		return tx
}



BtcSdk.prototype.fetchUnspents = async function(address) {
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

BtcSdk.prototype.createTx = async function(privateKey, recipientAddress, amount, fee, data = '') {

		if (typeof amount != 'string' || typeof fee != 'string') {
			throw 'amount 和 fee 必须是字符串';
		}

		var	bigAmount = new Bignumber(amount), bigFee = new Bignumber(fee);


		if (!bigAmount.isInteger() || !bigFee.isInteger()) {
			throw 'amount 和 fee必须是字符串整型';
		}

		var senderKey = bitcoin.ECPair.fromWIF(privateKey, this.net)

		// var senderAddress = senderKey.getAddress()

		// 创建交易
		var tx = await this.createSimpleSend(senderKey, recipientAddress, amount, fee, data)
		var txRaw = tx.buildIncomplete()
		//返回交易
		return {
			txHash: txRaw.getId(),
			codingTx: txRaw.toHex()
		}
}

BtcSdk.prototype.send = async function(txData) {

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
BtcSdk.prototype.getBalance = async function(address) {

    var balanceData = await request.get(`${this.insightUrl}/addr/${address}/?noTxList=1`);
    balanceData = JSON.parse(balanceData)
	// 返回以最小单位的整型字符串
	var balance = balanceData.balanceSat.toString()
	return balance;
}

//查询交易
BtcSdk.prototype.findTx = async function(txHash, otherMessage) {
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
	// 没有传入则自行查找(按区块查交易会传入，否则并发太多)
	if(!otherMessage) {
		let _tx = await request(`${this.insightUrl}/tx/${txHash}`).then(JSON.parse);
		otherMessage = {
			timestamp: _tx.blocktime,
			height: _tx.blockheight
		}
	}
	otherMessage.txHash = txHash;
	var commontx = await this.getCommonTx(tx, otherMessage)
	return commontx;

}

BtcSdk.prototype.getOutputAddress = function(out) {
	var  address;
	try {
		address = bitcoin.address.fromOutputScript(out.script, this.net)
	}catch(err) {
		try {
			let s = bitcoin.script.pubKey.output.decode(out.script);
			s = bitcoin.crypto.sha256(s);
			s = bitcoin.crypto.ripemd160(s);
			address = bitcoin.address.toBase58Check(bitcoin.script.compile(s), this.net.pubKeyHash);
		} catch(err) {
			// 可能是erc20，返回空即可
			return ""
		}
	}
	return address;

}

BtcSdk.prototype.getInsAmount = async function(txData, senders) {
	var that = this;
	// return new Promise(async (resolve, reject) => {
		// try {
			// 如果in超过30条，则不管
			if(txData.ins.length > 30) {
				return '0'
			}
			var bigInsAmount = new Bignumber(0);
			for(let i = 0; i < txData.ins.length; i++) {
				var ins = txData.ins[i];
				var hash = Buffer.from(ins.hash).reverse().toString('hex')
				// coinbas
				if(hash == '0000000000000000000000000000000000000000000000000000000000000000') {
					// 矿工奖励
					return '0'
				}
				// console.log(`hash ${hash}`)
				var txData2 = await request({
					url: `${that.rpcUrl}`,
					method: 'post',
					headers: {
						"Authorization": that.basicAuthorization,
						"Content-type": "application/json"
					},
					json: true,
					body: {
						method: "getrawtransaction",
						params: [hash]
					}
				})
				var tx = bitcoin.Transaction.fromHex(txData2.result)

				for (let i = 0; i < tx.outs.length; i++) {
					var address = that.getOutputAddress(tx.outs[i])
					for(let j = 0; j < senders.length; j++) {
						if(address == senders[j]) {
							bigInsAmount = bigInsAmount.plus(tx.outs[i].value);
							break;
						}
					}
				}
				// reject(`sender ${sender} hash ${hash}`)
			}
			return bigInsAmount.toString();
		// } catch(err) {
		// 	reject(err)
		// }
	// })
}
/**
 *
 * @param {object} txData //链上返回的数据对象
 * @return {object} //返回通用格式的对象
 */
BtcSdk.prototype.getCommonTx = async function(txData, otherMessage) {
	//只取第一个input发送方
	try {
		var that = this;

		var senders = [], recipient = null, amount = "0";
		// senders
		if (txData.ins.length) {
			// sender 取第一个
			for(let i = 0; i < txData.ins.length; i++) {
				let ins = txData.ins[i]
				var chunks = bitcoin.script.decompile(new Buffer(ins.script, 'hex'));

				if(chunks && chunks.length) {
					if (bitcoin.script.classifyInput(chunks) == 'pubkeyhash') {
						let sender = bitcoin.ECPair.fromPublicKeyBuffer(chunks[1], this.net).getAddress();
						senders.push(sender)
					}else{
						try {
							let hash = bitcoin.crypto.hash160(chunks[chunks.length - 1])
							let sender = bitcoin.address.toBase58Check(hash, this.net.scriptHash)
							senders.push(sender)
						} catch(err) {
							// 没有找到sender就过滤
						}
					}
				}
			}
		}
		var out = txData.outs[0];
		// recipient
		if( txData.outs[0].value == 0 && txData.outs.length > 1) {
			out = txData.outs[1];
		}
		recipient = that.getOutputAddress(out)
		// amount
		amount = out.value.toString();
		// fee (all all ins - all outs)
		var fee = "0";
		// all ins value
		var insAmount = await that.getInsAmount(txData, senders), note = "";
		// all outs value and note
		var outsAmount = new Bignumber(0);
		for (let i = 0; i < txData.outs.length; i++) {
			let out = txData.outs[i];
			// 是备注吗, 不是6f6d6e69，即是备注
			let asm = bitcoin.script.toASM(out.script);
			if(/^OP_RETURN (?!6f6d6e69)/.test(asm)) {
				let hexStr = new Buffer(asm.slice(10), 'hex')
		　　　　 note = hexStr.toString()
			}
			outsAmount = outsAmount.plus(out.value)
		}
		outsAmount = outsAmount.toString()
		// fee = insAmount - outsAmount; (coinbase = 0)
		if(new Bignumber(insAmount).gt(outsAmount)) {
			fee = new Bignumber(insAmount).minus(outsAmount).toString();
		}

		// console.log(`sender ${senders[0]} recipient ${recipient} amount ${amount} fee ${fee}`)

		// 返回通用的交易格式
		var commonData = {
			status: 'success', //交易状态 success failed pendding
			blockHeight: otherMessage.height,
			txHash: otherMessage.txHash,
			isErc20: false, //判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
			sender: senders[0],
			recipient: recipient, //只取第一个地址
			erc20Sender: null,
			erc20Recipient: null,
			amount: amount,
			fee: fee,
			data: note,
			timeStamp: otherMessage.timestamp
		}
		return commonData;
	} catch(err) {

		throw err;
	}
	// 找出第一个output 否则接受者和amount都为0
	// if (txData.outs.length) {
	// 	// toDO value
	// 	var out = txData.outs[0].value == '0'? txData.outs[1]: txData.outs[0];
	// 	recipient = 'fffff'
	// 	amount = new Bignumber(out.value).times(100000000).toString()
	// }

	// var fee = txData.fees? new Bignumber(txData.fees).times(100000000).toString(): '0'
	// // 交易状态
	// var status = null
	// if ( txData.confirmations == 0 ) {
	// 	status = 'pending'
	// }  else {
	// 	status = 'success'
	// }


	// // 找出备注
	// txData.vout.forEach(vout => {
	// 	// 是备注吗, 不是6f6d6e69，即是备注
	// 	if(/^OP_RETURN (?!6f6d6e69)/.test(vout.scriptPubKey.asm)) {
	// 		let hexStr = new Buffer(vout.scriptPubKey.asm.slice(10), 'hex')
	// 　　　　 commonData.data = hexStr.toString()
	// 		return
	// 	}
	// })

	// return commonData;
}

BtcSdk.prototype.findTxByBlock = async function (numberOrHash) {
    // 存放所有交易
	var txs = [], that = this;
	return new Promise(async function(resolve, reject) {
		try {
			// 如果是高度，需要获取hash
			if (typeof numberOrHash == 'number') {
				var blockData = await request.get(`${that.insightUrl}/block-index/${numberOrHash}`);
				blockData = JSON.parse(blockData)
				numberOrHash = blockData.blockHash;
			}

			// 获取区块的所有交易hash
			var blockData = await request({
					url: `${that.rpcUrl}`,
					method: 'post',
					headers: {
						"Authorization": that.basicAuthorization,
						"Content-type": "application/json"
					},
					json: true,
					body: {
						method: "getblock",
						params: [numberOrHash]
					}
				})
			var txsHash = blockData.result.tx;

			//获取具体交易
			async.eachOfLimit(txsHash, 20, async function(tx, index) {
				let otherMessage = {
					"height": blockData.result.height,
					"timestamp": blockData.result.time,
				}
				_tx = await that.findTx(tx, otherMessage);
				txs.push(_tx);
				console.log(index)
			}, function(err) {
				if (err) {
					reject(`btc并发查询交易出错: ${err.error}`);
				}

				resolve(txs)
			})
		} catch(err) {
			reject(err)
		}

	})


}

BtcSdk.prototype.getLastBlock = async function() {
	var blockData = await request(`${this.insightUrl}/blocks?limit=1`).then(JSON.parse);

	var block = {
		height: blockData.blocks[0].height,
		hash: blockData.blocks[0].hash
	}

	 return block;
}

BtcSdk.prototype.createKeypair = function() {
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

BtcSdk.prototype.getPublicKeyAndAddress = function(privateKey) {

	var keypair = bitcoin.ECPair.fromWIF(privateKey, this.net)

	var publicKey = keypair.getPublicKeyBuffer().toString('hex')
	var address = keypair.getAddress();

	return {
		publicKey,
		address
	}
}

BtcSdk.prototype.getAddress = function(publicKey) {
    // 将公钥转换为地址
	// var publicKeyBuffer = new Buffer(publicKey, 'hex')
	// var publicKey = bitcoin.ECPair.fromPublicKeyBuffer(publicKeyBuffer)
	// var address = new bitcoin.ECPair(null, publicKey.Q, { compressed: true }).getAddress();

	// return address;
	throw '该函数没有找到相应的方法，需要自行转行，先注释';
}

BtcSdk.prototype.getAverageFee = async function() {
	var fee = await request(`${this.insightUrl}/utils/estimatefee?nbBlocks=10`).then(JSON.parse);
	var bigFee = new Bignumber(fee[10]).times(150000000).toFixed(0);
	return bigFee;
}

BtcSdk.prototype.getPrivateKeyBySeed = function(seed) {
	privateKey = sha256(seed);
	const prefix = this.testnet? "ef": "80";
	const step1 = Buffer.from( prefix + privateKey, 'hex');
	const step2 = sha256(step1);
	const step3 = sha256(Buffer.from(step2, 'hex'));
	const checksum = step3.substring(0, 8);
	const step4 = step1.toString('hex') + checksum;
	const privateKeyWIF = bs58.encode(Buffer.from(step4, 'hex'));
	return privateKeyWIF;
}

BtcSdk.prototype.getTxsByAddress = async function (obj) {
	var that = this;

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

	return new Promise((resolve, reject) => {
		request(`http://${this.privateUrl + params}`, function(err, response, body){
			if (err) {
				reject(err);
			}

			let txs = JSON.parse(body).data;

			resolve(txs)
		})
	})

}

// 是否有效的地址
BtcSdk.prototype.checkAddress = function (address) {
	try {
		var net = this.testnet? bitcoin.networks.testnet: bitcoin.networks.bitcoin;
		bitcoin.address.toOutputScript(address, net)
		return true;
	} catch(err) {
		return false;
	}
}

BtcSdk.prototype.getPendingTxsByAddress = async function (obj) {

    const { address, page, size, addressType, amountSort } = obj
    let params = "txType=btc";

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

module.exports = BtcSdk;
