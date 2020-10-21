Feature: API Gateway > Services > Query contract
    Query data from the Smart Contract's state

    Scenario: Perform a successful Query contract request to get contract account address
        Given we have an identity in the IOV system
        And we created an account for contract
        And we have the uploaded templates file
        And we have the address of created contract
        And we have signed the query contract request with the identities key
        And we have set the "{"QueryContractAccount":{}}" as the requests "input-data" to query contract account address
        When we perform the signed query contract request with input data
        Then the result is successful (code 200)
        And the response contains the contract account address

    Scenario: Perform an unsuccessful Query contract request by stating a wrong contract address
        Given we have an identity in the IOV system
        And we have the uploaded templates file
        And we created an account for contract
        And we have the address of created contract
        And we have signed the query contract request with the identities key
        And we have set the "{"QueryContractAccount":{}}" as the requests "input-data" to query contract account address
        When we perform the signed query contract request with input data and a wrong contract address
        Then the result is unsuccessful (code 422)