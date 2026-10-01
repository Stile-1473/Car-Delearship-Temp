/**
 * Test Drive Booking
 * Pick a day and time within trading hours; the request goes to the sales
 * team on WhatsApp and the customer can add it to their calendar.
 */

import React, { useState } from 'react';
import { FaCalendarAlt, FaWhatsapp, FaCheckCircle, FaCalendarPlus } from 'react-icons/fa';
import { whatsappLink, carTitle, carUrl } from '../utils/whatsapp';
import { dealershipInfo } from '../data/mockData';

const DAYS_AHEAD = 12;
// Trading hours: Mon–Fri 08:00–18:00, Sat 09:00–17:00, Sun closed. Last slot an hour before close.
const SLOTS = {
  weekday: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
};

function upcomingDays() {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; days.length < DAYS_AHEAD && i < DAYS_AHEAD + 4; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    if (day.getDay() !== 0) days.push(day);
  }
  return days;
}

function slotsFor(day) {
  if (!day) return [];
  const list = day.getDay() === 6 ? SLOTS.saturday : SLOTS.weekday;
  const now = new Date();
  if (day.toDateString() !== now.toDateString()) return list;
  // today: only slots at least an hour from now
  return list.filter((t) => Number(t.slice(0, 2)) > now.getHours() + 1);
}

const fmtDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function icsFile(car, day, time) {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(day);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 45 * 60000);
  const stamp = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZimCar//Test Drive//EN',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${car.id}@zimcar`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Test drive — ${carTitle(car)}`,
    `LOCATION:${dealershipInfo.address}`,
    `DESCRIPTION:Test drive request at ZimCar. ${carUrl(car)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
}

const TestDriveBooking = ({ car }) => {
  const [days] = useState(upcomingDays);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const slots = slotsFor(day);
  const ready = day && time && name.trim() && phone.trim();

  const message = ready
    ? `Hi ZimCar, I'd like to book a test drive.\nCar: ${carTitle(car)}\nWhen: ${fmtDay(day)} at ${time}\n` +
      `Name: ${name.trim()}\nPhone: ${phone.trim()}\n${carUrl(car)}`
    : '';

  const submit = (e) => {
    e.preventDefault();
    if (!ready) return;
    window.open(whatsappLink(message), '_blank', 'noopener');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <FaCheckCircle className="text-3xl text-green-600" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">Request sent on WhatsApp</h3>
        <p className="mt-1 text-sm text-gray-700">
          {fmtDay(day)} at {time} · {carTitle(car)}. Our team will confirm your slot shortly.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={icsFile(car, day, time)}
            download="zimcar-test-drive.ics"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            <FaCalendarPlus /> Add to calendar
          </a>
          <button type="button" onClick={() => setSent(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
            Change booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-gray-900">
        <FaCalendarAlt className="text-amber-500" />
        <h2 className="text-lg font-semibold">Book a test drive</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">Pick a time and we&apos;ll have the car washed, fuelled and waiting for you.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const active = day && d.toDateString() === day.toDateString();
          const disabled = slotsFor(d).length === 0;
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => {
                setDay(d);
                setTime('');
              }}
              className={`flex w-16 shrink-0 flex-col items-center rounded-lg border py-2 text-xs ${
                active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
              <span>{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
            </button>
          );
        })}
      </div>

      {day && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {slots.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className={`rounded-md border py-1.5 text-sm ${time === t ? 'border-amber-500 bg-amber-500 font-semibold text-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (e.g. 077 123 4567)"
          aria-label="Phone number"
          type="tel"
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!ready}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <FaWhatsapp className="text-lg" />
        {ready ? `Request ${fmtDay(day)} at ${time}` : 'Choose a day, time and your details'}
      </button>
    </form>
  );
};

export default TestDriveBooking;
