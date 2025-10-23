import { Todo } from "../components/Todo/Todo.type";

export const TodosMock: Todo[] = [
  {
    id: "1",
    title: "Buy groceries",
    description: "Milk, eggs, bread, and veggies",
    completed: false,
    dueDate: new Date(), // today
    scheduledAt: new Date(new Date().setHours(18, 0, 0)), // today 6 PM
  },
  {
    id: "2",
    title: "Finish Chakra UI setup",
    description: "Integrate Chakra theme and fix dark mode compatibility",
    completed: true,
    dueDate: new Date(), // today
    scheduledAt: new Date(new Date().setHours(10, 0, 0)), // today 10 AM
  },
  {
    id: "3",
    title: "Call travel agent",
    description:
      "Ask for best Europe backpacking itinerary and Schengen details",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // tomorrow
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 1)), // tomorrow
  },
  {
    id: "4",
    title: "Research camera gear",
    description: "Compare mirrorless options under 60k",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)), // within this week
  },
  {
    id: "5",
    title: "Book museum tickets",
    description: "Reserve entry for Louvre and Uffizi Gallery",
    completed: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 12)), // later this month
  },
  {
    id: "6",
    title: "Start learning Italian",
    description: "Duolingo and YouTube practice sessions",
    completed: false,
    dueDate: undefined, // no due date → upcoming
  },
];
