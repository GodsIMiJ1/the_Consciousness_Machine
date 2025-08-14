import InvocationChamber from './components/InvocationChamber';
import './index.css';

function App() {
  return (
    <div className="App">
      {/* Tailwind smoke test - remove after confirming styles work */}
      <div className="p-6 bg-orange-600 text-black rounded-xl mb-4 text-center">
        🔥 Tailwind alive - Chamber styles loading
      </div>
      <InvocationChamber />
    </div>
  );
}

export default App;
