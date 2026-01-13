Feature: Settings Menu
  As a wallet user
  I want to access and modify wallet settings
  So that I can customize my wallet experience

  Background:
    Given I am signed in with a test account
    And I am on the home page

  @settings @support
  Scenario: User can access support page
    When I open the settings menu
    And I click on the support link
    Then a new tab should open with the support URL

  @settings @signout
  Scenario: User can sign out
    When I open the settings menu
    And I click on sign out
    Then I should see the onboarding page
    And I should see the sign up button

  @settings @lock
  Scenario: User can lock and unlock the wallet
    When I open the settings menu
    And I click on lock wallet
    Then I should see the unlock screen
    When I enter my password
    And I click unlock
    Then I should see my account name

  @settings @secret-key
  Scenario: User can view secret key
    When I navigate to view secret key
    And I enter my password
    And I click unlock
    And I click copy to clipboard
    Then I should see a copied confirmation message

  @settings @privacy
  Scenario: User can toggle privacy mode
    Given I can see my balance
    When I open the settings menu
    And I toggle privacy mode
    Then my balance should be hidden
