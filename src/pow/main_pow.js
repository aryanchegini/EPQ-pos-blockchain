const {PoWBlockchain} = require("./pow_blockchain");

let darkCoin = new PoWBlockchain();

let p1 = darkCoin.participators[0];

let p2 = darkCoin.createParticipator('p2');
let p3 = darkCoin.createParticipator('p3');
let p4 = darkCoin.createParticipator('p4');
let p5 = darkCoin.createParticipator('p5');


darkCoin.makeTx(p1, p2, 100);
darkCoin.makeTx(p1, p3, 100);
darkCoin.makeTx(p1, p4, 100);
darkCoin.makeTx(p1, p5, 100);

darkCoin.mineBlock(p1);

console.log(darkCoin.getBalanceOfAddress(p1.publicKey));
console.log(darkCoin.getBalanceOfAddress(p2.publicKey));
console.log(darkCoin.getBalanceOfAddress(p3.publicKey));
console.log(darkCoin.getBalanceOfAddress(p4.publicKey));
console.log(darkCoin.getBalanceOfAddress(p5.publicKey));
