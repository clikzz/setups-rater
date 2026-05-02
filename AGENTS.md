<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Next.js 16 Breaking Changes

- Middleware is now in 'proxy.ts' instead of 'middleware.ts'.
- The 'app' directory is now the default for pages and components.

# AI Developer Instructions

- **Component Library:** Always prioritize `shadcn/ui`. If you need to use a component that is not installed yet, just mention it in your response and I will add it for you.
- **Icons:** Always use `lucide-react`.
- **Rendering:** Prioritize Server-Side Rendering (SSR). Avoid Client Components (`"use client"`) unless strictly necessary.
- **Modularization:** Strictly avoid large components (e.g., 300+ lines). Split them into two or more smaller, modular files.
- **File Structure:** Follow the Next.js 13+ app directory conventions. Use `app/` for pages and components, and `lib/` for utilities.
- **Styling:** Use Tailwind CSS for styling. Avoid inline styles and CSS modules.
- **State Management:** Use React's built-in state management (e.g., `useState`, `useReducer`) or Context API. Avoid external libraries like Redux or MobX.
- **Data Fetching:** Use Next.js's data fetching methods (e.g., `getServerSideProps`, `getStaticProps`, or React Server Components). Avoid client-side data fetching with `useEffect` unless necessary.
- **TypeScript:** Always use TypeScript for type safety. Define interfaces and types for props, state, and API responses.
- **New Dependencies:** If you need to add new dependencies, don't add them directly, just mention them in your response and I will add them for you. Always prefer lightweight, well-maintained libraries that align with the project's goals.
- **Build Testing:** After writing code, always run a build test to ensure there are no errors and that the application runs smoothly. Use `next build` to test the production build.
- **Color Hardcoding:** NEVER hardcode colors in your components. Use Tailwind's utility classes for colors to maintain consistency and theming across the application.

# Code Quality

- **Readability:** Write clean, readable code with meaningful variable and function names. Avoid complex logic in a single function; break it down into smaller, reusable functions.
- **Comments:** Don't over-comment. Write self-explanatory code, but add comments to explain complex logic or decisions.
- **Error Handling:** Implement robust error handling. Use try-catch blocks where necessary and provide user-friendly error messages.
- **Good Practices:** Follow best practices for React and Next.js development. Avoid anti-patterns and ensure your code is maintainable and scalable.
