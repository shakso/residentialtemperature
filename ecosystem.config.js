module.exports = {
  apps: [
    {
      name: 'web',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'stripe',
      script: 'src/server/stripe-api.ts',
      interpreter: 'tsx',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'email',
      script: 'src/server/email-api.ts',
      interpreter: 'tsx',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'reports',
      script: 'src/server/report-scheduler.ts',
      interpreter: 'tsx',
      env: {
        NODE_ENV: 'production'
      },
      watch: true,
      ignore_watch: ['*.pdf']
    }
  ]
}
