/**
 * CaloTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * Persistent client-side data storage using localStorage.
 */

(function () {
  'use strict';

  // --- STORAGE CONSTANTS ---
  const STORAGE_PREFIX = 'calotrack_';
  const GOALS_KEY = `${STORAGE_PREFIX}goals`;
  const WATER_PREFIX = `${STORAGE_PREFIX}water_`;
  const ENTRIES_PREFIX = `${STORAGE_PREFIX}entries_`;

  // --- DEFAULT GOALS ---
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140, // grams
    carbs: 220,   // grams
    fat: 65       // grams
  };

  // --- QUICK FOOD PRESETS ---
  const FOOD_PRESETS = [
    { name: '2 Boiled Eggs', serving: '2 large', calories: 140, protein: 12, carbs: 1, fat: 10, meal: 'breakfast' },
    { name: 'Oatmeal & Berries', serving: '1 bowl (50g oats)', calories: 220, protein: 6, carbs: 42, fat: 4, meal: 'breakfast' },
    { name: 'Grilled Chicken Breast', serving: '150g', calories: 247, protein: 46, carbs: 0, fat: 5, meal: 'lunch' },
    { name: 'Steamed White Rice', serving: '1 cup (160g)', calories: 205, protein: 4, carbs: 45, fat: 0.5, meal: 'lunch' },
    { name: 'Grilled Salmon Fillet', serving: '150g', calories: 310, protein: 34, carbs: 0, fat: 18, meal: 'dinner' },
    { name: 'Sweet Potato', serving: '1 medium (150g)', calories: 130, protein: 2.5, carbs: 30, fat: 0.2, meal: 'dinner' },
    { name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, meal: 'snacks' },
    { name: 'Greek Yogurt 0%', serving: '1 cup (170g)', calories: 100, protein: 17, carbs: 6, fat: 0.7, meal: 'snacks' },
    { name: 'Whey Protein Shake', serving: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5, meal: 'snacks' },
    { name: 'Mixed Almonds', serving: '1 oz (28g)', calories: 164, protein: 6, carbs: 6, fat: 14, meal: 'snacks' }
  ];

  // --- STATE ---
  let currentDate = getTodayDateString();
  let goals = loadGoals();

  // --- DOM ELEMENTS ---
  // Date Controls
  const datePicker = document.getElementById('date-picker');
  const dateLabelReadable = document.getElementById('date-label-readable');
  const btnPrevDay = document.getElementById('btn-prev-day');
  const btnNextDay = document.getElementById('btn-next-day');
  const btnToday = document.getElementById('btn-today');

  // Stats Elements
  const statCaloriesRemaining = document.getElementById('stat-calories-remaining');
  const statCalorieGoal = document.getElementById('stat-calorie-goal');
  const statCaloriesEaten = document.getElementById('stat-calories-eaten');
  const statCaloriePercent = document.getElementById('stat-calorie-percent');
  const calorieProgressCircle = document.getElementById('calorie-progress-circle');
  const calorieStatusBadge = document.getElementById('calorie-status-badge');

  // Macros
  const statProteinEaten = document.getElementById('stat-protein-eaten');
  const statProteinGoal = document.getElementById('stat-protein-goal');
  const statProteinPct = document.getElementById('stat-protein-pct');
  const barProtein = document.getElementById('bar-protein');

  const statCarbsEaten = document.getElementById('stat-carbs-eaten');
  const statCarbsGoal = document.getElementById('stat-carbs-goal');
  const statCarbsPct = document.getElementById('stat-carbs-pct');
  const barCarbs = document.getElementById('bar-carbs');

  const statFatEaten = document.getElementById('stat-fat-eaten');
  const statFatGoal = document.getElementById('stat-fat-goal');
  const statFatPct = document.getElementById('stat-fat-pct');
  const barFat = document.getElementById('bar-fat');

  const distProtein = document.getElementById('dist-protein');
  const distCarbs = document.getElementById('dist-carbs');
  const distFat = document.getElementById('dist-fat');

  // Water Tracker
  const waterGlassesContainer = document.getElementById('water-glasses-container');
  const waterIntakeTotal = document.getElementById('water-intake-total');
  const btnWaterMinus = document.getElementById('btn-water-minus');
  const btnWaterPlus = document.getElementById('btn-water-plus');

  // Weekly Trend
  const trendChartContainer = document.getElementById('trend-chart-container');

  // Meals List Containers & Subtotals
  const mealItemLists = {
    breakfast: document.getElementById('breakfast-items-list'),
    lunch: document.getElementById('lunch-items-list'),
    dinner: document.getElementById('dinner-items-list'),
    snacks: document.getElementById('snacks-items-list')
  };

  const mealSubtotals = {
    breakfast: document.getElementById('breakfast-subtotal'),
    lunch: document.getElementById('lunch-subtotal'),
    dinner: document.getElementById('dinner-subtotal'),
    snacks: document.getElementById('snacks-subtotal')
  };

  // Search Filter
  const foodSearchInput = document.getElementById('food-search-input');

  // Presets
  const presetsContainer = document.getElementById('presets-container');

  // Modals & Forms
  const modalFoodEntry = document.getElementById('modal-food-entry');
  const foodEntryForm = document.getElementById('food-entry-form');
  const modalFoodTitle = document.getElementById('modal-food-title');
  const entryIdInput = document.getElementById('entry-id');
  const entryMealType = document.getElementById('entry-meal-type');
  const entryName = document.getElementById('entry-name');
  const entryServing = document.getElementById('entry-serving');
  const entryCalories = document.getElementById('entry-calories');
  const entryProtein = document.getElementById('entry-protein');
  const entryCarbs = document.getElementById('entry-carbs');
  const entryFat = document.getElementById('entry-fat');
  const btnCloseFoodModal = document.getElementById('btn-close-food-modal');
  const btnCancelFoodModal = document.getElementById('btn-cancel-food-modal');

  // Settings Modal
  const modalSettings = document.getElementById('modal-settings');
  const settingsForm = document.getElementById('settings-form');
  const goalCaloriesInput = document.getElementById('goal-calories');
  const goalProteinInput = document.getElementById('goal-protein');
  const goalCarbsInput = document.getElementById('goal-carbs');
  const goalFatInput = document.getElementById('goal-fat');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettingsModal = document.getElementById('btn-close-settings-modal');
  const btnCancelSettingsModal = document.getElementById('btn-cancel-settings-modal');

  // Data Modal
  const modalData = document.getElementById('modal-data');
  const btnOpenData = document.getElementById('btn-open-data');
  const btnCloseDataModal = document.getElementById('btn-close-data-modal');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnTriggerImport = document.getElementById('btn-trigger-import');
  const importFileInput = document.getElementById('import-file-input');
  const btnClearAllData = document.getElementById('btn-clear-all-data');

  const btnQuickAdd = document.getElementById('btn-quick-add');
  const toastNotification = document.getElementById('toast-notification');

  // --- INITIALIZATION ---
  function init() {
    setupDateControls();
    setupPresets();
    setupEventListeners();
    renderDay();
  }

  // --- DATE HELPERS ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatReadableDate(dateStr) {
    const parts = dateStr.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const todayStr = getTodayDateString();

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterdayObj);

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrowStr = formatDateKey(tomorrowObj);

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString(undefined, options);

    if (dateStr === todayStr) {
      return `Today, ${dateFormatted}`;
    } else if (dateStr === yesterdayStr) {
      return `Yesterday, ${dateFormatted}`;
    } else if (dateStr === tomorrowStr) {
      return `Tomorrow, ${dateFormatted}`;
    } else {
      return dateFormatted;
    }
  }

  function setupDateControls() {
    datePicker.value = currentDate;
    dateLabelReadable.textContent = formatReadableDate(currentDate);

    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        renderDay();
      }
    });

    btnPrevDay.addEventListener('click', () => {
      shiftCurrentDate(-1);
    });

    btnNextDay.addEventListener('click', () => {
      shiftCurrentDate(1);
    });

    btnToday.addEventListener('click', () => {
      currentDate = getTodayDateString();
      renderDay();
    });
  }

  function shiftCurrentDate(days) {
    const parts = currentDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    currentDate = formatDateKey(d);
    renderDay();
  }

  // --- PERSISTENCE HELPERS ---
  function loadGoals() {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) {
      saveGoals(DEFAULT_GOALS);
      return { ...DEFAULT_GOALS };
    }
    try {
      return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals(newGoals) {
    goals = { ...goals, ...newGoals };
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  function getEntriesForDate(dateStr) {
    const raw = localStorage.getItem(`${ENTRIES_PREFIX}${dateStr}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function saveEntriesForDate(dateStr, entries) {
    localStorage.setItem(`${ENTRIES_PREFIX}${dateStr}`, JSON.stringify(entries));
  }

  function getWaterForDate(dateStr) {
    const val = localStorage.getItem(`${WATER_PREFIX}${dateStr}`);
    return val ? parseInt(val, 10) : 0;
  }

  function saveWaterForDate(dateStr, count) {
    const clamped = Math.max(0, Math.min(8, count));
    localStorage.setItem(`${WATER_PREFIX}${dateStr}`, clamped.toString());
  }

  // --- PRESETS RENDERING ---
  function setupPresets() {
    presetsContainer.innerHTML = '';
    FOOD_PRESETS.forEach(preset => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.type = 'button';
      chip.innerHTML = `
        <span>${preset.name}</span>
        <span class="preset-chip-cal">${preset.calories} kcal</span>
      `;
      chip.title = `Click to log to ${preset.meal}: ${preset.calories} kcal, ${preset.protein}g P, ${preset.carbs}g C, ${preset.fat}g F`;
      chip.addEventListener('click', () => {
        addPresetItem(preset);
      });
      presetsContainer.appendChild(chip);
    });
  }

  function addPresetItem(preset) {
    const entries = getEntriesForDate(currentDate);
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      mealType: preset.meal || 'lunch',
      name: preset.name,
      serving: preset.serving || '1 portion',
      calories: Number(preset.calories) || 0,
      protein: Number(preset.protein) || 0,
      carbs: Number(preset.carbs) || 0,
      fat: Number(preset.fat) || 0,
      timestamp: Date.now()
    };
    entries.push(newEntry);
    saveEntriesForDate(currentDate, entries);
    renderDay();
    showToast(`Added ${newEntry.name} to ${capitalize(newEntry.mealType)}!`);
  }

  // --- RENDER MAIN DAY VIEW ---
  function renderDay() {
    datePicker.value = currentDate;
    dateLabelReadable.textContent = formatReadableDate(currentDate);

    const entries = getEntriesForDate(currentDate);
    const waterCount = getWaterForDate(currentDate);

    // Calculate totals
    const totals = entries.reduce(
      (acc, item) => {
        acc.calories += Number(item.calories) || 0;
        acc.protein += Number(item.protein) || 0;
        acc.carbs += Number(item.carbs) || 0;
        acc.fat += Number(item.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Render Dashboard & Cards
    renderCalorieDial(totals.calories, goals.calories);
    renderMacros(totals, goals);
    renderWater(waterCount);
    renderTrendChart();
    renderMealLists(entries);
  }

  // --- CALORIE DIAL RENDERING ---
  function renderCalorieDial(consumed, target) {
    const remaining = target - consumed;
    const percent = target > 0 ? Math.round((consumed / target) * 100) : 0;

    statCalorieGoal.textContent = target.toLocaleString();
    statCaloriesEaten.textContent = consumed.toLocaleString();
    statCaloriePercent.textContent = `${percent}%`;

    if (remaining >= 0) {
      statCaloriesRemaining.textContent = remaining.toLocaleString();
      statCaloriesRemaining.style.color = '#0f172a';
    } else {
      // Over budget
      statCaloriesRemaining.textContent = `+${Math.abs(remaining).toLocaleString()}`;
      statCaloriesRemaining.style.color = '#ef4444';
    }

    // Circular SVG Progress
    // Radius = 68, circumference = 2 * PI * 68 = 427.256
    const circumference = 427.26;
    const progressRatio = target > 0 ? Math.min(consumed / target, 1) : 0;
    const offset = circumference - (progressRatio * circumference);

    calorieProgressCircle.style.strokeDashoffset = offset;

    // Status badge & stroke color
    if (consumed > target) {
      calorieStatusBadge.className = 'badge badge-over';
      calorieStatusBadge.textContent = 'Exceeded';
      calorieProgressCircle.style.stroke = '#ef4444';
    } else if (consumed >= target * 0.9) {
      calorieStatusBadge.className = 'badge badge-warning';
      calorieStatusBadge.textContent = 'Near Target';
      calorieProgressCircle.style.stroke = '#f59e0b';
    } else {
      calorieStatusBadge.className = 'badge badge-normal';
      calorieStatusBadge.textContent = 'On Track';
      calorieProgressCircle.style.stroke = '#2563eb';
    }
  }

  // --- MACRONUTRIENTS RENDERING ---
  function renderMacros(eaten, targetGoals) {
    // Protein
    statProteinEaten.textContent = Math.round(eaten.protein);
    statProteinGoal.textContent = targetGoals.protein;
    const pPct = targetGoals.protein > 0 ? Math.round((eaten.protein / targetGoals.protein) * 100) : 0;
    statProteinPct.textContent = `(${pPct}%)`;
    barProtein.style.width = `${Math.min(pPct, 100)}%`;

    // Carbs
    statCarbsEaten.textContent = Math.round(eaten.carbs);
    statCarbsGoal.textContent = targetGoals.carbs;
    const cPct = targetGoals.carbs > 0 ? Math.round((eaten.carbs / targetGoals.carbs) * 100) : 0;
    statCarbsPct.textContent = `(${cPct}%)`;
    barCarbs.style.width = `${Math.min(cPct, 100)}%`;

    // Fat
    statFatEaten.textContent = Math.round(eaten.fat);
    statFatGoal.textContent = targetGoals.fat;
    const fPct = targetGoals.fat > 0 ? Math.round((eaten.fat / targetGoals.fat) * 100) : 0;
    statFatPct.textContent = `(${fPct}%)`;
    barFat.style.width = `${Math.min(fPct, 100)}%`;

    // Energy distribution calculation
    const calP = eaten.protein * 4;
    const calC = eaten.carbs * 4;
    const calF = eaten.fat * 9;
    const totalMacroCal = calP + calC + calF;

    if (totalMacroCal > 0) {
      const shareP = Math.round((calP / totalMacroCal) * 100);
      const shareC = Math.round((calC / totalMacroCal) * 100);
      const shareF = Math.round((calF / totalMacroCal) * 100);
      distProtein.textContent = `${shareP}% P`;
      distCarbs.textContent = `${shareC}% C`;
      distFat.textContent = `${shareF}% F`;
    } else {
      distProtein.textContent = '0% P';
      distCarbs.textContent = '0% C';
      distFat.textContent = '0% F';
    }
  }

  // --- WATER TRACKER RENDERING ---
  function renderWater(count) {
    waterGlassesContainer.innerHTML = '';
    const totalMl = count * 250;
    waterIntakeTotal.textContent = totalMl;

    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= count;
      const glass = document.createElement('div');
      glass.className = `water-glass-item ${isFilled ? 'filled' : ''}`;
      glass.title = `Glass ${i} (250 ml)`;
      glass.innerHTML = `
        <svg class="water-glass-icon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 3h10l-2 16a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L7 3z"></path>
          <line x1="6" y1="7" x2="18" y2="7"></line>
        </svg>
        <span class="water-glass-ml">${i * 250}ml</span>
      `;

      glass.addEventListener('click', () => {
        // If clicking currently active glass, toggle off to previous
        const newCount = (count === i) ? i - 1 : i;
        saveWaterForDate(currentDate, newCount);
        renderWater(newCount);
      });

      waterGlassesContainer.appendChild(glass);
    }
  }

  // --- 7-DAY TREND CHART (PURE SVG) ---
  function renderTrendChart() {
    const daysData = [];
    const parts = currentDate.split('-');
    const anchorDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    // 7 days ending at anchorDate + 2 days (or past 6 days ending at anchorDate)
    // Let's show past 6 days up to anchorDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - i);
      const dKey = formatDateKey(d);
      const entries = getEntriesForDate(dKey);
      const dayCalories = entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      daysData.push({
        dateKey: dKey,
        label: dayLabel,
        calories: dayCalories,
        isCurrent: dKey === currentDate
      });
    }

    const maxVal = Math.max(goals.calories * 1.25, ...daysData.map(d => d.calories), 1000);
    const chartHeight = 160;
    const chartWidth = 760;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const barWidth = 36;
    const step = plotWidth / daysData.length;

    // Target Line Y
    const targetY = padding.top + plotHeight - (goals.calories / maxVal) * plotHeight;

    let svgHtml = `
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" width="100%" height="100%" preserveAspectRatio="none">
        <!-- Target Line -->
        <line x1="${padding.left}" y1="${targetY}" x2="${chartWidth - padding.right}" y2="${targetY}" class="chart-target-line" />
        <text x="${chartWidth - padding.right}" y="${targetY - 5}" font-size="10" fill="#ea580c" text-anchor="end" font-weight="600">Goal: ${goals.calories}</text>
    `;

    daysData.forEach((day, idx) => {
      const x = padding.left + (idx * step) + (step - barWidth) / 2;
      const barHeight = (day.calories / maxVal) * plotHeight;
      const y = padding.top + plotHeight - barHeight;
      const activeClass = day.isCurrent ? 'is-active-day' : '';
      const labelClass = day.isCurrent ? 'chart-label chart-label-active' : 'chart-label';

      // Background pillar
      svgHtml += `
        <rect x="${x}" y="${padding.top}" width="${barWidth}" height="${plotHeight}" class="chart-bar-bg" />
      `;

      // Value bar
      if (barHeight > 0) {
        svgHtml += `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="chart-bar-fill ${activeClass}" data-date="${day.dateKey}">
            <title>${day.label} (${day.dateKey}): ${day.calories} kcal</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${Math.max(y - 4, padding.top + 10)}" font-size="10" font-weight="700" fill="${day.isCurrent ? '#ea580c' : '#334155'}" text-anchor="middle">${day.calories}</text>
        `;
      }

      // X-Axis Date Label
      svgHtml += `
        <text x="${x + barWidth / 2}" y="${chartHeight - 8}" class="${labelClass}">${day.label}</text>
      `;
    });

    svgHtml += `</svg>`;
    trendChartContainer.innerHTML = svgHtml;

    // Attach click events to bars to navigate days
    const bars = trendChartContainer.querySelectorAll('.chart-bar-fill');
    bars.forEach(b => {
      b.addEventListener('click', (e) => {
        const targetDay = e.target.getAttribute('data-date');
        if (targetDay) {
          currentDate = targetDay;
          renderDay();
        }
      });
    });
  }

  // --- MEAL LISTS RENDERING ---
  function renderMealLists(entries) {
    const filterQuery = (foodSearchInput.value || '').trim().toLowerCase();

    const categorized = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };

    const subtotals = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    };

    entries.forEach(item => {
      const meal = item.mealType || 'snacks';
      if (categorized[meal]) {
        subtotals[meal] += Number(item.calories) || 0;
        // Search filter matching
        if (!filterQuery || item.name.toLowerCase().includes(filterQuery) || (item.serving && item.serving.toLowerCase().includes(filterQuery))) {
          categorized[meal].push(item);
        }
      }
    });

    // Update subtotals
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(m => {
      mealSubtotals[m].textContent = `${subtotals[m].toLocaleString()} kcal`;
    });

    // Render cards
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
      const container = mealItemLists[meal];
      container.innerHTML = '';

      const items = categorized[meal];
      if (items.length === 0) {
        const emptyMsg = filterQuery ? 'No matching items found.' : `No items logged for ${meal} yet.`;
        container.innerHTML = `<div class="empty-meal-placeholder">${emptyMsg}</div>`;
        return;
      }

      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'food-item-row';
        row.innerHTML = `
          <div class="food-item-left">
            <span class="food-item-name">${escapeHtml(item.name)}</span>
            <div class="food-item-details">
              ${item.serving ? `<span class="food-item-portion">${escapeHtml(item.serving)}</span> • ` : ''}
              <div class="food-item-macros-tags">
                <span class="macro-tag tag-p" title="Protein">${Number(item.protein) || 0}g P</span>
                <span class="macro-tag tag-c" title="Carbohydrates">${Number(item.carbs) || 0}g C</span>
                <span class="macro-tag tag-f" title="Fats">${Number(item.fat) || 0}g F</span>
              </div>
            </div>
          </div>
          <div class="food-item-right">
            <span class="food-item-cals">${Number(item.calories).toLocaleString()} kcal</span>
            <div class="food-actions-group">
              <button class="btn-item-action btn-item-edit" title="Edit entry" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button class="btn-item-action btn-item-delete" title="Delete entry" data-id="${item.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;

        // Edit listener
        row.querySelector('.btn-item-edit').addEventListener('click', () => {
          openEditFoodModal(item);
        });

        // Delete listener
        row.querySelector('.btn-item-delete').addEventListener('click', () => {
          deleteFoodEntry(item.id, item.name);
        });

        container.appendChild(row);
      });
    });
  }

  // --- CRUD FOOD ENTRY ---
  function openAddFoodModal(presetMeal = 'breakfast') {
    modalFoodTitle.textContent = 'Add Food Entry';
    entryIdInput.value = '';
    entryMealType.value = presetMeal;
    entryName.value = '';
    entryServing.value = '';
    entryCalories.value = '';
    entryProtein.value = '0';
    entryCarbs.value = '0';
    entryFat.value = '0';

    modalFoodEntry.classList.add('active');
    entryName.focus();
  }

  function openEditFoodModal(item) {
    modalFoodTitle.textContent = 'Edit Food Entry';
    entryIdInput.value = item.id;
    entryMealType.value = item.mealType || 'breakfast';
    entryName.value = item.name || '';
    entryServing.value = item.serving || '';
    entryCalories.value = item.calories;
    entryProtein.value = item.protein || 0;
    entryCarbs.value = item.carbs || 0;
    entryFat.value = item.fat || 0;

    modalFoodEntry.classList.add('active');
    entryName.focus();
  }

  function closeFoodModal() {
    modalFoodEntry.classList.remove('active');
    foodEntryForm.reset();
  }

  foodEntryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = entryIdInput.value;
    const name = entryName.value.trim();
    const meal = entryMealType.value;
    const serving = entryServing.value.trim();
    const calories = parseFloat(entryCalories.value);
    const protein = parseFloat(entryProtein.value) || 0;
    const carbs = parseFloat(entryCarbs.value) || 0;
    const fat = parseFloat(entryFat.value) || 0;

    if (!name || isNaN(calories) || calories < 0) {
      alert('Please enter a valid food name and positive calorie amount.');
      return;
    }

    const entries = getEntriesForDate(currentDate);

    if (id) {
      // Update existing
      const index = entries.findIndex(x => x.id === id);
      if (index !== -1) {
        entries[index] = {
          ...entries[index],
          mealType: meal,
          name,
          serving,
          calories,
          protein,
          carbs,
          fat
        };
        showToast(`Updated "${name}"`);
      }
    } else {
      // Create new
      const newEntry = {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        mealType: meal,
        name,
        serving,
        calories,
        protein,
        carbs,
        fat,
        timestamp: Date.now()
      };
      entries.push(newEntry);
      showToast(`Logged "${name}" to ${capitalize(meal)}`);
    }

    saveEntriesForDate(currentDate, entries);
    closeFoodModal();
    renderDay();
  });

  function deleteFoodEntry(id, name) {
    const entries = getEntriesForDate(currentDate);
    const updated = entries.filter(x => x.id !== id);
    saveEntriesForDate(currentDate, updated);
    renderDay();
    showToast(`Deleted "${name}"`);
  }

  // --- SETTINGS & GOALS ---
  function openSettingsModal() {
    goalCaloriesInput.value = goals.calories;
    goalProteinInput.value = goals.protein;
    goalCarbsInput.value = goals.carbs;
    goalFatInput.value = goals.fat;
    modalSettings.classList.add('active');
  }

  function closeSettingsModal() {
    modalSettings.classList.remove('active');
  }

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCal = parseInt(goalCaloriesInput.value, 10);
    const newP = parseInt(goalProteinInput.value, 10);
    const newC = parseInt(goalCarbsInput.value, 10);
    const newF = parseInt(goalFatInput.value, 10);

    if (isNaN(newCal) || newCal <= 0) {
      alert('Please specify a valid daily calorie target.');
      return;
    }

    saveGoals({
      calories: newCal,
      protein: newP,
      carbs: newC,
      fat: newF
    });

    closeSettingsModal();
    renderDay();
    showToast('Daily goals updated successfully!');
  });

  // Macro quick splits
  document.getElementById('split-balanced').addEventListener('click', () => {
    applyMacroSplit(0.40, 0.30, 0.30); // 40% C, 30% P, 30% F
  });

  document.getElementById('split-high-protein').addEventListener('click', () => {
    applyMacroSplit(0.35, 0.40, 0.25); // 35% C, 40% P, 25% F
  });

  document.getElementById('split-low-carb').addEventListener('click', () => {
    applyMacroSplit(0.20, 0.40, 0.40); // 20% C, 40% P, 40% F
  });

  function applyMacroSplit(carbsRatio, proteinRatio, fatRatio) {
    const cal = parseInt(goalCaloriesInput.value, 10) || goals.calories;
    const carbGrams = Math.round((cal * carbsRatio) / 4);
    const protGrams = Math.round((cal * proteinRatio) / 4);
    const fatGrams = Math.round((cal * fatRatio) / 9);

    goalProteinInput.value = protGrams;
    goalCarbsInput.value = carbGrams;
    goalFatInput.value = fatGrams;
  }

  // --- DATA BACKUP, EXPORT & IMPORT ---
  function openDataModal() {
    modalData.classList.add('active');
  }

  function closeDataModal() {
    modalData.classList.remove('active');
  }

  btnExportJson.addEventListener('click', () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      goals: goals,
      entries: {},
      water: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(ENTRIES_PREFIX)) {
        const datePart = key.replace(ENTRIES_PREFIX, '');
        try {
          backupData.entries[datePart] = JSON.parse(localStorage.getItem(key));
        } catch (e) {}
      } else if (key.startsWith(WATER_PREFIX)) {
        const datePart = key.replace(WATER_PREFIX, '');
        backupData.water[datePart] = parseInt(localStorage.getItem(key), 10);
      }
    }

    const dataBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `calotrack_backup_${getTodayDateString()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully!');
  });

  btnTriggerImport.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.goals && !imported.entries) {
          throw new Error('Invalid format: Missing goals or entries.');
        }

        if (imported.goals) {
          saveGoals(imported.goals);
        }

        if (imported.entries) {
          Object.keys(imported.entries).forEach(dateKey => {
            saveEntriesForDate(dateKey, imported.entries[dateKey]);
          });
        }

        if (imported.water) {
          Object.keys(imported.water).forEach(dateKey => {
            saveWaterForDate(dateKey, imported.water[dateKey]);
          });
        }

        closeDataModal();
        renderDay();
        showToast('Data imported successfully!');
      } catch (err) {
        alert('Failed to import file. Ensure it is a valid CaloTrack JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  btnClearAllData.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all logged meals and reset your tracker? This cannot be undone.')) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      goals = { ...DEFAULT_GOALS };
      saveGoals(DEFAULT_GOALS);
      closeDataModal();
      renderDay();
      showToast('All tracker data has been reset.');
    }
  });

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Quick Add button opens modal
    btnQuickAdd.addEventListener('click', () => {
      openAddFoodModal('breakfast');
    });

    // Per-meal Add Item buttons
    document.querySelectorAll('.btn-add-meal-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mealType = btn.getAttribute('data-meal-type') || 'breakfast';
        openAddFoodModal(mealType);
      });
    });

    // Close buttons for modals
    btnCloseFoodModal.addEventListener('click', closeFoodModal);
    btnCancelFoodModal.addEventListener('click', closeFoodModal);

    btnOpenSettings.addEventListener('click', openSettingsModal);
    btnCloseSettingsModal.addEventListener('click', closeSettingsModal);
    btnCancelSettingsModal.addEventListener('click', closeSettingsModal);

    btnOpenData.addEventListener('click', openDataModal);
    btnCloseDataModal.addEventListener('click', closeDataModal);

    // Close modal on background click
    [modalFoodEntry, modalSettings, modalData].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Water plus/minus
    btnWaterMinus.addEventListener('click', () => {
      const current = getWaterForDate(currentDate);
      saveWaterForDate(currentDate, current - 1);
      renderWater(getWaterForDate(currentDate));
    });

    btnWaterPlus.addEventListener('click', () => {
      const current = getWaterForDate(currentDate);
      saveWaterForDate(currentDate, current + 1);
      renderWater(getWaterForDate(currentDate));
    });

    // Food search filter
    foodSearchInput.addEventListener('input', () => {
      const entries = getEntriesForDate(currentDate);
      renderMealLists(entries);
    });

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalFoodEntry.classList.remove('active');
        modalSettings.classList.remove('active');
        modalData.classList.remove('active');
      }
    });
  }

  // --- TOAST UTILITY ---
  let toastTimeout = null;
  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2500);
  }

  // --- UTILS ---
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  init();
})();

