import { useEffect, useMemo, useState } from 'react';
import { defaultWeekPlans, orderedWeekdays } from './defaultData';
import {
  loadSettings,
  loadPlans,
  resetChecksIfNeeded,
  saveChecks,
  savePlans,
  saveSettings,
  type CheckedState,
} from './storage';
import type { AppSettings, DayPlan, ScheduleItem, Weekday } from './types';

type Page = 'today' | 'week' | 'edit' | 'settings';

const getTodayName = (): Weekday => {
  const jsDay = new Date().getDay();
  return orderedWeekdays[(jsDay + 6) % 7];
};

const App = () => {
  const [page, setPage] = useState<Page>('today');
  const [plans, setPlans] = useState<DayPlan[]>(() => loadPlans());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [checked, setChecked] = useState<CheckedState>(() => resetChecksIfNeeded(settings.resetHour24));
  const [showBroken, setShowBroken] = useState(false);
  const [editDay, setEditDay] = useState<Weekday>(getTodayName());

  const todayName = getTodayName();
  const todayPlan = useMemo(
    () => plans.find((plan) => plan.dayName === todayName) ?? defaultWeekPlans[0],
    [plans, todayName],
  );

  const toggleCheck = (dayId: string, index: number) => {
    setChecked((prev) => {
      const next = {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          [index]: !prev[dayId]?.[index],
        },
      };
      saveChecks(next);
      return next;
    });
  };

  const updatePlan = (updated: DayPlan) => {
    const next = plans.map((plan) => (plan.id === updated.id ? updated : plan));
    setPlans(next);
    savePlans(next);
  };

  const resetToDefault = () => {
    setPlans(defaultWeekPlans);
    savePlans(defaultWeekPlans);
  };

  const updateResetHour = (hour: number) => {
    const nextSettings = { ...settings, resetHour24: hour };
    setSettings(nextSettings);
    saveSettings(nextSettings);
    const resetChecks = resetChecksIfNeeded(hour);
    setChecked(resetChecks);
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Runway Command</h1>
        <p className="sub">Phone-first BCIT command schedule</p>
      </header>

      <nav className="tabs">
        {(['today', 'week', 'edit', 'settings'] as Page[]).map((item) => (
          <button
            key={item}
            className={item === page ? 'tab active' : 'tab'}
            onClick={() => setPage(item)}
            type="button"
          >
            {item.toUpperCase()}
          </button>
        ))}
      </nav>

      <main>
        {page === 'today' && (
          <TodayPage
            plan={todayPlan}
            checks={checked[todayPlan.id] ?? {}}
            onToggle={(i) => toggleCheck(todayPlan.id, i)}
            showBroken={showBroken}
            onToggleBroken={() => setShowBroken((s) => !s)}
          />
        )}
        {page === 'week' && <WeekPage plans={plans} />}
        {page === 'edit' && (
          <EditPage
            plans={plans}
            editDay={editDay}
            onSetDay={setEditDay}
            onSave={updatePlan}
            onResetDefaults={resetToDefault}
          />
        )}
        {page === 'settings' && (
          <SettingsPage settings={settings} onChangeResetHour={updateResetHour} onResetChecks={() => setChecked(resetChecksIfNeeded(settings.resetHour24))} />
        )}
      </main>
    </div>
  );
};

const TodayPage = ({
  plan,
  checks,
  onToggle,
  showBroken,
  onToggleBroken,
}: {
  plan: DayPlan;
  checks: Record<number, boolean>;
  onToggle: (i: number) => void;
  showBroken: boolean;
  onToggleBroken: () => void;
}) => (
  <section className="stack">
    <h2 className="day-title">{plan.dayName}</h2>
    <article className="card quote-card">
      <p className="mentor">Mentor: {plan.mentor}</p>
      <p>“{plan.quote}”</p>
    </article>

    <article className="card mission">
      <h3>Main Mission</h3>
      <p className="theme">{plan.theme}</p>
      <p>{plan.reminder}</p>
    </article>

    <article className="card warning">
      <h3>Danger Warning</h3>
      <ul>
        {plan.dangerWarnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </article>

    <div className="card">
      <h3>Hour-by-hour tasks</h3>
      {plan.scheduleItems.map((item, index) => (
        <label key={`${item.time}-${item.task}`} className="schedule-row">
          <input
            checked={Boolean(checks[index])}
            onChange={() => onToggle(index)}
            type="checkbox"
          />
          <span className="time">{item.time}</span>
          <span className={checks[index] ? 'done' : ''}>{item.task}</span>
        </label>
      ))}
    </div>

    <article className="card night" id="night-blade">
      <h3>Night Blade</h3>
      <ul>
        {plan.nightBladeOptions.map((option) => (
          <li key={option}>{option}</li>
        ))}
      </ul>
    </article>

    <div className="row-buttons">
      <button type="button" onClick={onToggleBroken}>
        Broken Day Mode
      </button>
      <a href="#night-blade">Night Blade Jump</a>
    </div>

    {showBroken && (
      <article className="card broken">
        <h3>Broken Day Fallback</h3>
        <ol>
          {plan.brokenDayRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </article>
    )}
  </section>
);

const WeekPage = ({ plans }: { plans: DayPlan[] }) => (
  <section className="stack">
    <h2>Week Overview</h2>
    {orderedWeekdays.map((day) => {
      const plan = plans.find((item) => item.dayName === day);
      if (!plan) return null;
      return (
        <article className="card" key={plan.id}>
          <h3>{plan.dayName}</h3>
          <p className="theme">{plan.theme}</p>
          <p>
            <strong>{plan.mentor}:</strong> {plan.quote}
          </p>
        </article>
      );
    })}
  </section>
);

const EditPage = ({
  plans,
  editDay,
  onSetDay,
  onSave,
  onResetDefaults,
}: {
  plans: DayPlan[];
  editDay: Weekday;
  onSetDay: (day: Weekday) => void;
  onSave: (plan: DayPlan) => void;
  onResetDefaults: () => void;
}) => {
  const selected = plans.find((item) => item.dayName === editDay) ?? plans[0];
  const [draft, setDraft] = useState<DayPlan>(selected);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  const setScheduleText = (value: string) => {
    const parsed: ScheduleItem[] = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [time, ...task] = line.split(' ');
        return { time, task: task.join(' ') };
      });
    setDraft({ ...draft, scheduleItems: parsed });
  };

  return (
    <section className="stack">
      <h2>Edit Schedule</h2>
      <div className="row-buttons">
        <select value={editDay} onChange={(e) => onSetDay(e.target.value as Weekday)}>
          {orderedWeekdays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <button type="button" onClick={onResetDefaults}>
          Reset week defaults
        </button>
      </div>

      <article className="card edit">
        <label>
          Theme
          <input value={draft.theme} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} />
        </label>
        <label>
          Mentor
          <input value={draft.mentor} onChange={(e) => setDraft({ ...draft, mentor: e.target.value })} />
        </label>
        <label>
          Quote
          <textarea value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
        </label>
        <label>
          Reminder
          <textarea value={draft.reminder} onChange={(e) => setDraft({ ...draft, reminder: e.target.value })} />
        </label>
        <label>
          Schedule (one line: "time task")
          <textarea
            value={draft.scheduleItems.map((item) => `${item.time} ${item.task}`).join('\n')}
            onChange={(e) => setScheduleText(e.target.value)}
            rows={14}
          />
        </label>

        <button type="button" onClick={() => onSave(draft)}>
          Save day
        </button>
      </article>
    </section>
  );
};

const SettingsPage = ({
  settings,
  onChangeResetHour,
  onResetChecks,
}: {
  settings: AppSettings;
  onChangeResetHour: (hour: number) => void;
  onResetChecks: () => void;
}) => (
  <section className="stack">
    <h2>Settings</h2>
    <article className="card">
      <label>
        Daily checkbox reset hour: {settings.resetHour24}:00
        <input
          type="range"
          min={0}
          max={12}
          value={settings.resetHour24}
          onChange={(e) => onChangeResetHour(Number(e.target.value))}
        />
      </label>
      <button type="button" onClick={onResetChecks}>
        Force reset checkboxes now
      </button>
    </article>
    <article className="card">
      <h3>Offline & install</h3>
      <p>Use browser menu: "Add to Home Screen" on Android or "Add to Home Screen" in iOS Share sheet.</p>
    </article>
  </section>
);

export default App;
