Feature: API Gateway > Identities > Add public key
    Called by an identity owner. Attaches new credentials to the specified identity.

    Scenario: Perform a successful Add public key request
        Given we have an identity in the IOV system
        And we have a secret key required for adding a public key to the identity
        When  we perform the add public key request through the API gateway
        Then the result is successful (code 200)

    Scenario: Perform an unsuccessful Add public key request
        Given we have an identity in the IOV system
        And we don’t have a secret key required for adding a public key to the identity
        When we perform the add public key request through the API gateway without valid secret
        Then the result is unsuccessful (code 422)
