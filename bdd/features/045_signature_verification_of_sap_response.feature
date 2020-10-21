Feature: SAP should return signature which included all fields from response

    In this test we verify SAP response signature such requests:

    - Transaction
    - Transaction status
    - Add public key
    - Remove public key
    - Get balance
    - Get history

    Background: Signature verification background

        Given we create a new bank (with default data) and identity and 1000 and 0 accounts

    Scenario: Signature of add public key response include all fields

        When we add public key
        Then signature of add public key response should contains all data

    Scenario: Signature of transaction response include all fields

        Given we add public key
        When we make a transaction
        Then signature of transaction response should contains all data

    Scenario: Signature of get balance response include all fields

        Given we add public key
        When we get balance
        Then signature of get balance response should contains all data

    Scenario: Signature of transaction history response include all fields

        Given we add public key
        When we make a transaction
        And we get history
        Then signature of transaction history response should contains all data

    Scenario: Signature of transaction status response include all fields

        Given we add public key
        When we make a transaction
        And we get the transaction status
        Then signature of transaction status response should contains all data

    Scenario: Signature of remove public key response include all fields

        Given we add public key
        When we remove public key
        Then signature of remove public key response should contains all data

