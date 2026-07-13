export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  nationality: string;
  notes: string;
}

export interface Case {
  id: number;
  title: string;
  clientId: number;
  reference: string;
  court: string;
  opponent: string;
  assignedTo: string;
  status: 'Active' | 'Pending' | 'Closed';
  nextHearing: string;
}
