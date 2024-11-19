import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SENDGRID_TEMPLATE_INVITATION_SENT,
  SENDGRID_TEMPLATE_ORDER_PLACED_ID,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
  COOKIE_DOMAIN,
  S3_URL,
  S3_BUCKET,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_PREFIX,
} from '@/lib/constants';

loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: true,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    admin_cors: ADMIN_CORS?.split(',') || [],
    store_cors: STORE_CORS?.split(',') || [],
    auth_cors: AUTH_CORS?.split(',') || [],
    cookie_options: {
      domain: COOKIE_DOMAIN || undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 * 99, // 99 year
    },
    http: {
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [{
          resolve: '@medusajs/notification-sendgrid',
          id: 'sendgrid',
          options: {
            channels: ['email'],
            api_key: SENDGRID_API_KEY,
            from: SENDGRID_FROM_EMAIL,
            templates: {
              staff_invitation_template: SENDGRID_TEMPLATE_INVITATION_SENT
            }
          }
        }]
      }
    },
    {
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL
      }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        }
      }
    },
    {
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      key: Modules.FILE,
      resolve: "@medusajs/medusa/file",
      providers: [
        {
          resolve: "@medusajs/medusa-file-s3",
          id: "s3",
          options: {
            s3_url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`,
            access_key_id: S3_ACCESS_KEY_ID,
            bucket: S3_BUCKET,
            region: S3_REGION,
            secret_access_key: S3_SECRET_ACCESS_KEY,
            prefix: S3_PREFIX,
          },
        }
      ]
    }
  ],
  plugins: [
    // Plugins
  ]
};

export default defineConfig(medusaConfig);
