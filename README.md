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

1.  **Clone the Repository (or Download Files):**
    If you haven't already, get the project files onto your computer. If cloned from GitHub:
    ```bash
    # git clone <repository-url>
    # cd <repository-folder>
    ```

2.  **Obtain your Gemini API Key:**
    -   Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3.  **Serve the Application Locally:**
    Since this is a static web application (HTML, CSS, JavaScript served directly to the browser), you need a local HTTP server to run it.
    -   **Using `npx serve` (Node.js required):**
        If you have Node.js installed, open your terminal in the project's root directory (where `index.html` is) and run:
        ```bash
        npx serve
        ```
        This will typically serve the application on `http://localhost:3000` or a similar address. Note the URL it provides.
    -   **Using VS Code Live Server Extension:**
        If you use Visual Studio Code, you can install the "Live Server" extension. Right-click on `index.html` in the VS Code explorer and choose "Open with Live Server."

4.  **Open in Browser and Enter API Key:**
    -   Open the local address provided by your server (e.g., `http://localhost:3000`) in your web browser.
    -   You will see an input field labeled "Gemini API Key" in the application. **Paste your Gemini API Key into this field.**

## How to Use

1.  Ensure your Gemini API Key is entered in the provided field in the app.
2.  Select the programming language of your code.
3.  Paste your code into the "Your Code" text area.
4.  Click the "Review Code" button.
5.  Wait for Gemini to analyze your code.
6.  View the feedback and the revised code in the panels on the right.

## Project Structure

-   `index.html`: Main HTML file.
-   `index.tsx`: Main React/TypeScript entry point.
-   `App.tsx`: Root React component.
-   `components/`: Contains UI components.
    - `ApiKeyInput.tsx`: Component for API Key input.
-   `services/`: Contains the Gemini API service logic.
-   `constants.ts`: Application constants (e.g., model name, prompt templates).
-   `types.ts`: TypeScript type definitions.
-   `metadata.json`: Application metadata.
-   `manifest.json`: Web App Manifest for PWA features.

## Note on API Key Usage

The API key is entered directly into the browser and used for API calls from the client-side. This method is for **local development and testing purposes only.**
-   **Do not share your API key publicly.**
-   **Do not deploy this application to a public-facing website where the API key is handled this way**, as it would expose your key. For public deployment, a backend proxy is required to protect your API key.

---

This project is for educational and illustrative purposes.