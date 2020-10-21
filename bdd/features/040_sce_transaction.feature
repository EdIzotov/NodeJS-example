Feature: SCE transaction
    Here we test the flow `From Contract Event to SCE Transaction from Contract`.
    The main steps:
    - send the special contract event via SAP to Contract to trigger contract transaction & immediately
    receive a successful event response as soon as contract has proccessed this event.
    - the SCE transaction should be sent from SCE to Core after SCE consensus of the contract step result.
    The only contract is able to know the result of transaction processing now
    - the end user should find out the transaction was processed eventually by sending get balance request

    Background: SCE Transaction testing background
        Given we create new bank, identity, 1000.00 and 0.00 EUR accounts
        And we upload new contract template
        And we create new contract instant "Transaction-from-contract-Scala-example"

    Scenario: Contract event to SCE transaction
        When we send contract event to trigger new 100 EUR transaction from contract
        Then eventually accounts balances will changed to 900.00 and 100.00 on nodes
        And eventually accounts balances will changed in bank

    Scenario: The set of simultaneous contract events to the set of single SCE transactions
        When we send 3 contract events to trigger 50.00 EUR transaction from contract
        Then eventually accounts balances will changed to 850.00 and 150.00 on nodes