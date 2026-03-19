# Brain Burrow

A personal productivity app built with React and TypeScript, featuring a smart todo system with recurring tasks and an interactive calendar view.

**Live:** [sanjanaavenugopal.github.io/brain-burrow](https://sanjanaavenugopal.github.io/brain-burrow)

## Features

### Todo Dashboard (Amanscape)
- Create, edit, and delete todos with title, description, tags, and scheduled date/time
- Tasks grouped by **Overdue**, **Today**, **Tomorrow**, **This Week**, **This Month**, and **Upcoming**
- Enforce time selection for today/tomorrow tasks

### Recurring Todos
- Supports **daily**, **weekly** (specific days), **monthly**, **yearly**, and **custom interval** recurrence
- Virtual instance generation -- only one document stored per recurring todo
- Completions tracked via a map on the base document (no instance bloat)
- Edit recurring todos with **All Instances** or **Just Today** options
- Override documents for single-day modifications
- Optional recurring end date

### Calendar View
- Monthly calendar with task previews on each day (up to 2 titles + more count)
- Click any date to see all tasks for that day in a detail modal
- Visual indicators: today ring, task dots, hover glow, weekend shading
- Animated month transitions

### Homepage
- Command bar with navigation, resume link, and contact form
- Contact form powered by EmailJS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| UI | Chakra UI v2 + Tailwind CSS v3 |
| State | Redux Toolkit |
| Backend | Firebase Firestore |
| Icons | Lucide React |
| Dates | date-fns + react-datepicker + react-calendar |
| Routing | React Router v7 |
| Deployment | GitHub Pages (gh-pages) |

## Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Install and Run

```bash
npm install
npm start
```

Opens at http://localhost:3000/brain-burrow

### Build and Deploy

```bash
npm run build
npm run deploy
```

## Project Structure

```
src/
  Pages/
    Home.tsx              # Landing page
    Todo.tsx              # Todo page (fetches from Firestore)
  components/
    HomePage/             # Command bar, contact form, theme
    Todo/
      Todo.type.ts        # Core types (Todo, DisplayTodo, RecurrencePattern)
      TodoSlice.ts        # Redux slice
      computeInstances.ts # Virtual recurring instance generation
      GroupedTodos.ts     # Time-bucket grouping logic
      TodoDashboard.tsx   # Dashboard view
      TodoCalendar.tsx    # Calendar view
      TodoModal.tsx       # Add/edit modal
      useTodoForm.tsx     # Form state hook
      NormalizeDates.tsx  # Date format normalizer
  Data/
    constants.ts          # App text constants
```