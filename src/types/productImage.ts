export interface ReadProductImageVm {
  id: string;
  publicUrl: string;
  role: string;
  status: string;
  sortOrder: number;
}

export interface ProductImagePresignResponseVm {
  uploadUrl: string;
  httpMethod: string;
  headers: Record<string, string> | null;
  objectKey: string;
  publicUrl: string;
  expiresAt: string;
}

export interface ProductImageCommitResponseVm {
  id: string;
  publicUrl: string;
  role: string;
  sortOrder: number;
  message?: string;
}
