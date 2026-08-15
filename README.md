# Remedy

Remedy is a task-visibility system designed to keep the work that matters continuously visible instead of hiding it behind a task list.

## MVP

- Persistent task dashboard for desktop and Android
- Tasks grouped by **Now**, **Next**, and **Later**
- Priority and due-date awareness
- Full-screen focus view for the current task
- Local-first storage with `localStorage`
- Installable as a Progressive Web App (PWA) on Android and desktop
- Works offline after the first load

## Run

Serve the repository with any static web server. For example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

For Android installation, open the deployed HTTPS site in Chrome and choose **Install app / Add to Home screen**.

## Project structure

```text
remedy/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── sw.js
└── icons/
```
