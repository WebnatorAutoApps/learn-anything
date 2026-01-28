# Vercel Deployment Setup

This document explains how to configure the required GitHub secrets for automatic Vercel deployment.

## Required Secrets

The GitHub Actions workflow requires three secrets to deploy to Vercel:

1. `VERCEL_TOKEN` - Your Vercel authentication token
2. `VERCEL_ORG_ID` - Your Vercel organization/team ID
3. `VERCEL_PROJECT_ID` - Your Vercel project ID

## Step-by-Step Setup

### 1. Get Your Vercel Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions Deploy")
4. Set the scope to your organization/team
5. Click "Create" and copy the token immediately (it won't be shown again)

### 2. Get Your Vercel Organization ID

1. Go to your [Vercel Team Settings](https://vercel.com/account/team)
2. Your Organization ID is shown in the settings
3. Alternatively, run this command in your project directory:
   ```bash
   cat .vercel/project.json | grep orgId
   ```

### 3. Get Your Vercel Project ID

1. Go to your project's settings on Vercel
2. The Project ID is shown in the settings
3. Alternatively, run this command in your project directory:
   ```bash
   cat .vercel/project.json | grep projectId
   ```
4. Or use the Vercel CLI:
   ```bash
   npx vercel link
   ```

### 4. Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each of the three secrets:
   - Name: `VERCEL_TOKEN`, Value: [your token from step 1]
   - Name: `VERCEL_ORG_ID`, Value: [your org ID from step 2]
   - Name: `VERCEL_PROJECT_ID`, Value: [your project ID from step 3]

## Verification

After adding the secrets:

1. Push a commit to the `main` branch
2. Go to the "Actions" tab in your GitHub repository
3. Check that the "Deploy" job runs successfully
4. Your site should be deployed to Vercel

## Troubleshooting

### Error: "Input required and not supplied: vercel-token"

This means the `VERCEL_TOKEN` secret is not configured. Follow step 4 above to add it.

### Error: "Project not found"

This means either `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` is incorrect. Verify the values in your Vercel dashboard.

### Deployment succeeds but shows wrong environment

The workflow is configured to deploy to production (`--prod` flag) only on pushes to the `main` branch.

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Action Documentation](https://github.com/amondnet/vercel-action)
