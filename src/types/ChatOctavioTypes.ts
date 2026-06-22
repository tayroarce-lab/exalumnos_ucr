export interface ChatOctavioUser {
  id: string;
  nombre: string;
  email: string | null;
  rol: 'estudiante' | 'exalumno' | 'admin';
  foto_url: string | null;
}

export interface ChatOctavioMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  contenido: string;
  created_at: string;
  leido: boolean;
}

export interface ChatOctavioConversation {
  id: string;
  tipo: 'estudiante_estudiante' | 'exalumno_estudiante';
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  other_user: ChatOctavioUser;
  last_message?: ChatOctavioMessage | null;
}

export interface ChatOctavioRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  updated_at: string;
  other_user: ChatOctavioUser; // En solicitudes recibidas es el sender, en enviadas es el receiver
}
