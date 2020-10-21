Feature: Assets > Remove account owner
    Scenario: Perform a successful Remove account owner request

        Given we have two identities in the IOV system (identity 1 and identity 2)
        And we added a public key for both of these identities
        And we created an account
        And we added these identities as owners of this account

        When we perform the remove account owner request to remove identity 2 from the owners

        Then the result of the request is successful (code 200)
        And the response contains an “owners” array with 1 entry in it, which is the addresses of identity 1