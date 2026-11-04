/* storage.js — работа с localStorage (база, списки, состояние).
 * Фаза 2: база товаров.
 * Фаза 4 добавит: списки приёмки/инвентарки, текущий режим. */
(function () {
  "use strict";

  var KEY_BASE = "tea.base";

  window.TeaApp.storage = {

    /* Сохранить базу. base = { version, savedAt, items:[...] }.
     * true — успех; false — переполнение localStorage. */
    saveBase: function (base) {
      try {
        localStorage.setItem(KEY_BASE, JSON.stringify(base));
        return true;
      } catch (e) {
        return false; // QuotaExceededError
      }
    },

    /* Состояние базы: что есть в localStorage прямо сейчас.
     * Возвращает { exists, corrupt, base }:
     *   exists  — ключ присутствует
     *   corrupt — ключ есть, но JSON битый/неполный (при этом он уже стёрт)
     *   base    — распарсенный объект {version,savedAt,items} или null */
    getBaseState: function () {
      var raw = localStorage.getItem(KEY_BASE);
      if (!raw) return { exists: false, corrupt: false, base: null };
      try {
        var base = JSON.parse(raw);
        if (!base || typeof base !== "object") throw new Error("not object");
        if (!Array.isArray(base.items)) throw new Error("no items");
        if (typeof base.version !== "number") throw new Error("no version");
        return { exists: true, corrupt: false, base: base };
      } catch (e) {
        localStorage.removeItem(KEY_BASE); // стёрли битый, чтобы не зациклиться
        return { exists: false, corrupt: true, base: null };
      }
    },

    /* Стереть базу. */
    clearBase: function () {
      localStorage.removeItem(KEY_BASE);
    },

    /* Настройки (тумблер «Архивные» и т.п.). JSON в «tea.set.<key>». */
    getSetting: function (key, def) {
      var raw = localStorage.getItem("tea.set." + key);
      if (raw === null) return def;
      try { return JSON.parse(raw); } catch (e) { return def; }
    },
    setSetting: function (key, value) {
      try { localStorage.setItem("tea.set." + key, JSON.stringify(value)); } catch (e) {}
    },

    /* Список выбранных товаров режима. mode = "reception" | "inventory".
     * list — массив строк { uuid, name, code, unit, qty, isNew }.
     * true — успех; false — переполнение. */
    saveList: function (mode, list) {
      try {
        localStorage.setItem("tea.list." + mode, JSON.stringify(list || []));
        return true;
      } catch (e) {
        return false;
      }
    },

    /* Восстановить список режима. Битый JSON трактуем как пустой. */
    loadList: function (mode) {
      var raw = localStorage.getItem("tea.list." + mode);
      if (!raw) return [];
      try {
        var list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },

    clearList: function (mode) {
      localStorage.removeItem("tea.list." + mode);
    }
  };
})();
