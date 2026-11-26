import test from 'node:test';
import assert from 'node:assert/strict';
import { weekDatesFor, getMonthGrid, addMonths, addDays, toISODate } from '../src/components/social-calendar/model';
test('ported VSB calendar keeps Monday-first weeks across year boundaries',()=>{
 assert.deepEqual(weekDatesFor(new Date(2027,0,1)),['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03']);
});
test('month grid shows all days and outside-month context in six full weeks',()=>{
 const weeks=getMonthGrid(new Date(2026,10,26));assert.equal(weeks.length,6);assert.ok(weeks.every(w=>w.length===7));assert.equal(weeks.flat().filter(d=>d.inMonth).length,30);assert.equal(weeks[0][0].date,'2026-10-26');
});
test('period navigation handles short months and daylight saving without skipping dates',()=>{
 assert.equal(toISODate(addMonths(new Date(2026,0,31),1)),'2026-02-01');assert.equal(toISODate(addDays(new Date(2026,9,3),2)),'2026-10-05');
});
