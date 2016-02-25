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
  this.healthDice = "5d6";
  this.health = null;
}
Drone.prototype = new Robot("Drone");

function Glasswing() {
  this.evadePct = 0.60;  // base chance to evade an attack
  this.protectPct = 0;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
}
Glasswing.prototype = new Drone("Glasswing");

function Dragonfly() {
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
}
Dragonfly.prototype = new Drone("Dragonfly");

////////

function Bipedal(subtype) {
  this.subtype = subtype;
  this.healthDice = "5d8";
  this.health = null;
}
Bipedal.prototype = new Robot("Bipedal");

function T1000() {
  this.evadePct = 0.40;  // base chance to evade an attack
  this.protectPct = 0.15;  // percentage by which damage received is reduced
  this.damageIncPct = 0.20;   // percentage by which damage inflicted is increased
}
T1000.prototype = new Bipedal("T-1000");

function Replicant() {
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.25;  // percentage by which damage received is reduced
  this.damageIncPct = 0.10;   // percentage by which damage inflicted is increased
}
Replicant.prototype = new Bipedal("Replicant");

////////

function ATV(subtype) {
  this.subtype = subtype;
  this.healthDice = "5d10";
  this.health = null;
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

////////

// add event listeners

$(".p1type").click(function() {
  $("#p1weapon").removeClass("hidden");
});
$("#p1weapon").click(function() {
  $("#p1mod").removeClass("hidden");
});
$(".p2type").click(function() {
  $("#p2weapon").removeClass("hidden");
});
$("#p2weapon").click(function() {
  $("#p2mod").removeClass("hidden");
});
$("#battle").click(function(event) {
  event.preventDefault();
  console.clear();
  // put HTML form data into "form" object
  let form = {
    name:   [],
    type:   [],
    weapon: [],
    mod:    []
  };
  form.name[1]   = $("#p1robotName").val();
  form.type[1]   = $("input[name=p1type]:checked").val();
  form.weapon[1] = $("input[name=p1weapon]:checked").val();
  form.mod[1]    = $("input[name=p1mod]:checked").val();
  form.name[2]   = $("#p2robotName").val();
  form.type[2]   = $("input[name=p2type]:checked").val();
  form.weapon[2] = $("input[name=p2weapon]:checked").val();
  form.mod[2]    = $("input[name=p2mod]:checked").val();
  let P1 = playerInit(1,form);
  let P2 = playerInit(2,form);
  doBattle(P1,P2);
  // validate input
  // if ((form.p1type) && (form.p1weapon) && (form.p1mod) && (form.p2type) && (form.p2weapon) && (form.p2mod)) {
  //   doBattle(form);
  // } else {
  //   alert("All player info must be selected");
  // }
});

function playerInit(playerNum,playerData) {
  var playerObj = new Player(playerNum,playerData.name[playerNum]);
  switch (playerData.type[playerNum]) {
    case "Glasswing":
      playerObj.robot = new Glasswing();
      break;
    case "Dragonfly":
      playerObj.robot = new Dragonfly();
      break;
    case "T-1000":
      playerObj.robot = new T1000();
      break;
    case "Replicant":
      playerObj.robot = new Replicant();
      break;
    case "Stomper":
      playerObj.robot = new Stomper();
      break;
    case "Juggernaut":
      playerObj.robot = new Juggernaut();
      break;
    default:
      break;
  }
  playerObj.robot.weapon = new weapon(playerData.weapon[playerNum]);
  playerObj.robot.mod = new mod(playerData.mod[playerNum]);
  playerObj.robot.health = rollDice(playerObj.robot.healthDice) * 10;
  console.log(`Player ${playerObj.playerNumber} is represented by ${playerObj.robotName}, a ${playerObj.robot.subtype} ${playerObj.robot.type} robot with ${playerObj.robot.health} health points.`);
  console.log(`${playerObj.robotName} is armed with a nasty ${playerObj.robot.weapon.name}.`);
  console.log(`${playerObj.robotName} has been outfitted with ${playerObj.robot.mod.article}${playerObj.robot.mod.name}.`);
  return playerObj;
}

function doBattle(P1,P2) {
  let coinFlip = parseInt(Math.random() * 2);  // 0 or 1
  var playerAttacking = coinFlip + 1;
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
      this.article = "a ";
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

