# TaskFlow — Simple Task Manager

A lightweight task manager built with **Next.js, React and TypeScript**, ready to push to GitHub and deploy on Vercel.

## Features

- Create, edit and delete tasks
- Set start dates, due dates, priority and status
- Track task completion from 0–100% using a progress slider
- Dashboard metrics: total, in progress, completed and overdue
- Overall completion percentage
- Search, filter and sort tasks
- Responsive layout for desktop and mobile
- Saves tasks in the browser using `localStorage`

## Run locally

1. Install Node.js 20.9 or later.
2. Extract this folder and open a terminal inside it.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Deploy with GitHub + Vercel

1. Create a new repository on GitHub.
2. Push the contents of this folder to the repository:

   ```bash
   git init
   git add .
   git commit -m "Initial TaskFlow app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. Sign in to [Vercel](https://vercel.com), choose **Add New → Project**, and import the GitHub repository.
4. Keep the detected framework as **Next.js**. No environment variables are required.
5. Select **Deploy**. Vercel will build and host the app. Future pushes to `main` will trigger deployments.

## Important: data storage

This starter version stores tasks in the browser's `localStorage`. That means:
- Tasks remain available in the same browser on the same device.
- Tasks are **not** synchronised across devices or users.
- Clearing browser site data will remove locally stored tasks.

For a multi-device or team-ready version, connect a database such as Supabase (PostgreSQL) and add authentication. A natural next step is to add task owners, reminders/notifications, comments, subtasks and milestone history.

## Project structure

```text
taskflow-manager/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```
