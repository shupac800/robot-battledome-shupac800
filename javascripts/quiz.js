"use strict";  // enable ES6

function rollDice(diceString) {
  let result = 0;  // initialize result
  let rollThisManyTimes = diceString.split("d")[0];
  let nSidedDie = diceString.split("d")[1];

  for (let i = 0; i < rollThisManyTimes; i++) {
    result += parseInt((Math.random() * nSidedDie) + 1);
  }
  return result;
}

function Player(playerNumber,robotName) {
  this.playerNumber = playerNumber;  // 1 or 2
  this.robotName = robotName;        // player's robot's name
  this.robot = null;                 // object containing player's robot
}

function Robot(name) {
  this.name = name;    // every robot has a name
  this.health = null;  // every robot has a number of health points
  this.weapon = null;  // every robot has one weapon
  this.mod = null;     // every robot has one mod
}

function Drone() {
  this.type = "drone";
  this.healthDice = "5d6";
  this.health = rollDice(this.healthDice);
  this.evadePct = 0.70;  // base chance to evade an attack
  this.protectPct = 0;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
}
Drone.prototype = new Robot("drone");

function Bipedal() {
  this.type = "bipedal";
  this.healthDice = "5d8";
  this.health = rollDice(this.healthDice);
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.15;  // percentage by which damage received is reduced
  this.damageIncPct = 0.10;   // percentage by which damage inflicted is increased
}
Bipedal.prototype = new Robot("bipedal");

function ATV() {
  this.type = "atv";
  this.healthDice = "5d12";
  this.health = rollDice(this.healthDice);
  this.evadePct = 0.30;  // base chance to evade an attack
  this.protectPct = 0.10;  // percentage by which damage received is reduced
  this.damageIncPct = 0.25;   // percentage by which damage inflicted is increased
}
ATV.prototype = new Robot("atv");

function roboMod(name,protection,damage,evasion) {
  this.name = name;
  this.protectionEnhance = protection;
  this.damageEnhance = damage;
  this.evasionEnhance = evasion;
}

let P1 = new Player(1,"Viper");
P1.robot = new Drone();
P1.robot.weapon = new weapon("radialSaw");
console.log(`Player ${P1.playerNumber} is represented by ${P1.robotName}, a ${P1.robot.type} robot with ${P1.robot.health} health points.`);
console.log(`${P1.robotName} is strapped with a nasty ${P1.robot.weapon.name}.`);
P1.robot.mod = new mod("EMShield");
console.log(`${P1.robotName} has been outfitted with ${P1.robot.mod.article}${P1.robot.mod.name}.`);

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

