/* Центр Киберспорта — лендинг: интерактив */
(function () {
  'use strict';

  /* ---------- Бургер-меню ---------- */
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

  /* ---------- Появление секций при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
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
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }, 1000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Переключатель «Будни / Выходные» ---------- */
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

  /* ---------- Карусели (тарифы и отзывы) ---------- */
  var CARD_STEP = 390; // ширина карточки + отступ

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

    /* Блюр показывается только там, где карточка реально обрезана */
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
  initRail(document.getElementById('review-rail'));

/* ---------- Форма бронирования ---------- */
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

        setError(name, errName);
        setError(phone, errPhone);
        setError(date, errDate);
        setError(time, errTime);

        if (errName || errPhone || errDate || errTime) return;

        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Собираем данные
        var formData = new FormData();
        formData.append('name', name.value.trim());
        formData.append('phone', phone.value.trim());
        formData.append('date', date.value);
        formData.append('time', time.value);
        formData.append('zone', zone.options[zone.selectedIndex].text);

        // Отправляем на сервер
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
