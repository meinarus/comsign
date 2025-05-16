export interface Student {
  id: string;
  studentId: string;
  name: string;
  nfcUid: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewStudent {
  studentId: string;
  name: string;
  nfcUid: string;
  userId: string;
}
