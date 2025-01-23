# Flyfish Logbook

Flyfish Logbook is a web application for logging and managing your fishing trips. Built with [Next.js](https://nextjs.org), it allows users to record details about their fishing trips, including locations, weather conditions, fish catches, and more.

## Features

- User authentication and profile management
- Log fishing trips with details such as date, location, weather, and notes
- Upload and manage trip images
- View and edit logged trips
- Sort and filter trips by date and location
- Responsive design

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/martinbolsnes/fly-tracker.git
cd flyfish-logbook

### Install dependecies

npm install
# or
yarn install

### Enviroment Variables

Create a .env.local file in the root of your project and add the following environment variables:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

Replace your-supabase-url and your-supabase-anon-key with your actual Supabase project URL and anonymous key.

### Running the dev server

npm run dev
# or
yarn dev

Open http://localhost:3000 with your browser to see the result.


```
