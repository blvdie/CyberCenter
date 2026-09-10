(function () {
'use strict';
/* Бургер-меню */
var burger = document.getElementById('burger');
var mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
function closeMenu() {
mobileMenu.hidden = true;
burger.setAttribute('aria-expanded', 'false');
burger.setAttribute('aria-label', 'Открыть меню');
}
burger.addEventListener('click', function () {
var open = mobileMenu.hidden;
mobileMenu.hidden = !open;
burger.setAttribute('aria-expanded', String(open));
burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
mobileMenu.addEventListener('click', function (event) {
if (event.target.closest('a')) closeMenu();
});
window.addEventListener('resize', function () {
if (window.innerWidth > 760) closeMenu();
});
}
/* Появление секций при скролле */
var revealEls = document.querySelectorAll('.reveal, .stagger');
if ('IntersectionObserver' in window) {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
io.unobserve(entry.target);
}
});
}, { threshold: 0.12 });
revealEls.forEach(function (el) { io.observe(el); });
setTimeout(function () {
revealEls.forEach(function (el) {
if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
});
}, 1200);
} else {
revealEls.forEach(function (el) { el.classList.add('is-visible'); });
}
/* Переключатель «Будни / Выходные» */
var toggleButtons = document.querySelectorAll('.day-toggle__btn');
var priceValues = document.querySelectorAll('[data-weekday]');
function setDay(day) {
priceValues.forEach(function (el) {
el.textContent = el.getAttribute('data-' + day);
});
toggleButtons.forEach(function (btn) {
var active = btn.getAttribute('data-day') === day;
btn.classList.toggle('is-active', active);
btn.setAttribute('aria-pressed', String(active));
});
}
toggleButtons.forEach(function (btn) {
btn.addEventListener('click', function () {
setDay(btn.getAttribute('data-day'));
});
});
/* Карусели (тарифы) */
var CARD_STEP = 390;
function initRail(rail) {
if (!rail) return;
var wrap = rail.closest('.rail-wrap');
var fadeRight = wrap.querySelector('.rail-fade--right');
var fadeLeft = wrap.querySelector('.rail-fade--left');
wrap.querySelector('[data-rail-prev]').addEventListener('click', function () {
rail.scrollBy({ left: -CARD_STEP, behavior: 'smooth' });
});
wrap.querySelector('[data-rail-next]').addEventListener('click', function () {
rail.scrollBy({ left: CARD_STEP, behavior: 'smooth' });
});
function updateFades() {
var hasLeft = rail.scrollLeft > 4;
var hasRight = rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4;
fadeLeft.hidden = !hasLeft;
fadeRight.hidden = !hasRight;
}
rail.addEventListener('scroll', updateFades, { passive: true });
window.addEventListener('resize', updateFades);
updateFades();
}
initRail(document.getElementById('price-rail'));
/* Карусель отзывов с ручным управлением и бесконечной прокруткой */
(function () {
var ticker = document.getElementById('review-ticker');
if (!ticker) return;

var wrap = ticker.parentElement;
var originalCards = Array.from(ticker.children);
var originalCount = originalCards.length;
var cardWidth = 0;
var gap = 20;
var isDragging = false;
var startX = 0;
var startTime = 0;
var currentTranslate = 0;
var prevTranslate = 0;
var animationID = 0;
var currentIndex = 0;
var isManualMode = false;

// Клонируем карточки для бесконечности
var cloneCount = Math.max(3, originalCount);
for (var i = 0; i < cloneCount; i++) {
originalCards.forEach(function(card) {
var clone = card.cloneNode(true);
clone.setAttribute('aria-hidden', 'true');
ticker.appendChild(clone);
});
}
for (var i = 0; i < cloneCount; i++) {
originalCards.slice().reverse().forEach(function(card) {
var clone = card.cloneNode(true);
clone.setAttribute('aria-hidden', 'true');
ticker.insertBefore(clone, ticker.firstChild);
});
}

function calculateCardWidth() {
var allCards = ticker.querySelectorAll('.review-card');
if (allCards.length > 0) {
cardWidth = allCards[0].offsetWidth + gap;
}
}

calculateCardWidth();

// Начальная позиция
currentIndex = cloneCount;
updatePosition(false);

function updatePosition(animate) {
var translateX = -(currentIndex * cardWidth);

if (!animate) {
ticker.style.transition = 'none';
} else {
ticker.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
}

ticker.style.transform = 'translateX(' + translateX + 'px)';
prevTranslate = translateX;
currentTranslate = translateX;

updateActiveCard();

if (!animate) {
requestAnimationFrame(function() {
ticker.style.transition = '';
});
}
}

function updateActiveCard() {
var allCards = ticker.querySelectorAll('.review-card');
allCards.forEach(function(card, index) {
card.classList.toggle('is-active', index === currentIndex);
});
}

function checkBounds() {
var totalCards = ticker.querySelectorAll('.review-card').length;
var needsReset = false;
var newIndex = currentIndex;

if (currentIndex >= totalCards - cloneCount) {
newIndex = cloneCount + (currentIndex - (totalCards - cloneCount));
needsReset = true;
} else if (currentIndex < cloneCount) {
newIndex = totalCards - cloneCount - 1 - (cloneCount - currentIndex);
needsReset = true;
}

if (needsReset) {
currentIndex = newIndex;
updatePosition(false);
}
}

function pointerDown(e) {
isDragging = true;
startX = getPositionX(e);
startTime = Date.now();
wrap.classList.add('is-dragging');
ticker.classList.add('is-dragging');

// Останавливаем CSS анимацию и переключаемся на ручной режим
if (!isManualMode) {
var computedStyle = window.getComputedStyle(ticker);
var matrix = new DOMMatrix(computedStyle.transform);
currentTranslate = matrix.m41;
prevTranslate = currentTranslate;
ticker.style.animation = 'none';
ticker.style.transform = 'translateX(' + currentTranslate + 'px)';
isManualMode = true;

// Вычисляем текущий индекс на основе позиции
currentIndex = Math.round(-currentTranslate / cardWidth);
updateActiveCard();
}

animationID = requestAnimationFrame(animation);
if (e.type === 'mousedown') e.preventDefault();
}

function pointerMove(e) {
if (!isDragging) return;
var currentPosition = getPositionX(e);
var diff = currentPosition - startX;
currentTranslate = prevTranslate + diff;
if (e.type === 'mousemove') e.preventDefault();
}

function pointerUp(e) {
if (!isDragging) return;
isDragging = false;
cancelAnimationFrame(animationID);

var movedBy = currentTranslate - prevTranslate;
var timeDiff = Date.now() - startTime;
var velocity = Math.abs(movedBy) / timeDiff;
var threshold = cardWidth / 4;

// Определяем направление и количество карточек для прокрутки
var steps = 0;
if (Math.abs(movedBy) > threshold || velocity > 0.5) {
steps = movedBy < 0 ? 1 : -1;
if (velocity > 1.5) {
steps = movedBy < 0 ? 2 : -2;
}
}

currentIndex += steps;
updatePosition(true);
wrap.classList.remove('is-dragging');
ticker.classList.remove('is-dragging');

setTimeout(checkBounds, 550);
}

function getPositionX(e) {
return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

function animation() {
if (isDragging) {
ticker.style.transform = 'translateX(' + currentTranslate + 'px)';
requestAnimationFrame(animation);
}
}

// События мыши
wrap.addEventListener('mousedown', pointerDown);
wrap.addEventListener('mousemove', pointerMove);
wrap.addEventListener('mouseup', pointerUp);
wrap.addEventListener('mouseleave', function() {
if (isDragging) pointerUp();
});

// События touch
wrap.addEventListener('touchstart', pointerDown, { passive: true });
wrap.addEventListener('touchmove', pointerMove, { passive: false });
wrap.addEventListener('touchend', pointerUp);

// Предотвращаем клик при drag
wrap.addEventListener('click', function(e) {
if (Math.abs(currentTranslate - prevTranslate) > 5) {
e.preventDefault();
}
}, true);

// Обновление при resize
window.addEventListener('resize', function() {
calculateCardWidth();
if (isManualMode) {
updatePosition(false);
}
});

// Восстановление CSS анимации при возврате вкладки
window.addEventListener('pageshow', function() {
if (!isManualMode) {
ticker.style.animation = 'none';
ticker.offsetHeight;
ticker.style.animation = '';
}
});
})();
/* Яндекс-карта с кастомным маркером */
var YMAP_COORDS = [59.922882, 30.371222];
function initYMap() {
var el = document.getElementById('ymap');
if (!el || typeof ymaps === 'undefined') return;
ymaps.ready(function () {
var map = new ymaps.Map(el, {
center: YMAP_COORDS,
zoom: 17,
controls: ['zoomControl', 'geolocationControl']
}, { suppressMapOpenBlock: true });
var iconLayout = ymaps.templateLayoutFactory.createClass(
'<div class="ymap-pin">' +
'<span class="ymap-pin__label">Центр Киберспорта</span>' +
'<span class="ymap-pin__dot"></span>' +
'</div>'
);
var placemark = new ymaps.Placemark(YMAP_COORDS, {
balloonContentHeader: 'Центр Киберспорта',
balloonContentBody:
'<span class="ymap-balloon__rating">★ 5.0 · компьютерный клуб</span>' +
'<p>Кременчугская ул., 11, корп. 1, Санкт-Петербург</p>' +
'<p class="ymap-balloon__hours">Открыто круглосуточно</p>',
balloonContentFooter:
'<div class="ymap-balloon__actions">' +
'<a class="pop-route" href="https://yandex.ru/maps/org/tsk_tsentr_kibersporta/60513031692/" target="_blank" rel="noopener">Маршрут</a>' +
'<a class="pop-tg" href="https://t.me/cybcentrkremen" target="_blank" rel="noopener">Telegram</a>' +
'</div>',
hintContent: 'Центр Киберспорта'
}, {
iconLayout: iconLayout,
iconShape: { type: 'Rectangle', coordinates: [[-110, 4], [70, 56]] },
balloonOffset: [-25, 40]
});
map.geoObjects.add(placemark);
map.behaviors.disable('scrollZoom');
});
}
if (document.readyState !== 'loading') initYMap();
else document.addEventListener('DOMContentLoaded', initYMap);
var parallaxEls = document.querySelectorAll('.section__hex');
if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
var ticking = false;
function applyParallax() {
var vh = window.innerHeight;
parallaxEls.forEach(function (el, i) {
var r = el.getBoundingClientRect();
var center = r.top + r.height / 2;
var progress = (center - vh / 2) / vh;
var depth = (i % 3 === 0) ? 46 : (i % 3 === 1 ? -30 : 22);
el.style.transform = 'translate3d(0,' + (progress * depth).toFixed(1) + 'px,0)';
});
ticking = false;
}
window.addEventListener('scroll', function () {
if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
}, { passive: true });
window.addEventListener('resize', applyParallax);
applyParallax();
}
/* Форма бронирования */
var form = document.getElementById('booking-form');
if (form) {
var success = document.getElementById('booking-success');
var successText = document.getElementById('booking-success-text');
var submitBtn = form.querySelector('button[type="submit"]');
var originalBtnText = submitBtn.textContent;
var bfDate = document.getElementById('bf-date');
if (bfDate) {
var td = new Date();
bfDate.min = td.getFullYear() + '-' +
('0' + (td.getMonth() + 1)).slice(-2) + '-' +
('0' + td.getDate()).slice(-2);
}
function fieldOf(input) { return input.closest('.field'); }
function setError(input, hasError) {
var field = fieldOf(input);
field.classList.toggle('is-invalid', hasError);
var err = field.querySelector('.field__error');
if (err) err.hidden = !hasError;
}
form.addEventListener('submit', function (event) {
event.preventDefault();
var name = form.elements.name;
var phone = form.elements.phone;
var date = form.elements.date;
var time = form.elements.time;
var zone = form.elements.zone;
var errName = name.value.trim().length < 2;
var errPhone = (phone.value.match(/\d/g) || []).length < 10;
var errDate = !date.value;
var errTime = !time.value;
var consent = form.elements.consent;
var errConsent = !consent.checked;
setError(name, errName);
setError(phone, errPhone);
setError(date, errDate);
setError(time, errTime);
setError(consent.closest('.field'), errConsent);
if (errName || errPhone || errDate || errTime || errConsent) return;
var card = form.closest('.booking-form-card');
if (card) card.style.minHeight = card.offsetHeight + 'px';
submitBtn.disabled = true;
submitBtn.textContent = 'Отправка...';
var formData = new FormData();
formData.append('name', name.value.trim());
formData.append('phone', phone.value.trim());
formData.append('date', date.value);
formData.append('time', time.value);
formData.append('zone', zone.options[zone.selectedIndex].text);
if (form.elements.website) formData.append('website', form.elements.website.value);
fetch('send.php', {
method: 'POST',
body: formData
})
.then(function(response) {
if (!response.ok) {
throw new Error('Network response was not ok');
}
return response.json();
})
.then(function(data) {
if (data.status === 'success') {
var d = date.value.split('-').reverse().join('.');
successText.textContent = name.value.trim() + ', ваша заявка принята! Ждём вас ' + d + ' в ' + time.value + ' в зоне ' + zone.options[zone.selectedIndex].text + '. Администратор позвонит вам для подтверждения.';
form.hidden = true;
success.hidden = false;
} else {
alert('Не удалось отправить заявку. Попробуйте позже или напишите нам в Telegram.');
submitBtn.disabled = false;
submitBtn.textContent = originalBtnText;
}
})
.catch(function(error) {
console.error('Ошибка:', error);
alert('Не удалось отправить заявку. Позвоните нам или напишите в Telegram.');
submitBtn.disabled = false;
submitBtn.textContent = originalBtnText;
});
});
document.getElementById('booking-reset').addEventListener('click', function () {
form.reset();
form.hidden = false;
success.hidden = true;
submitBtn.disabled = false;
submitBtn.textContent = originalBtnText;
});
}
})();
(function () {
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var bar = document.createElement('div');
bar.className = 'scroll-progress';
document.body.appendChild(bar);
if (!reduced) {
document.querySelectorAll('.section .container.reveal').forEach(function (el, i) {
el.classList.add(i % 2 === 0 ? 'reveal--left' : 'reveal--right');
});
var zg = document.querySelector('.zone-grid.stagger');
if (zg) zg.classList.add('stagger--pop');
var gal = document.querySelector('.gallery-grid.stagger');
if (gal) gal.classList.add('stagger--pop');
}
var extras = [];
['.map-block', '.site-footer'].forEach(function (sel) {
var el = document.querySelector(sel);
if (el && !el.classList.contains('reveal')) {
el.classList.add('reveal');
extras.push(el);
}
});
if ('IntersectionObserver' in window && extras.length) {
var io2 = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
io2.unobserve(entry.target);
}
});
}, { threshold: 0.08 });
extras.forEach(function (el) { io2.observe(el); });
} else {
extras.forEach(function (el) { el.classList.add('is-visible'); });
}
var nums = document.querySelectorAll('.stats__item strong');
if (!reduced && 'IntersectionObserver' in window && nums.length) {
var cio = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (!entry.isIntersecting) return;
cio.unobserve(entry.target);
var el = entry.target;
var template = el.textContent;
var m = template.match(/\d+/);
if (!m || parseInt(m[0], 10) < 10) return;
var target = parseInt(m[0], 10);
var startTs = null;
function tick(ts) {
if (startTs === null) startTs = ts;
var p = Math.min((ts - startTs) / 1800, 1);
var eased = 1 - Math.pow(1 - p, 3);
el.textContent = template.replace(m[0], String(Math.round(target * eased)));
if (p < 1) window.requestAnimationFrame(tick);
else el.textContent = template;
}
window.requestAnimationFrame(tick);
});
}, { threshold: 0.7 });
nums.forEach(function (el) { cio.observe(el); });
}
var header = document.querySelector('.site-header');
var wms = reduced ? [] : document.querySelectorAll('.section__watermark');
var ticking = false;
function onScroll() {
var doc = document.documentElement;
var max = doc.scrollHeight - doc.clientHeight;
var y = window.scrollY || doc.scrollTop;
bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
if (header) header.classList.toggle('is-scrolled', y > 24);
var vh = window.innerHeight;
wms.forEach(function (el, i) {
var r = el.getBoundingClientRect();
if (r.bottom < -100 || r.top > vh + 100) return;
var progress = (r.top + r.height / 2 - vh / 2) / vh;
var dir = (i % 2 === 0) ? 1 : -1;
el.style.transform = 'translateX(calc(-50% + ' + (progress * 70 * dir).toFixed(1) + 'px)) skewX(-8deg)';
});
ticking = false;
}
window.addEventListener('scroll', function () {
if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
})();
(function () {
function initModal(modalId, openIds, closeId, closeBgId) {
var modal = document.getElementById(modalId);
if (!modal) return;
var closeBtn = document.getElementById(closeId);
var closeBg = document.getElementById(closeBgId);
function open() { modal.hidden = false; document.body.style.overflow = 'hidden'; }
function close() { modal.hidden = true; document.body.style.overflow = ''; }
openIds.forEach(function (id) {
var btn = document.getElementById(id);
if (btn) btn.addEventListener('click', open);
});
if (closeBtn) closeBtn.addEventListener('click', close);
if (closeBg) closeBg.addEventListener('click', close);
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && !modal.hidden) close();
});
}
initModal('pd-modal', ['pd-modal-open', 'pd-modal-open-footer'], 'pd-modal-close', 'pd-modal-close-bg');
initModal('privacy-modal', ['privacy-modal-open', 'privacy-modal-open-form', 'cookie-privacy-open'], 'privacy-modal-close', 'privacy-modal-close-bg');
initModal('rules-modal', ['rules-modal-open'], 'rules-modal-close', 'rules-modal-close-bg');
var banner = document.getElementById('cookie-banner');
var acceptBtn = document.getElementById('cookie-accept');
if (banner && !localStorage.getItem('cookie-ok')) {
setTimeout(function () { banner.hidden = false; }, 1500);
}
if (acceptBtn) {
acceptBtn.addEventListener('click', function () {
banner.hidden = true;
localStorage.setItem('cookie-ok', '1');
});
}
})();
