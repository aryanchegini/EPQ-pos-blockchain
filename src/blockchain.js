const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Participator {
  constructor(blockchain) {
    this.key = ec.genKeyPair();
    //private variable
    this._blockchain = blockchain;
  }

  get publicKey() {
    return this.key.getPublic("hex");
  }

  get privateKey() {
    return this.key.getPrivate("hex");
  }

  get balance() {
    return this._blockchain.getBalanceOfAddress(this.publicKey);
  }

  stakeCoins(amount) {
    if (amount > this.balance) {
      throw new Error("You can not stake more coins that you have");
    }

    if (amount === 0) {
      throw new Error("You can not stake 0 coins");
    }

    if (!(this.publicKey in this._blockchain.stakedCoins)) {
      this._blockchain.stakedCoins[this.publicKey] = amount;
    } else if (this.publicKey in this._blockchain.stakedCoins) {
      this._blockchain.stakedCoins[this.publicKey] += amount;
    }
  }
}

class Tx {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  hashTx() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTx(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You can not sign transactions for other wallets");
    }

    const hashTx = this.hashTx();
    const sig = signingKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.fromAddress === null) return true;

    if (!this.fromAddress || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.hashTx(), this.signature);
  }
}

class Block {
  constructor(index, transactions, previousHash = "", validator) {
    this.index = index;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.timestamp = new Date();
    this.validator = validator;
    this.hash = this.hashBlock();
  }

  hashBlock() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce +
        this.validator
    ).toString();
  }

  validTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.participators = [];
    this.stakedCoins = {};
    this.validationReward = 100;
  }

  createParticipator(name) {
    name = new Participator(this);
    this.participators.push(name.publicKey);
    return name;
  }

  get participants() {
    return this.participators;
  }

  printParticipantsBalance() {
    for (let address of this.participators) {
      console.log(address + " : " + this.getBalanceOfAddress(address));
    }
  }

  createGenesisBlock(participant) {
    let coinbase = new Tx(null, participant.publicKey, 1000);
    let genesisBlock = new Block(0, [coinbase], "0", participant.publicKey);
    this.chain.push(genesisBlock);
  }

  get latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  validatePendingTransactions(validatorRewardAddress) {
    const rewardTx = new Tx(
      null,
      validatorRewardAddress,
      this.validationReward
    );
    this.pendingTransactions.push(rewardTx);

    let block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.latestBlock.hash,
      validatorRewardAddress
    );

    if (!block.validTransactions()) {
      for (let trans of block.transactions) {
        if (!trans.isValid()) {
          block.transactions.splice(block.transactions.indexOf(trans), 1);
        }
      }
    }
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  selectValidator() {
    if (this.pendingTransactions.length === 0) {
      throw new Error("There are no pending trasactions");
    }

    let pool = [];
    for (let staker in this.stakedCoins) {
      for (let i = 0; i < this.stakedCoins[staker]; i++) {
        pool.push(staker);
      }
    }

    //Fisher-Yates shuffle
    let currentIndex = pool.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [pool[currentIndex], pool[randomIndex]] = [
        pool[randomIndex],
        pool[currentIndex],
      ];
    }

    let i = Math.floor(Math.random() * (pool.length - 1));

    let validatorAddress = pool[i];

    console.log("\nThe validator's address is" + validatorAddress + "\n");
    this.validatePendingTransactions(validatorAddress);
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to addresses");
    }

    if (
      transaction.amount > this.getBalanceOfAddress(transaction.fromAddress)
    ) {
      throw new Error(
        "Transaction amount must be less than or equal to balance"
      );
    }

    if (!transaction.isValid()) {
      throw new Error("Can not add invalid transaction to chain");
    }

    this.pendingTransactions.push(transaction);
    if (this.pendingTransactions.length === 4) {
      console.time("this.selectValidator");
      this.selectValidator();
      console.timeEnd("this.selectValidator");
    }
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    for (let staker in this.stakedCoins) {
      if (address === staker) {
        balance -= this.stakedCoins[staker];
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.validTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.hashBlock()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hashBlock()) {
        return false;
      }
    }

    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Tx = Tx;
module.exports.Participator = Participator;
