Feature: API Gateway > Accounts > Credit account
    Perform a successful Credit account request


    Scenario: Perform a successful Credit account request
        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account the balance of which is 0.00
        When we perform the credit account request with the "credit_amount" set to 100.00
        Then the result is successful (code 200)
        And the response contains a "current_balance_change" field the value of which is 100.00
        And the response contains an "available_balance_change" field the value of which is 100.00
        And the response contains a "to_account_address" field the value of which is the address of the account we created