# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Backend connectivity (REACT_APP_API_BASE_URL)

This UI calls the backend using `process.env.REACT_APP_API_BASE_URL` (Create React App only reads `REACT_APP_*` vars at **startup**).
If you changed `REACT_APP_API_BASE_URL`, you must restart the UI preview/dev server to pick it up.

### Exact preview restart checklist (KAVIA / preview)
1) Confirm the variable is set at the project level:
   - `REACT_APP_API_BASE_URL=http://localhost:3001` (or the backend preview URL/port you are using)
2) Stop the running **frontend preview** process/session (the one serving port 3000).
3) Start the frontend preview again (same way you originally started it).
4) Hard-refresh the browser tab (Ctrl/Cmd+Shift+R) to avoid cached JS bundle.
5) (Optional but recommended) Open the browser devtools Console and verify the UI is not logging API base URL errors.

### Minimal smoke test (verifies seeded claims)
These steps isolate “frontend config” vs “backend connectivity” vs “database/RLS”.

#### A) Verify backend is up
Open the backend docs:
- `http://localhost:3001/docs` (or your backend preview URL)

#### B) Verify the backend can see claims in Supabase (most direct)
In a browser (or curl), call:
- `GET http://localhost:3001/api/diag/claims-count`

Expected:
- `{"ok":true,"count":10,...}` (count should be 10 if the seed data is accessible)

If this returns `ok:false` / 500:
- Likely causes:
  - Missing/incorrect backend env vars `SUPABASE_URL` / `SUPABASE_KEY`
  - Supabase Row Level Security (RLS) blocking reads for the key you configured
  - The database was not seeded in the Supabase project you are pointing at

#### C) Verify the actual endpoint the UI uses
Call:
- `GET http://localhost:3001/api/claims`

Expected:
- `{"claims":[ ...10 items... ]}` (or at least non-empty)

#### D) Verify the UI is using the correct base URL
Once the UI is restarted, load the Claims page in the UI.
If it still errors, check the Network tab:
- Request URL should start with `http://localhost:3001/api/claims`
- If it starts with `http://localhost:3000/api/claims` or an old host, the UI did not restart correctly.

### Troubleshooting quick map
- **CORS errors in browser console**:
  - Backend currently allows `origin: '*'` and allows common headers/methods, so CORS issues are unlikely unless a proxy is involved.
  - Ensure you are not mixing `http` and `https` origins unexpectedly.
- **Network error / ERR_CONNECTION_REFUSED**:
  - Backend preview not running on the expected port/URL.
- **500 from backend**:
  - Backend cannot talk to Supabase or is blocked by RLS; use `/api/diag/claims-count` response payload for the error message.
- **200 but `count: 0`**:
  - You are connected to a Supabase project that has no seed data applied.
- **401/403 from Supabase** (in backend error message):
  - API key mismatch or RLS; ensure service role key is used server-side if RLS is enabled and you expect unrestricted reads in the demo.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
