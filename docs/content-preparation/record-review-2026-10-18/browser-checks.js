// Evaluate in the private review page through T3 preview at desktop/phone widths.
// This validates the tool's public controls, not content acceptance.
(async () => {
  const checks = [];
  const check = (name, passed) => checks.push({name, passed});
  const set = (id, value) => {
    const control = document.getElementById(id);
    control.value = value;
    control.dispatchEvent(new Event(id === 'search' ? 'input' : 'change', {bubbles: true}));
  };
  const count = () => document.querySelectorAll('#records button').length;
  set('mall', 'all');
  set('search', '');
  for (const [mode, expected] of [['polygons', 42], ['gaps', 128], ['copy-findings', 20], ['content', 371], ['media', 212], ['no-media', 159]]) {
    set('mode', mode);
    check(mode + ' complete count', count() === expected);
  }
  set('mode', 'content');
  set('mall', 'saigon-centre');
  check('Saigon isolation', count() === 165 && [...document.querySelectorAll('#records small')].every(x => x.textContent.includes('saigon-centre')));
  set('mall', 'vincom-dong-khoi');
  check('Vincom isolation', count() === 206 && [...document.querySelectorAll('#records small')].every(x => x.textContent.includes('vincom-dong-khoi')));
  set('mode', 'gaps');
  check('122 original Vincom gaps', count() === 122);
  set('mall', 'saigon-centre');
  check('6 original Saigon gaps', count() === 6);
  set('mode', 'copy-findings');
  set('search', 'HIMALAYA');
  check('specific correction is visible', count() === 1 && document.getElementById('detail').textContent.includes('home fragrance products'));
  check('separate locale headings', document.getElementById('detail').textContent.includes('Vietnamese') && document.getElementById('detail').textContent.includes('English'));
  set('search', 'no-such-candidate-xxxxx');
  check('truthful empty state', count() === 0 && document.getElementById('detail').textContent.includes('No records match'));
  set('search', '');
  set('mall', 'all');
  set('mode', 'polygons');
  document.querySelector('#records button').click();
  const overlay = document.querySelector('.overlay');
  await overlay.decode();
  check('registered overlay loads', overlay.naturalWidth > 0);
  check('readable source references', [...document.querySelectorAll('#detail a')].some(a => a.href.includes('saigon-source-map.json')));
  check('no approval action', ![...document.querySelectorAll('button')].some(b => /approve|publish/i.test(b.textContent)));
  check('owner pending remains visible', document.body.textContent.includes('Owner approval remains false'));
  check('no horizontal overflow', document.documentElement.scrollWidth <= innerWidth);
  return {width: innerWidth, checks};
})()
