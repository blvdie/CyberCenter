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
    /* \u0421\u0442\u0440\u0430\u0445\u043e\u0432\u043a\u0430: \u0435\u0441\u043b\u0438 observer \u043d\u0435 \u0441\u0440\u0430\u0431\u043e\u0442\u0430\u043b (\u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0435 iframe \u0438 \u0442.\u043f.) \u2014 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c \u0432\u0441\u0451 \u0447\u0435\u0440\u0435\u0437 \u0441\u0435\u043a\u0443\u043d\u0434\u0443 */
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

  /* Карусели (тарифы и отзывы) */
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
            alert('Ошибка соединения. Проверьте, что файл send.php существует и OpenServer запущен.');
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
    var pg = document.querySelector('.promo-grid.stagger');
    if (pg) pg.classList.add('stagger--tilt');
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
  var ticker = document.getElementById('review-ticker');
  if (!ticker) return;

  var cards = Array.from(ticker.children);
  cards.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    ticker.appendChild(clone);
  });

  window.addEventListener('pageshow', function () {
    ticker.style.animation = 'none';
    ticker.offsetHeight;
    ticker.style.animation = '';
    if (document.activeElement) document.activeElement.blur();
  });
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
  initModal('privacy-modal', ['privacy-modal-open', 'cookie-privacy-open'], 'privacy-modal-close', 'privacy-modal-close-bg');

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
