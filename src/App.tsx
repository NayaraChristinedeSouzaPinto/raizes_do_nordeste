import { useState } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PRODUCTS_MOCK } from './mocks/products';
import { CartProvider, useCart } from './context/CartContext';
import { LgpdBanner } from './components/LgpdBanner';
import { AuthProvider } from './context/AuthContext';

export interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'Recebido' | 'Em Preparação' | 'Pronto';
  createdAt: string;
}

function MainContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const { selectedUnit } = useCart();

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'cuscuz', label: 'Cuscuz' },
    { id: 'tapioca', label: 'Tapiocas' },
    { id: 'pratos', label: 'Pratos' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'sobremesas', label: 'Sobremesas' },
  ];

  const filteredProducts = PRODUCTS_MOCK.filter(product => {
    const matchesUnit = !product.availableUnits || product.availableUnits.includes(selectedUnit.id);
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    return matchesUnit && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fcf8f2] text-stone-900 pb-16">
      <section className="bg-amber-950 text-amber-100 py-16 px-4 shadow-md mb-10 border-b-4 border-amber-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-block bg-amber-800 text-amber-200 text-xs md:text-sm font-bold px-4 py-1.5 rounded-full shadow-inner tracking-wide uppercase">
            Culinária Afetiva & Feita na Hora
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Sabor e Tradição em Cada Prato
          </h1>
          <p className="text-amber-200 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed">
            Receitas de família com o verdadeiro tempero do Nordeste.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto pt-2 pb-6 mb-8 px-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer shadow-sm shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-amber-900 text-amber-50 shadow-md ring-2 ring-amber-700'
                  : 'bg-white text-stone-700 hover:bg-amber-100/80 border border-amber-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 shadow-sm max-w-md mx-auto p-8">
            <p className="text-amber-950 font-bold text-lg mb-2">Nenhum produto nesta categoria</p>
            <p className="text-stone-600 text-sm">
              Os itens disponíveis variam conforme a unidade selecionada. Tente outra categoria ou mude de filial no topo da página!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  return (
    <div className="min-h-screen bg-[#fcf8f2] flex flex-col relative">
      <Header 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenTracking={() => setIsTrackingOpen(true)}
        activeOrder={activeOrder}
      />
      <MainContent />
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckoutSuccess={(newOrder) => {
          setActiveOrder(newOrder);
        }}
      />
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={activeOrder}
        onUpdateStatus={(newStatus) => {
          setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }}
      />
      <LgpdBanner />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;