var request = require('request');

function Transaction() {
}

Transaction.prototype.getTxsByAddress = async function (obj) {
  const {address, page, size, status, addressType, amountSort, time, day, includeErc20 = 1} = obj
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
  if(includeErc20) params += `&includeErc20=${includeErc20}`;

  var that = this;
  return new Promise((resolve, reject) => {
    request(`http://${this.privateUrl + params}`, function(err, response, body) {
      if (err) {
        reject(err);
      }
      // 查询出来的交易 与 代币交易的关系是否有问题
      txs = JSON.parse(body).data;

      resolve(txs);
    })

  })
};


Transaction.prototype.getErc20TxsByAddress = async function (obj) {

  const {contract, address, page, size, status, addressType, amountSort, time, day, includeErc20 = 1 } = obj
  let params = "";

  if(!contract || !address || !page || !size) {
    throw '请输入 contract address page size'
  }

  params = `&contract=${contract}&address=${address}&page=${page}&pageSize=${size}`

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

  if(includeErc20) params += `&includeErc20=${includeErc20}`;

  console.log(`http://${this.privateUrl + params}`);

  return new Promise((resolve, reject) => {
    request(`http://${this.privateUrl + params}`, function(err, response, body) {
      if (err) {
        reject(err);
      }
      // 查询出来的交易 与 代币交易的关系是否有问题
      let txs = JSON.parse(body).data;

      resolve(txs);
    })

  })
};

Transaction.prototype.getPendingTxsByAddress = async function (obj) {
  const {address, addressType, amountSort} = obj
  let params = "&status=pending";

  if(!address) {
    throw '请输入 address'
  }

  params += `&address=${address}`


  if(addressType) {
    params = params + `&addressType=${addressType}`
  }

  if(amountSort) {
    params = params + `&amountSort=${amountSort}`
  }

  return new Promise((resolve, reject) => {
    request(`http://${this.privateUrl + params}`, function(err, response, body) {
      if (err) {
        reject(err);
      }
      // 查询出来的交易 与 代币交易的关系是否有问题
      const txs = JSON.parse(body).data;

      resolve(txs);
    })

  })
}

Transaction.prototype.getPendingErc20TxsByAddress = async function (obj) {

  const {contract, address, addressType, amountSort} = obj
  let params = "&status=pending";

  if(!contract || !address) {
    throw '请输入 contract address'
  }

  params += `&contract=${contract}&address=${address}`


  if(addressType) {
    params = params + `&addressType=${addressType}`
  }

  if(amountSort) {
    params = params + `&amountSort=${amountSort}`
  }

  return new Promise((resolve, reject) => {
    request(`http://${this.privateUrl + params}`, function(err, response, body) {
      if (err) {
        reject(err);
      }
      // 查询出来的交易 与 代币交易的关系是否有问题
      let txs = JSON.parse(body).data;

      resolve(txs);
    })

  })
}

module.exports = Transaction;
