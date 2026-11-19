import type { Evidence, MissionId } from "./types";

const connection = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open("cybermission120-evidence", 1);
  request.onupgradeneeded = () => {
    const files = request.result.createObjectStore("files", { keyPath: "id" });
    files.createIndex("mission", "mission");
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error("Close other CyberMission tabs and try again."));
});

async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await connection();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction("files", mode);
      const request = operation(transaction.objectStore("files"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? new Error("The file operation could not be saved."));
    });
  } finally { db.close(); }
}

export const getEvidence = (mission: MissionId) =>
  transact<Evidence[]>("readonly", store => store.index("mission").getAll(mission));
export const saveEvidence = (file: Evidence) => transact("readwrite", store => store.add(file));
export const deleteEvidence = (id: string) => transact("readwrite", store => store.delete(id));
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
