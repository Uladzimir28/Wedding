(() => {
  /* Рассадка: правьте имена здесь.
     wing: left | right — два ряда от президиума
     у гостевых столов заняты 3 грани (openSide — свободная сторона к центру) */
  const SEATING = [
    {
      id: "head",
      label: "Президиум",
      head: true,
      guests: ["Владимир", "Валерия"],
    },
    {
      id: "1",
      label: "Стол 1",
      wing: "left",
      openSide: "top",
      guests: ["Игорь Петров", "Мария Козлова", "Сергей Козлов", "Елена Смирнова", "Павел Смирнов", "Ольга Белова"],
    },
    {
      id: "2",
      label: "Стол 2",
      wing: "left",
      openSide: "top",
      guests: ["Ольга Иванова", "Дмитрий Иванов", "Наталья Кузнецова", "Андрей Кузнецов", "Татьяна Орлова", "Виктор Орлов"],
    },
    {
      id: "3",
      label: "Стол 3",
      wing: "left",
      openSide: "top",
      guests: ["Екатерина Волкова", "Алексей Волков", "Юлия Морозова", "Николай Морозов", "Ирина Соколова", "Роман Соколов"],
    },
    {
      id: "4",
      label: "Стол 4",
      wing: "right",
      openSide: "left",
      guests: ["Светлана Лебедева", "Максим Лебедев", "Дарья Новикова", "Артём Новиков", "Полина Фёдорова", "Кирилл Фёдоров"],
    },
    {
      id: "5",
      label: "Стол 5",
      wing: "right",
      openSide: "left",
      guests: ["Алина Михайлова", "Егор Михайлов", "Валерия Крылова", "Денис Крылов", "Ксения Белова", "Илья Белов"],
    },
    {
      id: "6",
      label: "Стол 6",
      wing: "right",
      openSide: "left",
      guests: ["Вера Громова", "Станислав Громов", "Людмила Зайцева", "Георгий Зайцев", "Галина Медведева", "Борис Медведев"],
    },
  ];

  const plan = document.getElementById("seatPlan");
  const search = document.getElementById("seatSearch");
  const clearBtn = document.getElementById("seatClear");
  const reveal = document.getElementById("seatReveal");

  const normalize = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ")
      .trim();

  const heartIcon = `
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true">
      <path d="M14 21S3.5 14.2 3.5 8.8C3.5 6 5.6 4 8.2 4c2 0 3.7 1.2 5.8 3.4C16.1 5.2 17.8 4 19.8 4c2.6 0 4.7 2 4.7 4.8C24.5 14.2 14 21 14 21Z" stroke="#6F754F" stroke-width="1.35" stroke-linejoin="round"/>
    </svg>
  `;

  /* Три занятые грани ромба (точки по середине сторон, не по углам);
     openSide — свободная грань (top|right|bottom|left относительно квадрата до rotate) */
  const diamondChairs = (openSide = "right") => {
    const sides = ["top", "right", "bottom", "left"].filter((s) => s !== openSide);

    return sides
      .map(
        (side) => `
        <span class="seat-diamond__edge seat-diamond__edge--${side}" aria-hidden="true">
          <i></i><i></i>
        </span>`
      )
      .join("");
  };

  const guestList = (table, q) =>
    table.guests
      .map((g) => {
        const hit = q && normalize(g).includes(q);
        return `<li${hit ? ' class="is-hit"' : ""}>${g}</li>`;
      })
      .join("");

  const tableHtml = (table, q) => {
    const hits = q ? table.guests.filter((g) => normalize(g).includes(q)) : [];
    const state = q ? (hits.length ? " is-match" : " is-dim") : "";

    if (table.head) {
      return {
        hits,
        html: `
          <article class="seat-table is-head${state}" data-table="${table.id}">
            <div class="seat-table__visual">
              <div class="seat-head-plate">
                <span class="seat-head-plate__inner">${heartIcon}</span>
              </div>
              <p class="seat-table__label">${table.label}</p>
            </div>
            <ul class="seat-table__guests">${guestList(table, q)}</ul>
          </article>
        `,
      };
    }

    return {
      hits,
      html: `
        <article class="seat-table is-diamond${state}" data-table="${table.id}" data-wing="${table.wing}">
          <div class="seat-table__visual">
            <div class="seat-diamond">
              <div class="seat-diamond__face">
                ${diamondChairs(table.openSide)}
                <span class="seat-diamond__num">${table.id}</span>
              </div>
            </div>
            <p class="seat-table__label">${table.label}</p>
            <p class="seat-table__hint">3 грани · 6 мест</p>
          </div>
          <ul class="seat-table__guests">${guestList(table, q)}</ul>
        </article>
      `,
    };
  };

  const renderReveal = (q, matches) => {
    if (!reveal) return;

    if (!q) {
      reveal.hidden = true;
      reveal.innerHTML = "";
      if (clearBtn) clearBtn.hidden = true;
      return;
    }

    if (clearBtn) clearBtn.hidden = false;
    reveal.hidden = false;

    if (!matches.length) {
      reveal.className = "seat-reveal seat-reveal--empty";
      reveal.innerHTML = `
        <p class="seat-reveal__eyebrow">Поиск</p>
        <p class="seat-reveal__name">Имя пока не найдено</p>
        <p class="seat-reveal__table">Проверьте написание или посмотрите схему зала ниже</p>
      `;
      return;
    }

    reveal.className = "seat-reveal";
    const first = matches[0];
    const who = first.hits.length === 1 ? first.hits[0] : first.hits.join(", ");
    const extra =
      matches.length > 1
        ? `<p class="seat-reveal__table">Также: ${matches
            .slice(1)
            .map((m) => `${m.hits.join(", ")} — ${m.table.label}`)
            .join("; ")}</p>`
        : "";

    reveal.innerHTML = `
      <p class="seat-reveal__eyebrow">Ваше место</p>
      <p class="seat-reveal__name">${who}</p>
      <p class="seat-reveal__table">Ждём вас за столом: <strong>${first.table.label}</strong></p>
      ${extra}
    `;
  };

  const render = (query = "") => {
    const q = normalize(query);
    const matches = [];
    let headHtml = "";
    let leftHtml = "";
    let rightHtml = "";

    SEATING.forEach((table) => {
      const { hits, html } = tableHtml(table, q);
      if (hits.length) matches.push({ table, hits });
      if (table.head) headHtml += html;
      else if (table.wing === "left") leftHtml += html;
      else rightHtml += html;
    });

    if (plan) {
      plan.innerHTML = `
        <div class="seat-plan__head">${headHtml}</div>
        <div class="seat-plan__aisle" aria-hidden="true">
          <span class="seat-plan__aisle-line"></span>
          <span class="seat-plan__aisle-label">проход</span>
          <span class="seat-plan__aisle-line"></span>
        </div>
        <div class="seat-plan__wings">
          <div class="seat-plan__wing seat-plan__wing--left" aria-label="Левый ряд">
            <p class="seat-plan__wing-label">Левый ряд</p>
            ${leftHtml}
          </div>
          <div class="seat-plan__wing seat-plan__wing--right" aria-label="Правый ряд">
            <p class="seat-plan__wing-label">Правый ряд</p>
            ${rightHtml}
          </div>
        </div>
      `;
    }

    renderReveal(q, matches);

    if (q && matches.length) {
      const el = document.querySelector(".seat-table.is-match");
      if (el && search === document.activeElement) {
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.85 || rect.bottom < 120) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  };

  render();

  search?.addEventListener("input", () => render(search.value));

  clearBtn?.addEventListener("click", () => {
    if (search) search.value = "";
    render();
    search?.focus();
  });
})();
