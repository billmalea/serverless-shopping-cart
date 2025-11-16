# Serverless Shopping Cart

![Architecture](./serverless-shopping-cart.png)

A **production-ready, serverless e-commerce shopping cart API** built with **AWS SAM**, **TypeScript**, and **AWS Lambda**. This project demonstrates modern serverless best practices, including event-driven architecture, asynchronous processing, authorization, and real-time data aggregation.

---

## About

**Serverless Shopping Cart** is a cloud-native REST API for managing shopping carts in e-commerce applications. Built entirely on AWS managed services (Lambda, API Gateway, DynamoDB, SQS, Cognito), it demonstrates serverless architecture patterns:

- **Event-driven workflows** via DynamoDB Streams and SQS queues
- **Asynchronous processing** for long-running operations (delete, migrate)
- **Fine-grained authorization** with Cognito (checkout & migration endpoints)
- **Real-time aggregation** and analytics from DynamoDB Stream events
- **Infrastructure as Code** with AWS SAM for reproducible deployments
- **Production-ready** with comprehensive logging, error handling, and monitoring

### Key Features

- ✅ **REST API endpoints** for cart operations (add, update, list, checkout, migrate)
- ✅ **DynamoDB persistence** with stream-based triggers
- ✅ **Asynchronous delete/migration** via SQS queues
- ✅ **Real-time data aggregation** from DynamoDB Streams
- ✅ **Cognito-protected endpoints** for checkout and migration
- ✅ **Product service integration** for catalog lookups
- ✅ **TypeScript with full type safety** across all Lambda handlers
- ✅ **Unit tests and Jest integration**
- ✅ **CI/CD ready** with GitHub Actions workflow
- ✅ **AWS SAM infrastructure as code**

### Technology Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 18.x |
| **Language** | TypeScript |
| **IaC Framework** | AWS SAM (Serverless Application Model) |
| **Compute** | AWS Lambda |
| **API** | Amazon API Gateway |
| **Database** | Amazon DynamoDB (with Streams) |
| **Messaging** | Amazon SQS |
| **Auth** | Amazon Cognito |
| **Observability** | CloudWatch (Logs, Metrics) |
| **Testing** | Jest |
| **Build** | npm, TypeScript Compiler |
| **CI/CD** | GitHub Actions |

### Tags

`#serverless` `#aws` `#lambda` `#typescript` `#sam` `#api` `#dynamodb` `#sqs` `#cognito` `#event-driven` `#infrastructure-as-code` `#production-ready` `#cloud-native` `#e-commerce`

---

## Frontend Integration

A companion **frontend application** is planned to demonstrate the API in action. Once the backend is complete, a simple web or mobile UI will be added in a `frontend/` directory to showcase:

- User authentication via Cognito
- Real-time cart updates
- Product browsing and cart management
- Checkout workflow
- Order history and aggregated data visualization

**Frontend technologies** (to be determined based on project needs):
- React, Vue.js, or Next.js for web UI
- Optional: React Native or Flutter for mobile demo
- Cognito SDK for authentication
- API client (Axios, Fetch) for backend integration

---

## Images

Screenshots from the demo frontend (place image files under `docs/screenshots/`):

- **Products page**

  ![Products screenshot](docs/screenshots/Screenshot%202025-11-17%20000155.png)

- **Checkout (simulated)**

  ![Checkout screenshot](docs/screenshots/Screenshot%202025-11-17%20000257.png)

If the images don't display, add the two files to `docs/screenshots/` with the exact filenames:

`Screenshot 2025-11-17 000155.png`

`Screenshot 2025-11-17 000257.png`


## Architecture

The shopping cart system is composed of the following AWS resources:

### Components

- **API Gateway**: Public REST endpoint; routes requests to Lambda functions and integrates with Cognito Authorizer.
- **Lambda Functions**:
  - `AddToCart` (POST /cart): Validates product via Product Service, writes cart item to DynamoDB.
  - `UpdateCart` (PUT /cart): Updates quantity/price of cart items.
  - `ListCart` (GET /cart/{userId}): Retrieves all items in user's cart.
  - `Checkout` (POST /cart/checkout): Initiates purchase (Cognito-protected).
  - `MigrateCart` (POST /cart/migrate): Migrates/merges cart state; posts to SQS (Cognito-protected).
  - `DeleteFromCart` (SQS Consumer): Processes async delete tasks from SQS queue.
  - `Aggregator` (DynamoDB Stream Consumer): Computes aggregated metrics and denormalized data.
- **DynamoDB**: Primary cart store; Stream enabled for change capture.
- **SQS Queue**: Decouples heavy delete/migration work.
- **Cognito Authorizer**: Protects sensitive endpoints.
- **Product Service**: External microservice for product metadata and validation.
- **CloudWatch**: Logs, metrics, and alarms.

### Data Flow

1. **User requests** → API Gateway
2. API Gateway **routes** to appropriate Lambda based on HTTP method/path
3. Lambda **validates** and **persists** to DynamoDB
4. DynamoDB Stream **triggers** Aggregator Lambda
5. Aggregator **computes** and **publishes** metrics to CloudWatch
6. For deletes/migrations: Lambda **posts to SQS**; Consumer Lambda **processes asynchronously**

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **AWS CLI** configured with credentials
- **AWS SAM CLI** (for local testing and deployment)
 - **AWS Cognito (optional)**: This project includes a Cognito User Pool created by SAM for protecting checkout and migration endpoints.
- **TypeScript knowledge** (recommended)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/billmalea/serverless-shopping-cart.git
cd serverless-shopping-cart
```

2. **Install dependencies**

```powershell
npm install
```

3. **Build TypeScript**

```powershell
npm run build
```

4. **Run unit tests**

```powershell
npm test
```

### Project Structure

```
serverless-shopping-cart/
├── src/
│   ├── handlers/
│   │   ├── addToCart.ts
│   │   ├── updateCart.ts
│   │   ├── listCart.ts
│   │   ├── checkoutCart.ts
│   │   ├── migrateCart.ts
│   │   ├── deleteFromCart.ts
│   │   └── aggregator.ts
│   ├── lib/
│   │   └── dynamo.ts              # DynamoDB helper functions
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   └── utils/
│       └── logger.ts              # Centralized logging
├── dist/                          # Compiled JavaScript (gitignored)
├── frontend/                      # Frontend application (React/Vue/Next.js)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page-level components
│   │   ├── services/              # API client and Cognito integration
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Helper functions
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                  # Frontend setup guide
├── template.yaml                  # SAM template
├── package.json
├── tsconfig.json
├── jest.config.js
├── .github/workflows/
│   └── ci.yml                     # GitHub Actions CI workflow
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Development

### Available Scripts

```powershell
# Build TypeScript to dist/
npm run build

# Run in development mode with file watching
npm run dev

# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Format code (if Prettier is configured)
npm run format

# Lint code (if ESLint is configured)
npm run lint
```

### Local Testing with SAM

Build and test Lambda functions locally:

```bash
sam build
sam local start-api
```

Then make requests:

```bash
curl -X POST http://localhost:3000/cart \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","productId":"prod-456","quantity":2}'
```

Product simulator
-----------------

This project includes a small product catalog simulator so you can test cart flows without a separate product microservice.

- List all products:

```bash
curl http://localhost:3000/products
```

- Get a single product by id:

```bash
curl http://localhost:3000/products/prod-001
```

The product endpoint is a simple in-memory catalog used for development and testing. Feel free to extend `src/handlers/products.ts` with more fields or to load data from a JSON file for larger catalogs.

### Cognito usage (dev)

The SAM template creates a `CartUserPool` and `CartUserPoolClient`. To run protected endpoint tests you can create a test user and obtain tokens using the included script:

PowerShell / bash example (requires AWS credentials with permissions to manage Cognito):

```powershell
# set environment variables from SAM outputs or AWS Console
$env:CART_USER_POOL_ID = "<your-user-pool-id>"
$env:CART_USER_POOL_CLIENT_ID = "<your-client-id>"

npx ts-node scripts/create-test-user.ts
```

The script prints `IdToken` and `AccessToken`. Call protected endpoints with the `Authorization` header:

```bash
curl -X POST https://<api-url>/cart/checkout \
  -H "Authorization: Bearer <AccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123"}'
```

Notes:
- The script uses admin APIs (`AdminCreateUser`, `AdminInitiateAuth`) and requires AWS credentials with sufficient permissions.
- For CI/tests, you can programmatically create/delete the test user and reuse the tokens.

---

## Deployment

### Deploy to AWS

1. **Build SAM application**

```bash
sam build
```

2. **Deploy (guided mode, first time)**

```bash
sam deploy --guided
```

Follow prompts to specify stack name, AWS region, and other options.

3. **Deploy (subsequent updates)**

```bash
sam deploy
```

### Outputs

After deployment, SAM outputs:
- **API Endpoint URL** — use this to call your cart API
- **Stack Name** — for reference in AWS Console
- **Region** — AWS region where resources were created

---

## Testing & Quality

### Unit Tests

Tests are located in `src/__tests__/` and use **Jest**:

```powershell
npm test
```

### Coverage

```powershell
npm test -- --coverage
```

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on each push:
- Installs dependencies
- Builds TypeScript
- Runs linter (if configured)
- Runs unit tests
- Reports coverage (optional)

---

## Best Practices & Considerations

### Security

- ✅ **Cognito Authorization** for protected endpoints (checkout, migrate)
- ✅ **Least-privilege IAM roles** for each Lambda function
- ✅ **DynamoDB encryption at rest** (KMS)
- ✅ **VPC endpoints** for DynamoDB/SQS (if private infrastructure)
- ✅ **API Gateway throttling** and WAF rules to prevent abuse
- ⚠️ **Validate & sanitize** all user inputs in Lambda handlers

### Performance & Scalability

- ✅ **DynamoDB on-demand billing** (auto-scaling) or provisioned with auto-scaling
- ✅ **Lambda concurrent execution limits** — set based on expected load
- ✅ **SQS visibility timeout & DLQ** for dead-letter handling
- ✅ **DynamoDB Streams consumer** with batching for efficient processing
- ✅ **Product service caching** (DAX or in-Lambda cache) to reduce external calls
- ⚠️ Avoid **hot partitions** — ensure partition key design includes user-level sharding if needed

### Observability

- ✅ **CloudWatch Logs** — all Lambda functions log to CloudWatch
- ✅ **X-Ray Tracing** — trace Lambda → DynamoDB → Product service calls
- ✅ **CloudWatch Metrics** — custom metrics for business KPIs (carts created, items added, revenue)
- ✅ **CloudWatch Alarms** — alert on Lambda errors, throttles, DynamoDB hot partitions
- 📊 **Structured Logging** — use JSON format with request ID, user ID for easy querying

### Cost Optimization

- ✅ Use **DynamoDB on-demand** for unpredictable traffic
- ✅ **Lambda memory tuning** — balance cost and execution time
- ✅ **Batch operations** where possible (e.g., batch writes to DynamoDB)
- ✅ **S3 lifecycle policies** for logs and backups
- ✅ **Reserved Capacity** for predictable workloads

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **SAM CLI not found** | Install: `pip install aws-sam-cli` |
| **DynamoDB table not created** | Run `sam deploy` to provision infrastructure |
| **Cognito auth failures** | Verify Cognito User Pool ID and JWT token validity |
| **SQS messages not processing** | Check Lambda consumer concurrency; ensure SQS permissions in IAM role |
| **High Lambda cold start latency** | Increase memory allocation; consider Lambda@Edge or provisioned concurrency |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Reporting issues
- Submitting pull requests
- Code style and commit conventions
- Testing requirements

---

## Code of Conduct

This project adheres to the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold its principles of respect, inclusivity, and professionalism.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Authors

- **Bill Malea** — [@billmalea](https://github.com/billmalea)

---

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** November 2025

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **AWS CLI** configured with credentials
- **AWS SAM CLI** (for local testing and deployment)
- **TypeScript knowledge** (recommended)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/billmalea/serverless-shopping-cart.git
cd serverless-shopping-cart
```

2. **Install dependencies**

```powershell

1. Install dependencies

```powershell
npm install
```

2. Build

```powershell
npm run build
```

3. Run unit tests

```powershell
npm test
```

Developer scripts (examples)

- npm run build — compile TypeScript to `dist/`
- npm run dev — run in dev mode with auto-reload
- npm test — run Jest tests

Next steps

- Run `npm install` locally to install dev dependencies.
- Add SAM template and resource-specific code when you're ready. This scaffold is intentionally minimal so you can adapt conventions.