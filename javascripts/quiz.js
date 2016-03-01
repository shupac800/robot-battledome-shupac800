"use strict";  // enable ES6

function rollDice(diceString) {
  let result = 0;  // initialize result
  let rollThisManyTimes = diceString.split("d")[0];
  let nSidedDie = diceString.split("d")[1];

  for (let i = 0; i < rollThisManyTimes; i++) {
    result += Math.floor(Math.random() * nSidedDie + 1);
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

//////////////////

function Drone(subtype) {
  this.subtype = subtype;    // every Drone has a subtype
  this.healthDice = "50d6";   // all Drones compute health points by this formula
}
Drone.prototype = new Robot("Drone");

function Glasswing() {
  this.evadePct = 0.70;  // base chance to evade an attack
  this.protectPct = 0.10;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001111", "0001000", "0000000"];
}
Glasswing.prototype = new Drone("Glasswing");

function Dragonfly() {
  this.evadePct = 0.60;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001110", "0001100", "0000000"];
}
Dragonfly.prototype = new Drone("Dragonfly");

///////////////////

function Bipedal(subtype) {
  this.subtype = subtype;
  this.healthDice = "50d8";
}
Bipedal.prototype = new Robot("Bipedal");

function T1000() {
  this.evadePct = 0.40;  // base chance to evade an attack
  this.protectPct = 0.15;  // percentage by which damage received is reduced
  this.damageIncPct = 0.20;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001000", "0001100", "0001100"];
}
T1000.prototype = new Bipedal("T-1000");

function Replicant() {
  this.evadePct = 0.50;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0.05;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001100", "0001100", "0001000"];
}
Replicant.prototype = new Bipedal("Replicant");

///////////////////

function ATV(subtype) {
  this.subtype = subtype;
  this.healthDice = "50d10";
}
ATV.prototype = new Robot("ATV");

function Stomper() {
  this.evadePct = 0.25;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0.25;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001100", "0001000", "0001110"];
}
Stomper.prototype = new ATV("Stomper");

function Juggernaut() {
  this.evadePct = 0.20;  // base chance to evade an attack
  this.protectPct = 0.20;  // percentage by which damage received is reduced
  this.damageIncPct = 0.30;   // percentage by which damage inflicted is increased
  this.ledPattern = ["0001000", "0001000", "0001111"];
}
Juggernaut.prototype = new ATV("Juggernaut");

//////////////////

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
  playerObj.robot.weapon = new Weapon(playerData.weapon[playerNum]);
  playerObj.robot.mod = new Mod(playerData.mod[playerNum]);
  playerObj.robot.health = rollDice(playerObj.robot.healthDice);
  return playerObj;
}

function coinFlip() {
  return Math.floor(Math.random() * 2);  // 0 or 1
}

function doBattle(P1,P2) {
  let playerAttacking = coinFlip() + 1;
  console.log(`Player ${playerAttacking} wins the coin flip and will go first.`);
  report.push(`Player ${playerAttacking} wins the coin flip and will go first.`);

  let doAnotherRound = true;
  while (doAnotherRound) {
    if (playerAttacking == 1) {
      doAnotherRound = attack(P1,P2);
      playerAttacking = 2;
    } else {
      doAnotherRound = attack(P2,P1);
      playerAttacking = 1;
    }
  }
  return 0; // exit_code = 0 means battle completed successfully; used by Jasmine
}

function attack(attacker,defender) {
  console.log(`${attacker.robotName} is attacking ${defender.robotName}.`);
  report.push(`${attacker.robotName} is attacking ${defender.robotName}.`);
  // was attack evaded?
  if (rollDice("1d100") <= 100 * defender.robot.evadePct * (1 + defender.robot.mod.evasionPctAdj) ) {
    console.log(`${defender.robotName} evades the attack!  Zero damage.`);
    report.push(`${defender.robotName} evades the attack!  Zero damage.`);
    return true;  // doAnotherRound = true
  }
  // what damage done by weapon?
  let damage = rollDice(attacker.robot.weapon.damageDice);
  // to what extent is damage enhanced by robot's innate strength?
  // to what extent is damage affected by robot's mod?
  let damageAdj = Math.round((attacker.robot.damageIncPct + attacker.robot.mod.damagePctAdj) * damage);
  damage += damageAdj;
  console.log(`${attacker.robotName} strikes and does ${damage} points of damage!`);
  report.push(`${attacker.robotName} strikes and does ${damage} points of damage!`);
  // make adjustment to defender's health
  adjustHealth(defender,damage);
  // check for robot death
  let doAnotherRound = true;
  if (defender.robot.health <= 0) {
    console.log(`${attacker.robotName} the ${attacker.robot.subtype} ${attacker.robot.type} has vanquished ${defender.robotName} the ${defender.robot.subtype} ${defender.robot.type}!`);
    report.push(`${attacker.robotName} the ${attacker.robot.subtype} ${attacker.robot.type} has vanquished ${defender.robotName} the ${defender.robot.subtype} ${defender.robot.type}!`);
    doAnotherRound = false;  // don't continue battle; it's over!
  }
  return doAnotherRound;
}

function adjustHealth(defender,damageSuffered) {
  // damage is mitigated by robot's innate protection factor,
  // as adjusted by defender's weapon's protection penalty
  // and any effects of defender's mod
  let mitigation = Math.round((defender.robot.protectPct + defender.robot.weapon.protectionPenalty + defender.robot.mod.protectionPctAdj ) * damageSuffered);
  console.log(`But ${defender.robotName}'s protection mitigates the damage by ${mitigation} points.`);
  report.push(`But ${defender.robotName}'s protection mitigates the damage by ${mitigation} points.`);
  // adjust health points
  let oldHealth = defender.robot.health;
  defender.robot.health -= damageSuffered - mitigation;
  console.log(`${defender.robotName} goes from ${oldHealth} health to ${defender.robot.health} health.`);
  report.push(`${defender.robotName} goes from ${oldHealth} health to ${defender.robot.health} health.`);
}

function Mod(modName) {
  switch (modName) {
    case "EMShield":
      this.article = "an ";
      this.name = "electromagnetic shield";
      this.evasionPctAdj = 0;
      this.protectionPctAdj = 0.30;
      this.damagePctAdj = -0.15;
      this.ledPattern = ["0000000","0001111","0010000"];
      break;
    case "uraniumArmor":
      this.article = "";
      this.name = "uranium armor";
      this.evasionPctAdj = -0.15;
      this.protectionPctAdj = 0.30;
      this.damagePctAdj = 0;
      this.ledPattern = ["0010000","0001110","0000000"];
      break;
    case "jetpack":
      this.article = "a ";
      this.name = "jet pack";
      this.evasionPctAdj = 0.30;
      this.protectionPctAdj = -0.15;
      this.damagePctAdj = -0.10;
      this.ledPattern = ["0001111","0010000","0010000"];
      break;
    case "activeCamo":
      this.article = "";
      this.name = "active camouflage";
      this.evasionPctAdj = 0.20;
      this.protectionPctAdj = 0;
      this.damagePctAdj = 0;
      this.ledPattern = ["0001100","0000000","0000000"];
      break;
    case "gravityBender":
      this.article = "a ";
      this.name = "gravity bender";
      this.evasionPctAdj = -0.20;
      this.protectionPctAdj = -0.10;
      this.damagePctAdj = 0.25;
      this.ledPattern = ["0110000","0010000","0001110"];
      break;
    case "roboSteroids":
      this.article = "";
      this.name = "roboSteroids";
      this.evasionPctAdj = 0;
      this.protectionPctAdj = -0.10;
      this.damagePctAdj = 0.15;
      this.ledPattern = ["0000000","0010000","0001000"];
      break;
    default:
      break;
  }
}

function Weapon(weaponName) {
  switch (weaponName) {
    case "laserDrill":
      this.name = "laser drill";
      this.evasionPenalty = 0;
      this.protectionPenalty = 0;
      this.damageDice = "12d5";
      this.ledPattern = ["0000000", "0000000", "0001000"];
      break;
    case "radialSaw":
      this.name = "radial saw";
      this.evasionPenalty = -0.10;
      this.protectionPenalty = -0.05;
      this.damageDice = "10d7";
      this.ledPattern = ["0010000", "0010000", "0001100"];
      break;
    case "warHammer":
      this.name = "war hammer";
      this.evasionPenalty = -0.15;
      this.protectionPenalty = -0.10;
      this.damageDice = "20d4";
      this.ledPattern = ["0010000", "0010000", "0001100"];
      break;
    case "harpoon":
      this.name = "harpoon";
      this.evasionPenalty = -0.20;
      this.protectionPenalty = -0.15;
      this.damageDice = "15d6";
      this.ledPattern = ["0110000", "0110000", "0001110"];
      break;
    case "flamethrower":
      this.name = "flamethrower";
      this.evasionPenalty = -0.25;
      this.protectionPenalty = -0.25;
      this.damageDice = "30d3";
      this.ledPattern = ["0110000", "0110000", "0001110"];
      break;
    case "bazooka":
      this.name = "bazooka";
      this.evasionPenalty = -0.30;
      this.protectionPenalty = -0.30;
      this.damageDice = "20d5";
      this.ledPattern = ["1110000", "1110000", "0001111"];
      break;
    default:
      break;
  }
}

function turnOffAllRedLEDs(playerNumber,col) {
  var startRow = ((playerNumber - 1) * 6) + 1;  // i.e. 1 for P1, 7 for P2
  for (let i = startRow; i < startRow + 6; i++) {
    let classString = `.col-${col}.row-${i}`;
    $(classString).attr("src","img/unlitredLED.png");
  }
}

function doYGLEDs(playerNumber,col,ledPattern) {
  var startRow = ((playerNumber - 1) * 3) + 1;  // i.e. 1 for P1, 4 for P2
  var startCol = ((col - 1) * 7) + 1;  // i.e. 1 for col1, 8 for col2, 15 for col3
  var ledPatternIndex = 0;  // which of the three ledPatterns are we parsing?
  for (let i = startRow; i < startRow + 3; i++) {
    var stringIndex = 0;
    for (let j = startCol; j < startCol + 3; j++) {  // LEDs 1-3 are yellow
      let classString = `.YGCol-${j}.YGRow-${i}`;
      if (ledPattern[ledPatternIndex].charAt(stringIndex) == "1") {
        $(classString).attr("src","img/lityellowLED.png");
      } else {
        $(classString).attr("src","img/unlityellowLED.png");
      }
      stringIndex++;
    }
    for (let j = startCol + 3; j < startCol + 7; j++) {  // LEDs 4-7 are green
      let classString = `.YGCol-${j}.YGRow-${i}`;
      if (ledPattern[ledPatternIndex].charAt(stringIndex) == "1") {
        $(classString).attr("src","img/litgreenLED.png");
      } else {
        $(classString).attr("src","img/unlitgreenLED.png");
      }
      stringIndex++;
    }
    ledPatternIndex++;
  }
}

function scheduleOutput() {
  // for each line in report array, compute the time it's going to take to display each line.
  // for each line, construct a setTimeout function where the delay is cumulative, based on time it
  // takes to execute each of the previous lines, plus delays.
  // objects in array "ttyObject" will hold data needed by "teletype" function 
  const charDelay = 10;  // delay in ms after each character
  const delayBetweenLines = 600;  // delay between lines, in ms
  const initialDelay = 600;  // ms before outputting first line
  ttyObject[0] = {outputAfterMs: initialDelay};  // initialize first array element; first output happens after initial delay 
  var timeElapsed = initialDelay;
  var i;
  for (i = 0; i < report.length; i++) {
    // add new k:v pairs to ttyObject[i] object
    ttyObject[i].index = i;
    ttyObject[i].chars = report[i].length;
    ttyObject[i].text  = report[i];
    ttyObject[i].time  = ttyObject[i].chars * charDelay;  // time it takes to output this text
    timeElapsed += ttyObject[i].time + delayBetweenLines;  // add delay period to total time elapsed
    ttyObject[i + 1] = {outputAfterMs: timeElapsed};  // initialize next array element; next line will output after this many ms

    // use IIFE to schedule future events with values bound to present context
    (function(i,charDelay) {
      setTimeout(function() {
        teletype(ttyObject[i].text,charDelay);
      }, ttyObject[i].outputAfterMs);
    })(i,charDelay);

    // (function(i){
    //   setTimeout(function() {
    //     console.log(`element no. ${i} executed at time ${ttyObject[i].outputAfterMs}`);
    //   }, ttyObject[i].outputAfterMs);
    // })(i);

  }  // end for loop
  // after all lines of text are scheduled to be output,
  // the last task to schedule is turning off the "battle" button.
  // this one doesn't have to be an IIFE because there are no variables to bind
  setTimeout(
    function(){
      $("#battleButton").attr("src","img/redButton-unlit.png");  // turn off "battle" button
      $("#battleButton").prop("inProgress",false);  // reset inProgress property
    }, ttyObject[i].outputAfterMs
  );
}

function teletype(str,charDelay) {
  var i = 0;
  var s = $(".type-text").html() + "<p>";
  var intervalID = setInterval(function(){
    s += str.charAt(i);
    $(".type-text").html(s);
    $("#outputTextGoesHere").scrollTop($(".type-text").height());  // scroll to max of .type-text height
    i++;
    if (i == str.length) {
      $(".type-text").html(s + "</p>");
      clearInterval(intervalID);
      return;
    }
  },charDelay);
}

///////////////////////////
//  MAIN
///////////////////////////

var report = [];       // global array that holds each line of text output
var ttyObject = [{}];  // global array used by "teletype" text output function

// data entered goes into global "form" object
var form = {
  name:   [],
  type:   [],
  weapon: [],
  mod:    []
};

// to conform with instructions, all buttons except p1type should start off as hidden
$(".p1weapon").attr("style","display:none");
$(".p1mod").attr("style","display:none");
$(".p2type").attr("style","display:none");
$(".p2weapon").attr("style","display:none");
$(".p2mod").attr("style","display:none");

// add P1 event listeners
$("#p1RobotName").click(function() {
  $("#p1RobotName").val("");
});
$(".p1type").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(1,1);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.type[1] = event.target.id.slice(3);  // take off the "p1-" prefix
  // turn off/on the yellow and green LEDs in this class
  var dummySubtypeObj = {};
  switch ("dummySubtypeObj",form.type[1]) {
    case "Glasswing":
      dummySubtypeObj = new Glasswing();
      break;
    case "Dragonfly":
      dummySubtypeObj = new Dragonfly();
      break;
    case "T-1000":
      dummySubtypeObj = new T1000();
      break;
    case "Replicant":
      dummySubtypeObj = new Replicant();
      break;
    case "Stomper":
      dummySubtypeObj = new Stomper();
      break;
    case "Juggernaut":
      dummySubtypeObj = new Juggernaut();
      break;
    default:
      break;
  }
  doYGLEDs(1,1,dummySubtypeObj.ledPattern);
  $(".p1weapon").attr("style","display:inline");
});

$(".p1weapon").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(1,2);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.weapon[1] = event.target.id.slice(3);  // take off the "p1-" prefix
  // turn off/on the yellow and green LEDs in this class
  let dummyWeaponObj = new Weapon(form.weapon[1]);
  doYGLEDs(1,2,dummyWeaponObj.ledPattern);
  $(".p1mod").attr("style","display:inline");
});

$(".p1mod").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(1,3);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.mod[1] = event.target.id.slice(3);  // take off the "p1-" prefix
  // turn off/on the yellow and green LEDs in this class
  let dummyModObj = new Mod(form.mod[1]);
  doYGLEDs(1,3,dummyModObj.ledPattern);
  $(".p2type").attr("style","display:inline");
});

// add P2 event listeners
$("#p2RobotName").click(function() {
  $("#p2RobotName").val("");
});
$(".p2type").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(2,1);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.type[2] = event.target.id.slice(3);  // take off the "p2-" prefix
  // turn off/on the yellow and green LEDs in this class
  var dummySubtypeObj = {};
  switch ("dummySubtypeObj",form.type[2]) {
    case "Glasswing":
      dummySubtypeObj = new Glasswing();
      break;
    case "Dragonfly":
      dummySubtypeObj = new Dragonfly();
      break;
    case "T-1000":
      dummySubtypeObj = new T1000();
      break;
    case "Replicant":
      dummySubtypeObj = new Replicant();
      break;
    case "Stomper":
      dummySubtypeObj = new Stomper();
      break;
    case "Juggernaut":
      dummySubtypeObj = new Juggernaut();
      break;
    default:
      break;
  }
  doYGLEDs(2,1,dummySubtypeObj.ledPattern);
  $(".p2weapon").attr("style","display:inline");
});

$(".p2weapon").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(2,2);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.weapon[2] = event.target.id.slice(3);  // take off the "p1-" prefix
  // turn off/on the yellow and green LEDs in this class
  let dummyWeaponObj = new Weapon(form.weapon[2]);
  doYGLEDs(2,2,dummyWeaponObj.ledPattern);
  $(".p2mod").attr("style","display:inline");
});

$(".p2mod").click(function() {
  // turn off all red LEDs in this class
  turnOffAllRedLEDs(2,3);
  // turn on LED of button that was clicked
  $(event.target).attr("src","img/litredLED.png");
  form.mod[2] = event.target.id.slice(3);  // take off the "p1-" prefix
  // turn off/on the yellow and green LEDs in this class
  let dummyModObj = new Mod(form.mod[2]);
  doYGLEDs(2,3,dummyModObj.ledPattern);
});

$("#battleButton").click(function() {
  // QUICK FILL -- FOR TESTING ONLY
  // form.type[1] = "Glasswing";
  // form.type[2] = "Juggernaut";
  // form.weapon[1] = "radialSaw";
  // form.weapon[2] = "laserDrill";
  // form.mod[1] = "gravityBender";
  // form.mod[2] = "activeCamo";

  // validate inputs
  if ( (!form.type[1])   || (!form.type[2])   ||
       (!form.weapon[1]) || (!form.weapon[2]) ||
       (!form.mod[1])    || (!form.mod[2]) ) {
    alert("Data is missing");
    return;
  }

  if ($("#battleButton").prop("inProgress") === true) {
    alert("Battle already in progress.");
    return;
  } else {
    $("#battleButton").prop("inProgress",true);
  }

  // every time a new battle starts:
  console.clear();
  report = [];  // clear report array
  $(".type-text").html("");  // clear text display area
  $("#battleButton").attr("src","img/redButton-lit.png");  // illuminate "battle" button

  // build players' robots
  let P1 = playerInit(1,form);
  let P2 = playerInit(2,form);
  P1.robotName = $("#p1RobotName").val();
  P2.robotName = $("#p2RobotName").val();

  console.log("Welcome to Robot Battledome.");
  report.push("Welcome to Robot Battledome.");

  console.log(`Player 1 is represented by ${P1.robotName}, a ${P1.robot.subtype} ${P1.robot.type} robot with ${P1.robot.health} health points.`);
  report.push(`Player 1 is represented by ${P1.robotName}, a ${P1.robot.subtype} ${P1.robot.type} robot with ${P1.robot.health} health points.`);

  console.log(`${P1.robotName} is armed with a nasty ${P1.robot.weapon.name}.`);
  report.push(`${P1.robotName} is armed with a nasty ${P1.robot.weapon.name}.`);

  console.log(`${P1.robotName} has been outfitted with ${P1.robot.mod.article}${P1.robot.mod.name}.`);
  report.push(`${P1.robotName} has been outfitted with ${P1.robot.mod.article}${P1.robot.mod.name}.`);

  console.log(`Player 2 is represented by ${P2.robotName}, a ${P2.robot.subtype} ${P2.robot.type} robot with ${P2.robot.health} health points.`);
  report.push(`Player 2 is represented by ${P2.robotName}, a ${P2.robot.subtype} ${P2.robot.type} robot with ${P2.robot.health} health points.`);
  
  console.log(`${P2.robotName} is armed with a nasty ${P2.robot.weapon.name}.`);
  report.push(`${P2.robotName} is armed with a nasty ${P2.robot.weapon.name}.`);
  
  console.log(`${P2.robotName} has been outfitted with ${P2.robot.mod.article}${P2.robot.mod.name}.`);
  report.push(`${P2.robotName} has been outfitted with ${P2.robot.mod.article}${P2.robot.mod.name}.`);

  console.log("Let them do battle!");
  report.push("Let them do battle!");

  doBattle(P1,P2);
  scheduleOutput();
});