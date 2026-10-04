export interface Slot {
  id: string;
  profissionalId: string;
  data: string;
  hora: string;
  disponivel: boolean;
}
export interface Appointment {
  id: string;
  pacienteId: string;
  profissionalId: string;
  horarioId: string;
  data: string;
  hora: string;
  valor: number;
  status: "agendado" | "cancelado" | "concluido";
}
export interface Address {
  id: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  tipo: string;
}
export interface Patient {
  nome: string;
  email: string;
  cpf: string;
  nascimento: string;
  celular: string;
}
export interface Profile {
  patient: Patient;
  addresses: Address[];
  notifications: Record<string, boolean>;
  textSize: "normal" | "large";
  signedOut: boolean;
}
