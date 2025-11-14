# Requirements Document

## Introduction

This document defines the requirements for implementing an onboarding flow for the Reddit Devvit chat application. The system provides a welcome screen that introduces new users to the app, followed by a terms acceptance screen where users must agree to the Privacy Policy and Terms & Conditions before accessing the main chat functionality. The implementation leverages Devvit 0.12.2's inline webview capabilities with multiple entry points and uses Redis for persistent tracking of user consent.

## Glossary

- **Onboarding_System**: The complete user onboarding infrastructure including welcome screen, terms acceptance, and consent tracking
- **Welcome_Screen**: The initial inline view that introduces the app and its key features to new users
- **Terms_Screen**: The screen where users review and accept the Privacy Policy and Terms & Conditions
- **Consent_Tracker**: The Redis-based system that stores and retrieves user consent status
- **Entry_Point**: A Devvit configuration that defines different HTML files for different app contexts (welcome, terms, chat)
- **Inline_Mode**: The default Devvit view mode where content loads directly in the post unit
- **Expanded_Mode**: The full-screen Devvit view mode triggered by user interaction
- **Redis_Store**: The Devvit-provided Redis database used for persistent user consent storage
- **User_Context**: The authenticated Reddit user's identity provided by Devvit
- **Privacy_Policy**: The document describing how user data is collected, used, and protected
- **Terms_Conditions**: The document describing the rules and agreements for using the app

## Requirements

### Requirement 1

**User Story:** As a new Reddit user, I want to see a welcome screen when I first encounter the app, so that I understand what the app does and what features are available

#### Acceptance Criteria

1. WHEN a user views the app post for the first time, THE Onboarding_System SHALL display the Welcome_Screen in Inline_Mode
2. THE Welcome_Screen SHALL display the app name and a brief description of its purpose
3. THE Welcome_Screen SHALL highlight 2-4 key features of the chat application
4. THE Welcome_Screen SHALL include a prominent call-to-action button labeled "Get Started" or similar
5. THE Welcome_Screen SHALL use engaging visual design that stands out in the Reddit feed

### Requirement 2

**User Story:** As a new user, I want to review and accept the app's terms before using it, so that I understand my rights and responsibilities

#### Acceptance Criteria

1. WHEN a user clicks the call-to-action button on Welcome_Screen, THE Onboarding_System SHALL navigate to the Terms_Screen
2. THE Terms_Screen SHALL display clear text stating that continued use requires acceptance of Privacy Policy and Terms & Conditions
3. THE Terms_Screen SHALL provide hyperlinked text for "Privacy Policy" and "Terms & Conditions"
4. THE Terms_Screen SHALL include a prominent call-to-action button labeled "I Agree" or similar
5. THE Terms_Screen SHALL clearly communicate that clicking the button constitutes agreement to both documents

### Requirement 3

**User Story:** As a user, I want to read the Privacy Policy and Terms & Conditions, so that I can make an informed decision about using the app

#### Acceptance Criteria

1. WHEN a user clicks the "Privacy Policy" link on Terms_Screen, THE Onboarding_System SHALL display a closable overlay with the Privacy Policy content
2. WHEN a user clicks the "Terms & Conditions" link on Terms_Screen, THE Onboarding_System SHALL display a closable overlay with the Terms & Conditions content
3. THE overlay SHALL include a close button or X icon to dismiss the overlay
4. WHEN a user closes the overlay, THE Terms_Screen SHALL remain visible with all elements intact
5. THE overlay content SHALL be scrollable to accommodate full document text

### Requirement 4

**User Story:** As a user who has accepted the terms, I want to proceed directly to the chat interface on subsequent visits, so that I don't have to go through onboarding again

#### Acceptance Criteria

1. WHEN a user clicks "I Agree" on Terms_Screen, THE Consent_Tracker SHALL store the user's consent in Redis_Store with User_Context identifier
2. THE Consent_Tracker SHALL store the consent timestamp and version of terms accepted
3. WHEN a returning user views the app post, THE Onboarding_System SHALL check Redis_Store for existing consent
4. WHERE consent exists in Redis_Store, THE Onboarding_System SHALL navigate directly to the chat interface
5. WHERE no consent exists in Redis_Store, THE Onboarding_System SHALL display the Welcome_Screen

### Requirement 5

**User Story:** As a developer, I want to use Devvit 0.12.2's multiple entry points feature, so that I can create distinct experiences for welcome, terms, and chat screens

#### Acceptance Criteria

1. THE Onboarding_System SHALL define three entry points in devvit.json: "welcome", "terms", and "chat"
2. THE Onboarding_System SHALL configure "welcome" entry point to use welcome.html in Inline_Mode
3. THE Onboarding_System SHALL configure "terms" entry point to use terms.html in Inline_Mode
4. THE Onboarding_System SHALL configure "chat" entry point to use the existing chat interface HTML
5. THE Onboarding_System SHALL use requestExpandedMode API to transition between entry points when appropriate

### Requirement 6

**User Story:** As a developer, I want to track user consent server-side using Redis, so that consent status persists across sessions and devices

#### Acceptance Criteria

1. THE Consent_Tracker SHALL store consent data in Redis_Store using key pattern "user:{userId}:consent"
2. THE Consent_Tracker SHALL store consent data as a Redis hash with fields: accepted (boolean), timestamp (number), termsVersion (string)
3. THE Onboarding_System SHALL provide a server endpoint at /api/consent/check to verify user consent status
4. THE Onboarding_System SHALL provide a server endpoint at /api/consent/accept to record user consent
5. THE Consent_Tracker SHALL validate User_Context before storing or retrieving consent data

### Requirement 7

**User Story:** As a developer, I want to create posts with the welcome entry point by default, so that new users see the onboarding flow

#### Acceptance Criteria

1. WHEN creating a new chat post, THE Onboarding_System SHALL use the "welcome" entry point by default
2. THE Onboarding_System SHALL store the post creation context in postData
3. THE Onboarding_System SHALL allow moderators to create posts through the existing menu action
4. THE Onboarding_System SHALL maintain backward compatibility with existing posts
5. THE Onboarding_System SHALL update the post creation logic in server index.ts

### Requirement 8

**User Story:** As a user, I want smooth transitions between onboarding screens, so that the experience feels cohesive and professional

#### Acceptance Criteria

1. WHEN transitioning from Welcome_Screen to Terms_Screen, THE Onboarding_System SHALL use client-side navigation without page reload
2. WHEN transitioning from Terms_Screen to chat interface, THE Onboarding_System SHALL use requestExpandedMode to enter full-screen chat
3. THE Onboarding_System SHALL display loading indicators during transitions
4. THE Onboarding_System SHALL handle navigation errors gracefully with user-friendly messages
5. THE Onboarding_System SHALL prevent users from bypassing Terms_Screen without accepting terms

### Requirement 9

**User Story:** As a developer, I want to maintain the existing chat functionality, so that users who have completed onboarding can use the app normally

#### Acceptance Criteria

1. THE Onboarding_System SHALL preserve all existing chat features and functionality
2. THE Onboarding_System SHALL not modify the existing chat interface components
3. THE Onboarding_System SHALL only add onboarding logic to the app initialization flow
4. THE Onboarding_System SHALL ensure chat API endpoints remain unchanged
5. THE Onboarding_System SHALL maintain compatibility with existing chat data in Redis_Store

### Requirement 10

**User Story:** As a developer, I want to update to Devvit 0.12.2, so that I can use the new inline webview and multiple entry points features

#### Acceptance Criteria

1. THE Onboarding_System SHALL update package.json to use Devvit version 0.12.2 or higher
2. THE Onboarding_System SHALL remove deprecated splash parameter from submitCustomPost calls
3. THE Onboarding_System SHALL update devvit.json to use the new entrypoints configuration format
4. THE Onboarding_System SHALL configure the default entry point with inline: true
5. THE Onboarding_System SHALL update vite.config.ts to support multiple HTML entry points
