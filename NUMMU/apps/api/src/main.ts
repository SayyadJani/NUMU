import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Cookie parser for secure HttpOnly cookie handling
  const cookieMiddleware =
    typeof cookieParser === 'function'
      ? cookieParser
      : ((cookieParser as unknown as { default?: typeof cookieParser }).default || cookieParser);
  app.use(cookieMiddleware());

  // Prefix all routes with /api/v1
  app.setGlobalPrefix('api/v1');

  // Auto-validation pipeline using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS with credentials (supports both student web app on :3000 and admin console on :3001)
  const corsOrigin = process.env['CORS_ORIGIN'] || 'http://localhost:3000,http://localhost:3001';
  const allowedOrigins = Array.from(
    new Set([
      ...corsOrigin.split(',').map((o) => o.trim()),
      'http://localhost:3000',
      'http://localhost:3001',
    ]),
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // CSRF Defense-in-Depth: Validate Origin, Referer, and Sec-Fetch-Site on state-changing requests
  app.use((req: any, res: any, next: any) => {
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (!isMutatingMethod) {
      return next();
    }

    const secFetchSite = req.headers['sec-fetch-site'];
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];
    const customHeader = req.headers['x-requested-with'];
    const authHeader = req.headers['authorization'];
    const hasAuthCookie = Boolean(
      req.cookies?.['numu_access_token'] || req.cookies?.['numu_refresh_token'],
    );
    const isAuthEndpoint = req.originalUrl?.includes('/api/v1/auth/');

    // 1. Browser Fetch Metadata check: reject cross-site state mutations unconditionally
    if (secFetchSite === 'cross-site') {
      logger.warn(`🚨 Blocked cross-site mutating request via Sec-Fetch-Site: ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        statusCode: 403,
        message: 'Cross-site request blocked by CSRF policy',
        error: 'Forbidden',
      });
    }

    // 2. If Origin header is present, validate against allowed origins
    if (origin) {
      if (!allowedOrigins.includes(origin)) {
        logger.warn(`🚨 Blocked mutating request from unauthorized origin: ${origin}`);
        return res.status(403).json({
          statusCode: 403,
          message: 'Cross-origin request blocked by CSRF policy',
          error: 'Forbidden',
        });
      }
      return next();
    }

    // 3. If Origin is missing, validate Referer
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (!allowedOrigins.includes(refererOrigin)) {
          logger.warn(`🚨 Blocked mutating request from unauthorized referer: ${refererOrigin}`);
          return res.status(403).json({
            statusCode: 403,
            message: 'Cross-origin request blocked by CSRF policy',
            error: 'Forbidden',
          });
        }
        return next();
      } catch {
        return res.status(403).json({
          statusCode: 403,
          message: 'Malformed Referer header rejected by CSRF policy',
          error: 'Forbidden',
        });
      }
    }

    // 4. Missing both Origin and Referer:
    // Allow non-browser API clients only if they present an explicit Authorization Bearer header
    // or custom client header (X-Requested-With) that browsers cannot forge cross-origin without preflight.
    const isExplicitNonBrowser = Boolean(authHeader?.startsWith('Bearer ') || customHeader === 'XMLHttpRequest');

    if (hasAuthCookie || isAuthEndpoint || !isExplicitNonBrowser) {
      logger.warn(`🚨 Blocked mutating request missing trusted Origin/Referer: ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        statusCode: 403,
        message: 'Origin or Referer verification required for state-changing requests',
        error: 'Forbidden',
      });
    }

    next();
  });

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('NUMU API')
    .setDescription('NUMU Developer Platform Core Backend API - Phase 3 DSA Engine & Content Management')
    .setVersion('3.0')
    .addTag('Health', 'System and database health checks')
    .addTag('Auth', 'Authentication, session management, and recovery')
    .addTag('Users', 'User management and administrative operations')
    .addTag('Profiles', 'User profile retrieval and updates')
    .addTag('Organizations', 'Multi-tenant organization membership and management')
    .addTag('Topics', 'DSA topic curriculum, categorization, and problem syllabus')
    .addTag('Problems', 'DSA problem repository, statement details, and catalog filters')
    .addTag('Submissions', 'Code submission, compilation, and evaluation pipeline')
    .addTag('Progress & Analytics', 'Student coding progress, topic mastery, and activity tracking')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token or rely on HttpOnly cookie numu_access_token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4000;
  await app.listen(port);

  logger.log(`🚀 NUMU API is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API documentation: http://localhost:${port}/api/docs`);
}

void bootstrap();
