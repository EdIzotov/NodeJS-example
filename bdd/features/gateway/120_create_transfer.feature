Feature: API Gateway > Assets > Create transfer

    Scenario: Perform a successful Create transfer request by performing a transfer between two accounts with the same asset sub-type
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account with asset sub-type 0 and the balance of which is 1000.00 for account 1
        And we created an account with asset sub-type 0 and the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform the create transfer request of 1000.00 assets from account 1 to account 2 using the created identities key for signature
        Then the result is successful (code 200)
        And the response contains a "from_account_address" field the value of which is the address of account 1
        And the response contains a "to_account_address" field the value of which is the address of account 2
        And the response contains a "current_balance_change" field the value of which is "-1000.0"
        And the response contains a "available_balance_change" field the value of which is "-1000.0"

    Scenario: Perform an unsuccessful Create transfer request by performing a transfer between two accounts with different asset sub-types
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account with asset sub-type 0 and the balance of which is 1000.00 for account 1
        And we created an account with asset sub-type 1 and the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform the create transfer request of 1000.00 assets from account 1 to account 2 using the created identities key for signature
        Then the result of the request is unsuccessful (code 422)

    Scenario: Perform an unsuccessful Create transfer request by performing a transfer between two accounts when the balance of the first account is not sufficient
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account with asset sub-type 0 and the balance of which is 0.00 for account 1
        And we created an account with asset sub-type 0 and the balance of which is 0.00 for account 2
        And we made the identity the owner of account 1
        When we perform the create transfer request of 1000.00 assets from account 1 to account 2 using the created identities key for signature
        Then the result of the request is unsuccessful (code 422)