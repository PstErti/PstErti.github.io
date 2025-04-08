class AesEncryptor {
  static instance = null;

  constructor() {
    if (AesEncryptor.instance) {
      return AesEncryptor.instance;
    }
    AesEncryptor.instance = this;
  }

  static getInstance() {
    if (!AesEncryptor.instance) {
      AesEncryptor.instance = new AesEncryptor();
    }
    return AesEncryptor.instance;
  }
  // ----------------------------
  // 加密方法（支持多密钥）
  // ----------------------------
  async encryptWithMultipleKeys(plaintext, userKeys) {
    // 类型转换：单密钥转为数组
    if (typeof userKeys === 'string') userKeys = [userKeys];
    
    // 1. 生成随机主密钥（AES-256）和盐
    const masterKey = crypto.getRandomValues(new Uint8Array(32));
    const salt = crypto.getRandomValues(new Uint8Array(16));
  
    // 2. 为每个用户密钥生成 X_i = masterKey XOR PBKDF2(key_i, salt)
    const XList = await Promise.all(
      userKeys.map(async (key) => {
        const derivedKey = await this.deriveKey(key, salt);
        return this.xorBytes(masterKey, derivedKey);
      })
    );
  
    // 3. 用主密钥加密数据（AES-GCM）
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plaintext);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      masterKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encodedText
    );
  
    // 4. 返回加密结果
    return btoa(JSON.stringify({
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      XList: XList.map(x => btoa(String.fromCharCode(...x))),
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv))
    }));
    // return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  }

  // ----------------------------
  // 解密方法（用任意一个密钥）
  // ----------------------------
  async decryptWithAnyKey(encryptedDataBase64, userKey) {
    // 1. 从加密数据中提取参数
    const encryptedData = JSON.parse(atob(encryptedDataBase64));
    const { ciphertext, XList: xListBase64, salt, iv } = encryptedData;
    const ciphertextUint8 = new Uint8Array([...atob(ciphertext)].map(c => c.charCodeAt(0)));
    const saltUint8 = new Uint8Array([...atob(salt)].map(c => c.charCodeAt(0)));
    const ivUint8 = new Uint8Array([...atob(iv)].map(c => c.charCodeAt(0)));
    const XList = xListBase64.map(x => [...atob(x)].map(c => c.charCodeAt(0)));
  
    // 2. 用用户密钥派生 derivedKey
    const derivedKey = await this.deriveKey(userKey, saltUint8);
  
    // 3. 尝试用每个 X_i 恢复主密钥
    for (const X of XList) {
      const XUint8 = new Uint8Array(X);
      const masterKey = this.xorBytes(XUint8, derivedKey);
  
      // 4. 尝试解密
      try {
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          masterKey,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );
        const plaintext = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: ivUint8 },
          cryptoKey,
          ciphertextUint8
        );
        return new TextDecoder().decode(plaintext);
      } catch (e) {
        // 解密失败，尝试下一个 X_i
        continue;
      }
    }
    throw new Error('解密失败：无效的密钥');
  }

  // ----------------------------
  // 辅助方法：PBKDF2 密钥派生
  // ----------------------------
  async deriveKey(password, salt) {
    const passwordBuffer = new TextEncoder().encode(password);
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      importedKey,
      256 // 派生 256 位（32 字节）密钥
    );
    return new Uint8Array(derivedBits);
  }

  // ----------------------------
  // 辅助方法：字节异或（XOR）
  // ----------------------------
  xorBytes(a, b) {
    if (a.length !== b.length) throw new Error('字节长度不一致');
    const result = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  }
}

// 创建单例实例
const aesEncryptor = new AesEncryptor();
Object.freeze(aesEncryptor);

export default aesEncryptor;