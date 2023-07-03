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

module.exports.Participator = Participator;
