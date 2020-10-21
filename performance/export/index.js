const excel = require('excel4node');
const async = require('async');
const minMaxSummValue = require(__dirname + '/../helpers/minMaxSummValue');
const exampleJSON = require(__dirname + '/example');
const environment = require('node-env-file')(__dirname + '/../../.env').NODE_ENV;

function createXLSX(json, fileName, testType) {
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Sheet 1');
    var style = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: ''
    });
    
    let startRow = 5;
    let operationCol = 1;
    let workersCol = 2;
    if (testType === 'trx') {
        var concurrencySAPCol = 3;
        var concurrencyCBSCol = 4;
        var warmUpTransactionsCol = 5;
        var identitiesCol = 6;
        var accountsCol = 7;
        var transactionsCol = 8;
        var turnOnCbsNorthApiMockModeCol = 9;
        var keepAliveCol = 10;
        var timeTakenForTransactionsCol = 11;
        var transactionsCompletedCol = 12;
        var timePerRequestCol = 13;
        var transactionsRPSCol = 14;
        var transactionsErrorsCol = 15;
        var publicKeyRegisteringErrorsCol = 16;
        var checkingBalanceErrorsCol = 17;
        var incorrectBalanceCol = 18;
        var cbsErrorsCol = 19;
        var sapVersionCol = 20;
        var vBridgeVersionCol = 21;
        var ahgVersionCol = 22;
        var coreVersionCol = 23;
        var redBoxVersionCol = 24;
        var cbsBackendVersionCol = 25;
    } else {
        var concurrencyCol = 3;
        var sapConnectionsInPoolCol = 4;
        var requestsPerWorkerCol = 5;
        var requestsCol = 6;
        var timePerRequestCol = 7;
        var requestsPerSecondCol = 8;
        var failedRequestsCol = 9;
        var failedPercCol = 10;
        var cbsMockModeCol = 11;
        var sapVersionCol = 12;
        var vBridgeVersionCol = 13;
        var ahgVersionCol = 14;
        var coreVersionCol = 15;
        var redBoxVersionCol = 16;
        var cbsBackendVersionCol = 17;
    }

    let date = new Date();
    let dateExcel = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    let timeExcel = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    worksheet.cell(1,1).string(dateExcel).style(style).style({font: {size: 14}});
    worksheet.cell(1,2).string(timeExcel).style(style).style({font: {size: 14}});
    worksheet.cell(2,1).string(testType.toUpperCase()).style({font: {size: 14}});
    worksheet.cell(3,1).string(environment.toUpperCase() + ' environment').style(style).style({font: {size: 14}});

    worksheet.cell(startRow,operationCol).string('Operation').style(style).style({font: {bold: true}});
    worksheet.cell(startRow,workersCol).string('Workers').style(style).style({font: {bold: true}});

    if (testType === 'trx') {
        worksheet.cell(startRow,concurrencySAPCol).string('Concurrency SAP').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,concurrencyCBSCol).string('Concurrency CBS').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,warmUpTransactionsCol).string('Warm Up Transactions').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,identitiesCol).string('Identities').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,accountsCol).string('Accounts').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,transactionsCol).string('Transactions').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,turnOnCbsNorthApiMockModeCol).string('Turn On CBS North API Mock Mode').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,keepAliveCol).string('Keep Alive').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,timeTakenForTransactionsCol).string('Time Taken For Transactions').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,transactionsCompletedCol).string('Transactions Completed').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,timePerRequestCol).string('Time Per Request').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,transactionsRPSCol).string('Transactions RPS').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,transactionsErrorsCol).string('Transactions Errors').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,publicKeyRegisteringErrorsCol).string('Public Key Registering Errors').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,checkingBalanceErrorsCol).string('Checking Balance Errors').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,incorrectBalanceCol).string('Incorrect Balance').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,cbsErrorsCol).string('CBS Errors').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,sapVersionCol).string('SAP version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,vBridgeVersionCol).string('vBridge version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,ahgVersionCol).string('AHG version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,coreVersionCol).string('Core version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,redBoxVersionCol).string('RedBox version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,cbsBackendVersionCol).string('CBS backend version').style(style).style({font: {bold: true}});
    } else {
        worksheet.cell(startRow,concurrencyCol).string('Concurrency').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,sapConnectionsInPoolCol).string('Number of SAP connections in pool').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,requestsPerWorkerCol).string('Requests per worker').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,requestsCol).string('Total requests').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,timePerRequestCol).string('Time per request').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,requestsPerSecondCol).string('Requests per second').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,failedRequestsCol).string('Failed requests').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,failedPercCol).string('Failed %').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,cbsMockModeCol).string('CBS mock mode').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,sapVersionCol).string('SAP version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,vBridgeVersionCol).string('vBridge version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,ahgVersionCol).string('AHG version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,coreVersionCol).string('Core version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,redBoxVersionCol).string('RedBox version').style(style).style({font: {bold: true}});
        worksheet.cell(startRow,cbsBackendVersionCol).string('CBS backend version').style(style).style({font: {bold: true}});
    }


    let testNumber = 1;
    console.log("Creating XLSX file to export ...")
    async.eachLimit(json, 1, function(result, callback) {
        console.log("  Writing results of Test # " + testNumber + " ...");
        worksheet.cell(startRow + testNumber,operationCol).string(result.test.type).style(style);
        worksheet.cell(startRow + testNumber,workersCol).number(result.test.workers).style(style);

        if (testType === 'trx') {
            worksheet.cell(startRow + testNumber,concurrencySAPCol).number(result.test.concurrencySAP).style(style);
            worksheet.cell(startRow + testNumber,concurrencyCBSCol).number(result.test.concurrencyCBS).style(style);
            worksheet.cell(startRow + testNumber,warmUpTransactionsCol).number(result.test.warm_up_transactions).style(style);
            worksheet.cell(startRow + testNumber,identitiesCol).number(result.test.identities).style(style);
            worksheet.cell(startRow + testNumber,accountsCol).number(result.test.accounts).style(style);
            worksheet.cell(startRow + testNumber,transactionsCol).number(result.test.transactions).style(style);
            worksheet.cell(startRow + testNumber,turnOnCbsNorthApiMockModeCol).number(result.test.turn_on_cbs_north_api_mock_mode).style(style);
            worksheet.cell(startRow + testNumber,keepAliveCol).number(result.test.keep_alive).style(style);

            let timeTakenForTransactions = minMaxSummValue.maximal(result.result, 'TimeTakenForTransactions');
            worksheet.cell(startRow + testNumber,timeTakenForTransactionsCol).number(timeTakenForTransactions).style(style);

            let transactionsCompleted = minMaxSummValue.summ(result.result, 'TransactionsCompleted');
            worksheet.cell(startRow + testNumber,transactionsCompletedCol).number(transactionsCompleted).style(style);
            
            let timePerRequest = minMaxSummValue.maximal(result.result, 'timePerRequest');
            worksheet.cell(startRow + testNumber,timePerRequestCol).number(timePerRequest).style(style);

            let transactionsRPS = minMaxSummValue.summ(result.result, 'TransactionsRPS');
            worksheet.cell(startRow + testNumber,transactionsRPSCol).number(transactionsRPS).style(style);

            let transactionsErrors = minMaxSummValue.summ(result.result, 'TransactionsErrors');
            worksheet.cell(startRow + testNumber,transactionsErrorsCol).number(transactionsErrors).style({font: {color: '#FF0000'}});

            let publicKeyRegisteringErrors = minMaxSummValue.summ(result.result, 'PublicKeyRegisteringErrors');
            worksheet.cell(startRow + testNumber,publicKeyRegisteringErrorsCol).number(publicKeyRegisteringErrors).style({font: {color: '#FF0000'}});

            let checkingBalanceErrors = minMaxSummValue.summ(result.result, 'CheckingBalanceErrors');
            worksheet.cell(startRow + testNumber,checkingBalanceErrorsCol).number(checkingBalanceErrors).style({font: {color: '#FF0000'}});

            let incorrectBalance = minMaxSummValue.summ(result.result, 'IncorrectBalance');
            worksheet.cell(startRow + testNumber,incorrectBalanceCol).number(incorrectBalance).style({font: {color: '#FF0000'}});

            let cbsErrors = minMaxSummValue.summ(result.result, 'CbsErrors');
            worksheet.cell(startRow + testNumber,cbsErrorsCol).number(cbsErrors).style({font: {color: '#FF0000'}});

            testNumber = ++testNumber;

            callback();
        } else {
            worksheet.cell(startRow + testNumber,concurrencyCol).number(result.test.concurrency).style(style);
            worksheet.cell(startRow + testNumber,sapConnectionsInPoolCol).number(result.test.keep_alive).style(style);
            worksheet.cell(startRow + testNumber,requestsPerWorkerCol).number(result.test.requestsPerWorker).style(style);
    
            let requests = result.test.requestsPerWorker * result.test.workers;
            worksheet.cell(startRow + testNumber,requestsCol).number(requests).style(style);
    
            let timePerRequest = minMaxSummValue.maximal(result.result, 'timePerRequest');
            worksheet.cell(startRow + testNumber,timePerRequestCol).number(timePerRequest).style(style);
    
            let requestsPerSecond = minMaxSummValue.summ(result.result, 'requestsPerSecond');
            worksheet.cell(startRow + testNumber,requestsPerSecondCol).number(requestsPerSecond).style(style);
    
            let failedRequests = minMaxSummValue.summ(result.result, 'failed');
            worksheet.cell(startRow + testNumber,failedRequestsCol).number(failedRequests).style(style).style({font: {color: '#FF0000'}});
    
            worksheet.cell(startRow + testNumber,failedPercCol).number(failedRequests * 100 / requests).style(style).style({font: {color: '#FF0000'}});
            
            testNumber = ++testNumber;

            callback();
        }
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            workbook.write(fileName);
        }
    });


};
module.exports = createXLSX;
