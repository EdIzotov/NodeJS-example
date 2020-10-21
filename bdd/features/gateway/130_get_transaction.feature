Feature: API Gateway > Assets > Get transaction details

    Scenario: Perform a successful Get transaction details request
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account with asset sub-type 0 and the balance of which is 1000.00 for account 1
        And we created an account with asset sub-type 0 and the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform the create transfer request of 1000.00 assets from account 1 to account 2 using the created identities key for signature
        And we perform the get transaction details request specifying the same transaction ID we used to make the transfer
        Then the result is successful (code 200)
        And the response contains a "transaction_id" field the value of which is the transaction ID we specified when performing the transaction
        And the response contains a "from_account_address" field the value of which is the address of account 1
        And the response contains a "to_account_address" field the value of which is the address of account 2
        And the response contains a "current_balance_change" field the value of which is "-1000"
        And the response contains a "available_balance_change" field the value of which is "-1000"


    Scenario: Perform an unsuccessful Get transaction details request by asking for the status of a non-existing transaction
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account with asset sub-type 0 and the balance of which is 1000.00 for account 1
        And we made the identity the owner of account 1
        When we perform the get transaction details request on this account by specifying a random transaction ID
        Then the result of the request is unsuccessful (code 422)