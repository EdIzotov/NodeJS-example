Feature: API Gateway > Services > Create contract
    Create smart contract instance from the template

    Scenario: Perform a successful Create contract request for single template file
        Given we have an identity in the IOV system
        And we created an account for contract
        And we have signed the create contract request with the identities key
        And we have the address of the uploaded contract single template file
        And we have the account address as contract "initialData"
        When we perform the signed create contract request with template address and contract initial data
        Then the result is successful (code 200)
        And the response contains a "contract_address" field with a value in it

    Scenario: Perform a successful Create contract request for multi template file
        Given we have an identity in the IOV system
        And we created an account for contract
        And we have signed the create contract request with the identities key
        And we have the address of the uploaded contract multi template file
        And we have the account address as contract "initialData"
        When we perform the signed create contract request with template address and contract initial data
        Then the result is successful (code 200)
        And the response contains a "contract_address" field with a value in it


    Scenario: Perform an unsuccessful Create contract request by stating a wrong template address
        Given we have an identity in the IOV system
        And we created an account for contract
        And we have signed the create contract request with the identities key
        And we have the account address as contract "initialData"
        When we perform signed the create contract request with a wrong template address
        Then the result is unsuccessful (code 422)