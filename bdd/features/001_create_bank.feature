Feature: Create Bank
    New bank for test

    Scenario: Create number of banks (the system is restarted when we create banks under preassure)

        When create bank 2 banks
        Then id is present for all banks
