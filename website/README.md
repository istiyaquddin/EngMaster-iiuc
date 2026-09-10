# EngMaster IIUC — GEEL-1106 Advanced English Master Platform

> **Official Interactive Exam Preparation Portal for Course Code: GEEL-1106 / UREL-1106: Advanced English**  
> Administered by the **Center for General Education (CGED)**, International Islamic University Chittagong (IIUC).

---

## 🌟 Overview & Philosophy

**EngMaster IIUC** transforms the entire first-year undergraduate English curriculum into a high-performance, single-page, **100% offline-first interactive study platform**. 

Rather than functioning as a static PDF viewer, the application restructures all syllabus components, E.L. Tibbitts' prescribed reading units (11C–20C), grammar lecture slides, and seven years of solved Semester End Examinations (2018–2025) into searchable, interactive, and pedagogically sound learning modules.

---

## 🚀 Key Features & Modules

### 1. 📊 Command Center & Home Dashboard
- **Live Exam Countdown:** Configurable real-time countdown timer to the final Semester End Examination date.
- **Syllabus Mastery Tracker:** Real-time percentage indicator tracking completed textbook chapters and mastered rules.
- **Daily Study Goals:** Interactive study checklist with persistent `localStorage` progress tracking.
- **Continue Reading:** One-click resumption of the student's most recently viewed chapter.
- **Recent Activity Feed:** Automated chronological log of user revisions, quizzes, and bookmarked rules.
- **Quick Revision Pills:** Instant navigational jumps to high-frequency topics.

### 2. 📖 Core Grammar Explorers
- **Top 100 Essential Grammar Rules:** Searchable, categorized catalog with rule descriptions, formulas, and university exam exemplars.
- **Subject-Verb Agreement (Concord) Explorer:** Filterable across Headword concord, Additive connectors (*as well as*), Correlatives (*neither... nor*), Quantifiers (*a number of* vs. *the number of*), and Collective nouns. Includes an interactive Rule Comparison Matrix.
- **Conditional Sentences Studio:** Interactive cards for Zero, First, Second, Third, Inverted Third, and Mixed conditionals with visual timelines, formulas, real-world examples, and interactive mini-quizzes.
- **Causative Verbs Hub:** Detailed breakdowns for *Have, Get, Make, Let, Help, Force/Allow* in active and passive voices with direct comparison matrices.
- **Top 50 Common Mistakes Fixed:** High-frequency university exam traps paired with before-and-after corrections and detailed grammatical rationales.

### 3. 👓 Seen Reading & Vocabulary Hub
- **Tibbitts Reading Units (11C–20C):** Full authentic reading texts for Passage 17C (*Shooting a Film / "The Path of Power"*), Passage 16C (*The Co-operative Movement*), Passage 15C (*The French Revolution*), Passage 14C (*Mass Production*), and Passage 18C (*The Birth of UNO*).
- **In-Text Clickable Vocabulary Popovers:** Clicking any highlighted word inside passage texts opens an instant lexicon modal with grammatical category, definition, synonyms, antonyms, and contextual exam usage.
- **Top 50 High-Frequency Vocabulary:** Searchable cards with definitions, synonyms, antonyms, exam sentences, and **100% offline native speech pronunciation** powered by the browser's Web Speech API (`window.speechSynthesis`).
- **50-Word Summary Studio:** Real-time drafting pad for unseen passages with an interactive word counter, optimal 45–50 word status badge, and **live overflow highlighter** that underlines words exceeding the strict 50-word examination limit in red.

### 4. ✍️ Writing Workshop & Exam Intelligence
- **Professional Writing Workshop:** Ready-to-use official templates for Purchase Order Letters, Damaged Equipment Complaint Letters, Administrative Request Letters, and Argumentative Essays. Features an **Interactive Practice Drafting Pad** with live word and character counters.
- **Past Question Explorer (2018–2025):** Solved Semester End Examination questions with multi-filtering across Year, Semester, Topic, and Difficulty with revealable model answers.
- **Exam Suggestion Module:** Strategic priority matrix categorizing topics into High Priority (100% recurrence), Medium Priority (70–85%), Low Priority (40–60%), and Top 10 University Error Traps.
- **Last-Night Revision & Sanity Checklist:** Ultra-condensed formula sheets and the essential 15-Point Pre-Exam Sanity Checklist with persistent checkboxes.
- **Smart Note (Interactive Notebook):** 10-chapter structured notebook formatted cleanly for both screen study and high-resolution PDF printing.

### 5. ⏱️ MCQ Engine & 45-Minute Mock Test Simulator
- **Practice Mode:** 50 exam-calibrated questions filtered by difficulty (Easy, Intermediate, Challenging) with instant feedback, scoring, and explanations.
- **45-Minute Timed Mock Exam:**
  - Auto-ticking 45:00 countdown clock with pause and auto-submit.
  - Optional Negative Marking toggle (-0.25 per wrong answer).
  - 25-Question Navigation Palette with visual answered/unanswered states.
  - Comprehensive Diagnostic Report generating scaled scores, percentages, official letter grades (A+, A, A-, B, C, F), and question-by-question review with explanations.

### 6. 🛠️ Productivity, Bookmarks & Personal Notes
- **My Bookmarks:** One-click bookmarking for any grammar rule, vocabulary entry, past question, or revision note with category filtering and instant removal.
- **Personal Study Notepad:** Auto-saved offline scratchpad for lecture notes, mnemonics, and personal reminders with full CRUD operations and JSON data export.
- **Preferences & Accessibility:** Light/Dark theme toggle, font size scaler (Standard, Large, Extra Large), and clean `@media print` stylesheets for printing cheat sheets without UI clutter.

---

## 💻 Technology Stack & Architectural Constraints

In accordance with strict project constraints, this application is engineered with **zero external framework dependencies**:

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic, accessible single-page layout structure with ARIA attributes. |
| **Vanilla CSS3** | Custom design system featuring glassmorphism, gradient accents, responsive grids, and dedicated `@media print` styles. |
| **Vanilla JavaScript (ES6+)** | Single-page client-side router, search engine, state management, quiz evaluation, and markdown rendering. |
| **Web Speech API** | Native, offline text-to-speech audio pronunciation (`speechSynthesis`). Zero network requests. |
| **LocalStorage API** | Complete client-side state persistence for bookmarks, notes, quiz scores, daily goals, and visual preferences. |

> **No Backend • No Database • No Node.js • No React/Vue • No Build Tools Required.**

---

## 📁 File Structure

```
website/
├── index.html     # Single-page application markup with 21 structured view sections
├── style.css      # Complete responsive glassmorphic design system and print rules
├── data.js        # Structured data (16 Modules, 100 Rules, 50 Mistakes, 50 Vocab, 50 MCQs, Passages, PQs)
├── app.js         # Master client-side controller, router, search, quiz & mock test engine
└── README.md      # Comprehensive technical documentation and user manual
```

---

## 🏃 How to Run Locally

1. Open the `website/` folder on your computer.
2. Double-click **`index.html`** or right-click and open with any modern web browser:
   - Google Chrome
   - Microsoft Edge
   - Mozilla Firefox
   - Apple Safari
   - Brave / Opera
3. The platform will immediately launch in full interactive mode with zero installation or internet connection required.

---

## 🖨️ Printing & PDF Export

EngMaster IIUC includes dedicated print stylesheets. To print a cheat sheet or save notes as a PDF:
1. Navigate to the view you wish to export (e.g., **Smart Notes**, **Last-Night Cram Booster**, or **Exam Suggestions**).
2. Click the **Print** icon in the top header or press `Ctrl + P` (`Cmd + P` on macOS).
3. The application will automatically hide all navigation sidebars, headers, search boxes, and buttons, rendering a clean, academic layout optimized for paper or PDF export.

---

## 📄 Academic Citation & Curriculum Reference

- **Course:** GEEL-1106 / UREL-1106: Advanced English
- **Department:** Center for General Education (CGED)
- **Institution:** International Islamic University Chittagong (IIUC), Kumira, Sitakunda, Chattogram-4318, Bangladesh.
- **Core Textbook:** *Exercises in Reading Comprehension*, Edited by E.L. Tibbitts, Longman House, Essex, UK.
