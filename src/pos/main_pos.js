const { PoSBlockchain } = require("./pos_blockchain");

let ecoCoin = new PoSBlockchain();

let p1 = ecoCoin.participators[0];
ecoCoin.stakeCoins(p1, 100);

let p2 = ecoCoin.createParticipator("p2");
let p3 = ecoCoin.createParticipator("p3");
let p4 = ecoCoin.createParticipator("p4");
let p5 = ecoCoin.createParticipator("p5");

ecoCoin.makeTx(p1, p2, 100);
ecoCoin.makeTx(p1, p3, 100);
ecoCoin.makeTx(p1, p4, 100);
ecoCoin.makeTx(p1, p5, 100);
console.log("Staked coins:");
console.log(ecoCoin.stakedCoins);

ecoCoin.stakeCoins(p2, 20);
ecoCoin.stakeCoins(p3, 25);
ecoCoin.stakeCoins(p4, 30);
ecoCoin.stakeCoins(p5, 20);

ecoCoin.makeTx(p1, p2, 10);
ecoCoin.makeTx(p1, p3, 10);
ecoCoin.makeTx(p1, p4, 10);
ecoCoin.makeTx(p1, p5, 10);
console.log("Staked coins:");
console.log(ecoCoin.stakedCoins);

ecoCoin.stakeCoins(p2, 10);
ecoCoin.stakeCoins(p3, 10);
ecoCoin.stakeCoins(p4, 10);
ecoCoin.stakeCoins(p5, 10);

ecoCoin.makeTx(p1, p2, 10);
ecoCoin.makeTx(p1, p3, 10);
ecoCoin.makeTx(p1, p4, 10);
ecoCoin.makeTx(p1, p5, 10);
console.log("Staked coins:");
console.log(ecoCoin.stakedCoins);

ecoCoin.stakeCoins(p2, 10);
ecoCoin.stakeCoins(p3, 10);
ecoCoin.stakeCoins(p4, 10);
ecoCoin.stakeCoins(p5, 10);

ecoCoin.makeTx(p1, p2, 10);
ecoCoin.makeTx(p1, p3, 10);
ecoCoin.makeTx(p1, p4, 10);
ecoCoin.makeTx(p1, p5, 10);
console.log("Staked coins:");
console.log(ecoCoin.stakedCoins);

ecoCoin.stakeCoins(p2, 10);
ecoCoin.stakeCoins(p3, 10);
ecoCoin.stakeCoins(p4, 10);
ecoCoin.stakeCoins(p5, 10);

ecoCoin.makeTx(p1, p2, 10);
ecoCoin.makeTx(p1, p3, 10);
ecoCoin.makeTx(p1, p4, 10);
ecoCoin.makeTx(p1, p5, 10);
console.log("Staked coins:");
console.log(ecoCoin.stakedCoins);

ecoCoin.printParticipantsBalance();

console.log(ecoCoin);

console.log(ecoCoin.getParticipatorsStakedCoins(p1));
console.log(ecoCoin.getParticipatorsStakedCoins(p2));
console.log(ecoCoin.getParticipatorsStakedCoins(p3));
console.log(ecoCoin.getParticipatorsStakedCoins(p4));
console.log(ecoCoin.getParticipatorsStakedCoins(p5));
