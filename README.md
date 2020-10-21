Link to the repository - https://gitlab.XXX/nedward/qa-sap-tests.git

## Quick Install

1. npm install
2. sudo npm install mocha -g

## Settings

1. Set environment variables into file .env
2. Set IPs for CBS/SAP hosts into files config/cbs.json and config/sap.json

## Running tests

To run all tests, execute the command `npm test`

To run a specific test group

-   `npm run CBS_Critical`
-   `npm run SAP_Critical`
-   `npm run SAP_CriticalNegative`
-   `npm run CBS_Extended`
-   `npm run SAP_Extended`
-   `npm run NostroVostro`
-   `npm run HoldReleaseTransactions`
-   `npm run Non_AHG`
-   `npm run Onboarding`
-   `npm run SmartContracts`
-   `npm run Scheduler`

## Description of tests CBS/SAP (by groups)

#### CBS_Critical

This group of tests is needed to test the basic functionality of CBS

-   005 Create Identity
-   010 Create Account
-   012 Create non-AHG Account
-   015 Check exist in IOV
-   020 Get QR

#### SAP_Critical

This group of tests is needed to test the basic functionality of SAP

-   100 Prepare data
-   105 Perform addpubkey for identity1
-   110 Perform addpubkey for identity2
-   115 Get balance for identity1
-   120 Get balance for identity2
-   125 Perform 10 transactions from account1 to account2
-   130 Perform transaction from account1 to account1
-   135 Check transaction status
-   140 Check balance account1
-   145 Check balance account2
-   150 Check balance via CBS account1
-   155 Check balance via CBS account2
-   160 Check history account1
-   165 Сheck API versioning (API path /ws, /ws/, /ws/v2, /ws/v2/)

#### SAP_CriticalNegative

This group of tests is needed to test the negative scenarios of SAP

-   200 Prepare data
-   205 Check API non-existing versions (/ws/v1, /ws/v1/, /ws/v3, /ws/v3/)
-   207 Invalid public key
-   210 Get transaction for non existent trxId
-   220 Perform transaction on amount more than current balance
-   221 Transaction too old. uuid timestamp
-   222 Old Request. uuid timestamp
-   225 Incorrect region
-   230 Perform 10 transactions with same trxId
-   231 Transaction rejected processing
-   240 Perform transaction with negative amount
-   250 Account Owner Is Invalid
-   260 Perfrom transactions from deleted account. Account deleted in bank.
-   261 Perfrom transactions to deleted account. Account deleted in bank.
-   270 Perfrom transaction/balance/history with incorrect uuid. Expect errorCode 301.
-   280 Perform balance,trx,history with incorrect signature.
-   281 Account Blocked
-   282 Account Not Found
-   283 Identity Not Found
-   284 Not authenticated public key not found
-   290 Perform transaction with description length more 300 char
-   295 Attempt to replace public key

#### CBS_Extended

This group of tests is needed to test extended scenarios of CBS

-   300 Prepare data
-   305 Check CBS block account.
-   310 Check description for oldWorld transactions
-   315 Check unique trxId from AHG side
-   320 Check all banks working in CBS
-   325 Check transactions between accounts in other CBSs

#### SAP_Extended

This group of tests is needed to test extended scenarios of SAP

-   400 Prepare data
-   405 Check second pubkey
-   410 Check account new owner
-   415 Delete pubkey
-   420 Check description of transaction
-   425 Check description of transaction in other nodes
-   430 Check spending limit
-   435 Check balance in all nodes via SAP operation balancereport
-   440 Check history pagination

#### NostroVostro_Extended

This group of tests is needed to test scenarios related with Nostro / Vostro functionality

-   500 Prepare data
-   505 Link nostro vostro accounts
-   510 Perform transaction via nostro
-   515 Negative Nostro / Vostro tests
    -   Try direct trx from simple account to nostro
    -   Link to already linked bank#1 Nostro Account to bank#2 Vostro Account

#### HoldReleaseTransactions_Extended

This group of tests is needed to test scenarios related with Hold / Release functionality

-   550 Prepare data
-   555 Check hold/release transactions
    -   Send a hold transaction
    -   Check balance CBS
    -   Check balance SAP
    -   Send hold cancel
    -   Repeate request to hold cancel. Expect error TrxNotFound
    -   Check balance CBS
    -   Check balance SAP

#### Non-AHG accounts

-   600 Prepare data
-   605 Add owner to non-AHG account
-   610 Remove owner from non-AHG account
-   615 Block/unblock non-AHG account
-   620 Transaction to another non-AHG account
-   625 Roundtrip transactions non-AHG and simple account
-   630 Balance history trxstatus for non-AHG account
-   635 Balance via cbs
-   650 Negative test. Preauth for non-AHG account
-   655 Negative test. Old world for non-AHG account
-   657 Negative test. Spending limit

#### Onboarding

-   700 Create "Admin" identity
-   710 Root identity
-   720 Admin identity
-   750 Root identity negative
-   760 Admin identity negative

#### SmartContracts

-   800 Prepare data
-   810 Main operations
-   820 Upload template negative
-   825 Create contract negative
-   830 Send transaction negative
-   835 Common negative

#### Scheduler_Extended

This group of tests is needed to test scenarios related with Scheduler Component functionality

-   970 Check scheduler component - step1
    -   Send hold transaction
    -   Send hold debit transaction
    -   Send hold transaction
    -   Get balance. Check available balance decreases.
-   975 Check scheduler component - step2
    -   Get SAP history. Since transactions in history are sorted by desc, expect the following order: HoldCancel, Hold, HoldComplete, Hold
