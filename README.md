# PredaY | The H-1 Buffer 🚀

**PredaY** is a premium, centralized control center for Telegram alerts. Designed for power users who rely on automation (n8n/Firebase) to organize their life and never let a deadline "slip away."

Deployed at: [hyhilman.web.id/preday](https://hyhilman.web.id/preday)

---

## ✨ Key Features

- **🎯 Precision Buffering**: Automatically calculates alert times (H-3 for Bills, H-1 for others) while preserving the literal `event_date`.
- **💎 Premium UX/UI**: High-contrast automation dashboard with seamless Dark/Light mode, glowing interactive toggles, and bento-style layouts.
- **🤖 AI-SEO Optimized**: Fully discoverable by AI search engines (Google SGE, Perplexity) via JSON-LD Structured Data, OpenGraph metadata, and dynamic sitemaps.
- **🛡️ Secure Auth**: Google-only authentication for a simplified and secure entry point.
- **📡 Subpath Ready**: Optimized for shared hosting/subpath deployment (`/preday`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [Firebase / Firestore](https://firebase.google.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

---

## 🚀 Upcoming Improvements: Recurring Reminders (`repeat_type`)

The next major evolution for PredaY is the implementation of **Recurring Reminders**. This will allow the system to handle monthly bills, weekly meetings, and yearly anniversaries automatically.

### Proposed Implementation Area

1. **Schema Update**:
   - Add a `repeat_type` field to the `Reminder` model:
     ```typescript
     repeat_type: "none" | "daily" | "weekly" | "monthly" | "yearly";
     ```

2. **UI Integration**:
   - Update `CreateReminderDialog` and `EditReminderDialog` to include a selection for repetition frequency.
   - Refine the Dashboard to show a "Recurring" icon on list items.

3. **Logic Layer**:
   - Implement a post-processing hook in the backend/worker:
     - When a reminder is marked as `is_sent: true`, if `repeat_type !== 'none'`, automatically calculate the next `event_date` and `scheduled_time`.
     - Create a new "Pending" reminder document for the next cycle.

4. **User Control**:
   - Allow users to "Stop Series" directly from the dashboard actions.

---

## 🛠️ Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/preday](http://localhost:3000/preday) to see the result.

---

Created with ❤️ by Hilman.
