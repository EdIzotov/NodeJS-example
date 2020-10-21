"use strict";

const idntOnboarditng = require("./support/admin_identity_onboarding.js");
const world = require("./support/world.js");
const bankHelper = require("./support/helpers/bank_helper");
const child_process = require("child_process");
var Yadda = require("yadda");
var async = require("async");
var parser = new Yadda.parsers.FeatureFileParser();

process.on("exit", code => {
    if (code > 0) {
        console.error(
            testResult.color("red", "Tests are finished with failures!!!")
        );
    }

    if (bankHelper.banks.length) {
        const bankIds = bankHelper.banks.map(bank => bank.id);
        const beforeExitProcess = child_process.spawnSync("node", [
            "./support/beforeExit.js",
            JSON.stringify(bankIds),
            world.getCbsClientSessionToken()
        ]);

        console.error(beforeExitProcess.stderr.toString("utf8"));
    }
});

var testResult = require("./support/test_result");

function runFile(file, done) {
    var feature = parser.parse(file);

    testResult.startFeature(feature);

    const BREAK_SCENARIO = "breakScenario";
    async.eachLimit(
        feature.scenarios,
        2,
        function(scenario, nextScenario) {
            let yadda;
            try {
                const definition_path = file
                    .replace("features/", "./step_definitions/")
                    .replace(".feature", "");

                delete require.cache[require.resolve(definition_path)];
                let library = require(definition_path);

                yadda = Yadda.createInstance(library);
                //throw "some errror";
            } catch (error) {
                testResult.addFeatureError(
                    feature,
                    "Can't parse library",
                    error
                );
                done(error);
                return;
            }

            testResult.startScenario(feature, scenario);
            async.eachSeries(
                scenario.steps,
                function(step, nextStep) {
                    try {
                        let flow = { scenario: "" };
                        yadda.run(step, { flow: flow }, (error, res) => {
                            //console.log("try to break", res);
                            if (error) {
                                testResult.finishStepWithError(
                                    feature,
                                    scenario,
                                    step,
                                    error
                                );
                                nextStep(error);
                            } else {
                                if (flow.scenario == "skip") {
                                    //console.log("try to break", flow);
                                    testResult.skipScenario(feature, scenario);
                                    nextStep(BREAK_SCENARIO);
                                    return;
                                }
                                testResult.finishStep(feature, scenario, step);
                                nextStep();
                            }
                        });
                    } catch (error) {
                        testResult.finishStepWithError(
                            feature,
                            scenario,
                            step,
                            error
                        );
                        nextStep(error);
                    }
                },
                error => {
                    if (error == BREAK_SCENARIO) {
                        nextScenario();
                    } else {
                        nextScenario();
                    }
                }
            );
        },
        done
    );
}

function featureFiles() {
//  var features = ["<PATH TO FEATURE>"];
    var features = new Yadda.FeatureFileSearch("features").list();

    let api_gateway_features_path = "features/gateway";
    let api_gateway_enabled =
        process.env.api_gateway_host != "" &&
        typeof process.env.api_gateway_host != "undefined";

    console.log("API Gateway enabled:", api_gateway_enabled);
    if (!api_gateway_enabled) {
        console.log("Ignore:", api_gateway_features_path);
        features = features.filter(
            path => !path.includes(api_gateway_features_path)
        );
    }
    return features;
}

function runAllFiles(files) {
    return new Promise((resolve, reject) => {
        async.eachLimit(
            files,
            1,
            (file, next) => {
                runFile(file, next);
            },
            error => {
                if (error) reject(error);
                else resolve(true);
            }
        );
    });
}

function beforeAll() {
    return Promise.all([
        new Promise(resolve => {
            world.getEnv(resolve);
        }),
        new Promise(resolve => {
            const Onboarding = new idntOnboarditng();
            Onboarding.envPrepare(resolve);
        })
    ]);
}

process.exitCode = 1;
beforeAll()
    .then(_ => {
        return runAllFiles(featureFiles());
    })
    .catch(error => {
        console.log("Error: ", error);
        return false;
    })
    .then(isPassed => {
        if (testResult.printResults() && isPassed) {
            process.exitCode = 0;
        }
    });
