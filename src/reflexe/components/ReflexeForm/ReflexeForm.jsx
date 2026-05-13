import { useState } from 'react';
import { SliderField } from '../SliderField/SliderField.jsx';
import styles from './ReflexeForm.module.css';

const initialForm = {
  aktivity: '',
  pareto_score: 5, pareto_percent: '', pareto_note: '',
  parkinson_score: 5, parkinson_note: '',
  zrouti: '',
  posun_score: 5, posun_note: '', setup_score: 5,
  focus_score: 5, focus_note: '',
  vedomost_score: 5, vedomost_percent: '', vedomost_note: '',
  vyruseni_score: 5, vyruseni_note: '',
};

export function ReflexeForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>1/8</span><span className={styles.qTitle}>Aktivity v bloku</span></div>
        <div className={styles.qDesc}>Co jsi za poslední 2 hodiny dělala?</div>
        <textarea name="aktivity" className={styles.textarea}
          placeholder="např. Psaní nabídky pro XY, 3× call, úprava EB21 materiálu…"
          value={form.aktivity} onChange={(e) => set('aktivity', e.target.value)}
        />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>2/8</span><span className={styles.qTitle}>80/20 – Pareto</span></div>
        <div className={styles.qDesc}>Dělala jsi těch 20 % činností, co generují 80 % výsledku?</div>
        <SliderField label="Skóre 1–10:" value={form.pareto_score} onChange={(v) => set('pareto_score', v)} name="pareto_score" />
        <div className={styles.percentRow}>
          <label htmlFor="pareto_percent">% přispění k cíli dne:</label>
          <input id="pareto_percent" type="number" min="0" max="100" placeholder="0"
            value={form.pareto_percent} onChange={(e) => set('pareto_percent', e.target.value)} />
          <span className={styles.unit}>%</span>
        </div>
        <label className={styles.noteLabel}>Poznámka</label>
        <textarea className={styles.textarea} placeholder="Volitelně"
          value={form.pareto_note} onChange={(e) => set('pareto_note', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>3/8</span><span className={styles.qTitle}>Parkinsonův zákon</span></div>
        <div className={styles.qDesc}>Šlo to rychleji? Byla jsi ve flow?</div>
        <SliderField label="Skóre 1–10:" value={form.parkinson_score} onChange={(v) => set('parkinson_score', v)} name="parkinson_score" />
        <label className={styles.noteLabel}>Poznámka</label>
        <textarea className={styles.textarea} placeholder="Volitelně"
          value={form.parkinson_note} onChange={(e) => set('parkinson_note', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>4/8</span><span className={styles.qTitle}>Žrouti času</span></div>
        <div className={styles.qDesc}>Jací žrouti se objevili?</div>
        <textarea className={styles.textarea} placeholder="např. 20 min scroll Instagramu, 2× přerušila mě kolegyně…"
          value={form.zrouti} onChange={(e) => set('zrouti', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>5/8</span><span className={styles.qTitle}>Posun k cílům + setup</span></div>
        <div className={styles.qDesc}>Jak moc tě to posunulo? Udělala sis předem vědomé nastavení?</div>
        <SliderField label="Posun (1–10):" value={form.posun_score} onChange={(v) => set('posun_score', v)} name="posun_score" />
        <SliderField label="Setup (1–10):" value={form.setup_score} onChange={(v) => set('setup_score', v)} name="setup_score" />
        <label className={styles.noteLabel}>Poznámka</label>
        <textarea className={styles.textarea} placeholder="Volitelně"
          value={form.posun_note} onChange={(e) => set('posun_note', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>6/8</span><span className={styles.qTitle}>Focus – jasný blok</span></div>
        <div className={styles.qDesc}>Šla jsi v jednom bloku za jedním cílem?</div>
        <SliderField label="Skóre 1–10:" value={form.focus_score} onChange={(v) => set('focus_score', v)} name="focus_score" />
        <label className={styles.noteLabel}>Poznámka</label>
        <textarea className={styles.textarea} placeholder="Volitelně"
          value={form.focus_note} onChange={(e) => set('focus_note', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>7/8</span><span className={styles.qTitle}>Vědomost vs autopilot</span></div>
        <div className={styles.qDesc}>Jak moc jsi dělala vše vědomě a záměrně?</div>
        <SliderField label="Skóre 1–10:" value={form.vedomost_score} onChange={(v) => set('vedomost_score', v)} name="vedomost_score" />
        <div className={styles.percentRow}>
          <label htmlFor="vedomost_percent">% na autopilotu:</label>
          <input id="vedomost_percent" type="number" min="0" max="100" placeholder="0"
            value={form.vedomost_percent} onChange={(e) => set('vedomost_percent', e.target.value)} />
          <span className={styles.unit}>%</span>
        </div>
        <label className={styles.noteLabel}>Poznámka</label>
        <textarea className={styles.textarea} placeholder="Volitelně"
          value={form.vedomost_note} onChange={(e) => set('vedomost_note', e.target.value)} />
      </div>

      <div className={styles.question}>
        <div className={styles.qHeader}><span className={styles.qNum}>8/8</span><span className={styles.qTitle}>Odolnost vůči vyrušení</span></div>
        <div className={styles.qDesc}>Jak moc ses NEnechala vyrušit?</div>
        <SliderField label="Skóre 1–10:" value={form.vyruseni_score} onChange={(v) => set('vyruseni_score', v)} name="vyruseni_score" />
        <label className={styles.noteLabel}>Poznámka / insight bloku</label>
        <textarea className={styles.textarea} placeholder="Co by šlo v dalším bloku udělat jinak?"
          value={form.vyruseni_note} onChange={(e) => set('vyruseni_note', e.target.value)} />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>Uložit reflexi</button>
      </div>
    </form>
  );
}
