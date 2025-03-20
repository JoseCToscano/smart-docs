export type Document = {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}; 