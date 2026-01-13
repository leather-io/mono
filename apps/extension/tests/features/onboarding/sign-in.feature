Feature: Sign In
  As a returning user
  I want to sign in to my wallet
  So that I can access my funds

  @onboarding @signin
  Scenario: User can sign in with existing secret key
    Given I am on the onboarding page
    When I click "Sign in"
    And I enter a valid 24-word secret key
    And I click continue
    And I set a password
    And I confirm the password
    And I click continue
    Then I should be taken to the home page
    And I should see my account balance

  @onboarding @signin @validation
  Scenario: User cannot sign in with invalid mnemonic
    Given I am on the onboarding page
    When I click "Sign in"
    And I enter an invalid secret key
    Then the sign in button should be disabled
    And I should see a validation error

  @onboarding @addresses
  Scenario: Correct addresses are generated after sign in
    Given I am on the onboarding page
    When I sign in with the standard test mnemonic
    Then my Bitcoin native segwit address should match expected
    And my Bitcoin taproot address should match expected
    And my Stacks address should match expected

  @onboarding @encryption
  Scenario: Encryption key is stored correctly
    Given I am on the onboarding page
    When I sign in with the standard test mnemonic
    Then the encryption key should be stored in session storage
    And the wallet state should be stored in local storage
