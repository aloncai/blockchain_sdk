var chainType = require("./constants").chainType;
var UsdtSdk = require("./usdt/index");
var EthSdk = require("./eth/index");
var BtcSdk = require("./btc/index");
var AscSdk = require("./asc/index")
/**
 * @desc 创建连接
 * @param{object}  provider
 * {
 * 	@param{int} chainType // 哪一个链， 对应的链类型在constant.js中
 * 	@param{bool} testnet // 是否测试网络
 * 	@param{string} host //such as: 127.0.0.1
 *  @param{string} port //such as: 3001
 * 	@param(int} timeout
 * 	@param{string} user
 * 	@parms{string} password
 * }
 * @returns blockchainSdk
 */
var BlockchainSdk = function (provider) {
	// 参数检查
	checkProvider(provider);

	//查找那一条链
	var Sdk = null;

	switch(provider.chainType) {
		case chainType.USDT:
			Sdk = UsdtSdk;
			break;
		case chainType.ETH:
			Sdk = EthSdk;
			break;
		case chainType.BTC:
			Sdk = BtcSdk;
			break;
		case chainType.ASC:
			Sdk = AscSdk;
			break;
		default:
			throw("未找到链的类型，请检查输入的chainTpye是否存在");
							
	}
	
	var sdk = new  Sdk(provider);

	return sdk;
}

/**
 * @desc 验证生成连接的参数
 * @param{object} provider //参数说明在最上面
 **/
var checkProvider = function(provider) {
	
	if (!provider) {
		throw ("need provider!");
	}

	if (provider.testnet == undefined) {
		throw("need provider.testnet");
	}

	if (!provider.host) {
		throw("need provider.host");
	}

	if (!provider.port || typeof provider.port != 'number') {
		throw("need provider.port and port must be int");
	}

}

module.exports = BlockchainSdk 
