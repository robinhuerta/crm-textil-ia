import React, { useState } from 'react';
import { Layout } from './crm/components/Layout';
import { KanbanBoard } from './crm/components/KanbanBoard';
import { ContactList } from './crm/components/ContactList';
import { ContactDetail } from './crm/components/ContactDetail';
import { LeadCapture } from './crm/components/LeadCapture';
import { DashboardView } from './crm/components/DashboardView';
import { ActivityLogger } from './crm/components/ActivityLogger';
import { InventoryView } from './crm/components/InventoryView';
import { LogisticsView } from './crm/components/LogisticsView';
import { FinanceView } from './crm/components/FinanceView';
import { Contact } from './types';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [loggingActivityFor, setLoggingActivityFor] = useState<string | null>(null);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleConfirmLead = (data: any) => {
    console.log('Lead confirmado por IA:', data);
    alert(`¡Oportunidad creada con IA para ${data.company || data.name}!`);
    setIsCaptureOpen(false);
  };

  const handleLogActivity = (activity: any) => {
    console.log('Actividad registrada:', activity);
    alert(`Actividad de tipo ${activity.type} guardada con éxito.`);
    setLoggingActivityFor(null);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onSetActiveTab={setActiveTab}
      onOpenCapture={() => setIsCaptureOpen(true)}
    >
      <div className="relative h-full">
        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'sales' && (
          <div className="p-8 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Canal de Ventas</h2>
              <p className="text-slate-400 text-sm">Visualiza y gestiona tus oportunidades de negocio en tiempo real.</p>
            </div>
            <div className="h-[calc(100vh-12rem)]">
              <KanbanBoard />
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <ContactList onSelectContact={handleSelectContact} />
        )}

        {activeTab === 'inventory' && <InventoryView />}
        
        {activeTab === 'logistics' && <LogisticsView />}

        {activeTab === 'finance' && <FinanceView />}

        {['settings'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-2xl opacity-20">🏗️</span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-300">Módulo en Construcción</h3>
              <p className="text-sm">Estamos trabajando para habilitar esta sección pronto.</p>
            </div>
          </div>
        )}

        {/* Overlays */}
        <AnimatePresence>
          {selectedContact && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedContact(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250]"
              />
              <ContactDetail 
                contact={selectedContact} 
                onClose={() => setSelectedContact(null)} 
              />
            </>
          )}

          {isCaptureOpen && (
            <LeadCapture 
              onClose={() => setIsCaptureOpen(false)} 
              onConfirm={handleConfirmLead}
            />
          )}

          {loggingActivityFor && (
            <ActivityLogger 
              targetName={loggingActivityFor} 
              onClose={() => setLoggingActivityFor(null)} 
              onLog={handleLogActivity} 
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default App;
