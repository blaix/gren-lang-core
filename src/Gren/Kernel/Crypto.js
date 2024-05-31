/*

import Gren.Kernel.Scheduler exposing (binding, succeed, fail)
import Gren.Kernel.Bytes exposing (writeBytes)
import Crypto exposing (DeriveHmacKeyUnknownError, ImportRsaKeyError, ImportHmacKeyError, ImportEcKeyError, ImportAesKeyError, Key, SecureContext, PublicKey, PrivateKey)
import Maybe exposing (Just, Nothing)
import Bytes exposing (Bytes)

*/

var crypto = function () {
    if (typeof window === 'undefined') {
        return require('crypto');
    }
    return window.crypto;
}();

var _Crypto_constructKey = function (key) {
    return __Crypto_Key({
        __$key: key,
        __$extractable: key.__$extractable
    });
};

var _Crypto_randomUUID = __Scheduler_binding(function (callback) {
    var randomUUID = crypto.randomUUID();
    return callback(__Scheduler_succeed(randomUUID));
});

var _Crypto_getRandomValues = F2(function (arrayLength, valueType) {
    var array;
    switch (valueType) {
        case "int8":
            array = new Int8Array(arrayLength);
            break;
        case "uint8":
            array = new Uint8Array(arrayLength);
            break;
        case "int16":
            array = new Int16Array(arrayLength);
            break;
        case "uint16":
            array = new Uint16Array(arrayLength);
            break;
        case "int32":
            array = new Int32Array(arrayLength);
            break;
        case "uint32":
            array = new Uint32Array(arrayLength);
            break;
        default:
            array = new Int8Array(0);
            break;
    }
    try {
        var randomValues = crypto.getRandomValues(array);
    } catch (err) {
        console.log("err", err);
    }
    return __Scheduler_binding(function (callback) {
        return callback(__Scheduler_succeed(randomValues));
    })
});

var _Crypto_getContext = __Scheduler_binding(function (callback) {
    if (crypto.subtle) {
        return callback(__Scheduler_succeed(__Crypto_SecureContext));
    }
    return callback(__Scheduler_fail);
});

// Keys
var _Crypto_generateRsaKey = F6(function (name, modulusLength, publicExponent, hash, extractable, permissions) {
    var algorithm = {
        name: name,
        modulusLength: modulusLength,
        publicExponent: new Uint8Array(publicExponent),
        hash: hash
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .generateKey(algorithm, extractable, permissions)
            .then(function (key) {
                return callback(__Scheduler_succeed(
                    {
                        __$publicKey: __Crypto_PublicKey(_Crypto_constructKey(key.publicKey)),
                        __$privateKey: __Crypto_PrivateKey(_Crypto_constructKey(key.privateKey))
                    }
                ))
            });
    });
});

var _Crypto_generateAesKey = F4(function (name, length, extractable, permissions) {
    var algorithm = {
        name: name,
        length: length
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .generateKey(algorithm, extractable, permissions)
            .then(function (key) {
                return callback(__Scheduler_succeed(_Crypto_constructKey(key)))
            });
    });
});

var _Crypto_generateEcKey = F4(function (name, namedCurve, extractable, permissions) {
    var algorithm = {
        name: name,
        namedCurve: namedCurve
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .generateKey(algorithm, extractable, permissions)
            .then(function (key) {
                return callback(__Scheduler_succeed(
                    {
                        __$publicKey: __Crypto_PublicKey(_Crypto_constructKey(key.publicKey)),
                        __$privateKey: __Crypto_PrivateKey(_Crypto_constructKey(key.privateKey))
                    }
                ))
            })
    })
});

var _Crypto_generateHmacKey = F5(function (name, hash, length, extractable, permissions) {
    var algorithm;
    if (length == "") {
        algorithm = {
            name: name,
            hash: hash
        }
    } else {
        algorithm = {
            name: name,
            hash: hash,
            length: length
        }
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .generateKey(algorithm, extractable, permissions)
            .then(function (key) {
                return callback(__Scheduler_succeed(_Crypto_constructKey(key)))
            })
    });
});

var _Crypto_exportKey = F2(function (format, key) {
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .exportKey(format, key)
            .then(function (res) {
                switch (format) {
                    case "jwk":
                        return callback(__Scheduler_succeed(res));

                    default:
                        return callback(__Scheduler_succeed(new DataView(res)));
                };
            });
    });
});

var _Crypto_importRsaKey = F7(function (wrapper, format, keyData, algorithm, hash, extractable, keyUsages) {
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .importKey(format, keyData, { name: algorithm, hash: hash }, extractable, keyUsages)
            .then(function (key) {
                switch (wrapper) {
                    case "public":
                        return callback(__Scheduler_succeed(__Crypto_PublicKey(_Crypto_constructKey(key))))
                    case "private":
                        return callback(__Scheduler_succeed(__Crypto_PrivateKey(_Crypto_constructKey(key))))
                    default:
                        return callback(__Scheduler_fail(__Crypto_ImportRsaKeyError));
                }
            })
            .catch(function (err) {
                return callback(__Scheduler_fail(__Crypto_ImportRsaKeyError));
            })
    })
});

var _Crypto_importAesKey = F5(function (format, keyData, algorithm, extractable, keyUsages) {
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .importKey(format, keyData, { name: algorithm }, extractable, keyUsages)
            .then(function (key) {
                return callback(__Scheduler_succeed(_Crypto_constructKey(key)))
            })
            .catch(function (err) {
                console.log(err);
                return callback(__Scheduler_fail(__Crypto_ImportAesKeyError));
            });
    });
});

var _Crypto_importEcKey = F7(function (wrapper, format, keyData, algorithm, namedCurve, extractable, keyUsages) {
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .importKey(
                format,
                keyData,
                {
                    name: algorithm,
                    namedCurve: namedCurve
                },
                extractable,
                keyUsages)
            .then(function (key) {
                switch (wrapper) {
                    case "public":
                        return callback(__Scheduler_succeed(__Crypto_PublicKey(_Crypto_constructKey(key))))
                    case "private":
                        return callback(__Scheduler_succeed(__Crypto_PrivateKey(_Crypto_constructKey(key))))
                    default:
                        return callback(__Scheduler_fail(__Crypto_ImportEcKeyError));
                }
            })
            .catch(function (err) {
                return callback(__Scheduler_fail(__Crypto_ImportEcKeyError));
            })
    });
});

var _Crypto_importHmacKey = F7(function (format, keyData, algorithm, hash, length, extractable, keyUsages) {
    var algorithm;
    if (length == "") {
        algorithm = {
            name: algorithm,
            hash: hash
        }
    } else {
        algorithm = {
            name: algorithm,
            hash: hash,
            length: length
        }
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .importKey(format, keyData, algorithm, extractable, keyUsages)
            .then(function (key) {
                return callback(__Scheduler_succeed(_Crypto_constructKey(key)))
            })
            .catch(function (err) {
                return callback(__Scheduler_fail(__Crypto_ImportHmacKeyError));
            })
    });
});

var _Crypto_deriveHmacKeyUsingEcdh = F6(function (publicKey, ecdhPrivateKey, hash, length, extractable, keyUsages) {
    var algorithm;
    if (length == "") {
        algorithm = {
            name: "HMAC",
            hash: hash
        }
    } else {
        algorithm = {
            name: "HMAC",
            hash: hash,
            length: length
        }
    }
    return __Scheduler_binding(function (callback) {
        crypto.subtle
            .deriveKey(
                {
                    name: "ECDH",
                    public: publicKey
                },
                ecdhPrivateKey,
                algorithm,
                extractable,
                keyUsages
            )
            .then(function (key) {
                return callback(__Scheduler_succeed(_Crypto_constructKey(key)))
            })
            .catch(function (err) {
                return callback(__Scheduler_fail(__Crypto_DeriveHmacKeyUnknownError))
            })
    });
});
