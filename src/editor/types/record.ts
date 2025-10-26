export type RecordType = 'added' | 'updated' | 'removed';

export type Record =
  | { type: 'added'; path: string; value: unknown }
  | { type: 'updated'; path: string; from: unknown; to: unknown }
  | { type: 'removed'; path: string; value: unknown };
