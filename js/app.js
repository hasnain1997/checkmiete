// ============================================================
// CheckMiete.de — Application Logic
// ============================================================

let currentCity = 'munich';

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildDropdowns();
  updateRange(document.getElementById('size-range'), 'size-display');
});

// ── City switch ───────────────────────────────────────────
function setCity(c) {
  currentCity = c;
  document.getElementById('tab-munich').classList.toggle('active', c === 'munich');
  document.getElementById('tab-berlin').classList.toggle('active', c === 'berlin');
  const d = CITY_DATA[c];
  document.getElementById('stat-avg').textContent       = d.avg;
  document.getElementById('stat-units').textContent     = d.units;
  document.getElementById('stat-contracts').textContent = d.contracts;
  buildDropdowns();
  resetForm();
}

function buildDropdowns() {
  const d = CITY_DATA[currentCity];

  // Year built
  const ys = document.getElementById('build-year');
  ys.innerHTML = '';
  d.buildYears.forEach((v, i) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = d.buildLabels[i];
    if (v === d.defaultYear) o.selected = true;
    ys.appendChild(o);
  });

  // Location
  const ls = document.getElementById('location');
  ls.innerHTML = '';
  d.locs.forEach(loc => {
    const o = document.createElement('option');
    o.value = loc.val;
    o.textContent = loc.label;
    if (loc.val === d.defaultLoc) o.selected = true;
    ls.appendChild(o);
  });

  // District
  const ds = document.getElementById('district-select');
  ds.innerHTML = '<option value="">Select district...</option>';
  d.districts.forEach(name => {
    const o = document.createElement('option');
    o.value = name;
    o.textContent = name;
    ds.appendChild(o);
  });

  // Berlin note
  document.getElementById('berlin-location-note').style.display =
    currentCity === 'berlin' ? 'block' : 'none';
}

// ── Step navigation ───────────────────────────────────────
function goStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('visible'));
  document.getElementById('step-' + n).classList.add('visible');

  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('dot-' + i);
    dot.classList.remove('active', 'done');
    if (i < n) dot.classList.add('done');
    else if (i === n) dot.classList.add('active');
  }

  const isBerlin = currentCity === 'berlin';

  if (n === 2) {
    const year = document.getElementById('build-year').value;
    document.getElementById('munich-step2').style.display = isBerlin ? 'none' : 'block';
    document.getElementById('berlin-step2').style.display = isBerlin ? 'block' : 'none';
    if (!isBerlin) {
      const isAltbau    = ['pre_1918','1919_1929','1930_1948'].includes(year);
      const isNachkrieg = ['1949_1966','1967_1977'].includes(year);
      document.getElementById('altbau-field').style.display    = isAltbau    ? 'block' : 'none';
      document.getElementById('nachkrieg-field').style.display = isNachkrieg ? 'block' : 'none';
    }
  }

  if (n === 3) {
    document.getElementById('munich-step3').style.display = isBerlin ? 'none' : 'block';
    document.getElementById('berlin-step3').style.display = isBerlin ? 'block' : 'none';
  }
}

// ── Range slider ──────────────────────────────────────────
function updateRange(el, displayId) {
  document.getElementById(displayId).textContent = el.value;
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty('--pct', pct + '%');
}

// ── Chip helpers ──────────────────────────────────────────
function selectChip(el, groupId) {
  document.querySelectorAll('#' + groupId + ' .chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function toggleChip(el) {
  el.classList.toggle('selected');
}

function getChipVal(groupId) {
  const s = document.querySelector('#' + groupId + ' .chip.selected');
  return s ? parseFloat(s.dataset.val || 0) : 0;
}

function getToggleSum(groupId) {
  let sum = 0;
  document.querySelectorAll('#' + groupId + ' .chip.selected').forEach(c => {
    sum += parseFloat(c.dataset.val || 0);
  });
  return sum;
}

// ── Calculate ─────────────────────────────────────────────
function calculate() {
  const rent = parseFloat(document.getElementById('rent-input').value);
  if (!rent || rent < 50) {
    alert('Please enter your monthly net cold rent.');
    return;
  }

  const size = parseInt(document.getElementById('size-range').value);
  let fairPerSqm, basePrice, locAdj, equipAdj;

  if (currentCity === 'munich') {
    const r = calcMunich(size);
    fairPerSqm = r.total; basePrice = r.base; locAdj = r.loc; equipAdj = r.equip;
  } else {
    const r = calcBerlin(size);
    fairPerSqm = r.total; basePrice = r.base; locAdj = 0; equipAdj = r.equip;
  }

  const fairMonthly = fairPerSqm * size;
  const yourPerSqm  = rent / size;
  const diff        = rent - fairMonthly;
  const pctOver     = (diff / fairMonthly) * 100;
  const cityName    = currentCity === 'munich' ? 'Munich' : 'Berlin';

  // Verdict
  let cls, icon, headline, subline, infoHtml;

  if (pctOver > 10) {
    cls = 'overpaying'; icon = '⚠️';
    headline = `You're overpaying by €${Math.round(Math.abs(diff))}/month`;
    subline  = `Your rent is ${pctOver.toFixed(1)}% above the official Mietspiegel — beyond the legal Mietpreisbremse limit.`;
    infoHtml = `<strong>This may be illegal.</strong> Your rent exceeds the Mietspiegel value by more than 10% (+${pctOver.toFixed(1)}%). Under the <em>Mietpreisbremse</em>, new rental contracts in ${cityName} cannot exceed this threshold. You may have the right to demand a reduction back to €${Math.round(fairMonthly * 1.1)}/month. Contact the local Mieterverein for free legal advice.`;
  } else if (pctOver > 0) {
    cls = 'fair'; icon = '📊';
    headline = `Slightly above average (+${pctOver.toFixed(1)}%)`;
    subline  = `€${Math.round(diff)}/month above the Mietspiegel median — within the 10% legal limit.`;
    infoHtml = `<strong>Within the legal range.</strong> Your rent is ${pctOver.toFixed(1)}% above the Mietspiegel average but below the 10% Mietpreisbremse threshold. Any future increase must reference the Mietspiegel and cannot exceed 15% within 3 years.`;
  } else {
    cls = 'underpaying'; icon = '✅';
    headline = `Good deal! You save €${Math.abs(Math.round(diff))}/month`;
    subline  = `Your rent is below the Mietspiegel average — well within legal limits.`;
    infoHtml = `<strong>Your rent is below market average</strong> — a solid deal in ${cityName}'s tight market. Your landlord can legally raise your rent toward the Mietspiegel level (${fairPerSqm.toFixed(2)}€/m²), but must give 3 months' notice and cannot exceed 15% within 3 years.`;
  }

  // Meter position
  const minR = fairMonthly * 0.6, maxR = fairMonthly * 1.55;
  const meterPct = Math.min(100, Math.max(1, ((rent - minR) / (maxR - minR)) * 100));

  // Show results panel
  document.getElementById('form-wrapper').style.display = 'none';
  const res = document.getElementById('results');
  res.style.display = 'block';
  res.classList.add('animate-in');

  // Verdict
  document.getElementById('verdict-icon').className = 'verdict-icon ' + cls;
  document.getElementById('verdict-icon').textContent = icon;
  const vt = document.getElementById('verdict-title');
  vt.className = cls; vt.textContent = headline;
  document.getElementById('verdict-sub').textContent = subline;

  // Animate meter
  setTimeout(() => {
    document.getElementById('meter-fill').style.width = meterPct + '%';
    document.getElementById('meter-fill').className = 'meter-fill ' + cls;
    document.getElementById('meter-marker').style.left = meterPct + '%';
  }, 100);

  // Numbers
  document.getElementById('res-fair').textContent  = fairPerSqm.toFixed(2) + ' €/m²';
  document.getElementById('res-yours').textContent = yourPerSqm.toFixed(2) + ' €/m²';
  const de = document.getElementById('res-diff');
  de.textContent = (diff >= 0 ? '+' : '') + Math.round(diff) + ' €/mo';
  de.style.color = pctOver > 10 ? 'var(--accent)' : pctOver > 0 ? 'var(--yellow)' : 'var(--green)';

  // Breakdown
  document.getElementById('br-base').textContent = basePrice.toFixed(2) + ' €/m²';
  document.getElementById('br-loc-lbl').textContent = currentCity === 'berlin' ? 'Location (in base table)' : 'Location surcharge';
  document.getElementById('br-loc').textContent  = currentCity === 'berlin' ? '(table-based)' : (locAdj >= 0 ? '+' : '') + locAdj.toFixed(2) + ' €/m²';
  document.getElementById('br-loc').className    = 'bval ' + (locAdj >= 0 ? 'pos' : 'neg');
  document.getElementById('br-equip-lbl').textContent = currentCity === 'berlin' ? 'Equip. / span adjustment' : 'Equipment adjustments';
  document.getElementById('br-equip').textContent = (equipAdj >= 0 ? '+' : '') + equipAdj.toFixed(2) + ' €/m²';
  document.getElementById('br-equip').className   = 'bval ' + (equipAdj >= 0 ? 'pos' : 'neg');
  document.getElementById('br-total').textContent   = fairPerSqm.toFixed(2) + ' €/m²';
  document.getElementById('br-monthly').textContent = '= ' + Math.round(fairMonthly) + ' €/month';

  document.getElementById('result-info-box').innerHTML = infoHtml;
  document.getElementById('right-contact').innerHTML =
    `<div class="right-icon">🏛️</div><div class="right-text">${CITY_DATA[currentCity].contactHtml}</div>`;
}

// ── Munich calculation ────────────────────────────────────
function calcMunich(size) {
  const year   = document.getElementById('build-year').value;
  const locKey = document.getElementById('location').value;
  const locDef = CITY_DATA.munich.locs.find(l => l.val === locKey);
  const loc    = locDef ? locDef.surcharge : 0;

  // Lookup base price
  let base = 12.0;
  for (const [range, prices] of Object.entries(MUNICH_PRICES)) {
    const parts = range.split('-');
    const lo = parseInt(parts[0]);
    const hi = parseInt(parts[parts.length - 1]);
    if (size >= lo && size <= hi) {
      const idx = MUNICH_BUILD_YEARS.indexOf(year);
      base = prices[idx >= 0 ? idx : 5];
      break;
    }
  }

  const struct    = getChipVal('chips-building');
  const altbau    = getChipVal('chips-altbau');
  const nachkrieg = getChipVal('chips-nachkrieg');
  const heat      = getChipVal('chips-heat');
  const bath      = getToggleSum('chips-bath');
  const kitchen   = getToggleSum('chips-kitchen');
  const floor     = getChipVal('chips-floor');
  const floorMod  = getToggleSum('.chips') || 0; // renovated floor chip standalone
  const other     = getToggleSum('chips-other');

  // Renovated floor is a standalone chip without group id — get manually
  const rfChip = document.querySelector('[data-val="1.86"]');
  const rf = (rfChip && rfChip.classList.contains('selected')) ? 1.86 : 0;

  const equip = struct + altbau + nachkrieg + heat + bath + kitchen + floor + rf + other;
  return { total: base + loc + equip, base, loc, equip };
}

// ── Berlin calculation ────────────────────────────────────
function calcBerlin(size) {
  const year   = document.getElementById('build-year').value;
  const locKey = document.getElementById('location').value;
  const locIdx = { einfach: 0, mittel: 1, gut: 2 }[locKey] ?? 1;

  // Size band
  let band = '40-60';
  if (size < 40)       band = '<40';
  else if (size < 60)  band = '40-60';
  else if (size < 90)  band = '60-90';
  else                 band = '90+';

  const row = BERLIN_TABLE[band][year];
  let base = 7.0;
  if (row) {
    base = row[locIdx] ?? row.find(v => v !== null) ?? 7.0;
  }

  const equipDeduct = getChipVal('chips-berlin-equip');
  const spanPos     = getChipVal('chips-berlin-span');
  let spanAdj = 0;
  if (row && spanPos !== 0) {
    spanAdj = spanPos < 0 ? -(row[3] || 1.0) : (row[4] || 1.0);
  }

  const equip = equipDeduct + spanAdj;
  return { total: base + equip, base, equip };
}

// ── Reset form ────────────────────────────────────────────
function resetForm() {
  document.getElementById('form-wrapper').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('rent-input').value = '';
  goStep(1);

  // Reset all chip groups
  const radioGroups = ['chips-building','chips-altbau','chips-heat','chips-floor','chips-berlin-equip'];
  radioGroups.forEach(id => {
    const chips = document.querySelectorAll('#' + id + ' .chip');
    chips.forEach((c, i) => {
      i === 0 ? c.classList.add('selected') : c.classList.remove('selected');
    });
  });
  // Altbau default = 3rd chip (Standard)
  const altbauChips = document.querySelectorAll('#chips-altbau .chip');
  altbauChips.forEach(c => c.classList.remove('selected'));
  if (altbauChips[2]) altbauChips[2].classList.add('selected');

  // Nachkrieg default = 1st chip
  const nk = document.querySelectorAll('#chips-nachkrieg .chip');
  nk.forEach((c, i) => i === 0 ? c.classList.add('selected') : c.classList.remove('selected'));

  // Berlin span default = middle (index 1)
  const spanChips = document.querySelectorAll('#chips-berlin-span .chip');
  spanChips.forEach(c => c.classList.remove('selected'));
  if (spanChips[1]) spanChips[1].classList.add('selected');

  // Multi-select groups: deselect all
  ['chips-bath','chips-kitchen','chips-other'].forEach(id => {
    document.querySelectorAll('#' + id + ' .chip').forEach(c => c.classList.remove('selected'));
  });
  // Standalone renovated floor chip
  const rfChip = document.querySelector('[data-val="1.86"]');
  if (rfChip) rfChip.classList.remove('selected');

  // Reset range
  const rng = document.getElementById('size-range');
  rng.value = 60;
  updateRange(rng, 'size-display');
}
