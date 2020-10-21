Feature: API Gateway > Services > Update contract
    Update Smart Contract's state

    Scenario: Perform a successful Update contract request
        Given we have an identity with public key in the IOV system
        And we created an account for contract
        And we have the uploaded templates file
        And we have the address of created contract
        And we have signed the update contract request with the identities key
        And we have set the "{"UpdateEvent":{}}" as the requests "input-data" to update the contract updates counter
        When we perform the signed update contract request with input data
        Then the result is successful (code 200)
        And the response has an empty body


    Scenario: Perform an unsuccessful Create contract request by stating a wrong template address
        Given we have an identity with public key in the IOV system
        And we created an account for contract
        And we have the uploaded templates file
        And we have the address of created contract
        And we have signed the update contract request with the identities key
        When we perform signed the update contract request with a wrong template address
        Then the result is unsuccessful (code 422)

    Scenario: Verify contract state changing after an Update contract request
        Given we have an identity with public key in the IOV system
        And we created an account for contract
        And we have the uploaded templates file
        And we have the address of created contract
        And we have signed the update contract request with the identities key
        And we have set the "{"UpdateEvent":{}}" as the requests "input-data" to update the contract updates counter
        And we perform the signed update contract request with input data
        And we have signed the query contract request with the identities key
        And we have set the "{"QueryUpdates":{}}" as the requests "input-data" to query the contract updates quantity
        When we perform the signed query contract request with input data
        Then the result is successful (code 200)
        And the response contains update contract requests quantity equals 1