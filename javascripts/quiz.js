"use strict";  // enable ES6

function rollDice(diceString) {
  let result = 0;  // initialize result
  let rollThisManyTimes = diceString.split("d")[0];
  let nSidedDie = diceString.split("d")[1];

  for (let i = 0; i < rollThisManyTimes; i++) {
    result += parseInt(Math.random() * nSidedDie + 1);
  }
  return result;
}

function Player(playerNumber,robotName) {
  this.playerNumber = playerNumber;  // 1 or 2
  this.robotName = robotName;        // player's robot's name
  this.robot = null;                 // object containing player's robot
}

function Robot(type) {
  this.type = type;    // every robot has a type (Drone, Bipedal, or ATV)
  this.health = null;  // every robot has a number of health points
  this.weapon = null;  // every robot has one weapon
  this.mod = null;     // every robot has one mod
}

function Drone(subtype) {
  this.subtype = subtype;    // every Drone has a subtype
  this.health = rollDice("5d6") * 10;
}
Drone.prototype = new Robot("Drone");

function Whizzer() {
  this.evadePct = 0.70;  // base chance to evade an attack
  this.protectPct = 0;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
}
Whizzer.prototype = new Drone("Whizzer");

function Dragonfly() {
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
}
Dragonfly.prototype = new Drone("Dragonfly");

function Bipedal() {
  this.health = rollDice("5d8") * 10;
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.15;  // percentage by which damage received is reduced
  this.damageIncPct = 0.10;   // percentage by which damage inflicted is increased
}
Bipedal.prototype = new Robot("Bipedal");

function ATV(subtype) {
  this.subtype = subtype;
  this.health = rollDice("5d12") * 10;
}
ATV.prototype = new Robot("ATV");

function Stomper() {
  this.evadePct = 0.30;  // base chance to evade an attack
  this.protectPct = 0.30;  // percentage by which damage received is reduced
  this.damageIncPct = 0.25;   // percentage by which damage inflicted is increased
}
Stomper.prototype = new ATV("Stomper");

function Juggernaut() {
  this.evadePct = 0.20;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0.30;   // percentage by which damage inflicted is increased
}
Juggernaut.prototype = new ATV("Juggernaut");

let P1 = new Player(1,"Tinkerbell");
P1.robot = new Whizzer();
P1.robot.weapon = new weapon("radialSaw");
console.log(`Player ${P1.playerNumber} is represented by ${P1.robotName}, a ${P1.robot.subtype} ${P1.robot.type} robot with ${P1.robot.health} health points.`);
console.log(`${P1.robotName} is strapped with a nasty ${P1.robot.weapon.name}.`);
P1.robot.mod = new mod("activeCamo");
console.log(`${P1.robotName} has been outfitted with ${P1.robot.mod.article}${P1.robot.mod.name}.`);

let P2 = new Player(2,"Behemoth");
P2.robot = new Stomper();
P2.robot.weapon = new weapon("warHammer");
console.log(`Player ${P2.playerNumber} is represented by ${P2.robotName}, a ${P2.robot.subtype} ${P2.robot.type} robot with ${P2.robot.health} health points.`);
console.log(`${P2.robotName} is strapped with a nasty ${P2.robot.weapon.name}.`);
P2.robot.mod = new mod("jetpack");
console.log(`${P2.robotName} has been outfitted with ${P2.robot.mod.article}${P2.robot.mod.name}.`);

console.log("Let them do battle!");

let coinFlip = parseInt(Math.random() * 2);  // 0 or 1
let playerAttacking = coinFlip + 1;
console.log(`Player ${playerAttacking} will go first.`);

var doAnotherRound = true;  // have to use var here, not let
while (doAnotherRound) {
  if (playerAttacking == 1) {
    doAnotherRound = attack(P1,P2);
    playerAttacking = 2;
  } else {
    doAnotherRound = attack(P2,P1);
    playerAttacking = 1;
  }
}

function attack(attacker,defender) {
  console.log(`${attacker.robotName} is attacking ${defender.robotName}.`);
  // was attack evaded?
  if (rollDice("1d100") <= 100 * (defender.robot.evadePct * (1 + defender.robot.mod.evasionPctAdj) ) ) {
    console.log(`${defender.robotName} evaded the attack!  Zero damage.`);
    return true;  // doAnotherRound = true
  }
  // what damage done by weapon?
  let damage = rollDice(attacker.robot.weapon.damageDice) * 10;
  // to what extent is damage enhanced by robot's innate strength?
  damage += parseInt(damage * attacker.robot.damageIncPct);  // always positive or zero
  // to what extent is damage affected by robot's mod?
  damage += parseInt(damage * attacker.robot.mod.damagePctAdj);  // can be negative
  console.log(`${attacker.robotName} strikes and does ${damage} points of damage!`);
  // make adjustment to defender's health
  adjustHealth(defender,damage);
  // check for robot death
  if (defender.robot.health <= 0) {
    console.log(`${attacker.robotName} has vanquished ${defender.robotName}!`);
    var doAnotherRound = false;  // don't continue battle (have to use var, not let)
  } else {
    var doAnotherRound = true;  // continue battle
  }
  return doAnotherRound;
}

function adjustHealth(defender,damageSuffered) {
  // damage is mitigated by robot's innate protection factor,
  // as adjusted by attacker's weapon penalty
  // and any effects of defender's mod
  let mitigation = parseInt(defender.robot.protectPct * damageSuffered);
      /// insert code for protection by mod
  console.log(`But ${defender.robotName}'s protection mitigates the damage by ${mitigation} points.`);
  // adjust health points
  console.log(`${defender.robotName} goes from ${defender.robot.health} health`);
  defender.robot.health -= damageSuffered - mitigation;
  console.log(`to ${defender.robot.health} health.`);
}

function mod(modName) {
  switch (modName) {
    case "EMShield":
      this.article = "an ";
      this.name = "electromagnetic shield";
      this.evasionPctAdj = 0;
      this.protectionPctAdj = 0.30;
      this.damagePctAdj = -0.10;
      break;
    case "uraniumArmor":
      this.article = "";
      this.name = "uranium armor";
      this.evasionPctAdj = -0.10;
      this.protectionPctAdj = 0.30;
      this.damagePctAdj = 0;
      break;
    case "jetpack":
      this.article = "a ";
      this.name = "jet pack";
      this.evasionPctAdj = 0.30;
      this.protectionPctAdj = -0.15;
      this.damagePctAdj = -0.10;
      break;
    case "activeCamo":
      this.article = "";
      this.name = "active camouflage";
      this.evasionPctAdj = 0.20;
      this.protectionPctAdj = 0;
      this.damagePctAdj = 0;
      break;
    case "gravityBender":
      this.article = "a";
      this.name = "gravity bender";
      this.evasionPctAdj = -0.20;
      this.protectionPctAdj = -0.10;
      this.damagePctAdj = 0.25;
      break;
    case "roboRoids":
      this.article = "";
      this.name = "roboRoids";
      this.evasionPctAdj = 0;
      this.protectionPctAdj = -0.10;
      this.damagePctAdj = 0.15;
      break;
    default:
      break;
  }
}

function weapon(weaponName) {
  switch (weaponName) {
    case "laserDrill":
      this.name = "laser drill";
      this.damageDice = "1d6";
      this.evasionPenalty = 0;
      this.protectionPenalty = 0;
    case "radialSaw":
      this.name = "radial saw";
      this.damageDice = "1d8";
      this.evasionPenalty = -0.10;
      this.protectionPenalty = -0.10;
      break;
    case "warHammer":
      this.name = "war hammer";
      this.damageDice = "2d4";
      this.evasionPenalty = -0.15;
      this.protectionPenalty = -0.10;
      break;
    case "harpoon":
      this.name = "harpoon";
      this.damageDice = "2d6";
      this.evasionPenalty = -0.20;
      this.protectionPenalty = -0.15;
      break;
    case "flamethrower":
      this.name = "flamethrower";
      this.damageDice = "1d10";
      this.evasionPenalty = -0.25;
      this.protectionPenalty = -0.15;
      break;
    case "bazooka":
      this.name = "bazooka";
      this.damageDice = "4d4";
      this.evasionPenalty = -0.30;
      this.protectionPenalty = -0.20;
      break;
    default:
      break;
  }
}

