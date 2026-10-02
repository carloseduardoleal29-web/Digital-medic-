export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface Recipe {
  id: string;
  doctorName: string;
  indications: string;
  date: string;
}
