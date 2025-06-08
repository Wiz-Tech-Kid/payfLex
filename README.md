# PayFLex

## Overview

PayFLex is a proof-of-concept (POC) mobile-first financial platform built with [Expo](https://expo.dev) and React Native, designed for instant loan approvals, seamless payments, and digital banking tailored for the African market (with Botswana as a reference implementation). The app demonstrates a modern, modular approach to fintech, integrating AI, secure authentication, and a variety of payment methods.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [App Architecture & Layout](#app-architecture--layout)
- [Screens & Components](#screens--components)
- [Backend & Service Layer](#backend--service-layer)
- [AI Chatbot Integration](#ai-chatbot-integration)
- [Security & RLS Policies](#security--rls-policies)
- [Localization](#localization)
- [Getting Started](#getting-started)
- [Resetting the Project](#resetting-the-project)
- [Community & Resources](#community--resources)

---

## Tech Stack

**Frontend:**
- [Expo](https://expo.dev) (React Native)
- TypeScript
- React Navigation & Expo Router (file-based routing)
- React Query (data fetching/caching)
- React Hook Form (form management)
- [react-native-webview](https://github.com/react-native-webview/react-native-webview) (for AI chatbot)
- Expo Linear Gradient, Expo Vector Icons

**Backend (POC/Integration Layer):**
- Supabase (Postgres, Auth, RLS, Storage)
- Custom API connectors (see `/api` folder)
- OpenAI API (for AI chatbot)
- Africa's Talking (USSD, SMS)
- FraudLabs Pro (fraud detection)
- Mocked microservices for ledger, credit scoring, chat, and unified payments

**Other:**
- Custom UI components (SidebarDrawer, ChatbotFloatingButton, etc.)
- Modular folder structure for scalability

---

## App Architecture & Layout

The app uses a **tab-based navigation** structure with a stack for authentication and onboarding. All screens are organized under the `/app/(tabs)/screens/` directory, following Expo Router conventions.

**Main Layout:**
- **_layout.tsx**: Root layout, wraps all screens, provides navigation, theming, and global providers (React Query, Theme, Chatbot).
- **SidebarDrawer**: Slide-out navigation drawer for quick access to all features and logout.
- **ChatbotFloatingButton**: Persistent floating button for AI-powered financial assistant.

**Navigation Flow:**
1. **Login / Account Creation**: Entry point for users.
2. **HomeTabs**: Main dashboard with loan status, quick actions, payments, and more.
3. **Other Screens**: Accessed via tabs, sidebar, or quick actions.

---

## Screens & Components

### 1. **Login & Account Creation**
- **Login**: Secure authentication (mocked for POC), with form validation.
- **AccountCreationScreen**: User onboarding, collects personal info, sets up account.

### 2. **HomeTabs (Dashboard)**
- **User Info**: Avatar, name, contact.
- **Current Loan Card**: Shows active loan, progress, next payment, and loan details.
- **Quick Actions**: 
  - Make Payment
  - New Loan Application
  - Loan Calculator
  - Digital ID (profile)
- **Payment Methods**: Bank Transfer, Mobile Wallet, QR Code, USSD.
- **Recent Payments**: List of latest transactions.
- **USSD Demo**: Simulates USSD payment flow.

### 3. **Loan Application**
- **Multi-step Form**:
  - Step 1: Loan Details (amount, purpose, term)
  - Step 2: Personal Info (income, employment)
  - Step 3: Review & Submit
- **Instant Approval**: Simulated logic for auto-approval based on amount.
- **Result Screen**: Shows approval status, loan terms, and next steps.

### 4. **Payments**
- **SendMoneyScreen**: Initiate payments to other users/accounts.
- **BankTransferScreen**: Enter bank details, simulate payment.
- **MobileWalletScreen**: Enter mobile wallet info, simulate payment.
- **QRCodeScreen**: Scan or display QR for payment.
- **USSDInstructionsScreen**: Step-by-step guide for USSD payments.

### 5. **Loan Simulator**
- **SimulatorScreen**: Calculate loan repayments, interest, and eligibility.

### 6. **Digital ID/Profile**
- **DigitalIDScreen**: View and manage user profile, KYC status, and digital ID.

### 7. **AI Chatbot**
- **CompanionChatScreen**: Conversational AI assistant for financial queries, loan advice, and support.

### 8. **Other Components**
- **SidebarDrawer**: Navigation drawer with links to all screens and logout.
- **ChatbotFloatingButton**: Persistent button to open the AI chatbot from anywhere in the app.

---

## Backend & Service Layer

All backend logic is abstracted into the `/api` folder, with each file representing a connector or service:

- **SupabaseService.ts**: Handles all CRUD operations, authentication, and storage with Supabase.
- **OrangeMoneyConnector.ts**: Integrates Orange Money WebPay for mobile payments.
- **FraudLabsConnector.ts**: Connects to FraudLabs Pro for transaction risk scoring.
- **OpenAIService.ts**: Sends/receives messages to/from OpenAI for the chatbot.
- **USSDService.ts**: Handles USSD session logic via Africa's Talking.
- **LedgerServiceAPI.ts**: Stub for a microservice managing account balances and transactions.
- **CreditScoreServiceAPI.ts**: Stub for credit scoring logic.
- **ChatServiceAPI.ts**: Stub for AI chat microservice.
- **UnifiedPaymentsService.ts**: Orchestrates payment flows across different channels (bank, wallet, QR, USSD).
- **FraudService.ts**: Combines internal and external fraud checks.

**Note:** For the POC, many backend calls are mocked or simulated. In production, these would be replaced with real API calls and secure integrations.

---

## AI Chatbot Integration

- **Component**: `ChatbotFloatingButton` and `CompanionChatScreen`
- **Backend**: Uses OpenAI API (via `OpenAIService.ts`) for natural language understanding and response.
- **Features**:
  - Financial advice (loans, payments, budgeting)
  - App navigation help
  - Context-aware responses
  - Accessible from any screen (except login/onboarding)

---

## Security & RLS Policies

**Row-Level Security (RLS) Policies** are enforced in Supabase/Postgres to ensure data privacy and multi-tenancy:

- **Users**: Can only access their own records (except admins).
- **Accounts**: Only accessible by the owner.
- **Transactions/Payments**: Only sender/receiver can view; only payer can insert.
- **Loans**: Only borrower can view/modify; only admins can update/delete.
- **Audit Logs**: Admin-only access.
- **General**: Deny by default, allow per-policy. Always scope by `tenant_id` and `user_id`.

> See the end of this README for example RLS policies.

---

## Localization

- **Currency**: All amounts use "P" (Botswana Pula).
- **Phone Numbers**: Format enforced as `+2677XXXXXXX` (Botswana mobile).
- **Language**: English (can be extended for other locales).

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the app**
   ```bash
   npx expo start
   ```

3. **Install WebView for AI Chatbot**
   ```bash
   npm install react-native-webview
   ```

4. **Edit code**
   - Main app code is in `/app`
   - API connectors are in `/api`
   - UI components are in `/components`

---

## Resetting the Project

To reset the project to a blank state (for a new POC or demo):

```bash
npm run reset-project
```

- Moves starter code to `/app-example`
- Creates a blank `/app` directory

---

## Community & Resources

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Supabase](https://supabase.com/)
- [OpenAI](https://platform.openai.com/)
- [Africa's Talking](https://africastalking.com/)

---

## Example RLS Policies

- **Users Table**
  - Users can only select, update, or delete their own user record.
  - Admins can access all user records.
- **Accounts Table**
  - Users can only select/update accounts where they are the owner.
  - Only allow insert if the user is authenticated and the owner_id matches their user id.
- **Transactions Table**
  - Users can only select transactions where they are the sender or receiver.
  - Only allow insert if the sender_id matches the authenticated user.
  - Prevent updates/deletes except by admins.
- **Loans Table**
  - Users can only select loans where they are the borrower.
  - Only allow insert if the borrower_id matches the authenticated user.
  - Only allow update (e.g., repayment status) by the borrower or admin.
- **Payments Table**
  - Users can only select payments they made or received.
  - Only allow insert if the payer_id matches the authenticated user.
- **Audit Logs Table**
  - Only admins can select or insert.
- **General**
  - All tables: Deny by default, then allow per-policy.
  - Use `auth.uid()` or equivalent to match the authenticated user to row owner fields.
  - For multi-tenant: Always scope by tenant_id as well as user_id.

> Adjust table/column names as per your schema.  
> Always test your RLS policies to ensure no data leaks.

---

## Contact

For questions, feedback, or contributions, please open an issue or contact the project maintainer.
