Feature: User data driven from Excel

  @excel
  Scenario: Load all users from Excel and log their details
    Given I load test data from Excel file "testdata/users.xlsx"
    Then I should see 5 rows of user data

  @excel
  Scenario Outline: Fill address form using Excel row <rowIndex>
    Given I load test data from Excel file "testdata/users.xlsx"
    When I use row <rowIndex> from the Excel data
    Then the user name should be "<expectedName>"
    And the user city should be "<expectedCity>"

    Examples:
      | rowIndex | expectedName  | expectedCity |
      | 1        | Alice Smith   | London       |
      | 2        | Bob Johnson   | Manchester   |
      | 3        | Clara Muller  | Berlin       |

  # ── Tracked scenario: picks the next unused row, marks it "used" in Excel ──
  # Add @excel-track to any scenario that should consume a row.
  # Run this scenario multiple times — each run picks a different fresh row.
  # Open users.xlsx after the run and the used rows will show "used" in column F.
  @excel-track
  Scenario: Register next available user
    Given I pick the next unused user from "testdata/users.xlsx"
    Then the user name should not be empty
  # ── testcasenum lookup: reference data by a stable ID instead of a row number ──
  # Each row in Excel has a unique testcasenum (TC001, TC002 …) in column A.
  # The test name tells you exactly which data set it uses — no index guessing.
  @excel
  Scenario Outline: Verify user details for <tcNum>
    When I use test case "<tcNum>" from "testdata/users.xlsx"
    Then the user name should be "<expectedName>"
    And the user city should be "<expectedCity>"

    Examples:
      | tcNum | expectedName | expectedCity |
      | TC001 | Alice Smith  | London       |
      | TC003 | Clara Muller | Berlin       |
      | TC005 | Eva Dupont   | Paris        |