# extra-income-dashboard-web

## Local development

Start the dashboard backend first. By default, the frontend calls:

```bash
http://localhost:8081/ei-dashboard
```

To override the API URL, create a local `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8081/ei-dashboard
VITE_API_USE_CREDENTIALS=false
```

Then run:

```bash
npm run dev
```
