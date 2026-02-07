# Deployment Guide

This guide covers deploying your hackathon project to various platforms.

## Prerequisites

- Docker installed (for containerized deployment)
- Account on your chosen hosting platform
- Environment variables configured

## Docker Deployment

### Build and Run Locally

```bash
docker-compose up -d
```

### Build Production Images

```bash
docker-compose -f docker-compose.yml build
```

## Platform-Specific Guides

### Vercel (Frontend)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Railway (Backend + Database)

1. Connect your GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add PostgreSQL database
6. Configure environment variables

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Deploy: `git push heroku main`

## Environment Variables

Make sure to set these in your hosting platform:

### Frontend
- `NEXT_PUBLIC_API_URL` - Your backend API URL
- `NEXT_PUBLIC_APP_URL` - Your frontend URL

### Backend
- `PORT` - Server port (usually auto-set by platform)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

## Database Migrations

Run migrations after deployment:

```bash
npm run db:migrate
```

Or use your platform's CLI to run migrations.

## Health Checks

Most platforms support health check endpoints. Use `/health` for monitoring.

## Tips

1. **Test locally first** - Use Docker Compose to test production setup
2. **Monitor logs** - Check platform logs for errors
3. **Database backups** - Set up automatic backups
4. **SSL/HTTPS** - Most platforms provide this automatically
5. **Rate limiting** - Consider adding rate limiting for production

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database is accessible from your app
- Ensure IP whitelisting if required

### Build Failures

- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs for specific errors

### CORS Issues

- Update CORS settings in backend
- Verify frontend URL is allowed
