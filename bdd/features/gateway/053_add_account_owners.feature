Feature: Assets > Add account owner
    Scenario: Perform a successful Add account owner request

        Given we have an identity in the IOV system
        And we added a public key to this identity
        And we created an account

        When we perform the add account owner request to add the created identity as an owner to the created account

        Then the result of the request is successful (code 200)
        And the response contains an “owners” array, which contains the address of the identity we added as an owner to the account
