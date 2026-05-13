import styles from './Ukoly.module.css';
import { TopNav } from '../shared/components/TopNav/TopNav.jsx';
import { CategoryEditor } from './components/CategoryEditor/CategoryEditor.jsx';
import { ActiveCategoryPicker } from './components/ActiveCategoryPicker/ActiveCategoryPicker.jsx';
import { DefaultMinsPicker } from './components/DefaultMinsPicker/DefaultMinsPicker.jsx';
import { TaskInput } from './components/TaskInput/TaskInput.jsx';
import { TaskList } from './components/TaskList/TaskList.jsx';
import { DictateButton, hasSpeechRecognition } from './components/DictateButton/DictateButton.jsx';
import { OcrImport } from './components/OcrImport/OcrImport.jsx';
import { ExportActions } from './components/ExportActions/ExportActions.jsx';

export function Ukoly() {
  const hasSR = hasSpeechRecognition();
  return (
    <>
      <TopNav active="ukoly" />
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>Úkoly podle kategorií</h1>
        <div className={styles.subtitle}>Přidej úkoly hlasem, fotkou nebo textem</div>
      </header>

      {!hasSR && (
        <div className={styles.noSupport}>
          Tvůj prohlížeč nepodporuje hlasové rozpoznávání (Web Speech API). Použij <b>Chrome</b> na desktopu nebo Androidu. Diktování nebude k dispozici, ale text a fotka fungují normálně.
        </div>
      )}

      <details className={`${styles.card} ${styles.cardDetails}`}>
        <summary>Pojmenovat kategorie</summary>
        <p className={styles.muted}>Můžeš nechat výchozí názvy, nebo si je upravit. Změna se projeví hned ve výběru i v seznamu úkolů.</p>
        <CategoryEditor />
      </details>

      <div className={styles.card}>
        <h2>Aktivní kategorie</h2>
        <p className={styles.muted}>Vyber, do které kategorie půjdou nově přidané úkoly.</p>
        <ActiveCategoryPicker />
      </div>

      <div className={styles.card}>
        <h2>Přidat úkol</h2>
        <DefaultMinsPicker />
        <TaskInput />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <DictateButton />
          <OcrImport />
        </div>
      </div>

      <div className={styles.card}>
        <h2>Úkoly podle kategorií</h2>
        <TaskList />
        <ExportActions />
      </div>

      </div>
    </>
  );
}
