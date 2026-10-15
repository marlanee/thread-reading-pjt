/* ThRead: Bootstrap components + local shelf/threads + National Library search. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const books = window.THREAD_BOOKS || [];
  const apiBase = (window.THREAD_API_BASE || '').replace(/\/$/, '');
  const apiUrl = path => apiBase + path;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem('thread.' + key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem('thread.' + key, JSON.stringify(value)); return true; } catch { toast('브라우저 저장 공간을 사용할 수 없어요. 저장 설정을 확인해주세요.'); return false; } },
  };
  function toast(message) {
    $('#feedbackMessage').textContent = message;
    bootstrap.Toast.getOrCreateInstance($('#feedbackToast'), { delay: 3300 }).show();
  }
  function safeImage(value) {
    if (/^assets\/[a-zA-Z0-9_/.\-]+$/.test(value || '')) return value;
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function safeLink(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function knownCover(book) {
    if (safeImage(book.cover)) return safeImage(book.cover);
    const known = books.find(b => book.isbn && b.isbn === book.isbn) || books.find(b => book.title?.split(/\s*[:：]/)[0] === b.title);
    return known?.cover || '';
  }
  function coverMarkup(book) {
    const cover = knownCover(book);
    return cover ? `<img src="${esc(cover)}" alt="${esc(book.title)} 표지" loading="lazy">` : `<span class="cover-fallback"><i class="bi bi-book" aria-hidden="true"></i>${esc(book.title)}<small>ThRead LIBRARY</small></span>`;
  }
  function detailHref(book) {
    if (books.some(b => b.id === book.id)) return '07-book_detail.html?book=' + encodeURIComponent(book.id);
    try {
      sessionStorage.setItem('thread.book.' + book.id, JSON.stringify(book));
    } catch { /* Shelf cache is a second way to reopen a saved API record. */ }
    return '07-book_detail.html?book=' + encodeURIComponent(book.id);
  }
  function getShelf() {
    const saved = store.get('shelf', []);
    return Array.isArray(saved) ? saved.filter(b => b && typeof b.title === 'string' && typeof b.id === 'string').slice(0, 300) : [];
  }
  function renderShelf() {
    const shelf = getShelf();
    $$('.shelf-count').forEach(el => el.textContent = shelf.length);
    const target = $('#shelfBooks');
    target.innerHTML = shelf.length ? shelf.map(b => `<article class="shelf-item"><a href="${esc(detailHref(b))}" aria-label="${esc(b.title)} 상세 보기">${knownCover(b) ? `<img src="${esc(knownCover(b))}" alt="${esc(b.title)} 표지">` : '<i class="bi bi-book fs-2" aria-hidden="true"></i>'}</a><div><h3><a href="${esc(detailHref(b))}">${esc(b.title)}</a></h3><p>${esc(b.author)}</p></div><button type="button" data-remove-book="${esc(b.id)}" aria-label="${esc(b.title)} 책장에서 빼기"><i class="bi bi-x-lg" aria-hidden="true"></i></button></article>`).join('') : '<div class="shelf-empty"><i class="bi bi-bookmark-heart" aria-hidden="true"></i><p>아직은 비어 있는 책장.<br>읽고 싶은 책을 한 권 담아볼까요?</p><a href="08-search.html" class="text-action">책 찾으러 가기 ↗</a></div>';
    updateSaveButton();
  }
  $('#myShelf').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-book]');
    if (!button) return;
    if (store.set('shelf', getShelf().filter(b => b.id !== button.dataset.removeBook))) { renderShelf(); toast('책장에서 뺐어요.'); }
  });
  $('#confirmLogout').addEventListener('click', () => {
    store.set('signedOut', true);
    toast('로그아웃 확인을 마쳤어요. 이 화면은 계정 서버가 없는 데모입니다.');
  });
  // Bootstrap Carousel remains the slideshow engine; respect reduced motion and browser visibility.
  const carouselElement = $('#bestsellerCarousel');
  const bestseller = $('.bestseller');
  if (bestseller?.previousElementSibling?.classList.contains('hero-section')) {
    // Keep exactly half of the panel over the Hero at every responsive height.
    const updateOverlap = () => document.documentElement.style.setProperty('--bestseller-overlap', bestseller.getBoundingClientRect().height / 2 + 'px');
    new ResizeObserver(updateOverlap).observe(bestseller);
    updateOverlap();
  }
  if (carouselElement) {
    carouselElement.addEventListener('slid.bs.carousel', event => { $('#slideCurrent').textContent = String(event.to + 1).padStart(2, '0'); });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.addEventListener('load', () => {
      if (reduced) bootstrap.Carousel.getOrCreateInstance(carouselElement).pause();
    });
    document.addEventListener('visibilitychange', () => {
      const instance = bootstrap.Carousel.getInstance(carouselElement);
      if (instance) document.hidden || reduced ? instance.pause() : instance.cycle();
    });
  }
  $$('.nav-link[href]').forEach(link => link.addEventListener('click', () => {
    const menu = $('#mainNavigation');
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));
  $$('[data-genre-layout]').forEach(button => button.addEventListener('click', () => {
    const magazine = button.dataset.genreLayout === 'magazine';
    const grid = $('.genre-grid');
    grid.classList.toggle('magazine', magazine); grid.classList.toggle('basic', !magazine);
    $$('[data-genre-layout]').forEach(el => { const selected = el === button; el.classList.toggle('active', selected); el.setAttribute('aria-pressed', selected); });
  }));
  $$('[data-taste]').forEach(button => button.addEventListener('click', () => {
    const choice = { comfort: [3, 8, 7], world: [5, 11, 10], heart: [8, 4, 2] }[button.dataset.taste];
    const names = { comfort: '잔잔한 위로', world: '낯선 세계', heart: '다정한 관계' };
    store.set('taste', button.dataset.taste);
    const stage = $('#recommendationBooks');
    if (stage) {
      stage.innerHTML = choice.map(id => `<a href="07-book_detail.html?book=${id}"><img src="assets/bestsellers/img${id}.jpeg" alt="${esc(books[id - 1].title)} 상세 보기"></a>`).join('');
      $('#recommendationHint').textContent = `‘${names[button.dataset.taste]}’ 취향으로 고른 추천 미리보기예요.`;
    }
    bootstrap.Modal.getOrCreateInstance($('#tasteModal')).hide();
    toast('지금의 마음을 닮은 세 권을 골랐어요.');
  }));

  function userThreads() {
    const value = store.get('threads', []);
    return Array.isArray(value) ? value.filter(t => t && ['id', 'title', 'body', 'author', 'book'].every(k => typeof t[k] === 'string')).slice(0, 100) : [];
  }
  function likedIds() {
    const value = store.get('likes', []); return Array.isArray(value) ? value.filter(x => typeof x === 'string') : [];
  }
  function renderLikes() {
    const liked = likedIds();
    $$('[data-like]').forEach(button => {
      const active = liked.includes(button.dataset.like);
      button.setAttribute('aria-pressed', active);
      button.querySelector('i').className = active ? 'bi bi-heart-fill' : 'bi bi-heart';
      button.querySelector('span').textContent = active ? '1' : '0';
    });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-like]');
    if (!button) return;
    const liked = likedIds(); const id = button.dataset.like;
    if (store.set('likes', liked.includes(id) ? liked.filter(x => x !== id) : [...liked, id])) renderLikes();
  });
  function paginate(target, current, pages, onChange) {
    if (!target) return;
    if (pages <= 1) { target.innerHTML = ''; return; }
    const nearby = new Set([1, pages, current - 1, current, current + 1].filter(p => p >= 1 && p <= pages));
    const numbers = [...nearby].sort((a, b) => a - b);
    target.innerHTML = `<li class="page-item ${current === 1 ? 'disabled' : ''}"><button type="button" class="page-link" data-page="${current-1}" aria-label="이전 페이지" ${current === 1 ? 'disabled' : ''}>‹</button></li>` + numbers.map((n, i) => (i && n - numbers[i-1] > 1 ? '<li class="page-item disabled"><span class="page-link">…</span></li>' : '') + `<li class="page-item ${n === current ? 'active' : ''}"><button type="button" class="page-link" data-page="${n}" ${n === current ? 'aria-current="page"' : ''}>${n}</button></li>`).join('') + `<li class="page-item ${current === pages ? 'disabled' : ''}"><button type="button" class="page-link" data-page="${current+1}" aria-label="다음 페이지" ${current === pages ? 'disabled' : ''}>›</button></li>`;
    target.onclick = event => { const button = event.target.closest('button[data-page]'); if (button && !button.disabled) onChange(Number(button.dataset.page)); };
  }
  let threadPage = 1;
  function renderMainThreads() {
    const grid = $('#threadGrid'); if (!grid) return;
    $$('.user-entry', grid).forEach(el => el.remove());
    const content = userThreads().map(t => `<article class="col-12 col-sm-4 thread-entry user-entry"><div class="card thread-card user-card h-100"><div class="thread-image-link"><img class="card-img-top" src="assets/threads/img1.jpg" alt="내가 작성한 독서 이야기" loading="lazy"><span class="thread-tag">YOUR READING NOTE</span></div><div class="card-body d-flex flex-column"><h3 class="card-title">${esc(t.title)}</h3><p class="card-text">${esc(t.body)}</p><div class="thread-footer mt-auto"><div><span class="avatar" aria-hidden="true">${esc(t.author.slice(0,1))}</span><span>${esc(t.author)}</span></div><span class="thread-book">${esc(t.book)}</span></div><div class="thread-actions"><span>나의 쓰레드</span><button class="like-button" type="button" data-like="${esc(t.id)}" aria-label="${esc(t.title)} 공감" aria-pressed="false"><i class="bi bi-heart" aria-hidden="true"></i><span>0</span></button></div></div></div></article>`).join('');
    grid.insertAdjacentHTML('afterbegin', content);
    showMainThreadPage(threadPage); renderLikes();
  }
  function showMainThreadPage(page) {
    const entries = $$('.thread-entry'); const pages = Math.ceil(entries.length / 6);
    threadPage = Math.min(Math.max(page, 1), pages || 1);
    entries.forEach((el, i) => el.hidden = Math.floor(i/6) + 1 !== threadPage);
    paginate($('#threadPagination'), threadPage, pages, page => { showMainThreadPage(page); $('#threads').scrollIntoView({ block: 'start' }); });
  }
  let currentBook = null;
  let detailThreadPage = 1;
  const seedDetails = [
    { id: 'detail-0', title: '한 사람의 선택을 따라 읽는다는 것', body: '익숙한 시선에서 조금 벗어나 읽어보고 싶었어요. 여러분이 오래 머문 장면도 궁금합니다.', author: '느린페이지' },
    { id: 'detail-1', title: '같은 책을 읽고 다른 질문을 남겼어요', body: '첫 독서와 두 번째 독서 사이에 달라진 생각을 이야기해보고 싶어요.', author: '문장수집가' },
    { id: 'detail-2', title: '책을 덮은 뒤의 시간을 좋아합니다', body: '줄거리보다 오래 남는 감정에 대해 이야기를 나눠요.', author: '주말의독자' },
    { id: 'detail-3', title: '오늘 책모임에서 함께 나눌 질문', body: '이 책에서 가장 먼저 다시 읽고 싶은 부분은 어디인가요?', author: '작은책모임' },
  ];
  function renderDetailThreads() {
    if (!currentBook || !$('#detailThreads')) return;
    const own = userThreads().filter(t => t.book === currentBook.title || t.bookId === currentBook.id);
    const all = [...own, ...seedDetails.map(t => ({ ...t, id: `${t.id}-${currentBook.id}`, sample: true }))];
    const pages = Math.ceil(all.length / 3); detailThreadPage = Math.min(detailThreadPage, pages || 1);
    $('#detailThreads').innerHTML = all.slice((detailThreadPage-1)*3, detailThreadPage*3).map(t => `<article class="detail-thread"><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p><div class="detail-thread-footer"><span>${esc(t.author)}${t.sample ? ' · 예시' : ' · 나의 글'}</span><button class="like-button" type="button" data-like="${esc(t.id)}" aria-label="${esc(t.title)} 공감" aria-pressed="false"><i class="bi bi-heart" aria-hidden="true"></i><span>0</span></button></div></article>`).join('');
    paginate($('#detailThreadPagination'), detailThreadPage, pages, page => { detailThreadPage = page; renderDetailThreads(); }); renderLikes();
  }
  $('#writeModal').addEventListener('show.bs.modal', () => {
    if (currentBook) $('#threadBook').value = currentBook.title;
    $('#threadFormError').textContent = '';
  });
  $('#threadForm').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    Object.keys(fields).forEach(k => fields[k] = String(fields[k]).trim());
    if (Object.values(fields).some(value => !value)) { $('#threadFormError').textContent = '빈칸 없이 이야기를 채워주세요.'; return; }
    const newThread = { ...fields, bookId: currentBook?.id || '', id: 'user-' + (crypto.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2)), created: new Date().toISOString() };
    if (!store.set('threads', [newThread, ...userThreads()].slice(0, 100))) return;
    threadPage = 1; detailThreadPage = 1; renderMainThreads(); renderDetailThreads(); form.reset();
    bootstrap.Modal.getOrCreateInstance($('#writeModal')).hide(); toast('당신의 한 페이지를 남겼어요.');
  });
  function updateSaveButton() {
    const button = $('#saveBook'); if (!button || !currentBook) return;
    const saved = getShelf().some(b => b.id === currentBook.id);
    button.innerHTML = `<i class="bi ${saved ? 'bi-archive-fill' : 'bi-archive'}" aria-hidden="true"></i> ${saved ? '내 책장에 담았어요' : '내 책장에 담기'}`;
    button.setAttribute('aria-pressed', saved);
  }
  function initializeDetail() {
    if (!$('#book-detail')) return;
    const id = new URLSearchParams(location.search).get('book') || '2';
    currentBook = books.find(b => b.id === id) || getShelf().find(b => b.id === id);
    if (!currentBook) { try { const b = JSON.parse(sessionStorage.getItem('thread.book.' + id)); if (b && typeof b.id === 'string' && typeof b.title === 'string') currentBook = b; } catch { /* recover below */ } }
    if (!currentBook) {
      currentBook = books[1];
      toast('이 도서의 저장된 정보가 없어 채식주의자를 먼저 보여드려요. 검색에서 다시 선택해주세요.');
    }
    document.title = currentBook.title + ' · ThRead';
    $('#detailTitle').textContent = currentBook.title;
    $('#detailAuthor').textContent = currentBook.author || '저자 정보 없음';
    $('#detailDescription').textContent = currentBook.description || '국립중앙도서관에서 찾은 도서입니다. 소장 정보와 관련 이야기를 확인하고, 나의 책장에 담아보세요.';
    $('#detailCategory').textContent = 'BOOK SPOTLIGHT · ' + (currentBook.genre || currentBook.source || '도서');
    const meta = [currentBook.publisher, currentBook.year, currentBook.isbn].filter(Boolean);
    $('#detailMeta').innerHTML = meta.length ? meta.map(x => `<span>${esc(x)}</span>`).join('') : `<span>${esc(currentBook.source)}</span>`;
    const cover = knownCover(currentBook);
    if (cover) { $('#detailCover').src = cover; $('#detailCover').alt = currentBook.title + ' 표지'; }
    else { $('#detailCover').replaceWith(Object.assign(document.createElement('div'), { className: 'cover-fallback', textContent: currentBook.title })); }
    $('#threadBook').value = currentBook.title;
    $('#saveBook').addEventListener('click', () => {
      const shelf = getShelf(); const exists = shelf.some(b => b.id === currentBook.id);
      if (store.set('shelf', exists ? shelf.filter(b => b.id !== currentBook.id) : [currentBook, ...shelf].slice(0, 300))) { renderShelf(); toast(exists ? '책장에서 뺐어요.' : '다음에 읽을 책으로 담았어요.'); }
    });
    $('#lookupHoldings').addEventListener('click', async event => {
      const button = event.currentTarget; const target = $('#holdingResults'); button.disabled = true; target.textContent = '소장자료를 찾고 있어요…';
      try {
        const data = await requestBooks(currentBook.title.split(/\s*[:：]/)[0].slice(0,100), 1, 3);
        if (!data.configured) { target.textContent = '도서관 연결 전입니다. 검색 페이지에서 제공 도서를 살펴보세요.'; return; }
        target.innerHTML = data.books.length ? data.books.map(book => `<div class="holding-item">${safeLink(book.link) ? `<a href="${esc(safeLink(book.link))}" target="_blank" rel="noopener noreferrer">${esc(book.title)} ↗</a>` : esc(book.title)}<small>${esc([book.author,book.year,book.place].filter(Boolean).join(' · '))}</small></div>`).join('') + '<p class="small mt-2">검색어에 일치하는 소장 기록입니다. 판본과 이용 가능 여부는 원문 페이지에서 확인해주세요.</p>' : '일치하는 소장자료가 없어요. 다른 제목으로 검색해보세요.';
      } catch (error) { target.textContent = error.message; } finally { button.disabled = false; }
    });
    renderDetailThreads(); updateSaveButton();
    if (['#book-threads', '#threads-panel'].includes(location.hash)) {
      bootstrap.Tab.getOrCreateInstance($('#threads-tab')).show();
      setTimeout(() => $('#detailTabs').scrollIntoView({ block: 'start' }), 150);
    }
  }
  async function requestBooks(query, page = 1, size = 12, signal) {
    if (location.protocol === 'file:') throw new Error('실시간 검색은 실행하기.cmd 또는 python server.py로 서버를 켠 뒤 사용할 수 있어요.');
    const response = await fetch(apiUrl('/api/books?' + new URLSearchParams({ q: query, page, size })), { signal, headers: { Accept: 'application/json' } });
    let data;
    try { data = await response.json(); } catch { throw new Error('도서관 검색 서버에 연결할 수 없어요. python server.py로 실행해주세요.'); }
    if (!response.ok) throw new Error(data.message || '검색을 완료하지 못했어요. 잠시 후 다시 시도해주세요.');
    return data;
  }
  let searchSource = 'local', searchPage = 1, searchQuery = '', searchController = null;
  let apiConfigured = false;
  function setSource(source) {
    searchSource = source;
    $$('[data-search-source]').forEach(button => { const active = button.dataset.searchSource === source; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
  }
  function renderSearchBooks(results) {
    $('#searchResults').innerHTML = results.length ? results.map(book => `<article class="search-result"><a href="${esc(detailHref(book))}"><div class="search-cover">${coverMarkup(book)}</div><h2>${esc(book.title)}</h2></a><p>${esc(book.author)}</p><p>${esc([book.publisher,book.year].filter(Boolean).join(' · '))}</p><span class="search-source-label">${esc(book.source)}</span></article>`).join('') : '<div class="empty-state"><i class="bi bi-search" aria-hidden="true"></i><h2>아직 만나지 못한 책이에요.</h2><p>조금 짧은 제목이나 다른 검색어로 다시 찾아볼까요?</p></div>';
    // A missing publisher image should stay a readable card, not a broken image.
    $$('#searchResults img').forEach(img => img.addEventListener('error', () => {
      const placeholder = document.createElement('span'); placeholder.className = 'cover-fallback'; placeholder.textContent = img.alt.replace(' 표지', ''); img.replaceWith(placeholder);
    }, { once: true }));
  }
  async function performSearch(page = 1) {
    if (!$('#searchResults')) return;
    searchController?.abort(); const controller = new AbortController(); searchController = controller;
    searchPage = page; searchQuery = $('#searchInput').value.trim();
    const target = $('#searchResults'); target.setAttribute('aria-busy', 'true'); $('#searchPagination').innerHTML = '';
    const url = new URL(location.href); url.searchParams.set('source', searchSource); url.searchParams.set('page', page);
    if (searchQuery) url.searchParams.set('q', searchQuery); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    try {
      if (searchSource === 'local') {
        const query = searchQuery.toLocaleLowerCase();
        const results = books.filter(b => [b.title,b.author,b.genre,b.description,b.isbn].filter(Boolean).join(' ').toLocaleLowerCase().includes(query));
        renderSearchBooks(results);
        $('#searchSummary').textContent = searchQuery ? `‘${searchQuery}’ · 제공 도서 ${results.length}권` : `취향을 기다리는 제공 도서 ${results.length}권`;
      } else if (!searchQuery) {
        target.innerHTML = '<div class="empty-state"><i class="bi bi-book" aria-hidden="true"></i><h2>더 넓은 책의 세계로.</h2><p>제목이나 저자를 검색하면 국립중앙도서관의 소장자료를 찾아드려요.</p></div>';
        $('#searchSummary').textContent = '국립중앙도서관 소장자료 검색';
      } else {
        target.innerHTML = Array.from({ length: 4 }, () => '<div class="loading-result" aria-hidden="true"></div>').join('');
        $('#searchSummary').textContent = '도서관 책장을 살펴보고 있어요…';
        const data = await requestBooks(searchQuery, page, 12, controller.signal);
        if (controller.signal.aborted) return;
        if (!data.configured) throw new Error('국립중앙도서관 연결 전입니다. 제공 도서 탭에서 먼저 둘러보세요.');
        renderSearchBooks(data.books);
        $('#searchSummary').textContent = `‘${searchQuery}’ · 국립중앙도서관 ${Number(data.total).toLocaleString()}건 · ${page}페이지`;
        const pages = Math.min(40, Math.ceil(data.total / 12));
        paginate($('#searchPagination'), page, pages, p => { performSearch(p); $('.search-toolbar').scrollIntoView({block:'start'}); });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      $('#searchSummary').textContent = '검색을 잠시 마치지 못했어요.';
      target.innerHTML = `<div class="search-error"><strong>다시 연결해볼까요?</strong><br>${esc(error.message)}<div><button class="btn btn-soft" type="button" id="retrySearch">다시 시도</button><button class="btn btn-soft ms-2" type="button" id="localSearchFallback">제공 도서에서 찾기</button></div></div>`;
      $('#retrySearch').onclick = () => performSearch(page);
      $('#localSearchFallback').onclick = () => { setSource('local'); performSearch(1); };
    } finally { if (!controller.signal.aborted) target.setAttribute('aria-busy', 'false'); }
  }
  async function initializeSearch() {
    if (!$('#searchForm')) return;
    const params = new URLSearchParams(location.search);
    $('#searchInput').value = params.get('q') || '';
    setSource(params.get('source') === 'nl' || params.has('q') && params.get('source') !== 'local' ? 'nl' : 'local');
    const page = Math.min(40, Math.max(1, Number.parseInt(params.get('page'), 10) || 1));
    $('#searchForm').addEventListener('submit', event => { event.preventDefault(); performSearch(1); });
    $$('[data-search-source]').forEach(button => button.addEventListener('click', () => { setSource(button.dataset.searchSource); performSearch(1); }));
    $$('[data-query]').forEach(button => button.addEventListener('click', () => { $('#searchInput').value = button.dataset.query; setSource(apiConfigured ? 'nl' : 'local'); performSearch(1); }));
    try {
      const response = await fetch(apiUrl('/api/status')); if (!response.ok) throw new Error();
      const status = await response.json(); apiConfigured = status.configured;
      $('#apiStatus').textContent = status.configured ? '국립중앙도서관 연결됨' : '제공 도서로 둘러보기';
      $('#apiStatus').classList.toggle('connected', status.configured);
    } catch { $('#apiStatus').textContent = '제공 도서로 둘러보기'; }
    await performSearch(page);
  }
  initializeDetail(); renderShelf(); renderMainThreads(); renderLikes(); initializeSearch();
  window.addEventListener('storage', event => { if (event.key?.startsWith('thread.')) { renderShelf(); renderMainThreads(); renderDetailThreads(); } });
})();
