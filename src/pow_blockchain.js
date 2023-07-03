const { Participator } = require("./participator");
const { Tx } = require("./transaction");
const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, transactions, previousHash = "", miner) {
    this.index = index;
    this.timestamp = new Date();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.miner = miner;
    this.hash = this.hashBlock();
  }

  hashBlock() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce +
        JSON.stringify(this.miner)
    ).toString();
  }

  mine(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.hashBlock();
    }
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

class PoWBlockchain {
  constructor() {
    this.participators = [];
    this.chain = [this.createGenesisBlock(this.createParticipator("p1"))];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 4;
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

  latestBlock() {
    return this.chain[this.chain.length - 1];
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

    return balance;
  }
  
  makeTx(from, to, amount) {
    let tx = new Tx(from.publicKey, to.publicKey, amount);
    tx.signTx(from.key);
    this.addTransaction(tx);
  }

  mineBlock(miner) {
    if (!this.pendingTransactions.length < 4) {
      const rewardTx = new Tx(null, miner.publicKey, this.miningReward);
      this.pendingTransactions.push(rewardTx);

      let block = new Block(
        this.chain.length,
        this.pendingTransactions,
        this.latestBlock.hash,
        miner.publicKey
      );

      if (!block.validTransactions()) {
        for (let trans of block.transactions) {
          if (!trans.isValid()) {
            block.transactions.splice(block.transactions.indexOf(trans), 1);
          }
        }
      }

      block.mine(this.difficulty);
      this.chain.push(block);
      console.log(
        "Block mined and added to blockchain succesfully. Miners address: " +
          miner.publicKey
      );
      this.pendingTransactions = [];
    } else {
      throw new Error(
        "There are not enough pending transactions for a new block to be mined"
      );
    }
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

module.exports.PoWBlockchain = PoWBlockchain;
