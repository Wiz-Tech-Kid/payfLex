-- PayFlex Unified Financial Ecosystem Schema
-- PostgreSQL 14+

-- Enable extensions for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT UNIQUE NOT NULL,
    user_hash TEXT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number CHAR(8) NOT NULL,
    omang_id CHAR(9) NOT NULL,
    biometric_hash TEXT,
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('Male','Female')),
    password_hash TEXT,
    locale VARCHAR(5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email),
    UNIQUE (phone_number),
    UNIQUE (omang_id)
);
COMMENT ON TABLE public.users IS 'Primary identity registry for all users, storing DIDs, hashed identifiers, credentials, and metadata.';
COMMENT ON COLUMN public.users.user_id IS 'System-generated UUID for each user.';
COMMENT ON COLUMN public.users.did IS 'Decentralized Identifier (DID), unique per user.';
COMMENT ON COLUMN public.users.user_hash IS 'HMAC-hashed user identifier for privacy.';
COMMENT ON COLUMN public.users.full_name IS 'Full legal name of the user.';
COMMENT ON COLUMN public.users.email IS 'User email address (optional, unique if present).';
COMMENT ON COLUMN public.users.phone_number IS '8-digit Botswana phone number (unique).';
COMMENT ON COLUMN public.users.omang_id IS 'Botswana Omang national ID (unique, 9 chars).';
COMMENT ON COLUMN public.users.biometric_hash IS 'Hash of biometric data (optional).';
COMMENT ON COLUMN public.users.gender IS 'Gender (Male or Female).';
COMMENT ON COLUMN public.users.password_hash IS 'Password hash (if using local auth).';
COMMENT ON COLUMN public.users.locale IS 'Preferred language/locale (e.g., en, tn).';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when user was created.';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when user was last updated.';

CREATE UNIQUE INDEX idx_users_did ON public.users(did);
CREATE UNIQUE INDEX idx_users_user_hash ON public.users(user_hash);
CREATE UNIQUE INDEX idx_users_phone_number ON public.users(phone_number);
CREATE UNIQUE INDEX idx_users_omang_id ON public.users(omang_id);

-- 2. ALIASES TABLE
CREATE TABLE public.aliases (
    alias_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    alias_type VARCHAR(10) NOT NULL CHECK (alias_type IN ('email','phone','username','qr','biometric')),
    alias_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (alias_type, alias_value)
);
COMMENT ON TABLE public.aliases IS 'Maps user-friendly handles (email, phone, username, QR, biometric) to a single DID.';
COMMENT ON COLUMN public.aliases.alias_id IS 'Unique alias identifier.';
COMMENT ON COLUMN public.aliases.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.aliases.alias_type IS 'Type of alias (email, phone, etc).';
COMMENT ON COLUMN public.aliases.alias_value IS 'Value of the alias (e.g., email address, phone number).';
COMMENT ON COLUMN public.aliases.is_primary IS 'Whether this alias is the user''s primary handle.';
COMMENT ON COLUMN public.aliases.created_at IS 'Timestamp when alias was created.';

CREATE INDEX idx_aliases_did ON public.aliases(did);
CREATE UNIQUE INDEX idx_aliases_type_value ON public.aliases(alias_type, alias_value);

-- 3. CREDENTIALS TABLE
CREATE TABLE public.credentials (
    cred_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id)
);
COMMENT ON TABLE public.credentials IS 'Stores external authentication tokens or local password hashes.';
COMMENT ON COLUMN public.credentials.cred_id IS 'Unique credential identifier.';
COMMENT ON COLUMN public.credentials.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.credentials.provider IS 'Auth provider (e.g., Google, Facebook, local).';
COMMENT ON COLUMN public.credentials.provider_user_id IS 'User ID at the provider.';
COMMENT ON COLUMN public.credentials.access_token IS 'Access token for provider.';
COMMENT ON COLUMN public.credentials.refresh_token IS 'Refresh token for provider.';
COMMENT ON COLUMN public.credentials.expires_at IS 'Token expiry timestamp.';
COMMENT ON COLUMN public.credentials.created_at IS 'Timestamp when credential was created.';

CREATE INDEX idx_credentials_did ON public.credentials(did);
CREATE UNIQUE INDEX idx_credentials_provider_user ON public.credentials(provider, provider_user_id);

-- 4. LEDGER_EVENTS TABLE
CREATE TABLE public.ledger_events (
    event_id BIGSERIAL PRIMARY KEY,
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('TRANSFER_OUT','TRANSFER_IN','UTILITY_PAYMENT','LOAN_DISBURSE','LOAN_REPAYMENT','MERCHANT_FEE','DISBURSEMENT')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    counterparty_did TEXT REFERENCES public.users(did),
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.ledger_events IS 'Universal, normalized financial log for every money-related event.';
COMMENT ON COLUMN public.ledger_events.event_id IS 'Unique event identifier.';
COMMENT ON COLUMN public.ledger_events.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.ledger_events.event_type IS 'Type of ledger event.';
COMMENT ON COLUMN public.ledger_events.amount IS 'Amount involved in the event.';
COMMENT ON COLUMN public.ledger_events.counterparty_did IS 'DID of the counterparty (if any).';
COMMENT ON COLUMN public.ledger_events.metadata IS 'Additional event metadata.';
COMMENT ON COLUMN public.ledger_events.timestamp IS 'Timestamp of the event.';
COMMENT ON COLUMN public.ledger_events.created_at IS 'Timestamp when event was recorded.';

CREATE INDEX idx_ledger_events_did ON public.ledger_events(did);
CREATE INDEX idx_ledger_events_timestamp ON public.ledger_events(timestamp);

-- 5. TRANSACTIONS TABLE
CREATE TABLE public.transactions (
    txn_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_did TEXT NOT NULL REFERENCES public.users(did),
    to_did TEXT NOT NULL REFERENCES public.users(did),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    fee_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('USSD','QR','BANK_API','CARD')),
    alias_used VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING','COMPLETED','FAILED','ON_HOLD')),
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.transactions IS 'Denormalized table for fast balance calculations and transfer tracking.';
COMMENT ON COLUMN public.transactions.txn_id IS 'Unique transaction identifier.';
COMMENT ON COLUMN public.transactions.from_did IS 'Sender DID.';
COMMENT ON COLUMN public.transactions.to_did IS 'Recipient DID.';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount.';
COMMENT ON COLUMN public.transactions.fee_amount IS 'Transaction fee.';
COMMENT ON COLUMN public.transactions.channel IS 'Channel used for transaction.';
COMMENT ON COLUMN public.transactions.alias_used IS 'Alias used for this transaction.';
COMMENT ON COLUMN public.transactions.status IS 'Transaction status.';
COMMENT ON COLUMN public.transactions.initiated_at IS 'When transaction was initiated.';
COMMENT ON COLUMN public.transactions.completed_at IS 'When transaction was completed.';
COMMENT ON COLUMN public.transactions.created_at IS 'Timestamp when transaction was created.';

CREATE INDEX idx_transactions_from_did ON public.transactions(from_did);
CREATE INDEX idx_transactions_to_did ON public.transactions(to_did);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- 6. CREDIT_SCORE TABLE
CREATE TABLE public.credit_score (
    did TEXT PRIMARY KEY REFERENCES public.users(did) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.credit_score IS 'Aggregated credit score for each DID.';
COMMENT ON COLUMN public.credit_score.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.credit_score.score IS 'Credit score (0-1000).';
COMMENT ON COLUMN public.credit_score.last_updated IS 'Timestamp when score was last updated.';

CREATE INDEX idx_credit_score_score ON public.credit_score(score);

-- 7. FRAUD_SCORE TABLE
CREATE TABLE public.fraud_score (
    did TEXT PRIMARY KEY REFERENCES public.users(did) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.fraud_score IS 'Real-time fraud risk score for each DID.';
COMMENT ON COLUMN public.fraud_score.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.fraud_score.score IS 'Fraud risk score (0-100).';
COMMENT ON COLUMN public.fraud_score.last_updated IS 'Timestamp when score was last updated.';

CREATE INDEX idx_fraud_score_score ON public.fraud_score(score);

-- 8. FRAUD_EVENTS TABLE
CREATE TABLE public.fraud_events (
    fraud_event_id BIGSERIAL PRIMARY KEY,
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('OTP_FAILURE','SIM_SWAP','MULTI_IP','RAPID_TRANSFER','SUS_LOGIN')),
    device_id VARCHAR(64),
    ip_address VARCHAR(45),
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.fraud_events IS 'Records every suspicious activity for fraud scoring.';
COMMENT ON COLUMN public.fraud_events.fraud_event_id IS 'Unique fraud event identifier.';
COMMENT ON COLUMN public.fraud_events.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.fraud_events.event_type IS 'Type of fraud event.';
COMMENT ON COLUMN public.fraud_events.device_id IS 'Device identifier.';
COMMENT ON COLUMN public.fraud_events.ip_address IS 'IP address involved.';
COMMENT ON COLUMN public.fraud_events.metadata IS 'Additional event metadata.';
COMMENT ON COLUMN public.fraud_events.timestamp IS 'Timestamp of the event.';
COMMENT ON COLUMN public.fraud_events.created_at IS 'Timestamp when event was recorded.';

CREATE INDEX idx_fraud_events_did ON public.fraud_events(did);
CREATE INDEX idx_fraud_events_timestamp ON public.fraud_events(timestamp);

-- 9. UTILITY_PAYMENTS TABLE
CREATE TABLE public.utility_payments (
    utility_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    payment_amount NUMERIC(12,2) NOT NULL CHECK (payment_amount >= 0),
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('BILL_PAYMENT','PREPAID_TOPUP')),
    transaction_ref VARCHAR(100),
    payment_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    location VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.utility_payments IS 'Records all utility or telco payments.';
COMMENT ON COLUMN public.utility_payments.utility_id IS 'Unique utility payment identifier.';
COMMENT ON COLUMN public.utility_payments.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.utility_payments.provider IS 'Utility or telco provider.';
COMMENT ON COLUMN public.utility_payments.payment_amount IS 'Amount paid.';
COMMENT ON COLUMN public.utility_payments.payment_type IS 'Type of payment.';
COMMENT ON COLUMN public.utility_payments.transaction_ref IS 'Reference for the transaction.';
COMMENT ON COLUMN public.utility_payments.payment_time IS 'Time of payment.';
COMMENT ON COLUMN public.utility_payments.location IS 'Location of payment.';
COMMENT ON COLUMN public.utility_payments.created_at IS 'Timestamp when payment was recorded.';

CREATE INDEX idx_utility_payments_did ON public.utility_payments(did);
CREATE INDEX idx_utility_payments_provider ON public.utility_payments(provider);

-- 10. MERCHANT_FEES TABLE
CREATE TABLE public.merchant_fees (
    fee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    txn_id UUID NOT NULL REFERENCES public.transactions(txn_id) ON DELETE CASCADE,
    fee_amount NUMERIC(12,2) NOT NULL CHECK (fee_amount >= 0),
    paid_out BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.merchant_fees IS 'Records fees charged to each merchant.';
COMMENT ON COLUMN public.merchant_fees.fee_id IS 'Unique merchant fee identifier.';
COMMENT ON COLUMN public.merchant_fees.merchant_did IS 'Merchant DID.';
COMMENT ON COLUMN public.merchant_fees.txn_id IS 'Transaction ID associated with the fee.';
COMMENT ON COLUMN public.merchant_fees.fee_amount IS 'Fee amount.';
COMMENT ON COLUMN public.merchant_fees.paid_out IS 'Whether the fee has been paid out.';
COMMENT ON COLUMN public.merchant_fees.created_at IS 'Timestamp when fee was recorded.';

CREATE INDEX idx_merchant_fees_merchant_did ON public.merchant_fees(merchant_did);

-- 11. SOCIAL_GRANT_DISBURSEMENTS TABLE
CREATE TABLE public.social_grant_disbursements (
    disbursement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING','COMPLETED','ON_HOLD')),
    disbursement_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.social_grant_disbursements IS 'Government or aid disbursements to users.';
COMMENT ON COLUMN public.social_grant_disbursements.disbursement_id IS 'Unique disbursement identifier.';
COMMENT ON COLUMN public.social_grant_disbursements.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.social_grant_disbursements.amount IS 'Disbursement amount.';
COMMENT ON COLUMN public.social_grant_disbursements.status IS 'Disbursement status.';
COMMENT ON COLUMN public.social_grant_disbursements.disbursement_date IS 'Scheduled date for disbursement.';
COMMENT ON COLUMN public.social_grant_disbursements.completed_at IS 'When disbursement was completed.';
COMMENT ON COLUMN public.social_grant_disbursements.created_at IS 'Timestamp when disbursement was recorded.';

CREATE INDEX idx_social_grant_disbursements_did ON public.social_grant_disbursements(did);
CREATE INDEX idx_social_grant_disbursements_status ON public.social_grant_disbursements(status);

-- 12. LOAN_APPLICATIONS TABLE
CREATE TABLE public.loan_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    amount_requested NUMERIC(12,2) NOT NULL CHECK (amount_requested > 0),
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    interest_rate NUMERIC(4,2) NOT NULL CHECK (interest_rate >= 0),
    proposed_monthly_payment NUMERIC(12,2) NOT NULL CHECK (proposed_monthly_payment >= 0),
    status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','DISBURSED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decision_at TIMESTAMPTZ,
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.loan_applications IS 'Micro-loan requests and underwriting status.';
COMMENT ON COLUMN public.loan_applications.application_id IS 'Unique loan application identifier.';
COMMENT ON COLUMN public.loan_applications.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.loan_applications.amount_requested IS 'Requested loan amount.';
COMMENT ON COLUMN public.loan_applications.term_months IS 'Loan term in months.';
COMMENT ON COLUMN public.loan_applications.interest_rate IS 'Interest rate for the loan.';
COMMENT ON COLUMN public.loan_applications.proposed_monthly_payment IS 'Proposed monthly payment.';
COMMENT ON COLUMN public.loan_applications.status IS 'Application status.';
COMMENT ON COLUMN public.loan_applications.requested_at IS 'When application was submitted.';
COMMENT ON COLUMN public.loan_applications.decision_at IS 'When application was decided.';
COMMENT ON COLUMN public.loan_applications.disbursed_at IS 'When loan was disbursed.';
COMMENT ON COLUMN public.loan_applications.created_at IS 'Timestamp when application was recorded.';

CREATE INDEX idx_loan_applications_did ON public.loan_applications(did);
CREATE INDEX idx_loan_applications_status ON public.loan_applications(status);

-- 13. LOAN_REPAYMENTS TABLE
CREATE TABLE public.loan_repayments (
    repayment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.loan_applications(application_id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    due_amount NUMERIC(12,2) NOT NULL CHECK (due_amount > 0),
    paid_date DATE,
    paid_amount NUMERIC(12,2),
    status VARCHAR(10) NOT NULL CHECK (status IN ('DUE','PAID','LATE','MISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.loan_repayments IS 'Tracks each scheduled repayment and payment status for every loan.';
COMMENT ON COLUMN public.loan_repayments.repayment_id IS 'Unique repayment identifier.';
COMMENT ON COLUMN public.loan_repayments.application_id IS 'Foreign key to loan_applications.';
COMMENT ON COLUMN public.loan_repayments.due_date IS 'Scheduled due date.';
COMMENT ON COLUMN public.loan_repayments.due_amount IS 'Amount due.';
COMMENT ON COLUMN public.loan_repayments.paid_date IS 'Date payment was made.';
COMMENT ON COLUMN public.loan_repayments.paid_amount IS 'Amount paid.';
COMMENT ON COLUMN public.loan_repayments.status IS 'Repayment status.';
COMMENT ON COLUMN public.loan_repayments.created_at IS 'Timestamp when repayment was recorded.';

CREATE INDEX idx_loan_repayments_application_id ON public.loan_repayments(application_id);
CREATE INDEX idx_loan_repayments_status ON public.loan_repayments(status);

-- 14. AI_CHAT_LOGS TABLE
CREATE TABLE public.ai_chat_logs (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    from_role VARCHAR(10) NOT NULL CHECK (from_role IN ('user','bot')),
    message_text TEXT NOT NULL,
    language VARCHAR(5) NOT NULL CHECK (language IN ('en','tn','kg')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.ai_chat_logs IS 'Stores every user/AI message for the Money Companion.';
COMMENT ON COLUMN public.ai_chat_logs.message_id IS 'Unique chat message identifier.';
COMMENT ON COLUMN public.ai_chat_logs.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.ai_chat_logs.from_role IS 'Sender role (user or bot).';
COMMENT ON COLUMN public.ai_chat_logs.message_text IS 'Message text.';
COMMENT ON COLUMN public.ai_chat_logs.language IS 'Message language.';
COMMENT ON COLUMN public.ai_chat_logs.timestamp IS 'Timestamp of the message.';
COMMENT ON COLUMN public.ai_chat_logs.metadata IS 'Additional message metadata.';
COMMENT ON COLUMN public.ai_chat_logs.created_at IS 'Timestamp when message was recorded.';

CREATE INDEX idx_ai_chat_logs_did ON public.ai_chat_logs(did);
CREATE INDEX idx_ai_chat_logs_timestamp ON public.ai_chat_logs(timestamp);

-- 15. SIMULATION_REQUESTS TABLE
CREATE TABLE public.simulation_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    simulation_type VARCHAR(20) NOT NULL CHECK (simulation_type IN ('loan_scenario','business_startup','emergency')),
    parameters JSONB NOT NULL,
    result JSONB,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.simulation_requests IS 'Records inputs and outputs of Digital-Twin simulations for each user.';
COMMENT ON COLUMN public.simulation_requests.request_id IS 'Unique simulation request identifier.';
COMMENT ON COLUMN public.simulation_requests.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.simulation_requests.simulation_type IS 'Type of simulation.';
COMMENT ON COLUMN public.simulation_requests.parameters IS 'Simulation input parameters.';
COMMENT ON COLUMN public.simulation_requests.result IS 'Simulation result output.';
COMMENT ON COLUMN public.simulation_requests.requested_at IS 'When simulation was requested.';
COMMENT ON COLUMN public.simulation_requests.completed_at IS 'When simulation was completed.';
COMMENT ON COLUMN public.simulation_requests.created_at IS 'Timestamp when request was recorded.';

CREATE INDEX idx_simulation_requests_did ON public.simulation_requests(did);
CREATE INDEX idx_simulation_requests_type ON public.simulation_requests(simulation_type);

-- 16. USSD_SESSIONS TABLE
CREATE TABLE public.ussd_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number CHAR(8) NOT NULL REFERENCES public.users(phone_number) ON DELETE CASCADE,
    current_menu VARCHAR(50) NOT NULL,
    temp_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_interaction TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE public.ussd_sessions IS 'Tracks USSD state machine per session for users without smartphones.';
COMMENT ON COLUMN public.ussd_sessions.session_id IS 'Unique USSD session identifier.';
COMMENT ON COLUMN public.ussd_sessions.phone_number IS 'Foreign key to users.phone_number.';
COMMENT ON COLUMN public.ussd_sessions.current_menu IS 'Current menu in the USSD flow.';
COMMENT ON COLUMN public.ussd_sessions.temp_data IS 'Temporary session data in JSON.';
COMMENT ON COLUMN public.ussd_sessions.initiated_at IS 'When session was started.';
COMMENT ON COLUMN public.ussd_sessions.last_interaction IS 'Last interaction timestamp.';
COMMENT ON COLUMN public.ussd_sessions.is_active IS 'Whether the session is active.';

CREATE INDEX idx_ussd_sessions_session_id ON public.ussd_sessions(session_id);
CREATE INDEX idx_ussd_sessions_phone_number ON public.ussd_sessions(phone_number);

-- 17. MESSAGES_QUEUE TABLE
CREATE TABLE public.messages_queue (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL REFERENCES public.users(did) ON DELETE CASCADE,
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('SMS','EMAIL','PUSH')),
    subject VARCHAR(255),
    body TEXT NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.messages_queue IS 'Queue for outbound notifications to be sent via SMS, email, or push.';
COMMENT ON COLUMN public.messages_queue.message_id IS 'Unique message identifier.';
COMMENT ON COLUMN public.messages_queue.did IS 'Foreign key to users.did.';
COMMENT ON COLUMN public.messages_queue.channel IS 'Notification channel.';
COMMENT ON COLUMN public.messages_queue.subject IS 'Message subject.';
COMMENT ON COLUMN public.messages_queue.body IS 'Message body.';
COMMENT ON COLUMN public.messages_queue.is_sent IS 'Whether the message has been sent.';
COMMENT ON COLUMN public.messages_queue.scheduled_at IS 'When message is scheduled to be sent.';
COMMENT ON COLUMN public.messages_queue.sent_at IS 'When message was sent.';
COMMENT ON COLUMN public.messages_queue.created_at IS 'Timestamp when message was queued.';

CREATE INDEX idx_messages_queue_did ON public.messages_queue(did);
CREATE INDEX idx_messages_queue_is_sent ON public.messages_queue(is_sent);
CREATE INDEX idx_messages_queue_scheduled_at ON public.messages_queue(scheduled_at);

-- 18. AUDIT_LOGS TABLE
CREATE TABLE public.audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT REFERENCES public.users(did),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('LOGIN_SUCCESS','LOGIN_FAILURE','VIEW_BALANCE','SEND_MONEY','SIM_REQUEST','PROFILE_UPDATE')),
    action_details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.audit_logs IS 'Records key user actions for compliance and analytics.';
COMMENT ON COLUMN public.audit_logs.audit_id IS 'Unique audit log identifier.';
COMMENT ON COLUMN public.audit_logs.did IS 'Foreign key to users.did (nullable for system actions).';
COMMENT ON COLUMN public.audit_logs.action_type IS 'Type of user action.';
COMMENT ON COLUMN public.audit_logs.action_details IS 'Additional action details in JSON.';
COMMENT ON COLUMN public.audit_logs.timestamp IS 'Timestamp of the action.';
COMMENT ON COLUMN public.audit_logs.created_at IS 'Timestamp when log was recorded.';

CREATE INDEX idx_audit_logs_did ON public.audit_logs(did);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- End of PayFlex schema
