Feature: API Gateway > Assets > Get transaction list

    Scenario: Perform a successful Get transaction list request
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account the balance of which is 1000.00 for account 1
        And we created an account the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform 10 transactions from account 1 to account 2 each transferring 100.00 assets
        And we perform the get transaction list request for account 1 using the created identities key
        Then the result is successful (code 200)
        And the response contains a "transaction_id" field the value of which is the transaction ID we specified when performing the transaction
        And each entity has a "from_account_address" field the value of which is the address of account 1
        And each entity has a "to_account_address" field the value of which is the address of account 2
        And each entity has a "current_balance_change" field the value of which is "-100"
        And each entity has a "available_balance_change" field the value of which is "-100"

    Scenario: Perform a unsuccessful Get transaction list request
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account the balance of which is 1000.00 for account 1
        And we created an account the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform 10 transactions from account 1 to account 2 each transferring 100.00 assets
        And we perform the get transaction list request for account 1 using a non-existing key
        Then the result of the request is unsuccessful (code 422)