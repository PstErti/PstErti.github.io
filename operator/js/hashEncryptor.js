class HashEncryptor {
    constructor() {
        if (HashEncryptor.instance) {
            return HashEncryptor.instance;
        }
        HashEncryptor.instance = this;
    }

    static getInstance() {
        if (!HashEncryptor.instance) {
            HashEncryptor.instance = new HashEncryptor();
        }
        return HashEncryptor.instance;
    }

    async encrypt(str) {
        // 添加长度验证
        if (str.length < 4) {
            throw new Error('明文长度不能小于4个字符');
        }
        
        const salt = this._generateSalt(str);
        const rounds = this._calculateRounds(str);
        
        const segments = this._splitIntoSegments(str);
        
        const encryptedSegments = await Promise.all(segments.map(async segment => {
            let result = segment;
            for (let i = 0; i < rounds; i++) {
                result = await this._quadrupleHash(result, salt);
            }
            return result;
        }));
        
        return this._combineResults(encryptedSegments);
    }

    _generateSalt(str) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
        let salt = 0;
        
        const charFreq = new Map();
        for(let char of str) {
            charFreq.set(char, (charFreq.get(char) || 0) + 1);
        }
        const entropy = Array.from(charFreq.values()).reduce((acc, freq) => {
            const p = freq / str.length;
            return acc - p * Math.log2(p);
        }, 0);

        for(let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            const prime = primes[i % primes.length];
            salt += char * prime * (i + 1);
            
            if(i > 0) {
                const prevChar = str.charCodeAt(i - 1);
                salt ^= ((prevChar << 5) | (char >>> 3)) + entropy;
            }
        }

        salt = Math.floor(salt * entropy) ^ (str.length * 31);
        
        return salt.toString(16);
    }

    _calculateRounds(str) {
        let feature = 0;
        const uniqueChars = new Set(str).size;
        const complexity = str.length * uniqueChars;
        
        const charTypes = {
            upper: 0,
            lower: 0,
            digit: 0,
            special: 0
        };
        
        for(let char of str) {
            if(/[A-Z]/.test(char)) charTypes.upper++;
            else if(/[a-z]/.test(char)) charTypes.lower++;
            else if(/[0-9]/.test(char)) charTypes.digit++;
            else charTypes.special++;
        }
        
        const distributionScore = Object.values(charTypes).filter(v => v > 0).length;
        
        feature = (complexity * distributionScore) % 17;
        return feature + 16;
    }

    _splitIntoSegments(str) {
        if (str.length <= 4) {
            return [str];  // 对于短字符串，直接作为一个段返回
        }
        const segLen = Math.ceil(str.length / 4);
        const segments = [];
        
        for (let i = 0; i < str.length; i += segLen) {
            const segment = str.slice(i, i + segLen);
            if (segment) {
                segments.push(segment);
            }
        }
        
        return segments;
    }

    async _quadrupleHash(str, salt) {
        let result = await this._sha256(str + salt);
        result = await this._sha512(result + salt);
        result = this._md5(result + salt);
        result = await this._sha256(result + salt);
        return result;
    }

    async _sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async _sha512(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-512', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    _md5(str) {
        const rotateLeft = (x, n) => (x << n) | (x >>> (32 - n));
        
        const toWordArray = (str) => {
            const bytes = new Array(str.length * 2);
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                bytes[i * 2] = char & 0xff;
                bytes[i * 2 + 1] = char >>> 8;
            }
            return bytes;
        };

        const bytesToWords = (bytes) => {
            const words = new Array(bytes.length >> 2);
            for (let i = 0; i < words.length; i++) {
                words[i] = ((bytes[i * 4] & 0xff)) |
                          ((bytes[i * 4 + 1] & 0xff) << 8) |
                          ((bytes[i * 4 + 2] & 0xff) << 16) |
                          ((bytes[i * 4 + 3] & 0xff) << 24);
            }
            return words;
        };

        const wordsToHex = (words) => {
            let hex = '';
            for (let i = 0; i < words.length * 4; i++) {
                const byte = (words[i >> 2] >> ((i % 4) * 8)) & 0xff;
                hex += (byte < 16 ? '0' : '') + byte.toString(16);
            }
            return hex;
        };

        // MD5 主要常量
        const K = new Uint32Array([
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
            0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
            0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
            0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
            0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
            0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
            0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
            0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
            0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ]);

        const S = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        const bytes = toWordArray(str);
        const originalLength = bytes.length * 8;
        
        bytes.push(0x80);
        while ((bytes.length % 64) !== 56) {
            bytes.push(0);
        }
        
        const lenWords = new Array(2);
        lenWords[0] = originalLength & 0xFFFFFFFF;
        lenWords[1] = (originalLength >>> 32) & 0xFFFFFFFF;
        for (let i = 0; i < 8; i++) {
            bytes.push((lenWords[i >> 2] >>> ((i % 4) * 8)) & 0xFF);
        }

        let a0 = 0x67452301;
        let b0 = 0xefcdab89;
        let c0 = 0x98badcfe;
        let d0 = 0x10325476;

        const words = bytesToWords(bytes);
        for (let i = 0; i < words.length; i += 16) {
            let [a, b, c, d] = [a0, b0, c0, d0];

            for (let j = 0; j < 64; j++) {
                let f, g;
                
                if (j < 16) {
                    f = (b & c) | ((~b) & d);
                    g = j;
                } else if (j < 32) {
                    f = (d & b) | ((~d) & c);
                    g = (5 * j + 1) % 16;
                } else if (j < 48) {
                    f = b ^ c ^ d;
                    g = (3 * j + 5) % 16;
                } else {
                    f = c ^ (b | (~d));
                    g = (7 * j) % 16;
                }

                const temp = d;
                d = c;
                c = b;
                b = b + rotateLeft((a + f + K[j] + words[i + g]), S[j]);
                a = temp;
            }

            a0 = (a0 + a) >>> 0;
            b0 = (b0 + b) >>> 0;
            c0 = (c0 + c) >>> 0;
            d0 = (d0 + d) >>> 0;
        }

        return wordsToHex([a0, b0, c0, d0]);
    }

    _combineResults(segments) {
        const targetLength = 64;
        const chunkSize = 16;
        const normalizedSegments = segments.map(segment => {
            return segment.slice(0, chunkSize).padEnd(chunkSize, segment);
        });
        
        let result = '';
        // 对于每个字符位置（0-15）
        for (let pos = 0; pos < chunkSize; pos++) {
            // 从每个段中取出对应位置的字符
            for (let segIndex = 0; segIndex < normalizedSegments.length; segIndex++) {
                if (result.length < targetLength) {
                    result += normalizedSegments[segIndex][pos] || normalizedSegments[0][pos];
                }
            }
        }
        
        // 确保输出长度为64
        return result.padEnd(targetLength, result).slice(0, targetLength);
    }

    async verifyKey(userKey, encryptedKey) {
        try {
            const encryptedUserKey = await this.encrypt(userKey);
            return encryptedUserKey === encryptedKey;
        } catch (error) {
            return false;
        }
    }
}

const hashEncryptor = new HashEncryptor();
Object.freeze(hashEncryptor);

export default hashEncryptor;