/**
 * EngMaster IIUC — GEEL-1106 / UREL-1106 Advanced English Master Controller
 * Single-Page Offline-First Application (SPA) Engine
 * Zero Dependencies | Vanilla ES6+ | Offline Native SpeechSynthesis
 */

/**
 * EngMaster Data Normalization Engine
 * Automatically harmonizes all dataset schemas across Top Rules, Top Mistakes, and Vocab.
 */
function normalizeData() {
  if (!window.GEEL_DATA) return;

  // 1. Normalize topRules
  if (Array.isArray(window.GEEL_DATA.topRules)) {
    window.GEEL_DATA.topRules.forEach((r, idx) => {
      r.id = r.id || r.number || (idx + 1);
      r.number = r.number || r.id;
      r.title = r.title || `Rule #${r.id}`;
      r.rule = r.rule || r.description || '';
      r.description = r.description || r.rule || '';
      if (!r.example) {
        const exMatch = r.rule.match(/\((.*?)\)/);
        r.example = exMatch ? exMatch[1] : r.rule;
      }
    });
  }

  // 2. Normalize topMistakes
  if (Array.isArray(window.GEEL_DATA.topMistakes)) {
    window.GEEL_DATA.topMistakes.forEach((m, idx) => {
      m.id = m.id || (idx + 1);
      m.incorrect = m.incorrect || '';
      m.correct = m.correct || '';
      m.category = m.category || 'Grammar';
      if (!m.explanation) {
        m.explanation = `Grammar rationale: Use "${m.correct}" instead of "${m.incorrect}" (${m.category}).`;
      }
    });
  }

  // 3. Normalize vocabList
  if (Array.isArray(window.GEEL_DATA.vocabList)) {
    window.GEEL_DATA.vocabList.forEach((v, idx) => {
      v.id = v.id || (idx + 1);
      v.word = v.word || '';
      v.meaning = v.meaning || '';
      v.synonyms = v.synonyms || '';
      v.antonyms = v.antonyms || '';
      v.sentence = v.sentence || v.example || '';
      v.example = v.example || v.sentence || '';
      v.pos = v.pos || 'Academic Term';
    });
  }
}

// Normalize immediately if GEEL_DATA was already loaded
if (window.GEEL_DATA) {
  normalizeData();
}

function safeInit(componentName, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[EngMaster] Error initializing ${componentName}:`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  normalizeData();
  safeInit('Theme', initTheme);
  safeInit('MidtermHub', initMidtermHub);
  safeInit('FinalExamHub', initFinalExamHub);
  safeInit('PracticeZone', initPracticeZone);
  safeInit('FontSize', initFontSize);
  safeInit('ReadingProgressBar', initReadingProgressBar);
  safeInit('Sidebar', initSidebar);
  safeInit('ExamCountdown', initExamCountdown);
  safeInit('GlobalSearch', initGlobalSearch);
  safeInit('Dashboard', initDashboard);
  safeInit('RulesCatalog', initRulesCatalog);
  safeInit('SVAExplorer', initSVAExplorer);
  safeInit('ConditionalsExplorer', initConditionalsExplorer);
  safeInit('CausativesExplorer', initCausativesExplorer);
  safeInit('MistakesExplorer', initMistakesExplorer);
  safeInit('SeenPassagesReader', initSeenPassagesReader);
  safeInit('VocabModule', initVocabModule);
  safeInit('SummaryStudio', initSummaryStudio);
  safeInit('WritingWorkshop', initWritingWorkshop);
  safeInit('PreviousQuestions', initPreviousQuestions);
  safeInit('MCQQuiz', initMCQQuiz);
  safeInit('MockTest', initMockTest);
  safeInit('ExamSuggestions', initExamSuggestions);
  safeInit('LastNightRevision', initLastNightRevision);
  safeInit('SmartNotes', initSmartNotes);
  safeInit('BookmarksSystem', initBookmarksSystem);
  safeInit('PersonalNotes', initPersonalNotes);
  safeInit('Settings', initSettings);
  safeInit('ModalPopover', initModalPopover);
  
  // Default Route: Dashboard
  switchView('view-dashboard');
}

/* ==========================================================================
   Global State Management & Helpers
   ========================================================================== */
const AppState = {
  currentView: 'view-dashboard',
  bookmarks: JSON.parse(localStorage.getItem('geel_bookmarks') || '[]'),
  notes: JSON.parse(localStorage.getItem('geel_notes') || '[]'),
  progress: JSON.parse(localStorage.getItem('geel_progress') || '{"completedModules":[], "masteredRules":[]}'),
  quizStats: JSON.parse(localStorage.getItem('geel_quiz_stats') || '{"attempted":0, "score":0}'),
  dailyGoals: JSON.parse(localStorage.getItem('geel_daily_goals') || 'null'),
  checklist: JSON.parse(localStorage.getItem('geel_checklist') || '{}'),
  lastViewedModule: localStorage.getItem('geel_last_module') || null,
  recentActivity: JSON.parse(localStorage.getItem('geel_recent_activity') || '[]'),
  
  saveBookmarks() {
    localStorage.setItem('geel_bookmarks', JSON.stringify(this.bookmarks));
    updateBookmarkBadges();
  },
  saveNotes() {
    localStorage.setItem('geel_notes', JSON.stringify(this.notes));
    updateNoteBadges();
  },
  saveProgress() {
    localStorage.setItem('geel_progress', JSON.stringify(this.progress));
    updateProgressDisplays();
  },
  saveQuizStats() {
    localStorage.setItem('geel_quiz_stats', JSON.stringify(this.quizStats));
    updateQuizDisplays();
  },
  saveDailyGoals() {
    localStorage.setItem('geel_daily_goals', JSON.stringify(this.dailyGoals));
  },
  saveChecklist() {
    localStorage.setItem('geel_checklist', JSON.stringify(this.checklist));
  },
  logActivity(text, icon = 'fa-check') {
    const act = { text, icon, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.recentActivity.unshift(act);
    if (this.recentActivity.length > 10) this.recentActivity.pop();
    localStorage.setItem('geel_recent_activity', JSON.stringify(this.recentActivity));
    renderRecentActivity();
  }
};

/* Toast Notification Utility */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/* Web Speech API: 100% Offline Audio Pronunciation */
function speakWord(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast(`Pronouncing: "${word}"`, 'info');
  } else {
    showToast('Offline speech synthesis not supported by this browser.', 'warning');
  }
}

/* ==========================================================================
   Theme & Typography Management
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('geel_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  const settingsToggle = document.getElementById('settings-theme-toggle');

  const handler = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('geel_theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'success');
  };

  if (toggleBtn) toggleBtn.addEventListener('click', handler);
  if (settingsToggle) settingsToggle.addEventListener('click', handler);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

function initFontSize() {
  const savedSize = localStorage.getItem('geel_font_size') || 'standard';
  applyFontSize(savedSize);

  const fontBtn = document.getElementById('btn-font-size');
  if (fontBtn) {
    fontBtn.addEventListener('click', () => {
      const sizes = ['standard', 'large', 'xl'];
      const nextIdx = (sizes.indexOf(localStorage.getItem('geel_font_size') || 'standard') + 1) % sizes.length;
      const nextSize = sizes[nextIdx];
      applyFontSize(nextSize);
      showToast(`Font Size: ${nextSize.toUpperCase()}`, 'info');
    });
  }

  document.querySelectorAll('#settings-font-pills .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#settings-font-pills .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const size = btn.getAttribute('data-font');
      applyFontSize(size);
      showToast(`Font Size: ${size.toUpperCase()}`, 'info');
    });
  });
}

function applyFontSize(size) {
  document.documentElement.classList.remove('font-size-large', 'font-size-xl');
  if (size === 'large') document.documentElement.classList.add('font-size-large');
  if (size === 'xl') document.documentElement.classList.add('font-size-xl');
  localStorage.setItem('geel_font_size', size);
}

function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress');
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (progressBar) progressBar.style.width = scrolled + '%';
  });
}

/* ==========================================================================
   Sidebar & Navigation Engine
   ========================================================================== */
function initSidebar() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarClose = document.getElementById('sidebar-close');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-locked');
  };

  const openSidebar = () => {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.classList.add('sidebar-locked');
  };

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
      const popoverModal = document.getElementById('popover-modal');
      if (popoverModal) popoverModal.classList.remove('open');
    }
  });

  // Delegated binding for all view switchers
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('[data-view-target]');
    if (targetLink) {
      e.preventDefault();
      const targetView = targetLink.getAttribute('data-view-target');
      switchView(targetView);
      if (window.innerWidth <= 900) closeSidebar();
    }
  });

  // Inject 16 Master Textbook Chapters into Sidebar
  const navContainer = document.getElementById('nav-all-chapters');
  if (navContainer && window.GEEL_DATA && window.GEEL_DATA.modules) {
    navContainer.innerHTML = '';
    window.GEEL_DATA.modules.forEach(mod => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a class="nav-item" data-module-id="${mod.id}">
          <i class="fas ${getModuleIcon(mod.category)}"></i>
          <span>${cleanNavTitle(mod.title)}</span>
        </a>
      `;
      li.querySelector('a').addEventListener('click', () => {
        loadModuleContent(mod);
        if (window.innerWidth <= 900) closeSidebar();
      });
      navContainer.appendChild(li);
    });
  }

  updateBookmarkBadges();
  updateNoteBadges();
  updateProgressDisplays();
}

function cleanNavTitle(title) {
  return title.replace(/^(Chapter \d+:|GEEL-1106.*?:|Course Overview & )/, '').trim();
}

function getModuleIcon(category) {
  switch (category) {
    case 'Grammar': return 'fa-spell-check';
    case 'Reading': return 'fa-book-reader';
    case 'Writing': return 'fa-pen-fancy';
    case 'Analysis': return 'fa-chart-pie';
    case 'Practice': return 'fa-tasks';
    case 'Revision': return 'fa-bolt';
    default: return 'fa-file-alt';
  }
}

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    AppState.currentView = viewId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-view-target') === viewId) {
      item.classList.add('active');
    }
  });
}

function loadModuleContent(mod) {
  const container = document.getElementById('module-reader-container');
  const titleElem = document.getElementById('module-reader-title');
  const categoryBadge = document.getElementById('module-reader-category');

  if (container && titleElem) {
    titleElem.textContent = mod.title;
    if (categoryBadge) categoryBadge.textContent = mod.category;
    container.innerHTML = renderMarkdown(mod.content);
    
    // Save last viewed module
    AppState.lastViewedModule = mod.id;
    localStorage.setItem('geel_last_module', mod.id);
    AppState.logActivity(`Read ${cleanNavTitle(mod.title)}`, 'fa-book-reader');
    renderContinueReading();
    
    // Wire up mark complete button
    const completeBtn = document.getElementById('btn-mark-chapter-complete');
    if (completeBtn) {
      const isDone = AppState.progress.completedModules.includes(mod.id);
      completeBtn.innerHTML = isDone ? `<i class="fas fa-check-circle"></i> Completed` : `<i class="fas fa-check"></i> Mark Complete`;
      completeBtn.onclick = () => {
        if (!AppState.progress.completedModules.includes(mod.id)) {
          AppState.progress.completedModules.push(mod.id);
          AppState.saveProgress();
          completeBtn.innerHTML = `<i class="fas fa-check-circle"></i> Completed`;
          showToast(`Marked ${cleanNavTitle(mod.title)} as Complete!`, 'success');
          AppState.logActivity(`Completed ${cleanNavTitle(mod.title)}`, 'fa-check-circle');
        } else {
          AppState.progress.completedModules = AppState.progress.completedModules.filter(id => id !== mod.id);
          AppState.saveProgress();
          completeBtn.innerHTML = `<i class="fas fa-check"></i> Mark Complete`;
          showToast(`Unmarked ${cleanNavTitle(mod.title)}`, 'info');
        }
      };
    }

    switchView('view-module-reader');
  }
}

/* ==========================================================================
   Exam Countdown Engine
   ========================================================================== */
function initExamCountdown() {
  const savedDate = localStorage.getItem('geel_exam_date');
  let targetDate;
  if (savedDate) {
    targetDate = new Date(savedDate);
  } else {
    // Default: 14 days from today
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);
    targetDate.setHours(10, 0, 0, 0);
  }

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      const text = "Exam Today!";
      if (document.getElementById('header-countdown-text')) document.getElementById('header-countdown-text').textContent = text;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');

    if (document.getElementById('cd-days')) document.getElementById('cd-days').textContent = pad(days);
    if (document.getElementById('cd-hours')) document.getElementById('cd-hours').textContent = pad(hours);
    if (document.getElementById('cd-mins')) document.getElementById('cd-mins').textContent = pad(mins);
    if (document.getElementById('cd-secs')) document.getElementById('cd-secs').textContent = pad(secs);

    if (document.getElementById('header-countdown-text')) {
      document.getElementById('header-countdown-text').textContent = `Exam in ${days}d ${hours}h`;
    }
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   Home Dashboard Features
   ========================================================================== */
function initDashboard() {
  renderDailyGoals();
  renderRecentActivity();
  renderContinueReading();
  renderTopRulesSpotlight();

  const resetGoalsBtn = document.getElementById('btn-reset-daily-goals');
  if (resetGoalsBtn) {
    resetGoalsBtn.addEventListener('click', () => {
      AppState.dailyGoals = null;
      renderDailyGoals();
      showToast('Daily Goals reset!', 'info');
    });
  }
}

function renderDailyGoals() {
  const container = document.getElementById('dashboard-daily-goals');
  if (!container) return;

  const defaultGoals = [
    { id: 'dg-1', text: 'Review SVA Headword Concord & Additive Rules', done: false },
    { id: 'dg-2', text: 'Solve 10 Inverted Conditionals Practice Drills', done: false },
    { id: 'dg-3', text: 'Read Passage 17C ("The Path of Power") & Vocabulary', done: false },
    { id: 'dg-4', text: 'Compose a 45–50 Word Precision Summary in Studio', done: false },
    { id: 'dg-5', text: 'Take a 45-Minute Timed Mock Exam Simulator', done: false }
  ];

  if (!AppState.dailyGoals) {
    AppState.dailyGoals = defaultGoals;
    AppState.saveDailyGoals();
  }

  container.innerHTML = '';
  AppState.dailyGoals.forEach(g => {
    const li = document.createElement('li');
    li.className = `checklist-item ${g.done ? 'done' : ''}`;
    li.innerHTML = `
      <input type="checkbox" id="${g.id}" ${g.done ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
      <label for="${g.id}" style="cursor: pointer; flex: 1;">${g.text}</label>
    `;
    li.querySelector('input').addEventListener('change', (e) => {
      g.done = e.target.checked;
      li.classList.toggle('done', g.done);
      AppState.saveDailyGoals();
      if (g.done) {
        showToast(`Goal Completed: ${g.text.substring(0, 24)}...`, 'success');
        AppState.logActivity(`Completed Goal: ${g.text.substring(0, 30)}...`, 'fa-check');
      }
    });
    container.appendChild(li);
  });
}

function renderRecentActivity() {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;
  if (!AppState.recentActivity || AppState.recentActivity.length === 0) {
    container.innerHTML = `<div style="font-size: 13px; color: var(--text-faint); padding: 8px 0;">No recent study activity recorded. Start browsing modules!</div>`;
    return;
  }
  container.innerHTML = AppState.recentActivity.slice(0, 5).map(act => `
    <div class="activity-item">
      <i class="fas ${act.icon}"></i>
      <span style="flex: 1;">${act.text}</span>
      <span style="font-size: 11px; color: var(--text-faint);">${act.time}</span>
    </div>
  `).join('');
}

function renderContinueReading() {
  const container = document.getElementById('continue-reading-card');
  if (!container) return;

  if (AppState.lastViewedModule && window.GEEL_DATA && window.GEEL_DATA.modules) {
    const mod = window.GEEL_DATA.modules.find(m => m.id === AppState.lastViewedModule);
    if (mod) {
      container.innerHTML = `
        <span style="font-size: 11.5px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase;">${mod.category} Module</span>
        <h4 style="font-size: 16px; font-weight: 700; margin: 2px 0;">${cleanNavTitle(mod.title)}</h4>
        <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.4;">Pick up right where you stopped in your last study session.</p>
        <button class="btn-primary" style="margin-top: 8px; width: fit-content;" id="btn-resume-module"><i class="fas fa-play"></i> Resume Chapter</button>
      `;
      container.querySelector('#btn-resume-module').onclick = () => loadModuleContent(mod);
      return;
    }
  }

  container.innerHTML = `
    <h4 style="font-size: 15px; font-weight: 700;">Chapter 1: Subject-Verb Agreement</h4>
    <p style="font-size: 12.5px; color: var(--text-muted);">Start reading the foundation of university examination grammar.</p>
    <button class="btn-primary" style="margin-top: 8px; width: fit-content;" onclick="loadModuleContent(window.GEEL_DATA.modules[1])"><i class="fas fa-book-open"></i> Start Reading</button>
  `;
}

function renderTopRulesSpotlight() {
  const container = document.getElementById('top-rules-spotlight');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.topRules) return;

  const spotlight = window.GEEL_DATA.topRules.slice(0, 4);
  container.innerHTML = spotlight.map(r => `
    <div style="padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer;" onclick="switchView('view-rules')">
      <div style="font-size: 11px; font-weight: 800; color: var(--primary);">RULE #${r.id || r.number || 0}</div>
      <div style="font-size: 13.5px; font-weight: 600; margin: 2px 0;">${r.title || ''}</div>
      <div style="font-size: 12px; color: var(--text-muted);">${(r.rule || r.description || '').substring(0, 90)}...</div>
    </div>
  `).join('');
}

function updateProgressDisplays() {
  const completedModCount = AppState.progress.completedModules.length;
  const masteredRuleCount = AppState.progress.masteredRules.length;
  const totalMod = (window.GEEL_DATA && window.GEEL_DATA.modules) ? window.GEEL_DATA.modules.length : 16;
  const percent = Math.round(((completedModCount / totalMod) * 0.6 + (masteredRuleCount / 100) * 0.4) * 100);

  if (document.getElementById('sidebar-progress-percent')) document.getElementById('sidebar-progress-percent').textContent = `${percent}%`;
  if (document.getElementById('sidebar-progress-fill')) document.getElementById('sidebar-progress-fill').style.width = `${percent}%`;
  if (document.getElementById('sidebar-rules-mastered')) document.getElementById('sidebar-rules-mastered').textContent = `${masteredRuleCount}/100 Rules`;
  if (document.getElementById('sidebar-completed-modules')) document.getElementById('sidebar-completed-modules').textContent = `${completedModCount}/${totalMod} Modules`;

  if (document.getElementById('stat-completed-modules')) document.getElementById('stat-completed-modules').textContent = `${completedModCount} / ${totalMod}`;
  if (document.getElementById('stat-rules-mastered')) document.getElementById('stat-rules-mastered').textContent = `${masteredRuleCount} / 100`;
}

function updateBookmarkBadges() {
  const count = AppState.bookmarks.length;
  if (document.getElementById('nav-badge-bookmarks')) document.getElementById('nav-badge-bookmarks').textContent = count;
  if (document.getElementById('header-bookmark-badge')) document.getElementById('header-bookmark-badge').textContent = count;
  if (document.getElementById('stat-bookmarks-count')) document.getElementById('stat-bookmarks-count').textContent = count;
}

function updateNoteBadges() {
  const count = AppState.notes.length;
  if (document.getElementById('nav-badge-notes')) document.getElementById('nav-badge-notes').textContent = count;
}

function updateQuizDisplays() {
  const acc = AppState.quizStats.attempted > 0 ? Math.round((AppState.quizStats.score / AppState.quizStats.attempted) * 100) : 0;
  if (document.getElementById('stat-quiz-accuracy')) document.getElementById('stat-quiz-accuracy').textContent = `${acc}%`;
}

/* ==========================================================================
   Global Search Engine
   ========================================================================== */
function initGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const dropdown = document.getElementById('search-results-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    const results = [];

    // Search Rules
    if (window.GEEL_DATA && window.GEEL_DATA.topRules) {
      window.GEEL_DATA.topRules.forEach(r => {
        if (r.title.toLowerCase().includes(q) || r.rule.toLowerCase().includes(q) || r.example.toLowerCase().includes(q)) {
          results.push({ type: 'Rule', title: `Rule #${r.id}: ${r.title}`, snippet: r.rule, action: () => { switchView('view-rules'); filterRulesKeyword(r.title); } });
        }
      });
    }

    // Search Vocab
    if (window.GEEL_DATA && window.GEEL_DATA.vocabList) {
      window.GEEL_DATA.vocabList.forEach(v => {
        if (v.word.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q) || v.synonyms.toLowerCase().includes(q)) {
          results.push({ type: 'Vocabulary', title: v.word, snippet: `${v.meaning} (${v.pos})`, action: () => { switchView('view-vocab'); filterVocabKeyword(v.word); } });
        }
      });
    }

    // Search Mistakes
    if (window.GEEL_DATA && window.GEEL_DATA.topMistakes) {
      window.GEEL_DATA.topMistakes.forEach(m => {
        if (m.incorrect.toLowerCase().includes(q) || m.correct.toLowerCase().includes(q) || m.explanation.toLowerCase().includes(q)) {
          results.push({ type: 'Mistake Fixed', title: `Mistake #${m.id}`, snippet: `Correct: ${m.correct}`, action: () => switchView('view-mistakes') });
        }
      });
    }

    // Search Past Questions
    if (window.GEEL_DATA && window.GEEL_DATA.previousQuestions) {
      window.GEEL_DATA.previousQuestions.forEach(pq => {
        if (pq.question.toLowerCase().includes(q) || pq.modelAnswer.toLowerCase().includes(q) || pq.topic.toLowerCase().includes(q)) {
          results.push({ type: 'Past Question', title: `${pq.year} ${pq.semester}: ${pq.topic}`, snippet: pq.question, action: () => switchView('view-prev-questions') });
        }
      });
    }

    // Render results
    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding: 14px; font-size: 13px; color: var(--text-muted); text-align: center;">No matches found for "${escapeHtml(q)}"</div>`;
    } else {
      dropdown.innerHTML = results.slice(0, 8).map((res, i) => `
        <div class="search-result-item" data-idx="${i}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="search-result-title">${escapeHtml(res.title)}</span>
            <span class="nav-badge" style="font-size: 10px;">${res.type}</span>
          </div>
          <div class="search-result-meta">${escapeHtml(res.snippet.substring(0, 90))}...</div>
        </div>
      `).join('');

      dropdown.querySelectorAll('.search-result-item').forEach((elem, idx) => {
        elem.onclick = () => {
          results[idx].action();
          dropdown.style.display = 'none';
          input.value = '';
        };
      });
    }
    dropdown.style.display = 'block';
  });

  // Close dropdown on outer click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      dropdown.style.display = 'none';
    }
  });
}

function filterRulesKeyword(kw) {
  const input = document.getElementById('rules-search-input');
  if (input) {
    input.value = kw;
    input.dispatchEvent(new Event('input'));
  }
}

function filterVocabKeyword(kw) {
  const input = document.getElementById('vocab-search-input');
  if (input) {
    input.value = kw;
    input.dispatchEvent(new Event('input'));
  }
}

/* ==========================================================================
   Top 100 Rules Catalog Engine
   ========================================================================== */
function initRulesCatalog() {
  const container = document.getElementById('rules-list-container');
  const searchInput = document.getElementById('rules-search-input');
  const categoryFilters = document.getElementById('rules-category-filters');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.topRules) return;

  let activeCat = 'all';
  let searchTerm = '';

  function render() {
    let filtered = window.GEEL_DATA.topRules.filter(r => {
      const matchCat = (activeCat === 'all') ||
        (activeCat === 'sva' && r.id >= 1 && r.id <= 21) ||
        (activeCat === 'conditionals' && r.id >= 22 && r.id <= 33) ||
        (activeCat === 'causatives' && r.id >= 34 && r.id <= 42) ||
        (activeCat === 'verbs' && r.id >= 43 && r.id <= 61) ||
        (activeCat === 'modifiers' && r.id >= 62 && r.id <= 70) ||
        (activeCat === 'prepositions' && r.id >= 71 && r.id <= 100);

      const matchText = searchTerm === '' ||
        r.title.toLowerCase().includes(searchTerm) ||
        r.rule.toLowerCase().includes(searchTerm) ||
        r.example.toLowerCase().includes(searchTerm);

      return matchCat && matchText;
    });

    if (document.getElementById('rules-count-display')) {
      document.getElementById('rules-count-display').textContent = `Showing ${filtered.length} of 100 Rules`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="reader-article" style="text-align: center; color: var(--text-muted);">No rules match your search query.</div>`;
      return;
    }

    container.innerHTML = filtered.map(r => {
      const isMastered = AppState.progress.masteredRules.includes(r.id);
      const isBookmarked = AppState.bookmarks.some(b => b.id === `rule-${r.id}`);

      return `
        <div class="rule-card ${isMastered ? 'mastered' : ''}" id="rule-card-${r.id}">
          <div class="rule-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="rule-badge">RULE #${r.id}</span>
              <span style="font-size: 11px; color: var(--text-faint); font-weight: 600;">GEEL-1106</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-text-sm" onclick="toggleBookmark('rule-${r.id}', 'Rule', 'Rule #${r.id}: ${escapeHtml(r.title)}', '${escapeHtml(r.rule.substring(0, 80))}')" title="Bookmark Rule">
                <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark" style="color: var(--accent-amber);"></i>
              </button>
              <button class="btn-text-sm" onclick="toggleMasteredRule(${r.id})" title="Mark as Mastered">
                <i class="fas ${isMastered ? 'fa-check-circle' : 'fa-circle'}" style="color: var(--accent-emerald);"></i>
              </button>
            </div>
          </div>
          <h3 class="rule-title">${r.title}</h3>
          <p class="rule-desc">${r.rule}</p>
          <div class="rule-example">
            <strong style="color: var(--primary);">Exam Exemplar:</strong> <em>${r.example}</em>
          </div>
        </div>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  if (categoryFilters) {
    categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.getAttribute('data-rule-cat');
        render();
      });
    });
  }

  render();
}

function toggleMasteredRule(id) {
  if (AppState.progress.masteredRules.includes(id)) {
    AppState.progress.masteredRules = AppState.progress.masteredRules.filter(rId => rId !== id);
    showToast(`Unmarked Rule #${id}`, 'info');
  } else {
    AppState.progress.masteredRules.push(id);
    showToast(`Mastered Rule #${id}!`, 'success');
    AppState.logActivity(`Mastered Rule #${id}`, 'fa-star');
  }
  AppState.saveProgress();
  initRulesCatalog();
}

/* ==========================================================================
   Subject-Verb Agreement (SVA) Explorer
   ========================================================================== */
function initSVAExplorer() {
  const container = document.getElementById('sva-rules-container');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.topRules) return;

  const svaRules = window.GEEL_DATA.topRules.slice(0, 21);
  let activeFilter = 'all';

  function render() {
    let filtered = svaRules;
    if (activeFilter === 'headword') filtered = svaRules.filter(r => [1, 8, 9, 10, 11].includes(r.id));
    if (activeFilter === 'additive') filtered = svaRules.filter(r => [2].includes(r.id));
    if (activeFilter === 'proximity') filtered = svaRules.filter(r => [3, 4, 5].includes(r.id));
    if (activeFilter === 'quantifier') filtered = svaRules.filter(r => [6, 7, 14, 15, 16, 17].includes(r.id));
    if (activeFilter === 'collective') filtered = svaRules.filter(r => [18, 19, 20, 21].includes(r.id));

    container.innerHTML = filtered.map(r => `
      <div class="rule-card">
        <div class="rule-header">
          <span class="rule-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc;">CONCORD RULE #${r.id}</span>
          <button class="btn-text-sm" onclick="toggleBookmark('rule-${r.id}', 'Rule', 'Rule #${r.id}: ${escapeHtml(r.title)}', '${escapeHtml(r.rule.substring(0, 80))}')">
            <i class="far fa-bookmark" style="color: var(--accent-amber);"></i>
          </button>
        </div>
        <h3 class="rule-title">${r.title}</h3>
        <p class="rule-desc">${r.rule}</p>
        <div class="rule-example">
          <strong style="color: var(--accent-purple);">Exemplar:</strong> <em>${r.example}</em>
        </div>
      </div>
    `).join('');
  }

  document.querySelectorAll('[data-sva-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sva-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-sva-filter');
      render();
    });
  });

  render();
}

/* ==========================================================================
   Conditionals Explorer
   ========================================================================== */
function initConditionalsExplorer() {
  const container = document.getElementById('conditionals-cards-container');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.conditionalsData) return;

  container.innerHTML = window.GEEL_DATA.conditionalsData.map((c, idx) => `
    <div class="conditional-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="cond-badge" style="background: ${c.badgeColor};">${c.type}</span>
        <span style="font-size: 11.5px; color: var(--text-faint); font-weight: 600;"><i class="fas fa-history"></i> ${c.timeline}</span>
      </div>
      <h3 style="font-size: 17px; font-weight: 700;">${c.name}</h3>
      <div class="cond-formula-tag"><code>${c.combinedFormula}</code></div>
      <p style="font-size: 13.5px; color: var(--text-muted);">${c.usage}</p>
      
      <div>
        <strong style="font-size: 12px; color: var(--text-main); text-transform: uppercase;">Real-World Exemplars:</strong>
        <ul style="margin: 6px 0 0 16px; font-size: 13px; color: var(--text-muted);">
          ${c.examples.map(ex => `<li><strong>${ex.if}</strong>, ${ex.result} <small style="color: var(--text-faint);">(${ex.note})</small></li>`).join('')}
        </ul>
      </div>

      <div class="alert-box alert-warning" style="margin: 0; padding: 10px 12px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 14px;"></i>
        <div style="font-size: 12.5px;">${c.commonMistake}</div>
      </div>

      <!-- Mini Quiz -->
      <div class="cond-quiz-box" id="cond-quiz-${idx}">
        <div style="font-size: 12px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px;">
          <i class="fas fa-vial"></i> Quick Drill:
        </div>
        <p style="font-size: 13px; margin-bottom: 8px;">${c.miniQuiz.question}</p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${c.miniQuiz.options.map(opt => `
            <button class="btn-sm btn-outline" onclick="checkCondQuiz(${idx}, '${opt}', '${c.miniQuiz.answer}', '${escapeHtml(c.miniQuiz.explanation)}')">${opt}</button>
          `).join('')}
        </div>
        <div id="cond-quiz-ans-${idx}" style="font-size: 12px; margin-top: 8px; display: none;"></div>
      </div>
    </div>
  `).join('');
}

function checkCondQuiz(idx, selected, correct, expl) {
  const ansDiv = document.getElementById(`cond-quiz-ans-${idx}`);
  if (!ansDiv) return;
  ansDiv.style.display = 'block';
  if (selected === correct) {
    ansDiv.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 700;"><i class="fas fa-check"></i> Correct!</span> ${expl}`;
    showToast('Correct Conditional Answer!', 'success');
  } else {
    ansDiv.innerHTML = `<span style="color: var(--accent-rose); font-weight: 700;"><i class="fas fa-times"></i> Incorrect. Correct is: "${correct}".</span> ${expl}`;
  }
}

/* ==========================================================================
   Causative Verbs Explorer
   ========================================================================== */
function initCausativesExplorer() {
  const container = document.getElementById('causatives-cards-container');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.causativesData) return;

  const data = window.GEEL_DATA.causativesData;
  container.innerHTML = data.verbs.map(v => `
    <div class="causative-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--accent-amber);">${v.verb}</h3>
        <span class="nav-badge">${v.forms.join(', ')}</span>
      </div>
      <p style="font-size: 13.5px; color: var(--text-muted);"><strong>Nuance:</strong> ${v.nuance}</p>

      <div>
        <div class="formula-box active-f"><strong>Active:</strong> <code>${v.activeFormula}</code></div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 8px; padding-left: 10px;">
          <em>Ex: "${v.activeExample}"</em>
        </div>

        <div class="formula-box passive-f"><strong>Passive:</strong> <code>${v.passiveFormula}</code></div>
        <div style="font-size: 12.5px; color: var(--text-muted); padding-left: 10px;">
          <em>Ex: "${v.passiveExample}"</em>
        </div>
      </div>

      <div class="alert-box alert-warning" style="margin: 4px 0 0; padding: 10px 12px; font-size: 12.5px;">
        <i class="fas fa-radiation" style="font-size: 14px;"></i>
        <div>${v.commonMistake}</div>
      </div>

      <div style="font-size: 12px; color: var(--accent-cyan); font-weight: 600;">
        <i class="fas fa-lightbulb"></i> Exam Tip: ${v.examTip}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Common Mistakes Explorer
   ========================================================================== */
function initMistakesExplorer() {
  const container = document.getElementById('mistakes-list-container');
  const searchInput = document.getElementById('mistakes-search-input');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.topMistakes) return;

  let searchTerm = '';

  function render() {
    let filtered = window.GEEL_DATA.topMistakes;
    if (searchTerm !== '') {
      filtered = filtered.filter(m =>
        m.incorrect.toLowerCase().includes(searchTerm) ||
        m.correct.toLowerCase().includes(searchTerm) ||
        m.explanation.toLowerCase().includes(searchTerm) ||
        m.category.toLowerCase().includes(searchTerm)
      );
    }

    if (document.getElementById('mistakes-count-display')) {
      document.getElementById('mistakes-count-display').textContent = `Showing ${filtered.length} of 50 Mistakes`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="reader-article" style="text-align: center; color: var(--text-muted);">No mistakes match your query.</div>`;
      return;
    }

    container.innerHTML = filtered.map(m => `
      <div class="mistake-card">
        <div class="mistake-header">
          <span class="mistake-badge">MISTAKE #${m.id}</span>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${m.category}</span>
        </div>

        <div class="mistake-row incorrect">
          <i class="fas fa-times-circle"></i>
          <div><strong>Incorrect:</strong> <em>"${m.incorrect}"</em></div>
        </div>

        <div class="mistake-row correct">
          <i class="fas fa-check-circle"></i>
          <div><strong>Correct:</strong> <em>"${m.correct}"</em></div>
        </div>

        <div class="mistake-expl">
          <strong>Grammatical Rationale:</strong> ${m.explanation}
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  render();
}

/* ==========================================================================
   Seen Passages Reader (Tibbitts 11C–20C)
   ========================================================================== */
function initSeenPassagesReader() {
  const tabsContainer = document.getElementById('seen-passage-tabs');
  const contentContainer = document.getElementById('seen-passage-content-container');
  if (!tabsContainer || !contentContainer || !window.GEEL_DATA || !window.GEEL_DATA.seenPassages) return;

  const passages = window.GEEL_DATA.seenPassages;
  let currentIdx = 0;

  tabsContainer.innerHTML = passages.map((p, idx) => `
    <button class="passage-tab-btn ${idx === 0 ? 'active' : ''}" data-p-idx="${idx}">
      ${p.unit}: ${p.title.substring(0, 22)}...
    </button>
  `).join('');

  tabsContainer.querySelectorAll('.passage-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.passage-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentIdx = parseInt(btn.getAttribute('data-p-idx'), 10);
      renderPassage(passages[currentIdx]);
    });
  });

  renderPassage(passages[0]);
}

function openSeenPassage(passageId) {
  switchView('view-seen-passages');
  if (window.GEEL_DATA && window.GEEL_DATA.seenPassages) {
    const idx = window.GEEL_DATA.seenPassages.findIndex(p => p.id === passageId);
    if (idx !== -1) {
      const tabs = document.querySelectorAll('#seen-passage-tabs .passage-tab-btn');
      if (tabs[idx]) tabs[idx].click();
    }
  }
}

function renderPassage(p) {
  const container = document.getElementById('seen-passage-content-container');
  if (!container) return;

  // Enhance passage text by making vocabulary words interactive
  let textHtml = escapeHtml(p.fullText).replace(/\n\n/g, '</p><p>');
  if (p.vocabulary) {
    p.vocabulary.forEach(v => {
      const reg = new RegExp(`\\b(${v.word})\\b`, 'gi');
      textHtml = textHtml.replace(reg, `<span class="interactive-word" onclick="showWordPopover('${v.word}')">$1</span>`);
    });
  }

  container.innerHTML = `
    <div class="reader-article">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <div>
          <span class="hero-tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;"><i class="fas fa-book"></i> Tibbitts ${p.unit}</span>
          <h2 style="margin: 4px 0 6px;">${p.title}</h2>
          <div style="font-size: 13px; color: var(--text-muted);"><i class="fas fa-history"></i> Exam Frequency: <strong>${p.examHistory}</strong></div>
        </div>
        <button class="btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Passage</button>
      </div>

      <div class="alert-box alert-info">
        <i class="fas fa-info-circle"></i>
        <div><strong>Background:</strong> ${p.intro}</div>
      </div>

      <h3 style="margin-top: 24px;"><i class="fas fa-align-left"></i> Authentic Passage Text (Click any highlighted word):</h3>
      <div style="font-size: 15px; line-height: 1.8; margin-top: 12px; background: var(--bg-surface); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <p>${textHtml}</p>
      </div>

      <div style="margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--accent-cyan);"><i class="fas fa-lightbulb"></i> Core Theme:</strong>
          <p style="font-size: 13.5px; margin-top: 6px;">${p.theme}</p>
        </div>
        <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <strong style="color: var(--accent-emerald);"><i class="fas fa-balance-scale"></i> Moral & Message:</strong>
          <p style="font-size: 13.5px; margin-top: 6px;">${p.moral}</p>
        </div>
      </div>

      <h3 style="margin-top: 28px;"><i class="fas fa-feather-alt"></i> Model 50-Word Precision Summary:</h3>
      <div class="alert-box alert-success" style="font-size: 14.5px;">
        <div>${p.summary50Words}</div>
      </div>

      <h3 style="margin-top: 28px;"><i class="fas fa-question-circle"></i> Solved University Exam Questions & Model Answers:</h3>
      <div class="seen-questions-grid">
        ${p.questions.map((q, qIdx) => `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--primary); font-weight: 700; margin-bottom: 4px;">
              <span>QUESTION #${qIdx + 1} (${q.type})</span>
            </div>
            <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 8px;">${q.q}</div>
            <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid var(--accent-emerald); padding: 10px 14px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 13.5px;">
              <strong>Model Answer:</strong> ${q.modelAnswer}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* Modal Popover for In-Text Vocabulary */
function initModalPopover() {
  const modal = document.getElementById('popover-modal');
  const closeBtn = document.getElementById('popover-close');
  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('open');
    };
  }
}

function showWordPopover(wordText) {
  const modal = document.getElementById('popover-modal');
  const title = document.getElementById('popover-title');
  const content = document.getElementById('popover-content');
  if (!modal || !title || !content) return;

  let found = null;
  if (window.GEEL_DATA && window.GEEL_DATA.vocabList) {
    found = window.GEEL_DATA.vocabList.find(v => v.word.toLowerCase() === wordText.toLowerCase());
  }

  title.textContent = `Lexical Study: ${wordText}`;
  if (found) {
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main); margin: 0;">${found.word}</h2>
          <span class="nav-badge" style="margin-top: 4px; display: inline-block;">${found.pos}</span>
        </div>
        <button class="vocab-audio-btn" onclick="speakWord('${found.word}')" title="Pronounce">
          <i class="fas fa-volume-up"></i>
        </button>
      </div>

      <div style="font-size: 15px; color: var(--text-main); margin-bottom: 14px;">
        <strong>Contextual Meaning:</strong> ${found.meaning}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: var(--radius-sm);">
          <strong style="color: var(--accent-emerald); font-size: 12px;">SYNONYMS:</strong>
          <div style="font-size: 13px; margin-top: 2px;">${found.synonyms}</div>
        </div>
        <div style="background: rgba(244, 63, 94, 0.1); padding: 10px; border-radius: var(--radius-sm);">
          <strong style="color: var(--accent-rose); font-size: 12px;">ANTONYMS:</strong>
          <div style="font-size: 13px; margin-top: 2px;">${found.antonyms}</div>
        </div>
      </div>

      <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 13px;">
        <strong style="color: var(--primary);">Exam Exemplar:</strong> <em>"${found.sentence}"</em>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h2 style="font-size: 22px; font-weight: 800;">${wordText}</h2>
        <button class="vocab-audio-btn" onclick="speakWord('${wordText}')"><i class="fas fa-volume-up"></i></button>
      </div>
      <p style="font-size: 14px; color: var(--text-muted);">High-frequency seen passage vocabulary keyword from E.L. Tibbitts' reading units.</p>
    `;
  }
  modal.classList.add('open');
}

/* ==========================================================================
   Academic Vocabulary Module
   ========================================================================== */
function initVocabModule() {
  const container = document.getElementById('vocab-grid-container');
  const searchInput = document.getElementById('vocab-search-input');
  const btnAll = document.getElementById('btn-vocab-all');
  const btnBm = document.getElementById('btn-vocab-bookmarked');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.vocabList) return;

  let searchTerm = '';
  let onlyBookmarked = false;

  function render() {
    let list = window.GEEL_DATA.vocabList;
    if (onlyBookmarked) {
      list = list.filter(v => AppState.bookmarks.some(b => b.id === `vocab-${v.id}`));
    }
    if (searchTerm !== '') {
      list = list.filter(v =>
        v.word.toLowerCase().includes(searchTerm) ||
        v.meaning.toLowerCase().includes(searchTerm) ||
        v.synonyms.toLowerCase().includes(searchTerm) ||
        v.antonyms.toLowerCase().includes(searchTerm)
      );
    }

    if (document.getElementById('vocab-count-display')) {
      document.getElementById('vocab-count-display').textContent = `Showing ${list.length} of 50 Words`;
    }

    if (list.length === 0) {
      container.innerHTML = `<div class="reader-article" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No vocabulary words match your filter.</div>`;
      return;
    }

    container.innerHTML = list.map(v => {
      const isBookmarked = AppState.bookmarks.some(b => b.id === `vocab-${v.id}`);
      return `
        <div class="vocab-card">
          <div class="vocab-word-row">
            <div>
              <span class="vocab-word">${v.word}</span>
              <span class="nav-badge" style="font-size: 10px; margin-left: 6px;">${v.pos}</span>
            </div>
            <div style="display: flex; gap: 6px;">

              <button class="btn-text-sm" onclick="toggleBookmark('vocab-${v.id}', 'Vocabulary', '${v.word} (${v.pos})', '${escapeHtml(v.meaning)}')" title="Bookmark Word">
                <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark" style="color: var(--accent-amber); font-size: 15px;"></i>
              </button>
            </div>
          </div>

          <div class="vocab-meaning"><strong>Meaning:</strong> ${v.meaning}</div>

          <div style="font-size: 12.5px; color: var(--text-faint); margin-top: 2px;">
            <div style="color: var(--accent-emerald);"><strong>Syn:</strong> ${v.synonyms}</div>
            <div style="color: var(--accent-rose); margin-top: 1px;"><strong>Ant:</strong> ${v.antonyms}</div>
          </div>

          <div style="font-size: 12px; color: var(--text-muted); font-style: italic; border-top: 1px solid var(--border-subtle); padding-top: 6px; margin-top: auto;">
            "${v.sentence}"
          </div>
        </div>
      `;
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  if (btnAll && btnBm) {
    btnAll.onclick = () => {
      btnAll.classList.add('active');
      btnBm.classList.remove('active');
      onlyBookmarked = false;
      render();
    };
    btnBm.onclick = () => {
      btnBm.classList.add('active');
      btnAll.classList.remove('active');
      onlyBookmarked = true;
      render();
    };
  }

  render();
}

/* ==========================================================================
   50-Word Summary Studio
   ========================================================================== */
function initSummaryStudio() {
  const textarea = document.getElementById('summary-input');
  const countDisplay = document.getElementById('summary-word-count');
  const statusBadge = document.getElementById('summary-status-badge');
  const overflowContainer = document.getElementById('summary-overflow-container');
  const overflowText = document.getElementById('summary-overflow-text');
  const sourceBox = document.getElementById('summary-source-box');
  const copyBtn = document.getElementById('btn-copy-summary');
  const clearBtn = document.getElementById('btn-clear-summary');

  const samplePassages = [
    {
      title: "Autumn 2025: Bangladesh Healthcare Financing Policy",
      text: "Bangladesh faces critical healthcare financing challenges due to declining international partner aid. To address this resource gap, the government is pursuing bilateral health diplomacy for hospital modernization, pandemic negotiations, and non-communicable disease control. However, catastrophic out-of-pocket healthcare expenses plunge millions into poverty. Urgent fiscal reforms must expand domestic healthcare spending to guarantee universal public coverage."
    },
    {
      title: "Spring 2024: Cyber Hygiene in FinTech Banking",
      text: "The rapid digitalization of commercial banking and mobile financial services has triggered sophisticated cyber-attacks across the developing world. Financial syndicates exploit human vulnerabilities via social engineering and credential phishing. Developing robust multi-factor authentication, enforcing cryptographic data protection, and establishing continuous employee cyber drills remain paramount to safeguarding customer deposits and maintaining macroeconomic stability."
    },
    {
      title: "Autumn 2023: Renewable Microgrid Decentralization",
      text: "Centralized power grids in coastal delta regions suffer severe transmission losses and frequent climate-induced outages. Implementing decentralized solar and offshore wind microgrids provides resilient, zero-emission electricity to remote communities. Although initial capital expenditure remains high, long-term lifecycle savings and carbon credits justify accelerated sovereign investment in localized clean power infrastructure."
    }
  ];

  function renderSourcePassage(idx) {
    if (!sourceBox) return;
    const sp = samplePassages[idx];
    sourceBox.innerHTML = `
      <h4 style="color: var(--accent-cyan); margin-bottom: 8px;">Sample Examination Reading Passage:</h4>
      <div style="font-size: 12px; font-weight: 700; color: var(--text-faint); margin-bottom: 6px;">${sp.title}</div>
      <p style="font-size: 14px; color: var(--text-muted); line-height: 1.7;">${sp.text}</p>
    `;
  }

  document.querySelectorAll('.summary-passage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.summary-passage-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const idx = parseInt(btn.getAttribute('data-passage-idx'), 10);
      renderSourcePassage(idx);
    });
  });

  renderSourcePassage(0);

  if (textarea && countDisplay && statusBadge) {
    textarea.addEventListener('input', () => {
      const text = textarea.value.trim();
      const words = text ? text.split(/\s+/).filter(Boolean) : [];
      const count = words.length;

      countDisplay.textContent = `${count} / 50 words`;

      // Status indicator thresholds
      statusBadge.className = 'word-count-tag';
      if (count === 0) {
        statusBadge.classList.add('tag-empty');
        statusBadge.textContent = 'Empty (0 words)';
        if (overflowContainer) overflowContainer.style.display = 'none';
      } else if (count < 45) {
        statusBadge.classList.add('tag-short');
        statusBadge.textContent = `Too Short (Need 45–50) • ${45 - count} more words needed`;
        if (overflowContainer) overflowContainer.style.display = 'none';
      } else if (count <= 50) {
        statusBadge.classList.add('tag-optimal');
        statusBadge.textContent = '✓ Optimal Exam Length (45–50 words)';
        if (overflowContainer) overflowContainer.style.display = 'none';
      } else if (count <= 55) {
        statusBadge.classList.add('tag-warning');
        statusBadge.textContent = `Warning: ${count - 50} words over limit`;
        showOverflow(words);
      } else {
        statusBadge.classList.add('tag-over');
        statusBadge.textContent = `Penalty: Exceeds 50 words (-2 to -3 Marks)`;
        showOverflow(words);
      }
    });
  }

  function showOverflow(words) {
    if (!overflowContainer || !overflowText) return;
    overflowContainer.style.display = 'block';
    const underLimit = words.slice(0, 50).join(' ');
    const overLimit = words.slice(50).map(w => `<span class="overflow-word">${escapeHtml(w)}</span>`).join(' ');
    overflowText.innerHTML = `${escapeHtml(underLimit)} ${overLimit}`;
  }

  if (copyBtn && textarea) {
    copyBtn.onclick = () => {
      if (!textarea.value.trim()) {
        showToast('Nothing to copy!', 'warning');
        return;
      }
      navigator.clipboard.writeText(textarea.value);
      showToast('Summary copied to clipboard!', 'success');
    };
  }

  if (clearBtn && textarea) {
    clearBtn.onclick = () => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
      showToast('Summary editor cleared', 'info');
    };
  }
}

/* ==========================================================================
   Writing Workshop (Letters, Applications, Essays)
   ========================================================================== */
function initWritingWorkshop() {
  const tabsContainer = document.getElementById('writing-template-tabs');
  const displayContainer = document.getElementById('writing-template-display-container');
  if (!tabsContainer || !displayContainer || !window.GEEL_DATA || !window.GEEL_DATA.writingTemplates) return;

  const templates = window.GEEL_DATA.writingTemplates;
  let activeIdx = 0;

  tabsContainer.innerHTML = templates.map((t, idx) => `
    <button class="passage-tab-btn ${idx === 0 ? 'active' : ''}" data-wt-idx="${idx}">
      ${t.category}: ${t.title.substring(0, 24)}...
    </button>
  `).join('');

  tabsContainer.querySelectorAll('.passage-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.passage-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeIdx = parseInt(btn.getAttribute('data-wt-idx'), 10);
      renderTemplate(templates[activeIdx]);
    });
  });

  renderTemplate(templates[0]);
}

function renderTemplate(t) {
  const container = document.getElementById('writing-template-display-container');
  if (!container) return;

  container.innerHTML = `
    <div class="reader-article">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <div>
          <span class="nav-badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 11px;">${t.category}</span>
          <h2 style="margin: 4px 0 6px;">${t.title}</h2>
          <div style="font-size: 13.5px; color: var(--text-muted);"><strong>Purpose:</strong> ${t.purpose}</div>
        </div>
        <button class="btn-primary" id="btn-copy-template-text"><i class="fas fa-copy"></i> Copy Full Template</button>
      </div>

      <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
        <strong style="color: var(--accent-cyan); font-size: 13px;"><i class="fas fa-list-ol"></i> Official Structure Requirements:</strong>
        <ul style="margin: 8px 0 0 20px; font-size: 13px; color: var(--text-muted); line-height: 1.6;">
          ${t.structure.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="writing-dual-workspace">
        <div class="writing-model-col">
          <h3><i class="fas fa-file-alt"></i> Model Template Text:</h3>
          <pre style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; font-family: var(--font-mono); font-size: 13px; line-height: 1.6; color: var(--text-main); white-space: pre-wrap; overflow-x: auto;"><code>${escapeHtml(t.templateText)}</code></pre>

          <div class="alert-box alert-success" style="margin-top: 16px;">
            <i class="fas fa-lightbulb"></i>
            <div><strong>Examiner's Advice:</strong> ${t.tips}</div>
          </div>
        </div>

        <!-- Editable Practice Pad -->
        <div class="writing-practice-col">
          <h3><i class="fas fa-edit"></i> Interactive Practice Drafting Pad:</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Customize this template with your own details or draft your own version:</p>
          <textarea id="practice-draft-textarea" class="writing-practice-pad" placeholder="Type your drafted letter or essay here..."></textarea>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span id="practice-draft-counter" style="font-size: 13px; color: var(--text-muted);">0 words • 0 characters</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-text-sm" id="btn-insert-template-draft"><i class="fas fa-paste"></i> Load Template into Editor</button>
              <button class="btn-text-sm" id="btn-copy-practice-draft"><i class="fas fa-copy"></i> Copy Draft</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up template copy
  const copyBtn = document.getElementById('btn-copy-template-text');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(t.templateText);
      showToast('Template copied to clipboard!', 'success');
    };
  }

  // Wire up practice draft
  const pad = document.getElementById('practice-draft-textarea');
  const draftCounter = document.getElementById('practice-draft-counter');
  if (pad && draftCounter) {
    pad.addEventListener('input', () => {
      const words = pad.value.trim() ? pad.value.trim().split(/\s+/).filter(Boolean).length : 0;
      draftCounter.textContent = `${words} words • ${pad.value.length} characters`;
    });

    document.getElementById('btn-insert-template-draft').onclick = () => {
      pad.value = t.templateText;
      pad.dispatchEvent(new Event('input'));
      showToast('Template loaded into editor!', 'info');
    };

    document.getElementById('btn-copy-practice-draft').onclick = () => {
      if (!pad.value.trim()) return showToast('Draft is empty', 'warning');
      navigator.clipboard.writeText(pad.value);
      showToast('Draft copied to clipboard!', 'success');
    };
  }
}

/* ==========================================================================
   Previous Questions Explorer (2018–2025)
   ========================================================================== */
function initPreviousQuestions() {
  const container = document.getElementById('pq-list-container');
  const yearFilter = document.getElementById('pq-filter-year');
  const topicFilter = document.getElementById('pq-filter-topic');
  const diffFilter = document.getElementById('pq-filter-difficulty');
  const searchInput = document.getElementById('pq-search-input');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.previousQuestions) return;

  function render() {
    const yearVal = yearFilter ? yearFilter.value : 'all';
    const topicVal = topicFilter ? topicFilter.value : 'all';
    const diffVal = diffFilter ? diffFilter.value : 'all';
    const qVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let list = window.GEEL_DATA.previousQuestions.filter(pq => {
      const matchYear = yearVal === 'all' || pq.year === yearVal;
      const matchTopic = topicVal === 'all' || pq.topic === topicVal;
      const matchDiff = diffVal === 'all' || pq.difficulty === diffVal;
      const matchText = qVal === '' || pq.question.toLowerCase().includes(qVal) || pq.modelAnswer.toLowerCase().includes(qVal);
      return matchYear && matchTopic && matchDiff && matchText;
    });

    if (document.getElementById('pq-counter-display')) {
      document.getElementById('pq-counter-display').textContent = `Showing ${list.length} Solved Questions`;
    }

    if (list.length === 0) {
      container.innerHTML = `<div class="reader-article" style="text-align: center; color: var(--text-muted);">No questions match the selected filter combination.</div>`;
      return;
    }

    container.innerHTML = list.map((pq, idx) => `
      <div class="pq-card">
        <div class="pq-header">
          <div class="pq-badges">
            <span class="nav-badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8;">${pq.year} ${pq.semester}</span>
            <span class="nav-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc;">${pq.topic}</span>
            <span class="nav-badge">${pq.type}</span>
          </div>
          <button class="btn-text-sm" onclick="toggleBookmark('pq-${pq.id}', 'Previous Question', '${pq.year} ${pq.semester}: ${pq.topic}', '${escapeHtml(pq.question)}')">
            <i class="far fa-bookmark" style="color: var(--accent-amber);"></i>
          </button>
        </div>

        <div style="font-size: 15px; font-weight: 600; line-height: 1.5;">${pq.question}</div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <button class="btn-sm btn-outline" onclick="togglePQAnswer('${pq.id}')" id="btn-toggle-pq-${pq.id}">
            <i class="fas fa-eye"></i> Reveal Model Answer
          </button>
          <span style="font-size: 12px; color: var(--text-faint);">Difficulty: <strong>${pq.difficulty}</strong></span>
        </div>

        <div class="pq-answer-box" id="pq-ans-${pq.id}">
          <div style="margin-bottom: 4px; color: var(--accent-emerald); font-weight: 700;">
            <i class="fas fa-check-circle"></i> Official Model Answer:
          </div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">${pq.modelAnswer}</div>
          <div style="font-size: 12.5px; color: var(--text-muted);"><strong>Rule Reference:</strong> ${pq.explanation}</div>
        </div>
      </div>
    `).join('');
  }

  if (yearFilter) yearFilter.addEventListener('change', render);
  if (topicFilter) topicFilter.addEventListener('change', render);
  if (diffFilter) diffFilter.addEventListener('change', render);
  if (searchInput) searchInput.addEventListener('input', render);

  render();
}

function togglePQAnswer(id) {
  const ansBox = document.getElementById(`pq-ans-${id}`);
  const btn = document.getElementById(`btn-toggle-pq-${id}`);
  if (!ansBox || !btn) return;

  const isVisible = ansBox.classList.contains('revealed');
  ansBox.classList.toggle('revealed', !isVisible);
  btn.innerHTML = isVisible ? `<i class="fas fa-eye"></i> Reveal Model Answer` : `<i class="fas fa-eye-slash"></i> Hide Answer`;
}

/* ==========================================================================
   MCQ Quiz Simulator (Practice Mode)
   ========================================================================== */
function initMCQQuiz() {
  const container = document.getElementById('mcq-list-container');
  const resetBtn = document.getElementById('btn-reset-quiz');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.mcqs) return;

  let activeDiff = 'all';
  let score = 0;
  let attempted = 0;

  function render() {
    let list = window.GEEL_DATA.mcqs;
    if (activeDiff !== 'all') {
      list = list.filter(q => q.difficulty === activeDiff);
    }

    container.innerHTML = list.map((q, idx) => `
      <div class="mcq-card" id="mcq-card-${q.id}">
        <div class="mcq-header">
          <span>QUESTION #${idx + 1} of ${list.length}</span>
          <span class="nav-badge">${q.difficulty}</span>
        </div>
        <div class="mcq-question">${q.question}</div>
        <div class="mcq-options">
          ${q.options.map((opt, oIdx) => `
            <div class="mcq-option" data-qid="${q.id}" data-opt="${opt}" onclick="selectMCQOption(${q.id}, '${escapeHtml(opt)}', '${escapeHtml(q.answer)}', '${escapeHtml(q.explanation)}')">
              <span style="font-weight: 700; width: 22px;">${String.fromCharCode(65 + oIdx)}.</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
        <div class="mcq-explanation" id="mcq-expl-${q.id}"></div>
      </div>
    `).join('');
  }

  document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDiff = btn.getAttribute('data-difficulty');
      render();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      score = 0;
      attempted = 0;
      updateScores();
      render();
      showToast('Quiz reset!', 'info');
    });
  }

  function updateScores() {
    if (document.getElementById('quiz-score-val')) document.getElementById('quiz-score-val').textContent = score;
    if (document.getElementById('quiz-attempted-val')) document.getElementById('quiz-attempted-val').textContent = attempted;
    const pct = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    if (document.getElementById('quiz-percent-val')) document.getElementById('quiz-percent-val').textContent = `${pct}%`;

    AppState.quizStats.attempted = attempted;
    AppState.quizStats.score = score;
    AppState.saveQuizStats();
  }

  window.selectMCQOption = function(qid, selected, correct, explanation) {
    const card = document.getElementById(`mcq-card-${qid}`);
    const explBox = document.getElementById(`mcq-expl-${qid}`);
    if (!card || card.classList.contains('answered')) return;

    card.classList.add('answered');
    attempted++;

    const options = card.querySelectorAll('.mcq-option');
    options.forEach(opt => {
      opt.classList.add('disabled');
      const val = opt.getAttribute('data-opt');
      if (val === correct) opt.classList.add('correct');
      if (val === selected && selected !== correct) opt.classList.add('wrong');
    });

    if (selected === correct) {
      score++;
      showToast('Correct Answer!', 'success');
    } else {
      showToast('Incorrect Answer', 'warning');
    }

    if (explBox) {
      explBox.style.display = 'block';
      explBox.innerHTML = `<strong>Explanation:</strong> ${explanation}`;
    }

    updateScores();
  };

  render();
}

/* ==========================================================================
   45-Minute Timed Mock Test Simulator
   ========================================================================== */
function initMockTest() {
  const startBtn = document.getElementById('btn-start-mock-test');
  const clockDisplay = document.getElementById('mock-clock-display');
  const pauseBtn = document.getElementById('btn-mock-pause');
  const submitBtn = document.getElementById('btn-mock-submit');
  const configBar = document.getElementById('mock-config-bar');
  const paletteContainer = document.getElementById('mock-palette-container');
  const paletteGrid = document.getElementById('mock-palette-grid');
  const activeContainer = document.getElementById('mock-active-container');
  const qCard = document.getElementById('mock-question-card');
  const reportContainer = document.getElementById('mock-report-container');
  const prevBtn = document.getElementById('btn-mock-prev');
  const nextBtn = document.getElementById('btn-mock-next');

  let testTimer = null;
  let timeRemaining = 45 * 60; // 45 minutes in seconds
  let isPaused = false;
  let testQuestions = [];
  let userAnswers = {};
  let currentQIdx = 0;
  let useNegativeMarking = false;

  if (startBtn) {
    startBtn.onclick = () => {
      const randomize = document.getElementById('mock-randomize') ? document.getElementById('mock-randomize').checked : true;
      useNegativeMarking = document.getElementById('mock-neg-marking') ? document.getElementById('mock-neg-marking').checked : false;

      let pool = [...window.GEEL_DATA.mcqs];
      if (randomize) pool.sort(() => Math.random() - 0.5);
      testQuestions = pool.slice(0, 25);
      userAnswers = {};
      currentQIdx = 0;
      timeRemaining = 45 * 60;
      isPaused = false;

      configBar.style.display = 'none';
      paletteContainer.style.display = 'block';
      activeContainer.style.display = 'block';
      reportContainer.style.display = 'none';

      renderPalette();
      renderCurrentQuestion();
      startTimer();
      showToast('45-Minute Mock Test Started! Good luck.', 'info');
      AppState.logActivity('Started 45-Min Mock Test', 'fa-stopwatch-20');
    };
  }

  function startTimer() {
    clearInterval(testTimer);
    testTimer = setInterval(() => {
      if (isPaused) return;
      timeRemaining--;
      updateClockDisplay();
      if (timeRemaining <= 0) {
        clearInterval(testTimer);
        submitMockTest(true);
      }
    }, 1000);
  }

  function updateClockDisplay() {
    if (!clockDisplay) return;
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    clockDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (timeRemaining < 300) {
      clockDisplay.style.color = 'var(--accent-rose)';
    }
  }

  if (pauseBtn) {
    pauseBtn.onclick = () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused ? `<i class="fas fa-play"></i> Resume` : `<i class="fas fa-pause"></i> Pause`;
      showToast(isPaused ? 'Mock Test Paused' : 'Mock Test Resumed', 'info');
    };
  }

  if (submitBtn) {
    submitBtn.onclick = () => {
      const answeredCount = Object.keys(userAnswers).length;
      if (answeredCount < testQuestions.length) {
        if (!confirm(`You have answered ${answeredCount} of ${testQuestions.length} questions. Are you sure you want to submit?`)) return;
      }
      submitMockTest(false);
    };
  }

  function renderPalette() {
    if (!paletteGrid) return;
    paletteGrid.innerHTML = testQuestions.map((q, idx) => `
      <button class="pal-btn ${userAnswers[q.id] ? 'answered' : ''} ${idx === currentQIdx ? 'current' : ''}" onclick="jumpToMockQ(${idx})">
        ${idx + 1}
      </button>
    `).join('');

    const ansCount = Object.keys(userAnswers).length;
    if (document.getElementById('mock-answered-count')) {
      document.getElementById('mock-answered-count').textContent = ansCount;
    }
  }

  window.jumpToMockQ = function(idx) {
    currentQIdx = idx;
    renderCurrentQuestion();
    renderPalette();
  };

  function renderCurrentQuestion() {
    if (!qCard || testQuestions.length === 0) return;
    const q = testQuestions[currentQIdx];

    qCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
        <span>QUESTION ${currentQIdx + 1} OF ${testQuestions.length}</span>
        <span class="nav-badge">${q.difficulty}</span>
      </div>
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 20px;">${q.question}</div>
      <div class="mcq-options">
        ${q.options.map((opt, oIdx) => `
          <div class="mcq-option ${userAnswers[q.id] === opt ? 'correct' : ''}" onclick="selectMockOption(${q.id}, '${escapeHtml(opt)}')">
            <span style="font-weight: 700; width: 22px;">${String.fromCharCode(65 + oIdx)}.</span>
            <span>${opt}</span>
          </div>
        `).join('')}
      </div>
    `;

    if (prevBtn) prevBtn.disabled = currentQIdx === 0;
    if (nextBtn) nextBtn.disabled = currentQIdx === testQuestions.length - 1;
  }

  window.selectMockOption = function(qid, opt) {
    userAnswers[qid] = opt;
    renderCurrentQuestion();
    renderPalette();
  };

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentQIdx > 0) {
        currentQIdx--;
        renderCurrentQuestion();
        renderPalette();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentQIdx < testQuestions.length - 1) {
        currentQIdx++;
        renderCurrentQuestion();
        renderPalette();
      }
    };
  }

  function submitMockTest(isAuto) {
    clearInterval(testTimer);
    paletteContainer.style.display = 'none';
    activeContainer.style.display = 'none';
    reportContainer.style.display = 'block';

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const weakTopics = {};

    testQuestions.forEach(q => {
      const userOpt = userAnswers[q.id];
      if (!userOpt) {
        unanswered++;
      } else if (userOpt === q.answer) {
        correct++;
      } else {
        wrong++;
        weakTopics[q.difficulty] = (weakTopics[q.difficulty] || 0) + 1;
      }
    });

    let rawScore = correct;
    if (useNegativeMarking) rawScore -= (wrong * 0.25);
    rawScore = Math.max(0, rawScore);
    const pct = Math.round((rawScore / testQuestions.length) * 100);

    let letterGrade = 'F';
    let gradeColor = 'var(--accent-rose)';
    if (pct >= 80) { letterGrade = 'A+'; gradeColor = 'var(--accent-emerald)'; }
    else if (pct >= 75) { letterGrade = 'A'; gradeColor = 'var(--accent-emerald)'; }
    else if (pct >= 70) { letterGrade = 'A-'; gradeColor = 'var(--accent-cyan)'; }
    else if (pct >= 65) { letterGrade = 'B+'; gradeColor = 'var(--primary)'; }
    else if (pct >= 60) { letterGrade = 'B'; gradeColor = 'var(--accent-amber)'; }
    else if (pct >= 50) { letterGrade = 'C'; gradeColor = 'var(--accent-amber)'; }

    reportContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="hero-tag"><i class="fas fa-award"></i> Diagnostic Performance Evaluation</span>
        <h2>Semester End Mock Examination Report</h2>
        <div class="grade-badge" style="background: ${gradeColor};">${letterGrade}</div>
        <div style="font-size: 16px; color: var(--text-muted);">Final Scaled Score: <strong>${rawScore.toFixed(2)} / ${testQuestions.length}</strong> (${pct}%)</div>
        ${useNegativeMarking ? '<div style="font-size: 12px; color: var(--accent-rose); margin-top: 4px;">Negative Marking (-0.25) Applied</div>' : ''}
      </div>

      <div class="hero-stats" style="margin-bottom: 28px;">
        <div class="stat-box"><div class="stat-val" style="color: var(--accent-emerald);">${correct}</div><div class="stat-label">Correct Answers</div></div>
        <div class="stat-box"><div class="stat-val" style="color: var(--accent-rose);">${wrong}</div><div class="stat-label">Incorrect Answers</div></div>
        <div class="stat-box"><div class="stat-val" style="color: var(--text-faint);">${unanswered}</div><div class="stat-label">Unanswered</div></div>
        <div class="stat-box"><div class="stat-val" style="color: var(--primary);">${Math.floor((45 * 60 - timeRemaining) / 60)}m</div><div class="stat-label">Time Elapsed</div></div>
      </div>

      <h3 style="margin-bottom: 12px;"><i class="fas fa-clipboard-check"></i> Question-by-Question Review & Explanations:</h3>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${testQuestions.map((q, idx) => {
          const userAns = userAnswers[q.id];
          const isCorrect = userAns === q.answer;
          return `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span>Q#${idx + 1} (${q.difficulty})</span>
                <span style="font-weight: 700; color: ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                  ${isCorrect ? '<i class="fas fa-check"></i> Correct (+1)' : (userAns ? '<i class="fas fa-times"></i> Wrong' : 'Omitted')}
                </span>
              </div>
              <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 8px;">${q.question}</div>
              <div style="font-size: 13px; margin-bottom: 4px;">
                Your Answer: <strong style="color: ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${userAns || 'None'}</strong> | 
                Correct Answer: <strong style="color: var(--accent-emerald);">${q.answer}</strong>
              </div>
              <div style="font-size: 12.5px; color: var(--text-muted); background: var(--bg-card); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); margin-top: 6px;">
                ${q.explanation}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <button class="btn-primary" onclick="initMockTest()"><i class="fas fa-redo"></i> Retake New Mock Test</button>
      </div>
    `;

    AppState.logActivity(`Mock Test Completed: Grade ${letterGrade} (${pct}%)`, 'fa-award');
  }
}

/* ==========================================================================
   Exam Suggestions & Last Night Revision
   ========================================================================== */
function initExamSuggestions() {
  const container = document.getElementById('suggestions-content-container');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.examSuggestions) return;

  const data = window.GEEL_DATA.examSuggestions;
  let activeTab = 'high';

  function render() {
    if (activeTab === 'high') {
      container.innerHTML = `
        <div class="reader-article">
          <h3><i class="fas fa-star" style="color: var(--accent-amber);"></i> Category A: High Priority Must-Score Topics (100% Recurrence)</h3>
          <p>These topics have appeared in 8 to 9 out of the last 9 Semester End Examinations. You must score 100% in these sections.</p>
          <table>
            <thead><tr><th>Topic</th><th>Expected Weight</th><th>Exam Rationale</th></tr></thead>
            <tbody>
              ${data.highPriority.map(hp => `
                <tr>
                  <td><strong>${hp.topic}</strong></td>
                  <td><span class="nav-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">${hp.weight}</span></td>
                  <td>${hp.rationale}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'medium') {
      container.innerHTML = `
        <div class="reader-article">
          <h3><i class="fas fa-adjust" style="color: var(--accent-cyan);"></i> Category B: Medium Priority Topics (70–85% Recurrence)</h3>
          <p>Frequently tested components that determine whether a student achieves an A or an A+ grade.</p>
          <table>
            <thead><tr><th>Topic</th><th>Expected Weight</th><th>Exam Rationale</th></tr></thead>
            <tbody>
              ${data.mediumPriority.map(mp => `
                <tr>
                  <td><strong>${mp.topic}</strong></td>
                  <td><span class="nav-badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee;">${mp.weight}</span></td>
                  <td>${mp.rationale}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'low') {
      container.innerHTML = `
        <div class="reader-article">
          <h3><i class="fas fa-circle" style="color: var(--text-faint);"></i> Category C: Low Priority Topics (40–60% Recurrence)</h3>
          <p>Rarely tested in the final Semester End Examination; more common in mid-term CIE assessments.</p>
          <table>
            <thead><tr><th>Topic</th><th>Expected Weight</th><th>Exam Rationale</th></tr></thead>
            <tbody>
              ${data.lowPriority.map(lp => `
                <tr>
                  <td><strong>${lp.topic}</strong></td>
                  <td><span class="nav-badge">${lp.weight}</span></td>
                  <td>${lp.rationale}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'traps') {
      container.innerHTML = `
        <div class="reader-article">
          <h3><i class="fas fa-radiation" style="color: var(--accent-rose);"></i> Top 10 University Examination Error Traps</h3>
          <p>These 10 traps are specifically placed in grammar correction questions by examiners.</p>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
            ${data.repeatedTraps.map(t => `
              <li style="background: var(--bg-surface); padding: 12px 16px; border-left: 4px solid var(--accent-rose); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 14px;">
                ${t}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
  }

  document.querySelectorAll('[data-sugg-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sugg-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-sugg-tab');
      render();
    });
  });

  render();
}

function initLastNightRevision() {
  const container = document.getElementById('sanity-checklist-container');
  const resetBtn = document.getElementById('btn-reset-sanity-checks');
  if (!container) return;

  const checks = [
    { id: 'sc-1', text: '<strong>Headword Concord:</strong> Ignore all modifying prepositional phrases (<em>of the students</em>); verb agrees strictly with headword.' },
    { id: 'sc-2', text: '<strong>Additive Connectors:</strong> Verbs with <em>as well as, along with, together with</em> agree strictly with <strong>Subject 1</strong>.' },
    { id: 'sc-3', text: '<strong>Proximity Rule:</strong> Verbs with <em>either... or, neither... nor</em> agree with <strong>Subject 2</strong> (nearest subject).' },
    { id: 'sc-4', text: '<strong>Isolated Pronouns:</strong> <em>Neither of, Either of, Each of, Everyone</em> are <strong>always singular</strong>.' },
    { id: 'sc-5', text: '<strong>Quantifiers:</strong> <code>A number of</code> = <strong>Plural</strong>; <code>The number of</code> = <strong>Singular</strong>.' },
    { id: 'sc-6', text: '<strong>Inverted Conditionals:</strong> <code>Had I known...</code> requires <strong>would have + V3</strong> in the main clause.' },
    { id: 'sc-7', text: '<strong>Subjunctive Were:</strong> Write <code>If I were...</code> / <code>as though he were...</code> instead of <em>was</em>.' },
    { id: 'sc-8', text: '<strong>Causative Delegation:</strong> Write <code>I will have my hair cut</code> instead of <em>I will cut my hair</em>.' },
    { id: 'sc-9', text: '<strong>Passive Causative Make:</strong> Active <em>make</em> takes a bare infinitive, but passive <em>be made</em> requires <strong>to + V1</strong>.' },
    { id: 'sc-10', text: '<strong>Gerund Walking Stick:</strong> <em>Walking stick</em> = stick for walking = <strong>Gerund</strong>; <em>smiling child</em> = <strong>Participle</strong>.' },
    { id: 'sc-11', text: '<strong>Prepositional Gerund:</strong> Any verb following a preposition (<em>before submitting, for increasing</em>) must end in <strong>-ing</strong>.' },
    { id: 'sc-12', text: '<strong>Urgent Subjunctive:</strong> <code>It is high time they...</code> takes a <strong>Past Simple verb</strong> (<em>raised, took</em>).' },
    { id: 'sc-13', text: '<strong>Negative Comparison:</strong> Use the idiom <code>let alone</code> instead of literal mother-tongue translations.' },
    { id: 'sc-14', text: '<strong>Unseen Summary Word Count:</strong> Strictly between <strong>45 and 50 words</strong> with zero verbatim copied sentences.' },
    { id: 'sc-15', text: '<strong>Letter Layout:</strong> Ensure sender address, date, recipient address, subject, salutation, 3 body paragraphs, and formal sign-off are present.' }
  ];

  function render() {
    container.innerHTML = checks.map(c => {
      const isChecked = AppState.checklist[c.id] || false;
      return `
        <li class="checklist-item ${isChecked ? 'done' : ''}" style="padding: 10px 14px;">
          <input type="checkbox" id="${c.id}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; margin-top: 2px;">
          <label for="${c.id}" style="cursor: pointer; flex: 1; font-size: 13.5px; line-height: 1.5;">${c.text}</label>
        </li>
      `;
    }).join('');

    checks.forEach(c => {
      const input = document.getElementById(c.id);
      if (input) {
        input.onchange = (e) => {
          AppState.checklist[c.id] = e.target.checked;
          AppState.saveChecklist();
          render();
        };
      }
    });
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      AppState.checklist = {};
      AppState.saveChecklist();
      render();
      showToast('Sanity Checklist reset!', 'info');
    };
  }

  render();
}

/* ==========================================================================
   Smart Note (Interactive Notebook)
   ========================================================================== */
function initSmartNotes() {
  const container = document.getElementById('smart-notes-container');
  if (!container || !window.GEEL_DATA || !window.GEEL_DATA.smartNotes) return;

  container.innerHTML = window.GEEL_DATA.smartNotes.map(sn => `
    <div class="reader-article smart-note-card" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 18px; color: var(--text-main);">${sn.title}</h3>
        <span class="nav-badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">${sn.category}</span>
      </div>
      <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 14px;"><em>${sn.summary}</em></p>
      <ul style="margin-left: 18px; font-size: 13.5px; line-height: 1.7; color: var(--text-main);">
        ${sn.points.map(pt => `<li>${pt}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/* ==========================================================================
   Bookmarks & Notes System
   ========================================================================== */
function toggleBookmark(id, type, title, subtitle) {
  const idx = AppState.bookmarks.findIndex(b => b.id === id);
  if (idx !== -1) {
    AppState.bookmarks.splice(idx, 1);
    showToast(`Removed from bookmarks: ${title.substring(0, 25)}...`, 'info');
  } else {
    AppState.bookmarks.push({ id, type, title, subtitle, date: new Date().toLocaleDateString() });
    showToast(`Bookmarked: ${title.substring(0, 25)}...`, 'success');
    AppState.logActivity(`Bookmarked ${type}: ${title.substring(0, 25)}...`, 'fa-bookmark');
  }
  AppState.saveBookmarks();
  renderBookmarks();
}

function initBookmarksSystem() {
  renderBookmarks();
  const clearBtn = document.getElementById('btn-clear-all-bookmarks');
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm('Are you sure you want to clear all bookmarks?')) {
        AppState.bookmarks = [];
        AppState.saveBookmarks();
        renderBookmarks();
        showToast('All bookmarks cleared', 'info');
      }
    };
  }
}

function renderBookmarks() {
  const container = document.getElementById('bookmarks-container');
  if (!container) return;

  if (AppState.bookmarks.length === 0) {
    container.innerHTML = `
      <div class="reader-article" style="text-align: center; color: var(--text-muted); padding: 48px 24px;">
        <i class="far fa-bookmark" style="font-size: 36px; margin-bottom: 12px; color: var(--text-faint);"></i>
        <h3>No Bookmarks Saved Yet</h3>
        <p style="font-size: 13.5px;">Click the bookmark icon on any rule, vocabulary word, or question to save it for quick review.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.bookmarks.map(b => `
    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div>
        <span class="nav-badge" style="font-size: 10px; margin-bottom: 4px; display: inline-block;">${b.type}</span>
        <h4 style="font-size: 15.5px; font-weight: 700; margin: 2px 0;">${b.title}</h4>
        <div style="font-size: 12.5px; color: var(--text-muted);">${b.subtitle}</div>
      </div>
      <button class="btn-sm btn-danger" onclick="toggleBookmark('${b.id}', '', '${b.title}', '')" title="Remove Bookmark">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

function initPersonalNotes() {
  const newBtn = document.getElementById('btn-new-note');
  const editor = document.getElementById('note-editor-card');
  const cancelBtn = document.getElementById('btn-cancel-note');
  const saveBtn = document.getElementById('btn-save-note');
  const titleInput = document.getElementById('note-title-input');
  const catSelect = document.getElementById('note-category-select');
  const contentInput = document.getElementById('note-content-input');

  let editingNoteId = null;

  if (newBtn && editor) {
    newBtn.onclick = () => {
      editingNoteId = null;
      document.getElementById('note-editor-mode-title').textContent = 'Create New Study Note';
      titleInput.value = '';
      contentInput.value = '';
      editor.style.display = 'block';
      titleInput.focus();
    };
  }

  if (cancelBtn && editor) {
    cancelBtn.onclick = () => editor.style.display = 'none';
  }

  if (saveBtn && editor) {
    saveBtn.onclick = () => {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      const cat = catSelect.value;
      if (!title || !content) {
        showToast('Please enter both title and note content', 'warning');
        return;
      }

      if (editingNoteId) {
        const n = AppState.notes.find(x => x.id === editingNoteId);
        if (n) {
          n.title = title;
          n.content = content;
          n.category = cat;
          n.date = new Date().toLocaleDateString();
        }
      } else {
        const newNote = {
          id: 'note-' + Date.now(),
          title,
          category: cat,
          content,
          date: new Date().toLocaleDateString()
        };
        AppState.notes.unshift(newNote);
      }

      AppState.saveNotes();
      editor.style.display = 'none';
      renderNotes();
      showToast('Note saved successfully!', 'success');
      AppState.logActivity(`Saved Note: ${title.substring(0, 20)}...`, 'fa-sticky-note');
    };
  }

  renderNotes();
}

function renderNotes() {
  const container = document.getElementById('notes-list-container');
  if (!container) return;

  if (AppState.notes.length === 0) {
    container.innerHTML = `
      <div class="reader-article" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 48px 24px;">
        <i class="far fa-sticky-note" style="font-size: 36px; margin-bottom: 12px; color: var(--text-faint);"></i>
        <h3>No Personal Notes Created</h3>
        <p style="font-size: 13.5px;">Click "Create New Note" to write personal lecture reminders, grammatical mnemonics, or revision lists.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.notes.map(n => `
    <div class="note-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="nav-badge" style="font-size: 10px;">${n.category}</span>
          <h4 style="font-size: 16px; font-weight: 700; margin: 4px 0 2px;">${escapeHtml(n.title)}</h4>
          <span style="font-size: 11px; color: var(--text-faint);">${n.date}</span>
        </div>
        <button class="btn-sm btn-danger" onclick="deleteNote('${n.id}')" title="Delete Note">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6; white-space: pre-wrap; margin-top: 6px;">${escapeHtml(n.content)}</div>
    </div>
  `).join('');
}

function deleteNote(id) {
  if (confirm('Delete this study note?')) {
    AppState.notes = AppState.notes.filter(n => n.id !== id);
    AppState.saveNotes();
    renderNotes();
    showToast('Note deleted', 'info');
  }
}

/* ==========================================================================
   Settings & Data Management
   ========================================================================== */
function initSettings() {
  const exportBtn = document.getElementById('btn-export-data');
  const resetBtn = document.getElementById('btn-reset-all-data');
  const examDateInput = document.getElementById('settings-exam-date-input');

  if (examDateInput) {
    examDateInput.value = localStorage.getItem('geel_exam_date') || '';
    examDateInput.onchange = () => {
      localStorage.setItem('geel_exam_date', examDateInput.value);
      initExamCountdown();
      showToast('Exam date updated!', 'success');
    };
  }

  if (exportBtn) {
    exportBtn.onclick = () => {
      const dump = {
        bookmarks: AppState.bookmarks,
        notes: AppState.notes,
        progress: AppState.progress,
        quizStats: AppState.quizStats,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EngMaster_IIUC_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('WARNING: This will permanently delete all your bookmarks, notes, quiz scores, and reading progress. Continue?')) {
        localStorage.clear();
        location.reload();
      }
    };
  }
}

/* ==========================================================================
   Client-Side Markdown Parser for 16 Master Modules
   ========================================================================== */
function renderMarkdown(md) {
  if (!md) return '';

  let html = md
    // Protect Code blocks
    .replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); overflow-x: auto; font-family: var(--font-mono); font-size: 13px;"><code>${escapeHtml(code.trim())}</code></pre>`;
    })
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Alerts
    .replace(/> \[!NOTE\]\s*\n> (.*$)/gim, '<div class="alert-box alert-info"><i class="fas fa-info-circle"></i><div><strong>NOTE:</strong> $1</div></div>')
    .replace(/> \[!TIP\]\s*\n> (.*$)/gim, '<div class="alert-box alert-success"><i class="fas fa-lightbulb"></i><div><strong>TIP:</strong> $1</div></div>')
    .replace(/> \[!IMPORTANT\]\s*\n> (.*$)/gim, '<div class="alert-box alert-warning"><i class="fas fa-exclamation-triangle"></i><div><strong>IMPORTANT:</strong> $1</div></div>')
    .replace(/> \[!WARNING\]\s*\n> (.*$)/gim, '<div class="alert-box alert-warning"><i class="fas fa-radiation"></i><div><strong>WARNING:</strong> $1</div></div>')
    // Bold & Italics
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background: var(--bg-surface); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--primary);">$1</code>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal Rule
    .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 32px 0;">')
    // Unordered list
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    // Table processing
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => c.match(/^-+$/))) {
        return '<!-- table separator -->';
      }
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>');

  // Wrap consecutive <tr> in <table>
  html = html.replace(/(<tr>[\s\S]*?<\/tr>(\s*<!-- table separator -->\s*<tr>[\s\S]*?<\/tr>)*)/g, (match) => {
    const cleanMatch = match.replace(/<!-- table separator -->/g, '');
    return `<div style="overflow-x: auto; margin: 20px 0;"><table class="reader-table" style="width: 100%; border-collapse: collapse; font-size: 13.5px;">${cleanMatch}</table></div>`;
  });

  return `<div class="reader-article"><p>${html}</p></div>`;
}


/* ==========================================================================
   MIDTERM ACADEMIC HUB CONTROLLER (CIE 50 MARKS / MIDTERM 30 MARKS)
   ========================================================================== */
/* ==========================================================================
   MIDTERM HUB CONTROLLER (CIE 50 MARKS / MIDTERM 30 MARKS)
   ========================================================================== */
function initMidtermHub() {
  const tabs = document.querySelectorAll('#midterm-section-tabs .passage-tab-btn');
  const prescribedContainer = document.getElementById('midterm-prescribed-container');
  const readingSkillsContainer = document.getElementById('midterm-reading-skills-container');
  const writingCommContainer = document.getElementById('midterm-writing-comm-container');

  if (!tabs.length || !window.GEEL_DATA || !window.GEEL_DATA.midtermData) return;

  const data = window.GEEL_DATA.midtermData;

  // Tab switching logic
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-mid-tab');
      
      const tabPrescribed = document.getElementById('midterm-tab-prescribed');
      const tabReading = document.getElementById('midterm-tab-reading-skills');
      const tabWriting = document.getElementById('midterm-tab-writing-comm');

      if (tabPrescribed) tabPrescribed.style.display = target === 'prescribed' ? 'block' : 'none';
      if (tabReading) tabReading.style.display = target === 'reading-skills' ? 'block' : 'none';
      if (tabWriting) tabWriting.style.display = target === 'writing-comm' ? 'block' : 'none';
    });
  });

  // Render Section 1: Prescribed Reading (All 4 Modules with complete 9-point structure)
  if (prescribedContainer && data.prescribedReading) {
    prescribedContainer.innerHTML = data.prescribedReading.map((pr, idx) => `
      <div class="reader-article" style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <span class="hero-tag" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;"><i class="fas fa-bookmark"></i> ${pr.source}</span>
            <h3 style="margin: 6px 0 4px; font-size: 21px;">${pr.title}</h3>
            ${pr.coverage ? `<div style="font-size: 13px; color: var(--text-muted);"><strong>Coverage:</strong> ${pr.coverage}</div>` : ''}
          </div>
          <button class="btn-text-sm" onclick="toggleBookmark('mid-${pr.id}', 'Midterm Reading', '${escapeHtml(pr.title)}', '${escapeHtml(pr.source)}')">
            <i class="far fa-bookmark" style="color: var(--accent-amber);"></i> Bookmark
          </button>
        </div>

        <!-- 1. Introduction -->
        <div style="background: var(--bg-surface); padding: 12px 16px; border-left: 3px solid var(--primary); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-bottom: 14px; font-size: 13.5px; line-height: 1.6;">
          <strong style="color: var(--primary);"><i class="fas fa-info-circle"></i> Introduction:</strong> ${pr.introduction || 'Prescribed foundational reading comprehension text.'}
        </div>

        <!-- 2. Summary -->
        <h4 style="font-size: 15px; color: var(--accent-cyan); margin: 14px 0 6px;"><i class="fas fa-align-left"></i> Summary & Core Thematic Overview:</h4>
        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 16px;">${pr.summary}</p>

        <!-- 3. Important Vocabulary -->
        ${pr.importantVocabulary && pr.importantVocabulary.length ? `
          <h4 style="font-size: 15px; color: var(--accent-cyan); margin: 16px 0 8px;"><i class="fas fa-spell-check"></i> Important Examination Vocabulary:</h4>
          <div style="overflow-x: auto; margin-bottom: 16px;">
            <table class="reader-table" style="width: 100%; font-size: 13px;">
              <thead><tr><th>Word</th><th>POS</th><th>Meaning</th><th>Synonym / Antonym</th><th>Example Sentence</th></tr></thead>
              <tbody>
                ${pr.importantVocabulary.map(v => `
                  <tr>
                    <td><strong>${v.word}</strong></td>
                    <td><span class="nav-badge" style="font-size: 10px;">${v.pos || 'Noun'}</span></td>
                    <td>${v.meaning}</td>
                    <td><small style="color: var(--accent-emerald);">Syn: ${v.synonym || 'N/A'}</small><br><small style="color: var(--accent-rose);">Ant: ${v.antonym || 'N/A'}</small></td>
                    <td><em>"${v.example}"</em></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- 4. Important Questions & Model Answers -->
        ${pr.importantQuestions && pr.importantQuestions.length ? `
          <h4 style="font-size: 15px; color: var(--accent-emerald); margin: 16px 0 8px;"><i class="fas fa-question-circle"></i> Important Questions & Model Answers:</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${pr.importantQuestions.map((q, qIdx) => `
              <div style="background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 11px; font-weight: 700; color: var(--primary);">QUESTION #${qIdx + 1} (${q.type || 'Comprehension'})</div>
                <div style="font-size: 14px; font-weight: 600; margin: 2px 0 6px;">${q.q}</div>
                <div style="background: rgba(16, 185, 129, 0.08); padding: 8px 12px; border-left: 3px solid var(--accent-emerald); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 13px;">
                  <strong>Model Answer:</strong> ${q.a}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 5. 50-Word Precision Model Answers -->
        ${pr.modelAnswers && pr.modelAnswers.length ? `
          <h4 style="font-size: 15px; color: var(--accent-purple); margin: 16px 0 8px;"><i class="fas fa-feather-alt"></i> Model Answers (Precision Summaries):</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${pr.modelAnswers.map(ma => `
              <div style="background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 6px;">${ma.question}</div>
                <div style="font-size: 13px; line-height: 1.6; color: var(--text-main); font-style: italic;">"${ma.answer}"</div>
                ${ma.wordCount ? `<div style="font-size: 11px; color: var(--text-faint); margin-top: 4px;">Word count: <strong>${ma.wordCount} words</strong> (Strict 45–50 Word Criteria)</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 6. Practice Drills -->
        ${pr.practice && pr.practice.length ? `
          <h4 style="font-size: 15px; color: var(--accent-cyan); margin: 16px 0 8px;"><i class="fas fa-pencil-alt"></i> Guided Practice Task:</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${pr.practice.map((p, pIdx) => `
              <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 13.5px; font-weight: 600;">${p.task}</div>
                <div style="margin-top: 6px; font-size: 12.5px; color: var(--accent-emerald);"><strong>Solution:</strong> ${p.solution}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 7. Practice MCQ -->
        ${pr.practiceMCQ && pr.practiceMCQ.length ? `
          <h4 style="font-size: 15px; color: var(--accent-amber); margin: 16px 0 8px;"><i class="fas fa-tasks"></i> Multiple Choice Practice (MCQ):</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${pr.practiceMCQ.map((mcq, mIdx) => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px;">
                <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 8px;">Q${mIdx + 1}: ${mcq.q}</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  ${mcq.options.map(opt => `
                    <button class="btn-sm btn-outline" onclick="checkMidMCQ(this, '${escapeHtml(opt)}', '${escapeHtml(mcq.answer)}', '${escapeHtml(mcq.explanation)}')">${opt}</button>
                  `).join('')}
                </div>
                <div class="mid-mcq-expl" style="font-size: 12.5px; margin-top: 8px; display: none;"></div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 8. Creative/Comprehension Question (CQ) -->
        ${pr.practiceCQ && pr.practiceCQ.length ? `
          <h4 style="font-size: 15px; color: var(--accent-rose); margin: 16px 0 8px;"><i class="fas fa-file-invoice"></i> Comprehension & Creative Question (CQ):</h4>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
            ${pr.practiceCQ.map((cq, cIdx) => `
              <div style="background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 13.5px; font-weight: 600; margin-bottom: 6px;">${cq.prompt}</div>
                ${cq.modelAnswer ? `<div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; background: rgba(99, 102, 241, 0.06); padding: 8px 12px; border-radius: var(--radius-sm);"><strong>Model Evaluation:</strong> ${cq.modelAnswer}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 9. Previous Exam Questions -->
        ${pr.previousExamQuestions && pr.previousExamQuestions.length ? `
          <h4 style="font-size: 15px; color: var(--accent-cyan); margin: 16px 0 8px;"><i class="fas fa-history"></i> Previous University Examination Questions:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${pr.previousExamQuestions.map(peq => `
              <div style="background: rgba(99, 102, 241, 0.08); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div><span class="nav-badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; margin-right: 8px;">${peq.year}</span> <strong>${peq.question}</strong></div>
                <div style="font-size: 12px; color: var(--text-muted);">${peq.marks || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Render Section 2: Reading Skills (12 Skills)
  if (readingSkillsContainer && data.readingSkills) {
    readingSkillsContainer.innerHTML = data.readingSkills.map(rs => `
      <div class="rule-card">
        <div class="rule-header">
          <span class="rule-badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;"><i class="fas fa-lightbulb"></i> READING STRATEGY</span>
          <button class="btn-text-sm" onclick="toggleBookmark('rs-${rs.id}', 'Reading Skill', '${escapeHtml(rs.title)}', 'Reading Strategy')">
            <i class="far fa-bookmark" style="color: var(--accent-amber);"></i>
          </button>
        </div>
        <h3 class="rule-title">${rs.title}</h3>
        <p class="rule-desc"><strong>Definition:</strong> ${rs.definition}</p>
        <p style="font-size: 13px; color: var(--text-muted); margin: 8px 0; line-height: 1.5;">${rs.explanation}</p>
        
        ${rs.examples && rs.examples.length ? `
          <div style="background: var(--bg-surface); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 12.5px; margin: 8px 0;">
            <strong style="color: var(--accent-cyan);"><i class="fas fa-search"></i> Worked Example:</strong>
            <div style="margin-top: 4px; color: var(--text-main);">${rs.examples[0].task || rs.examples[0].technique || rs.examples[0].paragraph} &rarr; <em>${rs.examples[0].technique || rs.examples[0].mainIdea || ''}</em></div>
          </div>
        ` : ''}

        <div class="alert-box alert-info" style="margin: 8px 0; padding: 10px 12px; font-size: 12.5px;">
          <i class="fas fa-graduation-cap"></i>
          <div><strong>Exam Tip:</strong> ${rs.examTips}</div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.08); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-emerald); font-size: 12.5px; margin-top: 8px;">
          <strong style="color: var(--accent-emerald);"><i class="fas fa-pencil-alt"></i> Practice Activity:</strong> ${rs.practice}
        </div>
      </div>
    `).join('');
  }

  // Render Section 3: Writing & Communication
  if (writingCommContainer && data.writingAndCommunication) {
    const wc = data.writingAndCommunication;
    writingCommContainer.innerHTML = `
      <div class="reader-article" style="margin-bottom: 24px;">
        <h3><i class="fas fa-project-diagram"></i> Sentence Types & Syntactic Structures:</h3>
        <p>University examinations test both functional classification (Assertive, Imperative, Interrogative, Optative, Exclamatory) and structural composition (Simple, Complex, Compound).</p>
        
        ${wc.sentenceTypes.map(st => `
          <h4 style="color: var(--accent-cyan); margin: 16px 0 8px;">${st.classification}:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-bottom: 16px;">
            ${st.types.map(t => `
              <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">${t.name}</div>
                <div style="font-size: 12px; color: var(--text-faint); margin-bottom: 6px;"><code>${t.formula}</code></div>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">${t.desc}</div>
                <div style="font-size: 12.5px; color: var(--text-main); font-style: italic;">Ex: "${t.ex}"</div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <h3 style="margin-top: 28px;"><i class="fas fa-pen-alt"></i> Core Grammar & Question Formulation Rules:</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
          ${wc.grammarSkills.map(gs => `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
              <h4 style="color: var(--accent-emerald); margin: 0 0 6px;">${gs.topic}</h4>
              <p style="font-size: 13.5px; margin-bottom: 8px;">${gs.rules}</p>
              ${gs.examTrap ? `<div class="alert-box alert-warning" style="padding: 8px 12px; margin: 6px 0; font-size: 12.5px;"><i class="fas fa-radiation"></i><div>${gs.examTrap}</div></div>` : ''}
              ${gs.examples ? `
                <div style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">
                  ${gs.examples.map(ex => `<div>&bull; ${ex.active ? `<strong>Active:</strong> ${ex.active} &rarr; <strong>Passive:</strong> ${ex.passive}` : (ex.incorrect ? `<span style="color: var(--accent-rose);">${ex.incorrect}</span> &rarr; <span style="color: var(--accent-emerald);">${ex.correct}</span>` : `${ex.statement} &rarr; <strong>Q:</strong> ${ex.question}`)}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        ${wc.writingWorkshops ? `
          <h3 style="margin-top: 28px;"><i class="fas fa-edit"></i> Writing Workshops (Paragraphs & Story Completion):</h3>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
            ${wc.writingWorkshops.map(ww => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
                <h4 style="color: var(--accent-amber); margin: 0 0 6px;">${ww.type}</h4>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;"><strong>Structure:</strong> ${ww.structure}</div>
                <div style="background: rgba(245, 158, 11, 0.08); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px;"><strong>Sample Exam Prompt:</strong> ${ww.samplePrompt}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${wc.speakingWorkshops ? `
          <h3 style="margin-top: 28px;"><i class="fas fa-comments"></i> Speaking & Communication Workshops (Text-Based Studio):</h3>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
            ${wc.speakingWorkshops.map(sw => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
                <h4 style="color: var(--accent-cyan); margin: 0 0 6px;">${sw.topic}</h4>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;"><strong>Guidelines:</strong> ${sw.guidelines}</div>
                <div style="background: rgba(99, 102, 241, 0.06); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; white-space: pre-line;"><strong>Sample Dialogue / Script:</strong>
${sw.sampleDialogue}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
}

function checkMidMCQ(btn, selected, correct, explanation) {
  const parent = btn.closest('div');
  const explBox = parent.parentElement.querySelector('.mid-mcq-expl');
  if (!explBox) return;

  parent.querySelectorAll('button').forEach(b => b.disabled = true);

  if (selected === correct) {
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-success');
    explBox.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 700;"><i class="fas fa-check-circle"></i> Correct!</span> ${explanation}`;
  } else {
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-danger');
    explBox.innerHTML = `<span style="color: var(--accent-rose); font-weight: 700;"><i class="fas fa-times-circle"></i> Incorrect.</span> Correct answer: <strong>${correct}</strong>. ${explanation}`;
  }
  explBox.style.display = 'block';
}

/* ==========================================================================
   FINAL EXAM HUB CONTROLLER (SEE 50 MARKS)
   ========================================================================== */
function initFinalExamHub() {
  const tabs = document.querySelectorAll('#final-section-tabs .passage-tab-btn');
  const prescribedContainer = document.getElementById('final-prescribed-container');
  const unseenContainer = document.getElementById('final-unseen-container');
  const grammarContainer = document.getElementById('final-grammar-container');
  const compositionContainer = document.getElementById('final-composition-container');
  const speakingContainer = document.getElementById('final-speaking-container');
  const vocabContainer = document.getElementById('final-vocab-container');

  if (!tabs.length || !window.GEEL_DATA || !window.GEEL_DATA.finalData) return;

  const data = window.GEEL_DATA.finalData;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-fin-tab');

      const tabsMap = {
        'prescribed': 'final-tab-prescribed',
        'unseen': 'final-tab-unseen',
        'grammar': 'final-tab-grammar',
        'composition': 'final-tab-composition',
        'speaking': 'final-tab-speaking',
        'vocab': 'final-tab-vocab'
      };

      Object.keys(tabsMap).forEach(k => {
        const el = document.getElementById(tabsMap[k]);
        if (el) el.style.display = k === target ? 'block' : 'none';
      });
    });
  });

  // Render Section 1: Prescribed Reading (All modules with themes, characters, vocab, Q&A)
  if (prescribedContainer && data.prescribedReading) {
    prescribedContainer.innerHTML = data.prescribedReading.map(pr => `
      <div class="reader-article" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div>
            <span class="hero-tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;"><i class="fas fa-book"></i> ${pr.source || 'Prescribed Reading'}</span>
            <h3 style="margin: 4px 0 6px; font-size: 20px;">${pr.title}</h3>
          </div>
          <button class="btn-text-sm" onclick="toggleBookmark('fin-${pr.id}', 'Final Reading', '${escapeHtml(pr.title)}', '${escapeHtml(pr.source || '')}')">
            <i class="far fa-bookmark" style="color: var(--accent-amber);"></i> Bookmark
          </button>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: var(--text-main); margin-bottom: 12px;">${pr.summary}</p>
        
        ${pr.theme ? `<div style="font-size: 13px; margin-bottom: 8px;"><strong><i class="fas fa-lightbulb" style="color: var(--accent-amber);"></i> Core Themes:</strong> ${pr.theme}</div>` : ''}
        ${pr.characters ? `<div style="font-size: 13px; margin-bottom: 14px;"><strong><i class="fas fa-users" style="color: var(--accent-cyan);"></i> Major Characters:</strong> ${pr.characters}</div>` : ''}

        ${pr.importantVocabulary && pr.importantVocabulary.length ? `
          <h4 style="font-size: 14px; color: var(--accent-cyan); margin: 12px 0 6px;">Key Examination Vocabulary:</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            ${pr.importantVocabulary.map(v => `
              <span class="nav-badge" style="padding: 4px 10px; font-size: 12px;" title="${v.meaning}">
                <strong>${v.word}</strong> (${v.pos}): ${v.meaning}
              </span>
            `).join('')}
          </div>
        ` : ''}

        ${pr.importantQuestions && pr.importantQuestions.length ? `
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            ${pr.importantQuestions.map(q => `
              <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 13px;">
                <div style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">Q: ${q.q}</div>
                <div style="color: var(--text-muted);">${q.a}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Render Section 2: Reading Sources & Unseen Passages
  if (unseenContainer && data.readingAndComprehension) {
    const rc = data.readingAndComprehension;
    unseenContainer.innerHTML = `
      <div class="reader-article">
        <h3><i class="fas fa-newspaper"></i> Prescribed Unseen Examination Sources:</h3>
        <p>Final examination unseen passages are drawn directly from contemporary journalism, research essays, and standardized academic reading archives.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin: 16px 0;">
          ${rc.sources.map(s => `
            <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <span class="nav-badge" style="margin-bottom: 6px; display: inline-block;">${s.type}</span>
              <h4 style="margin: 2px 0 6px;">${s.name}</h4>
              <p style="font-size: 13px; color: var(--text-muted);">${s.focus}</p>
            </div>
          `).join('')}
        </div>

        ${rc.skills ? `
          <h3 style="margin-top: 24px;"><i class="fas fa-brain"></i> Applied Comprehension Skills:</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 12px;">
            ${rc.skills.map(sk => `
              <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <strong style="color: var(--accent-emerald); font-size: 13.5px;">${sk.name}</strong>
                <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 4px;">${sk.desc}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render Section 3: 7 Complete Grammar Chapters (With all 14 required sections)
  if (grammarContainer && data.grammarChapters) {
    grammarContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${data.grammarChapters.map(gc => `
          <div class="reader-article" id="grammar-chapter-${gc.chapterNumber}">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; margin-bottom: 14px;">
              <div>
                <span class="hero-tag" style="background: rgba(139, 92, 246, 0.2); color: #c084fc;">CHAPTER ${gc.chapterNumber}</span>
                <h3 style="margin: 4px 0 0; font-size: 21px;">${gc.title}</h3>
              </div>
              <button class="btn-text-sm" onclick="toggleBookmark('gc-${gc.chapterNumber}', 'Grammar Chapter', '${escapeHtml(gc.title)}', 'Chapter ${gc.chapterNumber}')">
                <i class="far fa-bookmark" style="color: var(--accent-amber);"></i> Bookmark
              </button>
            </div>

            <!-- 1. Definition -->
            <p style="font-size: 14px; color: var(--text-main); margin-bottom: 12px;"><strong><i class="fas fa-book"></i> Definition:</strong> ${gc.definition}</p>

            <!-- 2. Formula & Structure -->
            <div class="formula-box active-f" style="margin-bottom: 12px;">
              <div><strong>Primary Structural Formula:</strong> <code>${gc.formula}</code></div>
              ${gc.structure ? `<div style="margin-top: 6px; font-size: 12.5px;"><strong>Syntax Structure:</strong> <code>${gc.structure}</code></div>` : ''}
            </div>

            <!-- 3. Core Rules -->
            <h4 style="font-size: 14.5px; color: var(--accent-cyan); margin: 14px 0 6px;"><i class="fas fa-list-ul"></i> Core Examination Rules:</h4>
            <ul style="margin: 0 0 12px 18px; font-size: 13px; line-height: 1.6; color: var(--text-muted);">
              ${gc.rules.map(r => `<li>${r}</li>`).join('')}
            </ul>

            <!-- 4. Examples -->
            ${gc.examples && gc.examples.length ? `
              <h4 style="font-size: 14px; color: var(--accent-emerald); margin: 12px 0 6px;"><i class="fas fa-check-double"></i> Standard Examples:</h4>
              <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; font-size: 13px; font-style: italic;">
                ${gc.examples.map(ex => `<div>&bull; "${ex}"</div>`).join('')}
              </div>
            ` : ''}

            <!-- 5. Wrong vs Correct Usage -->
            ${gc.wrongVsCorrect && gc.wrongVsCorrect.length ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                <div style="background: rgba(244, 63, 94, 0.08); border-left: 3px solid var(--accent-rose); padding: 10px 12px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                  <strong style="color: var(--accent-rose); font-size: 12px;"><i class="fas fa-times-circle"></i> Wrong Usage:</strong>
                  <div style="font-size: 13px; margin-top: 4px;">${gc.wrongVsCorrect[0].wrong}</div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid var(--accent-emerald); padding: 10px 12px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                  <strong style="color: var(--accent-emerald); font-size: 12px;"><i class="fas fa-check-circle"></i> Correct Usage:</strong>
                  <div style="font-size: 13px; margin-top: 4px;">${gc.wrongVsCorrect[0].correct}</div>
                </div>
              </div>
            ` : ''}

            <!-- 6. Exceptions & Common Mistakes -->
            ${gc.exceptions ? `<div style="font-size: 13px; margin-bottom: 8px;"><strong><i class="fas fa-exclamation-circle" style="color: var(--accent-cyan);"></i> Grammatical Exceptions:</strong> ${gc.exceptions}</div>` : ''}
            
            <div class="alert-box alert-warning" style="margin-bottom: 12px; font-size: 12.5px;">
              <i class="fas fa-radiation"></i>
              <div><strong>Common Mistake & Pitfall:</strong> ${gc.commonMistakes}</div>
            </div>

            <!-- 7. Shortcut Memory Trick -->
            <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 12.5px; color: var(--accent-amber); margin-bottom: 12px;">
              <i class="fas fa-bolt"></i> <strong>Shortcut Trick:</strong> ${gc.shortcutTricks}
            </div>

            <!-- 8. Practice Drills & Previous Questions -->
            ${gc.practice ? `<div style="font-size: 13px; margin-bottom: 10px;"><strong>Practice Drill:</strong> ${gc.practice}</div>` : ''}
            
            ${gc.previousQuestions && gc.previousQuestions.length ? `
              <div style="background: rgba(99, 102, 241, 0.08); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 8px;">
                <strong>Recent IIUC Final Question (${gc.previousQuestions[0].year}):</strong> <em>"${gc.previousQuestions[0].q}"</em> &rarr; <strong>Model Ans:</strong> ${gc.previousQuestions[0].ans}
              </div>
            ` : ''}

            ${gc.revisionNotes ? `<div style="font-size: 12px; color: var(--text-faint); margin-top: 6px;"><strong>Quick Revision Note:</strong> ${gc.revisionNotes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render Section 4: Composition (Paragraph, Story, Graph/Charts, Opinion, Letters)
  if (compositionContainer && data.composition) {
    compositionContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${data.composition.map(c => `
          <div class="reader-article">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 style="font-size: 20px; margin: 0;"><i class="fas fa-pen-fancy"></i> ${c.title}</h3>
              <button class="btn-text-sm" onclick="toggleBookmark('comp-${c.id}', 'Writing Format', '${escapeHtml(c.title)}', 'Composition')">
                <i class="far fa-bookmark" style="color: var(--accent-amber);"></i> Bookmark
              </button>
            </div>

            ${c.types || c.formats ? `
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                ${(c.types || c.formats).map(f => `<span class="nav-badge">${f}</span>`).join('')}
              </div>
            ` : ''}

            <h4 style="font-size: 14px; color: var(--accent-cyan); margin: 10px 0 6px;">Required Academic Structure:</h4>
            <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px;">
              ${Array.isArray(c.structure) ? `<ul>${c.structure.map(s => `<li>${s}</li>`).join('')}</ul>` : c.structure}
            </div>

            ${c.format ? `<div style="font-size: 13px; margin-bottom: 8px;"><strong>Standard Exam Format:</strong> ${c.format}</div>` : ''}
            ${c.writingTips ? `<div class="alert-box alert-info" style="font-size: 12.5px; padding: 8px 12px; margin-bottom: 10px;"><i class="fas fa-lightbulb"></i><div><strong>Examiner Tip:</strong> ${c.writingTips}</div></div>` : ''}

            ${c.template ? `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12.5px; margin-bottom: 12px; white-space: pre-line;">
                <strong style="color: var(--primary);"><i class="fas fa-copy"></i> Ready-to-Use Blueprint / Template:</strong>
${c.template}
              </div>
            ` : ''}

            ${c.sample ? `
              <div style="background: rgba(16, 185, 129, 0.05); border-left: 3px solid var(--accent-emerald); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 12px 14px; font-size: 13px; line-height: 1.6; margin-bottom: 12px; white-space: pre-line;">
                <strong style="color: var(--accent-emerald);"><i class="fas fa-file-alt"></i> Complete Academic Sample:</strong>
${c.sample}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render Section 5: Speaking (Text-Based Oral Communication Studio)
  if (speakingContainer && data.speaking) {
    speakingContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${data.speaking.map(sp => `
          <div class="reader-article">
            <h3 style="font-size: 19px; margin-bottom: 6px;"><i class="fas fa-microphone-alt"></i> ${sp.topic}</h3>
            <p style="font-size: 13.5px; color: var(--text-main); margin-bottom: 10px;"><strong>Guidelines & Execution:</strong> ${sp.guidelines || sp.framework}</p>
            
            ${sp.usefulExpressions || sp.expressions ? `
              <div style="font-size: 13px; margin-bottom: 10px;">
                <strong style="color: var(--accent-cyan);"><i class="fas fa-quote-right"></i> High-Scoring Expressions:</strong>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                  ${(sp.usefulExpressions || sp.expressions).map(e => `<span class="nav-badge" style="background: rgba(59, 130, 246, 0.15); color: #93c5fd;">"${e}"</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${sp.sampleAnswers ? `
              <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
                <strong style="color: var(--accent-emerald);">Model Speech Extract:</strong>
                <p style="margin-top: 4px; font-style: italic;">"${sp.sampleAnswers}"</p>
              </div>
            ` : ''}

            ${sp.practiceQuestions && sp.practiceQuestions.length ? `
              <div style="background: rgba(99, 102, 241, 0.08); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12.5px;">
                <strong>Viva / Extempore Practice Tasks:</strong>
                <ul style="margin: 4px 0 0 16px;">
                  ${sp.practiceQuestions.map(pq => `<li>${pq}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render Section 6: Vocabulary Masterlists (8 Categorized Lists)
  if (vocabContainer && data.vocabularyLists) {
    const vl = data.vocabularyLists;
    const categories = Object.keys(vl);

    vocabContainer.innerHTML = `
      <div class="reader-article">
        <h3><i class="fas fa-layer-group"></i> Categorized Academic Vocabulary Masterlists:</h3>
        <p>Comprehensive high-frequency terms, phrasal verbs, idioms, and collocations tested across Semester End Examinations.</p>
        
        <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 16px;">
          ${categories.map(cat => `
            <div>
              <h4 style="font-size: 16px; color: var(--accent-amber); text-transform: capitalize; margin-bottom: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 4px;">
                <i class="fas fa-tag"></i> ${cat.replace(/([A-Z])/g, ' $1')} (${vl[cat].length} entries)
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                ${vl[cat].map(item => `
                  <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <strong style="font-size: 15px; color: var(--text-main);">${item.word}</strong>
                      <span class="nav-badge" style="font-size: 10px;">${item.pos || 'Term'}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">${item.meaning}</div>
                    ${item.example ? `<div style="font-size: 12px; color: var(--text-faint); font-style: italic; margin-bottom: 4px;">"${item.example}"</div>` : ''}
                    ${item.synonym ? `<div style="font-size: 11.5px; color: var(--accent-emerald);">Syn: ${item.synonym}</div>` : ''}
                    ${item.antonym ? `<div style="font-size: 11.5px; color: var(--accent-rose);">Ant: ${item.antonym}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

/* ==========================================================================
   PRACTICE ZONE INTERACTIVE CONTROLLER (9 Complete Drill Categories)
   ========================================================================== */
function initPracticeZone() {
  const tabs = document.querySelectorAll('#practice-zone-tabs .passage-tab-btn');
  if (!tabs.length || !window.GEEL_DATA || !window.GEEL_DATA.practiceZone) return;

  const pz = window.GEEL_DATA.practiceZone;

  const tabMap = {
    'correction': 'pz-tab-correction',
    'blanks': 'pz-tab-blanks',
    'errors': 'pz-tab-errors',
    'mcq': 'pz-tab-mcq',
    'cq': 'pz-tab-cq',
    'grammar': 'pz-tab-grammar',
    'reading': 'pz-tab-reading',
    'writing': 'pz-tab-writing',
    'mixed': 'pz-tab-mixed'
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-pz-tab');

      Object.keys(tabMap).forEach(k => {
        const el = document.getElementById(tabMap[k]);
        if (el) el.style.display = k === target ? 'block' : 'none';
      });
    });
  });

  // 1. Sentence Correction
  const correctionContainer = document.getElementById('pz-correction-container');
  if (correctionContainer && pz.sentenceCorrection) {
    correctionContainer.innerHTML = pz.sentenceCorrection.map(sc => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-amber);">CORRECTION DRILL #${sc.id}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${sc.difficulty || 'Easy'} &bull; Score: ${sc.score || 1}M</span>
        </div>
        <div class="mistake-incorrect">
          <i class="fas fa-times-circle mistake-icon red"></i>
          <div><strong>Incorrect:</strong> <em>"${sc.sentence}"</em></div>
        </div>
        <div class="mistake-correct">
          <i class="fas fa-check-circle mistake-icon green"></i>
          <div><strong>Correct:</strong> <em>"${sc.correction}"</em></div>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 8px; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
          <strong>Detailed Explanation:</strong> ${sc.rule || sc.explanation}
        </div>
      </div>
    `).join('');
  }

  // 2. Fill in the Blanks
  const blanksContainer = document.getElementById('pz-blanks-container');
  if (blanksContainer && pz.fillInTheBlanks) {
    blanksContainer.innerHTML = pz.fillInTheBlanks.map(fib => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--primary);">GAP DRILL #${fib.id}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${fib.difficulty || 'Easy'} &bull; Score: ${fib.score || 1}M</span>
        </div>
        <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 10px;">${fib.sentence}</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn-sm btn-outline" onclick="toggleFibAnswer('${fib.id}')" id="btn-fib-${fib.id}"><i class="fas fa-eye"></i> Reveal Answer Key</button>
          <span style="font-size: 12px; color: var(--text-faint);">Hint: ${fib.hint || 'Grammar Rule'}</span>
        </div>
        <div id="fib-ans-${fib.id}" style="display: none; margin-top: 8px; background: rgba(16, 185, 129, 0.08); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px; color: var(--accent-emerald);">
          <strong>Answer Key:</strong> "${fib.answerKey || fib.answer}" &bull; <strong>Explanation:</strong> ${fib.explanation || fib.rule}
        </div>
      </div>
    `).join('');
  }

  // 3. Error Identification
  const errorsContainer = document.getElementById('pz-errors-container');
  if (errorsContainer && pz.errorIdentification) {
    errorsContainer.innerHTML = pz.errorIdentification.map(ei => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-rose);">ERROR IDENTIFICATION #${ei.id}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${ei.difficulty || 'Medium'} &bull; Score: ${ei.score || 1}M</span>
        </div>
        <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 8px;">"${ei.sentence}"</div>
        <div class="alert-box alert-warning" style="margin: 0; padding: 10px 12px; font-size: 13px;">
          <div>Error Token: <strong style="color: var(--accent-rose); text-decoration: underline;">${ei.errorWord}</strong> &rarr; Correct form: <strong style="color: var(--accent-emerald);">${ei.correctedWord}</strong></div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;"><strong>Detailed Explanation:</strong> ${ei.explanation}</div>
        </div>
      </div>
    `).join('');
  }

  // 4. MCQ Practice
  const mcqContainer = document.getElementById('pz-mcq-container');
  if (mcqContainer && pz.mcqPractice) {
    mcqContainer.innerHTML = pz.mcqPractice.map((m, mIdx) => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-cyan);">${m.category} MCQ #${mIdx + 1}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${m.difficulty} &bull; Score: ${m.score}M</span>
        </div>
        <div style="font-size: 14.5px; font-weight: 600; margin-bottom: 10px;">${m.q}</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${m.options.map(opt => `
            <button class="btn-sm btn-outline" onclick="checkMidMCQ(this, '${escapeHtml(opt)}', '${escapeHtml(m.answerKey)}', '${escapeHtml(m.explanation)}')">${opt}</button>
          `).join('')}
        </div>
        <div class="mid-mcq-expl" style="font-size: 12.5px; margin-top: 8px; display: none;"></div>
      </div>
    `).join('');
  }

  // 5. CQ Analytical Practice
  const cqContainer = document.getElementById('pz-cq-container');
  if (cqContainer && pz.cqPractice) {
    cqContainer.innerHTML = `
      <div class="reader-article">
        <h3><i class="fas fa-pen-square"></i> Analytical Comprehension (CQ) Practice:</h3>
        <p>Examination questions calibrated according to Bloom's Taxonomy with full model scoring rubrics.</p>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
          ${pz.cqPractice.map(cq => `
            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 11px; color: var(--primary); font-weight: 700;">${cq.category}</span>
                <span class="nav-badge" style="font-size: 10px;">Difficulty: ${cq.difficulty} &bull; Score: ${cq.score} Marks</span>
              </div>
              <div style="font-size: 15px; font-weight: 600; margin: 4px 0 8px;">${cq.prompt}</div>
              <div style="background: rgba(16, 185, 129, 0.08); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.5; color: var(--text-main);">
                <strong>Answer Key & Model Response:</strong> ${cq.answerKey}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;"><strong>Scoring Rubric:</strong> ${cq.explanation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 6. Grammar Drills
  const grammarContainer = document.getElementById('pz-grammar-container');
  if (grammarContainer && pz.grammarPractice) {
    grammarContainer.innerHTML = pz.grammarPractice.map(gp => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-purple);">GRAMMAR DRILL: ${gp.topic}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${gp.difficulty} &bull; Score: ${gp.score}M</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${gp.prompt}</div>
        <div style="background: rgba(139, 92, 246, 0.08); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text-main);">
          <strong>Answer Key:</strong> "${gp.answerKey}" &bull; <em>${gp.explanation}</em>
        </div>
      </div>
    `).join('');
  }

  // 7. Reading Drills
  const readingContainer = document.getElementById('pz-reading-container');
  if (readingContainer && pz.readingPractice) {
    readingContainer.innerHTML = `
      <div class="reader-article">
        <h3><i class="fas fa-glasses"></i> Applied Reading & Evidence Extraction Drills:</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
          ${pz.readingPractice.map(rp => `
            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 13px; line-height: 1.6; color: var(--text-main); font-style: italic; background: rgba(255,255,255,0.03); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 10px;">
                "${rp.passage}"
              </div>
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">Q: ${rp.q}</div>
              <div style="font-size: 13px; color: var(--accent-emerald);"><strong>Answer Key:</strong> ${rp.answerKey}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;"><strong>Explanation:</strong> ${rp.explanation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 8. Writing Drills
  const writingContainer = document.getElementById('pz-writing-container');
  if (writingContainer && pz.writingPractice) {
    writingContainer.innerHTML = `
      <div class="reader-article">
        <h3><i class="fas fa-pen-nib"></i> Writing Precision & Summary Drills:</h3>
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 12px;">
          ${pz.writingPractice.map(wp => `
            <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 11px; font-weight: 700; color: var(--accent-amber); margin-bottom: 4px;">${wp.topic} (Score: ${wp.score} Marks)</div>
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${wp.prompt}</div>
              <div style="background: rgba(16, 185, 129, 0.08); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.5; color: var(--text-main);">
                <strong>Model Solution:</strong> "${wp.answerKey}"
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;"><strong>Criteria:</strong> ${wp.explanation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 9. Mixed Practice Arena
  const mixedContainer = document.getElementById('pz-mixed-container');
  if (mixedContainer && pz.mixedPractice) {
    mixedContainer.innerHTML = pz.mixedPractice.map((mp, mpIdx) => `
      <div class="mistake-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--accent-rose);">${mp.category} #${mpIdx + 1}</span>
          <span class="nav-badge" style="font-size: 10px;">Difficulty: ${mp.difficulty} &bull; Score: ${mp.score}M</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${mp.q}</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${mp.options.map(opt => `
            <button class="btn-sm btn-outline" onclick="checkMidMCQ(this, '${escapeHtml(opt)}', '${escapeHtml(mp.answerKey)}', '${escapeHtml(mp.explanation)}')">${opt}</button>
          `).join('')}
        </div>
        <div class="mid-mcq-expl" style="font-size: 12.5px; margin-top: 8px; display: none;"></div>
      </div>
    `).join('');
  }
}

function toggleFibAnswer(id) {
  const ansBox = document.getElementById(`fib-ans-${id}`);
  const btn = document.getElementById(`btn-fib-${id}`);
  if (!ansBox || !btn) return;
  const isShown = ansBox.style.display === 'block';
  ansBox.style.display = isShown ? 'none' : 'block';
  btn.innerHTML = isShown ? `<i class="fas fa-eye"></i> Reveal Answer Key` : `<i class="fas fa-eye-slash"></i> Hide Answer Key`;
}

window.checkMidMCQ = checkMidMCQ;
window.toggleFibAnswer = toggleFibAnswer;

/* ==========================================================================
   Global Window Function Exports
   ========================================================================== */
window.normalizeData = normalizeData;
window.switchView = switchView;
window.loadModuleContent = loadModuleContent;
window.openSeenPassage = openSeenPassage;
window.speakWord = speakWord;
window.showWordPopover = showWordPopover;
window.toggleBookmark = toggleBookmark;
window.toggleMasteredRule = toggleMasteredRule;
window.togglePQAnswer = togglePQAnswer;
window.deleteNote = deleteNote;
window.checkCondQuiz = checkCondQuiz;

