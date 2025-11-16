# Frontend - Serverless Shopping Cart

This directory will contain the frontend application for the Serverless Shopping Cart project.

## Overview

The frontend demonstrates the backend REST API in action, providing a user-friendly interface for:
- Authentication (via Amazon Cognito)
- Product browsing
- Shopping cart management (add, update, remove items)
- Checkout workflow
- Order history and tracking

## Planned Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components
│   ├── services/            # API client and Cognito integration
│   ├── types/               # TypeScript types and interfaces
│   ├── utils/               # Helper functions
│   └── App.tsx              # Root component
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── .env.example             # Environment variables template
└── README.md
```

## Technology Stack (TBD)

- **UI Framework**: React, Vue.js, or Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Material-UI, or similar
- **State Management**: Context API, Redux, or Zustand
- **API Client**: Axios or Fetch API
- **Authentication**: Cognito SDK
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite or Create React App

## Getting Started (When Ready)

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS Cognito User Pool credentials

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env.local` file based on `.env.local.example` (already present in the repo). Example values are provided in `.env.local.example`.

Notes about CORS and local development:

- The backend API (API Gateway) must return CORS headers for browser clients. For production you should enable CORS in the SAM template or API Gateway configuration. We also provide a development proxy so you can iterate locally without changing AWS infra.

- Development (recommended): use Vite's proxy (already configured) so the frontend calls `/api/*` and Vite forwards requests to the deployed API. This avoids CORS preflight issues during development.

	Steps:

	1. Copy `.env.local.example` to `.env.local` and fill in your Cognito domain and client id. By default `VITE_API_URL` is `/api/` which enables the proxy.
	2. Run `npm run dev` and open `http://localhost:3000`.

- Production: enable CORS on the API by adding appropriate `Cors` configuration to the SAM template (or configure API Gateway) and deploy. The SAM template in the repo now includes a CORS block allowing `http://localhost:3000`; change this to your production origin before deploying.

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Local dev notes (CORS & proxy)

- The frontend uses a Vite dev proxy that forwards `/api/*` to your deployed API Gateway so you don't need to change backend CORS during development. See `vite.config.js`.
- For production you should enable CORS on the API Gateway (SAM `Api` resource). A development-friendly CORS example has been added to `template.yaml` allowing `http://localhost:3000`.
- Use `frontend/.env.local.example` as a starting point to set `VITE_API_URL`, Cognito domain and client id.

### Build

```bash
npm run build
```

Produces optimized production build in `dist/`

### Deploy

Frontend can be deployed to:
- **AWS Amplify**: Simple serverless hosting with CI/CD
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Vercel / Netlify**: Third-party serverless platforms
- **Any static host**: HTML, JS, CSS are standalone

## API Integration

The frontend communicates with the backend via the REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cart` | POST | Add item to cart |
| `/cart` | PUT | Update cart item |
| `/cart/{userId}` | GET | List cart items |
| `/cart/checkout` | POST | Checkout (requires auth) |
| `/cart/migrate` | POST | Migrate cart (requires auth) |

See the backend [README](../README.md#architecture) for full API documentation.

## Authentication Flow

1. User logs in via Cognito
2. Frontend receives JWT token
3. Token attached to all API requests via `Authorization: Bearer <token>` header
4. Backend validates token; Cognito Authorizer grants/denies access
5. Protected endpoints (checkout, migrate) require valid token

## Features to Implement

- [ ] User registration and login
- [ ] Product catalog display
- [ ] Add/update/remove cart items
- [ ] Real-time cart total calculation
- [ ] Checkout flow with payment integration
- [ ] Order confirmation
- [ ] Order history view
- [ ] Admin dashboard (optional)

## Testing

```bash
npm test                    # Run unit tests
npm run test:coverage       # Generate coverage report
npm run test:e2e            # Run end-to-end tests (if configured)
```

## Performance Optimization

- Lazy load routes and components
- Cache API responses
- Use CDN for static assets
- Optimize images and bundles
- Monitor Core Web Vitals

## Contributing

Follow the backend's [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines. Frontend code should:
- Use TypeScript with strict type checking
- Follow the project's code style and naming conventions
- Include unit tests for new components and utilities
- Be documented with comments where appropriate

## License

Same as the main project: [MIT License](../LICENSE)
