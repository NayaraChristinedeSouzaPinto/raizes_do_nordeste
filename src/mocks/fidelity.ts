export interface FidelityTransaction {
  id: string;
  title: string;
  date: string;
  points: string;
  type: 'earned' | 'redeemed';
}

export const FIDELITY_HISTORY_MOCK: FidelityTransaction[] = [
  {
    id: '1',
    title: 'Pedido #8902 - Unidade Recife',
    date: '01/11/2026',
    points: '+5 pts',
    type: 'earned',
  },
  {
    id: '2',
    title: 'Resgate Fidelidade',
    date: '01/11/2026',
    points: '-10 pts',
    type: 'redeemed',
  },
  {
    id: '3',
    title: 'Pedido #8140 - Unidade Olinda',
    date: '28/10/2026',
    points: '+6 pts',
    type: 'earned',
  },
  {
    id: '4',
    title: 'Pedido #8088 - Unidade São Paulo',
    date: '15/10/2026',
    points: '+4 pts',
    type: 'earned',
  },
];