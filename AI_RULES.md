# AI Development Rules

This document outlines the technology stack and coding conventions for this web application. Following these rules ensures consistency, maintainability, and high-quality code.

## Tech Stack

This is a modern web application built with the following technologies:

*   **Framework:** React (bootstrapped with Vite) for building the user interface.
*   **Language:** TypeScript for static typing and improved developer experience.
*   **Styling:** Tailwind CSS for a utility-first approach to styling. All styling should be done with Tailwind classes.
*   **UI Components:** We use `shadcn/ui` for our component library. It provides a set of accessible, customizable, and reusable components.
*   **Icons:** `lucide-react` is the designated icon library to ensure visual consistency across the application.
*   **Routing:** `react-router-dom` is used for all client-side routing and navigation.
*   **Code Quality:** ESLint and Prettier are configured to enforce a consistent code style and catch common errors.

## Library Usage Rules

To keep the codebase clean and predictable, please adhere to the following rules:

1.  **UI Components:**
    *   **ALWAYS** prioritize using a component from the `shadcn/ui` library (`@/components/ui/...`) if one fits the need.
    *   If a `shadcn/ui` component is not suitable, create a new, reusable component inside the `src/components/` directory.
    *   Keep components small and focused on a single responsibility.

2.  **Styling:**
    *   **ONLY** use Tailwind CSS utility classes for styling.
    *   Do not write custom CSS files or use inline `style` objects unless it's for a dynamic value that cannot be handled by Tailwind's JIT compiler.

3.  **Icons:**
    *   **ONLY** use icons from the `lucide-react` package. This maintains a consistent visual language.

4.  **State Management:**
    *   For local component state, use React's built-in hooks like `useState` and `useReducer`.
    *   For global state that needs to be shared across many components, use React Context API. Avoid adding a larger state management library (like Redux or Zustand) unless absolutely necessary.

5.  **Routing:**
    *   All application routes should be defined in `src/App.tsx` using `react-router-dom`.
    *   Pages should be created in the `src/pages/` directory.

6.  **Dependencies:**
    *   Before adding a new npm package, verify that the required functionality cannot be achieved with the existing libraries. We aim to keep the application lightweight.