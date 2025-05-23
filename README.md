
# Gemini Code Reviewer

An automated code review tool that uses the Google Gemini API to analyze code, provide feedback, and suggest improvements for aesthetics, usability, and best practices.

## Features

-   Analyzes code in various languages.
-   Provides detailed feedback on code quality.
-   Suggests revised code incorporating improvements.
-   Supports a wide range of popular programming languages.
-   User-friendly interface with code input and review panel.

## Prerequisites

-   A modern web browser.
-   A Google Gemini API Key.

## Setup and Running Locally

1.  **Clone the Repository (Optional):**
    If you've downloaded the files directly, you can skip this. Otherwise, clone from GitHub:
    ```bash
    # git clone <repository-url>
    # cd <repository-folder>
    ```

2.  **Set up your Gemini API Key:**
    This application requires a Google Gemini API Key to function.
    -   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   You need to make this API key available as an environment variable named `API_KEY`. How you set this depends on your operating system and how you serve the files:
        -   **Linux/macOS (Bash/Zsh):**
            ```bash
            export API_KEY="YOUR_GEMINI_API_KEY"
            ```
            You'll need to run this in the terminal session where you start your local web server. For a more permanent solution for your local development, you can add it to your shell's configuration file (e.g., `.bashrc`, `.zshrc`).
        -   **Windows (Command Prompt):**
            ```bash
            set API_KEY=YOUR_GEMINI_API_KEY
            ```
        -   **Windows (PowerShell):**
            ```bash
            $env:API_KEY="YOUR_GEMINI_API_KEY"
            ```
    *Important*: The application's `geminiService.ts` directly tries to access `process.env.API_KEY`. For this to work in a browser context during local development, some local development servers or bundlers might shim `process.env`. If you're using a simple static server, this might not be directly available, and you might need a slightly more advanced local setup (e.g. using a bundler like Vite or a dev server that supports environment variables). **For the current version, ensure the environment you use to serve or build the app makes `API_KEY` accessible as if it's `process.env.API_KEY`.**

3.  **Serve the Application:**
    Since this is a static web application (HTML, CSS, JavaScript served directly to the browser), you need a local HTTP server to run it.
    -   **Using `npx serve` (Node.js required):**
        If you have Node.js installed, open your terminal in the project's root directory and run:
        ```bash
        npx serve
        ```
        This will typically serve the application on `http://localhost:3000` or a similar address.
    -   **Using VS Code Live Server Extension:**
        If you use Visual Studio Code, you can install the "Live Server" extension. Right-click on `index.html` and choose "Open with Live Server."

4.  **Open in Browser:**
    Open the local address provided by your server (e.g., `http://localhost:3000`) in your web browser.

## How to Use

1.  Select the programming language of your code.
2.  Paste your code into the "Your Code" text area.
3.  Click the "Review Code" button.
4.  Wait for Gemini to analyze your code.
5.  View the feedback and the revised code in the panels on the right.

## Project Structure

-   `index.html`: Main HTML file.
-   `index.tsx`: Main React/TypeScript entry point.
-   `App.tsx`: Root React component.
-   `components/`: Contains UI components.
-   `services/`: Contains the Gemini API service logic.
-   `constants.ts`: Application constants (e.g., model name, prompt templates).
-   `types.ts`: TypeScript type definitions.
-   `metadata.json`: Application metadata.
-   `manifest.json`: Web App Manifest for PWA features.

## Note on API Key Security

The `API_KEY` is used directly in the client-side code in this version. This is suitable for local development or trusted environments. **Do not deploy this application to a public-facing website with your API key embedded in a way that is easily accessible.** For public deployment, use a backend proxy to protect your API key.

---

This project is for educational and illustrative purposes.
