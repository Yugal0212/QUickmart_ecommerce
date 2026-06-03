# EcommerWebMean

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deployment

### Vercel Deployment

To deploy this Angular application on Vercel:

1. **Build Command**: `ng build --configuration production`
2. **Output Directory**: `dist/Quickmart_frontend`
3. **Install Command**: `npm install`

The `vercel.json` file is already configured for Angular routing.

### Netlify Deployment

Alternatively, deploy to Netlify:

1. **Build Command**: `ng build --configuration production`
2. **Publish Directory**: `dist/Quickmart_frontend`

The `netlify.toml` file is already configured.

## Performance Optimizations

### Loader Improvements (November 2025)

The preloader has been optimized for faster page loads:

- **Faster Hide Logic**: Preloader hides on window load or first route completion (max 800ms fallback)
- **Reduced Animation Durations**: 
  - Background gradient: 10s → 4s
  - Hexagonal animations: 2s → 0.9s
  - Ring animations: 2s → 1s
- **Shorter Delays**: Animation delays reduced by 60%

**Customizing Loader Timing:**

1. **Hide Duration**: Edit timeout in `src/app/app.component.ts` (currently 800ms)
2. **Animation Speed**: 
   - Hex loader: `src/app/components/preloder-two/preloder-two.component.css`
   - Ring loader: `src/app/components/preloader/preloader.component.css`

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
