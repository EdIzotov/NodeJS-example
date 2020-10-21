Feature: Assets > Get account owners
    Scenario: Perform a successful Get account owners request

        Given we have an identity
        And we added a public key for this identity
        And we created an account the owner of which is this identity

        When we perform the get account owners request through the API gateway using the identity which is the owner of the account

        Then the result of the request is successful (code 200)
        And the response contains an “owners” array, which contains the address of the identity created at the beginning of the test

    Scenario: Perform an unsuccessful Get account owners request

        Given we have 2 identities in the IOV system (identity 1 and identity 2)
        And we added a public key for each identity
        And we created an account the owner of which is identity 1

        When we perform the get account owners request through the API gateway and sign the request with the key of identity 2

        Then the result is unsuccessful (code 422)