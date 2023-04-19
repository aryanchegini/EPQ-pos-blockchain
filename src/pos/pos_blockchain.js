const {Participator, Tx} = require("../index");
const SHA256 = require("crypto-js/sha256");


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

class PoSBlockchain {
  constructor() {
    this.participators = [];
    this.chain = [this.createGenesisBlock(this.createParticipator("p1"))];
    this.pendingTransactions = [];
    this.stakedCoins = {};
    this.validationReward = 100;
  }

  createGenesisBlock(participant) {
    let coinbase = new Tx(null, participant.publicKey, 1000);
    let genesisBlock = new Block(0, [coinbase], "0", participant.publicKey);
    return genesisBlock;
  }

  createParticipator(name) {
    name = new Participator();
    this.participators.push(name);
    return name;
  }

  getParticipatorsStakedCoins(participator) {
    for (let address in this.stakedCoins) {
      if (participator.publicKey === address) {
        return this.stakedCoins[address];
      }
    }
    return 0;
  }

  printParticipantsBalance() {
    for (let participant of this.participators) {
      console.log(
        participant.publicKey +
          " : " +
          this.getBalanceOfAddress(participant.publicKey)
      );
    }
  }

  get latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  validatePendingTransactions(validatorAddress) {
    const rewardTx = new Tx(
      null,
      validatorAddress,
      this.validationReward
    );
    this.pendingTransactions.push(rewardTx);

    let block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.latestBlock.hash,
      validatorAddress
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

    console.log("\nThe validator's address is " + validatorAddress + "\n");
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

  makeTx(from, to, amount) {
    let tx = new Tx(from.publicKey, to.publicKey, amount);
    tx.signTx(from.key);
    this.addTransaction(tx);
  }

  stakeCoins(participator, amount) {
    if (amount > this.getBalanceOfAddress(participator.publicKey)) {
      throw new Error("You can not stake more coins that you have");
    }

    if (amount === 0) {
      throw new Error("You can not stake 0 coins");
    }

    if (!(participator.publicKey in this.stakedCoins)) {
      this.stakedCoins[participator.publicKey] = amount;
    } else if (participator.publicKey in this.stakedCoins) {
      this.stakedCoins[participator.publicKey] += amount;
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

module.exports.PoSBlockchain = PoSBlockchain;
