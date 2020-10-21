Feature: API Gateway > Identities > Remove public key

    Scenario: Perform a successful Remove public key request
        Given we have an identity in the IOV system
        And we have already added a public key to this identity
        When we perform the remove public key request for this identity and this key through the API gateway
        Then the result is successful (code 200)

    Scenario: Perform an unsuccessful Remove public key request
        Given we have an identity in the IOV system
        And we have already added a public key to this identity
        When we perform the remove public key request for this identity with a wrong key ID through the API gateway
        Then the result is unsuccessful (code 422)