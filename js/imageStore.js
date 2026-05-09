/**
 * Aestyve — imageStore.js
 * IndexedDB 기반 카탈로그 이미지 저장소
 * localStorage 5MB 한도 우회 — IndexedDB는 수백MB 가능
 */

const ImageStore = (() => {
  const DB_NAME    = 'aestyve_imgdb';
  const DB_VERSION = 1;
  const STORE_NAME = 'detail_images'; // key: productId, value: string[]

  let _db = null;

  function _open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME); // keyPath 없이 수동 key 사용
        }
      };
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror   = e => reject(e.target.error);
    });
  }

  /** 특정 productId의 이미지 배열 읽기 → string[] */
  function get(productId) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(productId);
      req.onsuccess = e => resolve(e.target.result || []);
      req.onerror   = e => reject(e.target.error);
    }));
  }

  /** 전체 맵 읽기 → { [productId]: string[] } */
  function getAll() {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx     = db.transaction(STORE_NAME, 'readonly');
      const store  = tx.objectStore(STORE_NAME);
      const result = {};
      const keysReq = store.getAllKeys();
      keysReq.onsuccess = e => {
        const keys = e.target.result;
        if (!keys.length) { resolve(result); return; }
        let done = 0;
        keys.forEach(key => {
          const vReq = store.get(key);
          vReq.onsuccess = ev => {
            result[key] = ev.target.result || [];
            if (++done === keys.length) resolve(result);
          };
          vReq.onerror = () => { if (++done === keys.length) resolve(result); };
        });
      };
      keysReq.onerror = e => reject(e.target.error);
    }));
  }

  /** productId에 이미지 배열 저장 (빈 배열이면 키 삭제) */
  function set(productId, images) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req   = images && images.length
        ? store.put(images, productId)
        : store.delete(productId);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    }));
  }

  /** 여러 제품 한꺼번에 저장 { [productId]: string[] } */
  function setAll(map) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      Object.entries(map).forEach(([id, imgs]) => {
        if (imgs && imgs.length) store.put(imgs, id);
        else store.delete(id);
      });
      tx.oncomplete = () => resolve();
      tx.onerror    = e => reject(e.target.error);
    }));
  }

  /** 특정 productId 삭제 */
  function remove(productId) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).delete(productId);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    }));
  }

  /* 구 localStorage _dimgs 마이그레이션 (최초 1회) */
  function migrateFromLocalStorage() {
    const OLD_KEY = 'aestyve_content_dimgs';
    try {
      const raw = localStorage.getItem(OLD_KEY);
      if (!raw) return Promise.resolve();
      const map = JSON.parse(raw);
      if (!map || !Object.keys(map).length) return Promise.resolve();
      return setAll(map).then(() => {
        localStorage.removeItem(OLD_KEY);
        console.info('[ImageStore] localStorage _dimgs → IndexedDB 마이그레이션 완료');
      }).catch(e => console.warn('[ImageStore] 마이그레이션 실패', e));
    } catch(e) { return Promise.resolve(); }
  }

  return { get, getAll, set, setAll, remove, migrateFromLocalStorage };
})();
