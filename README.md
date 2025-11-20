# Lensor Mobile App

Mobile app for Lensor platform - designed with the same style and colors as the web version.

## 🎨 Features

### ✅ Completed

- **Theme System**: Dark/Light mode with web-matching colors (#8c4aea primary)
- **Multi-language**: EN, VI, JP support with i18next
- **API Infrastructure**: Axios client with authentication
- **State Management**: Zustand stores (cart, chat, user, wallet)
- **UI Components**: Card, Button, Avatar, Input, Loading, etc.
- **5 Tabs Navigation**:
  - 📱 **Forum** - Full posts, likes, comments, follow users
  - 🛒 **Marketplace** - Product listings with cart integration
  - 💬 **Messages** - Real-time chat with Socket.io
  - 🔔 **Notifications** - User notifications
  - 👤 **Profile** - User profile with theme toggle

### 📱 Main Features

- **Forum**: Posts with likes, comments, follow users, camera/lens metadata
- **Marketplace**: Browse products, view details, add to cart
- **Chat**: Real-time messaging with Socket.io
- **Wallet**: View balance, transaction history
- **Orders**: Sold orders management, withdrawal requests
- **Authentication**: OAuth with Supabase (Google login)

## 🚀 Getting Started

### Prerequisites

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-url
EXPO_PUBLIC_API_PREFIX=/api/v1
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run Development

```bash
npm start
# or
npm run ios
npm run android
```

## 📁 Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation (5 tabs)
│   ├── chat-detail/       # Chat conversation screens
│   ├── product-details/   # Product detail screens
│   ├── checkout.tsx       # Checkout flow
│   ├── wallet.tsx         # Wallet management
│   ├── withdrawal.tsx     # Withdrawal requests
│   ├── sold-orders.tsx    # Seller orders
│   └── _layout.tsx        # Root layout
├── components/
│   ├── ui/                # Reusable components
│   ├── cart/              # Cart components
│   ├── forum/             # Forum components
│   ├── marketplace/       # Product components
│   └── empty/             # Empty states
├── lib/
│   ├── api/               # API clients
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utilities (date, status colors)
├── stores/                # Zustand state management
├── types/                 # TypeScript definitions
├── contexts/              # React contexts (Theme)
└── i18n/                  # Internationalization
```

## 🎨 Design System

### Colors (synced with web)

- **Primary**: `#8c4aea` (Light) / `#9d5eff` (Dark)
- **Background**: White / `#0d1117`
- **Card**: White / `#161b22`

### Spacing & Typography

- Spacing: xs(4) sm(8) md(16) lg(24) xl(32) xxl(48)
- Border Radius: sm(8) md(12) lg(16) xl(20)
- Font Sizes: xs(12) sm(14) md(16) lg(18) xl(20)

## 🔧 Tech Stack

- **Framework**: Expo / React Native
- **Router**: Expo Router (file-based)
- **State**: Zustand
- **API**: Axios
- **Real-time**: Socket.io
- **Auth**: Supabase
- **i18n**: react-i18next
- **UI**: Custom components with Lucide icons

## 🌍 Internationalization

```typescript
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("Tabs.forum"); // Localized text
```

## 📝 Code Quality

- ✅ TypeScript strict mode
- ✅ Functional components with hooks
- ✅ Clean, organized file structure
- ✅ Reusable utility functions
- ✅ No console.log in production code
- ✅ Optimized with React.memo where needed

## 🎯 Performance

- Optimistic UI updates
- Parallel API calls with Promise.all
- Image optimization and error handling
- Pull-to-refresh on all list screens

## 🎉 Credits

Built with ❤️ for Lensor platform
"# lensor-mobile-v2" 
