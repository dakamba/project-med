```jsx
import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp, ImagePlus, X, Save,
  Package, Loader2, Boxes, Receipt, TrendingUp, Calendar, Download, Upload, AlertTriangle,
} from "lucide-react";

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');";

const C = {
  bg: "#EEF0EA",
  card: "#FFFFFF",
  ink: "#1E2620",
  sub: "#5B6259",
  border: "#D9D6C8",
  borderSoft: "#E5E2D4",
  accent: "#CE9A2E",
  accentDark: "#8F6A1E",
  accentBg: "#F7ECD3",
  teal: "#3C6B57",
  tealBg: "#E3ECE6",
  alert: "#B23B26",
  alertBg: "#F7E4DE",
};

const FONT_DISPLAY = { fontFamily: "'Archivo', sans-serif" };
const FONT_BODY = { fontFamily: "'Inter', sans-serif" };
const FONT_MONO = { fontFamily: "'IBM Plex Mono', monospace" };

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function money(n) {
  const v = Number(n);
  if (!isFinite(v)) return "0 ₸";
  return Math.round(v).toLocaleString("ru-RU") + " ₸";
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(str) {
  const [y, m, d] = str.split("-");
  return `${d}.${m}.${y}`;
}

async function storageGet(key) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
    return true;
  } catch (e) {
    console.error("storage set failed", key, e);
    return false;
  }
}
async function storageDelete(key) {
  try {
    await window.storage.delete(key, false);
  } catch (e) {}
}
async function storageListKeys(prefix) {
  try {
    const res = await window.storage.list(prefix, false);
    return res ? res.keys : [];
  } catch (e) {
    return [];
  }
}

function emptyProduct() {
  return {
    id: null,
    name: "",
    description: "",
    photo: null,
    createdAt: Date.now(),
    category: "",           // новое поле
    sizes: [{ id: uid(), size: "", costPrice: "", sellPrice: "", qty: "" }],
  };
}

function totalQty(product) {
  return product.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
}

function priceRange(product) {
  const prices = product.sizes.map((s) => Number(s.sellPrice) || 0).filter((p) => p > 0);
  if (prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? money(min) : `${money(min)} – ${money(max)}`;
}

function PhotoBox({ photo, size = 96, onPick, onRemove, rounded = "rounded-lg" }) {
  return (
    <div
      className={`relative ${rounded} overflow-hidden flex items-center justify-center shrink-0`}
      style={{ width: size, height: size, background: C.bg, border: `1px dashed ${C.border}` }}
    >
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        <Package size={size * 0.32} color={C.border} strokeWidth={1.5} />
      )}
      <label
        className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        style={{ background: "rgba(30,38,32,0.55)" }}
      >
        <ImagePlus size={20} color="#fff" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onPick(reader.result);
            reader.readAsDataURL(file);
          }}
        />
      </label>
      {photo && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 rounded-full p-0.5"
          style={{ background: "rgba(30,38,32,0.7)" }}
        >
          <X size={12} color="#fff" />
        </button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: C.sub }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function inputStyle() {
  return { border: `1px solid ${C.border}`, color: C.ink };
}

// ========= Модальное окно просмотра товара =========
function ProductViewModal({ product, onClose, onEdit }) {
  const total = totalQty(product);
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(20,26,22,0.55)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-2xl p-6 overflow-y-auto"
        style={{ maxWidth: 620, maxHeight: "88vh", background: C.card, ...FONT_BODY }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ ...FONT_DISPLAY, color: C.ink, fontSize: 20, fontWeight: 800 }}>
            {product.name}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
            <X size={20} color={C.sub} />
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <div
            className="rounded-lg overflow-hidden cursor-pointer"
            style={{ width: 120, height: 120, background: C.bg }}
            onClick={() => setShowFullPhoto(true)}
          >
            {product.photo ? (
              <img src={product.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={40} color={C.border} strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="flex-1">
            {product.description && (
              <p className="text-sm" style={{ color: C.sub }}>{product.description}</p>
            )}
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.tealBg, color: C.teal, ...FONT_MONO }}>
                {total} шт
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.accentBg, color: C.accentDark, ...FONT_MONO }}>
                {priceRange(product)}
              </span>
              {product.category && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.bg, color: C.sub }}>
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden mb-3" style={{ border: `1px solid ${C.borderSoft}` }}>
          <div className="grid grid-cols-3 px-3 py-1.5 text-xs" style={{ background: C.bg, color: C.sub }}>
            <div>Фасон</div>
            <div className="text-right">Цена</div>
            <div className="text-right">Кол-во</div>
          </div>
          {product.sizes.map((s, i) => (
            <div
              key={s.id}
              className="grid grid-cols-3 px-3 py-1.5 text-sm"
              style={{ borderTop: i > 0 ? `1px solid ${C.borderSoft}` : "none" }}
            >
              <div style={{ color: C.ink }}>{s.size || "—"}</div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.ink }}>{money(s.sellPrice)}</div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.ink }}>{Number(s.qty) || 0}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ color: C.sub, border: `1px solid ${C.border}` }}
          >
            Закрыть
          </button>
          <button
            onClick={() => { onClose(); onEdit(product); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: C.accent, color: "#fff" }}
          >
            <Pencil size={15} /> Редактировать
          </button>
        </div>
      </div>

      {/* Полноэкранное фото */}
      {showFullPhoto && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60]"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setShowFullPhoto(false)}
        >
          <img src={product.photo} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
          <button
            className="absolute top-4 right-4 rounded-full p-1"
            style={{ background: "rgba(255,255,255,0.2)" }}
            onClick={() => setShowFullPhoto(false)}
          >
            <X size={24} color="#fff" />
          </button>
        </div>
      )}
    </div>
  );
}

// ========= Модальное окно создания/редактирования =========
function ProductModal({ draft, onChange, onCancel, onSave }) {
  const setField = (field, value) => onChange({ ...draft, [field]: value });

  const setSize = (id, field, value) => {
    onChange({
      ...draft,
      sizes: draft.sizes.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };
  const addSize = () =>
    onChange({
      ...draft,
      sizes: [...draft.sizes, { id: uid(), size: "", costPrice: "", sellPrice: "", qty: "" }],
    });
  const removeSize = (id) =>
    onChange({ ...draft, sizes: draft.sizes.filter((s) => s.id !== id) });

  const canSave = draft.name.trim().length > 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(20,26,22,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full rounded-2xl p-6 overflow-y-auto"
        style={{ maxWidth: 620, maxHeight: "88vh", background: C.card, ...FONT_BODY }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ ...FONT_DISPLAY, color: C.ink, fontSize: 20, fontWeight: 800 }}>
            {draft.id ? "Изменить товар" : "Новый товар"}
          </h2>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-black/5">
            <X size={20} color={C.sub} />
          </button>
        </div>

        <div className="flex gap-4 mb-5">
          <PhotoBox
            photo={draft.photo}
            size={96}
            onPick={(dataUrl) => setField("photo", dataUrl)}
            onRemove={() => setField("photo", null)}
          />
          <div className="flex-1 flex flex-col gap-3">
            <Field label="Название товара">
              <input
                autoFocus
                value={draft.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Например: Худи оверсайз, чёрное"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle()}
              />
            </Field>
            <Field label="Описание">
              <textarea
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Ткань, состав, особенности..."
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={inputStyle()}
              />
            </Field>
            <Field label="Группа (категория)">
              <input
                value={draft.category || ""}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="Например: Верхняя одежда, Аксессуары, Треугольный карман..."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle()}
              />
            </Field>
          </div>
        </div>

        <div className="mb-2">
          <label className="text-xs font-medium" style={{ color: C.sub }}>
            Фасоны / размеры — себестоимость, цена продажи и количество
          </label>
        </div>

        <div className="rounded-lg overflow-hidden mb-2" style={{ border: `1px solid ${C.borderSoft}` }}>
          <div
            className="grid grid-cols-12 gap-2 px-3 py-2 text-xs"
            style={{ background: C.bg, color: C.sub }}
          >
            <div className="col-span-3">Фасон</div>
            <div className="col-span-3">Себестоимость</div>
            <div className="col-span-3">Цена продажи</div>
            <div className="col-span-2">Кол-во</div>
            <div className="col-span-1"></div>
          </div>
          {draft.sizes.map((s, i) => (
            <div
              key={s.id}
              className="grid grid-cols-12 gap-2 px-3 py-2 items-center"
              style={{ borderTop: i > 0 ? `1px solid ${C.borderSoft}` : "none" }}
            >
              <input
                value={s.size}
                onChange={(e) => setSize(s.id, "size", e.target.value)}
                placeholder="S / M / L"
                className="col-span-3 rounded-md px-2 py-1.5 text-sm outline-none"
                style={inputStyle()}
              />
              <input
                type="number"
                min="0"
                value={s.costPrice}
                onChange={(e) => setSize(s.id, "costPrice", e.target.value)}
                placeholder="0"
                className="col-span-3 rounded-md px-2 py-1.5 text-sm outline-none"
                style={{ ...inputStyle(), ...FONT_MONO }}
              />
              <input
                type="number"
                min="0"
                value={s.sellPrice}
                onChange={(e) => setSize(s.id, "sellPrice", e.target.value)}
                placeholder="0"
                className="col-span-3 rounded-md px-2 py-1.5 text-sm outline-none"
                style={{ ...inputStyle(), ...FONT_MONO }}
              />
              <input
                type="number"
                min="0"
                value={s.qty}
                onChange={(e) => setSize(s.id, "qty", e.target.value)}
                placeholder="0"
                className="col-span-2 rounded-md px-2 py-1.5 text-sm outline-none"
                style={{ ...inputStyle(), ...FONT_MONO }}
              />
              <button
                onClick={() => removeSize(s.id)}
                disabled={draft.sizes.length === 1}
                className="col-span-1 flex items-center justify-center rounded-md p-1.5 disabled:opacity-30"
                style={{ color: C.alert }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSize}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg mb-6"
          style={{ border: `1px dashed ${C.border}`, color: C.teal }}
        >
          <Plus size={14} /> Добавить фасон/размер
        </button>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ color: C.sub, border: `1px solid ${C.border}` }}
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: C.accent, color: "#fff" }}
          >
            <Save size={15} /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// ========= Карточка товара =========
function ProductCard({ product, expanded, onToggle, onEdit, onDelete, onView }) {
  const qty = totalQty(product);
  const low = qty === 0;

  const handleCardClick = (e) => {
    // Если клик по кнопке или её дочернему элементу – не открываем просмотр
    if (e.target.closest('button')) return;
    onView(product);
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col cursor-pointer"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
      onClick={handleCardClick}
    >
      <div
        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full z-10"
        style={{ background: C.bg, border: `1.5px solid ${C.border}` }}
      />
      <div className="flex gap-3 p-3">
        <PhotoBox photo={product.photo} size={72} onPick={() => {}} rounded="rounded-lg" />
        <div className="flex-1 min-w-0">
          <h3
            className="truncate pr-4"
            style={{ ...FONT_DISPLAY, color: C.ink, fontSize: 15, fontWeight: 700 }}
            title={product.name}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: C.sub, ...FONT_BODY }}>
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: low ? C.alertBg : C.tealBg,
                color: low ? C.alert : C.teal,
                ...FONT_MONO,
              }}
            >
              {qty} шт
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: C.accentBg, color: C.accentDark, ...FONT_MONO }}
            >
              {priceRange(product)}
            </span>
            {product.category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: C.bg, color: C.sub }}
              >
                {product.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center px-3 pb-2 gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(product); }}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-black/5"
          style={{ color: C.sub }}
        >
          <Pencil size={12} /> Изменить
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(product); }}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-black/5"
          style={{ color: C.alert }}
        >
          <Trash2 size={12} /> Удалить
        </button>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(product.id); }}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-black/5"
          style={{ color: C.sub }}
        >
          {product.sizes.length} фасон{product.sizes.length === 1 ? "" : "а"}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px dashed ${C.borderSoft}` }}>
          <div
            className="grid grid-cols-3 px-3 py-1.5 text-xs"
            style={{ background: C.bg, color: C.sub }}
          >
            <div>Фасон</div>
            <div className="text-right">Цена продажи</div>
            <div className="text-right">Кол-во</div>
          </div>
          {product.sizes.map((s) => {
            const sQty = Number(s.qty) || 0;
            return (
              <div
                key={s.id}
                className="grid grid-cols-3 px-3 py-1.5 text-sm items-center"
                style={{
                  borderTop: `1px solid ${C.borderSoft}`,
                  background: sQty === 0 ? C.alertBg : "transparent",
                }}
              >
                <div style={{ color: C.ink }}>{s.size || "—"}</div>
                <div className="text-right" style={{ ...FONT_MONO, color: C.ink }}>
                  {money(s.sellPrice)}
                </div>
                <div
                  className="text-right"
                  style={{ ...FONT_MONO, color: sQty === 0 ? C.alert : C.ink }}
                >
                  {sQty}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ========= Модальное окно продажи =========
function emptySale(products) {
  const firstProduct = products[0] || null;
  const firstSize = firstProduct ? firstProduct.sizes.find((s) => (Number(s.qty) || 0) > 0) : null;
  return {
    productId: firstProduct ? firstProduct.id : "",
    sizeId: firstSize ? firstSize.id : "",
    qty: 1,
    date: todayStr(),
    sellPrice: firstSize ? firstSize.sellPrice : "",
    service: "",
    delivery: "",
  };
}

function SaleModal({ products, draft, onChange, onCancel, onSave }) {
  const product = products.find((p) => p.id === draft.productId) || null;
  const size = product ? product.sizes.find((s) => s.id === draft.sizeId) : null;
  const available = size ? Number(size.qty) || 0 : 0;

  const qty = Number(draft.qty) || 0;
  const sellPrice = Number(draft.sellPrice) || 0;
  const costPrice = size ? Number(size.costPrice) || 0 : 0;
  const service = Number(draft.service) || 0;
  const delivery = Number(draft.delivery) || 0;
  const revenue = sellPrice * qty;
  const totalCost = costPrice * qty;
  const profit = revenue - service - delivery - totalCost;

  const canSave = product && size && qty > 0 && qty <= available;

  const pickProduct = (productId) => {
    const p = products.find((x) => x.id === productId);
    const firstSize = p ? p.sizes.find((s) => (Number(s.qty) || 0) > 0) : null;
    onChange({
      ...draft,
      productId,
      sizeId: firstSize ? firstSize.id : "",
      sellPrice: firstSize ? firstSize.sellPrice : "",
    });
  };
  const pickSize = (sizeId) => {
    const s = product ? product.sizes.find((x) => x.id === sizeId) : null;
    onChange({ ...draft, sizeId, sellPrice: s ? s.sellPrice : "" });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(20,26,22,0.55)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="w-full rounded-2xl p-6 overflow-y-auto"
        style={{ maxWidth: 480, maxHeight: "88vh", background: C.card, ...FONT_BODY }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ ...FONT_DISPLAY, color: C.ink, fontSize: 20, fontWeight: 800 }}>
            Новая продажа
          </h2>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-black/5">
            <X size={20} color={C.sub} />
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm" style={{ color: C.sub }}>
            Сначала добавьте хотя бы один товар на складе.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label="Товар">
              <select
                value={draft.productId}
                onChange={(e) => pickProduct(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle()}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Фасон / размер">
              <select
                value={draft.sizeId}
                onChange={(e) => pickSize(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle()}
              >
                {product &&
                  product.sizes.map((s) => (
                    <option key={s.id} value={s.id} disabled={(Number(s.qty) || 0) === 0}>
                      {s.size || "—"} (доступно: {Number(s.qty) || 0})
                    </option>
                  ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Количество продажи">
                <input
                  type="number"
                  min="1"
                  max={available}
                  value={draft.qty}
                  onChange={(e) => onChange({ ...draft, qty: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ ...inputStyle(), ...FONT_MONO }}
                />
              </Field>
              <Field label="Дата продажи">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => onChange({ ...draft, date: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ ...inputStyle(), ...FONT_MONO }}
                />
              </Field>
            </div>
            {qty > available && (
              <p className="text-xs" style={{ color: C.alert }}>
                На складе доступно только {available} шт для этого фасона.
              </p>
            )}

            <Field label="Цена продажи (за единицу)">
              <input
                type="number"
                min="0"
                value={draft.sellPrice}
                onChange={(e) => onChange({ ...draft, sellPrice: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ ...inputStyle(), ...FONT_MONO }}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Услуга Kaspi">
                <input
                  type="number"
                  min="0"
                  value={draft.service}
                  onChange={(e) => onChange({ ...draft, service: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ ...inputStyle(), ...FONT_MONO }}
                />
              </Field>
              <Field label="Доставка">
                <input
                  type="number"
                  min="0"
                  value={draft.delivery}
                  onChange={(e) => onChange({ ...draft, delivery: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ ...inputStyle(), ...FONT_MONO }}
                />
              </Field>
            </div>

            <div
              className="rounded-lg p-3 mt-1"
              style={{ background: C.bg, border: `1px solid ${C.borderSoft}` }}
            >
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.sub }}>Выручка ({qty} × {money(sellPrice)})</span>
                <span style={{ ...FONT_MONO, color: C.ink }}>{money(revenue)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.sub }}>Себестоимость ({qty} × {money(costPrice)})</span>
                <span style={{ ...FONT_MONO, color: C.ink }}>{money(totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.sub }}>Услуга + доставка</span>
                <span style={{ ...FONT_MONO, color: C.ink }}>{money(service + delivery)}</span>
              </div>
              <div
                className="flex justify-between text-sm pt-1 mt-1 font-semibold"
                style={{ borderTop: `1px dashed ${C.borderSoft}` }}
              >
                <span style={{ color: C.ink }}>Прибыль</span>
                <span style={{ ...FONT_MONO, color: profit >= 0 ? C.teal : C.alert }}>
                  {money(profit)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ color: C.sub, border: `1px solid ${C.border}` }}
          >
            Отмена
          </button>
          <button
            onClick={() => onSave({ product, size, qty, sellPrice, costPrice, service, delivery, revenue, totalCost, profit, date: draft.date })}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: C.accent, color: "#fff" }}
          >
            <Save size={15} /> Записать продажу
          </button>
        </div>
      </div>
    </div>
  );
}

// ========= Компонент статистики =========
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div
      className="rounded-xl p-4 flex-1 min-w-[160px]"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-1.5 mb-1" style={{ color: color || C.sub }}>
        {icon}
        <span className="text-xs" style={{ color: C.sub }}>{label}</span>
      </div>
      <div style={{ ...FONT_MONO, color: C.ink, fontSize: 22, fontWeight: 600 }}>{value}</div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: C.sub }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ========= Вкладка продаж =========
function SalesTab({ products, sales, onAddSale, onDeleteSale }) {
  const today = todayStr();
  const salesToday = sales.filter((s) => s.date === today);
  const profitToday = salesToday.reduce((sum, s) => sum + s.profit, 0);
  const profitAll = sales.reduce((sum, s) => sum + s.profit, 0);
  const revenueAll = sales.reduce((sum, s) => sum + s.revenue, 0);
  const sorted = [...sales].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <StatCard
          icon={<Calendar size={14} />}
          label={`Прибыль за сегодня (${salesToday.length} прод.)`}
          value={money(profitToday)}
          color={C.teal}
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          label={`Прибыль за всё время (${sales.length} прод.)`}
          value={money(profitAll)}
          sub={`Выручка: ${money(revenueAll)}`}
          color={C.accentDark}
        />
      </div>

      {sales.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl gap-3"
          style={{ border: `1px dashed ${C.border}` }}
        >
          <Receipt size={36} color={C.border} strokeWidth={1.5} />
          <p style={{ color: C.ink, fontWeight: 600 }}>Продаж пока нет</p>
          <p className="text-sm text-center max-w-xs" style={{ color: C.sub }}>
            Добавьте первую продажу — прибыль посчитается автоматически.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <div
            className="grid gap-2 px-3 py-2 text-xs"
            style={{ background: C.bg, color: C.sub, gridTemplateColumns: "90px 1.6fr 60px 90px 80px 80px 90px 40px" }}
          >
            <div>Дата</div>
            <div>Товар</div>
            <div className="text-right">Кол-во</div>
            <div className="text-right">Продажа</div>
            <div className="text-right">Услуга</div>
            <div className="text-right">Доставка</div>
            <div className="text-right">Прибыль</div>
            <div></div>
          </div>
          {sorted.map((s) => (
            <div
              key={s.id}
              className="grid gap-2 px-3 py-2 items-center text-sm"
              style={{
                gridTemplateColumns: "90px 1.6fr 60px 90px 80px 80px 90px 40px",
                borderTop: `1px solid ${C.borderSoft}`,
              }}
            >
              <div style={{ ...FONT_MONO, color: C.sub, fontSize: 12 }}>{formatDate(s.date)}</div>
              <div className="truncate" style={{ color: C.ink }}>
                {s.productName}
                <span style={{ color: C.sub }}> · {s.sizeLabel}</span>
              </div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.ink }}>{s.qty}</div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.ink }}>{money(s.revenue)}</div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.sub }}>{money(s.service)}</div>
              <div className="text-right" style={{ ...FONT_MONO, color: C.sub }}>{money(s.delivery)}</div>
              <div
                className="text-right font-medium"
                style={{ ...FONT_MONO, color: s.profit >= 0 ? C.teal : C.alert }}
              >
                {money(s.profit)}
              </div>
              <div className="flex justify-end">
                <button onClick={() => onDeleteSale(s)} className="p-1 rounded-md hover:bg-black/5">
                  <Trash2 size={13} color={C.alert} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========= ГЛАВНЫЙ КОМПОНЕНТ =========
export default function InventoryApp() {
  const [tab, setTab] = useState("stock");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [modalDraft, setModalDraft] = useState(null);
  const [saleDraft, setSaleDraft] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [viewingProduct, setViewingProduct] = useState(null); // для просмотра товара

  useEffect(() => {
    (async () => {
      const [productKeys, saleKeys] = await Promise.all([
        storageListKeys("product:"),
        storageListKeys("sale:"),
      ]);
      const [loadedProducts, loadedSales] = await Promise.all([
        Promise.all(productKeys.map((k) => storageGet(k))),
        Promise.all(saleKeys.map((k) => storageGet(k))),
      ]);
      setProducts(loadedProducts.filter(Boolean).sort((a, b) => a.createdAt - b.createdAt));
      setSales(loadedSales.filter(Boolean));
      setLoading(false);
    })();
  }, []);

  const openNewProduct = () => setModalDraft(emptyProduct());
  const openEditProduct = (p) => setModalDraft({ ...p, sizes: p.sizes.map((s) => ({ ...s })) });

  const saveProductModal = async () => {
    const draft = modalDraft;
    const cleanSizes = draft.sizes
      .filter((s) => s.size.trim().length > 0)
      .map((s) => ({
        ...s,
        costPrice: Number(s.costPrice) || 0,
        sellPrice: Number(s.sellPrice) || 0,
        qty: Number(s.qty) || 0,
      }));
    const id = draft.id || uid();
    const product = {
      ...draft,
      id,
      name: draft.name.trim(),
      category: draft.category || "",
      sizes: cleanSizes.length
        ? cleanSizes
        : [{ id: uid(), size: "—", costPrice: 0, sellPrice: 0, qty: 0 }],
    };
    await storageSet(`product:${id}`, product);
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === id);
      const next = exists ? prev.map((p) => (p.id === id ? product : p)) : [...prev, product];
      return next.sort((a, b) => a.createdAt - b.createdAt);
    });
    setModalDraft(null);
  };

  const doDeleteProduct = async (p) => {
    await storageDelete(`product:${p.id}`);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setConfirmDelete(null);
  };

  const openNewSale = () => setSaleDraft(emptySale(products));

  const saveSale = async ({ product, size, qty, sellPrice, costPrice, service, delivery, revenue, totalCost, profit, date }) => {
    if (!product || !size) return;
    const saleId = uid();
    const sale = {
      id: saleId,
      productId: product.id,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.size || "—",
      qty,
      date,
      sellPrice,
      costPrice,
      service,
      delivery,
      revenue,
      totalCost,
      profit,
      createdAt: Date.now(),
    };
    const updatedProduct = {
      ...product,
      sizes: product.sizes.map((s) =>
        s.id === size.id ? { ...s, qty: Math.max(0, (Number(s.qty) || 0) - qty) } : s
      ),
    };
    await Promise.all([
      storageSet(`sale:${saleId}`, sale),
      storageSet(`product:${product.id}`, updatedProduct),
    ]);
    setSales((prev) => [...prev, sale]);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? updatedProduct : p)));
    setSaleDraft(null);
  };

  const deleteSale = async (sale) => {
    await storageDelete(`sale:${sale.id}`);
    setSales((prev) => prev.filter((s) => s.id !== sale.id));
    const product = products.find((p) => p.id === sale.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        sizes: product.sizes.map((s) =>
          s.id === sale.sizeId ? { ...s, qty: (Number(s.qty) || 0) + sale.qty } : s
        ),
      };
      await storageSet(`product:${product.id}`, updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updatedProduct : p)));
    }
  };

  const totalUnits = products.reduce((sum, p) => sum + totalQty(p), 0);

  const exportData = () => {
    const payload = { app: "sklad", version: 1, exportedAt: Date.now(), products, sales };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sklad-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerImportPick = () => {
    setImportError("");
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.sales)) {
          setImportError("Этот файл не похож на резервную копию склада.");
          return;
        }
        setPendingImport(parsed);
      } catch (err) {
        setImportError("Не удалось прочитать файл. Убедитесь, что это .json, скачанный из этого приложения.");
      }
    };
    reader.readAsText(file);
  };

  const confirmImportNow = async () => {
    if (!pendingImport) return;
    setImporting(true);
    const [oldProductKeys, oldSaleKeys] = await Promise.all([
      storageListKeys("product:"),
      storageListKeys("sale:"),
    ]);
    await Promise.all([...oldProductKeys, ...oldSaleKeys].map((k) => storageDelete(k)));
    await Promise.all([
      ...pendingImport.products.map((p) => storageSet(`product:${p.id}`, p)),
      ...pendingImport.sales.map((s) => storageSet(`sale:${s.id}`, s)),
    ]);
    setProducts(pendingImport.products.slice().sort((a, b) => a.createdAt - b.createdAt));
    setSales(pendingImport.sales);
    setImporting(false);
    setPendingImport(null);
  };

  // Группировка товаров по категориям
  const groupedProducts = products.reduce((acc, p) => {
    const cat = p.category || "Без категории";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-full w-full" style={{ background: C.bg, ...FONT_BODY }}>
      <style>{FONT_IMPORT}</style>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 style={{ ...FONT_DISPLAY, color: C.ink, fontSize: 26, fontWeight: 800 }}>
              Склад
            </h1>
            {tab === "stock" && (
              <p className="text-sm mt-0.5" style={{ color: C.sub }}>
                {products.length} товар{products.length === 1 ? "" : products.length >= 2 && products.length <= 4 ? "а" : "ов"} · {totalUnits} ед. на складе
              </p>
            )}
            {tab === "sales" && (
              <p className="text-sm mt-0.5" style={{ color: C.sub }}>
                История продаж и прибыль
              </p>
            )}
          </div>
          <button
            onClick={tab === "stock" ? openNewProduct : openNewSale}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: C.accent, color: "#fff" }}
          >
            <Plus size={16} /> {tab === "stock" ? "Добавить товар" : "Добавить продажу"}
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <button
              onClick={() => setTab("stock")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={tab === "stock" ? { background: C.bg, color: C.ink } : { color: C.sub }}
            >
              <Boxes size={14} /> Склад
            </button>
            <button
              onClick={() => setTab("sales")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={tab === "sales" ? { background: C.bg, color: C.ink } : { color: C.sub }}
            >
              <Receipt size={14} /> Продажи
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${C.border}`, color: C.ink, background: C.card }}
              title="Скачать все данные (товары и продажи) файлом"
            >
              <Download size={14} /> Скачать данные
            </button>
            <button
              onClick={triggerImportPick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${C.border}`, color: C.ink, background: C.card }}
              title="Загрузить данные с другого устройства"
            >
              <Upload size={14} /> Загрузить данные
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {importError && (
          <div
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg mb-4"
            style={{ background: C.alertBg, color: C.alert }}
          >
            <AlertTriangle size={14} /> {importError}
            <button className="ml-auto" onClick={() => setImportError("")}>
              <X size={14} />
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24 gap-2" style={{ color: C.sub }}>
            <Loader2 size={18} className="animate-spin" /> Загрузка…
          </div>
        )}

        {!loading && tab === "stock" && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl gap-3"
            style={{ border: `1px dashed ${C.border}` }}
          >
            <Package size={40} color={C.border} strokeWidth={1.5} />
            <p style={{ color: C.ink, fontWeight: 600 }}>Пока нет товаров</p>
            <p className="text-sm text-center max-w-xs" style={{ color: C.sub }}>
              Добавьте первый товар, укажите фото и разбейте его по фасонам с себестоимостью, ценой и количеством.
            </p>
            <button
              onClick={openNewProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium mt-1"
              style={{ background: C.accent, color: "#fff" }}
            >
              <Plus size={15} /> Добавить товар
            </button>
          </div>
        )}

        {!loading && tab === "stock" && products.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: C.sub, ...FONT_DISPLAY }}>
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      expanded={expandedId === p.id}
                      onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
                      onEdit={openEditProduct}
                      onDelete={setConfirmDelete}
                      onView={(product) => setViewingProduct(product)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "sales" && (
          <SalesTab products={products} sales={sales} onAddSale={openNewSale} onDeleteSale={deleteSale} />
        )}
      </div>

      {/* Модалка просмотра товара */}
      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={openEditProduct}
        />
      )}

      {/* Модалка создания/редактирования */}
      {modalDraft && (
        <ProductModal
          draft={modalDraft}
          onChange={setModalDraft}
          onCancel={() => setModalDraft(null)}
          onSave={saveProductModal}
        />
      )}

      {/* Модалка продажи */}
      {saleDraft && (
        <SaleModal
          products={products}
          draft={saleDraft}
          onChange={setSaleDraft}
          onCancel={() => setSaleDraft(null)}
          onSave={saveSale}
        />
      )}

      {/* Подтверждение импорта */}
      {pendingImport && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(20,26,22,0.55)" }}
          onMouseDown={(e) => e.target === e.currentTarget && !importing && setPendingImport(null)}
        >
          <div className="w-full rounded-2xl p-6" style={{ maxWidth: 420, background: C.card, ...FONT_BODY }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} color={C.alert} />
              <p style={{ color: C.ink, fontWeight: 700, ...FONT_DISPLAY }}>Загрузить эти данные?</p>
            </div>
            <p className="text-sm" style={{ color: C.sub }}>
              В файле {pendingImport.products.length} товар(ов) и {pendingImport.sales.length} продаж(и).
              Все текущие данные на этом устройстве будут заменены содержимым файла — это нельзя отменить.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setPendingImport(null)}
                disabled={importing}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: C.sub, border: `1px solid ${C.border}` }}
              >
                Отмена
              </button>
              <button
                onClick={confirmImportNow}
                disabled={importing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ background: C.accent, color: "#fff" }}
              >
                {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {importing ? "Загружаем…" : "Заменить данные"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(20,26,22,0.55)" }}
          onMouseDown={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
        >
          <div className="w-full rounded-2xl p-6" style={{ maxWidth: 380, background: C.card }}>
            <p style={{ color: C.ink, fontWeight: 600, ...FONT_BODY }}>
              Удалить «{confirmDelete.name}»?
            </p>
            <p className="text-sm mt-1" style={{ color: C.sub }}>
              Все фасоны и данные о количестве будут удалены без возможности восстановления.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: C.sub, border: `1px solid ${C.border}` }}
              >
                Отмена
              </button>
              <button
                onClick={() => doDeleteProduct(confirmDelete)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: C.alert, color: "#fff" }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```
