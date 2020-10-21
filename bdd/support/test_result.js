const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

class TestResult {
    constructor() {
        this.result = {};
    }

    startFeature(feature) {
        //console.log("ddddddddddddddd");
        logger.info("Feature: ", feature.title);
        // feature.description.forEach(function(element) {
        //     logger.info("         ", element);
        // });

        this.result[feature.title] = { scenarios: {} };
    }

    addFeatureError(feature, errorMsg, error) {
        logger.info("Feature error: " + feature.title + " details: ", error);
        this.result[feature.title]["error"] = errorMsg + "(" + error + ")";
        //this.result[feature.title]["errorMsg"] = errorMsg + "(" + error + ")";
    }

    skipScenario(feature, scenario) {
        this.result[feature.title]["scenarios"][scenario.title]["skip"] = true;
        this.result[feature.title]["scenarios"][scenario.title]["steps"] = {};
    }

    startScenario(feature, scenario) {
        logger.info("          Scenario: ", scenario.title);
        // scenario.description.forEach(function(element) {
        //     logger.info("                   ", element);
        // });
        this.result[feature.title]["scenarios"][scenario.title] = { steps: {} };
    }

    finishStepWithError(feature, scenario, step, error) {
        logger.info("                ✘", step, " >> error: ", error);
        this.result[feature.title]["scenarios"][scenario.title]["steps"][
            step
        ] = error;
    }

    finishStep(feature, scenario, step) {
        // logger.info("                ✔", step);
        this.result[feature.title]["scenarios"][scenario.title]["steps"][
            step
        ] = null;
    }

    color(color, str) {
        var r;
        if (color == "red") r = "\u001b[31m" + str + "\u001b[0m";
        else if (color == "green") r = "\u001b[32m" + str + "\u001b[0m";
        else if (color == "yellow") r = "\u001b[33m" + str + "\u001b[0m";
        else if (color == "blue") r = "\u001b[34m" + str + "\u001b[0m";
        else r = str;
        return r;
    }

    printResults() {
        let color = this.color;

        console.log("TEST RESULTS:");

        //console.log(this.result);
        //console.log(this.result[keyFeature]);
        var scenarioCountTotal = 0;
        var scenarioCountPassed = 0;
        var scenarioCountSkipped = 0;
        // var stepsCountTotal = 0;
        // var stepsCountPassed = 0;
        Object.entries(this.result).forEach(([keyFeature, valueFeature]) => {
            console.log(color("yellow", keyFeature));
            //console.log("feature ", valueFeature);
            if (valueFeature.error)
                console.log(color("red", "  ✘ " + valueFeature.error));
            else {
                Object.entries(valueFeature.scenarios).forEach(
                    ([keyScenario, valueScenario]) => {
                        scenarioCountTotal++;

                        if (valueScenario.skip) {
                            console.log(
                                color("blue", "   # (skipped) " + keyScenario)
                            );
                            scenarioCountSkipped++;
                        } else console.log("   " + keyScenario);

                        var scenarioResult =
                            Object.keys(valueScenario.steps).length != 0;
                        Object.entries(valueScenario.steps).forEach(
                            ([keyStep, valueStep]) => {
                                //stepsCountTotal++;
                                if (valueStep) {
                                    scenarioResult = false;
                                    console.log(
                                        color("red", "       ✘ " + keyStep)
                                    );
                                    console.log(
                                        color("red", "         " + valueStep)
                                    );
                                } else {
                                    //stepsCountPassed++;
                                    console.log(
                                        color("green", "       ✔ ") + keyStep
                                    );
                                }
                            }
                        );
                        if (scenarioResult) {
                            //console.log("scenarioResult is ", scenarioResult);
                            scenarioCountPassed++;
                        }
                    }
                );
            }
        });

        console.log();

        function isPassed() {
            return (
                scenarioCountTotal == scenarioCountPassed + scenarioCountSkipped
            );
        }

        function resultColor(str) {
            if (isPassed()) {
                return color("green", str);
            } else {
                return color("red", str);
            }
        }

        var scenariosLog =
            scenarioCountTotal +
            " scenarios (" +
            resultColor(scenarioCountPassed + " passed");

        if (scenarioCountSkipped) {
            scenariosLog =
                scenariosLog +
                color("blue", ", " + scenarioCountSkipped + " skipped");
        }

        scenariosLog = scenariosLog + ")";
        console.log(scenariosLog);

        return isPassed();
        // console.log(
        //     stepsCountTotal +
        //         " steps (" +
        //         resultColor(stepsCountPassed + " passed") +
        //         ")"
        // );

        //console.log("\u001b[32m       ✔ \u001b[0m" + keyStep);
        // 9 scenarios (9 passed)
        // 109 steps (109 passed)
    }
}

module.exports = new TestResult();
