const {Blockchain, Tx} = require("./blockchain");


let ecoCoin = new Blockchain();

let aryanchegini = ecoCoin.createParticipator('aryanchegini');

ecoCoin.createGenesisBlock(aryanchegini);
aryanchegini.stakeCoins(20);

let p2 = ecoCoin.createParticipator('p2');
let p3 = ecoCoin.createParticipator('p3');
let p4 = ecoCoin.createParticipator('p4');
let p5 = ecoCoin.createParticipator('p5');


//a helper function to make transactions quicker
function makeTx(from, to, amount) {
    let tx = new Tx(from.publicKey, to.publicKey, amount);
    tx.signTx(from.key);
    ecoCoin.addTransaction(tx);
}
console.log("\nBlock 1:");
makeTx(aryanchegini, p2, 100);
makeTx(aryanchegini, p3, 100);
makeTx(aryanchegini, p4, 100);
makeTx(aryanchegini, p5, 100);
console.log('Staked coins:')
console.log(ecoCoin.stakedCoins);

p2.stakeCoins(20);
p3.stakeCoins(25);
p4.stakeCoins(30);
p5.stakeCoins(20);

console.log("\nBlock 2:");
makeTx(aryanchegini, p2, 10);
makeTx(aryanchegini, p3, 10);
makeTx(aryanchegini, p4, 10);
makeTx(aryanchegini, p5, 10);
console.log('Staked coins:')
console.log(ecoCoin.stakedCoins);

p2.stakeCoins(10);
p3.stakeCoins(10);
p4.stakeCoins(10);
p5.stakeCoins(10);

console.log("\nBlock 3:");
makeTx(aryanchegini, p2, 10);
makeTx(aryanchegini, p3, 10);
makeTx(aryanchegini, p4, 10);
makeTx(aryanchegini, p5, 10);
console.log('Staked coins:')
console.log(ecoCoin.stakedCoins);

p2.stakeCoins(10);
p3.stakeCoins(10);
p4.stakeCoins(10);
p5.stakeCoins(10);

console.log("\nBlock 4:");
makeTx(aryanchegini, p2, 10);
makeTx(aryanchegini, p3, 10);
makeTx(aryanchegini, p4, 10);
makeTx(aryanchegini, p5, 10);
console.log('Staked coins:')
console.log(ecoCoin.stakedCoins);

p2.stakeCoins(10);
p3.stakeCoins(10);
p4.stakeCoins(10);
p5.stakeCoins(10);

console.log("\nBlock 5:");
makeTx(aryanchegini, p2, 10);
makeTx(aryanchegini, p3, 10);
makeTx(aryanchegini, p4, 10);
makeTx(aryanchegini, p5, 10);
console.log('Staked coins:')
console.log(ecoCoin.stakedCoins);

ecoCoin.printParticipantsBalance();

// console.log(JSON.stringify(ecoCoin, null, 4));


