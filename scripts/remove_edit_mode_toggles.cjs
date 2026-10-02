/**
 * remove_edit_mode_toggles.cjs
 * Removes the "click to activate edit mode" toggle pattern from all modal files.
 * Replaces with always-on inline editing — badge="editable" always visible, no state toggle needed.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'components');

// ─── Helper ───────────────────────────────────────────────────────────────────
function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

function applyRegex(content, pattern, replacement) {
  return content.replace(pattern, replacement);
}

// ─── FolioActionsModal.jsx ───────────────────────────────────────────────────
{
  const file = path.join(SRC, 'FolioActionsModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state declaration
  c = c.replace(/\n\s*\/\/ Live Folio Interactive Spreadsheet Edit Mode\n\s*const \[isFolioEditMode, setIsFolioEditMode\] = useState\(true\);\n/, '\n');

  // Remove the entire toggle button span (line 779-807 block)
  // Pattern: the span with onClick={() => setIsFolioEditMode(!isFolioEditMode)}
  c = c.replace(/\s*<span\s*\n\s*onClick=\{\(\) => setIsFolioEditMode\(!isFolioEditMode\)\}[\s\S]*?<\/span>\n\s*(?=<h2)/g, '\n              ');

  // Replace conditional badge with always "editable"
  c = replaceAll(c, 'badge={isFolioEditMode ? "editable" : "locked"}', 'badge="editable"');

  // Replace subtitle conditional
  c = c.replace(/subtitle=\{isFolioEditMode \? "Live Interactive Google Sheets Mode.*?: "Read-Only Mode.*?"\}/g,
    'subtitle="Live Interactive Google Sheets Mode • Click any cell to edit inline • Enter or Tab to commit"');

  // Remove disabled={!isFolioEditMode} — replace with just enabled
  c = c.replace(/\s*disabled=\{!isFolioEditMode\}/g, '');
  c = c.replace(/\s*disabled=\{!isFolioEditMode \|\| /g, '\n                disabled={');

  // Fix background/color styles that depended on isFolioEditMode
  c = c.replace(/background: isFolioEditMode \? 'rgba\(56, 189, 248, 0\.08\)' : 'transparent'/g, "background: 'rgba(56, 189, 248, 0.08)'");
  c = c.replace(/background: isFolioEditMode \? 'rgba\(251, 191, 36, 0\.08\)' : 'transparent'/g, "background: 'rgba(251, 191, 36, 0.08)'");
  c = c.replace(/background: isFolioEditMode \? 'rgba\(147, 197, 253, 0\.08\)' : 'transparent'/g, "background: 'rgba(147, 197, 253, 0.08)'");

  // Remove isEditMode prop from SheetsToolbarLegend (it no longer uses it)
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isFolioEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ FolioActionsModal.jsx done');
}

// ─── MasterFolioModal.jsx ────────────────────────────────────────────────────
{
  const file = path.join(SRC, 'MasterFolioModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state declaration
  c = c.replace(/\n\s*const \[isMasterFolioEditMode, setIsMasterFolioEditMode\] = useState\(true\);\n/, '\n');

  // Remove entire toggle button (the span with onClick setIsMasterFolioEditMode)
  c = c.replace(/\s*<span[\s\S]*?onClick=\{\(\) => setIsMasterFolioEditMode\(!isMasterFolioEditMode\)\}[\s\S]*?<\/span>\n/g, '\n');

  // Replace conditional badges
  c = replaceAll(c, 'badge={isMasterFolioEditMode ? "editable" : "locked"}', 'badge="editable"');

  // Subtitle
  c = c.replace(/subtitle=\{isMasterFolioEditMode \? ".*?" : ".*?"\}/g,
    'subtitle="Live Interactive Google Sheets Mode • Click any cell to edit inline • Enter to save"');

  // disabled
  c = c.replace(/\s*disabled=\{!isMasterFolioEditMode\}/g, '');

  // SheetsToolbarLegend
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isMasterFolioEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ MasterFolioModal.jsx done');
}

// ─── TallyConsoleModal.jsx ───────────────────────────────────────────────────
{
  const file = path.join(SRC, 'TallyConsoleModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state
  c = c.replace(/\n\s*const \[isTallyEditMode, setIsTallyEditMode\] = useState\(true\);\n/, '\n');

  // Remove toggle button block
  c = c.replace(/\s*<button[^>]*onClick=\{\(\) => setIsTallyEditMode\(prev => !prev\)\}[\s\S]*?<\/button>/g, '');
  // Some files may use span instead of button
  c = c.replace(/\s*<span[^>]*onClick=\{\(\) => setIsTallyEditMode\(prev => !prev\)\}[\s\S]*?<\/span>/g, '');

  // Remove SheetsToolbarLegend isEditMode prop
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isTallyEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  // Remove disabled={!isTallyEditMode}
  c = c.replace(/\s*disabled=\{!isTallyEditMode\}/g, '');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ TallyConsoleModal.jsx done');
}

// ─── StoreInventoryModal.jsx ─────────────────────────────────────────────────
{
  const file = path.join(SRC, 'StoreInventoryModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state
  c = c.replace(/\n\s*const \[isStoreEditMode, setIsStoreEditMode\] = useState\(true\);\n/, '\n');

  // Remove toggle button/span
  c = c.replace(/\s*<button[^>]*onClick=\{\(\) => setIsStoreEditMode\(prev => !prev\)\}[\s\S]*?<\/button>/g, '');
  c = c.replace(/\s*<span[^>]*onClick=\{\(\) => setIsStoreEditMode\(prev => !prev\)\}[\s\S]*?<\/span>/g, '');

  // SheetsToolbarLegend
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isStoreEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  // disabled
  c = c.replace(/\s*disabled=\{!isStoreEditMode\}/g, '');

  // badges
  c = replaceAll(c, 'badge={isStoreEditMode ? "editable" : "locked"}', 'badge="editable"');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ StoreInventoryModal.jsx done');
}

// ─── RevenueManagementModal.jsx ──────────────────────────────────────────────
{
  const file = path.join(SRC, 'RevenueManagementModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state
  c = c.replace(/\n\s*const \[isRmsEditMode, setIsRmsEditMode\] = useState\(true\);\n/, '\n');

  // Remove toggle button/span
  c = c.replace(/\s*<button[^>]*onClick=\{\(\) => setIsRmsEditMode\(prev => !prev\)\}[\s\S]*?<\/button>/g, '');
  c = c.replace(/\s*<span[^>]*onClick=\{\(\) => setIsRmsEditMode\(prev => !prev\)\}[\s\S]*?<\/span>/g, '');

  // SheetsToolbarLegend
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isRmsEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  // disabled
  c = c.replace(/\s*disabled=\{!isRmsEditMode\}/g, '');

  // badges
  c = replaceAll(c, 'badge={isRmsEditMode ? "editable" : "locked"}', 'badge="editable"');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ RevenueManagementModal.jsx done');
}

// ─── AccountsLedgerModal.jsx ─────────────────────────────────────────────────
{
  const file = path.join(SRC, 'AccountsLedgerModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove state - replace with always-on (keep isActive=true for useUniversalInlineEdit)
  c = c.replace(/const \[isAccountsEditActive, setIsAccountsEditActive\] = useState\(true\);/g,
    'const isAccountsEditActive = true; // Always-on inline editing — no toggle needed');

  // Remove toggle button/span
  c = c.replace(/\s*<button[^>]*onClick=\{\(\) => setIsAccountsEditActive\(!isAccountsEditActive\)\}[\s\S]*?<\/button>/g, '');
  c = c.replace(/\s*<span[^>]*onClick=\{\(\) => setIsAccountsEditActive\(!isAccountsEditActive\)\}[\s\S]*?<\/span>/g, '');

  // Replace 'Edit Mode: ACTIVE' / 'Direct Ledger Edit' conditional with fixed label
  c = c.replace(/\{isAccountsEditActive \? '✏️ Edit Mode: ACTIVE' : '✏️ Direct Ledger Edit'\}/g,
    "{'✏️ Direct Edit — Always Active'}");

  // Replace togglable background/color styles
  c = c.replace(/background: isAccountsEditActive \? 'rgba\(52, 211, 153, 0\.2\)' : 'rgba\(255, 255, 255, 0\.08\)'/g,
    "background: 'rgba(52, 211, 153, 0.2)'");
  c = c.replace(/color: isAccountsEditActive \? '#34d399' : 'var\(--text-muted\)'/g,
    "color: '#34d399'");
  c = c.replace(/border: isAccountsEditActive \? '1px solid #34d399' : '1px solid rgba\(255, 255, 255, 0\.2\)'/g,
    "border: '1px solid #34d399'");
  c = c.replace(/boxShadow: isAccountsEditActive \? '0 0 10px rgba\(52, 211, 153, 0\.2\)' : 'none'/g,
    "boxShadow: '0 0 10px rgba(52, 211, 153, 0.2)'");

  // SheetsToolbarLegend
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isAccountsEditActive\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  // disabled
  c = c.replace(/\s*disabled=\{!isAccountsEditActive\}/g, '');

  // badges
  c = replaceAll(c, 'badge={isAccountsEditActive ? "editable" : "locked"}', 'badge="editable"');

  // className conditional with isAccountsEditActive
  c = c.replace(/`glass-panel printable-ledger printable-sheet \$\{isAccountsEditActive \? 'hsi-live-edit-active' : ''\}`/g,
    "'glass-panel printable-ledger printable-sheet hsi-live-edit-active'");

  // {isAccountsEditActive ? (editable things) : (read-only)} — collapse to always show editable
  // These are complex conditional blocks; we handle the simpler ones here
  c = c.replace(/\{isAccountsEditActive \&\& \(/g, '{(');
  c = c.replace(/\{isAccountsEditActive \&\& /g, '{');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ AccountsLedgerModal.jsx done');
}

// ─── BookingReceiptModal.jsx ─────────────────────────────────────────────────
{
  const file = path.join(SRC, 'BookingReceiptModal.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Replace state initialization — always true
  c = c.replace(/const \[isLiveEditMode, setIsLiveEditMode\] = useState\(booking\?\.isLiveEditMode !== false\)/g,
    'const isLiveEditMode = true // Always-on inline editing');
  c = c.replace(/const \[isLiveEditMode, setIsLiveEditMode\] = useState\(.*?\);/g,
    'const isLiveEditMode = true; // Always-on inline editing');

  // Remove setIsLiveEditMode calls from useEffect
  c = c.replace(/\s*if \(booking\.isLiveEditMode !== undefined\) \{\n\s*setIsLiveEditMode\(Boolean\(booking\.isLiveEditMode\)\);\n\s*\}/g, '');

  // Remove toggle button/span
  c = c.replace(/\s*<button[^>]*onClick=\{\(\) => setIsLiveEditMode\(!isLiveEditMode\)\}[\s\S]*?<\/button>/g, '');
  c = c.replace(/\s*<span[^>]*onClick=\{\(\) => setIsLiveEditMode\(!isLiveEditMode\)\}[\s\S]*?<\/span>/g, '');

  // className with isLiveEditMode
  c = c.replace(/`official-invoice-modal-content \$\{isLiveEditMode \? 'hsi-live-edit-active' : ''\}`/g,
    "'official-invoice-modal-content hsi-live-edit-active'");

  // {isLiveEditMode && (...)} blocks — always show them
  c = c.replace(/\{isLiveEditMode \&\& \(/g, '{(');
  c = c.replace(/\{isLiveEditMode \&\& /g, '{');

  // {isLiveEditMode ? (a) : (b)} — collapse to always show (a) — tricky, handle simpler cases
  // colSpan conditionals: isLiveEditMode ? 7 : 7 — both same, just simplify
  c = c.replace(/isLiveEditMode \? 7 : 7/g, '7');

  // SheetsToolbarLegend
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{isLiveEditMode\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');

  // isActive={isLiveEditMode} → isActive={true}
  c = c.replace(/isActive=\{isLiveEditMode\}/g, 'isActive={true}');

  // disabled
  c = c.replace(/\s*disabled=\{!isLiveEditMode\}/g, '');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ BookingReceiptModal.jsx done');
}

// ─── UniversalInlineEditor.jsx — update SheetsToolbarLegend ─────────────────
{
  const file = path.join(SRC, 'UniversalInlineEditor.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // SheetsToolbarLegend: remove isEditMode prop since it's always active now
  // Update the component signature to remove the prop
  c = c.replace(
    /export function SheetsToolbarLegend\(\{\s*\n?\s*tableName = 'Live Spreadsheet Matrix',\s*\n?\s*subtitle = 'Interactive Google Sheets Mode',\s*\n?\s*(?:isEditMode[^,\n]*,\s*\n?\s*)?style = \{\}\s*\n?\s*\}\)/,
    `export function SheetsToolbarLegend({\n  tableName = 'Live Spreadsheet Matrix',\n  subtitle = 'Interactive Google Sheets Mode',\n  style = {}\n})`
  );

  // useUniversalInlineEdit: change default isActive from false to true
  c = c.replace(/isActive = false,/, 'isActive = true,');

  // UniversalInlineContainer: change default isActive from false to true
  c = c.replace(/isActive = false,\s*\n?\s*onSave,/, 'isActive = true,\n  onSave,');

  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ UniversalInlineEditor.jsx done');
}

// ─── ReceptionAdmin.jsx — remove isEditMode props ───────────────────────────
{
  const file = path.join(SRC, 'ReceptionAdmin.jsx');
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{true\}/g, '<SheetsToolbarLegend');
  c = c.replace(/<SheetsToolbarLegend isEditMode=\{false\}/g, '<SheetsToolbarLegend');
  fs.writeFileSync(file, c, 'utf8');
  console.log('✅ ReceptionAdmin.jsx done');
}

console.log('\n🎉 All files updated — edit mode toggles removed. Inline editing is now always-on.');
