export interface Professional {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  price: number;
  distance: number;
  rating: number;
  initials: string;
  photoUrl?: string;
  crm?: string;
  address?: string;
}
// Dados fictícios para revisão da interface; sem conexão com a API.
export const professionals: Professional[] = [
  {
    id: "julia",
    name: "Dra. Júlia Santos",
    specialty: "Ortopedia",
    clinic: "Centro Médico Paulista",
    price: 150,
    distance: 1.2,
    rating: 4.7,
    initials: "JS",
  },
  {
    id: "ana",
    name: "Dra. Ana Lima",
    specialty: "Cardiologia",
    clinic: "Instituto São Paulo",
    price: 180,
    distance: 2,
    rating: 4.9,
    initials: "AL",
  },
  {
    id: "maria",
    name: "Dra. Maria Costa",
    specialty: "Neurologia",
    clinic: "NeuroCentro",
    price: 160,
    distance: 2.8,
    rating: 4.3,
    initials: "MC",
  },
  {
    id: "mario",
    name: "Dr. Mário Souza",
    specialty: "Cardiologia",
    clinic: "Instituto Cardio",
    price: 200,
    distance: 1.5,
    rating: 4.7,
    initials: "MS",
  },
  {
    id: "carlos",
    name: "Dr. Carlos Mendes",
    specialty: "Neurologia",
    clinic: "Clínica Vida Nova",
    price: 190,
    distance: 3,
    rating: 4.6,
    initials: "CM",
  },
  {
    id: "renata",
    name: "Dra. Renata Oliveira",
    specialty: "Pediatria",
    clinic: "Clínica Aurora",
    price: 170,
    distance: 3.5,
    rating: 4.8,
    initials: "RO",
  },
];
export const specialties = [
  "Cardiologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Dermatologia",
  "Psiquiatria",
];
export const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
export const professionalDetails: Record<
  string,
  { crm: string; address: string; bio: string }
> = {
  ana: {
    crm: "CRM-SP 142.318",
    address: "Av. Paulista, 1200 — Bela Vista, São Paulo",
    bio: "Cardiologista com 18 anos de experiência em prevenção e tratamento de doenças do coração. Atende adultos e idosos, com atenção especial a pressão alta, arritmias e check-ups completos. Explica cada exame com calma e linguagem simples.",
  },
  mario: {
    crm: "CRM não informado",
    address: "R. Haddock Lobo, 15 — Cerqueira César, São Paulo",
    bio: "Consulte a clínica para mais informações sobre o atendimento.",
  },
  julia: {
    crm: "CRM não informado",
    address: "São Paulo, SP",
    bio: "Consulte a clínica para mais informações sobre o atendimento.",
  },
  maria: {
    crm: "CRM não informado",
    address: "São Paulo, SP",
    bio: "Consulte a clínica para mais informações sobre o atendimento.",
  },
  carlos: {
    crm: "CRM não informado",
    address: "Rua Augusta, 2240 — Jardins, São Paulo",
    bio: "Consulte a clínica para mais informações sobre o atendimento.",
  },
  renata: {
    crm: "CRM não informado",
    address: "São Paulo, SP",
    bio: "Consulte a clínica para mais informações sobre o atendimento.",
  },
};
