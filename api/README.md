# PayFlex API Layer

This folder contains all external and internal service connectors for the PayFlex platform. Each file is a single-responsibility module for a specific integration or domain service.

- OrangeMoneyConnector.ts: Orange Money WebPay API
- FraudLabsConnector.ts: FraudLabs Pro API
- SupabaseService.ts: All Supabase CRUD
- OpenAIService.ts: OpenAI Chat API
- USSDService.ts: Africa's Talking USSD logic
- FraudService.ts: Internal + external fraud logic
- LedgerServiceAPI.ts: Ledger microservice stub
- CreditScoreServiceAPI.ts: Credit score microservice stub
- ChatServiceAPI.ts: AI chat microservice stub
- USSDServiceAPI.ts: USSD REST stub
- UnifiedPaymentsService.ts: Payment orchestration
