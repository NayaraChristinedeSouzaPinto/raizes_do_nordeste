import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export function LgpdBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Exibe o banner apenas se o cliente ainda não tomou uma decisão
    const lgpdConsent = localStorage.getItem('raizes_lgpd_consent');
    if (lgpdConsent === null) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('raizes_lgpd_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('raizes_lgpd_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-5 bg-amber-950/95 backdrop-blur-md border-t border-amber-800 text-amber-100 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-900 p-2.5 rounded-2xl text-amber-400 mt-0.5 shrink-0 shadow-inner">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm md:text-base">
              Privacidade e Proteção de Dados (LGPD) 
            </h3>
            <p className="text-xs md:text-sm text-amber-200/90 leading-relaxed">
              A <strong>Raízes do Nordeste</strong> utiliza cookies e dados pessoais estritamente para melhorar sua experiência de atendimento, gerenciar seu programa de fidelidade e processar seus pedidos com segurança, em total conformidade com a Lei Geral de Proteção de Dados.
            </p>
          </div>
        </div>

        {/* Botões Aceitar / Recusar */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={handleDecline}
            className="w-1/2 md:w-auto px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium text-amber-200 hover:text-white hover:bg-amber-900/60 border border-amber-800/80 transition-all cursor-pointer"
          >
            Apenas Essenciais
          </button>
          
          <button
            onClick={handleAccept}
            className="w-1/2 md:w-auto bg-amber-700 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs md:text-sm transition-all shadow-md cursor-pointer border border-amber-600"
          >
            Concordar e Continuar
          </button>
        </div>

      </div>
    </div>
  );
}