import { Deal, Contact, ActNowAction } from '../../types';

export const calculateActNowActions = (deals: Deal[], contacts: Contact[]): ActNowAction[] => {
  const actions: ActNowAction[] = [];

  // 🚨 REGLA 1: Máquinas Detenidas (Urgencia Máxima)
  contacts.forEach(contact => {
    const downMachines = contact.machines.filter(m => m.status === 'down');
    if (downMachines.length > 0) {
      actions.push({
        id: `urgent-${contact.id}`,
        type: 'urgent',
        title: '¡MÁQUINA DETENIDA!',
        description: `El equipo ${downMachines[0].brand} ${downMachines[0].model} de ${contact.companyName} está fuera de servicio.`,
        targetId: contact.id,
        targetName: contact.name,
        score: 95,
        reason: 'Pérdida de producción crítica para el cliente.'
      });
    }
  });

  // 💎 REGLA 2: Oportunidades de Alto Valor (Ventas)
  deals.forEach(deal => {
    if (deal.priority === 'high' && deal.stage !== 'closed_won') {
      actions.push({
        id: `opp-${deal.id}`,
        type: 'opportunity',
        title: 'Cita de Seguimiento Jacquard',
        description: `Trato de alto valor ($${deal.value.toLocaleString()}) esperando respuesta.`,
        targetId: deal.id,
        targetName: deal.customerName,
        score: 85,
        reason: 'Potencial de ingresos alto y señal de interés reciente.'
      });
    }
  });

  // 🚢 REGLA 3: Seguimiento de Logística (Importaciones)
  deals.filter(d => d.stage === 'logistics').forEach(deal => {
    if (deal.logisticsStatus === 'En Aduanas') {
      actions.push({
        id: `follow-${deal.id}`,
        type: 'followup',
        title: 'Liberación de Aduanas',
        description: `Los repuestos para ${deal.customerName} están en puerto. Confirmar liberación.`,
        targetId: deal.id,
        targetName: deal.customerName,
        score: 75,
        reason: 'Paso crítico para cumplir con el tiempo de entrega prometido.'
      });
    }
  });

  // Ordenar por score descendente
  return actions.sort((a, b) => b.score - a.score);
};
