export type Project = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  status: string;
  symbol: string;
  variant: 'primary' | 'secondary';
};

export const projects: Project[] = [
  {
    title: 'Este portfólio',
    description: 'Um espaço pessoal rápido e acessível, feito com Astro para reunir projetos, ideias e aprendizados.',
    tags: ['Astro', 'TypeScript', 'Design'],
    href: 'https://github.com/rodrigofpo/rodrigofpo.github.io',
    status: 'Em evolução',
    symbol: 'r.',
    variant: 'primary',
  },
  {
    title: 'Próximo projeto',
    description: 'Um novo case está sendo preparado. Em breve, contexto, processo e resultados por aqui.',
    tags: ['Em breve'],
    href: '#contato',
    status: 'Em construção',
    symbol: '→',
    variant: 'secondary',
  },
];
