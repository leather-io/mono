Feature: Network Selection
  As a wallet user
  I want to switch between blockchain networks
  So that I can interact with different environments

  Background:
    Given I am signed in with a test account
    And extensionRevamp flag is enabled

  @network @revamp
  Scenario: User can view available networks
    When I open the settings menu
    And I click on network settings
    Then I should see the network selection page
    And I should see mainnet as the current network
    And I should see at least 3 network options

  @network @revamp @switch
  Scenario: User can switch to testnet
    When I open the settings menu
    And I click on network settings
    And I select testnet
    Then I should be redirected to the home page
    And I should see the testnet indicator

  @network @revamp @custom
  Scenario: User can add a custom network
    When I open the settings menu
    And I click on network settings
    And I click add network
    And I fill in the network name "My Custom Network"
    And I fill in the network key "custom-network"
    And I fill in valid API URLs
    And I click save
    Then I should see "My Custom Network" in the network list

  @network @revamp @edit
  Scenario: User can edit a custom network
    Given I have a custom network configured
    When I open the settings menu
    And I click on network settings
    And I click edit on my custom network
    And I change the network name to "Updated Network"
    And I click save
    Then I should see "Updated Network" in the network list

  @network @revamp @delete
  Scenario: User can remove a custom network
    Given I have a custom network configured
    When I open the settings menu
    And I click on network settings
    And I click remove on my custom network
    Then the custom network should no longer appear in the list
