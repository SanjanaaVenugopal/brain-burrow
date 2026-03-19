# Brain Burrow

A personal productivity app built with React and TypeScript, featuring a smart todo system with recurring tasks, custom project boards, a lightweight journal, and an interactive calendar view.

**Live:** [sanjanaavenugopal.github.io/brain-burrow](https://sanjanaavenugopal.github.io/brain-burrow)

## Features

### Todo Dashboard (Amanscape)
- Create, edit, and delete todos with title, description, tags, and scheduled date/time
- Tasks grouped by **Overdue**, **Today**, **Tomorrow**, **This Week**, **This Month**, and **Upcoming**
- Completed tasks dim out for visual clarity
- Enforce time selection for today/tomorrow tasks

### Recurring Todos
- Supports **daily**, **weekly** (specific days), **monthly**, **yearly**, and **custom interval** recurrence
- Virtual instance generation -- only one document stored per recurring todo
- Completions tracked via a map on the base document (no instance bloat)
- Edit recurring todos with **All Instances** or **Just Today** options
- Override documents for single-day modifications
- Optional recurring end date

### Custom Boards
- Create personalizable boards for complex tasks (e.g. Wedding, Trip, Project)
- Add custom columns (months, phases, categories -- anything)
- Full task management per column: add, edit, delete, toggle completion
- Reuses the same modal as todos (title, description, date/time, tags)
- Collapsible sidebar to switch between Main Dashboard and custom boards

### Calendar View
- Monthly calendar with task previews on each day (up to 2 titles + more count)
- Click any date to see all tasks for that day in a detail modal
- Visual indicators: today ring, task dots, hover glow, weekend shading
- Animated month transitions

### Journal
- Lightweight text editor for personal notes
- Create, edit, and delete journal entries
- Sidebar navigation for entries
- Rich text content stored in Firestore

### Homepage
- Dashboard cards with dynamic summaries (tasks due today, last journal entry)
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
    Home.tsx                # Landing page with dashboard cards
    Todo.tsx                # Todo page (sidebar + dashboard/calendar/boards)
    Journal.tsx             # Journal page
  components/
    HomePage/               # Command bar, contact form, theme, dashboard cards
    Todo/
      Todo.type.ts          # Core types (Todo, DisplayTodo, RecurrencePattern)
      TodoSlice.ts          # Redux slice
      computeInstances.ts   # Virtual recurring instance generation
      GroupedTodos.ts       # Time-bucket grouping logic
      TodoDashboard.tsx     # Dashboard view
      TodoCalendar.tsx      # Calendar view
      TodoModal.tsx         # Add/edit modal (shared with boards)
      useTodoForm.tsx       # Form state hook
      NormalizeDates.tsx    # Date format normalizer
    Board/
      Board.type.ts         # Board, BoardColumn, BoardTask types
      BoardSlice.ts         # Redux slice
      BoardSidebar.tsx      # Collapsible sidebar navigation
      BoardView.tsx         # Column-based board view
    Journal/
      Journal.type.ts       # JournalEntry type
      JournalSlice.ts       # Redux slice
      JournalEditor.tsx     # Text editor component
      JournalSidebar.tsx    # Entry list sidebar
  Data/
    constants.ts            # App text constants
```