var Bignumber = require('bignumber.js');
var Web3 = require('web3');
var EthereumTx = require('ethereumjs-tx');
var utils = require('ethereumjs-utils');
const SimpleKeyring = require('eth-simple-keyring');
var abi = require('human-standard-token-abi');
var async = require('async');
var sha256 = require('js-sha256')
const checkPrivateKeyLength = require('../help/length');
const {browserAddress, browserAddressTest} = require('../config.json');
const Transaction = require('../help/transaction');
const hdkey = require('ethereumjs-wallet/hdkey');
const bip39 = require('bip39');
const PATH = "m/44'/60'/0'/0/0";

// Erc20转账方法的Sha值
var TransferMethodSha = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function EthSdk(provider) {
    

    const options = {
        defaultBlock: 'latest',
        transactionBlockTimeout: 50,
        transactionConfirmationBlocks: 24,
        transactionPollingTimeout: 60
    };

    this.host = provider.host;
    this.port = provider.port;
    this.chainId = provider.testnet? 4: 1;

    var hasProtocol = /^https?:\/\//.test(this.host)

    // 实例化的web3对象
    this.web3 = new Web3(`${hasProtocol ? '' : 'http://'}${this.host}${hasProtocol ? '' : `:${this.port}`}`, options);
    const ip = provider.testnet === true? browserAddressTest: browserAddress;
    this.privateUrl = `${ip}:7022/api/v1/transaction?chainName=eth`
    // this.minPrice = "18000000000"
}

/**
 * 创建交易体
 */
EthSdk.prototype.createTxInfo = async function ({ from, to, value, fee, data = '0x', nonce }) {
    if ( nonce == undefined ) {
        throw '请传入nonce'
    }
    // 验证地址是否有效
    this.isValidAddress(to);
    this.isValidAddress(from);
    var that = this;
    var gasPrice = await this.web3.eth.getGasPrice();
    var bigGasPrice = new Bignumber(gasPrice).decimalPlaces(0)
    var gas = new Bignumber(fee).div(bigGasPrice).decimalPlaces(0)
    // 获取nonce
    // var nonce = await this.web3.eth.getTransactionCount(from, 'pending');
    // 创建一个交易体
    var tx = new EthereumTx({
        from,
        nonce: '0x' + nonce.toString(16),
        gasPrice: `0x${bigGasPrice.toString(16)}`,
        gasLimit: `0x${Bignumber(gas).toString(16)}`,
        to,
        data,
        gas: `0x${Bignumber(gas).toString(16)}`,
        value: `0x${Bignumber(value).toString(16)}`
    })
    return tx;
}

EthSdk.prototype.isValidPrivate = function (privateKey) {
    if (!utils.isValidPrivate(utils.toBuffer(privateKey))) {
        throw new Error('无效的私钥')
    }
}

/**
 * @desc 发送交易
 * @param{string} privateKey
 * @param{string} recipientAddress
 * @param{string} amount
 * @param{string} fee
 * @param needValue 如果是代币合约的话　发送交易　是否需要发送value的值为amount
 * */

EthSdk.prototype.createTx = async function (privateKey, recipientAddress, amount, fee, contract, data, nonce, needValue = false) {

    var reg = /^0x/
    if(!reg.test(privateKey)) {
        privateKey = '0x' + privateKey;
    }

    if (typeof amount != 'string' || typeof fee != 'string') {
        throw 'amount 和 fee 必须是字符串';
    }

    var bigAmount = new Bignumber(amount), bigFee = new Bignumber(fee);


    if (!bigAmount.isInteger() || !bigFee.isInteger()) {
        throw 'amount 和 fee必须是字符串整型';
    }

    var paa = this.getPublicKeyAndAddress(privateKey);

    var tx;

    if (contract) {
        this.isValidAddress(contract)
        var token = new this.web3.eth.Contract(abi, contract);

        if (!data) {
            this.isValidAddress(recipientAddress)
            data = token.methods.transfer(recipientAddress, bigAmount.toString(10)).encodeABI();
        }

        tx = await this.createTxInfo({
            from: paa.address,
            to: contract,
            value: needValue ? amount : '0',
            fee: fee,
            data,
            nonce
        });
    } else {
        this.isValidAddress(recipientAddress)
        tx = await this.createTxInfo({
            from: paa.address,
            to: recipientAddress,
            value: amount,
            fee: fee,
            data,
            nonce
        });
    }
    tx.sign(utils.toBuffer(privateKey));
    var serialize = tx.serialize();
    var txHash = '0x' + tx.hash().toString('hex');
    var v = '0x' + tx.v.toString('hex');
    var s= '0x' + tx.s.toString('hex');
    var r = '0x' + tx.r.toString('hex');
    //返回交易
    return {
        txHash,
        codingTx: '0x' + serialize.toString('hex'),
        v,
        s,
        r,
    }
}

EthSdk.prototype.send = async function (txData) {
    return new Promise( (resolve, reject) => {
        this.web3.eth.sendSignedTransaction(txData.codingTx)
            .on('transactionHash', () => {
                resolve(txData.txHash)
            })
            .on('error', (err) => {
                reject(err)
            })
    })

}

//查询余额
EthSdk.prototype.getBalance = async function (address, contract) {
    this.isValidAddress(address);
    return await this.web3.eth.getBalance(address)
}

EthSdk.prototype.getErc20Balance = async function(contract,address) {
    this.isValidAddress(contract);
    this.isValidAddress(address);
    var token = new this.web3.eth.Contract(abi, contract)
    var balance = await token.methods.balanceOf(address).call();
    return balance.toString();
}
// 获取合约symbol
EthSdk.prototype.getErc20Symbol = async function(contract) {
    this.isValidAddress(contract);
    var token = new this.web3.eth.Contract(abi, contract)
    var symbol = await token.methods.symbol().call();
    return symbol;
}

// 获取合约内容
EthSdk.prototype.getErc20Decimal = async function(contract) {
    this.isValidAddress(contract);
    var token = new this.web3.eth.Contract(abi, contract)
    var decimal = await token.methods.decimals().call();
    decimal = decimal._hex? decimal._hex: decimal;
    return parseInt(decimal);
}

// 是否有效的以太坊地址
EthSdk.prototype.isValidAddress = function (address) {
    if (!utils.isValidAddress(address)) {
        throw new Error('无效的以太坊地址')
    }
}

// 验证地址是否合法
EthSdk.prototype.checkAddress = function (address) {
    if (!utils.isValidAddress(address)) {
        return false;
    }
    return true;
}

//查询交易
EthSdk.prototype.findTx = async function (txHash, multiple) {
    return new Promise(async (resolve, reject) => {
        var arr = await Promise.all([
            this.web3.eth.getTransactionReceipt(txHash),
            this.web3.eth.getTransaction(txHash),
        ]).catch(async err => {
            // 错误处理, 如果getTransaction可以，那么则代表getTransactionReceipt失败，
            // web3bug,合约太长报错，一定不是我们的交易, 返回空
            var tx = await this.web3.eth.getTransaction(txHash);
            if(!tx) {
                reject(`查询交易${txHash}失败： ${err} `)
            }
        })
        // arr为空，说明getTransactionReceipt失败
        if(!arr) {
            reject(`arr为空，说明getTransactionReceipt失败`)
        }
        // var x = await this.web3.eth.getTransaction(txHash);
        if (!arr.length || !arr[1]) {
            reject(`查询交易 ${txHash} getTransactionReceipt ${arr[0]} 和 getTransaction ${arr[1]}  `)
        }
        var receipt = arr[0];
        var txData = arr[1];
        // 如果没有返回空，可能特殊交易找不到的情况
        if(!receipt) {
            receipt = {
                status: false,
                gasUsed: 0
            }
            return resolve(this.getCommonTx(txData, receipt, null))
        }

        var ercDatas;

        if(txData.input) {
            ercDatas = this.isErc20Tx(txData, receipt);
        }

        if(!multiple) {
            ercData = ercDatas? ercDatas[0]: null;
            return resolve(this.getCommonTx(txData, receipt, ercData))
        }
        // 如果需要支持合约（一个交易多笔erc20转账）
        var txs = [];
        // 如果不是合约
        if(!ercDatas.length) {
            txs.push(this.getCommonTx(txData, receipt, null))
        } else {
            for(let i = 0; i < ercDatas.length; i++) {
                txs.push(this.getCommonTx(txData, receipt, ercDatas[i]))
            }
        }

        return resolve(txs)
    })
}

// 是否为erc20交易，不是返回undefined
EthSdk.prototype.isErc20Tx = function (txData, receipt) {
    // var logs = receipt.logs;
    // if (logs && logs.length === 1) {
    //     var log = logs[0];
    //     var topics = logs[0].topics;
    //     if (topics && topics.length == 3) {
    //         // 调用的方法是否为transfer
    //         if (topics[0] === TransferMethodSha) {
    //             var from = topics[1];
    //             from = `0x${from.substring(26)}`;
    //             var to = topics[2];
    //             to = `0x${to.substring(26)}`;
    //             return {
    //                 from,
    //                 to,
    //                 value: (new Bignumber(log.data)).toString(10),
    //             }
    //         }
    //     }
    // }
    // method == transfer
    if(!receipt.logs || !receipt.logs.length) {
        if(txData.input.slice(2,10) == "a9059cbb") {
            let to = "0x" + txData.input.slice(10,74);
            to = new Bignumber(to).toString(16);
            let value = "0x" + txData.input.slice(75, 139);
            value = new Bignumber(value).toString(10);
            return [{
                from: txData.from,
                to: "0x" + to,
                value,
                contract: receipt.to
            }]
        }
        return [];
    }

    var ercDatas = [];
    for (var i = 0; i < receipt.logs.length; i++) {
        var log = receipt.logs[i];
        var topics = receipt.logs[i].topics;
        if (topics && topics.length == 3) {
            // 调用的方法是否为transfer
            if (topics[0] === TransferMethodSha) {
                var from = topics[1];
                from = `0x${from.substring(26)}`;
                var to = topics[2];
                to = `0x${to.substring(26)}`;
                ercDatas.push({
                    from,
                    to,
                    value: (new Bignumber(log.data)).toString(10),
                    contract: log.address
                });
            }
        }
    }

    return ercDatas;
}

EthSdk.prototype.toLowCase = function(str) {
    if(str) {
        return str.toLocaleLowerCase()
    }
}
/**
 *
 * @param {object} txData //链上返回的数据对象
 * @return {object} //返回通用格式的对象
 */
EthSdk.prototype.getCommonTx = function (txData, receiptData, ercData) {
    // 交易状态
    var status = null;
    if (!txData.blockHash) {
        status = 'pending';
    } else if (receiptData.status) {
        status = 'success';
    } else {
        status = 'failed';
    }

    txData.from = this.toLowCase(txData.from)
    txData.to = this.toLowCase(txData.to)
    const innerData = (new Buffer(txData.input.slice(2), 'hex')).toString()
    var commonData = {
        status: status, //交易状态 success failed pendding
        blockHeight: txData.blockNumber,
        txHash: txData.hash,
        sender: txData.from,
        recipient: txData.to,
        amount: txData.value,
        fee: Bignumber(receiptData.gasUsed).times(txData.gasPrice).toString(10),
        data: innerData,
        input: txData.input,
        logs: receiptData.logs?receiptData.logs:[]
    };
    if (ercData) {
        // Erc20
        ercData.from = this.toLowCase(ercData.from)
        ercData.to = this.toLowCase(ercData.to)
        commonData = Object.assign({}, commonData, {
            isErc20: true,
            erc20Sender: ercData.from,
            erc20Recipient: ercData.to,
            amount: ercData.value,
            recipient: ercData.contract
        });
    } else {
        // 返回通用的交易格式
        commonData = Object.assign({}, commonData, {
            isErc20: false, // 判断是否为erc20的转账，如果为true, 则erc20Sender 和 erc20Recipient不会空
            erc20Sender: null,
            erc20Recipient: null,
        });
    }

    return commonData;
}

EthSdk.prototype.findTxByBlock = async function (numberOrHash) {
    // 存放通用交易
    var commontxs = [], that = this;
    return new Promise(async function (resolve, reject) {
        try {
            var block = await that.web3.eth.getBlock(numberOrHash)

            // 使用async库并发查询，每次查20条
            async.eachOfLimit(block.transactions, 20, async function (txid) {
                var txs = await that.findTx(txid, true);
                for(let i = 0; i < txs.length; i++) {
                    let tx = txs[i];
                    tx.timeStamp = block.timestamp;
                    commontxs.push(tx)
                }

            }, function (err) {
                if (err) {
                    reject(err)
                }
                return resolve(commontxs)
            });
        }catch(err) {
            reject(err)
        }
    });
    // return commontxs;
}

EthSdk.prototype.findBlockHeaderByBlock = async function (numberOrHash) {
        const that = this;
        return new Promise(async (resolve, reject)=>{
            try {
                const block = await that.web3.eth.getBlock(numberOrHash);
                resolve(block);
            }catch(err) {
                reject(err)
            }
        });
    }

EthSdk.prototype.getLastBlock = async function () {
    var data = await this.web3.eth.getBlock('latest')

    var block = {
        height: data.number,
        hash: data.hash,
        timestamp: data.timestamp
    }

    return block;
}

EthSdk.prototype.createKeypair = async function () {
    const key = new SimpleKeyring();
    const address = await key.addAccounts(1);

    const privateKey = await key.exportAccount(address[0]);
    const publicKey = await utils.privateToPublic(utils.keccak256(privateKey));

    keyPair = {
        publicKey: `0x${publicKey.toString('hex')}`,
        privateKey: `0x${privateKey.toString('hex')}`,
    }

    return keyPair
}

EthSdk.prototype.getPublicKeyAndAddress = function (privateKey) {

    checkPrivateKeyLength(privateKey);

    var reg = /^0x/
    if(!reg.test(privateKey)) {
        privateKey = '0x' + privateKey
    }
    this.isValidPrivate(privateKey);
    var publicKey = utils.privateToPublic(utils.toBuffer(privateKey)).toString('hex');
    publicKey = `0x${publicKey}`;
    var address = this.getAddress(publicKey);
    return {
        publicKey,
        address
    }
}

EthSdk.prototype.getAddress = function (publicKey) {
    if (!utils.isValidPublic(utils.toBuffer(publicKey))) {
        throw new Error('无效的公钥')
    }
    return `0x${utils.publicToAddress(publicKey).toString('hex')}`;
}

EthSdk.prototype.getNonce = async function (address) {
    var nonce = await this.web3.eth.getTransactionCount(address, 'pending')
    return nonce;
}

EthSdk.prototype.getAverageFee = async function () {
    var that = this;
    // var gas = await this.web3.eth.estimateGas({
    //     to: that.web3.eth.defaultAccount
    // })
    var gas = "21000";
    var gasPrice = await this.web3.eth.getGasPrice()
    // 平均手续费的1.2倍，兼容token的发送, gas也是平均的1.5倍
    var averageFee = new Bignumber(gas).times(gasPrice).decimalPlaces(0).toString(10);
    return averageFee;
}

EthSdk.prototype.getAverageFee = async function () {
    var that = this;
    // var gas = await this.web3.eth.estimateGas({
    //     to: that.web3.eth.defaultAccount
    // })
    var gas = "21000";
    var gasPrice = await this.web3.eth.getGasPrice()
    // 平均手续费的1.2倍，兼容token的发送, gas也是平均的1.5倍
    var averageFee = new Bignumber(gas).times(gasPrice).decimalPlaces(0).toString(10);
    return averageFee;
}

EthSdk.prototype.getGas = async function(sender, recipient, value, contract) {
    var token = new this.web3.eth.Contract(abi, contract);
    const data =  token.methods.transfer(recipient, value).encodeABI();
    let gas = await this.web3.eth.estimateGas({
        from: sender,
        to: contract,
        data,
    });
    return gas;
}
EthSdk.prototype.getTokenAverageFee = async function (sender, recipient, value, contract) {
    var gas = await this.getGas(sender, recipient, value, contract);
    var gasPrice = await this.web3.eth.getGasPrice()
    // 平均手续费的1.2倍，兼容token的发送, gas也是平均的1.5倍
    var averageFee = new Bignumber(gas).times(gasPrice).decimalPlaces(0).toString(10);
    return averageFee;
}

// FIXME:原本是同步方法， 但是改为适用于IMToken的时候，它为异步方法。尴尬
EthSdk.prototype.getPrivateKeyBySeed = function(seed) {
    // 旧生成方式
    // privateKey = sha256(seed);
    // return "0x" + privateKey;
    
    // imToken 生成方式
    const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(seed));
    const wallet = hdWallet.derivePath(PATH).getWallet();
    const privateKey = wallet.getPrivateKeyString();
    // console.log(privateKey, wallet.getAddressString(), wallet.getPublicKeyString())
    return privateKey;
}



EthSdk.prototype.getBlock = async function (numberOrHash) {

    var block = await this.web3.eth.getBlock(numberOrHash)
    return {
        hash: block.hash,
        height: block.number,
        timestamp: block.timestamp
    };
}

EthSdk.prototype.approve = async function (privateKey, spender, amount, fee, contract, nonce) {

    var token = new this.web3.eth.Contract(abi, contract);
    const data =  token.methods.approve(spender, amount).encodeABI();

    return await this.createTx(privateKey, spender, amount, fee, contract, data, nonce);
    // return txObj.txHash;

};

/**
 * erc20合约通用　查看币种代扣额度
 * @param tokenContract 代币合约
 * @param owner　代币拥有者
 * @param spender　代扣者
 * @returns {Promise<void>}
 */
EthSdk.prototype.allowance = async function (tokenContract, owner, spender) {

  var token = new this.web3.eth.Contract(abi, tokenContract);
  let balance = await  token.methods.allowance(owner, spender).call();
  balance = balance._hex? balance._hex: balance;
  balance = (new Bignumber(balance)).toString();
  return balance;
};

module.exports = EthSdk;
