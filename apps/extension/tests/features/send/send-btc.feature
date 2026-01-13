Feature: Send Bitcoin
  As a wallet user
  I want to send Bitcoin to other addresses
  So that I can transfer value on the Bitcoin network

  Background:
    Given I am signed in with a test account
    And I am on testnet
    And I have navigated to the send BTC form

  @send @btc @preview
  Scenario: User can preview a BTC transaction
    When I enter an amount of "0.00006"
    And I enter a valid testnet recipient address
    And I click preview
    Then I should see the transaction confirmation details
    And the recipient address should be displayed correctly
    And the amount should be displayed correctly

  @send @btc @validation
  Scenario: Recipient input is trimmed correctly
    When I enter a recipient address with leading and trailing spaces
    And I click preview
    Then the displayed recipient should be trimmed

  @send @btc @fees
  Scenario: User can select different fee levels
    When I enter an amount of "0.00006"
    And I enter a valid testnet recipient address
    And I select the high fee option
    Then the fee should be higher than the standard rate

  @send @btc @max
  Scenario: User can send maximum amount
    When I click the send max button
    Then the amount field should be filled with the maximum available
    And there should be remaining balance for fees

  @send @btc @inscription
  Scenario: User is warned about inscriptions
    Given my address contains an inscription
    When I attempt to send all funds
    Then I should see a warning about inscriptions
    And I should be prevented from proceeding without acknowledgment
