import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Enable CORS with environment-based allowed origins
  const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(
    ',',
  ) || ['*'];
  app.enableCors({
    origin: trustedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  const port = Number(process.env.PORT ?? 5550);
  const authPublicBase = (
    process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, '') ||
    `http://localhost:${port}`
  ).replace(/\/+$/, '');
  const authReferenceUrl = `${authPublicBase}/api/auth/reference`;
  const authOpenApiSchemaUrl = `${authPublicBase}/api/auth/open-api/generate-schema`;

  // Swagger Documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Church Management API Ecosystem')
    .setExternalDoc(
      'Better Auth API reference (Scalar, this server)',
      authReferenceUrl,
    )
    .setDescription(
      [
        '**Better Auth on this server** (OpenAPI plugin; not under `api/v1`). Public base: `' +
          authPublicBase +
          '`.',
        `- [Interactive API reference (Scalar, local)](${authReferenceUrl})`,
        `- [OpenAPI JSON for auth routes](${authOpenApiSchemaUrl})`,
        '- HTTP handler: `/api/auth/*`',
        '',
        '**Upstream Better Auth docs**',
        '- [Better Auth](https://www.better-auth.com/docs)',
        '- [Drizzle ORM adapter](https://www.better-auth.com/docs/adapters/drizzle)',
        '- [OpenAPI plugin](https://www.better-auth.com/docs/plugins/open-api)',
        '',
        '---',
        '',
        'This document describes the **church management JSON API** under global prefix `api/v1`. Responses are wrapped by a global interceptor (`success`, `message`, `data`, `timestamp`) unless noted.',
        'Most routes below require a **Bearer session** (Better Auth) and a **church member role** via `RolesGuard` (see each operation).',
      ].join('\n\n'),
    )
    .setVersion('1.0')
    .addTag('health', 'Process liveness and API root')
    .addTag('church', 'Church profile, branches, reports, and messagings')
    .addTag(
      'onboarding',
      'Authenticated user onboarding flows (e.g. create a new church)',
    )
    .addTag(
      'branch',
      'Branch CRUD under a church (currently unauthenticated — add guards for production)',
    )
    .addTag('batches', 'Donation / finance batch windows')
    .addTag('calendar', 'Rooms, event types, and calendar events')
    .addTag(
      'church-settings',
      'Church localization, person settings, and custom member fields',
    )
    .addTag(
      'donation',
      'Branch-scoped donations and church-wide donation listings',
    )
    .addTag('families', 'Households and family membership')
    .addTag(
      'finance',
      'Chart of accounts, transactions, funds, pledges, and stats',
    )
    .addTag('groups', 'Small groups and group membership')
    .addTag('invitations', 'Email invitations to join the church')
    .addTag('members', 'Church membership and directory')
    .addTag('communication', 'Announcements, forms, and submissions')
    .addTag(
      'messaging',
      'Church or branch broadcast messaging (currently unauthenticated — add guards for production)',
    )
    .addTag('projects', 'Fundraising projects scoped to a branch')
    .addTag('reports', 'Aggregated analytics (donations, branches, projects)')
    .addTag('streaming', 'Live streaming destinations and metrics')
    .addTag(
      'streaming-callbacks',
      'RTMP callbacks from nginx-rtmp (server-to-server; not for browser clients)',
    )
    .addTag(
      'subscriptions',
      'Stripe-style subscription records per church (currently unauthenticated — add guards for production)',
    )
    .addBearerAuth()
    .build();

  // Register global pipes, filters and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📑 Documentation available at: http://localhost:${port}/docs`);
}
void bootstrap();
