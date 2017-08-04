define(['crypto', 'constant', 'lodash'], function(CryptoJS, constant, _) {
    var iv = CryptoJS.enc.Utf8.parse('0000000000000000');
    var encryptObj = {
        //crypto加密js库的加密方法   同步后台解密方法
        aesEncrypt: function(word, key) {
            var aeskey = CryptoJS.enc.Utf8.parse(key);
            //return CryptoJS.AES.encrypt(word, key).toString();
            var srcs = CryptoJS.enc.Utf8.parse(word);
            var encrypt = CryptoJS.AES.encrypt(srcs, aeskey, { iv: iv });
            return encrypt.ciphertext.toString().toUpperCase();
        },
        //crypto加密js库的解密方法   同步后台加密方法
        aesDecrypt: function(word, key) {
            var aeskey = CryptoJS.enc.Utf8.parse(key);
            //return CryptoJS.AES.decrypt(word, key).toString(CryptoJS.enc.Utf8);
            var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
            var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
            var decrypt = CryptoJS.AES.decrypt(srcs, aeskey, { iv: iv });
            return CryptoJS.enc.Utf8.stringify(decrypt).toString();
        },
        //crypto加密js库的签名方法
        crypto_hmacMd5: function(word) {
            return CryptoJS.MD5(word).toString();
        }
    };
    return {
        //签名方法（只签名需要签名的字段）
        hmacMd5: function(params, timestamp) {
            var data = _.clone(params, true);
            var macArr = [];
            var timestamp = timestamp ? timestamp : new Date().getTime();
            for (var key in data) {
                if (!_.isObject(data[key]) && !_.isUndefined(data[key]) && data[key] !== "" && !_.isNaN(data[key])) {
                    macArr.push({ name: key, value: data[key] });
                }
            }
            macArr.sort(function(x, y) { //对fields排序
                return x.name.localeCompare(y.name);
            });
            console.log(JSON.stringify(macArr));
            var str = "";
            _.forEach(macArr, function(item) {
                str += item.value + "|";
            })
            str = str + timestamp;
            console.log("签名明文:", str);
            var str = encryptObj.crypto_hmacMd5(str);
            console.log("加密后的签名:", str);
            return {
                timestamp: timestamp,
                macStr: str
            };
        },
        //加密方法（只加密需要加密的字段）
        encrypt: function(data, aeskey) {
            function encryptRecurrence(data, aeskey) {
                for (var key in data) {
                    if (_.isObject(data[key]) || _.isArray(data[key])) {
                        encryptRecurrence(data[key], aeskey);
                    } else {
                        constant.ENCODE_WORDS.forEach(function(value) {
                            if (value === key) {
                                data[key] = encryptObj.aesEncrypt(data[key], aeskey);
                            }
                        });
                    }
                }
                return data;
            }

            return encryptRecurrence(data, aeskey);
        },
        //解密方法（只解密需要解密的字段）
        decrypt: function(data, aeskey) {
            function decryRecurrence(data, aeskey) {
                for (var key in data) {
                    if (_.isObject(data[key]) || _.isArray(data[key])) {
                        decryRecurrence(data[key], aeskey);
                    } else {
                        constant.ENCODE_WORDS.forEach(function(v2) {
                            if (v2 === key) {
                                data[key] = encryptObj.aesDecrypt(data[key], aeskey);
                            }
                        });
                    }
                }
                return data;
            }

            return decryRecurrence(data, aeskey);
        }
    }
});
