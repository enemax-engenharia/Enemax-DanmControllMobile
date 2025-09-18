export interface InspectionImage {
  uri: string;
  label: string;
  status?: InspectionStatus;
  notInspectedReason?: NotInspectedReason;
  date: string;
}

export type InspectionStatus = 
  | 'Permaneceu Constante'
  | 'Diminuiu'
  | 'Aumentou'
  | 'Nova'
  | 'Não Inspecionado';

export type NotInspectedReason = 
  | 'Impossibilidade de acesso'
  | 'Saúde e Segurança do Trabalho';