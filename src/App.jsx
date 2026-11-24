import React, { useMemo, useState } from "react";
import {
  CalendarDays, Clock3, Users, Plus, Search, SlidersHorizontal,
  CheckCircle2, XCircle, Pencil, Trash2, LayoutDashboard, CalendarCheck,
  Sparkles, ChevronDown, X, Building2, CircleAlert
} from "lucide-react";
import { businessConfigs, initialBookings, makeId } from "./data/configs.js";
import { getAvailableSlots, hasConflict, formatDate } from "./utils/booking.js";

const today = new Date().toISOString().slice(0, 10);

function App() {
  const [businessId, setBusinessId] = useState("salon");
  const [bookings, setBookings] = useState(initialBookings);
  const [activeTab, setActiveTab] = useState("bookings");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const config = businessConfigs[businessId];
  const businessBookings = useMemo(
    () => bookings.filter((item) => item.businessId === businessId),
    [bookings, businessId]
  );
  const visibleBookings = useMemo(() => businessBookings
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => `${item.customer} ${item.service} ${item.id}`
      .toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
  [businessBookings, statusFilter, search]);

  const stats = useMemo(() => ({
    total: businessBookings.filter((b) => b.status !== "cancelled").length,
    today: businessBookings.filter((b) => b.date === today && b.status !== "cancelled").length,
    cancelled: businessBookings.filter((b) => b.status === "cancelled").length
  }), [businessBookings]);

  const notify = (message, type = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3200);
  };

  const openCreate = () => {
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (id) => {
    setEditingId(id);
    setShowModal(true);
  };

  const saveBooking = (form) => {
    const candidate = { ...form, businessId, status: "confirmed" };
    if (hasConflict(bookings, candidate, editingId)) {
      notify("Този ресурс вече е зает в избрания интервал.", "error");
      return false;
    }
    if (editingId) {
      setBookings((current) => current.map((b) => b.id === editingId ? { ...b, ...candidate } : b));
      notify("Резервацията беше актуализирана.");
    } else {
      setBookings((current) => [{ ...candidate, id: makeId() }, ...current]);
      notify("Резервацията беше създадена успешно.");
    }
    setShowModal(false);
    return true;
  };

  const cancelBooking = (id) => {
    setBookings((current) => current.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    notify("Резервацията беше отказана.");
  };

  const restoreBooking = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (hasConflict(bookings, booking, id)) {
      notify("Не може да бъде възстановена — има конфликт.", "error");
      return;
    }
    setBookings((current) => current.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
    notify("Резервацията е възстановена.");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><CalendarCheck size={21}/></div><span>reserve<span className="brand-dot">.</span></span></div>
        <div className="side-label">РАБОТНО ПРОСТРАНСТВО</div>
        <button className={`nav-item ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}><LayoutDashboard size={18}/> Резервации</button>
        <button className={`nav-item ${activeTab === "availability" ? "active" : ""}`} onClick={() => setActiveTab("availability")}><Clock3 size={18}/> Наличност</button>
        <div className="side-bottom">
          <div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><strong>Универсална система</strong><p>Една платформа за различни бизнеси.</p></div>
          <div className="profile"><div className="avatar">АД</div><div><strong>Администратор</strong><small>Работен профил</small></div><ChevronDown size={16}/></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Работно пространство <span>/</span> <strong>{config.name}</strong></div>
          <div className="top-actions"><span className="live-dot"></span><span className="live-text">Демо режим</span><div className="top-avatar">АД</div></div>
        </header>

        <section className="page-wrap">
          <div className="page-heading">
            <div><div className="eyebrow">УПРАВЛЕНИЕ НА ГРАФИКА</div><h1>Резервации</h1><p>Управлявайте часовете, ресурсите и клиентите си на едно място.</p></div>
            <button className="primary-btn" onClick={openCreate}><Plus size={18}/> Нова резервация</button>
          </div>

          <div className="business-switcher">
            <div className="switcher-intro"><Building2 size={18}/><span>Изберете тип бизнес</span></div>
            <div className="business-options">
              {Object.values(businessConfigs).map((item) => (
                <button key={item.id} className={`business-option ${businessId === item.id ? "selected" : ""}`} onClick={() => { setBusinessId(item.id); setSearch(""); setStatusFilter("all"); }}>
                  <span className="business-icon">{item.icon}</span><span>{item.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="stats-grid">
            <StatCard icon={<CalendarDays size={19}/>} label="Активни резервации" value={stats.total} note="Общо за избрания бизнес" tone="purple"/>
            <StatCard icon={<Clock3 size={19}/>} label="За днес" value={stats.today} note="Планирани за днешния ден" tone="blue"/>
            <StatCard icon={<XCircle size={19}/>} label="Отказани" value={stats.cancelled} note="Отказани резервации" tone="orange"/>
          </div>

          {activeTab === "bookings" ? (
            <section className="panel">
              <div className="panel-heading"><div><h2>Всички резервации</h2><p>Преглед и управление на записаните часове</p></div><span className="count-pill">{visibleBookings.length} записа</span></div>
              <div className="toolbar">
                <div className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Търси клиент, услуга или №..."/></div>
                <div className="filter-box"><SlidersHorizontal size={16}/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">Всички статуси</option><option value="confirmed">Потвърдени</option><option value="cancelled">Отказани</option></select></div>
              </div>
              <div className="table-wrap">
                <table><thead><tr><th>КЛИЕНТ</th><th>{config.resourceLabel.toUpperCase()}</th><th>ДАТА И ЧАС</th><th>УСЛУГА</th><th>СТАТУС</th><th></th></tr></thead>
                  <tbody>{visibleBookings.length ? visibleBookings.map((booking) => {
                    const resource = config.resources.find((r) => r.id === booking.resourceId);
                    return <tr key={booking.id}>
                      <td><div className="customer-cell"><div className="customer-avatar">{booking.customer.split(" ").map(x => x[0]).slice(0,2).join("")}</div><div><strong>{booking.customer}</strong><small>{booking.id}</small></div></div></td>
                      <td><strong className="resource-name">{resource?.name || "—"}</strong><small className="sub-cell">{resource?.role}</small></td>
                      <td><strong>{formatDate(booking.date)}</strong><small className="sub-cell time-cell"><Clock3 size={12}/>{booking.time} ч.</small></td>
                      <td><span className="service-chip">{booking.service}</span></td>
                      <td><span className={`status ${booking.status}`}><i></i>{booking.status === "confirmed" ? "Потвърдена" : "Отказана"}</span></td>
                      <td><div className="row-actions">{booking.status === "confirmed" ? <><button title="Редактирай" onClick={() => openEdit(booking.id)}><Pencil size={16}/></button><button title="Откажи" onClick={() => cancelBooking(booking.id)}><Trash2 size={16}/></button></> : <button className="restore-btn" onClick={() => restoreBooking(booking.id)}>Възстанови</button>}</div></td>
                    </tr>;
                  }) : <tr><td colSpan="6"><div className="empty-state"><CalendarDays size={28}/><strong>Няма намерени резервации</strong><span>Променете филтрите или създайте нова резервация.</span></div></td></tr>}</tbody>
                </table>
              </div>
              <div className="panel-footer"><span>Показани {visibleBookings.length} от {businessBookings.length} резервации</span><span><span className="legend-dot"></span> Данните са демонстрационни</span></div>
            </section>
          ) : <AvailabilityPanel config={config} bookings={bookings} />}

          <div className="info-note"><div><CircleAlert size={17}/></div><p><strong>Демо приложение:</strong> Данните се съхраняват в състоянието на приложението и се нулират при презареждане. В реална система е необходим backend и база данни.</p></div>
        </section>
      </main>

      {showModal && <BookingModal config={config} bookings={bookings} businessId={businessId} editing={bookings.find((b) => b.id === editingId)} onClose={() => setShowModal(false)} onSave={saveBooking}/>}
      {notice && <div className={`toast ${notice.type}`}><span>{notice.type === "success" ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}</span>{notice.message}<button onClick={() => setNotice(null)}><X size={15}/></button></div>}
    </div>
  );
}

function StatCard({ icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function BookingModal({ config, bookings, businessId, editing, onClose, onSave }) {
  const [customer, setCustomer] = useState(editing?.customer || "");
  const [resourceId, setResourceId] = useState(editing?.resourceId || config.resources[0].id);
  const [service, setService] = useState(editing?.service || config.services[0]);
  const [date, setDate] = useState(editing?.date || today);
  const [duration, setDuration] = useState(editing?.duration || config.duration);
  const [time, setTime] = useState(editing?.time || "");
  const [people, setPeople] = useState(editing?.people || 1);
  const [error, setError] = useState("");

  const slots = useMemo(() => getAvailableSlots(config, bookings, date, resourceId, Number(duration), editing?.id), [config, bookings, date, resourceId, duration, editing]);
  const selectedTime = slots.includes(time) ? time : "";
  const isRestaurant = businessId === "restaurant";

  const submit = (e) => {
    e.preventDefault();
    if (!customer.trim()) return setError("Въведете име на клиент.");
    if (!selectedTime) return setError("Изберете свободен час.");
    const resource = config.resources.find((r) => r.id === resourceId);
    const capacity = Number(resource?.role.match(/\d+/)?.[0] || 99);
    if (isRestaurant && Number(people) > capacity) return setError(`Избраната маса е с капацитет ${capacity} места.`);
    const ok = onSave({
      customer: customer.trim(), resourceId, service, date, time: selectedTime,
      duration: Number(duration), people: Number(people)
    });
    if (ok) onClose();
  };

  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header"><div><div className="eyebrow">{editing ? "РЕДАКЦИЯ" : "НОВ ЗАПИС"}</div><h2>{editing ? "Редактиране на резервация" : "Нова резервация"}</h2><p>Попълнете данните за вашата резервация.</p></div><button className="close-btn" onClick={onClose}><X size={19}/></button></div>
      <form onSubmit={submit}>
        <label>Име на клиент<input autoFocus value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Напр. Иван Иванов"/></label>
        <div className="form-grid">
          <label>{config.resourceLabel}<select value={resourceId} onChange={(e) => { setResourceId(e.target.value); setTime(""); }}>{config.resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label>Услуга<select value={service} onChange={(e) => setService(e.target.value)}>{config.services.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Дата<input type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }}/></label>
          <label>Продължителност<select value={duration} onChange={(e) => { setDuration(Number(e.target.value)); setTime(""); }}><option value={30}>30 минути</option><option value={60}>60 минути</option><option value={90}>90 минути</option><option value={120}>120 минути</option></select></label>
        </div>
        <div className="slot-heading"><label>Свободни часове</label><span>{slots.length} свободни слота</span></div>
        {slots.length ? <div className="slot-grid">{slots.map((slot) => <button type="button" key={slot} className={`slot ${selectedTime === slot ? "chosen" : ""}`} onClick={() => { setTime(slot); setError(""); }}>{slot}</button>)}</div> : <div className="no-slots">Няма свободни часове за избраните критерии.</div>}
        {isRestaurant && <label>Брой гости<input type="number" min="1" max="20" value={people} onChange={(e) => setPeople(e.target.value)}/></label>}
        {error && <div className="form-error"><CircleAlert size={15}/>{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Отказ</button><button className="primary-btn" type="submit"><CheckCircle2 size={17}/>{editing ? "Запази промените" : "Създай резервация"}</button></div>
      </form>
    </div>
  </div>;
}

function AvailabilityPanel({ config, bookings }) {
  const [date, setDate] = useState(today);
  const [resourceId, setResourceId] = useState(config.resources[0].id);
  const slots = useMemo(() => getAvailableSlots(config, bookings, date, resourceId), [config, bookings, date, resourceId]);
  return <section className="panel availability-panel">
    <div className="panel-heading"><div><h2>Проверка на наличност</h2><p>Свободни интервали според избрания ресурс и дата</p></div><span className="count-pill">{slots.length} свободни часа</span></div>
    <div className="availability-controls"><label>Дата<input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}/></label><label>{config.resourceLabel}<select value={resourceId} onChange={(e) => setResourceId(e.target.value)}>{config.resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label></div>
    <div className="availability-summary"><div><span className="available-key"></span> Свободно</div><div><span className="occupied-key"></span> Заето</div></div>
    <div className="availability-grid">{Array.from({ length: Math.floor((Number(config.closing.slice(0,2))*60 + Number(config.closing.slice(3)) - (Number(config.opening.slice(0,2))*60 + Number(config.opening.slice(3))) - config.duration) / config.step) + 1 }, (_, i) => {
      const minute = Number(config.opening.slice(0,2))*60 + Number(config.opening.slice(3)) + i * config.step;
      const time = `${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
      const available = slots.includes(time);
      return <div key={time} className={`availability-slot ${available ? "free" : "busy"}`}><span>{time}</span><small>{available ? "Свободно" : "Заето"}</small></div>;
    })}</div>
  </section>;
}

export default App;
