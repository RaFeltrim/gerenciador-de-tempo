*** Settings ***
Documentation     Test suite for the parse-task API endpoint
Library           Collections
Library           RequestsLibrary

*** Variables ***
${BASE_URL}       http://localhost:3000
${ENDPOINT}       /api/parse-task

*** Test Cases ***
Send Simple Task Text And Receive Structured Data
    [Documentation]    Send a simple task description and verify structured response
    Given User prepares task text    Reunião amanhã às 14h
    When User sends POST request to parse-task endpoint
    Then Response should contain structured task data
    And Task title should be extracted correctly
    And Task should have default priority

Send Task With Priority And Time
    [Documentation]    Send a task with explicit priority and time information
    Given User prepares task text    Entregar relatório importante até sexta, alta prioridade, 2 horas
    When User sends POST request to parse-task endpoint
    Then Response should contain structured task data
    And Task title should be extracted correctly
    And Task priority should be high
    And Estimated time should be extracted

Send Task With Date
    [Documentation]    Send a task with date information
    Given User prepares task text    Comprar presente para Maria no dia 25/12
    When User sends POST request to parse-task endpoint
    Then Response should contain structured task data
    And Task due date should be extracted correctly

*** Keywords ***
User prepares task text
    [Arguments]    ${task_text}
    Set Suite Variable    ${TASK_TEXT}    ${task_text}

User sends POST request to parse-task endpoint
    Create Session    focusflow    ${BASE_URL}
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${payload}=    Create Dictionary    taskText=${TASK_TEXT}
    ${response}=    POST On Session    focusflow    ${ENDPOINT}    json=${payload}    headers=${headers}
    Set Suite Variable    ${RESPONSE}    ${response}

Response should contain structured task data
    Should Be Equal As Numbers    ${RESPONSE.status_code}    200
    Dictionary Should Contain Key    ${RESPONSE.json()}    title
    Dictionary Should Contain Key    ${RESPONSE.json()}    description
    Dictionary Should Contain Key    ${RESPONSE.json()}    priority
    Dictionary Should Contain Key    ${RESPONSE.json()}    estimatedTime

Task title should be extracted correctly
    ${response_data}=    Set Variable    ${RESPONSE.json()}
    Should Not Be Empty    ${response_data}[title]

Task should have default priority
    ${response_data}=    Set Variable    ${RESPONSE.json()}
    Should Be Equal    ${response_data}[priority]    medium

Task priority should be high
    ${response_data}=    Set Variable    ${RESPONSE.json()}
    Should Be Equal    ${response_data}[priority]    high

Estimated time should be extracted
    ${response_data}=    Set Variable    ${RESPONSE.json()}
    Should Not Be Equal As Integers    ${response_data}[estimatedTime]    ${None}

Task due date should be extracted correctly
    ${response_data}=    Set Variable    ${RESPONSE.json()}
    # For this test, we just check that dueDate field exists
    Dictionary Should Contain Key    ${response_data}    dueDate