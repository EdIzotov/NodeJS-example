Feature: API Gateway > Assets > Create account
    Creates a new asset account, with the calling identity as the account owner.

    Scenario: Perform a successful Create account request with each asset sub-type
        Given we have an identity in the IOV system
        When  we perform the create account request through the API gateway with asset type 2 and with each available asset sub-type
        Then  the result of each request is successful (code 200)
        And response contains a "account_address" field with a value in it

    Scenario: Perform an unsuccessful Create account request
        Given we have an identity in the IOV system
        When we perform the create account request through the API gateway with specifying asset type 2 and a non-existent asset sub-type
        Then the result is unsuccessful (code 422)