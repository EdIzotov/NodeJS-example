Feature: Assets > Get account details
    Scenario: Perform a successful Get account details request

        Given we have an identity in the IOV system
        And we added a public key for this identity
        And created an account the owner of which is this identity

        When we perform the get account details request through the API gateway

        Then the result of the request is successful (code 200)
        And the response contains a "current_balance" field with a value in it
        And the response contains a "available_balance" field with a value in it

    Scenario: Perform an unsuccessful Get account details request by providing a wrong signature

        Given we have an identity in the IOV system
        And we added a public key for this identity
        And created an account the owner of which is this identity

        When we perform the get account details request through the API gateway and sign the request with a non-existing key

        Then the result is unsuccessful (code 422)

    Scenario: Perform an unsuccessful Get account details request by requesting details of a non-exisiting account

        Given we have an identity in the IOV system
        And we added a public key for this identity

        When we perform the get account details request through the API gateway with specifying a non-existing account address, but providing a correct signature

        Then the result is unsuccessful (code 422)
