Feature: Rollback

    We test if a rollback happens in the IOV system (on all nodes) and on the Asset host if we trigger it with a special description (fault injection)

    - This test only works if there are 4 or more nodes, as we need minimum 2 nodes for “Master and minority” and minimum 2 nodes for “majority”
    - If there are 3 nodes, only Master votes NAck (no minority)
    - If there are less than 3 nodes, the test does not work

    Scenario: Master and minority Slave nodes vote Ack, but majority Slave nodes vote NAck

        Given we create a new bank (with default data)
        And we create 2 new identities (with default data)
        And we create new account (with default data) with balance of 1000.00 EUR for identity 1
        And we create new account (with default data) with balance of 0.00 EUR for identity 2

        When we send transaction from account 1 to account 2 with description "Case: Master and minority Slave nodes vote Ack, but majority Slave nodes vote NAck" (that causes rollback)

        Then transaction is failed with error code 6
        And balance on account 1 in IOV system is 1000.00 EUR on all nodes
        And balance on account 2 in IOV system is 0.00 EUR on all nodes
        And balance on account 1 in bank is 1000.00 EUR
        And balance on account 2 in bank is 0.00 EUR