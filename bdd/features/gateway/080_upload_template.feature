    Scenario: API Gateway > Accounts > Perform a successful Upload template request
        Given we have an identity with public key in the IOV system
        And we have signed the template request with the identities key
        And we have the generated template file hash

        When we perform the signed upload template request with the template file and file hash

        Then the result is successful (code 200)
        And the response contains a "template_address" field with a value in it

    Scenario: API Gateway > Accounts > Perform an unsuccessful Upload template request by stating a wrong template file hash
        Given we have an identity with public key in the IOV system
        And we have signed the template request with the identities key

        When we perform the upload template signed request with a wrong template file hash

        Then the result is unsuccessful (code 422 Unprocessable Entity)

    Scenario: API Gateway > Accounts > Perform an unsuccessful Upload template request by uploading a non-Java archive file
        Given we have an identity with public key in the IOV system
        And we have signed the template request with the identities key

        When we perform the upload template signed request with a non-Java archive file

        Then the result is unsuccessful (code 400 Bad Request)