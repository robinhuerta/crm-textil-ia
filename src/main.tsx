import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🚀 Iniciando Growth OS...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ No se encontró el elemento #root en el DOM.");
} else {
  console.log("⚛️ Montando aplicación en #root...");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ Renderizado inicial completado.");
  } catch (err) {
    console.error("💥 Error fatal al montar React:", err);
  }
}