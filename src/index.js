const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Participator {
  constructor() {
    this.key = ec.genKeyPair();
  }

  get publicKey() {
    return this.key.getPublic("hex");
  }

  get privateKey() {
    return this.key.getPrivate("hex");
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

module.exports.Tx = Tx;
module.exports.Participator = Participator;