# PayFLex

## Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

💬 AI Chatbot Integration

PayFLex integrates an AI-driven chatbot using React Native WebView, providing seamless in-app interaction. To enable this feature, install WebView:

🚀 Installation
To add WebView support, install the necessary package:

```bash
npm install react-native-webview
```

### Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

### Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Row-Level Security (RLS) Policies for Backend

Below are common RLS policies to implement for a financial/payments backend:

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

## Localization for Botswana

- **Currency**: All amounts use "P" (Botswana Pula).
- **Phone Numbers**: All phone numbers must be in the format `+2677XXXXXXX` (Botswana mobile).
