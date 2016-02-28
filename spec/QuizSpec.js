//test suite should "validate core logic"

"use strict";

var P1;  // global

describe("The Robot Battledome application", function() {
  it("should have a base Robot function", function() {
    expect(Robot).toBeDefined();
  });
  it("should be able to generate a dice roll", function() {
    expect(rollDice).toBeDefined();
    expect(rollDice("3d1")).toBe(3);
  });
  it("should have at least three robot types", function() {
    let type1 = new Drone();
    let type2 = new Bipedal();
    let type3 = new ATV();
    expect(type1).toBeDefined();
    expect(type2).toBeDefined();
    expect(type3).toBeDefined();
  });
  it("should have a Player function that accepts a player number and robot name", function() {
    expect(Player).toBeDefined();
    P1 = new Player(1,"BigBird");
    expect(P1.playerNumber).toBe(1);
    expect(P1.robotName).toBe("BigBird");
  });
  it("should have a function to assign a robot to a Player based on HTML form input", function() {
    expect(playerInit).toBeDefined();
    // playerData is object containing info from HTML form
    let playerData = { name:   ["","BigBird"],
                       type:   ["","Juggernaut"],
                       weapon: ["","radialSaw"],
                       mod:    ["","gravityBender"] };
    P1 = playerInit(1,playerData);  // create P1 object using info in playerData
    expect(P1.robot.type).toBe("ATV");
    expect(P1.robot.subtype).toBe("Juggernaut");
    expect(P1.robot.weapon.name).toBe("radial saw");
    expect(P1.robot.mod.name).toBe("gravity bender");
  });
  it("should be able to assign a random health value to a robot",function() {
    expect(P1.robot.healthDice).toBeDefined();
    P1.robot.healthDice = "3d1";  // roll 1-sided die 3 times
    P1.robot.health = rollDice(P1.robot.healthDice);
    expect(P1.robot.health).toBe(3);
  });
  it("should have a function to flip a coin to see who goes first", function() {
    expect(coinFlip).toBeDefined();
    let headsOrTails = coinFlip();
    expect((headsOrTails == 0) || (headsOrTails == 1)).toBeTruthy();
  });
  it("should have a function to deduct damage from the defender's health", function() {
    expect(adjustHealth).toBeDefined();
    // set all damage mitigation factors to zero
    P1.robot.protectPct = 0;
    P1.robot.weapon.protectionPenalty = 0;
    P1.robot.mod.protectionPctAdj = 0;
    // see if adjustHealth works
    P1.robot.health = 300; // assign dummy health value
    adjustHealth(P1,10);  // do 10 points of damage to P1
    expect(P1.robot.health).toBe(290);
  });
  it("should have a function to have an attacker attack a defender", function() {
    let doAnotherRound = attack(P1,P1); // for testing, let attacker = defender
    expect((doAnotherRound == 0) || (doAnotherRound == 1)).toBeTruthy();
  });
  it("should have a function to send two robots into battle and return an exit code indicating the battle completed", function() {
    expect(doBattle).toBeDefined();
    let exit_code = doBattle(P1,P1);
    expect(exit_code).toBe(0);  // exit_code = 0 means battle finished OK
  });
})
