/**
 * Sri Sai Vasudev Residency — Document-Centric Singleton Edit Engine v2
 * ─────────────────────────────────────────────────────────────────────
 * ONE instance. ONE listener on document. ALWAYS on. ZERO per-component wiring.
 *
 * Strategy:
 *  - SheetsEditableCell components manage their OWN editing (they render <input>).
 *  - This engine handles every OTHER plain <td> that is not a SheetsEditableCell.
 *  - No isActive toggle. No per-container useEffect. No per-file hook.
 *
 * Key scheme (stable across re-renders):
 *   data-table + data-field + data-row-key  →  preferred
 *   tableName  + rowIndex   + colIndex      →  auto-fallback
 */

const STORAGE_KEY = 'hsi_edits_v2';
const SYNC_URL    = '/api/sync';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Returns true if this <td> should be taken over by the engine.
 * Exclusions:
 *  - .sheets-editable-cell  → SheetsEditableCell handles itself
 *  - .no-inline-edit / .no-edit / [data-no-edit]  → explicitly locked
 *  - Inside <button>, <a>, <label>
 *  - Cell whose ONLY children are form controls (input/select/textarea/button)
 */
function isEngineTarget(el) {
  if (!el || el.tagName !== 'TD') return false;
  if (el.classList.contains('sheets-editable-cell'))  return false;
  if (el.closest('.no-inline-edit, .no-edit, [data-no-edit]')) return false;
  if (el.closest('button, a, label')) return false;

  // Skip cells that are purely interactive controls
  const kids = [...el.children];
  if (kids.length > 0) {
    const allControls = kids.every(c =>
      ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(c.tagName)
    );
    if (allControls) return false;
  }

  return true;
}

/**
 * Generate a stable string key for a cell.
 * Prefers explicit data attributes; falls back to position in table.
 */
function cellKey(cell) {
  const table  = cell.dataset.table ||
                 cell.closest('[data-table-name]')?.dataset.tableName ||
                 'tbl';
  const field  = cell.dataset.field || cell.dataset.editField || '';
  const rowKey = cell.dataset.rowKey ||
                 cell.dataset.roomId ||
                 cell.closest('tr')?.dataset.rowKey || '';

  if (field && rowKey) return `${table}::${field}::${rowKey}`;

  // Positional fallback
  const row   = cell.closest('tr');
  const tbody = row?.closest('tbody') || row?.closest('table');
  const ri    = tbody ? [...tbody.querySelectorAll('tr')].indexOf(row)       : 0;
  const ci    = row  ? [...row.children].indexOf(cell) : 0;
  return `${table}::r${ri}c${ci}`;
}

/* ─── Engine class ────────────────────────────────────────────────────────── */

class HotelEditEngine {
  #active     = null;   // currently editing <td>
  #inited     = false;

  init() {
    if (this.#inited) return;
    this.#inited = true;

    // Single capturing listener — fires before React synthetic events
    document.addEventListener('click',   this.#onClick.bind(this),   true);
    document.addEventListener('keydown', this.#onKeyDown.bind(this), true);

    // Restore on first paint and whenever React remounts tables
    const restore = () => this.#restoreAll();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restore);
    } else {
      setTimeout(restore, 600);
    }
    // Re-run restore whenever a component signals it mounted a table
    window.addEventListener('hsi:table-mounted', restore);
    // Also re-run after route changes or modal opens (MutationObserver is overkill — 
    // a small periodic flush on visibility change is enough for an SPA)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) restore();
    });
  }

  /* ── Click ── */

  #onClick(e) {
    const td = e.target.closest('td');

    if (!td || !isEngineTarget(td)) {
      // Clicked outside an engine-managed cell → commit active
      if (this.#active) this.#commit();
      return;
    }

    if (td === this.#active) return;  // same cell, cursor already there

    if (this.#active) this.#commit();
    this.#activate(td);
  }

  /* ── Activate ── */

  #activate(cell) {
    this.#active           = cell;
    cell.dataset._orig     = cell.innerText;
    cell.contentEditable   = 'true';
    cell.spellcheck        = false;
    cell.classList.add('hsi-editing');

    requestAnimationFrame(() => {
      try {
        cell.focus();
        const range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (_) { /* ignore */ }
    });
  }

  /* ── Keyboard ── */

  #onKeyDown(e) {
    if (!this.#active) return;

    switch (e.key) {
      case 'Enter':
        if (!e.shiftKey) {
          e.preventDefault();
          this.#commit();
          this.#jumpTo('down');
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.#revert();
        break;
      case 'Tab':
        e.preventDefault();
        this.#commit();
        this.#jumpTo(e.shiftKey ? 'left' : 'right');
        break;
      default:
        break;
    }
  }

  /** Move focus to the next/prev/below engine-managed cell in DOM order */
  #jumpTo(dir) {
    const prev = this.#active;
    if (!prev) return;

    const row    = prev.closest('tr');
    const tbody  = row?.closest('tbody') || row?.closest('table');
    let next     = null;

    if (dir === 'right' || dir === 'left') {
      const cells = [...(row?.querySelectorAll('td') || [])];
      const idx   = cells.indexOf(prev);
      next = dir === 'right' ? cells[idx + 1] : cells[idx - 1];
    } else if (dir === 'down') {
      const rows  = [...(tbody?.querySelectorAll('tr') || [])];
      const rIdx  = rows.indexOf(row);
      const cIdx  = [...(row?.children || [])].indexOf(prev);
      const nRow  = rows[rIdx + 1];
      if (nRow) next = nRow.children[cIdx] || null;
    }

    if (next && isEngineTarget(next)) this.#activate(next);
  }

  /* ── Commit / Revert ── */

  #commit() {
    const cell = this.#active;
    if (!cell) return;
    this.#active = null;

    cell.contentEditable = 'false';
    cell.classList.remove('hsi-editing');

    const newVal = cell.innerText.trim();
    const oldVal = (cell.dataset._orig || '').trim();
    delete cell.dataset._orig;

    if (newVal !== oldVal) {
      this.#flash(cell);
      this.#save(cellKey(cell), newVal, cell);
    }
  }

  #revert() {
    const cell = this.#active;
    if (!cell) return;
    cell.innerText     = cell.dataset._orig || cell.innerText;
    this.#active       = null;
    cell.contentEditable = 'false';
    cell.classList.remove('hsi-editing');
    delete cell.dataset._orig;
  }

  /* ── Flash ── */

  #flash(cell) {
    cell.classList.add('hsi-save-success-flash');
    setTimeout(() => cell.classList.remove('hsi-save-success-flash'), 1200);
  }

  /* ── Persist ── */

  #save(key, value, cell) {
    // 1. localStorage (immediate, synchronous)
    try {
      const store  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[key]   = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (_) { /* quota / private mode */ }

    // 2. Cloudflare D1 (fire and forget)
    fetch(SYNC_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_inline_override',
        payload: {
          key,
          value,
          tableName: cell?.closest('[data-table-name]')?.dataset.tableName || 'universal_matrix',
          editedBy:  localStorage.getItem('hsi_staff_user') || 'Front Desk'
        }
      })
    }).catch(() => { /* network offline — localStorage already saved */ });

    // 3. Reactive broadcast for any component listening
    window.dispatchEvent(new CustomEvent('hsi:edited', {
      detail: { key, value, cell }
    }));
  }

  /* ── Restore persisted edits ── */

  #restoreAll() {
    try {
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!Object.keys(store).length) return;

      document.querySelectorAll('td').forEach(cell => {
        if (!isEngineTarget(cell)) return;
        const k = cellKey(cell);
        if (store[k] !== undefined && cell.innerText.trim() !== store[k]) {
          cell.innerText = store[k];
        }
      });
    } catch (_) { /* ignore */ }
  }

  /* ── Public API ── */

  /** Manually trigger a restore pass (call after dynamically mounting new rows) */
  restore() { this.#restoreAll(); }

  /** Programmatically save a cell value by key */
  set(key, value) {
    try {
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[key]  = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  /** Clear all persisted edits and reload */
  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

/* ─── Mount singleton ────────────────────────────────────────────────────── */
export const editEngine = new HotelEditEngine();
editEngine.init();
