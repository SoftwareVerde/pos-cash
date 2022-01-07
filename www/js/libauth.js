(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
global.window.libauth = require('@bitauth/libauth')

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@bitauth/libauth":2}],2:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib/lib"), exports);

},{"./lib/lib":38}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base58-address"), exports);
__exportStar(require("./bech32"), exports);
__exportStar(require("./cash-address"), exports);
__exportStar(require("./locking-bytecode"), exports);

},{"./base58-address":4,"./bech32":5,"./cash-address":6,"./locking-bytecode":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase58Address = exports.decodeBase58AddressFormat = exports.Base58AddressError = exports.encodeBase58Address = exports.encodeBase58AddressFormat = exports.Base58AddressFormatVersion = void 0;
const format_1 = require("../format/format");
/**
 * Base58 version byte values for common Base58Address format versions.
 */
var Base58AddressFormatVersion;
(function (Base58AddressFormatVersion) {
    /**
     * A Pay to Public Key Hash (P2PKH) address – base58 encodes to a leading `1`.
     *
     * Hex: `0x00`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkh"] = 0] = "p2pkh";
    /**
     * A Pay to Script Hash (P2SH) address – base58 encodes to a leading `3`.
     *
     * Hex: `0x05`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2sh"] = 5] = "p2sh";
    /**
     * A private key in Wallet Import Format. For private keys used with
     * uncompressed public keys, the payload is 32 bytes and causes the version
     * to be encoded as a `5`. For private keys used with compressed public keys,
     * a final `0x01` byte is appended to the private key, increasing the payload
     * to 33 bytes, and causing the version to be encoded as a `K` or `L`.
     *
     * Hex: `0x80`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["wif"] = 128] = "wif";
    /**
     * A testnet Pay to Public Key Hash (P2PKH) address – base58 encodes to a
     * leading `m` or `n`.
     *
     * Hex: `0x6f`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkhTestnet"] = 111] = "p2pkhTestnet";
    /**
     * A testnet Pay to Script Hash (P2SH) address – base58 encodes to a leading
     * `2`.
     *
     * Hex: `0xc4`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2shTestnet"] = 196] = "p2shTestnet";
    /**
     * A private key in Wallet Import Format intended for testnet use. For private
     * keys used with uncompressed public keys, the payload is 32 bytes and causes
     * the version to be encoded as a `9`. For private keys used with compressed
     * public keys, a final `0x01` byte is appended to the private key, increasing
     * the payload to 33 bytes, and causing the version to be encoded as a `c`.
     *
     * Hex: `0xef`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["wifTestnet"] = 239] = "wifTestnet";
    /**
     * A Pay to Public Key Hash (P2PKH) address intended for use on the Bitcoin
     * Cash network – base58 encodes to a leading `C`. This version was
     * temporarily used by the Copay project before the CashAddress format was
     * standardized.
     *
     * Hex: `0x1c`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2pkhCopayBCH"] = 28] = "p2pkhCopayBCH";
    /**
     * A Pay to Script Hash (P2SH) address intended for use on the Bitcoin
     * Cash network – base58 encodes to a leading `H`. This version was
     * temporarily used by the Copay project before the CashAddress format was
     * standardized.
     *
     * Hex: `0x28`
     */
    Base58AddressFormatVersion[Base58AddressFormatVersion["p2shCopayBCH"] = 40] = "p2shCopayBCH";
})(Base58AddressFormatVersion = exports.Base58AddressFormatVersion || (exports.Base58AddressFormatVersion = {}));
/**
 * Encode a payload using the Base58Address format, the original address format
 * used by the Satoshi implementation.
 *
 * Note, this method does not enforce error handling via the type system. The
 * returned string will not be a valid Base58Address if `hash` is not exactly 20
 * bytes. If needed, validate the length of `hash` before calling this method.
 *
 * @remarks
 * A Base58Address includes a 1-byte prefix to indicate the address version, a
 * variable-length payload, and a 4-byte checksum:
 *
 * `[version: 1 byte] [payload: variable length] [checksum: 4 bytes]`
 *
 * The checksum is the first 4 bytes of the double-SHA256 hash of the version
 * byte followed by the payload.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param version - the address version byte (see `Base58Version`)
 * @param payload - the Uint8Array payload to encode
 */
exports.encodeBase58AddressFormat = (sha256, version, payload) => {
    const checksumBytes = 4;
    const content = Uint8Array.from([version, ...payload]);
    const checksum = sha256.hash(sha256.hash(content)).slice(0, checksumBytes);
    const bin = format_1.flattenBinArray([content, checksum]);
    return format_1.binToBase58(bin);
};
/**
 * Encode a hash as a Base58Address.
 *
 * Note, this method does not enforce error handling via the type system. The
 * returned string will not be a valid Base58Address if `hash` is not exactly 20
 * bytes. If needed, validate the length of `hash` before calling this method.
 *
 * For other standards which use the Base58Address format but have other version
 * or length requirements, use `encodeCashAddressFormat`.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param type - the type of address to encode: `p2pkh`, `p2sh`,
 * `p2pkh-testnet`, or `p2sh-testnet`
 * @param hash - the 20-byte hash to encode
 * (`RIPEMD160(SHA256(public key or bytecode))`)
 */
exports.encodeBase58Address = (sha256, type, payload) => exports.encodeBase58AddressFormat(sha256, {
    p2pkh: Base58AddressFormatVersion.p2pkh,
    'p2pkh-copay-bch': Base58AddressFormatVersion.p2pkhCopayBCH,
    'p2pkh-testnet': Base58AddressFormatVersion.p2pkhTestnet,
    p2sh: Base58AddressFormatVersion.p2sh,
    'p2sh-copay-bch': Base58AddressFormatVersion.p2shCopayBCH,
    'p2sh-testnet': Base58AddressFormatVersion.p2shTestnet,
}[type], payload);
var Base58AddressError;
(function (Base58AddressError) {
    Base58AddressError["unknownCharacter"] = "Base58Address error: address may only contain valid base58 characters.";
    Base58AddressError["tooShort"] = "Base58Address error: address is too short to be valid.";
    Base58AddressError["invalidChecksum"] = "Base58Address error: address has an invalid checksum.";
    Base58AddressError["unknownAddressVersion"] = "Base58Address error: address uses an unknown address version.";
    Base58AddressError["incorrectLength"] = "Base58Address error: the encoded payload is not the correct length (20 bytes).";
})(Base58AddressError = exports.Base58AddressError || (exports.Base58AddressError = {}));
/**
 * Attempt to decode a Base58Address-formatted string. This is more lenient than
 * `decodeCashAddress`, which also validates the address version.
 *
 * Returns the contents of the address or an error message as a string.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param address - the string to decode as a base58 address
 */
exports.decodeBase58AddressFormat = (sha256, address) => {
    const checksumBytes = 4;
    const bin = format_1.base58ToBin(address);
    if (bin === format_1.BaseConversionError.unknownCharacter) {
        return Base58AddressError.unknownCharacter;
    }
    const minimumBase58AddressLength = 5;
    if (bin.length < minimumBase58AddressLength) {
        return Base58AddressError.tooShort;
    }
    const content = bin.slice(0, -checksumBytes);
    const checksum = bin.slice(-checksumBytes);
    const expectedChecksum = sha256
        .hash(sha256.hash(content))
        .slice(0, checksumBytes);
    if (!checksum.every((value, i) => value === expectedChecksum[i])) {
        return Base58AddressError.invalidChecksum;
    }
    return {
        payload: content.slice(1),
        version: content[0],
    };
};
/**
 * Decode and validate a Base58Address, strictly checking the version and
 * payload length.
 *
 * For other address-like standards which closely follow the Base58Address
 * format (but have alternative version byte requirements), use
 * `decodeBase58AddressFormat`.
 *
 * @remarks
 * Because the Wallet Import Format (WIF) private key serialization format uses
 * the Base58Address format, some libraries allow WIF key decoding via the same
 * method as base58 address decoding. This method strictly accepts only
 * Base58Address types, but WIF keys can be decoded with `decodePrivateKeyWif`.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param address - the string to decode as a base58 address
 */
exports.decodeBase58Address = (sha256, address) => {
    const decoded = exports.decodeBase58AddressFormat(sha256, address);
    if (typeof decoded === 'string')
        return decoded;
    if (![
        Base58AddressFormatVersion.p2pkh,
        Base58AddressFormatVersion.p2sh,
        Base58AddressFormatVersion.p2pkhTestnet,
        Base58AddressFormatVersion.p2shTestnet,
        Base58AddressFormatVersion.p2pkhCopayBCH,
        Base58AddressFormatVersion.p2shCopayBCH,
    ].includes(decoded.version)) {
        return Base58AddressError.unknownAddressVersion;
    }
    const hash160Length = 20;
    if (decoded.payload.length !== hash160Length) {
        return Base58AddressError.incorrectLength;
    }
    return decoded;
};

},{"../format/format":27}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binToBech32Padded = exports.bech32PaddedToBin = exports.Bech32DecodingError = exports.isBech32CharacterSet = exports.decodeBech32 = exports.encodeBech32 = exports.regroupBits = exports.BitRegroupingError = exports.bech32CharacterSetIndex = exports.bech32CharacterSet = void 0;
/**
 * The list of 32 symbols used in Bech32 encoding.
 */
// cspell: disable-next-line
exports.bech32CharacterSet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
/**
 * An object mapping each of the 32 symbols used in Bech32 encoding to their respective index in the character set.
 */
// prettier-ignore
exports.bech32CharacterSetIndex = { q: 0, p: 1, z: 2, r: 3, y: 4, '9': 5, x: 6, '8': 7, g: 8, f: 9, '2': 10, t: 11, v: 12, d: 13, w: 14, '0': 15, s: 16, '3': 17, j: 18, n: 19, '5': 20, '4': 21, k: 22, h: 23, c: 24, e: 25, '6': 26, m: 27, u: 28, a: 29, '7': 30, l: 31 }; // eslint-disable-line sort-keys
var BitRegroupingError;
(function (BitRegroupingError) {
    BitRegroupingError["integerOutOfRange"] = "An integer provided in the source array is out of the range of the specified source word length.";
    BitRegroupingError["hasDisallowedPadding"] = "Encountered padding when padding was disallowed.";
    BitRegroupingError["requiresDisallowedPadding"] = "Encoding requires padding while padding is disallowed.";
})(BitRegroupingError = exports.BitRegroupingError || (exports.BitRegroupingError = {}));
/* eslint-disable functional/no-let, no-bitwise, functional/no-expression-statement, functional/no-conditional-statement, complexity */
/**
 * Given an array of integers, regroup bits from `sourceWordLength` to
 * `resultWordLength`, returning a new array of integers between 0 and
 * toWordLength^2.
 *
 * Note, if `bin` is within the range of `sourceWordLength` and `padding` is
 * `true`, this method will never error.
 *
 * A.K.A. `convertbits`
 *
 * @param bin - an array of numbers representing the bits to regroup. Each item
 * must be a number within the range of `sourceWordLength`
 * @param sourceWordLength - the bit-length of each number in `bin`, e.g. to
 * regroup bits from a `Uint8Array`, use `8` (must be a positive integer)
 * @param resultWordLength - the bit-length of each number in the desired result
 * array, e.g. to regroup bits into 4-bit numbers, use `4` (must be a positive
 * integer)
 * @param allowPadding - whether to allow the use of padding for `bin` values
 * where the provided number of bits cannot be directly mapped to an equivalent
 * result array (remaining bits are filled with `0`), defaults to `true`
 * @privateRemarks
 * Derived from: https://github.com/sipa/bech32
 */
exports.regroupBits = ({ bin, sourceWordLength, resultWordLength, allowPadding = true, }) => {
    let accumulator = 0;
    let bits = 0;
    const result = [];
    const maxResultInt = (1 << resultWordLength) - 1;
    // eslint-disable-next-line functional/no-loop-statement, @typescript-eslint/prefer-for-of, no-plusplus
    for (let p = 0; p < bin.length; ++p) {
        const value = bin[p];
        if (value < 0 || value >> sourceWordLength !== 0) {
            return BitRegroupingError.integerOutOfRange;
        }
        accumulator = (accumulator << sourceWordLength) | value;
        bits += sourceWordLength;
        // eslint-disable-next-line functional/no-loop-statement
        while (bits >= resultWordLength) {
            bits -= resultWordLength;
            // eslint-disable-next-line functional/immutable-data
            result.push((accumulator >> bits) & maxResultInt);
        }
    }
    if (allowPadding) {
        if (bits > 0) {
            // eslint-disable-next-line functional/immutable-data
            result.push((accumulator << (resultWordLength - bits)) & maxResultInt);
        }
    }
    else if (bits >= sourceWordLength) {
        return BitRegroupingError.hasDisallowedPadding;
    }
    else if (((accumulator << (resultWordLength - bits)) & maxResultInt) > 0) {
        return BitRegroupingError.requiresDisallowedPadding;
    }
    return result;
};
/* eslint-enable functional/no-let, no-bitwise, functional/no-expression-statement, functional/no-conditional-statement, complexity */
/**
 * Encode an array of numbers as a base32 string using the Bech32 character set.
 *
 * Note, this method always completes. For a valid result, all items in
 * `base32IntegerArray` must be between `0` and `32`.
 *
 * @param base32IntegerArray - the array of 5-bit integers to encode
 */
exports.encodeBech32 = (base32IntegerArray) => {
    // eslint-disable-next-line functional/no-let
    let result = '';
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < base32IntegerArray.length; i++) {
        // eslint-disable-next-line functional/no-expression-statement
        result += exports.bech32CharacterSet[base32IntegerArray[i]];
    }
    return result;
};
/**
 * Decode a Bech32-encoded string into an array of 5-bit integers.
 *
 * Note, this method always completes. If `validBech32` is not valid bech32,
 * an incorrect result will be returned. If `validBech32` is potentially
 * malformed, check it with `isBech32` before calling this method.
 *
 * @param validBech32 - the bech32-encoded string to decode
 */
exports.decodeBech32 = (validBech32) => {
    const result = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < validBech32.length; i++) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        result.push(exports.bech32CharacterSetIndex[validBech32[i]]);
    }
    return result;
};
const nonBech32Characters = new RegExp(`[^${exports.bech32CharacterSet}]`, 'u');
const base32WordLength = 5;
const base256WordLength = 8;
/**
 * Validate that a string uses only characters from the bech32 character set.
 *
 * @param maybeBech32 - a string to test for valid Bech32 encoding
 */
exports.isBech32CharacterSet = (maybeBech32) => !nonBech32Characters.test(maybeBech32);
var Bech32DecodingError;
(function (Bech32DecodingError) {
    Bech32DecodingError["notBech32CharacterSet"] = "Bech32 decoding error: input contains characters outside of the Bech32 character set.";
})(Bech32DecodingError = exports.Bech32DecodingError || (exports.Bech32DecodingError = {}));
/**
 * Convert a padded bech32-encoded string (without checksum) to a Uint8Array,
 * removing the padding. If the string is not valid Bech32, or if the array of
 * 5-bit integers would require padding to be regrouped into 8-bit bytes, this
 * method returns an error message.
 *
 * This method is the reverse of `binToBech32Padded`.
 *
 * @param bech32Padded - the padded bech32-encoded string to decode
 */
exports.bech32PaddedToBin = (bech32Padded) => {
    const result = exports.isBech32CharacterSet(bech32Padded)
        ? exports.regroupBits({
            allowPadding: false,
            bin: exports.decodeBech32(bech32Padded),
            resultWordLength: base256WordLength,
            sourceWordLength: base32WordLength,
        })
        : Bech32DecodingError.notBech32CharacterSet;
    return typeof result === 'string' ? result : Uint8Array.from(result);
};
/**
 * Convert a Uint8Array to a padded bech32-encoded string (without a checksum),
 * adding padding bits as necessary to convert all bytes to 5-bit integers.
 *
 * This method is the reverse of `bech32PaddedToBin`.
 *
 * @param bytes - the Uint8Array to bech32 encode
 */
exports.binToBech32Padded = (bytes) => exports.encodeBech32(exports.regroupBits({
    bin: bytes,
    resultWordLength: base32WordLength,
    sourceWordLength: base256WordLength,
}));

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptCashAddressFormatErrorCorrection = exports.CashAddressCorrectionError = exports.cashAddressPolynomialToCashAddress = exports.decodeCashAddressFormatWithoutPrefix = exports.decodeCashAddress = exports.decodeCashAddressFormat = exports.CashAddressDecodingError = exports.encodeCashAddress = exports.CashAddressEncodingError = exports.encodeCashAddressFormat = exports.cashAddressChecksumToUint5Array = exports.cashAddressPolynomialModulo = exports.maskCashAddressPrefix = exports.decodeCashAddressVersionByte = exports.CashAddressVersionByteDecodingError = exports.encodeCashAddressVersionByte = exports.CashAddressType = exports.CashAddressVersionByte = exports.cashAddressSizeToBit = exports.cashAddressBitToSize = exports.CashAddressNetworkPrefix = void 0;
const bech32_1 = require("./bech32");
var CashAddressNetworkPrefix;
(function (CashAddressNetworkPrefix) {
    CashAddressNetworkPrefix["mainnet"] = "bitcoincash";
    CashAddressNetworkPrefix["testnet"] = "bchtest";
    CashAddressNetworkPrefix["regtest"] = "bchreg";
})(CashAddressNetworkPrefix = exports.CashAddressNetworkPrefix || (exports.CashAddressNetworkPrefix = {}));
exports.cashAddressBitToSize = {
    0: 160,
    1: 192,
    2: 224,
    3: 256,
    4: 320,
    5: 384,
    6: 448,
    7: 512,
};
exports.cashAddressSizeToBit = {
    160: 0,
    192: 1,
    224: 2,
    256: 3,
    320: 4,
    384: 5,
    448: 6,
    512: 7,
};
/**
 * The CashAddress specification standardizes the format of the version byte:
 * - Most significant bit: reserved, must be `0`
 * - next 4 bits: Address Type
 * - 3 least significant bits: Hash Size
 *
 * Only two Address Type values are currently standardized:
 * - 0 (`0b0000`): P2PKH
 * - 1 (`0b0001`): P2SH
 *
 * While both P2PKH and P2SH addresses always use 160 bit hashes, the
 * CashAddress specification standardizes other sizes for future use (or use by
 * other systems), see `CashAddressSizeBit`.
 *
 * With these constraints, only two version byte values are currently standard.
 */
var CashAddressVersionByte;
(function (CashAddressVersionByte) {
    /**
     * Pay to Public Key Hash (P2PKH): `0b00000000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0000` (P2PKH)
     * - Size bits: `000` (160 bits)
     */
    CashAddressVersionByte[CashAddressVersionByte["P2PKH"] = 0] = "P2PKH";
    /**
     * Pay to Script Hash (P2SH): `0b00001000`
     *
     * - Most significant bit: `0` (reserved)
     * - Address Type bits: `0001` (P2SH)
     * - Size bits: `000` (160 bits)
     */
    CashAddressVersionByte[CashAddressVersionByte["P2SH"] = 8] = "P2SH";
})(CashAddressVersionByte = exports.CashAddressVersionByte || (exports.CashAddressVersionByte = {}));
/**
 * The address types currently defined in the CashAddress specification. See
 * also: `CashAddressVersionByte`.
 */
var CashAddressType;
(function (CashAddressType) {
    /**
     * Pay to Public Key Hash (P2PKH)
     */
    CashAddressType[CashAddressType["P2PKH"] = 0] = "P2PKH";
    /**
     * Pay to Script Hash (P2SH)
     */
    CashAddressType[CashAddressType["P2SH"] = 1] = "P2SH";
})(CashAddressType = exports.CashAddressType || (exports.CashAddressType = {}));
const cashAddressTypeBitShift = 3;
/**
 * Encode a CashAddress version byte for the given address type and hash length.
 * See `CashAddressVersionByte` for more information.
 *
 * The `type` parameter must be a number between `0` and `15`, and `bitLength`
 * must be one of the standardized lengths. To use the contents of a variable,
 * cast it to `CashAddressType` or `CashAddressSize` respectively, e.g.:
 * ```ts
 * const type = 3 as CashAddressType;
 * const size = 160 as CashAddressSize;
 * getCashAddressVersionByte(type, size);
 * ```
 * @param type - the address type of the hash being encoded
 * @param bitLength - the bit length of the hash being encoded
 */
exports.encodeCashAddressVersionByte = (type, bitLength
// eslint-disable-next-line no-bitwise
) => (type << cashAddressTypeBitShift) | exports.cashAddressSizeToBit[bitLength];
const cashAddressReservedBitMask = 0b10000000;
const cashAddressTypeBits = 0b1111;
const cashAddressSizeBits = 0b111;
const empty = 0;
var CashAddressVersionByteDecodingError;
(function (CashAddressVersionByteDecodingError) {
    CashAddressVersionByteDecodingError["reservedBitSet"] = "Reserved bit is set.";
})(CashAddressVersionByteDecodingError = exports.CashAddressVersionByteDecodingError || (exports.CashAddressVersionByteDecodingError = {}));
/**
 * Decode a CashAddress version byte.
 * @param version - the version byte to decode
 */
exports.decodeCashAddressVersionByte = (version) => 
// eslint-disable-next-line no-negated-condition, no-bitwise
(version & cashAddressReservedBitMask) !== empty
    ? CashAddressVersionByteDecodingError.reservedBitSet
    : {
        bitLength: exports.cashAddressBitToSize[
        // eslint-disable-next-line no-bitwise
        (version & cashAddressSizeBits)],
        // eslint-disable-next-line no-bitwise
        type: (version >>> cashAddressTypeBitShift) & cashAddressTypeBits,
    };
/**
 * In ASCII, each pair of upper and lower case characters share the same 5 least
 * significant bits.
 */
const asciiCaseInsensitiveBits = 0b11111;
/**
 * Convert a string into an array of 5-bit numbers, representing the
 * characters in a case-insensitive way.
 * @param prefix - the prefix to mask
 */
exports.maskCashAddressPrefix = (prefix) => {
    const result = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < prefix.length; i++) {
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
        result.push(prefix.charCodeAt(i) & asciiCaseInsensitiveBits);
    }
    return result;
};
// prettier-ignore
const bech32GeneratorMostSignificantByte = [0x98, 0x79, 0xf3, 0xae, 0x1e]; // eslint-disable-line @typescript-eslint/no-magic-numbers
// prettier-ignore
const bech32GeneratorRemainingBytes = [0xf2bc8e61, 0xb76d99e2, 0x3e5fb3c4, 0x2eabe2a8, 0x4f43e470]; // eslint-disable-line @typescript-eslint/no-magic-numbers
/**
 * Perform the CashAddress polynomial modulo operation, which is based on the
 * Bech32 polynomial modulo operation, but the returned checksum is 40 bits,
 * rather than 30.
 *
 * A.K.A. `PolyMod`
 *
 * @remarks
 * Notes from Bitcoin ABC:
 * This function will compute what 8 5-bit values to XOR into the last 8 input
 * values, in order to make the checksum 0. These 8 values are packed together
 * in a single 40-bit integer. The higher bits correspond to earlier values.
 *
 * The input is interpreted as a list of coefficients of a polynomial over F
 * = GF(32), with an implicit 1 in front. If the input is [v0,v1,v2,v3,v4],
 * that polynomial is v(x) = 1*x^5 + v0*x^4 + v1*x^3 + v2*x^2 + v3*x + v4.
 * The implicit 1 guarantees that [v0,v1,v2,...] has a distinct checksum
 * from [0,v0,v1,v2,...].
 *
 * The output is a 40-bit integer whose 5-bit groups are the coefficients of
 * the remainder of v(x) mod g(x), where g(x) is the cashaddr generator, x^8
 * + [19]*x^7 + [3]*x^6 + [25]*x^5 + [11]*x^4 + [25]*x^3 + [3]*x^2 + [19]*x
 * + [1]. g(x) is chosen in such a way that the resulting code is a BCH
 * code, guaranteeing detection of up to 4 errors within a window of 1025
 * characters. Among the various possible BCH codes, one was selected to in
 * fact guarantee detection of up to 5 errors within a window of 160
 * characters and 6 errors within a window of 126 characters. In addition,
 * the code guarantee the detection of a burst of up to 8 errors.
 *
 * Note that the coefficients are elements of GF(32), here represented as
 * decimal numbers between []. In this finite field, addition is just XOR of
 * the corresponding numbers. For example, [27] + [13] = [27 ^ 13] = [22].
 * Multiplication is more complicated, and requires treating the bits of
 * values themselves as coefficients of a polynomial over a smaller field,
 * GF(2), and multiplying those polynomials mod a^5 + a^3 + 1. For example,
 * [5] * [26] = (a^2 + 1) * (a^4 + a^3 + a) = (a^4 + a^3 + a) * a^2 + (a^4 +
 * a^3 + a) = a^6 + a^5 + a^4 + a = a^3 + 1 (mod a^5 + a^3 + 1) = [9].
 *
 * During the course of the loop below, `c` contains the bit-packed
 * coefficients of the polynomial constructed from just the values of v that
 * were processed so far, mod g(x). In the above example, `c` initially
 * corresponds to 1 mod (x), and after processing 2 inputs of v, it
 * corresponds to x^2 + v0*x + v1 mod g(x). As 1 mod g(x) = 1, that is the
 * starting value for `c`.
 *
 * @privateRemarks
 * Derived from the `bitcore-lib-cash` implementation, which does not require
 * BigInt: https://github.com/bitpay/bitcore
 *
 * @param v - Array of 5-bit integers over which the checksum is to be computed
 */
exports.cashAddressPolynomialModulo = (v) => {
    /* eslint-disable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
    let mostSignificantByte = 0;
    let lowerBytes = 1;
    let c = 0;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of, no-plusplus
    for (let j = 0; j < v.length; j++) {
        c = mostSignificantByte >>> 3;
        mostSignificantByte &= 0x07;
        mostSignificantByte <<= 5;
        mostSignificantByte |= lowerBytes >>> 27;
        lowerBytes &= 0x07ffffff;
        lowerBytes <<= 5;
        lowerBytes ^= v[j];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < bech32GeneratorMostSignificantByte.length; ++i) {
            // eslint-disable-next-line functional/no-conditional-statement
            if (c & (1 << i)) {
                mostSignificantByte ^= bech32GeneratorMostSignificantByte[i];
                lowerBytes ^= bech32GeneratorRemainingBytes[i];
            }
        }
    }
    lowerBytes ^= 1;
    // eslint-disable-next-line functional/no-conditional-statement
    if (lowerBytes < 0) {
        lowerBytes ^= 1 << 31;
        lowerBytes += (1 << 30) * 2;
    }
    return mostSignificantByte * (1 << 30) * 4 + lowerBytes;
    /* eslint-enable functional/no-let, functional/no-loop-statement, functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers */
};
const base32WordLength = 5;
const base256WordLength = 8;
/**
 * Convert the checksum returned by `cashAddressPolynomialModulo` to an array of
 * 5-bit positive integers which can be Base32 encoded.
 * @param checksum - a 40 bit checksum returned by `cashAddressPolynomialModulo`
 */
exports.cashAddressChecksumToUint5Array = (checksum) => {
    const result = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < base256WordLength; ++i) {
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, @typescript-eslint/no-magic-numbers, functional/immutable-data
        result.push(checksum & 31);
        // eslint-disable-next-line functional/no-expression-statement, @typescript-eslint/no-magic-numbers, no-param-reassign
        checksum /= 32;
    }
    // eslint-disable-next-line functional/immutable-data
    return result.reverse();
};
const payloadSeparator = 0;
/**
 * Encode a hash as a CashAddress-like string using the CashAddress format.
 *
 * To encode a standard CashAddress, use `encodeCashAddress`.
 *
 * @param prefix - a valid prefix indicating the network for which to encode the
 * address – must be only lowercase letters
 * @param version - a single byte indicating the version of this address
 * @param hash - the hash to encode
 */
exports.encodeCashAddressFormat = (prefix, version, hash) => {
    const checksum40BitPlaceholder = [0, 0, 0, 0, 0, 0, 0, 0];
    const payloadContents = bech32_1.regroupBits({
        bin: Uint8Array.from([version, ...hash]),
        resultWordLength: base32WordLength,
        sourceWordLength: base256WordLength,
    });
    const checksumContents = [
        ...exports.maskCashAddressPrefix(prefix),
        payloadSeparator,
        ...payloadContents,
        ...checksum40BitPlaceholder,
    ];
    const checksum = exports.cashAddressPolynomialModulo(checksumContents);
    const payload = [
        ...payloadContents,
        ...exports.cashAddressChecksumToUint5Array(checksum),
    ];
    return `${prefix}:${bech32_1.encodeBech32(payload)}`;
};
var CashAddressEncodingError;
(function (CashAddressEncodingError) {
    CashAddressEncodingError["unsupportedHashLength"] = "CashAddress encoding error: a hash of this length can not be encoded as a valid CashAddress.";
})(CashAddressEncodingError = exports.CashAddressEncodingError || (exports.CashAddressEncodingError = {}));
const isValidBitLength = (bitLength) => exports.cashAddressSizeToBit[bitLength] !== undefined;
/**
 * Encode a hash as a CashAddress.
 *
 * Note, this method does not enforce error handling via the type system. The
 * returned string may be a `CashAddressEncodingError.unsupportedHashLength`
 * if `hash` is not a valid length. Check the result if the input is potentially
 * malformed.
 *
 * For other address standards which closely follow the CashAddress
 * specification (but have alternative version byte requirements), use
 * `encodeCashAddressFormat`.
 *
 * @param prefix - a valid prefix indicating the network for which to encode the
 * address (usually a `CashAddressNetworkPrefix`) – must be only lowercase
 * letters
 * @param type - the `CashAddressType` to encode in the version byte – usually a
 * `CashAddressType`
 * @param hash - the hash to encode (for P2PKH, the public key hash; for P2SH,
 * the redeeming bytecode hash)
 */
exports.encodeCashAddress = (prefix, type, hash) => {
    const bitLength = hash.length * base256WordLength;
    if (!isValidBitLength(bitLength)) {
        return CashAddressEncodingError.unsupportedHashLength;
    }
    return exports.encodeCashAddressFormat(prefix, exports.encodeCashAddressVersionByte(type, bitLength), hash);
};
var CashAddressDecodingError;
(function (CashAddressDecodingError) {
    CashAddressDecodingError["improperPadding"] = "CashAddress decoding error: the payload is improperly padded.";
    CashAddressDecodingError["invalidCharacters"] = "CashAddress decoding error: the payload contains non-bech32 characters.";
    CashAddressDecodingError["invalidChecksum"] = "CashAddress decoding error: invalid checksum \u2013 please review the address for errors.";
    CashAddressDecodingError["invalidFormat"] = "CashAddress decoding error: CashAddresses should be of the form \"prefix:payload\".";
    CashAddressDecodingError["mismatchedHashLength"] = "CashAddress decoding error: mismatched hash length for specified address version.";
    CashAddressDecodingError["reservedByte"] = "CashAddress decoding error: unknown CashAddress version, reserved byte set.";
})(CashAddressDecodingError = exports.CashAddressDecodingError || (exports.CashAddressDecodingError = {}));
/**
 * Decode and validate a string using the CashAddress format. This is more
 * lenient than `decodeCashAddress`, which also validates the contents of the
 * version byte.
 *
 * Note, this method requires `address` to include a network prefix. To
 * decode a string with an unknown prefix, try
 * `decodeCashAddressFormatWithoutPrefix`.
 *
 * @param address - the CashAddress-like string to decode
 */
// eslint-disable-next-line complexity
exports.decodeCashAddressFormat = (address) => {
    const parts = address.toLowerCase().split(':');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return CashAddressDecodingError.invalidFormat;
    }
    const [prefix, payload] = parts;
    if (!bech32_1.isBech32CharacterSet(payload)) {
        return CashAddressDecodingError.invalidCharacters;
    }
    const decodedPayload = bech32_1.decodeBech32(payload);
    const polynomial = [
        ...exports.maskCashAddressPrefix(prefix),
        payloadSeparator,
        ...decodedPayload,
    ];
    if (exports.cashAddressPolynomialModulo(polynomial) !== 0) {
        return CashAddressDecodingError.invalidChecksum;
    }
    const checksum40BitPlaceholderLength = 8;
    const payloadContents = bech32_1.regroupBits({
        allowPadding: false,
        bin: decodedPayload.slice(0, -checksum40BitPlaceholderLength),
        resultWordLength: base256WordLength,
        sourceWordLength: base32WordLength,
    });
    if (typeof payloadContents === 'string') {
        return CashAddressDecodingError.improperPadding;
    }
    const [version, ...hashContents] = payloadContents;
    const hash = Uint8Array.from(hashContents);
    return { hash, prefix, version };
};
/**
 * Decode and validate a CashAddress, strictly checking the version byte
 * according to the CashAddress specification. This is important for error
 * detection in CashAddresses.
 *
 * For other address-like standards which closely follow the CashAddress
 * specification (but have alternative version byte requirements), use
 * `decodeCashAddressFormat`.
 *
 * Note, this method requires that CashAddresses include a network prefix. To
 * decode an address with an unknown prefix, try
 * `decodeCashAddressFormatWithoutPrefix`.
 *
 * @param address - the CashAddress to decode
 */
exports.decodeCashAddress = (address) => {
    const decoded = exports.decodeCashAddressFormat(address);
    if (typeof decoded === 'string') {
        return decoded;
    }
    const info = exports.decodeCashAddressVersionByte(decoded.version);
    if (info === CashAddressVersionByteDecodingError.reservedBitSet) {
        return CashAddressDecodingError.reservedByte;
    }
    if (decoded.hash.length * base256WordLength !== info.bitLength) {
        return CashAddressDecodingError.mismatchedHashLength;
    }
    return {
        hash: decoded.hash,
        prefix: decoded.prefix,
        type: info.type,
    };
};
/**
 * Attempt to decode and validate a CashAddress against a list of possible
 * prefixes. If the correct prefix is known, use `decodeCashAddress`.
 *
 * @param address - the CashAddress to decode
 * @param possiblePrefixes - the network prefixes to try
 */
// decodeCashAddressWithoutPrefix
exports.decodeCashAddressFormatWithoutPrefix = (address, possiblePrefixes = [
    CashAddressNetworkPrefix.mainnet,
    CashAddressNetworkPrefix.testnet,
    CashAddressNetworkPrefix.regtest,
]) => {
    // eslint-disable-next-line functional/no-loop-statement
    for (const prefix of possiblePrefixes) {
        const attempt = exports.decodeCashAddressFormat(`${prefix}:${address}`);
        if (attempt !== CashAddressDecodingError.invalidChecksum) {
            return attempt;
        }
    }
    return CashAddressDecodingError.invalidChecksum;
};
const asciiLowerCaseStart = 96;
/**
 * Convert a CashAddress polynomial to CashAddress string format.
 *
 * @remarks
 * CashAddress polynomials take the form:
 *
 * `[lowest 5 bits of each prefix character] 0 [payload + checksum]`
 *
 * This method remaps the 5-bit integers in the prefix location to the matching
 * ASCII lowercase characters, replaces the separator with `:`, and then Bech32
 * encodes the remaining payload and checksum.
 *
 * @param polynomial - an array of 5-bit integers representing the terms of a
 * CashAddress polynomial
 */
exports.cashAddressPolynomialToCashAddress = (polynomial) => {
    const separatorPosition = polynomial.indexOf(0);
    const prefix = polynomial
        .slice(0, separatorPosition)
        .map((integer) => String.fromCharCode(asciiLowerCaseStart + integer))
        .join('');
    const contents = bech32_1.encodeBech32(polynomial.slice(separatorPosition + 1));
    return `${prefix}:${contents}`;
};
var CashAddressCorrectionError;
(function (CashAddressCorrectionError) {
    CashAddressCorrectionError["tooManyErrors"] = "This address has more than 2 errors and cannot be corrected.";
})(CashAddressCorrectionError = exports.CashAddressCorrectionError || (exports.CashAddressCorrectionError = {}));
const finiteFieldOrder = 32;
/**
 * Attempt to correct up to 2 errors in a CashAddress. The CashAddress must be
 * properly formed (include a prefix and only contain Bech32 characters).
 *
 * ## **Improper use of this method carries the risk of lost funds.**
 *
 * It is strongly advised that this method only be used under explicit user
 * control. With enough errors, this method is likely to find a plausible
 * correction for any address (but for which no private key exists). This is
 * effectively equivalent to burning the funds.
 *
 * Only 2 substitution errors can be corrected (or a single swap) – deletions
 * and insertions (errors which shift many other characters and change the
 * length of the payload) can never be safely corrected and will produce an
 * error.
 *
 * Errors can be corrected in both the prefix and the payload, but attempting to
 * correct errors in the prefix prior to this method can improve results, e.g.
 * for `bchtest:qq2azmyyv6dtgczexyalqar70q036yund53jvfde0x`, the string
 * `bchtest:qq2azmyyv6dtgczexyalqar70q036yund53jvfdecc` can be corrected, while
 * `typo:qq2azmyyv6dtgczexyalqar70q036yund53jvfdecc` can not.
 *
 * @privateRemarks
 * Derived from: https://github.com/deadalnix/cashaddressed
 *
 * @param address - the CashAddress on which to attempt error correction
 */
// eslint-disable-next-line complexity
exports.attemptCashAddressFormatErrorCorrection = (address) => {
    const parts = address.toLowerCase().split(':');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return CashAddressDecodingError.invalidFormat;
    }
    const [prefix, payload] = parts;
    if (!bech32_1.isBech32CharacterSet(payload)) {
        return CashAddressDecodingError.invalidCharacters;
    }
    const decodedPayload = bech32_1.decodeBech32(payload);
    const polynomial = [...exports.maskCashAddressPrefix(prefix), 0, ...decodedPayload];
    const originalChecksum = exports.cashAddressPolynomialModulo(polynomial);
    if (originalChecksum === 0) {
        return {
            address: exports.cashAddressPolynomialToCashAddress(polynomial),
            corrections: [],
        };
    }
    const syndromes = {};
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let term = 0; term < polynomial.length; term++) {
        // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
        for (let errorVector = 1; errorVector < finiteFieldOrder; errorVector++) {
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[term] ^= errorVector;
            const correct = exports.cashAddressPolynomialModulo(polynomial);
            if (correct === 0) {
                return {
                    address: exports.cashAddressPolynomialToCashAddress(polynomial),
                    corrections: [term],
                };
            }
            // eslint-disable-next-line no-bitwise
            const s0 = (BigInt(correct) ^ BigInt(originalChecksum)).toString();
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            syndromes[s0] = term * finiteFieldOrder + errorVector;
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[term] ^= errorVector;
        }
    }
    // eslint-disable-next-line functional/no-loop-statement
    for (const [s0, pe] of Object.entries(syndromes)) {
        // eslint-disable-next-line no-bitwise
        const s1Location = (BigInt(s0) ^ BigInt(originalChecksum)).toString();
        const s1 = syndromes[s1Location];
        if (s1 !== undefined) {
            const correctionIndex1 = Math.trunc(pe / finiteFieldOrder);
            const correctionIndex2 = Math.trunc(s1 / finiteFieldOrder);
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[correctionIndex1] ^= pe % finiteFieldOrder;
            // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
            polynomial[correctionIndex2] ^= s1 % finiteFieldOrder;
            return {
                address: exports.cashAddressPolynomialToCashAddress(polynomial),
                corrections: [correctionIndex1, correctionIndex2].sort((a, b) => a - b),
            };
        }
    }
    return CashAddressCorrectionError.tooManyErrors;
};

},{"./bech32":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base58AddressToLockingBytecode = exports.lockingBytecodeToBase58Address = exports.cashAddressToLockingBytecode = exports.LockingBytecodeEncodingError = exports.lockingBytecodeToCashAddress = exports.addressContentsToLockingBytecode = exports.lockingBytecodeToAddressContents = exports.AddressType = void 0;
const opcodes_1 = require("../vm/instruction-sets/common/opcodes");
const base58_address_1 = require("./base58-address");
const cash_address_1 = require("./cash-address");
/**
 * The most common address types used on bitcoin and bitcoin-like networks. Each
 * address type represents a commonly used locking bytecode pattern.
 *
 * @remarks
 * Addresses are strings which encode information about the network and
 * `lockingBytecode` to which a transaction output can pay.
 *
 * Several address formats exist – `Base58Address` was the format used by the
 * original satoshi client, and is still in use on several active chains (see
 * `encodeBase58Address`). On Bitcoin Cash, the `CashAddress` standard is most
 * common (See `encodeCashAddress`).
 */
var AddressType;
(function (AddressType) {
    /**
     * Pay to Public Key (P2PK). This address type is uncommon, and primarily
     * occurs in early blocks because the original satoshi implementation mined
     * rewards to P2PK addresses.
     *
     * There are no standardized address formats for representing a P2PK address.
     * Instead, most applications use the `AddressType.p2pkh` format.
     */
    AddressType["p2pk"] = "P2PK";
    /**
     * Pay to Public Key Hash (P2PKH). The most common address type. P2PKH
     * addresses lock funds using a single private key.
     */
    AddressType["p2pkh"] = "P2PKH";
    /**
     * Pay to Script Hash (P2SH). An address type which locks funds to the hash of
     * a script provided in the spending transaction. See BIP13 for details.
     */
    AddressType["p2sh"] = "P2SH";
    /**
     * This `AddressType` represents an address using an unknown or uncommon
     * locking bytecode pattern for which no standardized address formats exist.
     */
    AddressType["unknown"] = "unknown";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
/**
 * Attempt to match a lockingBytecode to a standard address type for use in
 * address encoding. (See `AddressType` for details.)
 *
 * For a locking bytecode matching the Pay to Public Key Hash (P2PKH) pattern,
 * the returned `type` is `AddressType.p2pkh` and `payload` is the `HASH160` of
 * the public key.
 *
 * For a locking bytecode matching the Pay to Script Hash (P2SH) pattern, the
 * returned `type` is `AddressType.p2sh` and `payload` is the `HASH160` of the
 * redeeming bytecode, A.K.A. "redeem script hash".
 *
 * For a locking bytecode matching the Pay to Public Key (P2PK) pattern, the
 * returned `type` is `AddressType.p2pk` and `payload` is the full public key.
 *
 * Any other locking bytecode will return a `type` of `AddressType.unknown` and
 * a payload of the unmodified `bytecode`.
 *
 * @param bytecode - the locking bytecode to match
 */
// eslint-disable-next-line complexity
exports.lockingBytecodeToAddressContents = (bytecode) => {
    const p2pkhLength = 25;
    if (bytecode.length === p2pkhLength &&
        bytecode[0] === opcodes_1.OpcodesCommon.OP_DUP &&
        bytecode[1] === opcodes_1.OpcodesCommon.OP_HASH160 &&
        bytecode[2] === opcodes_1.OpcodesCommon.OP_PUSHBYTES_20 &&
        bytecode[23] === opcodes_1.OpcodesCommon.OP_EQUALVERIFY &&
        bytecode[24] === opcodes_1.OpcodesCommon.OP_CHECKSIG) {
        const start = 3;
        const end = 23;
        return { payload: bytecode.slice(start, end), type: AddressType.p2pkh };
    }
    const p2shLength = 23;
    if (bytecode.length === p2shLength &&
        bytecode[0] === opcodes_1.OpcodesCommon.OP_HASH160 &&
        bytecode[1] === opcodes_1.OpcodesCommon.OP_PUSHBYTES_20 &&
        bytecode[22] === opcodes_1.OpcodesCommon.OP_EQUAL) {
        const start = 2;
        const end = 22;
        return { payload: bytecode.slice(start, end), type: AddressType.p2sh };
    }
    const p2pkUncompressedLength = 67;
    if (bytecode.length === p2pkUncompressedLength &&
        bytecode[0] === opcodes_1.OpcodesCommon.OP_PUSHBYTES_65 &&
        bytecode[66] === opcodes_1.OpcodesCommon.OP_CHECKSIG) {
        const start = 1;
        const end = 66;
        return { payload: bytecode.slice(start, end), type: AddressType.p2pk };
    }
    const p2pkCompressedLength = 35;
    if (bytecode.length === p2pkCompressedLength &&
        bytecode[0] === opcodes_1.OpcodesCommon.OP_PUSHBYTES_33 &&
        bytecode[34] === opcodes_1.OpcodesCommon.OP_CHECKSIG) {
        const start = 1;
        const end = 34;
        return { payload: bytecode.slice(start, end), type: AddressType.p2pk };
    }
    return {
        payload: bytecode.slice(),
        type: AddressType.unknown,
    };
};
/**
 * Get the locking bytecode for a valid `AddressContents` object. See
 * `lockingBytecodeToAddressContents` for details.
 *
 * For `AddressContents` of `type` `AddressType.unknown`, this method returns
 * the `payload` without modification.
 *
 * @param addressContents - the `AddressContents` to encode
 */
exports.addressContentsToLockingBytecode = (addressContents) => {
    if (addressContents.type === AddressType.p2pkh) {
        return Uint8Array.from([
            opcodes_1.OpcodesCommon.OP_DUP,
            opcodes_1.OpcodesCommon.OP_HASH160,
            opcodes_1.OpcodesCommon.OP_PUSHBYTES_20,
            ...addressContents.payload,
            opcodes_1.OpcodesCommon.OP_EQUALVERIFY,
            opcodes_1.OpcodesCommon.OP_CHECKSIG,
        ]);
    }
    if (addressContents.type === AddressType.p2sh) {
        return Uint8Array.from([
            opcodes_1.OpcodesCommon.OP_HASH160,
            opcodes_1.OpcodesCommon.OP_PUSHBYTES_20,
            ...addressContents.payload,
            opcodes_1.OpcodesCommon.OP_EQUAL,
        ]);
    }
    if (addressContents.type === AddressType.p2pk) {
        const compressedPublicKeyLength = 33;
        return addressContents.payload.length === compressedPublicKeyLength
            ? Uint8Array.from([
                opcodes_1.OpcodesCommon.OP_PUSHBYTES_33,
                ...addressContents.payload,
                opcodes_1.OpcodesCommon.OP_CHECKSIG,
            ])
            : Uint8Array.from([
                opcodes_1.OpcodesCommon.OP_PUSHBYTES_65,
                ...addressContents.payload,
                opcodes_1.OpcodesCommon.OP_CHECKSIG,
            ]);
    }
    return addressContents.payload;
};
/**
 * Encode a locking bytecode as a CashAddress given a network prefix.
 *
 * If `bytecode` matches either the P2PKH or P2SH pattern, it is encoded using
 * the proper address type and returned as a valid CashAddress (string).
 *
 * If `bytecode` cannot be encoded as an address (i.e. because the pattern is
 * not standard), the resulting `AddressContents` is returned.
 *
 * @param bytecode - the locking bytecode to encode
 * @param prefix - the network prefix to use, e.g. `bitcoincash`, `bchtest`, or
 * `bchreg`
 */
exports.lockingBytecodeToCashAddress = (bytecode, prefix) => {
    const contents = exports.lockingBytecodeToAddressContents(bytecode);
    if (contents.type === AddressType.p2pkh) {
        return cash_address_1.encodeCashAddress(prefix, cash_address_1.CashAddressType.P2PKH, contents.payload);
    }
    if (contents.type === AddressType.p2sh) {
        return cash_address_1.encodeCashAddress(prefix, cash_address_1.CashAddressType.P2SH, contents.payload);
    }
    return contents;
};
var LockingBytecodeEncodingError;
(function (LockingBytecodeEncodingError) {
    LockingBytecodeEncodingError["unknownCashAddressType"] = "This CashAddress uses an unknown address type.";
})(LockingBytecodeEncodingError = exports.LockingBytecodeEncodingError || (exports.LockingBytecodeEncodingError = {}));
/**
 * Convert a CashAddress to its respective locking bytecode.
 *
 * This method returns the locking bytecode and network prefix. If an error
 * occurs, an error message is returned as a string.
 *
 * @param address - the CashAddress to convert
 */
exports.cashAddressToLockingBytecode = (address) => {
    const decoded = cash_address_1.decodeCashAddress(address);
    if (typeof decoded === 'string')
        return decoded;
    if (decoded.type === cash_address_1.CashAddressType.P2PKH) {
        return {
            bytecode: exports.addressContentsToLockingBytecode({
                payload: decoded.hash,
                type: AddressType.p2pkh,
            }),
            prefix: decoded.prefix,
        };
    }
    if (decoded.type === cash_address_1.CashAddressType.P2SH) {
        return {
            bytecode: exports.addressContentsToLockingBytecode({
                payload: decoded.hash,
                type: AddressType.p2sh,
            }),
            prefix: decoded.prefix,
        };
    }
    return LockingBytecodeEncodingError.unknownCashAddressType;
};
/**
 * Encode a locking bytecode as a Base58Address for a given network.
 *
 * If `bytecode` matches either the P2PKH or P2SH pattern, it is encoded using
 * the proper address type and returned as a valid Base58Address (string).
 *
 * If `bytecode` cannot be encoded as an address (i.e. because the pattern is
 * not standard), the resulting `AddressContents` is returned.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param bytecode - the locking bytecode to encode
 * @param network - the network for which to encode the address (`mainnet` or
 * `testnet`)
 */
exports.lockingBytecodeToBase58Address = (sha256, bytecode, network) => {
    const contents = exports.lockingBytecodeToAddressContents(bytecode);
    if (contents.type === AddressType.p2pkh) {
        return base58_address_1.encodeBase58AddressFormat(sha256, {
            'copay-bch': base58_address_1.Base58AddressFormatVersion.p2pkhCopayBCH,
            mainnet: base58_address_1.Base58AddressFormatVersion.p2pkh,
            testnet: base58_address_1.Base58AddressFormatVersion.p2pkhTestnet,
        }[network], contents.payload);
    }
    if (contents.type === AddressType.p2sh) {
        return base58_address_1.encodeBase58AddressFormat(sha256, {
            'copay-bch': base58_address_1.Base58AddressFormatVersion.p2shCopayBCH,
            mainnet: base58_address_1.Base58AddressFormatVersion.p2sh,
            testnet: base58_address_1.Base58AddressFormatVersion.p2shTestnet,
        }[network], contents.payload);
    }
    return contents;
};
/**
 * Convert a Base58Address to its respective locking bytecode.
 *
 * This method returns the locking bytecode and network version. If an error
 * occurs, an error message is returned as a string.
 *
 * @param address - the CashAddress to convert
 */
exports.base58AddressToLockingBytecode = (sha256, address) => {
    const decoded = base58_address_1.decodeBase58Address(sha256, address);
    if (typeof decoded === 'string')
        return decoded;
    return {
        bytecode: exports.addressContentsToLockingBytecode({
            payload: decoded.payload,
            type: [
                base58_address_1.Base58AddressFormatVersion.p2pkh,
                base58_address_1.Base58AddressFormatVersion.p2pkhCopayBCH,
                base58_address_1.Base58AddressFormatVersion.p2pkhTestnet,
            ].includes(decoded.version)
                ? AddressType.p2pkh
                : AddressType.p2sh,
        }),
        version: decoded.version,
    };
};

},{"../vm/instruction-sets/common/opcodes":83,"./base58-address":4,"./cash-address":6}],8:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./hashes"), exports);
__exportStar(require("./ripemd160/ripemd160.base64"), exports);
__exportStar(require("./secp256k1/secp256k1-wasm"), exports);
__exportStar(require("./sha1/sha1.base64"), exports);
__exportStar(require("./sha256/sha256.base64"), exports);
__exportStar(require("./sha512/sha512.base64"), exports);

},{"./hashes":9,"./ripemd160/ripemd160.base64":10,"./secp256k1/secp256k1-wasm":12,"./sha1/sha1.base64":14,"./sha256/sha256.base64":15,"./sha512/sha512.base64":16}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateRustWasm = void 0;
/* eslint-disable functional/no-conditional-statement, functional/no-let, functional/no-expression-statement, no-underscore-dangle, functional/no-try-statement, @typescript-eslint/no-magic-numbers, max-params, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
/**
 * Note, most of this method is translated and boiled-down from the wasm-pack
 * workflow. Significant changes to wasm-bindgen or wasm-pack build will likely
 * require modifications to this method.
 */
exports.instantiateRustWasm = async (webassemblyBytes, expectedImportModuleName, hashExportName, initExportName, updateExportName, finalExportName) => {
    const wasm = (await WebAssembly.instantiate(webassemblyBytes, {
        [expectedImportModuleName]: {
            /**
             * This would only be called in cases where a `__wbindgen_malloc` failed.
             * Since `__wbindgen_malloc` isn't exposed to consumers, this error
             * can only be encountered if the code below is broken.
             */
            // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
            __wbindgen_throw: /* istanbul ignore next */ (ptr, len) => {
                // eslint-disable-next-line functional/no-throw-statement
                throw new Error(
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                Array.from(getUint8Memory().subarray(ptr, ptr + len))
                    .map((num) => String.fromCharCode(num))
                    .join(''));
            },
        },
    })).instance.exports; // eslint-disable-line @typescript-eslint/no-explicit-any
    let cachedUint8Memory; // eslint-disable-line @typescript-eslint/init-declarations
    let cachedUint32Memory; // eslint-disable-line @typescript-eslint/init-declarations
    let cachedGlobalArgumentPtr; // eslint-disable-line @typescript-eslint/init-declarations
    const globalArgumentPtr = () => {
        if (cachedGlobalArgumentPtr === undefined) {
            cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
        }
        return cachedGlobalArgumentPtr;
    };
    /**
     * Must be hoisted for `__wbindgen_throw`.
     */
    // eslint-disable-next-line func-style
    function getUint8Memory() {
        if (cachedUint8Memory === undefined ||
            cachedUint8Memory.buffer !== wasm.memory.buffer) {
            cachedUint8Memory = new Uint8Array(wasm.memory.buffer);
        }
        return cachedUint8Memory;
    }
    const getUint32Memory = () => {
        if (cachedUint32Memory === undefined ||
            cachedUint32Memory.buffer !== wasm.memory.buffer) {
            cachedUint32Memory = new Uint32Array(wasm.memory.buffer);
        }
        return cachedUint32Memory;
    };
    const passArray8ToWasm = (array) => {
        const ptr = wasm.__wbindgen_malloc(array.length);
        getUint8Memory().set(array, ptr);
        return [ptr, array.length];
    };
    const getArrayU8FromWasm = (ptr, len) => getUint8Memory().subarray(ptr, ptr + len);
    const hash = (input) => {
        const [ptr0, len0] = passArray8ToWasm(input);
        const retPtr = globalArgumentPtr();
        try {
            wasm[hashExportName](retPtr, ptr0, len0);
            const mem = getUint32Memory();
            const ptr = mem[retPtr / 4];
            const len = mem[retPtr / 4 + 1];
            const realRet = getArrayU8FromWasm(ptr, len).slice();
            wasm.__wbindgen_free(ptr, len);
            return realRet;
        }
        finally {
            wasm.__wbindgen_free(ptr0, len0);
        }
    };
    const init = () => {
        const retPtr = globalArgumentPtr();
        wasm[initExportName](retPtr);
        const mem = getUint32Memory();
        const ptr = mem[retPtr / 4];
        const len = mem[retPtr / 4 + 1];
        const realRet = getArrayU8FromWasm(ptr, len).slice();
        wasm.__wbindgen_free(ptr, len);
        return realRet;
    };
    const update = (rawState, input) => {
        const [ptr0, len0] = passArray8ToWasm(rawState);
        const [ptr1, len1] = passArray8ToWasm(input);
        const retPtr = globalArgumentPtr();
        try {
            wasm[updateExportName](retPtr, ptr0, len0, ptr1, len1);
            const mem = getUint32Memory();
            const ptr = mem[retPtr / 4];
            const len = mem[retPtr / 4 + 1];
            const realRet = getArrayU8FromWasm(ptr, len).slice();
            wasm.__wbindgen_free(ptr, len);
            return realRet;
        }
        finally {
            rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
            wasm.__wbindgen_free(ptr0, len0);
            wasm.__wbindgen_free(ptr1, len1);
        }
    };
    const final = (rawState) => {
        const [ptr0, len0] = passArray8ToWasm(rawState);
        const retPtr = globalArgumentPtr();
        try {
            wasm[finalExportName](retPtr, ptr0, len0);
            const mem = getUint32Memory();
            const ptr = mem[retPtr / 4];
            const len = mem[retPtr / 4 + 1];
            const realRet = getArrayU8FromWasm(ptr, len).slice();
            wasm.__wbindgen_free(ptr, len);
            return realRet;
        }
        finally {
            rawState.set(getUint8Memory().subarray(ptr0 / 1, ptr0 / 1 + len0));
            wasm.__wbindgen_free(ptr0, len0);
        }
    };
    return {
        final,
        hash,
        init,
        update,
    };
};
/* eslint-enable functional/no-conditional-statement, functional/no-let, functional/no-expression-statement, no-underscore-dangle, functional/no-try-statement, @typescript-eslint/no-magic-numbers, max-params, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemd160Base64Bytes = void 0;
/* eslint-disable tsdoc/syntax */
/**
 * @hidden
 */
// prettier-ignore
exports.ripemd160Base64Bytes = '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AgQMBQsgAEH8EigCACACaiICQQFyNgIEQYQTIAA2AgBB/BIgAjYCACAAIAJqIAI2AgAMBAsgAxAgDAELQewPQewPKAIAQX4gAUEDdndxNgIACyAEIAJqIQIgAyAEaiEDCyADIAMoAgRBfnE2AgQgACACQQFyNgIEIAAgAmogAjYCAAJ/AkAgAkH/AU0EQCACQQN2IgFBA3RB9A9qIQJB7A8oAgAiA0EBIAFBH3F0IgFxRQ0BIAJBCGohAyACKAIIDAILIAAgAhAhDAILQewPIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAFQQhqDwtBgBMgACACayIBNgIAQYgTQYgTKAIAIgAgAmoiAzYCACADIAFBAXI2AgQgACACQQNyNgIEIABBCGoLpQEBAn9BAiEFAkACQAJAAkACQCAAKAIEIgYgAWsgAk8NACABIAJqIgIgAUkhAQJAIAQEQEEAIQUgAQ0CIAZBAXQiASACIAIgAUkbIQIMAQtBACEFIAENAQsgAkEASA0AIAZFDQEgACgCACACEBMiAUUNAgwDCyAFDwsgAhAEIgENAQsgAw0BCyABBEAgACABNgIAIABBBGogAjYCAEECDwtBAQ8LAAsIAEGMFBAHAAtmAgF/A34jAEEwayIBJAAgACkCECECIAApAgghAyAAKQIAIQQgAUEUakEANgIAIAEgBDcDGCABQgE3AgQgAUH0DDYCECABIAFBGGo2AgAgASADNwMgIAEgAjcDKCABIAFBIGoQJQALuAEBAX8jAEHgAWsiAyQAIANBOGpBzAgoAgA2AgAgA0EwakHECCkCADcDACADQgA3AyAgA0G8CCkCADcDKCADQTxqQQBBxAAQKhogA0EgaiABIAIQCSADQYABaiADQSBqQeAAECgaIANBCGogA0GAAWoQCiADQSBqIANBCGpBFBADIANBiAFqIANBKGooAgA2AgAgAyADKQMgNwOAASADIANBgAFqEAsgACADKQMANwIAIANB4AFqJAALlwMBBH8jAEFAaiIDJAAgACAAKQMAIAKtfDcDACADIABBCGo2AiggAyADQShqNgIsAkACQAJAAkACQAJAIAAoAhwiBQRAQcAAIAVrIgQgAk0NASADQRhqIAUgBSACaiIEIABBIGoQFiADKAIcIAJHDQUgAygCGCABIAIQKBoMAwsgAiEEDAELIANBMGogASACIAQQFyADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQSBqIgYgACgCHBAYIAIgAygCJEcNBCADKAIgIAUgAhAoGiAAQRxqQQA2AgAgA0EsaiAGEBkLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAXIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAaIANBLGogAygCCBAZDAALAAsgA0EQaiAAQSBqIAQQGyADKAIUIARHDQEgAygCECABIAQQKBoLIABBHGogBDYCACADQUBrJAAPC0H0ExAHAAtB9BMQBwALQfQTEAcAC+MCAgR/AX4jAEFAaiICJAAgAiABQQhqIgU2AiQgASkDACEGIAEoAhwhAyACIAJBJGo2AigCQCADQT9NBEAgAUEgaiIEIANqQYABOgAAIAEgASgCHEEBaiIDNgIcIAJBGGogBCADEBggAigCGEEAIAIoAhwQKhpBwAAgASgCHGtBB00EQCACQShqIAQQGSACQRBqIAQgAUEcaigCABAbIAIoAhBBACACKAIUECoaCyACQQhqIARBOBAYIAIoAgxBCEcNASACKAIIIAZCA4Y3AAAgAkEoaiAEEBkgAUEcakEANgIAIAJBADYCKEEEIQECQANAIAFBGEYNASACQShqIAFqQQA6AAAgAiACKAIoQQFqNgIoIAFBAWohAQwACwALIAAgBSkAADcAACAAQRBqIAVBEGooAAA2AAAgAEEIaiAFQQhqKQAANwAAIAJBQGskAA8LQcwTIANBwAAQHQALQdwTEAcAC2MBAn8gASgCACECAkACQCABKAIEIgMgASgCCCIBRgRAIAMhAQwBCyADIAFJDQEgAQRAIAIgARATIgINAQALIAIgAxARQQEhAkEAIQELIAAgATYCBCAAIAI2AgAPC0G0ExAHAAuQAQEBfyMAQYABayIBJAAgAUEwakHECCkCADcDACABQThqQcwIKAIANgIAIAFCADcDICABQbwIKQIANwMoIAFBPGpBAEHEABAqGiABQRBqIAFBIGpB4AAQAyABQShqIAFBGGooAgA2AgAgASABKQMQNwMgIAFBCGogAUEgahALIAAgASkDCDcCACABQYABaiQAC4YB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';

},{}],11:[function(require,module,exports){
"use strict";
// cSpell:ignore noncefp, ndata, outputlen
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionFlag = exports.ContextFlag = void 0;
/**
 * bitflags used in secp256k1's public API (translated from secp256k1.h)
 */
/* eslint-disable no-bitwise, @typescript-eslint/no-magic-numbers */
/** All flags' lower 8 bits indicate what they're for. Do not use directly. */
// const SECP256K1_FLAGS_TYPE_MASK = (1 << 8) - 1;
const SECP256K1_FLAGS_TYPE_CONTEXT = 1 << 0;
const SECP256K1_FLAGS_TYPE_COMPRESSION = 1 << 1;
/** The higher bits contain the actual data. Do not use directly. */
const SECP256K1_FLAGS_BIT_CONTEXT_VERIFY = 1 << 8;
const SECP256K1_FLAGS_BIT_CONTEXT_SIGN = 1 << 9;
const SECP256K1_FLAGS_BIT_COMPRESSION = 1 << 8;
/** Flags to pass to secp256k1_context_create. */
const SECP256K1_CONTEXT_VERIFY = SECP256K1_FLAGS_TYPE_CONTEXT | SECP256K1_FLAGS_BIT_CONTEXT_VERIFY;
const SECP256K1_CONTEXT_SIGN = SECP256K1_FLAGS_TYPE_CONTEXT | SECP256K1_FLAGS_BIT_CONTEXT_SIGN;
const SECP256K1_CONTEXT_NONE = SECP256K1_FLAGS_TYPE_CONTEXT;
/** Flag to pass to secp256k1_ec_pubkey_serialize and secp256k1_ec_privkey_export. */
const SECP256K1_EC_COMPRESSED = SECP256K1_FLAGS_TYPE_COMPRESSION | SECP256K1_FLAGS_BIT_COMPRESSION;
const SECP256K1_EC_UNCOMPRESSED = SECP256K1_FLAGS_TYPE_COMPRESSION;
/**
 * Flag to pass to a Secp256k1.contextCreate method.
 *
 * The purpose of context structures is to cache large precomputed data tables
 * that are expensive to construct, and also to maintain the randomization data
 * for blinding.
 *
 * You can create a context with only VERIFY or only SIGN capabilities, or you
 * can use BOTH. (NONE can be used for conversion/serialization.)
 */
var ContextFlag;
(function (ContextFlag) {
    ContextFlag[ContextFlag["NONE"] = SECP256K1_CONTEXT_NONE] = "NONE";
    ContextFlag[ContextFlag["VERIFY"] = SECP256K1_CONTEXT_VERIFY] = "VERIFY";
    ContextFlag[ContextFlag["SIGN"] = SECP256K1_CONTEXT_SIGN] = "SIGN";
    ContextFlag[ContextFlag["BOTH"] = SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY] = "BOTH";
})(ContextFlag = exports.ContextFlag || (exports.ContextFlag = {}));
/**
 * Flag to pass a Secp256k1 public key serialization method.
 *
 * You can indicate COMPRESSED (33 bytes, header byte 0x02 or 0x03) or
 * UNCOMPRESSED (65 bytes, header byte 0x04) format.
 */
var CompressionFlag;
(function (CompressionFlag) {
    CompressionFlag[CompressionFlag["COMPRESSED"] = SECP256K1_EC_COMPRESSED] = "COMPRESSED";
    CompressionFlag[CompressionFlag["UNCOMPRESSED"] = SECP256K1_EC_UNCOMPRESSED] = "UNCOMPRESSED";
})(CompressionFlag = exports.CompressionFlag || (exports.CompressionFlag = {}));

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateSecp256k1Wasm = exports.getEmbeddedSecp256k1Binary = exports.instantiateSecp256k1WasmBytes = exports.CompressionFlag = exports.ContextFlag = void 0;
/* eslint-disable no-underscore-dangle, max-params, @typescript-eslint/naming-convention */
// cSpell:ignore memcpy, anyfunc
const format_1 = require("../../format/format");
const secp256k1_wasm_types_1 = require("./secp256k1-wasm-types");
Object.defineProperty(exports, "CompressionFlag", { enumerable: true, get: function () { return secp256k1_wasm_types_1.CompressionFlag; } });
Object.defineProperty(exports, "ContextFlag", { enumerable: true, get: function () { return secp256k1_wasm_types_1.ContextFlag; } });
const secp256k1_base64_1 = require("./secp256k1.base64");
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
const wrapSecp256k1Wasm = (instance, heapU8, heapU32) => ({
    contextCreate: (context) => instance.exports._secp256k1_context_create(context),
    contextRandomize: (contextPtr, seedPtr) => instance.exports._secp256k1_context_randomize(contextPtr, seedPtr),
    free: (pointer) => instance.exports._free(pointer),
    heapU32,
    heapU8,
    instance,
    malloc: (bytes) => instance.exports._malloc(bytes),
    mallocSizeT: (num) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const pointer = instance.exports._malloc(4);
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        const pointerView32 = pointer >> 2;
        // eslint-disable-next-line functional/no-expression-statement
        heapU32.set([num], pointerView32);
        return pointer;
    },
    mallocUint8Array: (array) => {
        const pointer = instance.exports._malloc(array.length);
        // eslint-disable-next-line functional/no-expression-statement
        heapU8.set(array, pointer);
        return pointer;
    },
    privkeyTweakAdd: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_add(contextPtr, secretKeyPtr, tweakNum256Ptr),
    privkeyTweakMul: (contextPtr, secretKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_privkey_tweak_mul(contextPtr, secretKeyPtr, tweakNum256Ptr),
    pubkeyCreate: (contextPtr, publicKeyPtr, secretKeyPtr) => instance.exports._secp256k1_ec_pubkey_create(contextPtr, publicKeyPtr, secretKeyPtr),
    pubkeyParse: (contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength) => instance.exports._secp256k1_ec_pubkey_parse(contextPtr, publicKeyOutPtr, publicKeyInPtr, publicKeyInLength),
    pubkeySerialize: (contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression) => instance.exports._secp256k1_ec_pubkey_serialize(contextPtr, outputPtr, outputLengthPtr, publicKeyPtr, compression),
    pubkeyTweakAdd: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_add(contextPtr, publicKeyPtr, tweakNum256Ptr),
    pubkeyTweakMul: (contextPtr, publicKeyPtr, tweakNum256Ptr) => instance.exports._secp256k1_ec_pubkey_tweak_mul(contextPtr, publicKeyPtr, tweakNum256Ptr),
    readHeapU8: (pointer, bytes) => new Uint8Array(heapU8.buffer, pointer, bytes),
    readSizeT: (pointer) => {
        // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
        const pointerView32 = pointer >> 2;
        return heapU32[pointerView32];
    },
    recover: (contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr) => instance.exports._secp256k1_ecdsa_recover(contextPtr, outputPubkeyPointer, rSigPtr, msg32Ptr),
    recoverableSignatureParse: (contextPtr, outputRSigPtr, inputSigPtr, rid) => instance.exports._secp256k1_ecdsa_recoverable_signature_parse_compact(contextPtr, outputRSigPtr, inputSigPtr, rid),
    recoverableSignatureSerialize: (contextPtr, sigOutPtr, recIDOutPtr, rSigPtr) => instance.exports._secp256k1_ecdsa_recoverable_signature_serialize_compact(contextPtr, sigOutPtr, recIDOutPtr, rSigPtr),
    schnorrSign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_schnorr_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
    schnorrVerify: (contextPtr, sigPtr, msg32Ptr, publicKeyPtr) => instance.exports._secp256k1_schnorr_verify(contextPtr, sigPtr, msg32Ptr, publicKeyPtr),
    seckeyVerify: (contextPtr, secretKeyPtr) => instance.exports._secp256k1_ec_seckey_verify(contextPtr, secretKeyPtr),
    sign: (contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign(contextPtr, outputSigPtr, msg32Ptr, secretKeyPtr),
    signRecoverable: (contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr) => instance.exports._secp256k1_ecdsa_sign_recoverable(contextPtr, outputRSigPtr, msg32Ptr, secretKeyPtr),
    signatureMalleate: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_malleate(contextPtr, outputSigPtr, inputSigPtr),
    signatureNormalize: (contextPtr, outputSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_normalize(contextPtr, outputSigPtr, inputSigPtr),
    signatureParseCompact: (contextPtr, sigOutPtr, compactSigInPtr) => instance.exports._secp256k1_ecdsa_signature_parse_compact(contextPtr, sigOutPtr, compactSigInPtr),
    signatureParseDER: (contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength) => instance.exports._secp256k1_ecdsa_signature_parse_der(contextPtr, sigOutPtr, sigDERInPtr, sigDERInLength),
    signatureSerializeCompact: (contextPtr, outputCompactSigPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_compact(contextPtr, outputCompactSigPtr, inputSigPtr),
    signatureSerializeDER: (contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr) => instance.exports._secp256k1_ecdsa_signature_serialize_der(contextPtr, outputDERSigPtr, outputDERSigLengthPtr, inputSigPtr),
    verify: (contextPtr, sigPtr, msg32Ptr, pubkeyPtr) => instance.exports._secp256k1_ecdsa_verify(contextPtr, sigPtr, msg32Ptr, pubkeyPtr),
});
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
/* eslint-disable functional/immutable-data, functional/no-expression-statement, @typescript-eslint/no-magic-numbers, functional/no-conditional-statement, no-bitwise, functional/no-throw-statement */
/**
 * Method extracted from Emscripten's preamble.js
 */
const isLittleEndian = (buffer) => {
    const littleEndian = true;
    const notLittleEndian = false;
    const heap16 = new Int16Array(buffer);
    const heap32 = new Int32Array(buffer);
    const heapU8 = new Uint8Array(buffer);
    heap32[0] = 1668509029;
    heap16[1] = 25459;
    return heapU8[2] !== 115 || heapU8[3] !== 99
        ? /* istanbul ignore next */ notLittleEndian
        : littleEndian;
};
/**
 * Method derived from Emscripten's preamble.js
 */
const alignMemory = (factor, size) => Math.ceil(size / factor) * factor;
/**
 * The most performant way to instantiate secp256k1 functionality. To avoid
 * using Node.js or DOM-specific APIs, you can use `instantiateSecp256k1`.
 *
 * Note, most of this method is translated and boiled-down from Emscripten's
 * preamble.js. Significant changes to the WASM build or breaking updates to
 * Emscripten will likely require modifications to this method.
 *
 * @param webassemblyBytes - A buffer containing the secp256k1 binary.
 */
exports.instantiateSecp256k1WasmBytes = async (webassemblyBytes) => {
    const STACK_ALIGN = 16;
    const GLOBAL_BASE = 1024;
    const WASM_PAGE_SIZE = 65536;
    const TOTAL_STACK = 5242880;
    const TOTAL_MEMORY = 16777216;
    const wasmMemory = new WebAssembly.Memory({
        initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
        maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
    });
    /* istanbul ignore if  */
    if (!isLittleEndian(wasmMemory.buffer)) {
        /*
         * note: this block is excluded from test coverage. It's A) hard to test
         * (must be either tested on big-endian hardware or a big-endian buffer
         * mock) and B) extracted from Emscripten's preamble.js, where it should
         * be tested properly.
         */
        throw new Error('Runtime error: expected the system to be little-endian.');
    }
    const STATIC_BASE = GLOBAL_BASE;
    const STATICTOP_INITIAL = STATIC_BASE + 67696 + 16;
    const DYNAMICTOP_PTR = STATICTOP_INITIAL;
    const DYNAMICTOP_PTR_SIZE = 4;
    const STATICTOP = (STATICTOP_INITIAL + DYNAMICTOP_PTR_SIZE + 15) & -16;
    const STACKTOP = alignMemory(STACK_ALIGN, STATICTOP);
    const STACK_BASE = STACKTOP;
    const STACK_MAX = STACK_BASE + TOTAL_STACK;
    const DYNAMIC_BASE = alignMemory(STACK_ALIGN, STACK_MAX);
    const heapU8 = new Uint8Array(wasmMemory.buffer);
    const heap32 = new Int32Array(wasmMemory.buffer);
    const heapU32 = new Uint32Array(wasmMemory.buffer);
    heap32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    const TABLE_SIZE = 6;
    const MAX_TABLE_SIZE = 6;
    // eslint-disable-next-line functional/no-let, @typescript-eslint/init-declarations
    let getErrNoLocation;
    /*
     * note: A number of methods below are excluded from test coverage. They are
     * a) not part of the regular usage of this library (should only be evaluated
     * if the consumer mis-implements the library and exist only to make
     * debugging easier) and B) already tested adequately in Emscripten, from
     * which this section is extracted.
     */
    const env = {
        DYNAMICTOP_PTR,
        STACKTOP,
        ___setErrNo: /* istanbul ignore next */ (value) => {
            if (getErrNoLocation !== undefined) {
                heap32[getErrNoLocation() >> 2] = value;
            }
            return value;
        },
        _abort: /* istanbul ignore next */ (err = 'Secp256k1 Error') => {
            throw new Error(err);
        },
        // eslint-disable-next-line camelcase
        _emscripten_memcpy_big: /* istanbul ignore next */ (dest, src, num) => {
            heapU8.set(heapU8.subarray(src, src + num), dest);
            return dest;
        },
        abort: /* istanbul ignore next */ (err = 'Secp256k1 Error') => {
            throw new Error(err);
        },
        abortOnCannotGrowMemory: /* istanbul ignore next */ () => {
            throw new Error('Secp256k1 Error: abortOnCannotGrowMemory was called.');
        },
        enlargeMemory: /* istanbul ignore next */ () => {
            throw new Error('Secp256k1 Error: enlargeMemory was called.');
        },
        getTotalMemory: () => TOTAL_MEMORY,
    };
    const info = {
        env: Object.assign(Object.assign({}, env), { memory: wasmMemory, memoryBase: STATIC_BASE, table: new WebAssembly.Table({
                element: 'anyfunc',
                initial: TABLE_SIZE,
                maximum: MAX_TABLE_SIZE,
            }), tableBase: 0 }),
        global: { Infinity, NaN },
    };
    return WebAssembly.instantiate(webassemblyBytes, info).then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        getErrNoLocation = result.instance.exports.___errno_location;
        return wrapSecp256k1Wasm(result.instance, heapU8, heapU32);
    });
};
/* eslint-enable functional/immutable-data, functional/no-expression-statement, @typescript-eslint/no-magic-numbers, functional/no-conditional-statement, no-bitwise, functional/no-throw-statement */
exports.getEmbeddedSecp256k1Binary = () => format_1.base64ToBin(secp256k1_base64_1.secp256k1Base64Bytes).buffer;
/**
 * An ultimately-portable (but slower) version of `instantiateSecp256k1Bytes`
 * which does not require the consumer to provide the secp256k1 binary buffer.
 */
exports.instantiateSecp256k1Wasm = async () => exports.instantiateSecp256k1WasmBytes(exports.getEmbeddedSecp256k1Binary());

},{"../../format/format":27,"./secp256k1-wasm-types":11,"./secp256k1.base64":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secp256k1Base64Bytes = void 0;
/* eslint-disable tsdoc/syntax */
/**
 * @hidden
 */
// prettier-ignore
exports.secp256k1Base64Bytes = 'AGFzbQEAAAABXg5gAn9/AGAGf39/f39/AX9gAX8AYAABf2AAAGADf39/AX9gAX8Bf2ACf38Bf2AEf39/fwF/YAV/f39/fwF/YAN/f38AYAd/f39/f39/AX9gBH9/f38AYAV/f39/fwAC5wEMA2VudgZtZW1vcnkCAYACgAIDZW52BXRhYmxlAXABBgYDZW52CXRhYmxlQmFzZQN/AANlbnYORFlOQU1JQ1RPUF9QVFIDfwADZW52CFNUQUNLVE9QA38AA2VudgVhYm9ydAACA2Vudg1lbmxhcmdlTWVtb3J5AAMDZW52DmdldFRvdGFsTWVtb3J5AAMDZW52F2Fib3J0T25DYW5ub3RHcm93TWVtb3J5AAMDZW52C19fX3NldEVyck5vAAIDZW52Bl9hYm9ydAAEA2VudhZfZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAUDSUgAAAYKBQAKCgIMAAYABwACBgUNCgAKAAoAAAcHAAAAAgYMCgoFAAUFAAULAQYFAwcBCAgBCAgKBwUFBQUHAQEIBQUFCAUICQgGCwJ/ASMBC38BIwILB/QGGxFfX19lcnJub19sb2NhdGlvbgA1BV9mcmVlACYHX21hbGxvYwAnGV9zZWNwMjU2azFfY29udGV4dF9jcmVhdGUAMxxfc2VjcDI1NmsxX2NvbnRleHRfcmFuZG9taXplAD4fX3NlY3AyNTZrMV9lY19wcml2a2V5X3R3ZWFrX2FkZABCH19zZWNwMjU2azFfZWNfcHJpdmtleV90d2Vha19tdWwAQBtfc2VjcDI1NmsxX2VjX3B1YmtleV9jcmVhdGUAMBpfc2VjcDI1NmsxX2VjX3B1YmtleV9wYXJzZQBOHl9zZWNwMjU2azFfZWNfcHVia2V5X3NlcmlhbGl6ZQBNHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX2FkZABBHl9zZWNwMjU2azFfZWNfcHVia2V5X3R3ZWFrX211bAA/G19zZWNwMjU2azFfZWNfc2Vja2V5X3ZlcmlmeQBDGF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcgA5NF9zZWNwMjU2azFfZWNkc2FfcmVjb3ZlcmFibGVfc2lnbmF0dXJlX3BhcnNlX2NvbXBhY3QAPDhfc2VjcDI1NmsxX2VjZHNhX3JlY292ZXJhYmxlX3NpZ25h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iCEuIAogLadJIAkgLKdJaiALICinSWogISAbRXFqIBkgE0VxaiAaIBRFcWogDiAbSWogByATSWogBSAUSWogECAISWogESAGSSAqQgGGpyIJciAiaiITaiIOIBIgBEkgK0IBhqciCnIgF2oiFGoiByAMIANJICVCAYanIgtyIBVqIhBqIgUgDSACSSAkQgGGpyIIciAWaiIRaiIGICOnIgRBAXQiEmoiASASSSEZIB8oAgCtICd+IiNCIIghLCABICOnIgNBAXQiDGoiASAMSSEaIBgoAgCtICZ+IiNCIIghKCABICOnIgJBAXQiDWoiASANSSEbIAogK6dJIAkgKqdJaiALICWnSWogCCAkp0lqICIgE0VxaiAOIBNJaiAXIBRFcWogByAUSWogFSAQRXFqIAUgEElqIBYgEUVxaiAGIBFJaiASIARJIC5CAYanIg5yIBlqIhVqIgogDCADSSAsQgGGpyIHciAaaiIWaiILIA0gAkkgKEIBhqciBXIgG2oiEGoiCCABIB4oAgCtIiQgJH4iI6ciAmoiASACSSAjQiCIp2oiBmohESAPIAE2AiAgICgCAK0iKSAcKAIArX4iI0IgiCEtIBEgI6ciBEEBdCIMaiIBIAxJIRMgHygCAK0iJyAdKAIArSImfiIjQiCIISogASAjpyIDQQF0Ig1qIgEgDUkhFCAYKAIArSIlICR+IiNCIIghJCABICOnIgJBAXQiCWoiASAJSSESIA8gATYCJCApICZ+IiNCIIghKyAHICynSSAOIC6nSWogBSAop0lqIBkgFUVxaiAaIBZFcWogGyAQRXFqIAogFUlqIAsgFklqIAggEElqIBEgBklqIAwgBEkgLUIBhqciB3IgE2oiDGoiCyANIANJICpCAYanIgVyIBRqIg1qIgggCSACSSAkQgGGpyIGciASaiIJaiIEICOnIgNBAXQiDmoiASAOSSEQICcgHigCAK0iJn4iI0IgiCEoIAEgI6ciAkEBdCIKaiIBIApJIREgBSAqp0kgByAtp0lqIAYgJKdJaiATIAxFcWogCyAMSWogFCANRXFqIAggDUlqIBIgCUVxaiAEIAlJaiAOIANJICtCAYanIgtyIBBqIhJqIgUgCiACSSAoQgGGpyIIciARaiIMaiIGIAEgJSAlfiIjpyICaiIBIAJJICNCIIinaiIEaiENIA8g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QUBrIAJB////H3EiAkHRB2pBGnZqQf///x9LIAYgAXEgB3EgCHEgBEH///8fcSIEcSAJcSALcUH///8fRiAFQf///wFGcXFyIgprQdEHcSACaiECIApBBnQgA2ogAkEadmoiA0EadiABQf///x9xaiIKQRp2IAZB////H3FqIgZBGnYgB0H///8fcWoiB0EadiAIQf///x9xaiIIQRp2IARqIgRBGnYgCUH///8fcWoiCUEadiALQf///x9xaiEBIAAgAkH///8fcTYCACANIANB////H3E2AgAgDiAKQf///x9xNgIAIA8gBkH///8fcTYCACAQIAdB////H3E2AgAgESAIQf///x9xNgIAIBIgBEH///8fcTYCACATIAlB////H3E2AgAgFCABQf///x9xNgIAIAwgAUEadiAFakH///8BcTYCAAuhFwEnfyMEIQQjBEHAA2okBCACKAJQIQYgASgCeARAIAAgBjYCeCAAIAIpAgA3AgAgACACKQIINwIIIAAgAikCEDcCECAAIAIpAhg3AhggACACKQIgNwIgIABBKGoiAyACQShqIgEpAgA3AgAgAyABKQIINwIIIAMgASkCEDcCECADIAEpAhg3AhggAyABKQIgNwIgIABBATYCUCAAQdQAaiIAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAEEANgIgIAQkBA8LIAYEQCADBEAgA0EBNgIAIANBBGoiAkIANwIAIAJCADcCCCACQgA3AhAgAkIANwIYIAJBADYCIAsgACABKQIANwIAIAAgASkCCDcCCCAAIAEpAhA3AhAgACABKQIYNwIYIAAgASkCIDcCICAAIAEpAig3AiggACABKQIwNwIwIAAgASkCODcCOCAAQUBrIAFBQGspAgA3AgAgACABKQJINwJIIAAgASkCUDcCUCAAIAEpAlg3AlggACABKQJgNwJgIAAgASkCaDcCaCAAIAEpAnA3AnAgACABKAJ4NgJ4IAQkBA8LIARB+ABqIQwgBEHQAGohJCAEQShqIQogAEH4AGoiKUEANgIAIARBkANqIiUgAUHQAGoiJhAHIARB6AJqIgggASkCADcCACAIIAEpAgg3AgggCCABKQIQNwIQIAggASkCGDcCGCAIIAEpAiA3AiAgCEEkaiIdKAIAIhNBFnYiBkHRB2wgCCgCAGohGyAGQQZ0IAhBBGoiFygCAGogG0EadmoiGEEadiAIQQhqIhkoAgBqIhpBGnYgCEEMaiIFKAIAaiIHQRp2IAhBEGoiDSgCAGoiFEEadiAIQRRqIhUoAgBqIg5BGnYgCEEYaiIPKAIAaiIQQRp2IAhBHGoiESgCAGoiEkEadiAIQSBqIgYoAgBqIRwgCCAbQf///x9xIio2AgAgFyAYQf///x9xIgs2AgAgGSAaQf///x9xIh42AgAgBSAHQf///x9xIh82AgAgDSAUQf///x9xIiA2AgAgFSAOQf///x9xIiE2AgAgDyAQQf///x9xIiI2AgAgESASQf///x9xIiM2AgAgBiAcQf///x9xIhs2AgAgHSAcQRp2IBNB////AXFqIhw2AgAgBEHAAmoiFiACICUQCiAEQZgCaiIJIAFBKGoiBikCADcCACAJIAYpAgg3AgggCSAGKQIQNwIQIAkgBikCGDcCGCAJIAYpAiA3AiAgCUEkaiInKAIAIh1BFnYiBkHRB2wgCSgCAGohDSAGQQZ0IAlBBGoiEygCAGogDUEadmoiFEEadiAJQQhqIhcoAgBqIhVBGnYgCUEMaiIYKAIAaiIOQRp2IAlBEGoiGSgCAGoiD0EadiAJQRRqIhooAgBqIhBBGnYgCUEYaiIFKAIAaiIRQRp2IAlBHGoiBygCAGoiEkEadiAJQSBqIgYoAgBqISggCSANQf///x9xIg02AgAgEyAUQf///x9xIhQ2AgAgFyAVQf///x9xIhU2AgAgGCAOQf///x9xIg42AgAgGSAPQf///x9xIg82AgAgGiAQQf///x9xIhA2AgAgBSARQf///x9xIhE2AgAgByASQf///x9xIhI2AgAgBiAoQf///x9xIgY2AgAgJyAoQRp2IB1B////AXFqNgIAIARB8AFqIgcgAkEoaiAlEAogByAHICYQCiAEQcgBaiIFQbzh//8AICprIBYoAgBqNgIAIAVB/P3//wAgC2sgFigCBGo2AgQgBUH8////ACAeayAWKAIIajYCCCAFQfz///8AIB9rIBYoAgxqNgIMIAVB/P///wAgIGsgFigCEGo2AhAgBUH8////ACAhayAWKAIUajYCFCAFQfz///8AICJrIBYoAhhqNgIYIAVB/P///wAgI2sgFigCHGo2AhwgBUH8////ACAbayAWKAIgajYCICAFQfz//wcgHGsgFigCJGo2AiRB/P//ByAnKAIAayECIARBoAFqIgtBvOH//wAgDWsgBygCAGo2AgAgC0H8/f//ACAUayAHKAIEajYCBCALQfz///8AIBVrIAcoAghqNgIIIAtB/P///wAgDmsgBygCDGo2AgwgC0H8////ACAPayAHKAIQajYCECALQfz///8AIBBrIAcoAhRqNgIUIAtB/P///wAgEWsgBygCGGo2AhggC0H8////ACASayAHKAIcajYCHCALQfz///8AIAZrIAcoAiBqNgIgIAsgAiAHKAIkajYCJCAFEBdFBEAgDCALEAcgJCAFEAcgCiAFICQQCiADBEAgAyAFKQIANwIAIAMgBSkCCDcCCCADIAUpAhA3AhAgAyAFKQIYNwIYIAMgBSkCIDcCIAsgAEHQAGogJiAFEAogBCAIICQQCiAAIAQpAgA3AgAgACAEKQIINwIIIAAgBCkCEDcCECAAIAQpAhg3AhggACAEKQIgNwIgQfj7//8BIABBBGoiEygCAEEBdCAKQQRqIh4oAgBqayEOQfj///8BIABBCGoiFygCAEEBdCAKQQhqIh8oAgBqayEPQfj///8BIABBDGoiGCgCAEEBdCAKQQxqIiAoAgBqayEQQfj///8BIABBEGoiGSgCAEEBdCAKQRBqIiEoAgBqayERQfj///8BIABBFGoiGigCAEEBdCAKQRRqIiIoAgBqayESQfj///8BIABBGGoiBSgCAEEBdCAKQRhqIiMoAgBqayEGQfj///8BIABBHGoiBygCAEEBdCAKQRxqIhsoAgBqayEDQfj///8BIABBIGoiDSgCAEEBdCAKQSBqIhwoAgBqayECQfj//w8gAEEkaiIUKAIAQQF0IApBJGoiHSgCAGprIQEgAEH4wv//ASAAKAIAQQF0IAooAgBqayAMKAIAaiIVNgIAIBMgDiAMKAIEaiIONgIAIBcgDyAMKAIIaiIPNgIAIBggECAMKAIMaiIQNgIAIBkgESAMKAIQaiIRNgIAIBogEiAMKAIUaiISNgIAIAUgBiAMKAIYaiIGNgIAIAcgAyAMKAIcaiIDNgIAIA0gAiAMKAIgaiICNgIAIBQgASAMKAIkaiIBNgIAIABBKGoiE0G0pP//AiAVayAEKAIAajYCACAAQSxqIhdB9Pn//wIgDmsgBCgCBGo2AgAgAEEwaiIYQfT///8CIA9rIAQoAghqNgIAIABBNGoiGUH0////AiAQayAEKAIMajYCACAAQThqIhpB9P///wIgEWsgBCgCEGo2AgAgAEE8aiIFQfT///8CIBJrIAQoAhRqNgIAIABBQGsiB0H0////AiAGayAEKAIYajYCACAAQcQAaiINQfT///8CIANrIAQoAhxqNgIAIABByABqIhRB9P///wIgAmsgBCgCIGo2AgAgAEHMAGoiFUH0//8XIAFrIAQoAiRqNgIAIBMgEyALEAogCiAKIAkQCiAKQbzh//8AIAooAgBrIg42AgAgHkH8/f//ACAeKAIAayIPNgIAIB9B/P///wAgHygCAGsiEDYCACAgQfz///8AICAoAgBrIhE2AgAgIUH8////ACAhKAIAayISNgIAICJB/P///wAgIigCAGsiBjYCACAjQfz///8AICMoAgBrIgM2AgAgG0H8////ACAbKAIAayICNgIAIBxB/P///wAgHCgCAGsiATYCACAdQfz//wcgHSgCAGsiADYCACATIBMoAgAgDmo2AgAgFyAXKAIAIA9qNgIAIBggGCgCACAQajYCACAZIBkoAgAgEWo2AgAgGiAaKAIAIBJqNgIAIAUgBSgCACAGajYCACAHIAcoAgAgA2o2AgAgDSANKAIAIAJqNgIAIBQgFCgCACABajYCACAVIBUoAgAgAGo2AgAgBCQEDwsgCxAXBEAgACABIAMQGiAEJAQPCyADBEAgA0IANwIAIANCADcCCCADQgA3AhAgA0IANwIYIANCADcCIAsgKUEBNgIAIAQkBAuvAwEBfyAAIAFBHGoiAigCAEEYdjoAACAAIAIoAgBBEHY6AAEgACACKAIAQQh2OgACIAAgAigCADoAAyAAIAFBGGoiAigCAEEYdjoABCAAIAIoAgBBEHY6AAUgACACKAIAQQh2OgAGIAAgAigCADoAByAAIAFBFGoiAigCAEEYdjoACCAAIAIoAgBBEHY6AAkgACACKAIAQQh2OgAKIAAgAigCADoACyAAIAFBEGoiAigCAEEYdjoADCAAIAIoAgBBEHY6AA0gACACKAIAQQh2OgAOIAAgAigCADoADyAAIAFBDGoiAigCAEEYdjoAECAAIAIoAgBBEHY6ABEgACACKAIAQQh2OgASIAAgAigCADoAEyAAIAFBCGoiAigCAEEYdjoA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BxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgBxAHIAcgByAGEAogBEHIAWoiBSAHKQIANwIAIAUgBykCCDcCCCAFIAcpAhA3AhAgBSAHKQIYNwIYIAUgBykCIDcCICAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUQByAFIAUgBxAKIARBoAFqIgIgBSkCADcCACACIAUpAgg3AgggAiAFKQIQNwIQIAIgBSkCGDcCGCACIAUpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACEAcgAiACIAUQCiAEQfgAaiIJIAIpAgA3AgAgCSACKQIINwIIIAkgAikCEDcCECAJIAIpAhg3AhggCSACKQIgNwIgQQAhBgNAIAkgCRAHIAZBAWoiBkHYAEcNAAsgCSAJIAIQCiADIAkpAgA3AgAgAyAJKQIINwIIIAMgCSkCEDcCECADIAkpAhg3AhggAyAJKQIgNwIgIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAxAHIAMgAyAFEAogCCADKQIANwIAIAggAykCCDcCCCAIIAMpAhA3AhAgCCADKQIYNwIYIAggAykCIDcCICAIIAgQByAIIAgQByAIIAgQByAIIAggChAKIAQgCCkCADcCACAEIAgpAgg3AgggBCAIKQIQNwIQIAQgCCkCGDcCGCAEIAgpAiA3AiAgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAcQCiAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQQByAEIAQgARAKIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCALEAogBCAEEAcgBCAEEAcgACABIAQQCiAEJAQL7gQBG38gAEEkaiILKAIAIgJBFnYiAUHRB2wgACgCAGohBCABQQZ0IABBBGoiDCgCAGogBEEadmoiBUEadiAAQQhqIg0oAgBqIgZB////H3EhByAGQRp2IABBDGoiDigCAGoiCEEadiAAQRBqIg8oAgBqIQEgCEH///8fcSEJIAFB////H3EhCiABQRp2IABBFGoiECgCAGoiEUEadiAAQRhqIhIoAgBqIRMgEUH///8fcSEUIBNBGnYgAEEcaiIVKAIAaiIWQRp2IABBIGoiFygCAGohAyAWQf///x9xIRggA0H///8fcSEZIANBGnYgAkH///8BcWoiAkEWdiAFQf///x9xIgVBQGsgBEH///8fcSIEQdEHaiIaQRp2IhtqQf///x9LIAggBnEgAXEgEXEgE0H///8fcSIBcSAWcSADcUH///8fRiACQf///wFGcXFyIgNFBEAgACAENgIAIAwgBTYCACANIAc2AgAgDiAJNgIAIA8gCjYCACAQIBQ2AgAgEiABNgIAIBUgGDYCACAXIBk2AgAgCyACNgIADwsgGyAFaiADQQZ0aiIDQRp2IAdqIgRBGnYgCWoiBkEadiAKaiIHQRp2IBRqIghBGnYgAWoiAUEadiAYaiIJQRp2IBlqIgpBGnYgAmpB////AXEhAiAAIBpB////H3E2AgAgDCADQf///x9xNgIAIA0gBEH///8fcTYCACAOIAZB////H3E2AgAgDyAHQf///x9xNgIAIBAgCEH///8fcTYCACASIAFB////H3E2AgAgFSAJQf///x9xNgIAIBcgCkH///8fcTYCACALIAI2AgALsAIBCn8gACgCJCIBQRZ2IgJB0QdsIAAoAgBqIgNB////H3EiBEHQB3MhBSAEQQBHIAVB////H0dxBEBBAA8LIANBGnYgAkEGdHIgACgCBGoiAkEadiAAKAIIaiIDQRp2IAAoAgxqIgZBGnYgACgCEGoiB0EadiAAKAIUaiIIQRp2IAAoAhhqIglBGnYgACgCHGoiCkEadiAAKAIgaiIAQRp2IAFB////AXFqIQEgAkHAAHMgBXEgA3EgBnEgB3EgCHEgCXEgCnEgAHEgAUGAgIAec3FB////H0YEf0EBBSACQf///x9xIARyIANB////H3FyIAZB////H3FyIAdB////H3FyIAhB////H3FyIAlB////H3FyIApB////H3FyIABB////H3FyIAFyRQtBAXELmAIBBH8gACACaiEEIAFB/wFxIQEgAkHDAE4EQANAIABBA3EEQCAAIAE6AAAgAEEBaiEADAELCyAEQXxxIgVBQGohBiABIAFBCHRyIAFBEHRyIAFBGHRyIQMDQCAAIAZMBEAgACADNgIAIAAgAzYCBCAAIAM2AgggACADNgIMIAAgAzYCECAAIAM2AhQgACADNgIYIAAgAzYCHCAAIAM2AiAgACADNgIkIAAgAzYCKCAAIAM2AiwgACADNgIwIAAgAzYCNCAAIAM2AjggACADNgI8IABBQGshAAwBCwsDQCAAIAVIBEAgACADNgIAIABBBGohAAwBCwsLA0AgACAESARAIAAgAToAACAAQQFqIQAMAQsLIAQgAmsLqy8BnwF/IwQhDSMEQbAmaiQEIA1BgCZqIQ4gDUHYJWohESANQdgkaiEGIA1BhCRqIRIgDUGwI2ohDCANQcgfaiEWIA1ByBdqIUkgDUHoD2ohBSANQagNaiEJIA1BiAhqIQsCfwJAIAMoAgQgAygCAHIgAygCCHIgAygCDHIgAygCEHIgAygCFHIgAygCGHIgAygCHHJFDQAgAigCeA0AIA1BhAhqIgpBADYCACANQYAIaiANIANBBRArIgM2AgAgBiACIAooAgAiD0H8AGxqIhBBABAaIAwgBikCADcCACAMIAYpAgg3AgggDCAGKQIQNwIQIAwgBikCGDcCGCAMIAYpAiA3AiAgDEEoaiIKIAZBKGoiCCkCADcCACAKIAgpAgg3AgggCiAIKQIQNwIQIAogCCkCGDcCGCAKIAgpAiA3AiAgDEEANgJQIA4gBkHQAGoiChAHIBEgDiAKEAogEiAQIA4QCiASQShqIgggAiAPQfwAbGpBKGogERAKIBIgAiAPQfwAbGooAng2AlAgBSASKQIANwIAIAUgEikCCDcCCCAFIBIpAhA3AhAgBSASKQIYNwIYIAUgEikCIDcCICAFQShqIhAgCCkCADcCACAQIAgpAgg3AgggECAIKQIQNwIQIBAgCCkCGDcCGCAQIAgpAiA3AiAgBUHQAGoiCCACIA9B/ABsakHQAGoiAikCADcCACAIIAIpAgg3AgggCCACKQIQNwIQIAggAikCGDcCGCAIIAIpAiA3AiAgBUH4AGoiE0EANgIAIAkgCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgBUH8AGoiAiAFIAwgCUEoaiIUEBAgBUH4AWoiCCACIAwgCUHQAGoiBxAQIAVB9AJqIgIgCCAMIAlB+ABqIh0QECAFQfADaiIIIAIgDCAJQaABaiIeEBAgBUHsBGoiAiAIIAwgCUHIAWoiHxAQIAVB6AVqIg8gAiAMIAlB8AFqIiEQECAFQeQGaiIIIA8gDCAJQZgCaiIPEBAgBUG0B2oiAiACIAoQCiALQcwEaiIJIAgpAgA3AgAgCSAIKQIINwIIIAkgCCkCEDcCECAJIAgpAhg3AhggCSAIKQIgNwIgIAtB9ARqIgkgBUGMB2oiCikCADcCACAJIAopAgg3AgggCSAKKQIQNwIQIAkgCikCGDcCGCAJIAopAiA3AiAgC0GYBWoiIigCACIjQRZ2IghB0QdsIAkoAgBqIQogCEEGdCALQfgEaiIkKAIAaiAKQRp2aiIlQRp2IAtB/ARqIiYoAgBqIidBGnYgC0GABWoiKCgCAGoiKUEadiALQYQFaiIqKAIAaiIrQRp2IAtBiAVqIiwoAgBqIi1BGnYgC0GMBWoiLigCAGoiL0EadiALQZAFaiIwKAIAaiIxQRp2IAtBlAVqIjIoAgBqIQggCSAKQf///x9xNgIAICQgJUH///8fcTYCACAmICdB////H3E2AgAgKCApQf///x9xNgIAICogK0H///8fcTYCACAsIC1B////H3E2AgAgLiAvQf///x9xNgIAIDAgMUH///8fcTYCACAyIAhB////H3E2AgAgIiAIQRp2ICNB////AXFqNgIAIBYgAikCADcCACAWIAIpAgg3AgggFiACKQIQNwIQIBYgAikCGDcCGCAWIAIpAiA3AiAgC0EANgKcBSAGIA8pAgA3AgAgBiAPKQIINwIIIAYgDykCEDcCECAGIA8pAhg3AhggBiAPKQIgNwIgIA4gBhAHIBEgDiAGEAogC0H4A2ogBUHoBWogDhAKIAtBoARqIAVBkAZqIBEQCiALIAUoAuAGNgLIBCAGIAYgIRAKIA4gBhAHIBEgDiAGEAogC0GkA2ogBUHsBGogDhAKIAtBzANqIAVBlAVqIBEQCiALIAUoAuQFNgL0AyAGIAYgHxAKIA4gBhAHIBEgDiAGEAogC0HQAmogBUHwA2ogDhAKIAtB+AJqIAVBmARqIBEQCiALIAUoAugENgKgAyAGIAYgHhAKIA4gBhAHIBEgDiAGEAogC0H8AWogBUH0AmogDhAKIAtBpAJqIAVBnANqIBEQCiALIAUoAuwDNgLMAiAGIAYgHRAKIA4gBhAHIBEgDiAGEAogC0GoAWogBUH4AWogDhAKIAtB0AFqIAVBoAJqIBEQCiALIAUoAvACNgL4ASAGIAYgBxAKIA4gBhAHIBEgDiAGEAogC0HUAGogBUH8AGogDhAKIAtB/ABqIAVBpAFqIBEQCiALIAUoAvQBNgKkASAGIAYgFBAKIA4gBhAHIBEgDiAGEAogCyAFIA4QCiALQShqIBAgERAKIAsgEygCADYCUEEBIUogA0EASgR/IAMFQQALDAELIBZBATYCACAWQQRqIgJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCACQQA2AiBBASFLQQALIQIgBARAIEkgBEEPECsiAyFMIAMgAkoEQCADIQILCyABQfgAaiIdQQE2AgAgAUIANwIAIAFCADcCCCABQgA3AhAgAUIANwIYIAFCADcCICABQgA3AiggAUIANwIwIAFCADcCOCABQUBrQgA3AgAgAUIANwJIIAFCADcCUCABQgA3AlggAUIANwJgIAFCADcCaCABQgA3AnAgAkEATARAIA0kBA8LIA1B6CFqISsgDUHwIGohLCANQcggaiFNIA1B8B9qIgVB0ABqIWogAUHQAGohHiAGQQRqIU4gBkEIaiFPIAZBDGohUCAGQRBqIVEgBkEUaiFSIAZBGGohUyAGQRxqIVQgBkEgaiFVIAZBJGohViABQShqIRMgDEEEaiFXIAxBCGohWCAMQQxqIVkgDEEQaiFaIAxBFGohWyAMQRhqIVwgDEEcaiFdIAxBIGohXiAMQSRqIV8gBUEoaiFgIA1B4CJqIghBBGohayAIQQhqIWwgCEEMaiFtIAhBEGohbiAIQRRqIW8gCEEYaiFwIAhBHGohcSAIQSBqIXIgCEEkaiFzIBJBBGohdCASQQhqIXUgEkEMaiF2IBJBEGohdyASQRRqIXggEkEYaiF5IBJBHGoheiASQSBqIXsgEkEkaiF8IA1BuCJqIhBBBGohfSAQQQhqIX4gEEEMaiF/IBBBEGohgAEgEEEUaiGBASAQQRhqIYIBIBBBHGohgwEgEEEgaiGEASAQQSRqIYUBIA1BiCNqIg9BBGohhgEgD0EIaiGHASAPQQxqIYgBIA9BEGohiQEgD0EUaiGKASAPQRhqIYsBIA9BHGohjAEgD0EgaiGNASAPQSRqIY4BIAFBBGohYSABQQhqIWIgAUEMaiFjIAFBEGohZCABQRRqIWUgAUEYaiFmIAFBHGohZyABQSBqIWggAUEkaiFpIA1BwCFqIgpBBGohLSAKQQhqIS4gCkEMaiEvIApBEGohMCAKQRRqITEgCkEYaiEyIApBHGohOSAKQSBqITogCkEkaiE7IA1BkCJqIhRBBGohjwEgFEEIaiGQASAUQQxqIZEBIBRBEGohkgEgFEEUaiGTASAUQRhqIZQBIBRBHGohlQEgFEEgaiGWASAUQSRqIZcBIAFBLGohPCABQTBqIT0gAUE0aiE+IAFBOGohPyABQTxqIUAgAUFAayFBIAFBxABqIUIgAUHIAGohQyABQcwAaiFEIA1BmCFqIglBBGohmAEgCUEIaiGZASAJQQxqIZoBIAlBEGohmwEgCUEUaiGcASAJQRhqIZ0BIAlBHGohngEgCUEgaiGfASAJQSRqIaABIAFB0ABqIaEBIAFB1ABqIR8gBUEoaiEhIAVBLGohIiAFQTBqISMgBUE0aiEkIAVBOGohJSAFQTxqISYgBUFAayEnIAVBxABqISggBUHIAGohKSAFQcwAaiEqIA1BgAhqKAIAIaIBA0AgAkF/aiEEIAEgAUEAEBogSyACIKIBSnJFBEBBACEDA0AgDSADQYgIbGogBEECdGooAgAiBwRAIAsgA0EDdEHUAGxqIRUgB0EASgRAIAUgFSAHQX9qQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAFIAUgFSAHQX9zQQJtQdQAbGoiBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAHKQIoNwIoIAUgBykCMDcCMCAFIAcpAjg3AjggBUFAayAHQUBrKQIANwIAIAUgBykCSDcCSCAFIAcoAlA2AlAgIUG84f//ACAhKAIAazYCACAiQfz9//8AICIoAgBrNgIAICNB/P///wAgIygCAGs2AgAgJEH8////ACAkKAIAazYCACAlQfz///8AICUoAgBrNgIAICZB/P///wAgJigCAGs2AgAgJ0H8////ACAnKAIAazYCACAoQfz///8AICgoAgBrNgIAIClB/P///wAgKSgCAGs2AgAgKkH8//8HICooAgBrNgIACyABIAEgBUEAEBALIANBAWoiAyBKRw0ACwsgAiBMTARAIEkgBEECdGooAgAiAwRAIAAoAgAhByADQQBKBEAgBSAHIANBf2pBAm1BBnRqECMFIAUgByADQX9zQQJtQQZ0ahAjICFBvOH//wAgISgCAGs2AgAgIkH8/f//ACAiKAIAazYCACAjQfz///8AICMoAgBrNgIAICRB/P///wAgJCgCAGs2AgAgJUH8////ACAlKAIAazYCACAmQfz///8AICYoAgBrNgIAICdB/P///wAgJygCAGs2AgAgKEH8////ACAoKAIAazYCACApQfz///8AICkoAgBrNgIAICpB/P//ByAqKAIAazYCAAsCQCBqKAIARQRAIB0oAgAEQCAdQQA2AgAgLCAWEAcgTSAsIBYQCiABIAUgLBAKIBMgYCBNEAogoQFBATYCACAfQgA3AgAgH0IANwIIIB9CADcCECAfQgA3AhggH0EANgIgDAILIB1BADYCACAOIB4gFhAKIBEgDhAHIAYgASkCADcCACAGIAEpAgg3AgggBiABKQIQNwIQIAYgASkCGDcCGCAGIAEpAiA3AiAgVigCACIVQRZ2IgdB0QdsIAYoAgBqIQMgB0EGdCBOKAIAaiADQRp2aiIXQRp2IE8oAgBqIhhBGnYgUCgCAGoiGUEadiBRKAIAaiIaQRp2IFIoAgBqIhtBGnYgUygCAGoiHEEadiBUKAIAaiIgQRp2IFUoAgBqIQcgBiADQf///x9xIkU2AgAgTiAXQf///x9xIhc2AgAgTyAYQf///x9xIhg2AgAgUCAZQf///x9xIhk2AgAgUSAaQf///x9xIho2AgAgUiAbQf///x9xIhs2AgAgUyAcQf///x9xIhw2AgAgVCAgQf///x9xIiA2AgAgVSAHQf///x9xIkY2AgAgViAHQRp2IBVB////AXFqIhU2AgAgEiAFIBEQCiAMIBMpAgA3AgAgDCATKQIINwIIIAwgEykCEDcCECAMIBMpAhg3AhggDCATKQIgNwIgIF8oAgAiR0EWdiIHQdEHbCAMKAIAaiEDIAdBBnQgVygCAGogA0EadmoiM0EadiBYKAIAaiI0QRp2IFkoAgBqIjVBGnYgWigCAGoiNkEadiBbKAIAaiI3QRp2IFwoAgBqIjhBGnYgXSgCAGoiSEEadiBeKAIAaiEHIAwgA0H///8fcSIDNgIAIFcgM0H///8fcSIzNgIAIFggNEH///8fcSI0NgIAIFkgNUH///8fcSI1NgIAIFogNkH///8fcSI2NgIAIFsgN0H///8fcSI3NgIAIFwgOEH///8fcSI4NgIAIF0gSEH///8fcSJINgIAIF4gB0H///8fcSKjATYCACBfIAdBGnYgR0H///8BcWoiBzYCACAPIGAgERAKIA8gDyAOEAogCEG84f//ACBFayASKAIAajYCACBrQfz9//8AIBdrIHQoAgBqNgIAIGxB/P///wAgGGsgdSgCAGo2AgAgbUH8////ACAZayB2KAIAajYCACBuQfz///8AIBprIHcoAgBqNgIAIG9B/P///wAgG2sgeCgCAGo2AgAgcEH8////ACAcayB5KAIAajYCACBxQfz///8AICBrIHooAgBqNgIAIHJB/P///wAgRmsgeygCAGo2AgAgc0H8//8HIBVrIHwoAgBqNgIAIBBBvOH//wAgA2sgDygCAGo2AgAgfUH8/f//ACAzayCGASgCAGo2AgAgfkH8////ACA0ayCHASgCAGo2AgAgf0H8////ACA1ayCIASgCAGo2AgAggAFB/P///wAgNmsgiQEoAgBqNgIAIIEBQfz///8AIDdrIIoBKAIAajYCACCCAUH8////ACA4ayCLASgCAGo2AgAggwFB/P///wAgSGsgjAEoAgBqNgIAIIQBQfz///8AIKMBayCNASgCAGo2AgAghQFB/P//ByAHayCOASgCAGo2AgAgCBAXRQRAIBQgEBAHICsgCBAHIAogCCArEAogHiAeIAgQCiAJIAYgKxAKIAEgCSkCADcCACABIAkpAgg3AgggASAJKQIQNwIQIAEgCSkCGDcCGCABIAkpAiA3AiAgLSgCACEDIC4oAgAhByAvKAIAIRUgMCgCACEXIDEoAgAhGCAyKAIAIRkgOSgCACEaIDooAgAhGyA7KAIAIRwgYSgCAEF+bCEgIGIoAgBBfmwhRSBjKAIAQX5sIUYgZCgCAEF+bCFHIGUoAgBBfmwhMyBmKAIAQX5sITQgZygCAEF+bCE1IGgoAgBBfmwhNiBpKAIAQX5sITcgASABKAIAQX5sQfjC//8BaiAKKAIAayAUKAIAaiI4NgIAIGEgIEH4+///AWogA2sgjwEoAgBqIgM2AgAgYiBFQfj///8BaiAHayCQASgCAGoiBzYCACBjIEZB+P///wFqIBVrIJEBKAIAaiIVNgIAIGQgR0H4////AWogF2sgkgEoAgBqIhc2AgAgZSAzQfj///8BaiAYayCTASgCAGoiGDYCACBmIDRB+P///wFqIBlrIJQBKAIAaiIZNgIAIGcgNUH4////AWogGmsglQEoAgBqIho2AgAgaCA2Qfj///8BaiAbayCWASgCAGoiGzYCACBpIDdB+P//D2ogHGsglwEoAgBqIhw2AgAgE0G0pP//AiA4ayAJKAIAajYCACA8QfT5//8CIANrIJgBKAIAajYCACA9QfT///8CIAdrIJkBKAIAajYCACA+QfT///8CIBVrIJoBKAIAajYCACA/QfT///8CIBdrIJsBKAIAajYCACBAQfT///8CIBhrIJwBKAIAajYCACBBQfT///8CIBlrIJ0BKAIAajYCACBCQfT///8CIBprIJ4BKAIAajYCACBDQfT///8CIBtrIJ8BKAIAajYCACBEQfT//xcgHGsgoAEoAgBqNgIAIBMgEyAQEAogCiAKIAwQCiAKQbzh//8AIAooAgBrIgM2AgAgLUH8/f//ACAtKAIAayIHNgIAIC5B/P///wAgLigCAGsiFTYCACAvQfz///8AIC8oAgBrIhc2AgAgMEH8////ACAwKAIAayIYNgIAIDFB/P///wAgMSgCAGsiGTYCACAyQfz///8AIDIoAgBrIho2AgAgOUH8////ACA5KAIAayIbNgIAIDpB/P///wAgOigCAGsiHDYCACA7Qfz//wcgOygCAGsiIDYCACATIBMoAgAgA2o2AgAgPCA8KAIAIAdqNgIAID0gPSgCACAVajYCACA+ID4oAgAgF2o2AgAgPyA/KAIAIBhqNgIAIEAgQCgCACAZajYCACBBIEEoAgAgGmo2AgAgQiBCKAIAIBtqNgIAIEMgQygCACAcajYCACBEIEQoAgAgIGo2AgAMAgsgEBAXBEAgASABQQAQGgUgHUEBNgIACwsLCwsgAkEBSgRAIAQhAgwBCwsgHSgCAARAIA0kBA8LIB4gHiAWEAogDSQEC84SATB/IwQhBCMEQaABaiQEIARB+ABqIQUgBEHQAGohByAEQShqIQMgACABKAJ4IgY2AnggAkEARyEIIAYEQCAIRQRAIAQkBA8LIAJBATYCACACQQRqIgBCADcCACAAQgA3AgggAEIANwIQIABCADcCGCAAQQA2AiAgBCQEBSABQShqIQYgCARAIAIgBikCADcCACACIAYpAgg3AgggAiAGKQIQNwIQIAIgBikCGDcCGCACIAYpAiA3AiAgAkEkaiIKKAIAIgtBFnYiCUHRB2wgAigCAGohCCAJQQZ0IAJBBGoiDCgCAGogCEEadmoiDUEadiACQQhqIg4oAgBqIhJBGnYgAkEMaiITKAIAaiIUQRp2IAJBEGoiFSgCAGoiFkEadiACQRRqIhcoAgBqIhhBGnYgAkEYaiIZKAIAaiIaQRp2IAJBHGoiDygCAGoiEEEadiACQSBqIhEoAgBqIQkgAiAIQQF0Qf7//z9xNgIAIAwgDUEBdEH+//8/cTYCACAOIBJBAXRB/v//P3E2AgAgEyAUQQF0Qf7//z9xNgIAIBUgFkEBdEH+//8/cTYCACAXIBhBAXRB/v//P3E2AgAgGSAaQQF0Qf7//z9xNgIAIA8gEEEBdEH+//8/cTYCACARIAlBAXRB/v//P3E2AgAgCiAJQRp2IAtB////AXFqQQF0NgIACyAAQdAAaiICIAFB0ABqIAYQCiACIAIoAgBBAXQ2AgAgAEHUAGoiAiACKAIAQQF0NgIAIABB2ABqIgIgAigCAEEBdDYCACAAQdwAaiICIAIoAgBBAXQ2AgAgAEHgAGoiAiACKAIAQQF0NgIAIABB5ABqIgIgAigCAEEBdDYCACAAQegAaiICIAIoAgBBAXQ2AgAgAEHsAGoiAiACKAIAQQF0NgIAIABB8ABqIgIgAigCAEEBdDYCACAAQfQAaiICIAIoAgBBAXQ2AgAgBSABEAcgBSAFKAIAQQNsNgIAIAVBBGoiAiACKAIAQQNsNgIAIAVBCGoiAiACKAIAQQNsNgIAIAVBDGoiAiACKAIAQQNsNgIAIAVBEGoiAiACKAIAQQNsNgIAIAVBFGoiAiACKAIAQQNsNgIAIAVBGGoiAiACKAIAQQNsNgIAIAVBHGoiAiACKAIAQQNsNgIAIAVBIGoiAiACKAIAQQNsNgIAIAVBJGoiAiACKAIAQQNsNgIAIAcgBRAHIAMgBhAHIAMgAygCAEEBdDYCACADQQRqIgIgAigCAEEBdDYCACADQQhqIgYgBigCAEEBdDYCACADQQxqIgggCCgCAEEBdDYCACADQRBqIgkgCSgCAEEBdDYCACADQRRqIgogCigCAEEBdDYCACADQRhqIgsgCygCAEEBdDYCACADQRxqIgwgDCgCAEEBdDYCACADQSBqIg0gDSgCAEEBdDYCACADQSRqIg4gDigCAEEBdDYCACAEIAMQByAEIAQoAgBBAXQ2AgAgBEEEaiISIBIoAgBBAXQ2AgAgBEEIaiITIBMoAgBBAXQ2AgAgBEEMaiIUIBQoAgBBAXQ2AgAgBEEQaiIVIBUoAgBBAXQ2AgAgBEEUaiIWIBYoAgBBAXQ2AgAgBEEYaiIXIBcoAgBBAXQ2AgAgBEEcaiIYIBgoAgBBAXQ2AgAgBEEgaiIZIBkoAgBBAXQ2AgAgBEEkaiIaIBooAgBBAXQ2AgAgAyADIAEQCiAAIAMpAgA3AgAgACADKQIINwIIIAAgAykCEDcCECAAIAMpAhg3AhggACADKQIgNwIgQfb6/78CIABBBGoiASgCAEECdGshD0H2//+/AiAAQQhqIhAoAgBBAnRrIRFB9v//vwIgAEEMaiIbKAIAQQJ0ayEcQfb//78CIABBEGoiHSgCAEECdGshHkH2//+/AiAAQRRqIh8oAgBBAnRrISBB9v//vwIgAEEYaiIhKAIAQQJ0ayEiQfb//78CIABBHGoiIygCAEECdGshJEH2//+/AiAAQSBqIiUoAgBBAnRrISZB9v//EyAAQSRqIicoAgBBAnRrISggAEHWs/+/AiAAKAIAQQJ0ayAHKAIAIilqNgIAIAEgDyAHQQRqIg8oAgAiAWo2AgAgECARIAdBCGoiECgCACIRajYCACAbIBwgB0EMaiIbKAIAIhxqNgIAIB0gHiAHQRBqIh0oAgAiHmo2AgAgHyAgIAdBFGoiHygCACIgajYCACAhICIgB0EYaiIhKAIAIiJqNgIAICMgJCAHQRxqIiMoAgAiJGo2AgAgJSAmIAdBIGoiJSgCACImajYCACAnICggB0EkaiInKAIAIihqNgIAIAIoAgBBBmwhKiAGKAIAQQZsISsgCCgCAEEGbCEsIAkoAgBBBmwhLSAKKAIAQQZsIS4gCygCAEEGbCEvIAwoAgBBBmwhMCANKAIAQQZsITEgDigCAEEGbCEyIAMgAygCAEEGbEG84f//ACApa2o2AgAgAiAqQfz9//8AIAFrajYCACAGICtB/P///wAgEWtqNgIAIAggLEH8////ACAca2o2AgAgCSAtQfz///8AIB5rajYCACAKIC5B/P///wAgIGtqNgIAIAsgL0H8////ACAia2o2AgAgDCAwQfz///8AICRrajYCACANIDFB/P///wAgJmtqNgIAIA4gMkH8//8HIChrajYCACAAQShqIgEgBSADEAogB0Ga0v+/ASAEKAIAayICNgIAIA9B+vz/vwEgEigCAGsiAzYCACAQQfr//78BIBMoAgBrIgU2AgAgG0H6//+/ASAUKAIAayIHNgIAIB1B+v//vwEgFSgCAGsiBjYCACAfQfr//78BIBYoAgBrIgg2AgAgIUH6//+/ASAXKAIAayIJNgIAICNB+v//vwEgGCgCAGsiCjYCACAlQfr//78BIBkoAgBrIgs2AgAgJ0H6//8LIBooAgBr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BGohBCAGIAgQDEEBIANrIgNBwABJBH8gBAUgAkGBf2oiDUFAcSIOIAJrQcSSBGohBSADIQIgBCEDA0AgCCADKQAANwAAIAggAykACDcACCAIIAMpABA3ABAgCCADKQAYNwAYIAggAykAIDcAICAIIAMpACg3ACggCCADKQAwNwAwIAggAykAODcAOCADQUBrIQMgBiAIEAwgAkFAaiICQcAATw0ACyANIA5rIQMgBQshAiADBEAgAiEEQQAhAgwCCwsMAQsgCCACaiAEIAMQCxoLIAogECgCACICQR12QRh0NgIAIAogAkELdEGAgPwHcSACQRt0ciACQQV2QYD+A3FyIAJBFXZB/wFxcjYCBCAQIAJBNyACa0E/cUEBaiIDajYCACAGQSBqIQUCQAJAIANBwAAgAkE/cSICayIESQRAQfmMBCEEDAEFIAUgAmpB+YwEIAQQCxogBEH5jARqIQIgBiAFEAwgAyAEayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAIAIhBEEAIQIMAgsLDAELIAUgAmogBCADEAsaCyAQKAIAIgJBP3EhBCAQIAJBCGo2AgAgBkEgaiEFAkACQEHAACAEayIDQQhLBEAgCiECQQghAwwBBSAFIARqIAogAxALGiAKIANqIQIgBiAFEAxBCCADayIDQcAATwRAA0AgBSACKQAANwAAIAUgAikACDcACCAFIAIpABA3ABAgBSACKQAYNwAYIAUgAikAIDcAICAFIAIpACg3ACggBSACKQAwNwAwIAUgAikAODcAOCACQUBrIQIgBiAFEAwgA0FAaiIDQcAATw0ACwsgAwRAQQAhBAwCCwsMAQsgBSAEaiACIAMQCxoLIAYoAgAQCSESIAZBADYCACAGQQRqIh4oAgAQCSEIIB5BADYCACAGQQhqIh8oAgAQCSENIB9BADYCACAGQQxqIiAoAgAQCSEOICBBADYCACAGQRBqIiEoAgAQCSEFICFBADYCACAGQRRqIiMoAgAQCSEEICNBADYCACAGQRhqIhMoAgAQCSEDIBNBADYCACAGQRxqIh0oAgAQ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EAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADEAggAyADIAIQDSAEQaABaiICIAMQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAJEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAKEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBhANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAsQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCRANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAGEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACIAYQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgCBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAoQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiAMEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAQQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIgBBANIAIgAhAIIAIgAhAIIAIgAhAIIAIgAhAIIAIgAiALEA0gAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACEAggAiACIAEQDSACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCACIAIQCCAAIAIgBxANIAQkBAvYAwETfyMEIQIjBEHQAGokBCACIAFB0ABqEAcgAiACIAAQCiABKAIkIgZBFnYiAEHRB2wgASgCAGohBCAAQQZ0IAEoAgRqIARBGnZqIgdBGnYgASgCCGoiCEEadiABKAIMaiIJQRp2IAEoAhBqIgpBGnYgASgCFGoiC0EadiABKAIYaiIMQRp2IAEoAhxqIg1BGnYgASgCIGohBUH8/f//ACACKAIEayEOQfz///8AIAIoAghrIQ9B/P///wAgAigCDGshEEH8////ACACKAIQayERQfz///8AIAIoAhRrIRJB/P///wAgAigCGGshE0H8////ACACKAIcayEUQfz///8AIAIoAiBrIQEgAigCJCEAIAJBKGoiA0G84f//ACACKAIAayAEQf///x9xajYCACADIA4gB0H///8fcWo2AgQgAyAPIAhB////H3FqNgIIIAMgECAJQf///x9xajYCDCADIBEgCkH///8fcWo2AhAgAyASIAtB////H3FqNgIUIAMgEyAMQf///x9xajYCGCADIBQgDUH///8fcWo2AhwgAyABIAVB////H3FqNgIgIAMgBkH///8BcUH8//8HaiAAayAFQRp2ajYCJCADEBchACACJAQgAAuXEAEKfyMEIQQjBEHgA2okBCAEQdAAaiEDIARBKGohCCAEQbgDaiILIAEQByALIAsgARAKIARBkANqIgogCxAHIAogCiABEAogBEHoAmoiBiAKKQIANwIAIAYgCikCCDcCCCAGIAopAhA3AhAgBiAKKQIYNwIYIAYgCikCIDcCICAGIAYQByAGIAYQByAGIAYQByAGIAYgChAKIARBwAJqIgIgBikCADcCACACIAYpAgg3AgggAiAGKQIQNwIQIAIgBikCGDcCGCACIAYpAiA3AiAgAiACEAcgAiACEAcgAiACEAcgAiACIAoQCiAEQZgCaiIGIAIpAgA3AgAgBiACKQIINwIIIAYgAikCEDcCECAGIAIpAhg3AhggBiACKQIgNwIgIAYgBhAHIAYgBhAHIAYgBiALEAogBEHwAWoiByAGKQIANwIAIAcgBikCCDcCCCAHIAYpAhA3AhAgByAGKQIYNwIYIAcgBikCIDcCICAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcQByAHIAcgBhAKIARByAFqIgUgBykCADcCACAFIAcpAgg3AgggBSAHKQIQNwIQIAUgBykCGDcCGCAFIAcpAiA3AiAgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFEAcgBSAFIAcQCiAEQaABaiICIAUpAgA3AgAgAiAFKQIINwIIIAIgBSkCEDcCECACIAUpAhg3AhggAiAFKQIgNwIgIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAhAHIAIgAiAFEAogBEH4AGoiCSACKQIANwIAIAkgAikCCDcCCCAJIAIpAhA3AhAgCSACKQIYNwIYIAkgAikCIDcCIEEAIQYDQCAJIAkQByAGQQFqIgZB2ABHDQALIAkgCSACEAogAyAJKQIANwIAIAMgCSkCCDcCCCADIAkpAhA3AhAgAyAJKQIYNwIYIAMgCSkCIDcCICADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMQByADIAMgBRAKIAggAykCADcCACAIIAMpAgg3AgggCCADKQIQNwIQIAggAykCGDcCGCAIIAMpAiA3AiAgCCAIEAcgCCAIEAcgCCAIEAcgCCAIIAoQCiAEIAgpAgA3AgAgBCAIKQIINwIIIAQgCCkCEDcCECAEIAgpAhg3AhggBCAIKQIgNwIgIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBBAHIAQgBCAHEAogBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEEAcgBCAEIAsQCiAEIAQQByAAIAQQByAEIAAQB0G84f//ACAEKAIAayABKAIAaiABKAIkQfz//wcgBCgCJGtqIgpBFnYiBkHRB2xqIQBB/P///wAgBCgCIGsgASgC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ACggBCABKQAwNwAwIAQgASkAODcAOCABQUBrIQEgBiAEEAwgAkFAaiICQcAATw0ACwsgAgRAQQAhAwwCCwsMAQsgBCADaiABIAIQCxoLIAYoAgAQCSEIIAZBADYCACAKKAIAEAkhCSAKQQA2AgAgCygCABAJIQogC0EANgIAIAwoAgAQCSELIAxBADYCACANKAIAEAkhByANQQA2AgAgDigCABAJIQMgDkEANgIAIA8oAgAQCSECIA9BADYCACARKAIAEAkhASAFIAg2AgAgBSAJNgIEIAUgCjYCCCAFIAs2AgwgBSAHNgIQIAUgAzYCFCAFIAI2AhggBSABNgIcIAAgBSAQEA4gBSQEC+YBAQN/IABB4ABqIgMoAgAiBEE/cSEFIAMgBCACajYCAEHAACAFayIEIAJNBEAgAEEgaiIDIAVqIAEgBBALGiABIARqIQEgACADEAwgAiAEayICQcAASQRAQQAhBQUDQCADIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABggAyABKQAgNwAgIAMgASkAKDcAKCADIAEpADA3ADAgAyABKQA4NwA4IAFBQGshASAAIAMQDCACQUBqIgJBwABPDQBBACEFCwsLIAJFBEAPCyAAQSBqIAVqIAEgAhALGgvASwEzfyMEIQkjBEHwAWokBCAAQoGChIiQoMCAATcCACAAQoGChIiQoMCAATcCCCAAQoGChIiQoMCAATcCECAAQoGChIiQoMCAATcCGCAAQSBqIhlCADcCACAZQgA3AgggGUIANwIQIBlCADcCGCAJIgogGRATIApB4ABqIg0oAgAiCUE/cSEEIA0gCUEgajYCACAKQSBqIQsCQAJAQcAAIARrIglBIEsEQCAAIQkgBCEDQSAhCAwBBSALIARqIAAgCRALGiAAIAlqIQMgCiALEAxBICAJayIIQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCAIIQkgAyEIA0AgCyAIKQAANwAAIAsgCCkACDcACCALIAgpABA3ABAgCyAIKQAYNwAYIAsgCCkAIDcAICALIAgpACg3ACggCyAIKQAwNwAwIAsgCCkAODcAOCAIQUBrIQggCiALEAwgCUFAaiIJQcAATw0ACyAHIAZrIQggBAshCSAIBEBBACEDDAILCwwBCyAL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cXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYCAAJAAkBBwAAgA2siBEEgSwRAIAghASADIQJBICEDDAEFIAUgA2ogCCAEEAsaIAggBGohAiAMIAUQDEEgIARrIgFBwABJBH8gASEDIAIFIANBoH9qIgNBBnZBAXQhBiAEQUBqIQQDQCAFIAIpAAA3AAAgBSACKQAINwAIIAUgAikAEDcAECAFIAIpABg3ABggBSACKQAgNwAgIAUgAikAKDcAKCAFIAIpADA3ADAgBSACKQA4NwA4IAJBQGshAiAMIAUQDCABQUBqIgFBwABPDQALIANBP3EhAyAIIAZBBGpBBXRqIARqCyEBIAMEQEEAIQIMAgsLDAELIAUgAmogASADEAsaCyAJIBEoAgAiAUEddkEYdDYCACAJIAFBC3RBgID8B3EgAUEbdHIgAUEFdkGA/gNxciABQRV2Qf8BcXI2AgQgESABQTcgAWtBP3FBAWoiAmo2AgACQAJAIAJBwAAgAUE/cSIBayIDSQRAQfmMBCEDDAEFIAUgAWpB+YwEIAMQCxogA0H5jARqIQEgDCAFEAwgAiADayICQcAATwRAA0AgBSABKQAANwAAIAUgASkACDcACCAFIAEpABA3ABAgBSABKQAYNwAYIAUgASkAIDcAICAFIAEpACg3ACggBSABKQAwNwAwIAUgASkAODcAOCABQUBrIQEgDCAFEAwgAkFAaiICQcAATw0ACwsgAgRAIAEhA0EAIQEMAgsLDAELIAUgAWogAyACEAsaCyARKAIAIgFBP3EhAyARIAFBCGo2AgACQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAUgA2ogCSACEAsaIAkgAmohASAMIAUQDEEIIAJrIgJBwABPBEADQCAFIAEpAAA3AAAgBSABKQAINwAIIAUgASkAEDcAECAFIAEpABg3ABggBSABKQAgNwAgIAUgASkAKDcAKCAFIAEpADA3ADAgBSABKQA4NwA4IAFBQGshASAMIAUQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAFIANqIAEgAhALGgsgDCgCABAJIQ4gDEEANgIAIBMoAgAQCSELIBNBADYCACAUKAIAEAkhByAUQQA2AgAgFSgCABAJIQYgFUEANgIAIBYoAgAQCSEEIBZBADYCACAXKAIAEAkhAyAXQQA2AgAgGCgCABAJIQIgGEEANgIAICEoAgAQCSEBICFBADYCACAuIA42AAAgLyALNgAAIDAgBzYAACAxIAY2AAAgMiAENgAAIDMgAzYAACA0IAI2AAAgNSABNgAAIAogGRATIA0oAgAiAUE/cSEEIA0gAUEgajYCACAKQSBqIQsCQAJAQcAAIARrIgFBIEsEQCAAIQEgBCEDQSAhAgwBBSALIARqIAAgARALGiAAIAFqIQMgCiALEAxBICABayICQcAASQR/IAMFIABB5ABqIARBoH9qIgdBQHEiBkEcciAEa2ohBCACIQEgAyECA0AgCyACKQAANwAAIAsgAikACDcACCALIAIpABA3ABAgCyACKQAYNwAYIAsgAikAIDcAICALIAIpACg3ACggCyACKQAwNwAwIAsgAikAODcAOCACQUBrIQIgCiALEAwgAUFAaiIBQcAATw0ACyAHIAZrIQIgBAshASACBEBBACEDDAILCwwBCyALIANqIAEgAhALGgsgCSANKAIAIgFBHXZBGHQ2AgAgCSABQQt0QYCA/AdxIAFBG3RyIAFBBXZBgP4DcXIgAUEVdkH/AXFyNgIEIA0gAUE3IAFrQT9xQQFqIgJqNgIAIApBIGohBAJAAkAgAkHAACABQT9xIgFrIgNJBEBB+YwEIQMMAQUgBCABakH5jAQgAxALGiADQfmMBGohASAKIAQQDCACIANrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEAgASEDQQAhAQwCCwsMAQsgBCABaiADIAIQCxoLIA0oAgAiAUE/cSEDIA0gAUEIajYCACAKQSBqIQQCQAJAQcAAIANrIgJBCEsEQCAJIQFBCCECDAEFIAQgA2ogCSACEAsaIAkgAmohASAKIAQQDEEIIAJrIgJBwABPBEADQCAEIAEpAAA3AAAgBCABKQAINwAIIAQgASkAEDcAECAEIAEpABg3ABggBCABKQAgNwAgIAQgASkAKDcAKCAEIAEpADA3ADAgBCABKQA4NwA4IAFBQGshASAKIAQQDCACQUBqIgJBwABPDQALCyACBEBBACEDDAILCwwBCyAEIANqIAEgAhALGgsgCigCABAJIQ4gCkEANgIAIBooAgAQCSELIBpBADYCACAbKAIAEAkhByAbQQA2AgAgHCgCABAJIQYgHEEANgIAIB0oAgAQCSEEIB1BADYCACAeKAIAEAkhAyAeQQA2AgAgHygCABAJIQIgH0EANgIAICAoAgAQCSEBICBBADYCACAIIA42AgAgIiALNgIAICMgBzYCACAkIAY2AgAgJSAENgIAICYgAzYCACAnIAI2AgAgKCABNgIAIBEoAgAiAUE/cSEDIBEgAUEgajYC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AEIANwIQIABCADcCGAsgASABKAIAIARqNgIAIAMkBEEBC9YDAQN/IwQhAyMEQYABaiQEIAAgASkCADcCACAAIAEpAgg3AgggACABKQIQNwIQIAAgASkCGDcCGCAAIAEpAiA3AiAgA0HQAGoiBSABEAcgA0EoaiIEIAEgBRAKIABBADYCUCADIAQoAgBBB2o2AgAgAyAEKAIENgIEIAMgBCgCCDYCCCADIAQoAgw2AgwgAyAEKAIQNgIQIAMgBCgCFDYCFCADIAQoAhg2AhggAyAEKAIcNgIcIAMgBCgCIDYCICADIAQoAiQ2AiQgAEEoaiIFIAMQIkUEQCADJARBAA8LIAUQFiAFKAIAIgFBAXEgAkYEQCADJARBAQ8LIAVBvOH//wAgAWs2AgAgAEEsaiIBQfz9//8AIAEoAgBrNgIAIABBMGoiAUH8////ACABKAIAazYCACAAQTRqIgFB/P///wAgASgCAGs2AgAgAEE4aiIBQfz///8AIAEoAgBrNgIAIABBPGoiAUH8////ACABKAIAazYCACAAQUBrIgFB/P///wAgASgCAGs2AgAgAEHEAGoiAUH8////ACABKAIAazYCACAAQcgAaiIBQfz///8AIAEoAgBrNgIAIABBzABqIgBB/P//ByAAKAIAazYCACADJARBAQv2CwIRfwJ+IwQhBSMEQaADaiQEIAVBuAJqIgJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUUEQCAAQQA2ApwBIABBJGoiA0GQiAQpAgA3AgAgA0GYiAQpAgA3AgggA0GgiAQpAgA3AhAgA0GoiAQpAgA3AhggA0GwiAQpAgA3AiAgAEEBNgJ0IABB+ABqIgNCADcCACADQgA3AgggA0IANwIQIANCADcCGCADQQA2AiAgAEGEuLznADYCTCAAQf61r/AANgJQIABBuMz59QA2AlQgAEHny/X2ADYCWCAAQcjQi/gANgJcIABB0vvu4wA2AmAgAEG8gMHtADYCZCAAQYbVuecANgJoIABB2bKj7AA2AmwgAEHG4rcHNgJwIABBATYCBCAAQQhqIgNCADcCACADQgA3AgggA0IANwIQIANBADYCGAsgBUH4AmoiBiAAQQRqIg8QESACIAYpAAA3AAAgAiAGKQAINwAIIAIgBikAEDcAECACIAYpABg3ABggAUEARyIHBEAgAkEgaiIDIAEpAAA3AAAgAyABKQAINwAIIAMgASkAEDcAECADIAEpABg3ABgLIAVBkAJqIQggBUHwAWohBCAFQfAAaiEDIAVByABqIQEgBUEEaiIQIAIgBwR/QcAABUEgCxAqIAJCADcAACACQgA3AAggAkIANwAQIAJCADcAGCACQgA3ACAgAkIANwAoIAJCADcAMCACQgA3ADggAUEEaiECIAFBCGohByABQQxqIQkgAUEQaiEKIAFBFGohCyABQRhqIQwgAUEcaiENIAFBIGohESABQSRqIRIDQCAQIAYQHyAFIAEgBhAURSIONgIAIA4EQCAFQQE2AgAMAQUgBSACKAIAIAEoAgByIAcoAgByIAkoAgByIAooAgByIAsoAgByIAwoAgByIA0oAgByIBEoAgByIBIoAgByRSIONgIAIA4NAQsLIAggARAHIABBJGoiAiACIAgQCiAAQcwAaiIHIAcgCBAKIAcgByABEAogAEH0AGoiCCAIIAEQCiABQgA3AgAgAUIANwIIIAFCADcCECABQgA3AhggAUIANwIgIARBBGohASAEQQhqIQggBEEMaiEHIARBEGohCSAEQRRqIQogBEEYaiELIARBHGohDANAIBAgBhAfIAQgBiAFEA4gBSgCAARAIAVBATYCAAwBBSAFIAEoAgAgBCgCAHIgCCgCAHIgBygCAHIgCSgCAHIgCigCAHIgCygCAHIgDCgCAHJFIg02AgAgDQ0BCwsgBkIANwAAIAZCADcACCAGQgA3ABAgBkIANwAYIAAgAyAEEB4gBCAEKAIAIgBBf3OtQsKC2YENfCITIAEoAgAiBiAAciAIKAIAIgByIAcoAgAiEHIgCSgCACINciAKKAIAIhFyIAsoAgAiEnIgDCgCACIOckEAR0EfdEEfda0iFIM+AgAgASATQiCIQoy9yf4LhCAGQX9zrXwiEyAUgz4CACAIIABBf3OtQrvAovoKfCATQiCIfCITIBSDPgIAIAcgEEF/c61C5rm71Qt8IBNCIIh8IhMgFIM+AgAgCSANQX9zrUL+////D3wgE0IgiHwiEyAUgz4CACAKIBFBf3OtQv////8PfCATQiCIfCITIBSDPgIAIAsgEkF/c61C/////w98IBNCIIh8IhMgFIM+AgAgDCAO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KSAGQQhqISogBkEMaiErIAZBEGohLCAGQRRqIS0gBkEYaiEuIAZBHGohLyAGQSBqITAgBkEkaiExIANBBGohMiADQQhqITMgA0EMaiE0IANBEGohNSADQRRqITYgA0EYaiE3IANBHGohOCADQSBqITkgA0EkaiE6IARBBGohOyAEQQhqIQkgBEEMaiEMIARBEGohDiAEQRRqIQ8gBEEYaiERIARBHGohEiAEQSBqIRMgBEEkaiEVIA0oAgBBvOH//wBqIRYgDSgCBEH8/f//AGohFyANKAIIQfz///8AaiEYIA0oAgxB/P///wBqIRkgDSgCEEH8////AGohGiANKAIUQfz///8AaiEbIA0oAhhB/P///wBqIRwgDSgCHEH8////AGohHSANKAIgQfz///8AaiEeIA0oAiRB/P//B2ohH0H/PyEBA0AgBiAHIAFBf2oiAkEGdGoiIBAjIBAgECAGEAogFCAQEAcgKCAUIBAQCiAGIAYgFBAKICkoAgAhISAqKAIAISIgKygCACEjICwoAgAhJCAtKAIAISUgLigCACEmIC8oAgAhJyAwKAIAIQsgMSgCACEFIAYgFiAGKAIAazYCACApIBcgIWs2AgAgKiAYICJrNgIAICsgGSAjazYCACAsIBogJGs2AgAgLSAbICVrNgIAIC4gHCAmazYCACAvIB0gJ2s2AgAgMCAeIAtrNgIAIDEgHyAFazYCACAKIAogKBAKIAMgBikCADcCACADIAYpAgg3AgggAyAGKQIQNwIQIAMgBikCGDcCGCADIAYpAiA3AiAgAxAPIAQgCikCADcCACAEIAopAgg3AgggBCAKKQIQNwIQIAQgCikCGDcCGCAEIAopAiA3AiAgBBAPICAgMigCACILQRp0IAMoAgByNgIAIAcgAkEGdGogMygCACIFQRR0IAtBBnZyNgIEIAcgAkEGdGogNCgCACILQQ50IAVBDHZyNgIIIAcgAkEGdGogNSgCACIFQQh0IAtBEnZyNgIMIAcgAkEGdGogNigCAEECdCAFQRh2ciA3KAIAIgVBHHRyNgIQIAcgAkEGdGogOCgCACILQRZ0IAVBBHZyNgIUIAcgAkEGdGogOSgCACIFQRB0IAtBCnZyNgIYIAcgAkEGdGogOigCAEEKdCAFQRB2cjYCHCAHIAJBBnRqIDsoAgAiC0EadCAEKAIAcjYCICAHIAJBBnRqIAkoAgAiBUEUdCALQQZ2cjYCJCAHIAJBBnRqIAwoAgAiC0EOdCAFQQx2cjYCKCAHIAJBBnRqIA4oAgAiBUEIdCALQRJ2cjYCLCAHIAJBBnRqIA8oAgBBAnQgBUEYdnIgESgCACIFQRx0cjYCMCAHIAJBBnRqIBIoAgAiC0EWdCAFQQR2cjYCNCAHIAJBBnRqIBMoAgAiBUEQdCALQQp2cjYCOCAHIAJBBnRqIBUoAgBBCnQgBUEQdnI2AjwgAUEBSgRAIAIhAQwBCwsLIAgkBCAAC5wSAhl/An4jBCEKIwRBoARqJAQgAEEEaiIeKAIARQRAQbqLBCAAKAKoASAAKAKkAUEDcUECahEAACAKJARBAA8LIAJFBEBBrIsEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAokBEEADwsgAUUEQEHMjAQgACgCqAEgACgCpAFBA3FBAmoRAAAgCiQEQQAPCyADRQRAQYiMBCAAKAKoASAAKAKkAUEDcUECahEAACAKJARBAA8LIAAgCkHYAGoiCSADEDBFBEAgCiQEQQAPCyAJKAIEIRMgCSgCCCEUIAkoAgwhDCAJKAIQIQ0gCSgCFCEOIAkoAhghDyAJKAIcIRIgCSgCICEYIAkoAiQhGSAJKAIoIRogCSgCLCEbIAkoAjAhESAJKAI0IRwgCSgCOCEdIAkoAjwhFSAKIgcgCSgCACIKQf///x9xNgIAIAcgE0EGdEHA//8fcSAKQRp2ciIWNgIEIAcgFEEMdEGA4P8fcSATQRR2ciIXNgIIIAcgDEESdEGAgPAfcSAUQQ52ciIJNgIMIAcgDUEYdEGAgIAYcSAMQQh2ciITNgIQIAcgDUECdkH///8fcSIUNgIUIAcgDkEEdEHw//8fcSANQRx2ciIMNgIYIAcgD0EKdEGA+P8fcSAOQRZ2ciIONgIcIAcgEkEQdEGAgPwfcSAPQRB2ciIPNgIgIAcgEkEKdiIKNgIkIAcgGEH///8fcTYCKCAHIBlBBnRBwP//H3EgGEEadnI2AiwgByAaQQx0QYDg/x9xIBlBFHZyNgIwIAcgG0ESdEGAgPAfcSAaQQ52cjYCNCAHIBFBGHRBgICAGHEgG0EIdnI2AjggByARQQJ2Qf///x9xNgI8IAdBQGsgHEEEdEHw//8fcSARQRx2cjYCACAHIB1BCnRBgPj/H3EgHEEWdnI2AkQgByAVQRB0QYCA/B9xIB1BEHZyNgJIIAcgFUEKdjYCTCAHQdAAaiIZQQA2AgAgFiAHKAIAciAXciAJciATciAUciAMciAOciAPciAKckUEQEHajAQgACgCqAEgACgCpAFBA3FBAmoRAAALIAdB8ANqIREgB0HIA2ohEiAHQagDaiEGIAdBrAJqIRAgB0HYAWohDSAHQbgBaiEIIAdBmAFqIgsgA0EAEA4CfwJAIAtBBGoiGCgCACALKAIAciALQQhqIhooAgAiDHIgC0EMaiIbKAIAIg5yIAtBEGoiHCgCACIPciALQRRqIh0oAgAiCnIgC0EYaiIVKAIAIgNyIAtBHGoiFigCACIAckUNACARQQA2AgAgBiAAQRh2OgAAIAYgAEEQdjoAASAGIABBCHY6AAIgBiAAOgADIAYgA0EYdjoABCAGIANBEHY6AAUgBiADQQh2OgAGIAYgAzoAByAGIApBGHY6AAggBiAKQRB2OgAJIAYgCkEIdjoACiAGIAo6AAsgBiAPQRh2OgAMIAYgD0EQdjoADSAGIA9BCHY6AA4gBiAPOgAPIAYgDkEYdjoAECAGIA5BEHY6ABEgBiAOQQh2OgASIAYgDjoAEyAGIAxBGHY6ABQgBiAMQRB2OgAVIAYgDEEIdjoAFiAGIAw6ABcgBiAYKAIAIgBBGHY6ABggBiAAQRB2OgAZIAYgAEEIdjoAGiAGIAA6ABsgBiALKAIAIgBBGHY6ABwgBiAAQRB2OgAdIAYgAEEIdjoAHiAGIAA6AB8CQCASIAIgBkG5jQQgBUEAIAQEfyAEBUEBCyIKQQFxEQEAIgAEQCAIQQRqIRcgCEEIaiEJIAhBDGohEyAIQRBqIRQgCEEUaiEMIAhBGGohDiAIQRxqIQ9BASEEA0AgCCASIBEQDiARKAIARQRAIBcoAgAgCCgCAHIgCSgCAHIgEygCAHIgFCgCAHIgDCgCAHIgDigCAHIgDygCAHINAwsgCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIARBAWohAyASIAIgBkG5jQQgBSAEIApBAXERAQAiAARAIAMhBAwBBUEAIQALCwVBACEACwsgAEUNACAeIBAgCBAeIA0gECgCeDYCUCAQQdAAaiIAIAAQFSARIAAQByASIAAgERAKIBAgECAREAogEEEoaiIDIAMgEhAKIABBATYCACAQQdQAaiIAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAEEANgIgIA0gECkCADcCACANIBApAgg3AgggDSAQKQIQNwIQIA0gECkCGDcCGCANIBApAiA3AiAgDUEoaiIAIAMpAgA3AgAgACADKQIINwIIIAAgAykCEDcCECAAIAMpAhg3AhggACADKQIgNwIgIBgoAgAgCygCAHIgGigCAHIgGygCAHIgHCgCAHIgHSgCAHIgFSgCAHIgFigCAHIEQCAIQQRqIhUoAgAgCCgCAHIgCEEIaiIWKAIAciAIQQxqIhcoAgByIAhBEGoiCSgCAHIgCEEUaiITKAIAciAIQRhqIhQoAgByIAhBHGoiDCgCAHJBAEcgGSgCAEVxBEAgESAAECJFBEAgCCAIKAIAIgBBf3OtQsKC2YENfCIfIBUoAgAiDiAAciAWKAIAIg9yIBcoAgAiCnIgCSgCACIFciATKAIAIgRyIBQoAgAiA3IgDCgCACIAckEAR0EfdEEfda0iIIM+AgAgFSAfQiCIQoy9yf4LhCAOQX9zrXwiHyAggz4CACAWIA9Bf3OtQrvAovoKfCAfQiCIfCIfICCDPgIAIBcgCkF/c61C5rm71Qt8IB9CIIh8Ih8gIIM+AgAgCSAFQX9zrUL+////D3wgH0IgiHwiHyAggz4CACATIARBf3OtQv////8PfCAfQiCIfCIfICCDPgIAIBQgA0F/c61C/////w98IB9CIIh8Ih8gIIM+AgAgDCAAQX9zrUL/////D3wgH0IgiHwgIIM+AgALIA0QDyABIA0QHSASIAEgByACECggBiASIAsQDSAGIAYgCBAcIAFBIGogBhARQQEMAwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4QQALIQAgC0IANwIAIAtCADcCCCALQgA3AhAgC0IANwIYIAckBCAAC7MLAhR/An4jBCEEIwRBkARqJAQgACgCAEUEQEH4igQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyACRQRAQayLBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAA8LIAFFBEBBzIwEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgA0UEQEHkiAQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyADKAAEIQggAygACCEJIAMoAAwhCiADKAAQIQUgAygAFCELIAMoABghDCADKAAcIQ0gAygAICEOIAMoACQhDyADKAAoIRAgAygALCERIAMoADAhByADKAA0IRIgAygAOCETIAMoADwhFCAEIAMoAAAiA0H///8fcTYCACAEIAhBBnRBwP//H3EgA0EadnIiFTYCBCAEIAlBDHRBgOD/H3EgCEEUdnIiFjYCCCAEIApBEnRBgIDwH3EgCUEOdnIiFzYCDCAEIAVBGHRBgICAGHEgCkEIdnIiCDYCECAEIAVBAnZB////H3EiCTYCFCAEIAtBBHRB8P//H3EgBUEcdnIiCjYCGCAEIAxBCnRBgPj/H3EgC0EWdnIiCzYCHCAEIA1BEHRBgID8H3EgDEEQdnIiDDYCICAEIA1BCnYiAzYCJCAEIA5B////H3E2AiggBCAPQQZ0QcD//x9xIA5BGnZyNgIsIAQgEEEMdEGA4P8fcSAPQRR2cjYCMCAEIBFBEnRBgIDwH3EgEEEOdnI2AjQgBCAHQRh0QYCAgBhxIBFBCHZyNgI4IAQgB0ECdkH///8fcTYCPCAEQUBrIBJBBHRB8P//H3EgB0EcdnI2AgAgBCATQQp0QYD4/x9xIBJBFnZyNgJEIAQgFEEQdEGAgPwfcSATQRB2cjYCSCAEIBRBCnY2AkwgBEHQAGoiD0EANgIAIBUgBCgCAHIgFnIgF3IgCHIgCXIgCnIgC3IgDHIgA3JFBEBB2owEIAAoAqgBIAAoAqQBQQNxQQJqEQAACyAEQeADaiEQIARBuANqIQ0gBEG8AmohBSAEQcABaiEHIARBmAFqIQ4gBEH4AGohBiAEQdQAaiIDQQA2AgAgBEHYAGoiESABQSBqIAMQDiADKAIABH9BAAUgDiABEBQEfyAGIAEgBCACECggBiAGKAIAIgFBf3OtQsKC2YENfCIYIAZBBGoiEigCACITIAFyIAZBCGoiFCgCACIVciAGQQxqIhYoAgAiF3IgBkEQaiIIKAIAIglyIAZBFGoiCigCACILciAGQRhqIgwoAgAiA3IgBkEcaiICKAIAIgFyQQBHQR90QR91rSIZgz4CACASIBhCIIhCjL3J/guEIBNBf3OtfCIYIBmDPgIAIBQgFUF/c61Cu8Ci+gp8IBhCIIh8IhggGYM+AgAgFiAXQX9zrULmubvVC3wgGEIgiHwiGCAZgz4CACAIIAlBf3OtQv7///8PfCAYQiCIfCIYIBmDPgIAIAogC0F/c61C/////w98IBhCIIh8IhggGYM+AgAgDCADQX9zrUL/////D3wgGEIgiHwiGCAZgz4CACACIAFBf3OtQv////8PfCAYQiCIfCAZgz4CACAFIA8oAgA2AnggBSAEKQIANwIAIAUgBCkCCDcCCCAFIAQpAhA3AhAgBSAEKQIYNwIYIAUgBCkCIDcCICAFQShqIgIgBEEoaiIBKQIANwIAIAIgASkCCDcCCCACIAEpAhA3AhAgAiABKQIYNwIYIAIgASkCIDcCICAFQQE2AlAgBUHUAGoiAUIANwIAIAFCADcCCCABQgA3AhAgAUIANwIYIAFBADYCICAAIAcgBSAGIBEQGSAHQfgAaiIAKAIABH9BAAUgDiAHECEEfyAAKAIABH9BAAUgDSAHQShqIAdB0ABqEAogECANECJBAEcLBUEACwsFQQALCyEAIAQkBCAAC+cPAhZ/An4jBCEFIwRBgAZqJAQgACgCAEUEQEH4igQgACgCqAEgACgCpAFBA3FBAmoRAAAgBSQEQQAPCyADRQRAQayLBCAAKAKoASAAKAKkAUEDcUECahEAACAFJARBAA8LIAJFBEBB9osEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgAUUEQEHkiAQgACgCqAEgACgCpAFBA3FBAmoRAAAgBSQEQQAPCyAFQbAFaiEVIAVBiAVqIRggBUHYBWohBCAFQeAEaiEGIAVBjARqIQwgBUGQA2ohDSAFQfACaiEWIAVB0AJqIQsgBUGwAmohGSAFQbQBaiEIIAVB4ABqIQ4gBUFAayIHIAIpAAA3AAAgByACKQAINwAIIAcgAikAEDcAECAHIAIpABg3ABggBUEgaiIJIAJBIGoiCikAADcAACAJIAopAAg3AAggCSAKKQAQNwAQIAkgCikAGDcAGCACQUBrLQAAIRQgBSADQQAQDgJAIAcoAgQiAiAHKAIAciAHKAIIIgNyIAcoAgwiCnIgBygCECIPciAHKAIUIhByIAcoAhgiEXIgBygCHCIScgRAIAkoAgQgCSgCAHIgCSgCCHIgCSgCDHIgCSgCEHIgCSgCFHIgCSgCGHIgCSgCHHJFDQEgBCASQRh2OgAAIAQgEkEQdjoAASAEIBJBCHY6AAIgBCASOgADIAQgEUEYdjoABCAEIBFBEHY6AAUgBCARQQh2OgAGIAQgEToAByAEIBBBGHY6AAggBCAQQRB2OgAJIAQgEEEIdjoACiAEIBA6AAsgBCAPQRh2OgAMIAQgD0EQdjoADSAEIA9BCHY6AA4gBCAPOgAPIAQgCkEYdjoAECAEIApBEHY6ABEgBCAKQQh2OgASIAQgCjoAEyAEIANBGHY6ABQgBCADQRB2OgAVIAQgA0EIdjoAFiAEIAM6ABcgBCACQRh2OgAYIAQgAkEQdjoAGSAEIAJBCHY6ABogBCACOgAbIAQgBygCACICQRh2OgAcIAQgAkEQdjoAHSAEIAJBCHY6AB4gBCACOgAfIAYgBBAUGiAUQQJxBEAgBkEkaiIEKAIADQIgBkEgaiIKKAIADQIgBkEcaiIPKAIADQIgBkEYaiIQKAIADQIgBkEUaiIRKAIADQIgBkEQaiISKAIAIgNBo6KVCksNAiAGQQxqIhcoAgAhAgJAIANBo6KVCkYEQCACQd2FlQNLDQQgAkHdhZUDRgRAIAYoAggiAkGCiPEPSw0FIAJBgojxD0cEQEHdhZUDIQIMAwsgBigCBCICQYu5oRtLDQUgAkGLuaEbRwRAQd2FlQMhAgwDCyAGKAIAQe31ph5NBEBB3YWVAyECDAMLDAULCwsgBiAGKAIAQcGC2QFqNgIAIAZBBGoiEyATKAIAQbTG3gRqNgIAIAZBCGoiEyATKAIAQf33jhBqNgIAIBcgAkGi+uocajYCACASIANB3N3qFWo2AgAgEUH///8fNgIAIBBB////HzYCACAPQf///x82AgAgCkH///8fNgIAIARB////ATYCAAsgDCAGIBRBAXEQLkUNASANIAwoAlA2AnggDSAMKQIANwIAIA0gDCkCCDcCCCANIAwpAhA3AhAgDSAMKQIYNwIYIA0gDCkCIDcCICANQShqIgIgDEEoaiIDKQIANwIAIAIgAykCCDcCCCACIAMpAhA3AhAgAiADKQIYNwIYIAIgAykCIDcCICANQQE2AlAgDUHUAGoiAkIANwIAIAJCADcCCCACQgA3AhAgAkIANwIYIAJBADYCICAWIAcQICALIBYgBRANIAsgCygCACICQX9zrULCgtmBDXwiGiALQQRqIgMoAgAiBCACciALQQhqIgIoAgAiBnIgC0EMaiIHKAIAIgxyIAtBEGoiCigCACIPciALQRRqIhAoAgAiEXIgC0EYaiISKAIAIhRyIAtBHGoiFygCACITckEAR0EfdEEfda0iG4M+AgAgAyAaQiCIQoy9yf4LhCAEQX9zrXwiGiAbgz4CACACIAZBf3OtQrvAovoKfCAaQiCIfCIaIBuDPgIAIAcgDEF/c61C5rm71Qt8IBpCIIh8IhogG4M+AgAgCiAPQX9zrUL+////D3wgGkIgiHwiGiAbgz4CACAQIBFBf3OtQv////8PfCAaQiCIfCIaIBuDPgIAIBIgFEF/c61C/////w98IBpCIIh8IhogG4M+AgAgFyATQX9zrUL/////D3wgGkIgiHwgG4M+AgAgGSAWIAkQDSAAIAggDSAZIAsQGSAOIAhB+ABqIgMoAgAiADYCUCAARQRAIAhB0ABqIgIgAhAVIBUgAhAHIBggAiAVEAogCCAIIBUQCiAIQShqIgAgACAYEAogAkEBNgIAIAhB1ABqIgJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCACQQA2AiAgDiAIKQIANwIAIA4gCCkCCDcCCCAOIAgpAhA3AhAgDiAIKQIYNwIYIA4gCCkCIDcCICAOQShqIgIgACkCADcCACACIAApAgg3AgggAiAAKQIQNwIQIAIgACkCGDcCGCACIAApAiA3AiAgAygCACEACyAARQRAIAEgDhAbIAUkBEEBDwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAUkBEEAC6AGARF/IwQhBiMEQdABaiQEIAZBADYCACAAQQRqIg8oAgBFBEBBuosEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAYkBEEADwsgAkUEQEGsiwQgACgCqAEgACgCpAFBA3FBAmoRAAAgBiQEQQAPCyABRQRAQfaLBCAAKAKoASAAKAKkAUEDcUECahEAACAGJARBAA8LIANFBEBBiIwEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAYkBEEADwsgBkGIAWohCiAGQegAaiELIAZByABqIQcgBkEoaiEIIAZBCGohCSAGQQRqIQ0gBkGoAWohDCAEBH8gBAVBAQshDiAHIAMgBhAOIAYoAgBFBEAgBygCBCAHKAIAciAHKAIIciAHKAIMciAHKAIQciAHKAIUciAHKAIYciAHKAIccgRAIAkgAkEAEA4CQCAMIAIgA0EAIAVBACAOQQFxEQEAIgAEQCAIQQRqIRAgCEEIaiERIAhBDGohEiAIQRBqIRMgCEEUaiEUIAhBGGohFSAIQRxqIRZBACEEA0AgCCAMIAYQDiAGKAIARQRAIBAoAgAgCCgCAHIgESgCAHIgEigCAHIgEygCAHIgFCgCAHIgFSgCAHIgFigCAHIEQCAPIAogCyAHIAkgCCANEDENBAsLIAwgAiADQQAgBSAEQQFqIgQgDkEBcREBACIADQBBACEACwVBACEACwsgCUIANwIAIAlCADcCCCAJQgA3AhAgCUIANwIYIAhCADcCACAIQgA3AgggCEIANwIQIAhCADcCGCAHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggAARAIA0oAgAhAyABIAopAAA3AAAgASAKKQAINwAIIAEgCikAEDcAECABIAopABg3ABggAUEgaiICIAspAAA3AAAgAiALKQAINwAIIAIgCykAEDcAECACIAspABg3ABggAUFAayADOgAAIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAGJARBAAv+AQECfyMEIQQjBEFAayQEIAFFBEBByooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgA0UEQEGuigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEQSBqIQUgAgR/IAUgAykAADcAACAFIAMpAAg3AAggBSADKQAQNwAQIAUgAykAGDcAGCAEIANBIGoiACkAADcAACAEIAApAAg3AAggBCAAKQAQNwAQIAQgACkAGDcAGCACIANBQGstAAA2AgAgASAFEBEgAUEgaiAEEBEgBCQEQQEFQb6MBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAAsL7wIBA38jBCEEIwRB0ABqJAQgBEEANgIAIAFFBEBBrooEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAkUEQEG6igQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyADQQNLBEBBpYwEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgBEEoaiIFIAIgBBAOIAQoAgAhACAEQQhqIgYgAkEgaiAEEA4gBCgCACAAckUiACECIAAEfyABIAUpAAA3AAAgASAFKQAINwAIIAEgBSkAEDcAECABIAUpABg3ABggAUEgaiIAIAYpAAA3AAAgACAGKQAINwAIIAAgBikAEDcAECAAIAYpABg3ABggAUFAayADOgAAIAQkBCACBSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAFBQGtBADoAACAEJAQgAgsLlCoBX38jBCEHIwRBwANqJAQgB0GgAWohCCAHQfgAaiEKIAFB+ABqIUAgB0GQA2oiBiABQdAAaiI9EAcgB0HoAmoiAyABKQIANwIAIAMgASkCCDcCCCADIAEpAhA3AhAgAyABKQIYNwIYIAMgASkCIDcCICADQSRqIiUoAgAiFEEWdiIEQdEHbCADKAIAaiEFIARBBnQgA0EEaiImKAIAaiAFQRp2aiIVQRp2IANBCGoiJygCAGoiFkEadiADQQxqIhwoAgBqIhdBGnYgA0EQaiIdKAIAaiIYQRp2IANBFGoiMSgCAGoiDkEadiADQRhqIjIoAgBqIiBBGnYgA0EcaiIzKAIAaiIhQRp2IANBIGoiNCgCAGohBCADIAVB////H3E2AgAgJiAVQf///x9xNgIAICcgFkH///8fcTYCACAcIBdB////H3E2AgAgHSAYQf///x9xNgIAIDEgDkH///8fcTYCACAyICBB////H3E2AgAgMyAhQf///x9xNgIAIDQgBEH///8fcTYCACAlIARBGnYgFEH///8BcWo2AgAgB0HAAmoiBCACIAYQCiABKAJMIhlBFnYiBUHRB2wgASgCKGohGiAFQQZ0IAEoAixqIBpBGnZqIihBGnYgASgCMGoiKUEadiABKAI0aiIqQRp2IAEoAjhqIitBGnYgASgCPGoiLEEadiABQUBrKAIAaiItQRp2IAEoAkRqIiJBGnYgASgCSGohHiAHQZgCaiIFIAJBKGoiWCAGEAogBSAFID0QCiAHQfABaiIBIAMpAgA3AgAgASADKQIINwIIIAEgAykCEDcCECABIAMpAhg3AhggASAD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aiI6KAIAayETIDogEzYCAEH8////ACAKQSBqIjsoAgBrIR8gOyAfNgIAQfz//wcgCkEkaiI/KAIAayEbID8gGzYCACAuKAIAIBtqIkJBFnYiPEHRB2wgASgCACAkamohGyA8QQZ0IBQoAgAgCWpqIBtBGnZqIiRBGnYgFSgCACALamoiC0EadiAWKAIAIA9qaiIPQRp2IBcoAgAgDGpqIgxBGnYgGCgCACANamoiDUEadiAOKAIAIBJqaiISQRp2ICAoAgAgE2pqIhNBGnYgISgCACAfamohCSABIBtB////H3EiHzYCACAUICRB////H3EiGzYCACAVIAtB////H3EiCzYCACAWIA9B////H3EiDzYCACAXIAxB////H3EiDDYCACAYIA1B////H3EiDTYCACAOIBJB////H3EiEjYCACAgIBNB////H3EiEzYCACAhIAlB////H3EiJDYCACAuIAlBGnYgQkH///8BcWoiCTYCACAAIAEpAgA3AgAgACABKQIINwIIIAAgASkCEDcCECAAIAEpAhg3AhggACABKQIgNwIgIAEgH0EBdCAKKAIAajYCACAUIBtBAXQgAygCAGo2AgAgFSALQQF0IBAoAgBqNgIAIBYgD0EBdCARKAIAajYCACAXIAxBAXQgIygCAGo2AgAgGCANQQF0IDAoAgBqNgIAIA4gEkEBdCA5KAIAajYCACAgIBNBAXQgOigCAGo2AgAgISAkQQF0IDsoAgBqNgIAIC4gCUEBdCA/KAIAajYCACABIAEgBxAKIAEgASgCACAIKAIAaiIBNgIAIBQgFCgCACAeKAIAaiIDNgIAIBUgFSgCACAZKAIAaiIINgIAIBYgFigCACAlKAIAaiIKNgIAIBcgFygCACAmKAIAaiIUNgIAIBggGCgCACAnKAIAaiIVNgIAIA4gDigCACAcKAIAaiIWNgIAICAgICgCACAdKAIAaiIXNgIAICEgISgCACAiKAIAaiIYNgIAIC4gLigCACAvKAIAaiIONgIAQfj//w8gDmsiD0EWdiIOQdEHbEH4wv//ASABa2ohASAOQQZ0Qfj7//8BIANraiABQRp2aiIcQRp2Qfj///8BIAhraiIdQRp2Qfj///8BIApraiIJQRp2Qfj///8BIBRraiIQQRp2Qfj///8BIBVraiILQRp2Qfj///8BIBZraiIR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FHZyNgIwIAIgEUESdEGAgPAfcSAQQQ52cjYCNCACIAVBGHRBgICAGHEgEUEIdnI2AjggAiAFQQJ2Qf///x9xNgI8IAJBQGsgEkEEdEHw//8fcSAFQRx2cjYCACACIBNBCnRBgPj/H3EgEkEWdnI2AkQgAiAUQRB0QYCA/B9xIBNBEHZyNgJIIAIgFEEKdjYCTCACQdAAaiINQQA2AgAgDiACKAIAciAGciAHciAIciAVciADciAKciALciAMckUEQEHajAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIARBwAJqIQogBEGYAmohCyAEQfgBaiEIIARB/ABqIQMgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAJKAIEIAkoAgByIAkoAghyIAkoAgxyIAkoAhByIAkoAhRyIAkoAhhyIAkoAhxyBH8gCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIANB+ABqIgxBADYCACADIAIpAgA3AgAgAyACKQIINwIIIAMgAikCEDcCECADIAIpAhg3AhggAyACKQIgNwIgIANBKGoiBSACQShqIgYpAgA3AgAgBSAGKQIINwIIIAUgBikCEDcCECAFIAYpAhg3AhggBSAGKQIgNwIgIANBATYCUCADQdQAaiIHQgA3AgAgB0IANwIIIAdCADcCECAHQgA3AhggB0EANgIgIAAgAyADIAkgCBAZIA0gDCgCADYCACADQdAAaiIAIAAQFSAKIAAQByALIAAgChAKIAMgAyAKEAogBSAFIAsQCiAAQQE2AgAgB0IANwIAIAdCADcCCCAHQgA3AhAgB0IANwIYIAdBADYCICACIAMpAgA3AgAgAiADKQIINwIIIAIgAykCEDcCECACIAMpAhg3AhggAiADKQIgNwIgIAYgBSkCADcCACAGIAUpAgg3AgggBiAFKQIQNwIQIAYgBSkCGDcCGCAGIAUpAiA3AiAgASACEBsgBCQEQQEFIAQkBEEACwvhAgEBfyMEIQMjBEHQAGokBCADQQA2AgAgAUUEQEGIjAQgACgCqAEgACgCpAFBA3FBAmoRAAAgAyQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACADJARBAA8LIANBKGoiACACIAMQDiADQQhqIgIgAUEAEA4gAygCAAR/IAFCADcAACABQgA3AAggAUIANwAQIAFCADcAGEEABSAAKAIEIAAoAgByIAAoAghyIAAoAgxyIAAoAhByIAAoAhRyIAAoAhhyIAAoAhxyBH8gAiACIAAQDSABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggASACEBFBAQUgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYQQALCyEBIAJCADcCACACQgA3AgggAkIANwIQIAJCADcCGCAAQgA3AgAgAEIANwIIIABCADcCECAAQgA3AhggAyQEIAELgAsBE38jBCEEIwRB8AJqJAQgBEEANgIAIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAQkBEEADwsgAUUEQEHkiAQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyACRQRAQZeMBCAAKAKoASAAKAKkAUEDcUECahEAACAEJARBAA8LIARBCGoiFCACIAQQDiAEKAIABEAgAUIANwAAIAFCADcACCABQgA3ABAgAUIANwAYIAFCADcAICABQgA3ACggAUIANwAwIAFCADcAOCAEJARBAA8LIAEoAAQhBiABKAAIIQcgASgADCEIIAEoABAhAyABKAAUIQkgASgAGCEKIAEoABwhCyABKAAgIQwgASgAJCENIAEoACghDyABKAAsIRAgASgAMCEFIAEoADQhESABKAA4IRIgASgAPCETIARBKGoiAiABKAAAIg5B////H3E2AgAgAiAGQQZ0QcD//x9xIA5BGnZyIg42AgQgAiAHQQx0QYDg/x9xIAZBFHZyIgY2AgggAiAIQRJ0QYCA8B9xIAdBDnZyIgc2AgwgAiADQRh0QYCAgBhxIAhBCHZyIgg2AhAgAiADQQJ2Qf///x9xIhU2AhQgAiAJQQR0QfD//x9xIANBHHZyIgM2AhggAiAKQQp0QYD4/x9xIAlBFnZyIgk2AhwgAiALQRB0QYCA/B9xIApBEHZyIgo2AiAgAiALQQp2Igs2AiQgAiAMQf///x9xNgIoIAIgDUEGdEHA//8fcSAMQRp2cjYCLCACIA9BDHRBgOD/H3Eg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AWoiBCANQQFxEQEAIgANAEEAIQALBUEAIQALCyAJQgA3AgAgCUIANwIIIAlCADcCECAJQgA3AhggCEIANwIAIAhCADcCCCAIQgA3AhAgCEIANwIYIAdCADcCACAHQgA3AgggB0IANwIQIAdCADcCGCAABEAgASAKKQAANwAAIAEgCikACDcACCABIAopABA3ABAgASAKKQAYNwAYIAFBIGoiASALKQAANwAAIAEgCykACDcACCABIAspABA3ABAgASALKQAYNwAYIAYkBCAADwsLCyABQgA3AAAgAUIANwAIIAFCADcAECABQgA3ABggAUIANwAgIAFCADcAKCABQgA3ADAgAUIANwA4IAYkBEEAC9cCAQJ/IwQhByMEQcABaiQEIAdByABqIgYgAikAADcAACAGIAIpAAg3AAggBiACKQAQNwAQIAYgAikAGDcAGCAGQSBqIgIgASkAADcAACACIAEpAAg3AAggAiABKQAQNwAQIAIgASkAGDcAGCAEBH8gBkFAayIBIAQpAAA3AAAgASAEKQAINwAIIAEgBCkAEDcAECABIAQpABg3ABhB4AAFQcAACyEBIAMEQCAGIAFqIgIgAykAADcAACACIAMpAAg3AAggAUEQciEBCyAHIAYgARAqIAZCADcAACAGQgA3AAggBkIANwAQIAZCADcAGCAGQgA3ACAgBkIANwAoIAZCADcAMCAGQgA3ADggBkFAa0IANwAAIAZCADcASCAGQgA3AFAgBkIANwBYIAZCADcAYCAGQgA3AGhBACEBA0AgByAAEB8gAUEBaiIBIAVNDQALIAckBEEBC90QASl/IwQhBSMEQYAEaiQEIAAoAgBFBEBB+IoEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgAkUEQEGsiwQgACgCqAEgACgCpAFBA3FBAmoRAAAgBSQEQQAPCyABRQRAQa6KBCAAKAKoASAAKAKkAUEDcUECahEAACAFJARBAA8LIANFBEBB5IgEIAAoAqgBIAAoAqQBQQNxQQJqEQAAIAUkBEEADwsgBSACQQAQDiAFQUBrIgYgASkAADcAACAGIAEpAAg3AAggBiABKQAQNwAQIAYgASkAGDcAGCAFQSBqIgQgAUEgaiIBKQAANwAAIAQgASkACDcACCAEIAEpABA3ABAgBCABKQAYNwAYIARBGGoi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////HzYCACAGQf///x82AgAgAkH///8BNgIAIAMgBxAhQQBHCwsLCwsLCwsFQQALBUEACwshACAFJAQgAAuYBQIJfwd+IwQhBCMEQSBqJAQgAkUEQEHbigQgACgCqAEgACgCpAFBA3FBAmoRAAAgBCQEQQAPCyAEIgAgAikAADcAACAAIAIpAAg3AAggACACKQAQNwAQIAAgAikAGDcAGCACKAA4IghBf0cgAigAPCIEQR92IgVBf3MiA3EgBEH/////B0lyIAMgAigANCIJQX9HcXIgAyACKAAwIgpBf0dxciADIAIoACwiA0Hz3N3qBUlxciIGQQFzIANB89zd6gVLcSAFciIHQQFzIAIoACgiBUGdoJG9BUlxIAZyIgtBAXMgBUGdoJG9BUtxIAdyIgdBAXMgAigAJCIGQcbepP99SXEgC3JBf3MiCyAGQcbepP99S3EgB3IgCyACKAAgIgJBoMHswAZLcXIhByABRQRAIAAkBCAHDwsgBwRAIAhBf3OtQv////8PfCAJQX9zrUL/////D3wgCkF/c61C/v///w98IANBf3OtQua5u9ULfCAFQX9zrUK7wKL6CnwgBkF/c61CjL3J/gt8IAJBf3OtQsKC2YENfCIMQiCIfCIOQiCIfCIPQiCIfCIQQiCIfCIRQiCIfCISQiCIfCENIAwgBiACciAFciADciAKciAJciAIciAEckEAR0EfdEEfda0iDIOnIQIgDyAMg6chBSAQIAyDpyEDIBEgDIOnIQogEiAMg6chCSANIAyDpyEIIARBf3OtQv////8PfCANQiCIfCAMg6chBCAOIAyDpyEGCyABIAApAAA3AAAgASAAKQAINwAIIAEgACkAEDcAECABIAApABg3ABggASACNgAgIAEgBjYAJCABIAU2ACggASADNgAsIAEgCjYAMCABIAk2ADQgASAINgA4IAEgBDYAPCAAJAQgBwuDAwIGfwh+IAJFBEBB24oEIAAoAqgBIAAoAqQBQQNxQQJqEQAAQQAPCyABBH8gAigAICIAQX9zrULCgtmBDXwhCiACKAAkIgMgAHIgAigAKCIAciACKAAsIgRyIAIoADAiBXIgAigANCIGciACKAA4IgdyIAIoADwiCHJBAEdBH3RBH3WtIQkgB0F/c61C/////w98IAZBf3OtQv////8PfCAFQX9zrUL+////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';

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha1Base64Bytes = void 0;
/* eslint-disable tsdoc/syntax */
/**
 * @hidden
 */
// prettier-ignore
exports.sha1Base64Bytes = 'AGFzbQEAAAABRgxgAn9/AX9gAn9/AGADf39/AGABfwF/YAV/f39/fwF/YAN/f38Bf2AAAGABfwBgBX9/f39/AGAAAX9gBH9/f38AYAF/AX4CGwEGLi9zaGExEF9fd2JpbmRnZW5fdGhyb3cAAQMvLgABAgMEBgcCAgEBBwgCAwEBCQAHCgoCAQgCAQECCggCAAEHBwcBAQAABwsFBQUEBQFwAQUFBQMBABEGCQF/AUGQl8AACwd/CAZtZW1vcnkCAARzaGExAAgJc2hhMV9pbml0AAwLc2hhMV91cGRhdGUADQpzaGExX2ZpbmFsAA4RX193YmluZGdlbl9tYWxsb2MADw9fX3diaW5kZ2VuX2ZyZWUAEB5fX3diaW5kZ2VuX2dsb2JhbF9hcmd1bWVudF9wdHIAEgkKAQBBAQsEISkqKwqLiAEuFgAgAUHfAEsEQCAADwtB4AAgARACAAt9AQF/IwBBMGsiAiQAIAIgATYCBCACIAA2AgAgAkEsakECNgIAIAJBFGpBAjYCACACQRxqQQI2AgAgAkECNgIkIAJBtBY2AgggAkECNgIMIAJB9A42AhAgAiACNgIgIAIgAkEEajYCKCACIAJBIGo2AhggAkEIakHEFhAiAAuyAQEDfyMAQRBrIgMkAAJAAkACQCACQX9KBEBBASEEIAIEQCACEAQiBEUNAwsgAyAENgIAIAMgAjYCBCADQQA2AgggA0EAIAJBAUEBEAVB/wFxIgRBAkcNASADQQhqIgQgBCgCACIFIAJqNgIAIAUgAygCAGogASACECwaIABBCGogBCgCADYCACAAIAMpAwA3AgAgA0EQaiQADwsQBgALIARBAXENARAGAAsAC0H0FhAHAAurGQIIfwF+AkACQAJAAkACQAJAAkACQAJAAkACQAJ/AkACQAJ/AkACQAJAAkACQAJAAn8CQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAEH0AU0EQEGkESgCACIFQRAgAEELakF4cSAAQQtJGyICQQN2IgFBH3EiA3YiAEEDcUUNASAAQX9zQQFxIAFqIgJBA3QiA0G0EWooAgAiAEEIaiEEIAAoAggiASADQawRaiIDRg0CIAEgAzYCDCADQQhqIAE2AgAMAwsgAEFATw0cIABBC2oiAEF4cSECQagRKAIAIghFDQlBACACayEBAn9BACAAQQh2IgBFDQAaQR8iBiACQf///wdLDQAaIAJBJiAAZyIAa0EfcXZBAXFBHyAAa0EBdHILIgZBAnRBtBNqKAIAIgBFDQYgAkEAQRkgBkEBdmtBH3EgBkEfRht0IQUDQAJAIAAoAgRBeHEiByACSQ0AIAcgAmsiByABTw0AIAAhBCAHIgFFDQYLIABBFGooAgAiByADIAcgACAFQR12QQRxakEQaigCACIARxsgAyAHGyEDIAVBAXQhBSAADQALIANFDQUgAyEADAcLIAJBtBQoAgBNDQggAEUNAiAAIAN0QQIgA3QiAEEAIABrcnEiAEEAIABrcWgiAUEDdCIEQbQRaigCACIAKAIIIgMgBEGsEWoiBEYNCiADIAQ2AgwgBEEIaiADNgIADAsLQaQRIAVBfiACd3E2AgALIAAgAkEDdCICQQNyNgIEIAAgAmoiACAAKAIEQQFyNgIEIAQPC0GoESgCACIARQ0FIABBACAAa3FoQQJ0QbQTaigCACIFKAIEQXhxIAJrIQEgBSIDKAIQIgBFDRRBAAwVC0EAIQEMAgsgBA0CC0EAIQRBAiAGQR9xdCIAQQAgAGtyIAhxIgBFDQIgAEEAIABrcWhBAnRBtBNqKAIAIgBFDQILA0AgACgCBEF4cSIDIAJPIAMgAmsiByABSXEhBSAAKAIQIgNFBEAgAEEUaigCACEDCyAAIAQgBRshBCAHIAEgBRshASADIgANAAsgBEUNAQtBtBQoAgAiACACSQ0BIAEgACACa0kNAQsCQAJAAkBBtBQoAgAiASACSQRAQbgUKAIAIgAgAk0NAQweC0G8FCgCACEAIAEgAmsiA0EQTw0BQbwUQQA2AgBBtBRBADYCACAAIAFBA3I2AgQgACABaiIBQQRqIQIgASgCBEEBciEBDAILQQAhASACQa+ABGoiA0EQdkAAIgBBf0YNFCAAQRB0IgVFDRRBxBRBxBQoAgAgA0GAgHxxIgdqIgA2AgBByBRByBQoAgAiASAAIAAgAUkbNgIAQcAUKAIAIgFFDQlBzBQhAANAIAAoAgAiAyAAKAIEIgRqIAVGDQsgACgCCCIADQALDBILQbQUIAM2AgBBvBQgACACaiIFNgIAIAUgA0EBcjYCBCAAIAFqIAM2AgAgAkEDciEBIABBBGohAgsgAiABNgIAIABBCGoPCyAEECUgAUEPSw0CIAQgASACaiIAQQNyNgIEIAQgAGoiACAAKAIEQQFyNgIEDAwLQaQRIAVBfiABd3E2AgALIABBCGohAyAAIAJBA3I2AgQgACACaiIFIAFBA3QiASACayICQQFyNgIEIAAgAWogAjYCAEG0FCgCACIARQ0DIABBA3YiBEEDdEGsEWohAUG8FCgCACEAQaQRKAIAIgdBASAEQR9xdCIEcUUNASABKAIIDAILIAQgAkEDcjYCBCAEIAJqIgAgAUEBcjYCBCAAIAFqIAE2AgAgAUH/AUsNBSABQQN2IgFBA3RBrBFqIQJBpBEoAgAiA0EBIAFBH3F0IgFxRQ0HIAJBCGohAyACKAIIDAgLQaQRIAcgBHI2AgAgAQshBCABQQhqIAA2AgAgBCAANgIMIAAgATYCDCAAIAQ2AggLQbwUIAU2AgBBtBQgAjYCACADDwsCQEHgFCgCACIABEAgACAFTQ0BC0HgFCAFNgIAC0EAIQBB0BQgBzYCAEHMFCAFNgIAQeQUQf8fNgIAQdgUQQA2AgADQCAAQbQRaiAAQawRaiIBNgIAIABBuBFqIAE2AgAgAEEIaiIAQYACRw0ACyAFIAdBWGoiAEEBcjYCBEHAFCAFNgIAQdwUQYCAgAE2AgBBuBQgADYCACAFIABqQSg2AgQMCQsgACgCDEUNAQwHCyAAIAEQJgwDCyAFIAFNDQUgAyABSw0FIABBBGogBCAHajYCAEHAFCgCACIAQQ9qQXhxIgFBeGoiA0G4FCgCACAHaiIFIAEgAEEIamtrIgFBAXI2AgRB3BRBgICAATYCAEHAFCADNgIAQbgUIAE2AgAgACAFakEoNgIEDAYLQaQRIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAEQQhqIQEMBAtBAQshBgNAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIAYOCgABAgQFBggJCgcDCyAAKAIEQXhxIAJrIgUgASAFIAFJIgUbIQEgACADIAUbIQMgACIFKAIQIgANCkEBIQYMEQsgBUEUaigCACIADQpBAiEGDBALIAMQJSABQRBPDQpBCiEGDA8LIAMgASACaiIAQQNyNgIEIAMgAGoiACAAKAIEQQFyNgIEDA0LIAMgAkEDcjYCBCADIAJqIgIgAUEBcjYCBCACIAFqIAE2AgBBtBQoAgAiAEUNCUEEIQYMDQsgAEEDdiIEQQN0QawRaiEFQbwUKAIAIQBBpBEoAgAiB0EBIARBH3F0IgRxRQ0JQQUhBgwMCyAFKAIIIQQMCQtBpBEgByAEcjYCACAFIQRBBiEGDAoLIAVBCGogADYCACAEIAA2AgwgACAFNgIMIAAgBDYCCEEHIQYMCQtBvBQgAjYCAEG0FCABNgIAQQghBgwICyADQQhqDwtBACEGDAYLQQAhBgwFC0EDIQYMBAtBByEGDAMLQQkhBgwCC0EGIQYMAQtBCCEGDAALAAtB4BRB4BQoAgAiACAFIAAgBUkbNgIAIAUgB2ohA0HMFCEAAn8CQAJAAkACQANAIAAoAgAgA0YNASAAKAIIIgANAAsMAQsgACgCDEUNAQtBzBQhAAJAA0AgACgCACIDIAFNBEAgAyAAKAIEaiIDIAFLDQILIAAoAgghAAwACwALIAUgB0FYaiIAQQFyNgIEIAUgAGpBKDYCBCABIANBYGpBeHFBeGoiBCAEIAFBEGpJGyIEQRs2AgRBwBQgBTYCAEHcFEGAgIABNgIAQbgUIAA2AgBBzBQpAgAhCSAEQRBqQdQUKQIANwIAIAQgCTcCCEHQFCAHNgIAQcwUIAU2AgBB1BQgBEEIajYCAEHYFEEANgIAIARBHGohAANAIABBBzYCACADIABBBGoiAEsNAAsgBCABRg0DIAQgBCgCBEF+cTYCBCABIAQgAWsiAEEBcjYCBCAEIAA2AgAgAEH/AU0EQCAAQQN2IgNBA3RBrBFqIQBBpBEoAgAiBUEBIANBH3F0IgNxRQ0CIAAoAggMAwsgASAAECYMAwsgACAFNgIAIAAgACgCBCAHajYCBCAFIAJBA3I2AgQgBSACaiEAIAMgBWsgAmshAkHAFCgCACADRg0EQbwUKAIAIANGDQUgAygCBCIBQQNxQQFHDQkgAUF4cSIEQf8BSw0GIAMoAgwiByADKAIIIgZGDQcgBiAHNgIMIAcgBjYCCAwIC0GkESAFIANyNgIAIAALIQMgAEEIaiABNgIAIAMgATYCDCABIAA2AgwgASADNgIIC0EAIQFBuBQoAgAiACACTQ0ADAgLIAEPC0HAFCAANgIAQbgUQbgUKAIAIAJqIgI2AgAgACACQQFyNgIEDAULIABBtBQoAgAgAmoiAkEBcjYCBEG8FCAANgIAQbQUIAI2AgAgACACaiACNgIADAQLIAMQJQwBC0GkEUGkESgCAEF+IAFBA3Z3cTYCAAsgBCACaiECIAMgBGohAwsgAyADKAIEQX5xNgIEIAAgAkEBcjYCBCAAIAJqIAI2AgACfwJAIAJB/wFNBEAgAkEDdiIBQQN0QawRaiECQaQRKAIAIgNBASABQR9xdCIBcUUNASACQQhqIQMgAigCCAwCCyAAIAIQJgwCC0GkESADIAFyNgIAIAJBCGohAyACCyEBIAMgADYCACABIAA2AgwgACACNgIMIAAgATYCCAsgBUEIag8LQbgUIAAgAmsiATYCAEHAFEHAFCgCACIAIAJqIgM2AgAgAyABQQFyNgIEIAAgAkEDcjYCBCAAQQhqC6UBAQJ/QQIhBQJAAkACQAJAAkAgACgCBCIGIAFrIAJPDQAgASACaiICIAFJIQECQCAEBEBBACEFIAENAiAGQQF0IgEgAiACIAFJGyECDAELQQAhBSABDQELIAJBAEgNACAGRQ0BIAAoAgAgAhATIgFFDQIMAwsgBQ8LIAIQBCIBDQELIAMNAQsgAQRAIAAgATYCACAAQQRqIAI2AgBBAg8LQQEPCwALCABB5BUQBwALZgIBfwN+IwBBMGsiASQAIAApAhAhAiAAKQIIIQMgACkCACEEIAFBFGpBADYCACABIAQ3AxggAUIBNwIEIAFBrA42AhAgASABQRhqNgIAIAEgAzcDICABIAI3AyggASABQSBqECIAC7gBAQF/IwBB4AFrIgMkACADQThqQcwIKAIANgIAIANBMGpBxAgpAgA3AwAgA0IANwMgIANBvAgpAgA3AyggA0E8akEAQcQAEC4aIANBIGogASACEAkgA0GAAWogA0EgakHgABAsGiADQQhqIANBgAFqEAogA0EgaiADQQhqQRQQAyADQYgBaiADQShqKAIANgIAIAMgAykDIDcDgAEgAyADQYABahALIAAgAykDADcCACADQeABaiQAC5cDAQR/IwBBQGoiAyQAIAAgACkDACACrXw3AwAgAyAAQQhqNgIoIAMgA0EoajYCLAJAAkACQAJAAkACQCAAKAIcIgUEQEHAACAFayIEIAJNDQEgA0EYaiAFIAUgAmoiBCAAQSBqEBUgAygCHCACRw0FIAMoAhggASACECwaDAMLIAIhBAwB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QcgAaiICKQMANwMAIAEgASkDQDcDcCABIAw2AoQBIAEgFCAZQR53ajYCgAEgASAPNgKIASABIAY2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQAQHiABKAJsIRYgASkCZCEfIAEoAiAhDSABKAIsIRAgASgCKCEKIAEoAiQhESABIAEoAmAiDjYCcCABIB83AnQgASAWNgJ8IAEgETYChAEgASAKNgKIASABIBA2AowBIAEgDSABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBABAeIAIgAUHoAGoiFikDADcDACABIAEpA2A3A0AgASgCPCEHIAEoAjghCCABKAIwIRIgASgCNCEJIBMgAikDADcDACABIAEpA0A3A3AgASAJNgKEASABIBIgDkEed2o2AoABIAEgCDYCiAEgASAHNgKMASABQeAAaiABQfAAaiABQYABakEAEB4gASgCbCEOIAEpAmQhHyABKAJgIRcgASARIAQgC3NzNgKEASABIA0gBSADc3M2AoABIAEgCiAUIAVzczYCiAEgASAQIAwgBHNzNgKMASABQdAAaiABQYABaiAJIAggBxAfIAEgFzYCcCABIB83AnQgASAONgJ8IAEgASgCVCIDNgKEASABIAEoAlgiCzYCiAEgASABKAJcIg42AowBIAEgASgCQEEedyABKAJQIhVqNgKAASABQeAAaiABQfAAaiABQYABakEAEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAkgBiAMc3M2AoQBIAEgEiAPIBRzczYCgAEgASAIIA0gD3NzNgKIASABIAcgESAGc3M2AowBIAFB8ABqIAFBgAFqIAMgCyAOEB8gASgCfCEEIAEoAnghBSABKAJwIQ8gASgCdCEGIBMgAikDADcDACABIAEpA0A3A3AgASAGNgKEASABIA8gF0Eed2o2AoABIAEgBTYCiAEgASAENgKMASABQeAAaiABQfAAaiABQYABakEBEB4gASgCbCEMIAEpAmQhHyABKAJgIRcgASADIBAgEXNzNgKEASABIBUgCiANc3M2AoABIAEgCyASIApzczYCiAEgASAOIAkgEHNzNgKMASABQfAAaiABQYABaiAGIAUgBBAfIAEoAnAhFCABKAJ8IQ0gASgCeCEQIAEoAnQhCiABIBc2AnAgASAfNwJ0IAEgDDYCfCABIAo2AoQBIAEgEDYCiAEgASANNgKMASABIBQgASgCQEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiACIBYpAwA3AwAgASABKQNgNwNAIAEgBiAHIAlzczYChAEgASAPIAggEnNzNgKAASABIAUgFSAIc3M2AogBIAEgBCADIAdzczYCjAEgAUHwAGogAUGAAWogCiAQIA0QHyABKAJ8IQcgASgCeCEIIAEoAnAhDCABKAJ0IQkgEyACKQMANwMAIAEgASkDQDcDcCABIAk2AoQBIAEgDCAXQR53ajYCgAEgASAINgKIASABIAc2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiABKAJsIRcgASkCZCEfIAEoAmAhGCABIAogDiADc3M2AoQBIAEgFCALIBVzczYCgAEgASAQIA8gC3NzNgKIASABIA0gBiAOc3M2AowBIAFB8ABqIAFBgAFqIAkgCCAHEB8gASgCcCELIAEoAnwhESABKAJ4IRIgASgCdCEDIAEgGDYCcCABIB83AnQgASAXNgJ8IAEgAzYChAEgASASNgKIASABIBE2AowBIAEgCyABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBARAeIAIgFikDADcDACABIAEpA2A3A0AgASAJIAQgBnNzNgKEASABIAwgBSAPc3M2AoABIAEgCCAUIAVzczYCiAEgASAHIAogBHNzNgKMASABQdAAaiABQYABaiADIBIgERAfIBMgAikDADcDACABIAEpA0A3A3AgASABKAJUIg42AoQBIAEgASgCWCIPNgKIASABIAEoAlwiFTYCjAEgASABKAJQIhcgGEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQEQHiABKAJsIRogASkCZCEfIAEoAmAhGCABIAMgDSAKc3M2AoQBIAEgCyAQIBRzczYCgAEgASASIAwgEHNzNgKIASABIBEgCSANc3M2AowBIAFB8ABqIAFBgAFqIA4gDyAVEB8gASgCcCEUIAEoAnwhBCABKAJ4IQUgASgCdCEGIAEgGDYCcCABIB83AnQgASAaNgJ8IAEgBjYChAEgASAFNgKIASABIAQ2AowBIAEgFCABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAhAeIAIgFikDADcDACABIAEpA2A3A0AgASAOIAcgCXNzNgKEASABIBcgCCAMc3M2AoABIAEgDyALIAhzczYCiAEgASAVIAMgB3NzNgKMASABQfAAaiABQYABaiAGIAUgBBAfIAEoAnwhByABKAJ4IQggASgCcCEMIAEoAnQhCSATIAIpAwA3AwAgASABKQNANwNwIAEgCTYChAEgASAMIBhBHndqNgKAASABIAg2AogBIAEgBzYCjAEgAUHgAGogAUHwAGogAUGAAWpBAhAeIAEoAmwhGiABKQJkIR8gASgCYCEYIAEgBiARIANzczYChAEgASAUIBIgC3NzNgKAASABIAUgFyASc3M2AogBIAEgBCAOIBFzczYCjAEgAUHwAGogAUGAAWogCSAIIAcQHyABKAJwIQsgASgCfCENIAEoAnghECABKAJ0IQogASAYNgJwIAEgHzcCdCABIBo2AnwgASAKNgKEASABIBA2AogBIAEgDTYCjAEgASALIAEoAkBBHndqNgKAASABQeAAaiABQfAAaiABQYABakECEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAkgFSAOc3M2AoQBIAEgDCAPIBdzczYCgAEgASAIIBQgD3NzNgKIASABIAcgBiAVc3M2AowBIAFB8ABqIAFBgAFqIAogECANEB8gASgCfCERIAEoAnghEiABKAJwIQ4gASgCdCEDIBMgAikDADcDACABIAEpA0A3A3AgASADNgKEASABIA4gGEEed2o2AoABIAEgEjYCiAEgASARNgKMASABQeAAaiABQfAAaiABQYABakECEB4gASgCbCEPIAEpAmQhHyABKAJgIRUgASAKIAQgBnNzNgKEASABIAsgBSAUc3M2AoABIAEgECAMIAVzczYCiAEgASANIAkgBHNzNgKMASABQdAAaiABQYABaiADIBIgERAfIAEgFTYCcCABIB83AnQgASAPNgJ8IAEgASgCVCIENgKEASABIAEoAlgiBTYCiAEgASABKAJcIgY2AowBIAEgASgCQEEedyABKAJQIhRqNgKAASABQeAAaiABQfAAaiABQYABakECEB4gAiAWKQMANwMAIAEgASkDYDcDQCABIAMgByAJc3M2AoQBIAEgDiAIIAxzczYCgAEgASASIAsgCHNzNgKIASABIBEgCiAHc3M2AowBIAFB8ABqIAFBgAFqIAQgBSAGEB8gASgCfCEHIAEoAnghCCABKAJwIQ8gASgCdCEJIBMgAikDADcDACABIAEpA0A3A3AgASAJNgKEASABIA8gFUEed2o2AoABIAEgCDYCiAEgASAHNgKMASABQeAAaiABQfAAaiABQYABakEDEB4gASgCbCEVIAEpAmQhHyABKAJgIQwgASAEIA0gCnNzNgKEASABIBQgECALc3M2AoABIAEgBSAOIBBzczYCiAEgASAGIAMgDXNzNgKMASABQfAAaiABQYABaiAJIAggBxAfIAEoAnAhECABKAJ8IQogASgCeCELIAEoAnQhDSABIAw2AnAgASAfNwJ0IAEgFTYCfCABIA02AoQBIAEgCzYCiAEgASAKNgKMASABIBAgASgCQEEed2o2AoABIAFB4ABqIAFB8ABqIAFBgAFqQQMQHiACIBYpAwA3AwAgASABKQNgNwNAIAEgCSARIANzczYChAEgASAPIBIgDnNzNgKAASABIAggFCASc3M2AogBIAEgByAEIBFzczYCjAEgAUHwAGogAUGAAWogDSALIAoQHyABKAJ8IREgASgCeCESIAEoAnAhDiABKAJ0IQMgEyACKQMANwMAIAEgASkDQDcDcCABIAM2AoQBIAEgDiAMQR53ajYCgAEgASASNgKIASABIBE2AowBIAFB4ABqIAFB8ABqIAFBgAFqQQMQHiABKAJsIRUgASkCZCEfIAEoAmAhDCABIA0gBiAEc3M2AoQBIAEgECAFIBRzczYCgAEgASALIA8gBXNzNgKIASABIAogCSAGc3M2AowBIAFB8ABqIAFBgAFqIAMgEiAREB8gASgCcCEKIAEoAnwhBCABKAJ4IQUgASgCdCEGIAEgDDYCcCABIB83AnQgASAVNgJ8IAEgBjYChAEgASAFNgKIASABIAQ2AowBIAEgCiABKAJAQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAxAeIAIgFikDADcDACABIAEpA2A3A0AgASADIAcgCXNzNgKEASABIA4gCCAPc3M2AoABIAEgEiAQIAhzczYCiAEgASARIA0gB3NzNgKMASABQdAAaiABQYABaiAGIAUgBBAfIBMgAikDADcDACABIAEpA0A3A3AgASABKQJUNwKEASABIAEoAlw2AowBIAEgASgCUCAMQR53ajYCgAEgAUHgAGogAUHwAGogAUGAAWpBAxAe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DSAKIABBDHZBD3FB4AFyOgAMQQMMAQsgCiAAQRJ2QfABcjoADCAKIABBP3FBgAFyOgAPIAogAEEMdkE/cUGAAXI6AA0gCiAAQQZ2QT9xQYABcjoADkEECyEIIAEoAhghAkF/IQAgAUEcaigCACIJQQxqIQECQAJAAkADQCAAQQFqIgAgBE8NASACIApBDGogCCABKAIAEQUARQ0ACwwBCyACIAcgBiAJQQxqKAIAIgERBQANAEF/IQADQCAAQQFqIgAgA08NAiACIApBDGogCCABEQUARQ0ACwtBAQwBC0EACyEAIApBEGokACAAC0YCAX8BfiMAQSBrIgIkACABKQIAIQMgAkEUaiABKQIINwIAIAJBlBY2AgQgAkGsDjYCACACIAA2AgggAiADNwIMIAIQJAALUAACQAJAQZARKAIAQQFGBEBBlBFBlBEoAgBBAWoiADYCACAAQQNJDQEMAgtBkBFCgYCAgBA3AwALQZwRKAIAIgBBf0wNAEGcESAANgIACwALPwECfyMAQRBrIgEkAAJ/IAAoAggiAiACDQAaQfwVEAcACxogASAAKQIMNwMAIAEgAEEUaikCADcDCCABECMAC7MCAQV/IAAoAhghAwJAAkACQCAAKAIMIgIgAEcEQCAAKAIIIgEgAjYCDCACIAE2AgggAw0BDAILIABBFGoiASAAQRBqIAEoAgAbIgQoAgAiAQRAAkADQCAEIQUgASICQRRqIgQoAgAiAQRAIAENAQwCCyACQRBqIQQgAigCECIBDQALCyAFQQA2AgAgAw0BDAILQQAhAiADRQ0BCwJAIAAoAhwiBEECdEG0E2oiASgCACAARwRAIANBEGogA0EUaiADKAIQIABGGyACNgIAIAINAQwCCyABIAI2AgAgAkUNAgsgAiADNgIYIAAoAhAiAQRAIAIgATYCECABIAI2AhgLIABBFGooAgAiAUUNACACQRRqIAE2AgAgASACNgIYCw8LQagRQagRKAIAQX4gBHdxNgIAC8UCAQR/IAACf0EAIAFBCHYiA0UNABpBHyICIAFB////B0sNABogAUEmIANnIgJrQR9xdkEBcUEfIAJrQQF0cgsiAjYCHCAAQgA3AhAgAkECdEG0E2ohAwJAAkACQEGoESgCACIEQQEgAkEfcXQiBXEEQCADKAIAIgQoAgRBeHEgAUcNASAEIQIM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LTFlY2M2Mjk5ZGI5ZWM4MjMvYmxvY2stYnVmZmVyLTAuMy4zL3NyYy9saWIucnNkZXN0aW5hdGlvbiBhbmQgc291cmNlIHNsaWNlcyBoYXZlIGRpZmZlcmVudCBsZW5ndGhzL3Jvb3QvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9naXRodWIuY29tLTFlY2M2Mjk5ZGI5ZWM4MjMvc2hhLTEtMC43LjAvc3JjL3V0aWxzLnJzaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZTogdW5rbm93biBpY29zYXJvdW5kIGluZGV4AEHwCwvSBAEAAAAAAAAAIAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAwAAAGNhcGFjaXR5IG92ZXJmbG93Y2FsbGVkIGBPcHRpb246OnVud3JhcCgpYCBvbiBhIGBOb25lYCB2YWx1ZWxpYmNvcmUvb3B0aW9uLnJzMDAwMTAyMDMwNDA1MDYwNzA4MDkxMDExMTIxMzE0MTUxNjE3MTgxOTIwMjEyMjIzMjQyNTI2MjcyODI5MzAzMTMyMzMzNDM1MzYzNzM4Mzk0MDQxNDI0MzQ0NDU0NjQ3NDg0OTUwNTE1MjUzNTQ1NTU2NTc1ODU5NjA2MTYyNjM2NDY1NjY2NzY4Njk3MDcxNzI3Mzc0NzU3Njc3Nzg3OTgwODE4MjgzODQ4NTg2ODc4ODg5OTA5MTkyOTM5NDk1OTY5Nzk4OTkAAAAAaW5kZXggb3V0IG9mIGJvdW5kczogdGhlIGxlbiBpcyAgYnV0IHRoZSBpbmRleCBpcyBsaWJjb3JlL3NsaWNlL21vZC5ycwABAAAAAAAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAABAAAAAQAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAABpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggc2xpY2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCBpbnRlcm5hbCBlcnJvcjogZW50ZXJlZCB1bnJlYWNoYWJsZSBjb2RlbGliYWxsb2MvcmF3X3ZlYy5ycwBB7BQLnQIWBAAAJAAAAC8IAAATAAAASAIAAAkAAADQBAAAUwAAAEsAAAARAAAAUAQAACAAAABwBAAAWgAAAB8AAAAFAAAAIwUAADQAAABfBwAAFAAAAG0GAAAJAAAAzwUAABgAAAClBQAAKgAAAFcFAABOAAAAQgAAAA4AAAAUBgAAEQAAAC8IAAATAAAA8gIAAAUAAAAlBgAAKwAAAFAGAAARAAAAWQEAABUAAAADAAAAAAAAAAEAAAAEAAAALQcAACAAAABNBwAAEgAAALwHAAAGAAAAwgcAACIAAABfBwAAFAAAAK0HAAAFAAAA5AcAABYAAAD6BwAADQAAAF8HAAAUAAAAswcAAAUAAAAHCAAAKAAAAC8IAAATAAAA9QEAAB4ADAdsaW5raW5nAwKMDw==';

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Base64Bytes = void 0;
/* eslint-disable tsdoc/syntax */
/**
 * @hidden
 */
// prettier-ignore
exports.sha256Base64Bytes = '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IAJHDQUgAygCGCABIAIQKxoMAwsgAiEEDAELIANBMGogASACIAQQFiADQTxqKAIAIQQgAygCOCEBIAMoAjAhBSADKAI0IQIgA0EgaiAAQQxqIgYgACgCCBAXIAIgAygCJEcNBCADKAIgIAUgAhArGiAAQQhqQQA2AgAgA0EsaiAGEBgLIANBPGohAiADQThqIQUCQANAIARBP00NASADQTBqIAEgBEHAABAWIAIoAgAhBCAFKAIAIQEgA0EIakEAQcAAIAMoAjAgAygCNBAZIANBLGogAygCCBAYDAALAAsgA0EQaiAAQQxqIAQQGiADKAIUIARHDQEgAygCECABIAQQKxoLIABBCGogBDYCACADQUBrJAAPC0GEFBAHAAtBhBQQBwALQYQUEAcAC98EAgN/AX4jAEHQAGsiAiQAIAIgAUHMAGo2AiQgASkDACEFIAEoAgghBCACIAJBJGo2AigCQCAEQT9NBEAgAUEMaiIDIARqQYABOgAAIAEgASgCCEEBaiIENgIIIAJBGGogAyAEEBcgAigCGEEAIAIoAhwQLRpBwAAgASgCCGtBB00EQCACQShqIAMQGCACQRBqIAMgAUEIaigCABAaIAIoAhBBACACKAIUEC0aCyACQQhqIANBOBAXIAIoAgxBCEcNASACKAIIIAVCOIYgBUIohkKAgICAgIDA/wCDhCAFQhiGQoCAgICA4D+DIAVCCIZCgICAgPAfg4SEIAVCCIhCgICA+A+DIAVCGIhCgID8B4OEIAVCKIhCgP4DgyAFQjiIhISENwAAIAJBKGogAxAYIAFBCGpBADYCACACQQA2AiggAkEoakEEciEEQQAhAwJAA0AgA0EgRg0BIAQgA2pBADoAACACIAIoAihBAWo2AiggA0EBaiEDDAALAAsgAkFAayABQeQAaikAADcDACACQThqIAFB3ABqKQAANwMAIAJBMGogAUHUAGopAAA3AwAgAiABKQBMNwMoQQAhAwJAA0AgA0EgRg0BIAJBKGogA2oiBCAEKAIAIgRBGHQgBEEIdEGAgPwHcXIgBEEIdkGA/gNxIARBGHZycjYCACADQQRqIQMMAAsACyAAIAIpAyg3AAAgAEEYaiACQUBrKQMANwAAIABBEGogAkE4aikDADcAACAAQQhqIAJBMGopAwA3AAAgAkHQAGokAA8LQdwTIARBwAAQ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KAJsIQggASAPNgJkIAEgDjYCYCABIBM2AmggASAYNgJsIAEgAjYCdCABIBc2AnAgASAQNgJ4IAEgDDYCfCABQdAAaiABQeAAaiABQfAAaiAHQevZwaJ6aiAIQfr/+4V5ahAeIAEoAlwhByABKAJYIQggASgCUCEKIAEoAlQhESABIAI2AmQgASAXNgJgIAEgEDYCaCABIAw2AmwgASARNgJ0IAEgCjYCcCABIAg2AnggASAHNgJ8IAFB0ABqIAFB4ABqIAFB8ABqIA1B8vHFs3xqIBlB98fm93tqEB4gASgCXCENIAEoAlghGCABKAJQIRMgACAeIAEoAlRqNgIEIAAgEyAdajYCACAAIAogIWo2AgggACARICJqNgIMIAAgGCAcajYCECAAIA0gG2o2AhQgACAIICBqNgIYIAAgByAfajYCHCABQYABaiQAC30BAX8jAEEwayICJAAgAiABNgIEIAIgADYCACACQSxqQQE2AgAgAkEUakECNgIAIAJBHGpBAjYCACACQQE2AiQgAkGMFTYCCCACQQI2AgwgAkHMDTYCECACIAI2AiAgAiACQQRqNgIoIAIgAkEgajYCGCACQQhqQZwVECgAC3wBAX8jAEEwayIDJAAgAyACNgIEIAMgATYCACADQSxqQQE2AgAgA0EUakECNgIAIANBHGpBAjYCACADQQE2AiQgA0HcFDYCCCADQQI2AgwgA0HMDTYCECADIANBBGo2AiAgAyADNgIoIAMgA0EgajYCGCADQQhqIAAQKAAL1gEBBn8gACABKAIAIgggAigCBCIHcyACKAIAIgVxIAggB3FzIAVBHncgBUETd3MgBUEKd3NqIAIoAggiBkEadyAGQRV3cyAGQQd3cyAEaiABKAIMaiABKAIIIgQgAigCDCIJcyAGcSAEc2oiCmoiAjYCBCAAIAogASgCBGoiATYCDCAAIAJBHncgAkETd3MgAkEKd3MgAiAHIAVzcSAHIAVxc2ogBCADaiAJIAEgCSAGc3FzaiABQRp3IAFBFXdzIAFBB3dzaiIFajYCACAAIAUgCGo2AggLeAAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgAiAmo2AgAgACACQRl3IAJBA3ZzIAJBDndzIAEoAgQiAmo2AgQgACACQRl3IAJBA3ZzIAJBDndzIAEoAggiAmo2AgggACACQRl3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';

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha512Base64Bytes = void 0;
/* eslint-disable tsdoc/syntax */
/**
 * @hidden
 */
// prettier-ignore
exports.sha512Base64Bytes = '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AjYCACAAIAJBAXI2AgQMBQsgAEGsEygCACACaiICQQFyNgIEQbQTIAA2AgBBrBMgAjYCACAAIAJqIAI2AgAMBAsgAxAiDAELQZwQQZwQKAIAQX4gAUEDdndxNgIACyAEIAJqIQIgAyAEaiEDCyADIAMoAgRBfnE2AgQgACACQQFyNgIEIAAgAmogAjYCAAJ/AkAgAkH/AU0EQCACQQN2IgFBA3RBpBBqIQJBnBAoAgAiA0EBIAFBH3F0IgFxRQ0BIAJBCGohAyACKAIIDAILIAAgAhAjDAILQZwQIAMgAXI2AgAgAkEIaiEDIAILIQEgAyAANgIAIAEgADYCDCAAIAI2AgwgACABNgIICyAFQQhqDwtBsBMgACACayIBNgIAQbgTQbgTKAIAIgAgAmoiAzYCACADIAFBAXI2AgQgACACQQNyNgIEIABBCGoLpQEBAn9BAiEFAkACQAJAAkACQCAAKAIEIgYgAWsgAk8NACABIAJqIgIgAUkhAQJAIAQEQEEAIQUgAQ0CIAZBAXQiASACIAIgAUkbIQIMAQtBACEFIAENAQsgAkEASA0AIAZFDQEgACgCACACEBMiAUUNAgwDCyAFDwsgAhAEIgENAQsgAw0BCyABBEAgACABNgIAIABBBGogAjYCAEECDwtBAQ8LAAsIAEG8FBAHAAtmAgF/A34jAEEwayIBJAAgACkCECECIAApAgghAyAAKQIAIQQgAUEUakEANgIAIAEgBDcDGCABQgE3AgQgAUGkDTYCECABIAFBGGo2AgAgASADNwMgIAEgAjcDKCABIAFBIGoQJwALsgEBAn8jAEGABGsiAyQAIANB2ABqIgRCADcDACADQgA3A1AgA0GgAWpBAEGEARAsGiADQeAAakHICkHAABAqGiADQdAAaiABIAIQCSADQagCaiADQdAAakHYARAqGiADQRBqIANBqAJqEAogA0HQAGogA0EQakHAABADIANBsAJqIAQoAgA2AgAgAyADKQNQNwOoAiADQQhqIANBqAJqEAsgACADKQMINwIAIANBgARqJAALuwMCBH8CfiMAQUBqIgMkACAAIAApAwgiByACrUIDhnwiCDcDCCAIIAdUBEAgACAAKQMAQgF8NwMACyADIABBEGo2AiggAyADQShqNgIsAkACQAJAAkACQAJAIAAoAlAiBQRAQYABIAVrIgQg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sBMoAgAgAGoiADYCACABIABBAXI2AgQgAUG0EygCAEYEQEGsE0EANgIAQbQTQQA2AgALQdQTKAIAIABPDQcCQCAAQSlJDQBBxBMhAANAIAAoAgAiAiABTQRAIAIgACgCBGogAUsNAgsgACgCCCIADQALC0EAIQFBzBMoAgAiAEUNBANAIAFBAWohASAAKAIIIgANAAsgAUH/HyABQf8fSxsMBQtBtBMgATYCAEGsE0GsEygCACAAaiIANgIADAcLIAIQIgwBC0GcEEGcECgCAEF+IANBA3Z3cTYCAAsgASAAQQFyNgIEIAEgAGogADYCACABQbQTKAIARw0CQawTIAA2AgAPC0H/HwshAUHUE0F/NgIAQdwTIAE2AgAPC0HcEwJ/AkACfwJAIABB/wFNBEAgAEEDdiICQQN0QaQQaiEAQZwQKAIAIgNBASACQR9xdCICcUUNASAAQQhqIQMgACgCCAwCCyABIAAQI0HcE0HcEygCAEF/aiIBNgIAIAENBEHMEygCACIARQ0CQQAhAQNAIAFBAWohASAAKAIIIgANAAsgAUH/HyABQf8fSxsMAwtBnBAgAyACcjYCACAAQQhqIQMgAAshAiADIAE2AgAgAiABNgIMIAEgADYCDCABIAI2AggPC0H/HwsiATYCAAsPCyABIABBAXI2AgQgASAAaiAANgIACzkAAkAgAiABTwRAIAJBgQFPDQEgACACIAFrNgIEIAAgAyABajYCAA8LIAEgAhAcAAsgAkGAARACAAtNAgF/An4jAEEQayIEJAAgBEEIakEAIAMgASACEBkgBCkDCCEFIAQgAyACIAEgAhAZIAQpAwAhBiAAIAU3AgAgACAGNwIIIARBEGokAAssAQF/IwBBEGsiAyQAIANBCGogAkGAASABEBUgACADKQMINwIAIANBEGokAAsOACAAKAIAKAIAIAEQGws3AAJAIAIgAU8EQCAEIAJJDQEgACACIAFrNgIEIAAgAyABajYCAA8LIAEgAhAcAAsgAiAEEAIACysBAX8jAEEQayIDJAAgA0EIakEAIAIgARAVIAAgAykDCDcCACADQRBqJAALqioCAn8ifiMAQYAPayICJAAgAkGADmogAUGAARAqGkEAIQECQANAIAFBgAFGDQEgAkGADmogAWoiAyADKQMAIhxCOIYgHEIohkKAgICAgIDA/wCD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c2VydGlvbiBmYWlsZWQ6IDggPT0gZHN0LmxlbigpL3Jvb3QvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9naXRodWIuY29tLTFlY2M2Mjk5ZGI5ZWM4MjMvYnl0ZS10b29scy0wLjIuMC9zcmMvd3JpdGVfc2luZ2xlLnJzAEHwCQvKBS9yb290Ly5jYXJnby9yZWdpc3RyeS9zcmMvZ2l0aHViLmNvbS0xZWNjNjI5OWRiOWVjODIzL2Jsb2NrLWJ1ZmZlci0wLjMuMy9zcmMvbGliLnJzAAAAAAAIybzzZ+YJajunyoSFrme7K/iU/nLzbjzxNh1fOvVPpdGC5q1/Ug5RH2w+K4xoBZtrvUH7q9mDH3khfhMZzeBbAAAAAABjYXBhY2l0eSBvdmVyZmxvd2NhbGxlZCBgT3B0aW9uOjp1bndyYXAoKWAgb24gYSBgTm9uZWAgdmFsdWVsaWJjb3JlL29wdGlvbi5yczAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3MjgyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Njg3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5AAAAaW5kZXggb3V0IG9mIGJvdW5kczogdGhlIGxlbiBpcyAgYnV0IHRoZSBpbmRleCBpcyBsaWJjb3JlL3NsaWNlL21vZC5ycwABAAAAAAAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAABAAAAAQAAACAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAABpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggc2xpY2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCBpbnRlcm5hbCBlcnJvcjogZW50ZXJlZCB1bnJlYWNoYWJsZSBjb2RlbGliYWxsb2MvcmF3X3ZlYy5ycwBB5BML/QEWBAAAJAAAAKcHAAATAAAASAIAAAkAAAA6BAAANAAAANcGAAAUAAAAbQYAAAkAAADwBAAAUwAAAEsAAAARAAAAbgQAACAAAACOBAAAWgAAAB8AAAAFAAAAjQUAABEAAACnBwAAEwAAAPICAAAFAAAAngUAACsAAADJBQAAEQAAAFkBAAAVAAAAAgAAAAAAAAABAAAAAwAAAKUGAAAgAAAAxQYAABIAAAA0BwAABgAAADoHAAAiAAAA1wYAABQAAACtBwAABQAAAFwHAAAWAAAAcgcAAA0AAADXBgAAFAAAALMHAAAFAAAAfwcAACgAAACnBwAAEwAAAPUBAAAeAAwHbGlua2luZwMC5A0=';

},{}],17:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./hmac"), exports);
__exportStar(require("./ripemd160"), exports);
__exportStar(require("./secp256k1"), exports);
__exportStar(require("./sha1"), exports);
__exportStar(require("./sha256"), exports);
__exportStar(require("./sha512"), exports);

},{"./hmac":18,"./ripemd160":19,"./secp256k1":20,"./sha1":21,"./sha256":22,"./sha512":23}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSha512 = exports.hmacSha256 = exports.instantiateHmacFunction = void 0;
const hex_1 = require("../format/hex");
/**
 * Instantiate a hash-based message authentication code (HMAC) function as
 * specified by RFC 2104.
 *
 * @param hashFunction - a cryptographic hash function which iterates a basic
 * compression function on blocks of data
 * @param blockByteLength - the byte-length of blocks used in `hashFunction`
 */
exports.instantiateHmacFunction = (hashFunction, blockByteLength) => (secret, message) => {
    const key = new Uint8Array(blockByteLength).fill(0);
    // eslint-disable-next-line functional/no-expression-statement
    key.set(secret.length > blockByteLength ? hashFunction(secret) : secret, 0);
    const innerPaddingFill = 0x36;
    const innerPadding = new Uint8Array(blockByteLength).fill(innerPaddingFill);
    // eslint-disable-next-line no-bitwise
    const innerPrefix = innerPadding.map((pad, index) => pad ^ key[index]);
    const innerContent = hex_1.flattenBinArray([innerPrefix, message]);
    const innerResult = hashFunction(innerContent);
    const outerPaddingFill = 0x5c;
    const outerPadding = new Uint8Array(blockByteLength).fill(outerPaddingFill);
    // eslint-disable-next-line no-bitwise
    const outerPrefix = outerPadding.map((pad, index) => pad ^ key[index]);
    return hashFunction(hex_1.flattenBinArray([outerPrefix, innerResult]));
};
const sha256BlockByteLength = 64;
/**
 * Create a hash-based message authentication code using HMAC-SHA256 as
 * specified in `RFC 4231`. Returns a 32-byte Uint8Array.
 *
 * Secrets longer than the block byte-length (64 bytes) are hashed before
 * use, shortening their length to the minimum recommended length (32 bytes).
 * See `RFC 2104` for details.
 *
 * @param sha256 - an implementation of Sha256
 * @param secret - the secret key (recommended length: 32-64 bytes)
 * @param message - the message to authenticate
 */
exports.hmacSha256 = (sha256, secret, message) => exports.instantiateHmacFunction(sha256.hash, sha256BlockByteLength)(secret, message);
const sha512BlockByteLength = 128;
/**
 * Create a hash-based message authentication code using HMAC-SHA512 as
 * specified in `RFC 4231`. Returns a 64-byte Uint8Array.
 *
 * Secrets longer than the block byte-length (128 bytes) are hashed before
 * use, shortening their length to the minimum recommended length (64 bytes).
 * See `RFC 2104` for details.
 *
 * @param sha512 - an implementation of Sha512
 * @param secret - the secret key (recommended length: 64-128 bytes)
 * @param message - the message to authenticate
 */
exports.hmacSha512 = (sha512, secret, message) => exports.instantiateHmacFunction(sha512.hash, sha512BlockByteLength)(secret, message);

},{"../format/hex":28}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateRipemd160 = exports.getEmbeddedRipemd160Binary = exports.instantiateRipemd160Bytes = void 0;
const bin_1 = require("../bin/bin");
const format_1 = require("../format/format");
/**
 * The most performant way to instantiate ripemd160 functionality. To avoid
 * using Node.js or DOM-specific APIs, you can use `instantiateRipemd160`.
 *
 * @param webassemblyBytes - A buffer containing the ripemd160 binary.
 */
exports.instantiateRipemd160Bytes = async (webassemblyBytes) => {
    const wasm = await bin_1.instantiateRustWasm(webassemblyBytes, './ripemd160', 'ripemd160', 'ripemd160_init', 'ripemd160_update', 'ripemd160_final');
    return {
        final: wasm.final,
        hash: wasm.hash,
        init: wasm.init,
        update: wasm.update,
    };
};
exports.getEmbeddedRipemd160Binary = () => format_1.base64ToBin(bin_1.ripemd160Base64Bytes).buffer;
const cachedRipemd160 = {};
/**
 * An ultimately-portable (but slower) version of `instantiateRipemd160Bytes`
 * which does not require the consumer to provide the ripemd160 binary buffer.
 */
exports.instantiateRipemd160 = async () => {
    if (cachedRipemd160.cache !== undefined) {
        return cachedRipemd160.cache;
    }
    const result = exports.instantiateRipemd160Bytes(exports.getEmbeddedRipemd160Binary());
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
    cachedRipemd160.cache = result;
    return result;
};

},{"../bin/bin":8,"../format/format":27}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateSecp256k1 = exports.instantiateSecp256k1Bytes = void 0;
/* eslint-disable functional/no-conditional-statement, functional/no-expression-statement, functional/no-throw-statement */
const bin_1 = require("../bin/bin");
/**
 * @param secp256k1Wasm - a Secp256k1Wasm object
 * @param randomSeed - a 32-byte random seed used to randomize the context after
 * creation
 */
const wrapSecp256k1Wasm = (secp256k1Wasm, randomSeed) => {
    /**
     * Currently, this wrapper creates a context with both SIGN and VERIFY
     * capabilities. For better initialization performance, consumers could
     * re-implement a wrapper with only the capabilities they require.
     */
    const contextPtr = secp256k1Wasm.contextCreate(bin_1.ContextFlag.BOTH);
    /**
     * Since all of these methods are single-threaded and synchronous, we can
     * reuse allocated WebAssembly memory for each method without worrying about
     * calls interfering with each other. Likewise, these spaces never need to be
     * `free`d, since we will continue using them until this entire object (and
     * with it, the entire WebAssembly instance) is garbage collected.
     *
     * If malicious javascript gained access to this object, it should be
     * considered a critical vulnerability in the consumer. However, as a best
     * practice, we zero out private keys below when we're finished with them.
     */
    const sigScratch = secp256k1Wasm.malloc(72 /* maxECDSASig */);
    const publicKeyScratch = secp256k1Wasm.malloc(65 /* maxPublicKey */);
    const messageHashScratch = secp256k1Wasm.malloc(32 /* messageHash */);
    const internalPublicKeyPtr = secp256k1Wasm.malloc(64 /* internalPublicKey */);
    const internalSigPtr = secp256k1Wasm.malloc(64 /* internalSig */);
    const schnorrSigPtr = secp256k1Wasm.malloc(64 /* schnorrSig */);
    const privateKeyPtr = secp256k1Wasm.malloc(32 /* privateKey */);
    const internalRSigPtr = secp256k1Wasm.malloc(65 /* recoverableSig */);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const recoveryNumPtr = secp256k1Wasm.malloc(4);
    // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
    const recoveryNumPtrView32 = recoveryNumPtr >> 2;
    const getRecoveryNumPtr = () => secp256k1Wasm.heapU32[recoveryNumPtrView32];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const lengthPtr = secp256k1Wasm.malloc(4);
    // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
    const lengthPtrView32 = lengthPtr >> 2;
    const parsePublicKey = (publicKey) => {
        secp256k1Wasm.heapU8.set(publicKey, publicKeyScratch);
        return (secp256k1Wasm.pubkeyParse(contextPtr, internalPublicKeyPtr, publicKeyScratch, 
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        publicKey.length) === 1);
    };
    const setLengthPtr = (value) => {
        secp256k1Wasm.heapU32.set([value], lengthPtrView32);
    };
    const getLengthPtr = () => secp256k1Wasm.heapU32[lengthPtrView32];
    const serializePublicKey = (length, flag) => {
        setLengthPtr(length);
        secp256k1Wasm.pubkeySerialize(contextPtr, publicKeyScratch, lengthPtr, internalPublicKeyPtr, flag);
        return secp256k1Wasm.readHeapU8(publicKeyScratch, getLengthPtr()).slice();
    };
    const getSerializedPublicKey = (compressed) => compressed
        ? serializePublicKey(33 /* compressedPublicKey */, bin_1.CompressionFlag.COMPRESSED)
        : serializePublicKey(65 /* uncompressedPublicKey */, bin_1.CompressionFlag.UNCOMPRESSED);
    const convertPublicKey = (compressed) => (publicKey) => {
        if (!parsePublicKey(publicKey)) {
            throw new Error('Failed to parse public key.');
        }
        return getSerializedPublicKey(compressed);
    };
    const parseSignature = (signature, isDer) => {
        secp256k1Wasm.heapU8.set(signature, sigScratch);
        return isDer
            ? secp256k1Wasm.signatureParseDER(contextPtr, internalSigPtr, sigScratch, signature.length) === 1
            : secp256k1Wasm.signatureParseCompact(contextPtr, internalSigPtr, sigScratch) === 1;
    };
    const parseOrThrow = (signature, isDer) => {
        if (!parseSignature(signature, isDer)) {
            throw new Error('Failed to parse signature.');
        }
    };
    const getCompactSig = () => {
        secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
        return secp256k1Wasm.readHeapU8(sigScratch, 64 /* compactSig */).slice();
    };
    const getDERSig = () => {
        setLengthPtr(72 /* maxECDSASig */);
        secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
        return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
    };
    const convertSignature = (wasDER) => (signature) => {
        parseOrThrow(signature, wasDER);
        return wasDER ? getCompactSig() : getDERSig();
    };
    const fillPrivateKeyPtr = (privateKey) => {
        secp256k1Wasm.heapU8.set(privateKey, privateKeyPtr);
    };
    const zeroOutPtr = (pointer, bytes) => {
        secp256k1Wasm.heapU8.fill(0, pointer, pointer + bytes);
    };
    const zeroOutPrivateKeyPtr = () => {
        zeroOutPtr(privateKeyPtr, 32 /* privateKey */);
    };
    const withPrivateKey = (privateKey, instructions) => {
        fillPrivateKeyPtr(privateKey);
        const ret = instructions();
        zeroOutPrivateKeyPtr();
        return ret;
    };
    const derivePublicKey = (compressed) => (privateKey) => {
        const invalid = withPrivateKey(privateKey, () => secp256k1Wasm.pubkeyCreate(contextPtr, internalPublicKeyPtr, privateKeyPtr) !== 1);
        if (invalid) {
            throw new Error('Cannot derive public key from invalid private key.');
        }
        return getSerializedPublicKey(compressed);
    };
    const fillMessageHashScratch = (messageHash) => {
        secp256k1Wasm.heapU8.set(messageHash, messageHashScratch);
    };
    const normalizeSignature = () => {
        secp256k1Wasm.signatureNormalize(contextPtr, internalSigPtr, internalSigPtr);
    };
    const modifySignature = (isDer, normalize) => (signature) => {
        parseOrThrow(signature, isDer);
        if (normalize) {
            normalizeSignature();
        }
        else {
            secp256k1Wasm.signatureMalleate(contextPtr, internalSigPtr, internalSigPtr);
        }
        return isDer ? getDERSig() : getCompactSig();
    };
    const parseAndNormalizeSignature = (signature, isDer, normalize) => {
        const ret = parseSignature(signature, isDer);
        if (normalize) {
            normalizeSignature();
        }
        return ret;
    };
    const signMessageHash = (isDer) => (privateKey, messageHash) => {
        fillMessageHashScratch(messageHash);
        return withPrivateKey(privateKey, () => {
            const failed = secp256k1Wasm.sign(contextPtr, internalSigPtr, messageHashScratch, privateKeyPtr) !== 1;
            if (failed) {
                throw new Error('Failed to sign message hash. The private key is not valid.');
            }
            if (isDer) {
                setLengthPtr(72 /* maxECDSASig */);
                secp256k1Wasm.signatureSerializeDER(contextPtr, sigScratch, lengthPtr, internalSigPtr);
                return secp256k1Wasm.readHeapU8(sigScratch, getLengthPtr()).slice();
            }
            secp256k1Wasm.signatureSerializeCompact(contextPtr, sigScratch, internalSigPtr);
            return secp256k1Wasm
                .readHeapU8(sigScratch, 64 /* compactSig */)
                .slice();
        });
    };
    const signMessageHashSchnorr = () => (privateKey, messageHash) => {
        fillMessageHashScratch(messageHash);
        return withPrivateKey(privateKey, () => {
            const failed = secp256k1Wasm.schnorrSign(contextPtr, schnorrSigPtr, messageHashScratch, privateKeyPtr) !== 1;
            if (failed) {
                throw new Error('Failed to sign message hash. The private key is not valid.');
            }
            return secp256k1Wasm
                .readHeapU8(schnorrSigPtr, 64 /* schnorrSig */)
                .slice();
        });
    };
    const verifyMessage = (messageHash) => {
        fillMessageHashScratch(messageHash);
        return (secp256k1Wasm.verify(contextPtr, internalSigPtr, messageHashScratch, internalPublicKeyPtr) === 1);
    };
    const verifySignature = (isDer, normalize) => (signature, publicKey, messageHash) => parsePublicKey(publicKey) &&
        parseAndNormalizeSignature(signature, isDer, normalize) &&
        verifyMessage(messageHash);
    const verifyMessageSchnorr = (messageHash, signature) => {
        fillMessageHashScratch(messageHash);
        secp256k1Wasm.heapU8.set(signature, schnorrSigPtr);
        return (secp256k1Wasm.schnorrVerify(contextPtr, schnorrSigPtr, messageHashScratch, internalPublicKeyPtr) === 1);
    };
    const verifySignatureSchnorr = () => (signature, publicKey, messageHash) => parsePublicKey(publicKey)
        ? verifyMessageSchnorr(messageHash, signature)
        : false;
    const signMessageHashRecoverable = (privateKey, messageHash) => {
        fillMessageHashScratch(messageHash);
        return withPrivateKey(privateKey, () => {
            if (secp256k1Wasm.signRecoverable(contextPtr, internalRSigPtr, messageHashScratch, privateKeyPtr) !== 1) {
                throw new Error('Failed to sign message hash. The private key is not valid.');
            }
            secp256k1Wasm.recoverableSignatureSerialize(contextPtr, sigScratch, recoveryNumPtr, internalRSigPtr);
            return {
                recoveryId: getRecoveryNumPtr(),
                signature: secp256k1Wasm
                    .readHeapU8(sigScratch, 64 /* compactSig */)
                    .slice(),
            };
        });
    };
    const recoverPublicKey = (compressed) => (signature, recoveryId, messageHash) => {
        fillMessageHashScratch(messageHash);
        secp256k1Wasm.heapU8.set(signature, sigScratch);
        if (secp256k1Wasm.recoverableSignatureParse(contextPtr, internalRSigPtr, sigScratch, recoveryId) !== 1) {
            throw new Error('Failed to recover public key. Could not parse signature.');
        }
        if (secp256k1Wasm.recover(contextPtr, internalPublicKeyPtr, internalRSigPtr, messageHashScratch) !== 1) {
            throw new Error('Failed to recover public key. The compact signature, recovery, or message hash is invalid.');
        }
        return getSerializedPublicKey(compressed);
    };
    const addTweakPrivateKey = (privateKey, tweakValue) => {
        fillMessageHashScratch(tweakValue);
        return withPrivateKey(privateKey, () => {
            if (secp256k1Wasm.privkeyTweakAdd(contextPtr, privateKeyPtr, messageHashScratch) !== 1) {
                throw new Error('Private key is invalid or adding failed.');
            }
            return secp256k1Wasm
                .readHeapU8(privateKeyPtr, 32 /* privateKey */)
                .slice();
        });
    };
    const mulTweakPrivateKey = (privateKey, tweakValue) => {
        fillMessageHashScratch(tweakValue);
        return withPrivateKey(privateKey, () => {
            if (secp256k1Wasm.privkeyTweakMul(contextPtr, privateKeyPtr, messageHashScratch) !== 1) {
                throw new Error('Private key is invalid or multiplying failed.');
            }
            return secp256k1Wasm
                .readHeapU8(privateKeyPtr, 32 /* privateKey */)
                .slice();
        });
    };
    const addTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
        if (!parsePublicKey(publicKey)) {
            throw new Error('Failed to parse public key.');
        }
        fillMessageHashScratch(tweakValue);
        if (secp256k1Wasm.pubkeyTweakAdd(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) {
            throw new Error('Adding failed');
        }
        return getSerializedPublicKey(compressed);
    };
    const mulTweakPublicKey = (compressed) => (publicKey, tweakValue) => {
        if (!parsePublicKey(publicKey)) {
            throw new Error('Failed to parse public key.');
        }
        fillMessageHashScratch(tweakValue);
        if (secp256k1Wasm.pubkeyTweakMul(contextPtr, internalPublicKeyPtr, messageHashScratch) !== 1) {
            throw new Error('Multiplying failed');
        }
        return getSerializedPublicKey(compressed);
    };
    /**
     * The value of this precaution is debatable, especially in the context of
     * javascript and WebAssembly.
     *
     * In the secp256k1 C library, context randomization is an additional layer of
     * security from side-channel attacks which attempt to extract private key
     * information by analyzing things like a CPU's emitted radio frequencies or
     * power usage.
     *
     * In this library, these attacks seem even less likely, since the "platform"
     * on which this code will be executed (e.g. V8) is likely to obscure any
     * such signals.
     *
     * Still, out of an abundance of caution (and because no one has produced a
     * definitive proof indicating that this is not helpful), this library exposes
     * the ability to randomize the context like the C library. Depending on the
     * intended application, consumers can decide whether or not to randomize.
     */
    if (randomSeed !== undefined) {
        const randomSeedPtr = messageHashScratch;
        secp256k1Wasm.heapU8.set(randomSeed, randomSeedPtr);
        secp256k1Wasm.contextRandomize(contextPtr, randomSeedPtr);
        zeroOutPtr(randomSeedPtr, 32 /* randomSeed */);
    }
    return {
        addTweakPrivateKey,
        addTweakPublicKeyCompressed: addTweakPublicKey(true),
        addTweakPublicKeyUncompressed: addTweakPublicKey(false),
        compressPublicKey: convertPublicKey(true),
        derivePublicKeyCompressed: derivePublicKey(true),
        derivePublicKeyUncompressed: derivePublicKey(false),
        malleateSignatureCompact: modifySignature(false, false),
        malleateSignatureDER: modifySignature(true, false),
        mulTweakPrivateKey,
        mulTweakPublicKeyCompressed: mulTweakPublicKey(true),
        mulTweakPublicKeyUncompressed: mulTweakPublicKey(false),
        normalizeSignatureCompact: modifySignature(false, true),
        normalizeSignatureDER: modifySignature(true, true),
        recoverPublicKeyCompressed: recoverPublicKey(true),
        recoverPublicKeyUncompressed: recoverPublicKey(false),
        signMessageHashCompact: signMessageHash(false),
        signMessageHashDER: signMessageHash(true),
        signMessageHashRecoverableCompact: signMessageHashRecoverable,
        signMessageHashSchnorr: signMessageHashSchnorr(),
        signatureCompactToDER: convertSignature(false),
        signatureDERToCompact: convertSignature(true),
        uncompressPublicKey: convertPublicKey(false),
        validatePrivateKey: (privateKey) => withPrivateKey(privateKey, () => secp256k1Wasm.seckeyVerify(contextPtr, privateKeyPtr) === 1),
        validatePublicKey: parsePublicKey,
        verifySignatureCompact: verifySignature(false, true),
        verifySignatureCompactLowS: verifySignature(false, false),
        verifySignatureDER: verifySignature(true, true),
        verifySignatureDERLowS: verifySignature(true, false),
        verifySignatureSchnorr: verifySignatureSchnorr(),
    };
};
/**
 * This method is like `instantiateSecp256k1`, but requires the consumer to
 * `Window.fetch` or `fs.readFile` the `secp256k1.wasm` binary and provide it to
 * this method as `webassemblyBytes`. This skips a base64 decoding of an
 * embedded binary.
 *
 * ### Randomizing the Context with `randomSeed`
 * This method also accepts an optional, 32-byte `randomSeed`, which is passed
 * to the `contextRandomize` method in the underlying WebAssembly.
 *
 * The value of this precaution is debatable, especially in the context of
 * javascript and WebAssembly.
 *
 * In the secp256k1 C library, context randomization is an additional layer of
 * security from side-channel attacks which attempt to extract private key
 * information by analyzing things like a CPU's emitted radio frequencies or
 * power usage.
 *
 * In this library, these attacks seem even less likely, since the "platform"
 * on which this code will be executed (e.g. V8) is likely to obscure any
 * such signals.
 *
 * Still, out of an abundance of caution (and because no one has produced a
 * definitive proof indicating that this is not helpful), this library exposes
 * the ability to randomize the context like the C library. Depending on the
 * intended application, consumers can decide whether or not to randomize.
 *
 * @param webassemblyBytes - an ArrayBuffer containing the bytes from Libauth's
 * `secp256k1.wasm` binary. Providing this buffer manually may be faster than
 * the internal base64 decode which happens in `instantiateSecp256k1`.
 * @param randomSeed - a 32-byte random seed used to randomize the secp256k1
 * context after creation. See above for details.
 */
exports.instantiateSecp256k1Bytes = async (webassemblyBytes, randomSeed) => wrapSecp256k1Wasm(await bin_1.instantiateSecp256k1WasmBytes(webassemblyBytes), randomSeed);
const cachedSecp256k1 = {};
/**
 * Create and wrap a Secp256k1 WebAssembly instance to expose a set of
 * purely-functional Secp256k1 methods. For slightly faster initialization, use
 * `instantiateSecp256k1Bytes`.
 *
 * @param randomSeed - a 32-byte random seed used to randomize the secp256k1
 * context after creation. See the description in `instantiateSecp256k1Bytes`
 * for details.
 */
exports.instantiateSecp256k1 = async (randomSeed) => {
    if (cachedSecp256k1.cache !== undefined) {
        return cachedSecp256k1.cache;
    }
    const result = Promise.resolve(wrapSecp256k1Wasm(await bin_1.instantiateSecp256k1Wasm(), randomSeed));
    // eslint-disable-next-line require-atomic-updates, functional/immutable-data
    cachedSecp256k1.cache = result;
    return result;
};

},{"../bin/bin":8}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateSha1 = exports.getEmbeddedSha1Binary = exports.instantiateSha1Bytes = void 0;
const bin_1 = require("../bin/bin");
const format_1 = require("../format/format");
/**
 * The most performant way to instantiate sha1 functionality. To avoid
 * using Node.js or DOM-specific APIs, you can use `instantiateSha1`.
 *
 * @param webassemblyBytes - A buffer containing the sha1 binary.
 */
exports.instantiateSha1Bytes = async (webassemblyBytes) => {
    const wasm = await bin_1.instantiateRustWasm(webassemblyBytes, './sha1', 'sha1', 'sha1_init', 'sha1_update', 'sha1_final');
    return {
        final: wasm.final,
        hash: wasm.hash,
        init: wasm.init,
        update: wasm.update,
    };
};
exports.getEmbeddedSha1Binary = () => format_1.base64ToBin(bin_1.sha1Base64Bytes).buffer;
const cachedSha1 = {};
/**
 * An ultimately-portable (but slower) version of `instantiateSha1Bytes`
 * which does not require the consumer to provide the sha1 binary buffer.
 */
exports.instantiateSha1 = async () => {
    if (cachedSha1.cache !== undefined) {
        return cachedSha1.cache;
    }
    const result = exports.instantiateSha1Bytes(exports.getEmbeddedSha1Binary());
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
    cachedSha1.cache = result;
    return result;
};

},{"../bin/bin":8,"../format/format":27}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateSha256 = exports.getEmbeddedSha256Binary = exports.instantiateSha256Bytes = void 0;
const bin_1 = require("../bin/bin");
const format_1 = require("../format/format");
/**
 * The most performant way to instantiate sha256 functionality. To avoid
 * using Node.js or DOM-specific APIs, you can use `instantiateSha256`.
 *
 * @param webassemblyBytes - A buffer containing the sha256 binary.
 */
exports.instantiateSha256Bytes = async (webassemblyBytes) => {
    const wasm = await bin_1.instantiateRustWasm(webassemblyBytes, './sha256', 'sha256', 'sha256_init', 'sha256_update', 'sha256_final');
    return {
        final: wasm.final,
        hash: wasm.hash,
        init: wasm.init,
        update: wasm.update,
    };
};
exports.getEmbeddedSha256Binary = () => format_1.base64ToBin(bin_1.sha256Base64Bytes).buffer;
const cachedSha256 = {};
/**
 * An ultimately-portable (but possibly slower) version of
 * `instantiateSha256Bytes` which does not require the consumer to provide the
 * sha256 binary buffer.
 */
exports.instantiateSha256 = async () => {
    if (cachedSha256.cache !== undefined) {
        return cachedSha256.cache;
    }
    const result = exports.instantiateSha256Bytes(exports.getEmbeddedSha256Binary());
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
    cachedSha256.cache = result;
    return result;
};

},{"../bin/bin":8,"../format/format":27}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateSha512 = exports.getEmbeddedSha512Binary = exports.instantiateSha512Bytes = void 0;
const bin_1 = require("../bin/bin");
const format_1 = require("../format/format");
/**
 * The most performant way to instantiate sha512 functionality. To avoid
 * using Node.js or DOM-specific APIs, you can use `instantiateSha512`.
 *
 * @param webassemblyBytes - A buffer containing the sha512 binary.
 */
exports.instantiateSha512Bytes = async (webassemblyBytes) => {
    const wasm = await bin_1.instantiateRustWasm(webassemblyBytes, './sha512', 'sha512', 'sha512_init', 'sha512_update', 'sha512_final');
    return {
        final: wasm.final,
        hash: wasm.hash,
        init: wasm.init,
        update: wasm.update,
    };
};
exports.getEmbeddedSha512Binary = () => format_1.base64ToBin(bin_1.sha512Base64Bytes).buffer;
const cachedSha512 = {};
/**
 * An ultimately-portable (but slower) version of `instantiateSha512Bytes`
 * which does not require the consumer to provide the sha512 binary buffer.
 */
exports.instantiateSha512 = async () => {
    if (cachedSha512.cache !== undefined) {
        return cachedSha512.cache;
    }
    const result = exports.instantiateSha512Bytes(exports.getEmbeddedSha512Binary());
    // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
    cachedSha512.cache = result;
    return result;
};

},{"../bin/bin":8,"../format/format":27}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binToBase58 = exports.base58ToBin = exports.bitcoinBase58Alphabet = exports.createBaseConverter = exports.BaseConversionError = void 0;
var BaseConversionError;
(function (BaseConversionError) {
    BaseConversionError["tooLong"] = "An alphabet may be no longer than 254 characters.";
    BaseConversionError["ambiguousCharacter"] = "A character code may only appear once in a single alphabet.";
    BaseConversionError["unknownCharacter"] = "Encountered an unknown character for this alphabet.";
})(BaseConversionError = exports.BaseConversionError || (exports.BaseConversionError = {}));
/**
 * Create a `BaseConverter`, which exposes methods for encoding and decoding
 * `Uint8Array`s using bitcoin-style padding: each leading zero in the input is
 * replaced with the zero-index character of the `alphabet`, then the remainder
 * of the input is encoded as a large number in the specified alphabet.
 *
 * For example, using the alphabet `01`, the input `[0, 15]` is encoded `01111`
 * – a single `0` represents the leading padding, followed by the base2 encoded
 * `0x1111` (15). With the same alphabet, the input `[0, 0, 255]` is encoded
 * `0011111111` - only two `0` characters are required to represent both
 * leading zeros, followed by the base2 encoded `0x11111111` (255).
 *
 * **This is not compatible with `RFC 3548`'s `Base16`, `Base32`, or `Base64`.**
 *
 * If the alphabet is malformed, this method returns the error as a `string`.
 *
 * @param alphabet - an ordered string which maps each index to a character,
 * e.g. `0123456789`.
 * @privateRemarks
 * Algorithm from the `base-x` implementation (which is derived from the
 * original Satoshi implementation): https://github.com/cryptocoinjs/base-x
 */
exports.createBaseConverter = (alphabet) => {
    const undefinedValue = 255;
    const uint8ArrayBase = 256;
    if (alphabet.length >= undefinedValue)
        return BaseConversionError.tooLong;
    const alphabetMap = new Uint8Array(uint8ArrayBase).fill(undefinedValue);
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let, no-plusplus
    for (let index = 0; index < alphabet.length; index++) {
        const characterCode = alphabet.charCodeAt(index);
        if (alphabetMap[characterCode] !== undefinedValue) {
            return BaseConversionError.ambiguousCharacter;
        }
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        alphabetMap[characterCode] = index;
    }
    const base = alphabet.length;
    const paddingCharacter = alphabet.charAt(0);
    const factor = Math.log(base) / Math.log(uint8ArrayBase);
    const inverseFactor = Math.log(uint8ArrayBase) / Math.log(base);
    return {
        // eslint-disable-next-line complexity
        decode: (input) => {
            if (input.length === 0)
                return Uint8Array.of();
            const firstNonZeroIndex = input
                .split('')
                .findIndex((character) => character !== paddingCharacter);
            if (firstNonZeroIndex === -1) {
                return new Uint8Array(input.length);
            }
            const requiredLength = Math.floor((input.length - firstNonZeroIndex) * factor + 1);
            const decoded = new Uint8Array(requiredLength);
            /* eslint-disable functional/no-let, functional/no-expression-statement */
            let nextByte = firstNonZeroIndex;
            let remainingBytes = 0;
            // eslint-disable-next-line functional/no-loop-statement
            while (input[nextByte] !== undefined) {
                let carry = alphabetMap[input.charCodeAt(nextByte)];
                if (carry === undefinedValue)
                    return BaseConversionError.unknownCharacter;
                let digit = 0;
                // eslint-disable-next-line functional/no-loop-statement
                for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; 
                // eslint-disable-next-line no-plusplus
                steps--, digit++) {
                    carry += Math.floor(base * decoded[steps]);
                    // eslint-disable-next-line functional/immutable-data
                    decoded[steps] = Math.floor(carry % uint8ArrayBase);
                    carry = Math.floor(carry / uint8ArrayBase);
                }
                remainingBytes = digit;
                // eslint-disable-next-line no-plusplus
                nextByte++;
            }
            /* eslint-enable functional/no-let, functional/no-expression-statement */
            const firstNonZeroResultDigit = decoded.findIndex((value) => value !== 0);
            const bin = new Uint8Array(firstNonZeroIndex + (requiredLength - firstNonZeroResultDigit));
            // eslint-disable-next-line functional/no-expression-statement
            bin.set(decoded.slice(firstNonZeroResultDigit), firstNonZeroIndex);
            return bin;
        },
        // eslint-disable-next-line complexity
        encode: (input) => {
            if (input.length === 0)
                return '';
            const firstNonZeroIndex = input.findIndex((byte) => byte !== 0);
            if (firstNonZeroIndex === -1) {
                return paddingCharacter.repeat(input.length);
            }
            const requiredLength = Math.floor((input.length - firstNonZeroIndex) * inverseFactor + 1);
            const encoded = new Uint8Array(requiredLength);
            /* eslint-disable functional/no-let, functional/no-expression-statement */
            let nextByte = firstNonZeroIndex;
            let remainingBytes = 0;
            // eslint-disable-next-line functional/no-loop-statement
            while (nextByte !== input.length) {
                let carry = input[nextByte];
                let digit = 0;
                // eslint-disable-next-line functional/no-loop-statement
                for (let steps = requiredLength - 1; (carry !== 0 || digit < remainingBytes) && steps !== -1; 
                // eslint-disable-next-line no-plusplus
                steps--, digit++) {
                    carry += Math.floor(uint8ArrayBase * encoded[steps]);
                    // eslint-disable-next-line functional/immutable-data
                    encoded[steps] = Math.floor(carry % base);
                    carry = Math.floor(carry / base);
                }
                remainingBytes = digit;
                // eslint-disable-next-line no-plusplus
                nextByte++;
            }
            /* eslint-enable functional/no-let, functional/no-expression-statement */
            const firstNonZeroResultDigit = encoded.findIndex((value) => value !== 0);
            const padding = paddingCharacter.repeat(firstNonZeroIndex);
            return encoded
                .slice(firstNonZeroResultDigit)
                .reduce((all, digit) => all + alphabet.charAt(digit), padding);
        },
    };
};
exports.bitcoinBase58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = exports.createBaseConverter(exports.bitcoinBase58Alphabet);
/**
 * Convert a bitcoin-style base58-encoded string to a Uint8Array.
 *
 * See `createBaseConverter` for format details.
 * @param input - a valid base58-encoded string to decode
 */
exports.base58ToBin = base58.decode;
/**
 * Convert a Uint8Array to a bitcoin-style base58-encoded string.
 *
 * See `createBaseConverter` for format details.
 * @param input - the Uint8Array to base58 encode
 */
exports.binToBase58 = base58.encode;

},{}],25:[function(require,module,exports){
"use strict";
// base64 encode/decode derived from: https://github.com/niklasvh/base64-arraybuffer
Object.defineProperty(exports, "__esModule", { value: true });
exports.binToBase64 = exports.base64ToBin = exports.isBase64 = void 0;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64GroupLength = 4;
const nonBase64Chars = new RegExp(`[^${chars}=]`, 'u');
/**
 * For use before `base64ToBin`. Returns true if the provided string is valid
 * base64 (length is divisible by 4, only uses base64 characters).
 * @param maybeHex - a string to test
 */
exports.isBase64 = (maybeBase64) => maybeBase64.length % base64GroupLength === 0 &&
    !nonBase64Chars.test(maybeBase64);
/* eslint-disable functional/no-expression-statement, functional/immutable-data, @typescript-eslint/no-magic-numbers, no-bitwise, no-plusplus */
/**
 * Convert a base64-encoded string to a Uint8Array.
 *
 * Note, this method always completes. If `validBase64` is not valid base64, an
 * incorrect result will be returned. If `validBase64` is potentially malformed,
 * check it with `isBase64` before calling this method.
 *
 * @param validBase64 - a valid base64-encoded string to decode
 */
exports.base64ToBin = (validBase64) => {
    const lookup = new Uint8Array(123);
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    const bufferLengthEstimate = validBase64.length * 0.75;
    const stringLength = validBase64.length;
    const bufferLength = validBase64[validBase64.length - 1] === '=' // eslint-disable-line @typescript-eslint/prefer-string-starts-ends-with
        ? validBase64[validBase64.length - 2] === '='
            ? bufferLengthEstimate - 2
            : bufferLengthEstimate - 1
        : bufferLengthEstimate;
    const buffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(buffer);
    // eslint-disable-next-line functional/no-let
    let p = 0;
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement
    for (let i = 0; i < stringLength; i += 4) {
        const encoded1 = lookup[validBase64.charCodeAt(i)];
        const encoded2 = lookup[validBase64.charCodeAt(i + 1)];
        const encoded3 = lookup[validBase64.charCodeAt(i + 2)];
        const encoded4 = lookup[validBase64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return bytes;
};
/**
 * Convert a Uint8Array to a base64-encoded string.
 * @param bytes - the Uint8Array to base64 encode
 */
exports.binToBase64 = (bytes) => {
    // eslint-disable-next-line functional/no-let
    let result = '';
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement
    for (let i = 0; i < bytes.length; i += 3) {
        result += chars[bytes[i] >> 2];
        result += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        result += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        result += chars[bytes[i + 2] & 63];
    }
    const padded = bytes.length % 3 === 2
        ? `${result.substring(0, result.length - 1)}=`
        : bytes.length % 3 === 1
            ? `${result.substring(0, result.length - 2)}==`
            : result;
    return padded;
};
/* eslint-enable functional/no-expression-statement, functional/immutable-data, @typescript-eslint/no-magic-numbers, no-bitwise, no-plusplus */

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBinString = exports.binToBinString = exports.binStringToBin = void 0;
const hex_1 = require("./hex");
const binaryByteWidth = 8;
const binary = 2;
/**
 * Decode a binary-encoded string into a Uint8Array.
 *
 * E.g.: `binStringToBin('0010101001100100')` → `new Uint8Array([42, 100])`
 *
 * Note, this method always completes. If `binaryDigits` is not divisible by 8,
 * the final byte will be parsed as if it were prepended with `0`s (e.g. `1`
 * is interpreted as `00000001`). If `binaryDigits` is potentially malformed,
 * check it with `isBinString` before calling this method.
 *
 * @param validHex - a string of valid, hexadecimal-encoded data
 */
exports.binStringToBin = (binaryDigits) => Uint8Array.from(hex_1.splitEvery(binaryDigits, binaryByteWidth).map((byteString) => parseInt(byteString, binary)));
/**
 * Encode a Uint8Array into a binary-encoded string.
 *
 * E.g.: `binToBinString(Uint8Array.from([42, 100]))` → `'0010101001100100'`
 *
 * @param bytes - a Uint8Array to encode
 */
exports.binToBinString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(binary).padStart(binaryByteWidth, '0'), '');
/**
 * For use before `binStringToBin`. Returns true if the provided string is a
 * valid binary string (length is divisible by 8 and only uses the characters
 * `0` and `1`).
 * @param maybeBinString - a string to test
 */
exports.isBinString = (maybeBinString) => maybeBinString.length % binaryByteWidth === 0 &&
    !/[^01]/u.test(maybeBinString);

},{"./hex":28}],27:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./hex"), exports);
__exportStar(require("./bin-string"), exports);
__exportStar(require("./base-convert"), exports);
__exportStar(require("./base64"), exports);
__exportStar(require("./numbers"), exports);
__exportStar(require("./log"), exports);
__exportStar(require("./time"), exports);
__exportStar(require("./type-utils"), exports);
__exportStar(require("./utf8"), exports);

},{"./base-convert":24,"./base64":25,"./bin-string":26,"./hex":28,"./log":29,"./numbers":30,"./time":31,"./type-utils":32,"./utf8":33}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenBinArray = exports.swapEndianness = exports.binToHex = exports.isHex = exports.hexToBin = exports.splitEvery = exports.range = void 0;
/**
 * Returns an array of incrementing values starting at `begin` and incrementing by one for `length`.
 *
 * E.g.: `range(3)` → `[0, 1, 2]` and `range(3, 1)` → `[1, 2, 3]`
 *
 * @param length - the number of elements in the array
 * @param begin - the index at which the range starts (default: `0`)
 */
exports.range = (length, begin = 0) => Array.from({ length }, (_, index) => begin + index);
/**
 * Split a string into an array of `chunkLength` strings. The final string may have a length between 1 and `chunkLength`.
 *
 * E.g.: `splitEvery('abcde', 2)` → `['ab', 'cd', 'e']`
 */
exports.splitEvery = (input, chunkLength) => exports.range(Math.ceil(input.length / chunkLength))
    .map((index) => index * chunkLength)
    .map((begin) => input.slice(begin, begin + chunkLength));
const hexByteWidth = 2;
const hexadecimal = 16;
/**
 * Decode a hexadecimal-encoded string into a Uint8Array.
 *
 * E.g.: `hexToBin('2a64ff')` → `new Uint8Array([42, 100, 255])`
 *
 * Note, this method always completes. If `validHex` is not divisible by 2,
 * the final byte will be parsed as if it were prepended with a `0` (e.g. `aaa`
 * is interpreted as `aa0a`). If `validHex` is potentially malformed, check
 * it with `isHex` before calling this method.
 *
 * @param validHex - a string of valid, hexadecimal-encoded data
 */
exports.hexToBin = (validHex) => Uint8Array.from(exports.splitEvery(validHex, hexByteWidth).map((byte) => parseInt(byte, hexadecimal)));
/**
 * For use before `hexToBin`. Returns true if the provided string is valid
 * hexadecimal (length is divisible by 2, only uses hexadecimal characters).
 * @param maybeHex - a string to test
 */
exports.isHex = (maybeHex) => maybeHex.length % hexByteWidth === 0 && !/[^a-fA-F0-9]/u.test(maybeHex);
/**
 * Encode a Uint8Array into a hexadecimal-encoded string.
 *
 * E.g.: `binToHex(new Uint8Array([42, 100, 255]))` → `'2a64ff'`
 *
 * @param bytes - a Uint8Array to encode
 */
exports.binToHex = (bytes) => bytes.reduce((str, byte) => str + byte.toString(hexadecimal).padStart(hexByteWidth, '0'), '');
/**
 * Decode a hexadecimal-encoded string into bytes, reverse it, then re-encode.
 *
 * @param validHex - a string of valid, hexadecimal-encoded data. See
 * `hexToBin` for more information.
 */
exports.swapEndianness = (validHex) => exports.binToHex(exports.hexToBin(validHex).reverse());
/**
 * Reduce an array of `Uint8Array`s into a single `Uint8Array`.
 * @param array - the array of `Uint8Array`s to flatten
 */
exports.flattenBinArray = (array) => {
    const totalLength = array.reduce((total, bin) => total + bin.length, 0);
    const flattened = new Uint8Array(totalLength);
    // eslint-disable-next-line functional/no-expression-statement
    array.reduce((index, bin) => {
        // eslint-disable-next-line functional/no-expression-statement
        flattened.set(bin, index);
        return index + bin.length;
    }, 0);
    return flattened;
};

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyTestVector = exports.sortObjectKeys = exports.stringify = void 0;
const hex_1 = require("./hex");
const defaultStringifySpacing = 2;
/**
 * A safe method to `JSON.stringify` a value, useful for debugging and logging
 * purposes.
 *
 * @remarks
 * Without modifications, `JSON.stringify` has several shortcomings in
 * debugging and logging usage:
 * - throws when serializing anything containing a `bigint`
 * - `Uint8Array`s are often serialized in base 10 with newlines between each
 *   index item
 * - `functions` and `symbols` are not clearly marked
 *
 * This method is more helpful in these cases:
 * - `bigint`: `0n` → `<bigint: 0n>`
 * - `Uint8Array`: `Uint8Array.of(0,0)` → `<Uint8Array: 0x0000>`
 * - `function`: `(x) => x * 2` → `<function: (x) => x * 2>`
 * - `symbol`: `Symbol(A)` → `<symbol: Symbol(A)>`
 *
 * @param value - the data to serialize
 * @param spacing - the number of spaces to use in
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.stringify = (value, spacing = defaultStringifySpacing) => JSON.stringify(value, 
// eslint-disable-next-line complexity
(_, item) => {
    const type = typeof item;
    const name = typeof item === 'object' && item !== null
        ? item.constructor.name
        : type;
    switch (name) {
        case 'Uint8Array':
            return `<Uint8Array: 0x${hex_1.binToHex(item)}>`;
        case 'bigint':
            return `<bigint: ${item.toString()}n>`;
        case 'function':
        case 'symbol':
            // eslint-disable-next-line @typescript-eslint/ban-types
            return `<${name}: ${item.toString()}>`;
        default:
            return item;
    }
}, spacing);
/**
 * Given a value, recursively sort the keys of all objects it references
 * (without sorting arrays).
 *
 * @param objectOrArray - the object or array in which to sort object keys
 */
exports.sortObjectKeys = (objectOrArray
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
    if (Array.isArray(objectOrArray)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return objectOrArray.map(exports.sortObjectKeys);
    }
    if (typeof objectOrArray !== 'object' ||
        objectOrArray === null ||
        objectOrArray.constructor.name !== 'Object') {
        return objectOrArray;
    }
    // eslint-disable-next-line functional/immutable-data
    const keys = Object.keys(objectOrArray).sort((a, b) => a.localeCompare(b));
    return keys.reduce((all, key) => (Object.assign(Object.assign({}, all), { 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [key]: exports.sortObjectKeys(objectOrArray[key]) })), {});
};
const uint8ArrayRegex = /"<Uint8Array: 0x(?<hex>[0-9a-f]*)>"/gu;
const bigIntRegex = /"<bigint: (?<bigint>[0-9]*)n>"/gu;
/**
 * An alternative to `stringify` which produces valid JavaScript for use as a
 * test vector in this library. `Uint8Array`s are constructed using `hexToBin`
 * and `bigint` values use the `BigInt` constructor. If `alphabetize` is `true`,
 * all objects will be sorted in the output.
 *
 * Note, this assumes all strings which match the expected regular expressions
 * are values of type `Uint8Array` and `bigint` respectively. String values
 * which otherwise happen to match these regular expressions will be converted
 * incorrectly.
 *
 * @param stringified - the result of `stringify`
 */
exports.stringifyTestVector = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
value, alphabetize = true) => {
    const stringified = alphabetize
        ? exports.stringify(exports.sortObjectKeys(value))
        : exports.stringify(value);
    return stringified
        .replace(uint8ArrayRegex, "hexToBin('$1')")
        .replace(bigIntRegex, "BigInt('$1')");
};

},{"./hex":28}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigIntToBitcoinVarInt = exports.readBitcoinVarInt = exports.varIntPrefixToSize = exports.binToBigIntUint64LE = exports.binToBigIntUintLE = exports.bigIntToBinUint256BEClamped = exports.binToBigIntUint256BE = exports.binToBigIntUintBE = exports.binToNumberUint32LE = exports.binToNumberUint16LE = exports.binToNumberUintLE = exports.numberToBinInt32TwosCompliment = exports.bigIntToBinUint64LE = exports.bigIntToBinUint64LEClamped = exports.bigIntToBinUintLE = exports.numberToBinUint32BE = exports.numberToBinUint32LE = exports.numberToBinUint16BE = exports.binToNumberInt32LE = exports.binToNumberInt16LE = exports.numberToBinInt32LE = exports.numberToBinInt16LE = exports.numberToBinUint16LE = exports.numberToBinUint32LEClamped = exports.numberToBinUint16LEClamped = exports.binToFixedLength = exports.numberToBinUintLE = void 0;
/**
 * Encode a positive integer as a little-endian Uint8Array. For values exceeding
 * `Number.MAX_SAFE_INTEGER` (`9007199254740991`), use `bigIntToBinUintLE`.
 * Negative values will return the same result as `0`.
 *
 * @param value - the number to encode
 */
exports.numberToBinUintLE = (value) => {
    const baseUint8Array = 256;
    const result = [];
    // eslint-disable-next-line functional/no-let
    let remaining = value;
    // eslint-disable-next-line functional/no-loop-statement
    while (remaining >= baseUint8Array) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        result.push(remaining % baseUint8Array);
        // eslint-disable-next-line functional/no-expression-statement
        remaining = Math.floor(remaining / baseUint8Array);
    }
    // eslint-disable-next-line functional/no-conditional-statement, functional/no-expression-statement, functional/immutable-data
    if (remaining > 0)
        result.push(remaining);
    return Uint8Array.from(result);
};
/**
 * Fill a new Uint8Array of a specific byte-length with the contents of a given
 * Uint8Array, truncating or padding the Uint8Array with zeros.
 *
 * @param bin - the Uint8Array to resize
 * @param bytes - the desired byte-length
 */
exports.binToFixedLength = (bin, bytes) => {
    const fixedBytes = new Uint8Array(bytes);
    const maxValue = 255;
    // eslint-disable-next-line functional/no-expression-statement
    bin.length > bytes ? fixedBytes.fill(maxValue) : fixedBytes.set(bin);
    // TODO: re-enable eslint-disable-next-line @typescript-eslint/no-unused-expressions
    return fixedBytes;
};
/**
 * Encode a positive integer as a 2-byte Uint16LE Uint8Array, clamping the
 * results. (Values exceeding `0xffff` return the same result as `0xffff`,
 * negative values will return the same result as `0`.)
 *
 * @param value - the number to encode
 */
exports.numberToBinUint16LEClamped = (value) => {
    const uint16 = 2;
    return exports.binToFixedLength(exports.numberToBinUintLE(value), uint16);
};
/**
 * Encode a positive integer as a 4-byte Uint32LE Uint8Array, clamping the
 * results. (Values exceeding `0xffffffff` return the same result as
 * `0xffffffff`, negative values will return the same result as `0`.)
 *
 * @param value - the number to encode
 */
exports.numberToBinUint32LEClamped = (value) => {
    const uint32 = 4;
    return exports.binToFixedLength(exports.numberToBinUintLE(value), uint32);
};
/**
 * Encode a positive integer as a 2-byte Uint16LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0` to `0xffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinUint16LE = (value) => {
    const uint16Length = 2;
    const bin = new Uint8Array(uint16Length);
    const writeAsLittleEndian = true;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setUint16(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Encode an integer as a 2-byte Int16LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0x0000` to `0xffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinInt16LE = (value) => {
    const int16Length = 2;
    const bin = new Uint8Array(int16Length);
    const writeAsLittleEndian = true;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setInt16(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Encode an integer as a 4-byte Uint32LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0x00000000` to `0xffffffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinInt32LE = (value) => {
    const int32Length = 4;
    const bin = new Uint8Array(int32Length);
    const writeAsLittleEndian = true;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setInt32(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Decode a 2-byte Int16LE Uint8Array into a number.
 *
 * Throws if `bin` is shorter than 2 bytes.
 *
 * @param bin - the Uint8Array to decode
 */
exports.binToNumberInt16LE = (bin) => {
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const readAsLittleEndian = true;
    return view.getInt16(0, readAsLittleEndian);
};
/**
 * Decode a 4-byte Int32LE Uint8Array into a number.
 *
 * Throws if `bin` is shorter than 4 bytes.
 *
 * @param bin - the Uint8Array to decode
 */
exports.binToNumberInt32LE = (bin) => {
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const readAsLittleEndian = true;
    return view.getInt32(0, readAsLittleEndian);
};
/**
 * Encode a positive integer as a 2-byte Uint16LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0` to `0xffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinUint16BE = (value) => {
    const uint16Length = 2;
    const bin = new Uint8Array(uint16Length);
    const writeAsLittleEndian = false;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setUint16(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Encode a positive number as a 4-byte Uint32LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0` to `0xffffffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinUint32LE = (value) => {
    const uint32Length = 4;
    const bin = new Uint8Array(uint32Length);
    const writeAsLittleEndian = true;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setUint32(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Encode a positive number as a 4-byte Uint32BE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0` to `0xffffffff`.
 *
 * @param value - the number to encode
 */
exports.numberToBinUint32BE = (value) => {
    const uint32Length = 4;
    const bin = new Uint8Array(uint32Length);
    const writeAsLittleEndian = false;
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    // eslint-disable-next-line functional/no-expression-statement
    view.setUint32(0, value, writeAsLittleEndian);
    return bin;
};
/**
 * Encode a positive BigInt as little-endian Uint8Array. Negative values will
 * return the same result as `0`.
 *
 * @param value - the number to encode
 */
exports.bigIntToBinUintLE = (value) => {
    const baseUint8Array = 256;
    const base = BigInt(baseUint8Array);
    const result = [];
    // eslint-disable-next-line functional/no-let
    let remaining = value;
    // eslint-disable-next-line functional/no-loop-statement
    while (remaining >= base) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        result.push(Number(remaining % base));
        // eslint-disable-next-line functional/no-expression-statement
        remaining /= base;
    }
    // eslint-disable-next-line functional/no-conditional-statement, functional/no-expression-statement, functional/immutable-data
    if (remaining > BigInt(0))
        result.push(Number(remaining));
    return Uint8Array.from(result.length > 0 ? result : [0]);
};
/**
 * Encode a positive BigInt as an 8-byte Uint64LE Uint8Array, clamping the
 * results. (Values exceeding `0xffff_ffff_ffff_ffff` return the same result as
 * `0xffff_ffff_ffff_ffff`, negative values return the same result as `0`.)
 *
 * @param value - the number to encode
 */
exports.bigIntToBinUint64LEClamped = (value) => {
    const uint64 = 8;
    return exports.binToFixedLength(exports.bigIntToBinUintLE(value), uint64);
};
/**
 * Encode a positive BigInt as an 8-byte Uint64LE Uint8Array.
 *
 * This method will return an incorrect result for values outside of the range
 * `0` to `0xffff_ffff_ffff_ffff`.
 *
 * @param value - the number to encode
 */
exports.bigIntToBinUint64LE = (value) => {
    const uint64LengthInBits = 64;
    const valueAsUint64 = BigInt.asUintN(uint64LengthInBits, value);
    const fixedLengthBin = exports.bigIntToBinUint64LEClamped(valueAsUint64);
    return fixedLengthBin;
};
/**
 * Encode an integer as a 4-byte, little-endian Uint8Array using the number's
 * two's compliment representation (the format used by JavaScript's bitwise
 * operators).
 *
 * @remarks
 * The C++ bitcoin implementations sometimes represent short vectors using
 * signed 32-bit integers (e.g. `sighashType`). This method can be used to test
 * compatibility with those implementations.
 *
 * @param value - the number to encode
 */
exports.numberToBinInt32TwosCompliment = (value) => {
    const bytes = 4;
    const bitsInAByte = 8;
    const bin = new Uint8Array(bytes);
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let offset = 0; offset < bytes; offset++) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        bin[offset] = value;
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, no-param-reassign
        value >>>= bitsInAByte;
    }
    return bin;
};
/**
 * Decode a little-endian Uint8Array of any length into a number. For numbers
 * larger than `Number.MAX_SAFE_INTEGER` (`9007199254740991`), use
 * `binToBigIntUintLE`.
 *
 * The `bytes` parameter can be set to constrain the expected length (default:
 * `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
 *
 * @privateRemarks
 * We avoid a bitwise strategy here because JavaScript uses 32-bit signed
 * integers for bitwise math, so larger numbers are converted incorrectly. E.g.
 * `2147483648 << 8` is `0`, while `2147483648n << 8n` is `549755813888n`.
 *
 * @param bin - the Uint8Array to decode
 * @param bytes - the number of bytes to read (default: `bin.length`)
 */
exports.binToNumberUintLE = (bin, bytes = bin.length) => {
    const base = 2;
    const bitsInAByte = 8;
    // eslint-disable-next-line functional/no-conditional-statement
    if (bin.length !== bytes) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new TypeError(`Bin length must be ${bytes}.`);
    }
    return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduce((accumulated, byte, i) => accumulated + byte * base ** (bitsInAByte * i), 0);
};
/**
 * Decode a 2-byte Uint16LE Uint8Array into a number.
 *
 * Throws if `bin` is shorter than 2 bytes.
 *
 * @param bin - the Uint8Array to decode
 */
exports.binToNumberUint16LE = (bin) => {
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const readAsLittleEndian = true;
    return view.getUint16(0, readAsLittleEndian);
};
/**
 * Decode a 4-byte Uint32LE Uint8Array into a number.
 *
 * Throws if `bin` is shorter than 4 bytes.
 *
 * @param bin - the Uint8Array to decode
 */
exports.binToNumberUint32LE = (bin) => {
    const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const readAsLittleEndian = true;
    return view.getUint32(0, readAsLittleEndian);
};
/**
 * Decode a big-endian Uint8Array of any length into a BigInt. If starting from
 * a hex value, consider using the BigInt constructor instead:
 * ```
 * BigInt(`0x${hex}`)
 * ```
 *
 * The `bytes` parameter can be set to constrain the expected length (default:
 * `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
 *
 * @param bin - the Uint8Array to decode
 * @param bytes - the number of bytes to read (default: `bin.length`)
 */
exports.binToBigIntUintBE = (bin, bytes = bin.length) => {
    const bitsInAByte = 8;
    const shift = BigInt(bitsInAByte);
    // eslint-disable-next-line functional/no-conditional-statement
    if (bin.length !== bytes) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new TypeError(`Bin length must be ${bytes}.`);
    }
    return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduce(
    // eslint-disable-next-line no-bitwise
    (accumulated, byte) => (accumulated << shift) | BigInt(byte), BigInt(0));
};
/**
 * Decode an unsigned, 32-byte big-endian Uint8Array into a BigInt. This can be
 * used to decode Uint8Array-encoded cryptographic primitives like private
 * keys, public keys, curve parameters, and signature points.
 *
 * If starting from a hex value, consider using the BigInt constructor instead:
 * ```
 * BigInt(`0x${hex}`)
 * ```
 * @param bin - the Uint8Array to decode
 */
exports.binToBigIntUint256BE = (bin) => {
    const uint256Bytes = 32;
    return exports.binToBigIntUintBE(bin, uint256Bytes);
};
/**
 * Encode a positive BigInt into an unsigned 32-byte big-endian Uint8Array. This
 * can be used to encoded numbers for cryptographic primitives like private
 * keys, public keys, curve parameters, and signature points.
 *
 * Negative values will return the same result as `0`, values higher than
 * 2^256-1 will return the maximum expressible unsigned 256-bit value
 * (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`).
 *
 * @param value - the BigInt to encode
 */
exports.bigIntToBinUint256BEClamped = (value) => {
    const uint256Bytes = 32;
    return exports.binToFixedLength(exports.bigIntToBinUintLE(value), uint256Bytes).reverse();
};
/**
 * Decode a little-endian Uint8Array of any length into a BigInt.
 *
 * The `bytes` parameter can be set to constrain the expected length (default:
 * `bin.length`). This method throws if `bin.length` is not equal to `bytes`.
 *
 * @param bin - the Uint8Array to decode
 * @param bytes - the number of bytes to read (default: `bin.length`)
 */
exports.binToBigIntUintLE = (bin, bytes = bin.length) => {
    const bitsInAByte = 8;
    // eslint-disable-next-line functional/no-conditional-statement
    if (bin.length !== bytes) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new TypeError(`Bin length must be ${bytes}.`);
    }
    return new Uint8Array(bin.buffer, bin.byteOffset, bin.length).reduceRight(
    // eslint-disable-next-line no-bitwise
    (accumulated, byte) => (accumulated << BigInt(bitsInAByte)) | BigInt(byte), BigInt(0));
};
/**
 * Decode an 8-byte Uint64LE Uint8Array into a BigInt.
 *
 * Throws if `bin` is shorter than 8 bytes.
 *
 * @param bin - the Uint8Array to decode
 */
exports.binToBigIntUint64LE = (bin) => {
    const uint64LengthInBytes = 8;
    const truncatedBin = bin.length > uint64LengthInBytes ? bin.slice(0, uint64LengthInBytes) : bin;
    return exports.binToBigIntUintLE(truncatedBin, uint64LengthInBytes);
};
/**
 * Get the expected byte length of a Bitcoin VarInt given a first byte.
 *
 * @param firstByte - the first byte of the VarInt
 */
exports.varIntPrefixToSize = (firstByte) => {
    const uint8 = 1;
    const uint16 = 2;
    const uint32 = 4;
    const uint64 = 8;
    switch (firstByte) {
        case 253 /* uint16Prefix */:
            return uint16 + 1;
        case 254 /* uint32Prefix */:
            return uint32 + 1;
        case 255 /* uint64Prefix */:
            return uint64 + 1;
        default:
            return uint8;
    }
};
/**
 * Read a Bitcoin VarInt (Variable-length integer) from a Uint8Array, returning
 * the `nextOffset` after the VarInt and the value as a BigInt.
 *
 * @param bin - the Uint8Array from which to read the VarInt
 * @param offset - the offset at which the VarInt begins
 */
exports.readBitcoinVarInt = (bin, offset = 0) => {
    const bytes = exports.varIntPrefixToSize(bin[offset]);
    const hasPrefix = bytes !== 1;
    return {
        nextOffset: offset + bytes,
        value: hasPrefix
            ? exports.binToBigIntUintLE(bin.subarray(offset + 1, offset + bytes), bytes - 1)
            : exports.binToBigIntUintLE(bin.subarray(offset, offset + bytes), 1),
    };
};
/**
 * Encode a positive BigInt as a Bitcoin VarInt (Variable-length integer).
 *
 * Note: the maximum value of a Bitcoin VarInt is `0xffff_ffff_ffff_ffff`. This
 * method will return an incorrect result for values outside of the range `0` to
 * `0xffff_ffff_ffff_ffff`.
 *
 * @param value - the BigInt to encode (no larger than `0xffff_ffff_ffff_ffff`)
 */
exports.bigIntToBitcoinVarInt = (value) => value <= BigInt(252 /* uint8MaxValue */)
    ? Uint8Array.of(Number(value))
    : value <= BigInt(65535 /* uint16MaxValue */)
        ? Uint8Array.from([
            253 /* uint16Prefix */,
            ...exports.numberToBinUint16LE(Number(value)),
        ])
        : value <= BigInt(4294967295 /* uint32MaxValue */)
            ? Uint8Array.from([
                254 /* uint32Prefix */,
                ...exports.numberToBinUint32LE(Number(value)),
            ])
            : Uint8Array.from([255 /* uint64Prefix */, ...exports.bigIntToBinUint64LE(value)]);

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocktimeBin = exports.dateToLocktimeBin = exports.locktimeToDate = exports.dateToLocktime = exports.LocktimeError = exports.maximumLocktimeDate = exports.minimumLocktimeDate = exports.maximumLocktimeTimestamp = exports.minimumLocktimeTimestamp = void 0;
const numbers_1 = require("./numbers");
const msPerLocktimeSecond = 1000;
/**
 * The minimum Unix timestamp (inclusive) which can be encoded by a
 * transaction's `locktime`.
 */
exports.minimumLocktimeTimestamp = 500000000;
/**
 * The maximum Unix timestamp (inclusive) which can be encoded by a
 * transaction's `locktime`.
 */
exports.maximumLocktimeTimestamp = 0xffffffff;
/**
 * The minimum Date (inclusive) which can be encoded by a transaction's
 * `locktime`.
 */
exports.minimumLocktimeDate = new Date(exports.minimumLocktimeTimestamp * msPerLocktimeSecond);
/**
 * The maximum Date (inclusive) which can be encoded by a transaction's
 * `locktime`.
 */
exports.maximumLocktimeDate = new Date(exports.maximumLocktimeTimestamp * msPerLocktimeSecond);
var LocktimeError;
(function (LocktimeError) {
    LocktimeError["dateOutOfRange"] = "The provided Date is outside of the range which can be encoded in locktime.";
    LocktimeError["locktimeOutOfRange"] = "The provided locktime is outside of the range which can be encoded as a Date (greater than or equal to 500000000 and less than or equal to 4294967295).";
    LocktimeError["incorrectLength"] = "The provided locktime is not the correct length (4 bytes).";
})(LocktimeError = exports.LocktimeError || (exports.LocktimeError = {}));
/**
 * Convert a JavaScript `Date` object to its equivalent transaction `locktime`
 * representation. The `date` is rounded to the nearest second (the precision of
 * `locktime` Dates).
 *
 * Note, a locktime values greater than or equal to `500000000`
 * See `Transaction.locktime` for details.
 *
 * @param date - the Date to convert to a locktime number
 */
exports.dateToLocktime = (date) => date < exports.minimumLocktimeDate || date > exports.maximumLocktimeDate
    ? LocktimeError.dateOutOfRange
    : Math.round(date.getTime() / msPerLocktimeSecond);
/**
 * Convert a transaction `locktime` to its equivalent JavaScript `Date` object.
 * If locktime is outside the possible range (greater than or equal to
 * `500000000` and less than or equal to `4294967295`), an error message is
 * returned.
 *
 * @param locktime - a positive integer between `500000000` and `4294967295`,
 * inclusive
 */
exports.locktimeToDate = (locktime) => locktime < exports.minimumLocktimeTimestamp || locktime > exports.maximumLocktimeTimestamp
    ? LocktimeError.locktimeOutOfRange
    : new Date(locktime * msPerLocktimeSecond);
/**
 * Convert a JavaScript `Date` object to its equivalent transaction `locktime`
 * bytecode representation. The `date` is rounded to the nearest second (the
 * precision of `locktime` Dates).
 *
 * Note: a block-based locktime can simply be encoded with `numberToBinUint32LE`
 * (provided it is no larger than the maximum, `499999999`).
 *
 * @param date - the Date to convert to a locktime Uint8Array
 */
exports.dateToLocktimeBin = (date) => {
    const result = exports.dateToLocktime(date);
    return typeof result === 'string' ? result : numbers_1.numberToBinUint32LE(result);
};
const locktimeByteLength = 4;
/**
 * Parse a locktime, returning a `number` for block heights, a `Date` for block
 * times, or a string for parsing errors.
 *
 * @param bin - the 4-byte Uint8Array locktime to parse
 */
exports.parseLocktimeBin = (bin) => {
    if (bin.length !== locktimeByteLength)
        return LocktimeError.incorrectLength;
    const parsed = numbers_1.binToNumberUint32LE(bin);
    return parsed >= exports.minimumLocktimeTimestamp
        ? new Date(parsed * msPerLocktimeSecond)
        : parsed;
};

},{"./numbers":30}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * const canBeAssigned: Immutable<Uint8Array> = Uint8Array.of(0, 0);
 * const canBeSpread = [...canBeAssigned];
 * const spreadResultWorks = Uint8Array.from(canBeSpread);
 * const functionRequiringIt = (bin: Immutable<Uint8Array>) => bin;
 * const canAcceptNonMutable = functionRequiringIt(Uint8Array.of());
 */

},{}],33:[function(require,module,exports){
"use strict";
/**
 * This implementations is derived from:
 * https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js
 *
 * Copyright 2008 The Closure Library Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.binToUtf8 = exports.utf8ToBin = void 0;
/* eslint-disable complexity, functional/no-let, functional/immutable-data, no-bitwise, @typescript-eslint/no-magic-numbers, functional/no-expression-statement, functional/no-conditional-statement, functional/no-loop-statement, no-plusplus */
/**
 * Interpret a string as UTF-8 and encode it as a Uint8Array.
 * @param utf8 - the string to encode
 */
exports.utf8ToBin = (utf8) => {
    const out = [];
    let p = 0;
    for (let i = 0; i < utf8.length; i++) {
        let c = utf8.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        }
        else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        }
        else if ((c & 0xfc00) === 0xd800 &&
            i + 1 < utf8.length &&
            (utf8.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            c = ((c & 0x03ff) << 10) + 0x10000 + (utf8.charCodeAt((i += 1)) & 0x03ff);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
        else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return new Uint8Array(out);
};
/**
 * Decode a Uint8Array as a UTF-8 string.
 * @param bytes - the Uint8Array to decode
 */
exports.binToUtf8 = (bytes) => {
    const out = [];
    let pos = 0;
    let c = 0;
    while (pos < bytes.length) {
        const c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        }
        else if (c1 > 191 && c1 < 224) {
            const c2 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        }
        else if (c1 > 239 && c1 < 365) {
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            const c4 = bytes[pos++];
            const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                0x10000;
            out[c++] = String.fromCharCode((u >> 10) + 0xd800);
            out[c++] = String.fromCharCode((u & 1023) + 0xdc00);
        }
        else {
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    }
    return out.join('');
};

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crackHdPrivateNodeFromHdPublicNodeAndChildPrivateNode = exports.HdNodeCrackingError = exports.deriveHdPath = exports.deriveHdPublicNodeChild = exports.deriveHdPrivateNodeChild = exports.HdNodeDerivationError = exports.deriveHdPublicNode = exports.encodeHdPublicKey = exports.encodeHdPrivateKey = exports.decodeHdPublicKey = exports.decodeHdPrivateKey = exports.decodeHdKey = exports.HdKeyDecodingError = exports.HdKeyVersion = exports.deriveHdPublicNodeIdentifier = exports.deriveHdPrivateNodeIdentifier = exports.deriveHdPrivateNodeFromSeed = exports.instantiateBIP32Crypto = void 0;
const crypto_1 = require("../crypto/crypto");
const hmac_1 = require("../crypto/hmac");
const format_1 = require("../format/format");
const utf8_1 = require("../format/utf8");
const key_utils_1 = require("./key-utils");
/**
 * Instantiate an object containing WASM implementations of each cryptographic
 * algorithm required by BIP32 utilities in this library.
 *
 * These WASM implementations provide optimal performance across every
 * JavaScript runtime, but depending on your application, you may prefer to
 * instantiate native implementations such as those provided by Node.js or the
 * `crypto.subtle` API (to reduce bundle size) or an external module (for
 * synchronous instantiation).
 */
exports.instantiateBIP32Crypto = async () => {
    const [ripemd160, secp256k1, sha256, sha512] = await Promise.all([
        crypto_1.instantiateRipemd160(),
        crypto_1.instantiateSecp256k1(),
        crypto_1.instantiateSha256(),
        crypto_1.instantiateSha512(),
    ]);
    return { ripemd160, secp256k1, sha256, sha512 };
};
const bip32HmacSha512Key = utf8_1.utf8ToBin('Bitcoin seed');
const halfHmacSha512Length = 32;
/**
 * Derive an `HdPrivateNode` from the provided seed following the BIP32
 * specification. A seed should include between 16 bytes and 64 bytes of
 * entropy (recommended: 32 bytes).
 *
 * @param crypto - an implementation of sha512
 * @param seed - the entropy from which to derive the `HdPrivateNode`
 * @param assumeValidity - if set, the derived private key will not be checked
 * for validity, and will be assumed valid if `true` or invalid if `false` (this
 * is useful for testing)
 */
exports.deriveHdPrivateNodeFromSeed = (crypto, seed, assumeValidity) => {
    const mac = hmac_1.hmacSha512(crypto.sha512, bip32HmacSha512Key, seed);
    const privateKey = mac.slice(0, halfHmacSha512Length);
    const chainCode = mac.slice(halfHmacSha512Length);
    const depth = 0;
    const childIndex = 0;
    const parentFingerprint = Uint8Array.from([0, 0, 0, 0]);
    const valid = assumeValidity !== null && assumeValidity !== void 0 ? assumeValidity : key_utils_1.validateSecp256k1PrivateKey(privateKey);
    return (valid
        ? { chainCode, childIndex, depth, parentFingerprint, privateKey, valid }
        : {
            chainCode,
            childIndex,
            depth,
            invalidPrivateKey: privateKey,
            parentFingerprint,
            valid,
        });
};
/**
 * Derive the public identifier for a given HD private node. This is used to
 * uniquely identify HD nodes in software. The first 4 bytes of this identifier
 * are considered its "fingerprint".
 *
 * @param crypto - implementations of sha256, ripemd160, and secp256k1
 * compressed public key derivation
 * @param hdPrivateNode - the HD private node from which to derive the public
 * identifier (not require to be valid)
 */
exports.deriveHdPrivateNodeIdentifier = (crypto, hdPrivateNode) => crypto.ripemd160.hash(crypto.sha256.hash(crypto.secp256k1.derivePublicKeyCompressed(hdPrivateNode.privateKey)));
/**
 * Derive the public identifier for a given `HdPublicNode`. This is used to
 * uniquely identify HD nodes in software. The first 4 bytes of this identifier
 * are considered its fingerprint.
 *
 * @param crypto - implementations of sha256 and ripemd160
 */
exports.deriveHdPublicNodeIdentifier = (crypto, node) => crypto.ripemd160.hash(crypto.sha256.hash(node.publicKey));
/**
 * The 4-byte version indicating the network and type of an `HdPrivateKey` or
 * `HdPublicKey`.
 */
var HdKeyVersion;
(function (HdKeyVersion) {
    /**
     * Version indicating the HD key is an `HdPrivateKey` intended for use on the
     * main network. Base58 encoding at the expected length of an HD key results
     * in a prefix of `xprv`.
     *
     * Hex: `0x0488ade4`
     */
    HdKeyVersion[HdKeyVersion["mainnetPrivateKey"] = 76066276] = "mainnetPrivateKey";
    /**
     * Version indicating the HD key is an `HdPublicKey` intended for use on the
     * main network. Base58 encoding at the expected length of an HD key results
     * in a prefix of `xpub`.
     *
     * Hex: `0x0488b21e`
     */
    HdKeyVersion[HdKeyVersion["mainnetPublicKey"] = 76067358] = "mainnetPublicKey";
    /**
     * Version indicating the HD key is an `HdPrivateKey` intended for use on the
     * test network. Base58 encoding at the expected length of an HD key results
     * in a prefix of `tprv`.
     *
     * Hex: `0x04358394`
     */
    HdKeyVersion[HdKeyVersion["testnetPrivateKey"] = 70615956] = "testnetPrivateKey";
    /**
     * Version indicating the HD key is an `HdPublicKey` intended for use on the
     * test network. Base58 encoding at the expected length of an HD key results
     * in a prefix of `tpub`.
     *
     * Hex: `0x043587cf`
     */
    HdKeyVersion[HdKeyVersion["testnetPublicKey"] = 70617039] = "testnetPublicKey";
})(HdKeyVersion = exports.HdKeyVersion || (exports.HdKeyVersion = {}));
/**
 * An error in the decoding of an HD public or private key.
 */
var HdKeyDecodingError;
(function (HdKeyDecodingError) {
    HdKeyDecodingError["incorrectLength"] = "HD key decoding error: length is incorrect (must encode 82 bytes).";
    HdKeyDecodingError["invalidChecksum"] = "HD key decoding error: checksum is invalid.";
    HdKeyDecodingError["invalidPrivateNode"] = "HD key decoding error: the key for this HD private node is not a valid Secp256k1 private key.";
    HdKeyDecodingError["missingPrivateKeyPaddingByte"] = "HD key decoding error: version indicates a private key, but the key data is missing a padding byte.";
    HdKeyDecodingError["privateKeyExpected"] = "HD key decoding error: expected an HD private key, but encountered an HD public key.";
    HdKeyDecodingError["publicKeyExpected"] = "HD key decoding error: expected an HD public key, but encountered an HD private key.";
    HdKeyDecodingError["unknownCharacter"] = "HD key decoding error: key includes a non-base58 character.";
    HdKeyDecodingError["unknownVersion"] = "HD key decoding error: key uses an unknown version.";
})(HdKeyDecodingError = exports.HdKeyDecodingError || (exports.HdKeyDecodingError = {}));
/**
 * Decode an HD private key as defined by BIP32, returning a `node` and a
 * `network`. Decoding errors are returned as strings.
 *
 * If the type of the key is known, use `decodeHdPrivateKey` or
 * `decodeHdPublicKey`.
 *
 * @param crypto - an implementation of sha256
 * @param hdKey - a BIP32 HD private key or HD public key
 */
// eslint-disable-next-line complexity
exports.decodeHdKey = (crypto, hdKey) => {
    const decoded = format_1.base58ToBin(hdKey);
    if (decoded === format_1.BaseConversionError.unknownCharacter)
        return HdKeyDecodingError.unknownCharacter;
    const expectedLength = 82;
    if (decoded.length !== expectedLength)
        return HdKeyDecodingError.incorrectLength;
    const checksumIndex = 78;
    const payload = decoded.slice(0, checksumIndex);
    const checksumBits = decoded.slice(checksumIndex);
    const checksum = crypto.sha256.hash(crypto.sha256.hash(payload));
    if (!checksumBits.every((value, i) => value === checksum[i])) {
        return HdKeyDecodingError.invalidChecksum;
    }
    const depthIndex = 4;
    const fingerprintIndex = 5;
    const childIndexIndex = 9;
    const chainCodeIndex = 13;
    const keyDataIndex = 45;
    const version = new DataView(decoded.buffer, decoded.byteOffset, depthIndex).getUint32(0);
    const depth = decoded[depthIndex];
    const parentFingerprint = decoded.slice(fingerprintIndex, childIndexIndex);
    const childIndex = new DataView(decoded.buffer, decoded.byteOffset + childIndexIndex, decoded.byteOffset + chainCodeIndex).getUint32(0);
    const chainCode = decoded.slice(chainCodeIndex, keyDataIndex);
    const keyData = decoded.slice(keyDataIndex, checksumIndex);
    const isPrivateKey = version === HdKeyVersion.mainnetPrivateKey ||
        version === HdKeyVersion.testnetPrivateKey;
    if (isPrivateKey && keyData[0] !== 0x00) {
        return HdKeyDecodingError.missingPrivateKeyPaddingByte;
    }
    if (isPrivateKey) {
        const privateKey = keyData.slice(1);
        const valid = key_utils_1.validateSecp256k1PrivateKey(privateKey);
        return {
            node: valid
                ? {
                    chainCode,
                    childIndex,
                    depth,
                    parentFingerprint,
                    privateKey,
                    valid: true,
                }
                : {
                    chainCode,
                    childIndex,
                    depth,
                    invalidPrivateKey: privateKey,
                    parentFingerprint,
                    valid: false,
                },
            version: version,
        };
    }
    const isPublicKey = version === HdKeyVersion.mainnetPublicKey ||
        version === HdKeyVersion.testnetPublicKey;
    if (!isPublicKey) {
        return HdKeyDecodingError.unknownVersion;
    }
    return {
        node: {
            chainCode,
            childIndex,
            depth,
            parentFingerprint,
            publicKey: keyData,
        },
        version: version,
    };
};
/**
 * Decode an HD private key as defined by BIP32.
 *
 * This method is similar to `decodeHdKey` but ensures that the result is a
 * valid HD private node. Decoding error messages are returned as strings.
 *
 * @param crypto - an implementation of sha256
 * @param hdPrivateKey - a BIP32 HD private key
 */
exports.decodeHdPrivateKey = (crypto, hdPrivateKey) => {
    const decoded = exports.decodeHdKey(crypto, hdPrivateKey);
    if (typeof decoded === 'string')
        return decoded;
    if ('publicKey' in decoded.node) {
        return HdKeyDecodingError.privateKeyExpected;
    }
    if (!decoded.node.valid) {
        return HdKeyDecodingError.invalidPrivateNode;
    }
    if (decoded.version === HdKeyVersion.mainnetPrivateKey) {
        return {
            network: 'mainnet',
            node: decoded.node,
        };
    }
    return {
        network: 'testnet',
        node: decoded.node,
    };
};
/**
 * Decode an HD public key as defined by BIP32.
 *
 * This method is similar to `decodeHdKey` but ensures that the result is an
 * HD public node. Decoding error messages are returned as strings.
 *
 * @param crypto - an implementation of sha256
 * @param hdPublicKey - a BIP32 HD public key
 */
exports.decodeHdPublicKey = (crypto, hdPublicKey) => {
    const decoded = exports.decodeHdKey(crypto, hdPublicKey);
    if (typeof decoded === 'string')
        return decoded;
    if (decoded.version === HdKeyVersion.mainnetPublicKey) {
        return {
            network: 'mainnet',
            node: decoded.node,
        };
    }
    if (decoded.version === HdKeyVersion.testnetPublicKey) {
        return {
            network: 'testnet',
            node: decoded.node,
        };
    }
    return HdKeyDecodingError.publicKeyExpected;
};
/**
 * Encode an HD private key (as defined by BIP32) given an HD private node.
 *
 * @param crypto - an implementation of sha256
 * @param keyParameters - a valid HD private node and the network for which to
 * encode the key
 */
exports.encodeHdPrivateKey = (crypto, keyParameters) => {
    const version = format_1.numberToBinUint32BE(keyParameters.network === 'mainnet'
        ? HdKeyVersion.mainnetPrivateKey
        : HdKeyVersion.testnetPrivateKey);
    const depth = Uint8Array.of(keyParameters.node.depth);
    const childIndex = format_1.numberToBinUint32BE(keyParameters.node.childIndex);
    const isPrivateKey = Uint8Array.of(0x00);
    const payload = format_1.flattenBinArray([
        version,
        depth,
        keyParameters.node.parentFingerprint,
        childIndex,
        keyParameters.node.chainCode,
        isPrivateKey,
        keyParameters.node.privateKey,
    ]);
    const checksumLength = 4;
    const checksum = crypto.sha256
        .hash(crypto.sha256.hash(payload))
        .slice(0, checksumLength);
    return format_1.binToBase58(format_1.flattenBinArray([payload, checksum]));
};
/**
 * Encode an HD public key (as defined by BIP32) given an HD public node.
 *
 * @param crypto - an implementation of sha256
 * @param keyParameters - an HD public node and the network for which to encode
 * the key
 */
exports.encodeHdPublicKey = (crypto, keyParameters) => {
    const version = format_1.numberToBinUint32BE(keyParameters.network === 'mainnet'
        ? HdKeyVersion.mainnetPublicKey
        : HdKeyVersion.testnetPublicKey);
    const depth = Uint8Array.of(keyParameters.node.depth);
    const childIndex = format_1.numberToBinUint32BE(keyParameters.node.childIndex);
    const payload = format_1.flattenBinArray([
        version,
        depth,
        keyParameters.node.parentFingerprint,
        childIndex,
        keyParameters.node.chainCode,
        keyParameters.node.publicKey,
    ]);
    const checksumLength = 4;
    const checksum = crypto.sha256
        .hash(crypto.sha256.hash(payload))
        .slice(0, checksumLength);
    return format_1.binToBase58(format_1.flattenBinArray([payload, checksum]));
};
/**
 * Derive the HD public node of an HD private node.
 *
 * Though private keys cannot be derived from HD public keys, sharing HD public
 * keys still carries risk. Along with allowing an attacker to associate wallet
 * addresses together (breaking privacy), should an attacker gain knowledge of a
 * single child private key, **it's possible to derive all parent HD private
 * keys**. See `crackHdPrivateNodeFromHdPublicNodeAndChildPrivateNode` for
 * details.
 *
 * @param crypto - an implementation of secp256k1 compressed public key
 * derivation (e.g. `instantiateSecp256k1`)
 * @param node - a valid HD private node
 */
exports.deriveHdPublicNode = (crypto, node) => {
    return Object.assign(Object.assign({ chainCode: node.chainCode, childIndex: node.childIndex, depth: node.depth, parentFingerprint: node.parentFingerprint }, (node.parentIdentifier === undefined
        ? {}
        : { parentIdentifier: node.parentIdentifier })), { publicKey: crypto.secp256k1.derivePublicKeyCompressed(node.privateKey) });
};
/**
 * An error in the derivation of child HD public or private nodes.
 */
var HdNodeDerivationError;
(function (HdNodeDerivationError) {
    HdNodeDerivationError["childIndexExceedsMaximum"] = "HD key derivation error: child index exceeds maximum (4294967295).";
    HdNodeDerivationError["nextChildIndexRequiresHardenedAlgorithm"] = "HD key derivation error: an incredibly rare HMAC-SHA512 result occurred, and incrementing the child index would require switching to the hardened algorithm.";
    HdNodeDerivationError["hardenedDerivationRequiresPrivateNode"] = "HD key derivation error: derivation for hardened child indexes (indexes greater than or equal to 2147483648) requires an HD private node.";
    HdNodeDerivationError["invalidDerivationPath"] = "HD key derivation error: invalid derivation path \u2013 paths must begin with \"m\" or \"M\" and contain only forward slashes (\"/\"), apostrophes (\"'\"), or positive child index numbers.";
    HdNodeDerivationError["invalidPrivateDerivationPrefix"] = "HD key derivation error: private derivation paths must begin with \"m\".";
    HdNodeDerivationError["invalidPublicDerivationPrefix"] = "HD key derivation error: public derivation paths must begin with \"M\".";
})(HdNodeDerivationError = exports.HdNodeDerivationError || (exports.HdNodeDerivationError = {}));
/**
 * Derive a child HD private node from an HD private node.
 *
 * To derive a child HD public node, use `deriveHdPublicNode` on the result of
 * this method. If the child uses a non-hardened index, it's also possible to
 * use `deriveHdPublicNodeChild`.
 *
 * @privateRemarks
 * The `Secp256k1.addTweakPrivateKey` method throws if the tweak is out of range
 * or if the resulting private key would be invalid. The procedure to handle
 * this error is standardized by BIP32: return the HD node at the next child
 * index. (Regardless, this scenario is incredibly unlikely without a weakness
 * in HMAC-SHA512.)
 *
 * @param crypto - implementations of sha256, ripemd160, secp256k1 compressed
 * public key derivation, and secp256k1 private key "tweak addition"
 * (application of the EC group operation) – these are available via
 * `instantiateBIP32Crypto`
 * @param node - the valid HD private node from which to derive the child node
 * @param index - the index at which to derive the child node - indexes greater
 * than or equal to the hardened index offset (`0x80000000`/`2147483648`) are
 * derived using the "hardened" derivation algorithm
 */
// eslint-disable-next-line complexity
exports.deriveHdPrivateNodeChild = (crypto, node, index) => {
    const maximumIndex = 0xffffffff;
    if (index > maximumIndex) {
        return HdNodeDerivationError.childIndexExceedsMaximum;
    }
    const hardenedIndexOffset = 0x80000000;
    const useHardenedAlgorithm = index >= hardenedIndexOffset;
    const keyMaterial = useHardenedAlgorithm
        ? node.privateKey
        : crypto.secp256k1.derivePublicKeyCompressed(node.privateKey);
    const serialization = Uint8Array.from([
        ...(useHardenedAlgorithm ? [0x00] : []),
        ...keyMaterial,
        ...format_1.numberToBinUint32BE(index),
    ]);
    const derivation = hmac_1.hmacSha512(crypto.sha512, node.chainCode, serialization);
    const tweakValueLength = 32;
    const tweakValue = derivation.slice(0, tweakValueLength);
    const nextChainCode = derivation.slice(tweakValueLength);
    // eslint-disable-next-line functional/no-try-statement
    try {
        const nextPrivateKey = crypto.secp256k1.addTweakPrivateKey(node.privateKey, tweakValue);
        const parentIdentifier = exports.deriveHdPrivateNodeIdentifier(crypto, node);
        const parentFingerprintLength = 4;
        return {
            chainCode: nextChainCode,
            childIndex: index,
            depth: node.depth + 1,
            parentFingerprint: parentIdentifier.slice(0, parentFingerprintLength),
            parentIdentifier,
            privateKey: nextPrivateKey,
            valid: true,
        };
    }
    catch (error) /* istanbul ignore next - testing requires >2^127 brute force */ {
        if (index === hardenedIndexOffset - 1) {
            return HdNodeDerivationError.nextChildIndexRequiresHardenedAlgorithm;
        }
        return exports.deriveHdPrivateNodeChild(crypto, node, index + 1);
    }
};
/**
 * Derive a non-hardened child HD public node from an HD public node.
 *
 * Because hardened derivation also requires knowledge of the parent private
 * node, it's not possible to use an HD public node to derive a hardened child
 * HD public node.
 *
 * Though private keys cannot be derived from HD public keys, sharing HD public
 * keys still carries risk. Along with allowing an attacker to associate wallet
 * addresses together (breaking privacy), should an attacker gain knowledge of a
 * single child private key, **it's possible to derive all parent HD private
 * keys**. See `crackHdPrivateNodeFromHdPublicNodeAndChildPrivateNode` for
 * details.
 *
 * @privateRemarks
 * The `Secp256k1.addTweakPublicKeyCompressed` method throws if the tweak is out
 * of range or if the resulting public key would be invalid. The procedure to
 * handle this error is standardized by BIP32: return the HD node at the next
 * child index. (Regardless, this scenario is incredibly unlikely without a
 * weakness in HMAC-SHA512.)
 *
 * @param crypto - implementations of sha256, sha512, ripemd160, and secp256k1
 * compressed public key "tweak addition" (application of the EC group
 * operation) – these are available via `instantiateBIP32Crypto`
 * @param node - the HD public node from which to derive the child public node
 * @param index - the index at which to derive the child node
 */
exports.deriveHdPublicNodeChild = (crypto, node, index) => {
    const hardenedIndexOffset = 0x80000000;
    if (index >= hardenedIndexOffset) {
        return HdNodeDerivationError.hardenedDerivationRequiresPrivateNode;
    }
    const serialization = Uint8Array.from([
        ...node.publicKey,
        ...format_1.numberToBinUint32BE(index),
    ]);
    const derivation = hmac_1.hmacSha512(crypto.sha512, node.chainCode, serialization);
    const tweakValueLength = 32;
    const tweakValue = derivation.slice(0, tweakValueLength);
    const nextChainCode = derivation.slice(tweakValueLength);
    // eslint-disable-next-line functional/no-try-statement
    try {
        const nextPublicKey = crypto.secp256k1.addTweakPublicKeyCompressed(node.publicKey, tweakValue);
        const parentIdentifier = exports.deriveHdPublicNodeIdentifier(crypto, node);
        const parentFingerprintLength = 4;
        return {
            chainCode: nextChainCode,
            childIndex: index,
            depth: node.depth + 1,
            parentFingerprint: parentIdentifier.slice(0, parentFingerprintLength),
            parentIdentifier,
            publicKey: nextPublicKey,
        };
    }
    catch (error) /* istanbul ignore next - testing requires >2^127 brute force */ {
        if (index === hardenedIndexOffset - 1) {
            return HdNodeDerivationError.nextChildIndexRequiresHardenedAlgorithm;
        }
        return exports.deriveHdPublicNodeChild(crypto, node, index + 1);
    }
};
/**
 * Derive a child HD node from a parent node given a derivation path. The
 * resulting node is the same type as the parent node (private nodes return
 * private nodes, public nodes return public nodes).
 *
 * @remarks
 * The derivation path uses the notation specified in BIP32:
 *
 * The first character must be either `m` for private derivation or `M` for
 * public derivation, followed by sets of `/` and a number representing the
 * child index used in the derivation at that depth. Hardened derivation is
 * represented by a trailing `'`, and may only appear in private derivation
 * paths (hardened derivation requires knowledge of the private key). Hardened
 * child indexes are represented with the hardened index offset (`2147483648`)
 * subtracted.
 *
 * For example, `m/0/1'/2` uses private derivation (`m`), with child indexes in
 * the following order:
 *
 * `derivePrivate(derivePrivate(derivePrivate(node, 0), 2147483648 + 1), 2)`
 *
 * Likewise, `M/3/4/5` uses public derivation (`M`), with child indexes in the
 * following order:
 *
 * `derivePublic(derivePublic(derivePublic(node, 3), 4), 5)`
 *
 * Because hardened derivation requires a private node, paths which specify
 * public derivation (`M`) using hardened derivation (`'`) will return an error.
 * To derive the public node associated with a child private node which requires
 * hardened derivation, begin with private derivation, then provide the result
 * to `deriveHdPublicNode`.
 *
 * @param crypto - implementations of sha256, sha512, ripemd160, and secp256k1
 * derivation functions – these are available via `instantiateBIP32Crypto`
 * @param node - the HD node from which to begin the derivation (for paths
 * beginning with `m`, an `HdPrivateNodeValid`; for paths beginning with `M`, an
 * `HdPublicNode`)
 * @param path - the BIP32 derivation path, e.g. `m/0/1'/2` or `M/3/4/5`
 */
// eslint-disable-next-line complexity
exports.deriveHdPath = (crypto, node, path) => {
    const validDerivationPath = /^[mM](?:\/[0-9]+'?)*$/u;
    if (!validDerivationPath.test(path)) {
        return HdNodeDerivationError.invalidDerivationPath;
    }
    const parsed = path.split('/');
    const isPrivateDerivation = 'privateKey' in node;
    if (isPrivateDerivation && parsed[0] !== 'm') {
        return HdNodeDerivationError.invalidPrivateDerivationPrefix;
    }
    if (!isPrivateDerivation && parsed[0] !== 'M') {
        return HdNodeDerivationError.invalidPublicDerivationPrefix;
    }
    const base = 10;
    const hardenedIndexOffset = 0x80000000;
    const indexes = parsed
        .slice(1)
        .map((index) => index.endsWith("'")
        ? parseInt(index.slice(0, -1), base) + hardenedIndexOffset
        : parseInt(index, base));
    return (isPrivateDerivation
        ? indexes.reduce((result, nextIndex) => typeof result === 'string'
            ? result
            : exports.deriveHdPrivateNodeChild(crypto, result, nextIndex), node // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter
        )
        : indexes.reduce((result, nextIndex) => typeof result === 'string'
            ? result
            : exports.deriveHdPublicNodeChild(crypto, result, nextIndex), node // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter
        ));
};
var HdNodeCrackingError;
(function (HdNodeCrackingError) {
    HdNodeCrackingError["cannotCrackHardenedDerivation"] = "HD node cracking error: cannot crack an HD parent node using hardened child node.";
})(HdNodeCrackingError = exports.HdNodeCrackingError || (exports.HdNodeCrackingError = {}));
/**
 * Derive the HD private node from a HD public node, given any non-hardened
 * child private node.
 *
 * @remarks
 * This exploits the "non-hardened" BIP32 derivation algorithm. Because
 * non-hardened derivation only requires knowledge of the "chain code" (rather
 * than requiring knowledge of the parent private key) it's possible to
 * calculate the value by which the parent private key is "tweaked" to arrive at
 * the child private key. Since we have the child private key, we simply
 * subtract this "tweaked" amount to get back to the parent private key.
 *
 * The BIP32 "hardened" derivation algorithm is designed to address this
 * weakness. Using hardened derivation, child private nodes can be shared
 * without risk of leaking the parent private node, but this comes at the cost
 * of public node derivation. Given only a parent public node, it is not
 * possible to derive hardened child public keys, so applications must choose
 * between support for HD public node derivation or support for sharing child
 * private nodes.
 *
 * @param crypto - an implementation of sha512
 * @param parentPublicNode - the parent HD public node for which to derive a
 * private node
 * @param childPrivateNode - any non-hardened child private node of the parent
 * node (only the `privateKey` and the `childIndex` are required)
 */
exports.crackHdPrivateNodeFromHdPublicNodeAndChildPrivateNode = (crypto, parentPublicNode, childPrivateNode) => {
    const hardenedIndexOffset = 0x80000000;
    if (childPrivateNode.childIndex >= hardenedIndexOffset) {
        return HdNodeCrackingError.cannotCrackHardenedDerivation;
    }
    const serialization = Uint8Array.from([
        ...parentPublicNode.publicKey,
        ...format_1.numberToBinUint32BE(childPrivateNode.childIndex),
    ]);
    const derivation = hmac_1.hmacSha512(crypto.sha512, parentPublicNode.chainCode, serialization);
    const tweakValueLength = 32;
    const tweakValue = format_1.binToBigIntUint256BE(derivation.slice(0, tweakValueLength));
    const childPrivateValue = format_1.binToBigIntUint256BE(childPrivateNode.privateKey);
    const secp256k1OrderN = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
    const trueMod = (n, m) => ((n % m) + m) % m;
    const parentPrivateValue = trueMod(childPrivateValue - tweakValue, secp256k1OrderN);
    const privateKey = format_1.bigIntToBinUint256BEClamped(parentPrivateValue);
    return Object.assign(Object.assign({ chainCode: parentPublicNode.chainCode, childIndex: parentPublicNode.childIndex, depth: parentPublicNode.depth, parentFingerprint: parentPublicNode.parentFingerprint }, (parentPublicNode.parentIdentifier === undefined
        ? {}
        : { parentIdentifier: parentPublicNode.parentIdentifier })), { privateKey, valid: true });
};

},{"../crypto/crypto":17,"../crypto/hmac":18,"../format/format":27,"../format/utf8":33,"./key-utils":35}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrivateKey = exports.validateSecp256k1PrivateKey = void 0;
/**
 * Verify that a private key is valid for the Secp256k1 curve. Returns `true`
 * for success, or `false` on failure.
 *
 * Private keys are 256-bit numbers encoded as a 32-byte, big-endian Uint8Array.
 * Nearly every 256-bit number is a valid secp256k1 private key. Specifically,
 * any 256-bit number greater than `0x01` and less than
 * `0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFE BAAE DCE6 AF48 A03B BFD2 5E8C D036 4140`
 * is a valid private key. This range is part of the definition of the
 * secp256k1 elliptic curve parameters.
 *
 * This method does not require the `Secp256k1` WASM implementation (available
 * via `instantiateSecp256k1`).
 */
exports.validateSecp256k1PrivateKey = (privateKey) => {
    const privateKeyLength = 32;
    if (privateKey.length !== privateKeyLength ||
        privateKey.every((value) => value === 0)) {
        return false;
    }
    /**
     * The largest possible Secp256k1 private key – equal to the order of the
     * Secp256k1 curve minus one.
     */
    // prettier-ignore
    const maximumSecp256k1PrivateKey = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 186, 174, 220, 230, 175, 72, 160, 59, 191, 210, 94, 140, 208, 54, 65, 63]; // eslint-disable-line @typescript-eslint/no-magic-numbers
    const firstDifference = privateKey.findIndex((value, i) => value !== maximumSecp256k1PrivateKey[i]);
    if (firstDifference === -1 ||
        privateKey[firstDifference] < maximumSecp256k1PrivateKey[firstDifference]) {
        return true;
    }
    return false;
};
/**
 * Securely generate a valid Secp256k1 private key given a secure source of
 * randomness.
 *
 * **Node.js Usage**
 * ```ts
 * import { randomBytes } from 'crypto';
 * import { generatePrivateKey } from '@bitauth/libauth';
 *
 * const key = generatePrivateKey(secp256k1, () => randomBytes(32));
 * ```
 *
 * **Browser Usage**
 * ```ts
 * import { generatePrivateKey } from '@bitauth/libauth';
 *
 * const key = generatePrivateKey(secp256k1, () =>
 *   window.crypto.getRandomValues(new Uint8Array(32))
 * );
 * ```
 *
 * @param secp256k1 - an implementation of Secp256k1
 * @param secureRandom - a method which returns a securely-random 32-byte
 * Uint8Array
 */
exports.generatePrivateKey = (secureRandom) => {
    // eslint-disable-next-line functional/no-let, @typescript-eslint/init-declarations
    let maybeKey;
    // eslint-disable-next-line functional/no-loop-statement
    do {
        // eslint-disable-next-line functional/no-expression-statement
        maybeKey = secureRandom();
    } while (!exports.validateSecp256k1PrivateKey(maybeKey));
    return maybeKey;
};

},{}],36:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./hd-key"), exports);
__exportStar(require("./key-utils"), exports);
__exportStar(require("./wallet-import-format"), exports);

},{"./hd-key":34,"./key-utils":35,"./wallet-import-format":37}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePrivateKeyWif = exports.encodePrivateKeyWif = exports.WalletImportFormatError = void 0;
const address_1 = require("../address/address");
var WalletImportFormatError;
(function (WalletImportFormatError) {
    WalletImportFormatError["incorrectLength"] = "The WIF private key payload is not the correct length.";
})(WalletImportFormatError = exports.WalletImportFormatError || (exports.WalletImportFormatError = {}));
/**
 * Encode a private key using Wallet Import Format (WIF).
 *
 * WIF encodes the 32-byte private key, a 4-byte checksum, and a `type`
 * indicating the intended usage for the private key. See
 * `WalletImportFormatType` for details.
 *
 * @remarks
 * WIF-encoding uses the Base58Address format with version
 * `Base58AddressFormatVersion.wif` (`128`/`0x80`) or
 * `Base58AddressFormatVersion.wifTestnet` (`239`/`0xef`), respectively.
 *
 * To indicate that the private key is intended for use in a P2PKH address using
 * the compressed form of its derived public key, a `0x01` is appended to the
 * payload prior to encoding. For the uncompressed construction, the extra byte
 * is omitted.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param privateKey - a 32-byte Secp256k1 ECDSA private key
 * @param type - the intended usage of the private key (e.g. `mainnet` or
 * `testnet`)
 */
exports.encodePrivateKeyWif = (sha256, privateKey, type) => {
    const compressedByte = 0x01;
    const mainnet = type === 'mainnet' || type === 'mainnet-uncompressed';
    const compressed = type === 'mainnet' || type === 'testnet';
    const payload = compressed
        ? Uint8Array.from([...privateKey, compressedByte])
        : privateKey;
    return address_1.encodeBase58AddressFormat(sha256, mainnet
        ? address_1.Base58AddressFormatVersion.wif
        : address_1.Base58AddressFormatVersion.wifTestnet, payload);
};
/**
 * Decode a private key using Wallet Import Format (WIF). See
 * `encodePrivateKeyWif` for details.
 *
 * @param sha256 - an implementation of sha256 (a universal implementation is
 * available via `instantiateSha256`)
 * @param wifKey - the private key to decode (in Wallet Import Format)
 */
// eslint-disable-next-line complexity
exports.decodePrivateKeyWif = (sha256, wifKey) => {
    const compressedPayloadLength = 33;
    const decoded = address_1.decodeBase58AddressFormat(sha256, wifKey);
    if (typeof decoded === 'string')
        return decoded;
    const mainnet = decoded.version === address_1.Base58AddressFormatVersion.wif;
    const compressed = decoded.payload.length === compressedPayloadLength;
    const privateKey = compressed
        ? decoded.payload.slice(0, -1)
        : decoded.payload;
    const type = mainnet
        ? compressed
            ? 'mainnet'
            : 'mainnet-uncompressed'
        : compressed
            ? 'testnet'
            : 'testnet-uncompressed';
    return { privateKey, type };
};

},{"../address/address":3}],38:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./address/address"), exports);
__exportStar(require("./vm/vm"), exports);
__exportStar(require("./bin/bin"), exports);
__exportStar(require("./crypto/crypto"), exports);
__exportStar(require("./key/key"), exports);
__exportStar(require("./template/template"), exports);
__exportStar(require("./transaction/transaction"), exports);
__exportStar(require("./format/format"), exports);

},{"./address/address":3,"./bin/bin":8,"./crypto/crypto":17,"./format/format":27,"./key/key":36,"./template/template":58,"./transaction/transaction":62,"./vm/vm":95}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationTemplateToCompilerBCH = exports.createCompilerBCH = exports.compilerOperationsBCH = exports.compilerOperationSigningSerializationFullBCH = exports.compilerOperationHdKeySchnorrDataSignatureBCH = exports.compilerOperationHdKeyEcdsaDataSignatureBCH = exports.compilerOperationHelperHdKeyDataSignatureBCH = exports.compilerOperationKeySchnorrDataSignatureBCH = exports.compilerOperationKeyEcdsaDataSignatureBCH = exports.compilerOperationHelperKeyDataSignatureBCH = exports.compilerOperationHelperComputeDataSignatureBCH = exports.compilerOperationKeySchnorrSignatureBCH = exports.compilerOperationKeyEcdsaSignatureBCH = exports.compilerOperationHelperKeySignatureBCH = exports.compilerOperationHdKeySchnorrSignatureBCH = exports.compilerOperationHdKeyEcdsaSignatureBCH = exports.compilerOperationHelperHdKeySignatureBCH = exports.compilerOperationHelperComputeSignatureBCH = exports.SigningSerializationAlgorithmIdentifier = void 0;
const crypto_1 = require("../../crypto/crypto");
const signing_serialization_1 = require("../../vm/instruction-sets/common/signing-serialization");
const instruction_sets_1 = require("../../vm/instruction-sets/instruction-sets");
const virtual_machine_1 = require("../../vm/virtual-machine");
const compiler_1 = require("../compiler");
const compiler_operation_helpers_1 = require("../compiler-operation-helpers");
const compiler_operations_1 = require("../compiler-operations");
var SigningSerializationAlgorithmIdentifier;
(function (SigningSerializationAlgorithmIdentifier) {
    /**
     * A.K.A. `SIGHASH_ALL`
     */
    SigningSerializationAlgorithmIdentifier["allOutputs"] = "all_outputs";
    /**
     * A.K.A. `SIGHASH_ALL|ANYONE_CAN_PAY`
     */
    SigningSerializationAlgorithmIdentifier["allOutputsSingleInput"] = "all_outputs_single_input";
    /**
     * A.K.A. `SIGHASH_SINGLE`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutput"] = "corresponding_output";
    /**
     * A.K.A. `SIGHASH_SINGLE|ANYONE_CAN_PAY`
     */
    SigningSerializationAlgorithmIdentifier["correspondingOutputSingleInput"] = "corresponding_output_single_input";
    /**
     * A.K.A `SIGHASH_NONE`
     */
    SigningSerializationAlgorithmIdentifier["noOutputs"] = "no_outputs";
    /**
     * A.K.A `SIGHASH_NONE|ANYONE_CAN_PAY`
     */
    SigningSerializationAlgorithmIdentifier["noOutputsSingleInput"] = "no_outputs_single_input";
})(SigningSerializationAlgorithmIdentifier = exports.SigningSerializationAlgorithmIdentifier || (exports.SigningSerializationAlgorithmIdentifier = {}));
// eslint-disable-next-line complexity
const getSigningSerializationType = (algorithmIdentifier, prefix = '') => {
    switch (algorithmIdentifier) {
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputs}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.allOutputs | signing_serialization_1.SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.allOutputsSingleInput}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.allOutputs |
                signing_serialization_1.SigningSerializationFlag.singleInput |
                signing_serialization_1.SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutput}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.correspondingOutput |
                signing_serialization_1.SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.correspondingOutputSingleInput}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.correspondingOutput |
                signing_serialization_1.SigningSerializationFlag.singleInput |
                signing_serialization_1.SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputs}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.noOutputs | signing_serialization_1.SigningSerializationFlag.forkId);
        case `${prefix}${SigningSerializationAlgorithmIdentifier.noOutputsSingleInput}`:
            return Uint8Array.of(
            // eslint-disable-next-line no-bitwise
            signing_serialization_1.SigningSerializationFlag.noOutputs |
                signing_serialization_1.SigningSerializationFlag.singleInput |
                signing_serialization_1.SigningSerializationFlag.forkId);
        default:
            return undefined;
    }
};
exports.compilerOperationHelperComputeSignatureBCH = ({ coveredBytecode, identifier, transactionContext, operationName, privateKey, sha256, sign, }) => {
    const [, , algorithm, unknown] = identifier.split('.');
    if (unknown !== undefined) {
        return {
            error: `Unknown component in "${identifier}" – the fragment "${unknown}" is not recognized.`,
            status: 'error',
        };
    }
    if (algorithm === undefined) {
        return {
            error: `Invalid signature identifier. Signatures must be of the form: "[variable_id].${operationName}.[signing_serialization_type]".`,
            status: 'error',
        };
    }
    const signingSerializationType = getSigningSerializationType(algorithm);
    if (signingSerializationType === undefined) {
        return {
            error: `Unknown signing serialization algorithm, "${algorithm}".`,
            status: 'error',
        };
    }
    const serialization = signing_serialization_1.generateSigningSerializationBCH({
        correspondingOutput: transactionContext.correspondingOutput,
        coveredBytecode,
        locktime: transactionContext.locktime,
        outpointIndex: transactionContext.outpointIndex,
        outpointTransactionHash: transactionContext.outpointTransactionHash,
        outputValue: transactionContext.outputValue,
        sequenceNumber: transactionContext.sequenceNumber,
        sha256,
        signingSerializationType,
        transactionOutpoints: transactionContext.transactionOutpoints,
        transactionOutputs: transactionContext.transactionOutputs,
        transactionSequenceNumbers: transactionContext.transactionSequenceNumbers,
        version: transactionContext.version,
    });
    const digest = sha256.hash(sha256.hash(serialization));
    const bitcoinEncodedSignature = Uint8Array.from([
        ...sign(privateKey, digest),
        ...signingSerializationType,
    ]);
    return {
        bytecode: bitcoinEncodedSignature,
        signature: { serialization },
        status: 'success',
    };
};
exports.compilerOperationHelperHdKeySignatureBCH = ({ operationName, secp256k1Method, }) => compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['hdKeys', 'transactionContext'],
    environmentProperties: [
        'entityOwnership',
        'ripemd160',
        'secp256k1',
        'sha256',
        'sha512',
        'variables',
        'sourceScriptIds',
        'unlockingScripts',
    ],
    operation: (identifier, data, environment) => {
        const { hdKeys, transactionContext } = data;
        const { secp256k1, sha256, sourceScriptIds, unlockingScripts, } = environment;
        const derivationResult = compiler_operation_helpers_1.compilerOperationHelperDeriveHdKeyPrivate({
            environment,
            hdKeys,
            identifier,
        });
        if (derivationResult.status === 'error')
            return derivationResult;
        const result = compiler_operation_helpers_1.compilerOperationHelperGenerateCoveredBytecode({
            data,
            environment,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        return exports.compilerOperationHelperComputeSignatureBCH({
            coveredBytecode: result,
            identifier,
            operationName,
            privateKey: derivationResult.bytecode,
            sha256,
            sign: secp256k1[secp256k1Method],
            transactionContext,
        });
    },
}));
exports.compilerOperationHdKeyEcdsaSignatureBCH = exports.compilerOperationHelperHdKeySignatureBCH({
    operationName: 'signature',
    secp256k1Method: 'signMessageHashDER',
});
exports.compilerOperationHdKeySchnorrSignatureBCH = exports.compilerOperationHelperHdKeySignatureBCH({
    operationName: 'schnorr_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
exports.compilerOperationHelperKeySignatureBCH = ({ operationName, secp256k1Method, }) => compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['keys', 'transactionContext'],
    environmentProperties: [
        'sha256',
        'secp256k1',
        'unlockingScripts',
        'sourceScriptIds',
    ],
    operation: (identifier, data, environment) => {
        const { keys, transactionContext } = data;
        const { secp256k1, sha256, unlockingScripts, sourceScriptIds, } = environment;
        const { privateKeys } = keys;
        const [variableId] = identifier.split('.');
        const privateKey = privateKeys === undefined ? undefined : privateKeys[variableId];
        if (privateKey === undefined) {
            return {
                error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
                recoverable: true,
                status: 'error',
            };
        }
        const result = compiler_operation_helpers_1.compilerOperationHelperGenerateCoveredBytecode({
            data,
            environment,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        return exports.compilerOperationHelperComputeSignatureBCH({
            coveredBytecode: result,
            identifier,
            operationName,
            privateKey,
            sha256,
            sign: secp256k1[secp256k1Method],
            transactionContext,
        });
    },
}));
exports.compilerOperationKeyEcdsaSignatureBCH = exports.compilerOperationHelperKeySignatureBCH({
    operationName: 'signature',
    secp256k1Method: 'signMessageHashDER',
});
exports.compilerOperationKeySchnorrSignatureBCH = exports.compilerOperationHelperKeySignatureBCH({
    operationName: 'schnorr_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
exports.compilerOperationHelperComputeDataSignatureBCH = ({ data, environment, identifier, operationName, privateKey, sha256, sign, }) => {
    const [, , scriptId, unknown] = identifier.split('.');
    if (unknown !== undefined) {
        return {
            error: `Unknown component in "${identifier}" – the fragment "${unknown}" is not recognized.`,
            status: 'error',
        };
    }
    if (scriptId === undefined) {
        return {
            error: `Invalid data signature identifier. Data signatures must be of the form: "[variable_id].${operationName}.[target_script_id]".`,
            status: 'error',
        };
    }
    const result = compiler_operation_helpers_1.compilerOperationHelperCompileScript({
        data,
        environment,
        targetScriptId: scriptId,
    });
    if (result === false) {
        return {
            error: `Data signature tried to sign an unknown target script, "${scriptId}".`,
            status: 'error',
        };
    }
    if ('error' in result) {
        return result;
    }
    const digest = sha256.hash(result);
    return {
        bytecode: sign(privateKey, digest),
        signature: { message: result },
        status: 'success',
    };
};
exports.compilerOperationHelperKeyDataSignatureBCH = ({ operationName, secp256k1Method, }) => compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['keys'],
    environmentProperties: ['sha256', 'secp256k1'],
    operation: (identifier, data, environment) => {
        const { keys } = data;
        const { secp256k1, sha256 } = environment;
        const { privateKeys } = keys;
        const [variableId] = identifier.split('.');
        const privateKey = privateKeys === undefined ? undefined : privateKeys[variableId];
        if (privateKey === undefined) {
            return {
                error: `Identifier "${identifier}" refers to a Key, but a private key for "${variableId}" (or an existing signature) was not provided in the compilation data.`,
                recoverable: true,
                status: 'error',
            };
        }
        return exports.compilerOperationHelperComputeDataSignatureBCH({
            data,
            environment,
            identifier,
            operationName,
            privateKey,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
exports.compilerOperationKeyEcdsaDataSignatureBCH = exports.compilerOperationHelperKeyDataSignatureBCH({
    operationName: 'data_signature',
    secp256k1Method: 'signMessageHashDER',
});
exports.compilerOperationKeySchnorrDataSignatureBCH = exports.compilerOperationHelperKeyDataSignatureBCH({
    operationName: 'schnorr_data_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
exports.compilerOperationHelperHdKeyDataSignatureBCH = ({ operationName, secp256k1Method, }) => compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['hdKeys'],
    environmentProperties: [
        'entityOwnership',
        'ripemd160',
        'secp256k1',
        'sha256',
        'sha512',
        'variables',
    ],
    operation: (identifier, data, environment) => {
        const { hdKeys } = data;
        const { secp256k1, sha256 } = environment;
        const derivationResult = compiler_operation_helpers_1.compilerOperationHelperDeriveHdKeyPrivate({
            environment,
            hdKeys,
            identifier,
        });
        if (derivationResult.status === 'error')
            return derivationResult;
        return exports.compilerOperationHelperComputeDataSignatureBCH({
            data,
            environment,
            identifier,
            operationName,
            privateKey: derivationResult.bytecode,
            sha256,
            sign: secp256k1[secp256k1Method],
        });
    },
}));
exports.compilerOperationHdKeyEcdsaDataSignatureBCH = exports.compilerOperationHelperHdKeyDataSignatureBCH({
    operationName: 'data_signature',
    secp256k1Method: 'signMessageHashDER',
});
exports.compilerOperationHdKeySchnorrDataSignatureBCH = exports.compilerOperationHelperHdKeyDataSignatureBCH({
    operationName: 'schnorr_data_signature',
    secp256k1Method: 'signMessageHashSchnorr',
});
exports.compilerOperationSigningSerializationFullBCH = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sha256', 'sourceScriptIds', 'unlockingScripts'],
    operation: (identifier, data, environment) => {
        const [, algorithmOrComponent, unknownPart] = identifier.split('.');
        if (algorithmOrComponent === undefined) {
            return {
                error: `Invalid signing serialization operation. Include the desired component or algorithm, e.g. "signing_serialization.version".`,
                status: 'error',
            };
        }
        if (unknownPart !== undefined) {
            return {
                error: `Unknown component in "${identifier}" – the fragment "${unknownPart}" is not recognized.`,
                status: 'error',
            };
        }
        const signingSerializationType = getSigningSerializationType(algorithmOrComponent, 'full_');
        if (signingSerializationType === undefined) {
            return {
                error: `Unknown signing serialization algorithm, "${algorithmOrComponent}".`,
                status: 'error',
            };
        }
        const { sha256, sourceScriptIds, unlockingScripts } = environment;
        const result = compiler_operation_helpers_1.compilerOperationHelperGenerateCoveredBytecode({
            data,
            environment,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        const { transactionContext } = data;
        return {
            bytecode: signing_serialization_1.generateSigningSerializationBCH({
                correspondingOutput: transactionContext.correspondingOutput,
                coveredBytecode: result,
                locktime: transactionContext.locktime,
                outpointIndex: transactionContext.outpointIndex,
                outpointTransactionHash: transactionContext.outpointTransactionHash,
                outputValue: transactionContext.outputValue,
                sequenceNumber: transactionContext.sequenceNumber,
                sha256,
                signingSerializationType,
                transactionOutpoints: transactionContext.transactionOutpoints,
                transactionOutputs: transactionContext.transactionOutputs,
                transactionSequenceNumbers: transactionContext.transactionSequenceNumbers,
                version: transactionContext.version,
            }),
            status: 'success',
        };
    },
});
/* eslint-disable camelcase, @typescript-eslint/naming-convention */
exports.compilerOperationsBCH = Object.assign(Object.assign({}, compiler_operations_1.compilerOperationsCommon), { hdKey: {
        data_signature: exports.compilerOperationHdKeyEcdsaDataSignatureBCH,
        public_key: compiler_operations_1.compilerOperationsCommon.hdKey.public_key,
        schnorr_data_signature: exports.compilerOperationHdKeySchnorrDataSignatureBCH,
        schnorr_signature: exports.compilerOperationHdKeySchnorrSignatureBCH,
        signature: exports.compilerOperationHdKeyEcdsaSignatureBCH,
    }, key: {
        data_signature: exports.compilerOperationKeyEcdsaDataSignatureBCH,
        public_key: compiler_operations_1.compilerOperationsCommon.key.public_key,
        schnorr_data_signature: exports.compilerOperationKeySchnorrDataSignatureBCH,
        schnorr_signature: exports.compilerOperationKeySchnorrSignatureBCH,
        signature: exports.compilerOperationKeyEcdsaSignatureBCH,
    }, signingSerialization: Object.assign(Object.assign({}, compiler_operations_1.compilerOperationsCommon.signingSerialization), { full_all_outputs: exports.compilerOperationSigningSerializationFullBCH, full_all_outputs_single_input: exports.compilerOperationSigningSerializationFullBCH, full_corresponding_output: exports.compilerOperationSigningSerializationFullBCH, full_corresponding_output_single_input: exports.compilerOperationSigningSerializationFullBCH, full_no_outputs: exports.compilerOperationSigningSerializationFullBCH, full_no_outputs_single_input: exports.compilerOperationSigningSerializationFullBCH }) });
/**
 * Create a compiler using the default BCH environment.
 *
 * Internally instantiates the necessary crypto and VM implementations – use
 * `createCompiler` for more control.
 *
 * @param scriptsAndOverrides - a compilation environment from which properties
 * will be used to override properties of the default BCH environment – must
 * include the `scripts` property
 */
exports.createCompilerBCH = async (scriptsAndOverrides) => {
    const [sha1, sha256, sha512, ripemd160, secp256k1] = await Promise.all([
        crypto_1.instantiateSha1(),
        crypto_1.instantiateSha256(),
        crypto_1.instantiateSha512(),
        crypto_1.instantiateRipemd160(),
        crypto_1.instantiateSecp256k1(),
    ]);
    const vm = virtual_machine_1.createAuthenticationVirtualMachine(instruction_sets_1.createInstructionSetBCH({
        flags: instruction_sets_1.getFlagsForInstructionSetBCH(instruction_sets_1.instructionSetBCHCurrentStrict),
        ripemd160,
        secp256k1,
        sha1,
        sha256,
    }));
    return compiler_1.createCompiler(Object.assign({
        createAuthenticationProgram: compiler_1.createAuthenticationProgramEvaluationCommon,
        opcodes: instruction_sets_1.generateBytecodeMap(instruction_sets_1.OpcodesBCH),
        operations: exports.compilerOperationsBCH,
        ripemd160,
        secp256k1,
        sha256,
        sha512,
        vm,
    }, scriptsAndOverrides));
};
/**
 * Create a BCH `Compiler` from an `AuthenticationTemplate` and an optional set
 * of overrides.
 * @param template - the `AuthenticationTemplate` from which to create the BCH
 * compiler
 * @param overrides - a compilation environment from which properties will be
 * used to override properties of the default BCH environment
 */
exports.authenticationTemplateToCompilerBCH = async (template, overrides) => exports.createCompilerBCH(Object.assign(Object.assign({}, overrides), compiler_1.authenticationTemplateToCompilationEnvironment(template)));

},{"../../crypto/crypto":17,"../../vm/instruction-sets/common/signing-serialization":85,"../../vm/instruction-sets/instruction-sets":92,"../../vm/virtual-machine":93,"../compiler":44,"../compiler-operation-helpers":41,"../compiler-operations":42}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerDefaults = void 0;
var CompilerDefaults;
(function (CompilerDefaults) {
    /**
     * The `addressIndex` used by default scenarios.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioAddressIndex"] = 0] = "defaultScenarioAddressIndex";
    /**
     *
     * The value of `currentBlockHeight` in the default authentication template
     * scenario. This is the height of the second mined block after the genesis
     * block: `000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd`.
     *
     * This default value was chosen to be low enough to simplify the debugging of
     * block height offsets while remaining differentiated from `0` and `1` which
     * are used both as boolean return values and for control flow.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioCurrentBlockHeight"] = 2] = "defaultScenarioCurrentBlockHeight";
    /**
     * The value of `currentBlockTime` in the default authentication template
     * scenario. This is the Median Time-Past block time (BIP113) of block `2`
     * (the block used in `defaultScenarioCurrentBlockHeight`).
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioCurrentBlockTime"] = 1231469665] = "defaultScenarioCurrentBlockTime";
    /**
     * The default `outpointIndex` of inputs in scenarios.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioInputOutpointIndex"] = 0] = "defaultScenarioInputOutpointIndex";
    /**
     * The default `outpointTransactionHash` of inputs in scenarios.
     */
    CompilerDefaults["defaultScenarioInputOutpointTransactionHash"] = "0000000000000000000000000000000000000000000000000000000000000000";
    /**
     * The default `sequenceNumber` of inputs in scenarios.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioInputSequenceNumber"] = 0] = "defaultScenarioInputSequenceNumber";
    /**
     * The default `unlockingBytecode` of untested inputs in scenarios.
     */
    CompilerDefaults["defaultScenarioInputUnlockingBytecodeHex"] = "";
    /**
     * The default `satoshis` of outputs in scenarios.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioOutputSatoshis"] = 0] = "defaultScenarioOutputSatoshis";
    /**
     * The hexadecimal-encoded value of the `lockingBytecode` in the single
     * default output (`transaction.outputs`) of the default authentication
     * template scenario.
     */
    CompilerDefaults["defaultScenarioTransactionOutputsLockingBytecodeHex"] = "";
    /**
     * The value of `transaction.locktime` in the default authentication template
     * scenario.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioTransactionLocktime"] = 0] = "defaultScenarioTransactionLocktime";
    /**
     * The value of `transaction.version` in the default authentication template
     * scenario. Transaction version `2` enables `OP_CHECKSEQUENCEVERIFY` as
     * described in BIP68, BIP112, and BIP113.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioTransactionVersion"] = 2] = "defaultScenarioTransactionVersion";
    /**
     * The default value of the hypothetical UTXO being spent by the input under
     * test in a scenario.
     */
    CompilerDefaults[CompilerDefaults["defaultScenarioValue"] = 0] = "defaultScenarioValue";
    /**
     * If unset, each `HdKey` uses this `addressOffset`.
     */
    CompilerDefaults[CompilerDefaults["hdKeyAddressOffset"] = 0] = "hdKeyAddressOffset";
    /**
     * If unset, each `HdKey` uses this `hdPublicKeyDerivationPath`.
     */
    CompilerDefaults["hdKeyHdPublicKeyDerivationPath"] = "m";
    /**
     * If unset, each `HdKey` uses this `privateDerivationPath`.
     */
    CompilerDefaults["hdKeyPrivateDerivationPath"] = "m/i";
    /**
     * The prefix used to refer to other scenario bytecode scripts from within a
     * bytecode script. See `AuthenticationTemplateScenarioData.bytecode` for
     * details.
     */
    CompilerDefaults["scenarioBytecodeScriptPrefix"] = "_scenario_";
    /**
     * The prefix used to identify the `check` script from a virtualized
     * `AuthenticationTemplateScriptTest`. For details, see
     * `authenticationTemplateToCompilationEnvironmentVirtualizedTests`.
     */
    CompilerDefaults["virtualizedTestCheckScriptPrefix"] = "__virtualized_test_check_";
    /**
     * The prefix used to identify the concatenated tested and `check` script from
     * a virtualized `AuthenticationTemplateScriptTest`. For details, see
     * `authenticationTemplateToCompilationEnvironmentVirtualizedTests`.
     */
    CompilerDefaults["virtualizedTestLockingScriptPrefix"] = "__virtualized_test_lock_";
    /**
     * The prefix used to identify the `setup` script from a virtualized
     * `AuthenticationTemplateScriptTest`. For details, see
     * `authenticationTemplateToCompilationEnvironmentVirtualizedTests`.
     */
    CompilerDefaults["virtualizedTestUnlockingScriptPrefix"] = "__virtualized_test_unlock_";
})(CompilerDefaults = exports.CompilerDefaults || (exports.CompilerDefaults = {}));

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilerOperationHelperGenerateCoveredBytecode = exports.compilerOperationHelperCompileScript = exports.compilerOperationHelperDeriveHdKeyPrivate = exports.compilerOperationHelperAddressIndex = exports.compilerOperationHelperUnknownEntity = exports.compilerOperationHelperDeriveHdPrivateNode = exports.compilerOperationAttemptBytecodeResolution = exports.compilerOperationRequires = exports.attemptCompilerOperations = void 0;
const hd_key_1 = require("../key/hd-key");
const compiler_defaults_1 = require("./compiler-defaults");
const resolve_1 = require("./language/resolve");
/**
 * Attempt a series of compiler operations, skipping to the next operation if
 * the current operation returns a `CompilerOperationSkip` (indicating it failed
 * and can be skipped). The `finalOperation` may not be skipped, and must either
 * return `CompilerOperationSuccess` or `CompilerOperationError`.
 *
 * @param operations - an array of skippable operations to try
 * @param finalOperation - a final, un-skippable operation
 */
exports.attemptCompilerOperations = (operations, finalOperation) => (identifier, data, environment) => {
    // eslint-disable-next-line functional/no-loop-statement
    for (const operation of operations) {
        const result = operation(identifier, data, environment);
        if (result.status !== 'skip')
            return result;
    }
    return finalOperation(identifier, data, environment);
};
/**
 * Modify a compiler operation to verify that certain properties exist in the
 * `CompilationData` and `CompilationEnvironment` before executing the provided
 * operation. If the properties don't exist, an error message is returned.
 *
 * This is useful for eliminating repetitive existence checks.
 *
 * @param canBeSkipped - if `true`, the accepted operation may return `false`,
 * and any missing properties will cause the returned operation to return
 * `false` (meaning the operation should be skipped)
 * @param dataProperties - an array of the top-level properties required in the
 * `CompilationData`
 * @param environmentProperties - an array of the top-level properties required
 * in the `CompilationEnvironment`
 * @param operation - the operation to run if all required properties exist
 */
exports.compilerOperationRequires = ({ canBeSkipped, dataProperties, environmentProperties, operation, }) => (identifier, data, environment) => {
    // eslint-disable-next-line functional/no-loop-statement
    for (const property of environmentProperties) {
        if (environment[property] === undefined)
            return (canBeSkipped
                ? { status: 'skip' }
                : {
                    error: `Cannot resolve "${identifier}" – the "${property}" property was not provided in the compilation environment.`,
                    status: 'error',
                });
    }
    // eslint-disable-next-line functional/no-loop-statement
    for (const property of dataProperties) {
        if (data[property] === undefined)
            return (canBeSkipped
                ? { status: 'skip' }
                : {
                    error: `Cannot resolve "${identifier}" – the "${property}" property was not provided in the compilation data.`,
                    status: 'error',
                });
    }
    return operation(identifier, data, environment);
};
exports.compilerOperationAttemptBytecodeResolution = exports.compilerOperationRequires({
    canBeSkipped: true,
    dataProperties: ['bytecode'],
    environmentProperties: [],
    operation: (identifier, data) => {
        const { bytecode } = data;
        if (bytecode[identifier] !== undefined) {
            return { bytecode: bytecode[identifier], status: 'success' };
        }
        return { status: 'skip' };
    },
});
// eslint-disable-next-line complexity
exports.compilerOperationHelperDeriveHdPrivateNode = ({ addressIndex, entityId, entityHdPrivateKey, environment, hdKey, identifier, }) => {
    var _a, _b;
    const addressOffset = (_a = hdKey.addressOffset) !== null && _a !== void 0 ? _a : compiler_defaults_1.CompilerDefaults.hdKeyAddressOffset;
    const privateDerivationPath = (_b = hdKey.privateDerivationPath) !== null && _b !== void 0 ? _b : compiler_defaults_1.CompilerDefaults.hdKeyPrivateDerivationPath;
    const i = addressIndex + addressOffset;
    const validPrivatePathWithIndex = /^m(?:\/(?:[0-9]+|i)'?)*$/u;
    if (!validPrivatePathWithIndex.test(privateDerivationPath)) {
        return {
            error: `Could not generate ${identifier} – the path "${privateDerivationPath}" is not a valid "privateDerivationPath".`,
            status: 'error',
        };
    }
    const instancePath = privateDerivationPath.replace('i', i.toString());
    const masterContents = hd_key_1.decodeHdPrivateKey(environment, entityHdPrivateKey);
    if (typeof masterContents === 'string') {
        return {
            error: `Could not generate ${identifier} – the HD private key provided for ${entityId} could not be decoded: ${masterContents}`,
            status: 'error',
        };
    }
    const instanceNode = hd_key_1.deriveHdPath(environment, masterContents.node, instancePath);
    if (typeof instanceNode === 'string') {
        return {
            error: `Could not generate ${identifier} – the path "${instancePath}" could not be derived for entity "${entityId}": ${instanceNode}`,
            status: 'error',
        };
    }
    return {
        bytecode: instanceNode.privateKey,
        status: 'success',
    };
};
exports.compilerOperationHelperUnknownEntity = (identifier, variableId) => ({
    error: `Identifier "${identifier}" refers to an HdKey, but the "entityOwnership" for "${variableId}" is not available in this compilation environment.`,
    status: 'error',
});
exports.compilerOperationHelperAddressIndex = (identifier) => ({
    error: `Identifier "${identifier}" refers to an HdKey, but "hdKeys.addressIndex" was not provided in the compilation data.`,
    status: 'error',
});
exports.compilerOperationHelperDeriveHdKeyPrivate = ({ environment, hdKeys, identifier, }) => {
    const { addressIndex, hdPrivateKeys } = hdKeys;
    const [variableId] = identifier.split('.');
    const entityId = environment.entityOwnership[variableId];
    if (entityId === undefined) {
        return exports.compilerOperationHelperUnknownEntity(identifier, variableId);
    }
    if (addressIndex === undefined) {
        return exports.compilerOperationHelperAddressIndex(identifier);
    }
    const entityHdPrivateKey = hdPrivateKeys === undefined ? undefined : hdPrivateKeys[entityId];
    if (entityHdPrivateKey === undefined) {
        return {
            error: `Identifier "${identifier}" refers to an HdKey owned by "${entityId}", but an HD private key for this entity (or an existing signature) was not provided in the compilation data.`,
            recoverable: true,
            status: 'error',
        };
    }
    /**
     * Guaranteed to be an `HdKey` if this method is reached in the compiler.
     */
    const hdKey = environment.variables[variableId];
    return exports.compilerOperationHelperDeriveHdPrivateNode({
        addressIndex,
        entityHdPrivateKey,
        entityId,
        environment,
        hdKey,
        identifier,
    });
};
/**
 * Returns `false` if the target script ID doesn't exist in the compilation
 * environment (allows for the caller to generate the error message).
 *
 * If the compilation produced errors, returns a `CompilerOperationErrorFatal`.
 *
 * If the compilation was successful, returns the compiled bytecode as a
 * `Uint8Array`.
 */
exports.compilerOperationHelperCompileScript = ({ targetScriptId, data, environment, }) => {
    const signingTarget = environment.scripts[targetScriptId];
    const compiledTarget = resolve_1.resolveScriptIdentifier({
        data,
        environment,
        identifier: targetScriptId,
    });
    if (signingTarget === undefined || compiledTarget === false) {
        return false;
    }
    if (typeof compiledTarget === 'string') {
        return {
            error: compiledTarget,
            status: 'error',
        };
    }
    return compiledTarget.bytecode;
};
/**
 * Returns either the properly generated `coveredBytecode` or a
 * `CompilerOperationErrorFatal`.
 */
exports.compilerOperationHelperGenerateCoveredBytecode = ({ data, environment, identifier, sourceScriptIds, unlockingScripts, }) => {
    const currentScriptId = sourceScriptIds[sourceScriptIds.length - 1];
    if (currentScriptId === undefined) {
        return {
            error: `Identifier "${identifier}" requires a signing serialization, but "coveredBytecode" cannot be determined because the compilation environment's "sourceScriptIds" is empty.`,
            status: 'error',
        };
    }
    const targetLockingScriptId = unlockingScripts[currentScriptId];
    if (targetLockingScriptId === undefined) {
        return {
            error: `Identifier "${identifier}" requires a signing serialization, but "coveredBytecode" cannot be determined because "${currentScriptId}" is not present in the compilation environment "unlockingScripts".`,
            status: 'error',
        };
    }
    const result = exports.compilerOperationHelperCompileScript({
        data,
        environment,
        targetScriptId: targetLockingScriptId,
    });
    if (result === false) {
        return {
            error: `Identifier "${identifier}" requires a signing serialization which covers an unknown locking script, "${targetLockingScriptId}".`,
            status: 'error',
        };
    }
    return result;
};

},{"../key/hd-key":34,"./compiler-defaults":40,"./language/resolve":52}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilerOperationsCommon = exports.compilerOperationHdKeyPublicKeyCommon = exports.compilerOperationKeyPublicKeyCommon = exports.compilerOperationSigningSerializationVersion = exports.compilerOperationSigningSerializationTransactionSequenceNumbersHash = exports.compilerOperationSigningSerializationTransactionSequenceNumbers = exports.compilerOperationSigningSerializationTransactionOutputsHash = exports.compilerOperationSigningSerializationTransactionOutputs = exports.compilerOperationSigningSerializationTransactionOutpointsHash = exports.compilerOperationSigningSerializationTransactionOutpoints = exports.compilerOperationSigningSerializationSequenceNumber = exports.compilerOperationSigningSerializationOutputValue = exports.compilerOperationSigningSerializationOutpointTransactionHash = exports.compilerOperationSigningSerializationOutpointIndex = exports.compilerOperationSigningSerializationLocktime = exports.compilerOperationSigningSerializationCoveredBytecodeLength = exports.compilerOperationSigningSerializationCoveredBytecode = exports.compilerOperationSigningSerializationCorrespondingOutputHash = exports.compilerOperationSigningSerializationCorrespondingOutput = exports.compilerOperationCurrentBlockHeight = exports.compilerOperationCurrentBlockTime = exports.compilerOperationWalletData = exports.compilerOperationAddressData = void 0;
const numbers_1 = require("../format/numbers");
const hd_key_1 = require("../key/hd-key");
const instruction_sets_1 = require("../vm/instruction-sets/instruction-sets");
const compiler_defaults_1 = require("./compiler-defaults");
const compiler_operation_helpers_1 = require("./compiler-operation-helpers");
exports.compilerOperationAddressData = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['bytecode'],
    environmentProperties: [],
    operation: (identifier, data) => {
        const { bytecode } = data;
        if (identifier in bytecode) {
            return { bytecode: bytecode[identifier], status: 'success' };
        }
        return {
            error: `Identifier "${identifier}" refers to an AddressData, but "${identifier}" was not provided in the CompilationData "bytecode".`,
            recoverable: true,
            status: 'error',
        };
    },
});
exports.compilerOperationWalletData = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['bytecode'],
    environmentProperties: [],
    operation: (identifier, data) => {
        const { bytecode } = data;
        if (identifier in bytecode) {
            return { bytecode: bytecode[identifier], status: 'success' };
        }
        return {
            error: `Identifier "${identifier}" refers to a WalletData, but "${identifier}" was not provided in the CompilationData "bytecode".`,
            recoverable: true,
            status: 'error',
        };
    },
});
exports.compilerOperationCurrentBlockTime = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['currentBlockTime'],
    environmentProperties: [],
    operation: (_, data) => {
        return {
            bytecode: numbers_1.numberToBinUint32LE(data.currentBlockTime),
            status: 'success',
        };
    },
});
exports.compilerOperationCurrentBlockHeight = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['currentBlockHeight'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: instruction_sets_1.bigIntToScriptNumber(BigInt(data.currentBlockHeight)),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationCorrespondingOutput = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => data.transactionContext.correspondingOutput === undefined
        ? { bytecode: Uint8Array.of(), status: 'success' }
        : {
            bytecode: data.transactionContext.correspondingOutput,
            status: 'success',
        },
});
exports.compilerOperationSigningSerializationCorrespondingOutputHash = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sha256'],
    operation: (_, data, environment) => data.transactionContext.correspondingOutput === undefined
        ? { bytecode: Uint8Array.of(), status: 'success' }
        : {
            bytecode: environment.sha256.hash(environment.sha256.hash(data.transactionContext.correspondingOutput)),
            status: 'success',
        },
});
const compilerOperationHelperSigningSerializationCoveredBytecode = (returnLength) => compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sourceScriptIds', 'unlockingScripts'],
    operation: (identifier, data, environment) => {
        const { unlockingScripts, sourceScriptIds } = environment;
        const result = compiler_operation_helpers_1.compilerOperationHelperGenerateCoveredBytecode({
            data,
            environment,
            identifier,
            sourceScriptIds,
            unlockingScripts,
        });
        if ('error' in result) {
            return result;
        }
        return {
            bytecode: returnLength
                ? numbers_1.bigIntToBitcoinVarInt(BigInt(result.length))
                : result,
            status: 'success',
        };
    },
});
exports.compilerOperationSigningSerializationCoveredBytecode = compilerOperationHelperSigningSerializationCoveredBytecode(false);
exports.compilerOperationSigningSerializationCoveredBytecodeLength = compilerOperationHelperSigningSerializationCoveredBytecode(true);
exports.compilerOperationSigningSerializationLocktime = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: numbers_1.numberToBinUint32LE(data.transactionContext.locktime),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationOutpointIndex = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: numbers_1.numberToBinUint32LE(data.transactionContext.outpointIndex),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationOutpointTransactionHash = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: data.transactionContext.outpointTransactionHash,
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationOutputValue = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: data.transactionContext.outputValue,
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationSequenceNumber = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: numbers_1.numberToBinUint32LE(data.transactionContext.sequenceNumber),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionOutpoints = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: data.transactionContext.transactionOutpoints,
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionOutpointsHash = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sha256'],
    operation: (_, data, environment) => ({
        bytecode: environment.sha256.hash(environment.sha256.hash(data.transactionContext.transactionOutpoints)),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionOutputs = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: data.transactionContext.transactionOutputs,
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionOutputsHash = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sha256'],
    operation: (_, data, environment) => ({
        bytecode: environment.sha256.hash(environment.sha256.hash(data.transactionContext.transactionOutputs)),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionSequenceNumbers = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: data.transactionContext.transactionSequenceNumbers,
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationTransactionSequenceNumbersHash = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: ['sha256'],
    operation: (_, data, environment) => ({
        bytecode: environment.sha256.hash(environment.sha256.hash(data.transactionContext.transactionSequenceNumbers)),
        status: 'success',
    }),
});
exports.compilerOperationSigningSerializationVersion = compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['transactionContext'],
    environmentProperties: [],
    operation: (_, data) => ({
        bytecode: numbers_1.numberToBinUint32LE(data.transactionContext.version),
        status: 'success',
    }),
});
exports.compilerOperationKeyPublicKeyCommon = compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['keys'],
    environmentProperties: ['secp256k1'],
    operation: (identifier, data, environment) => {
        const { keys } = data;
        const { secp256k1 } = environment;
        const { privateKeys } = keys;
        const [variableId] = identifier.split('.');
        if (privateKeys !== undefined &&
            privateKeys[variableId] !== undefined) {
            return {
                bytecode: secp256k1.derivePublicKeyCompressed(privateKeys[variableId]),
                status: 'success',
            };
        }
        return {
            error: `Identifier "${identifier}" refers to a public key, but no public or private keys for "${variableId}" were provided in the compilation data.`,
            recoverable: true,
            status: 'error',
        };
    },
}));
exports.compilerOperationHdKeyPublicKeyCommon = compiler_operation_helpers_1.attemptCompilerOperations([compiler_operation_helpers_1.compilerOperationAttemptBytecodeResolution], compiler_operation_helpers_1.compilerOperationRequires({
    canBeSkipped: false,
    dataProperties: ['hdKeys'],
    environmentProperties: [
        'entityOwnership',
        'ripemd160',
        'secp256k1',
        'sha256',
        'sha512',
        'variables',
    ],
    operation: 
    // eslint-disable-next-line complexity
    (identifier, data, environment) => {
        var _a, _b, _c;
        const { hdKeys } = data;
        const { hdPrivateKeys, addressIndex, hdPublicKeys } = hdKeys;
        const [variableId] = identifier.split('.');
        const entityId = environment.entityOwnership[variableId];
        if (entityId === undefined) {
            return compiler_operation_helpers_1.compilerOperationHelperUnknownEntity(identifier, variableId);
        }
        if (addressIndex === undefined) {
            return compiler_operation_helpers_1.compilerOperationHelperAddressIndex(identifier);
        }
        const entityHdPrivateKey = hdPrivateKeys === undefined ? undefined : hdPrivateKeys[entityId];
        /**
         * Guaranteed to be an `HdKey` if this method is reached in the compiler.
         */
        const hdKey = environment.variables[variableId];
        if (entityHdPrivateKey !== undefined) {
            const privateResult = compiler_operation_helpers_1.compilerOperationHelperDeriveHdPrivateNode({
                addressIndex,
                entityHdPrivateKey,
                entityId,
                environment,
                hdKey,
                identifier,
            });
            if (privateResult.status === 'error')
                return privateResult;
            return {
                bytecode: environment.secp256k1.derivePublicKeyCompressed(privateResult.bytecode),
                status: 'success',
            };
        }
        const entityHdPublicKey = hdPublicKeys === undefined ? undefined : hdPublicKeys[entityId];
        if (entityHdPublicKey === undefined) {
            return {
                error: `Identifier "${identifier}" refers to an HdKey owned by "${entityId}", but an HD private key or HD public key for this entity was not provided in the compilation data.`,
                recoverable: true,
                status: 'error',
            };
        }
        const addressOffset = (_a = hdKey.addressOffset) !== null && _a !== void 0 ? _a : compiler_defaults_1.CompilerDefaults.hdKeyAddressOffset;
        const privateDerivationPath = (_b = hdKey.privateDerivationPath) !== null && _b !== void 0 ? _b : compiler_defaults_1.CompilerDefaults.hdKeyPrivateDerivationPath;
        const publicDerivationPath = (_c = hdKey.publicDerivationPath) !== null && _c !== void 0 ? _c : privateDerivationPath.replace('m', 'M');
        const validPublicPathWithIndex = /^M(?:\/(?:[0-9]+|i))*$/u;
        if (!validPublicPathWithIndex.test(publicDerivationPath)) {
            return {
                error: `Could not generate ${identifier} – the path "${publicDerivationPath}" is not a valid "publicDerivationPath".`,
                status: 'error',
            };
        }
        const i = addressIndex + addressOffset;
        const instancePath = publicDerivationPath.replace('i', i.toString());
        const masterContents = hd_key_1.decodeHdPublicKey(environment, entityHdPublicKey);
        if (typeof masterContents === 'string') {
            return {
                error: `Could not generate "${identifier}" – the HD public key provided for "${entityId}" could not be decoded: ${masterContents}`,
                status: 'error',
            };
        }
        const instanceNode = hd_key_1.deriveHdPath(environment, masterContents.node, instancePath);
        if (typeof instanceNode === 'string') {
            return {
                error: `Could not generate "${identifier}" – the path "${instancePath}" could not be derived for entity "${entityId}": ${instanceNode}`,
                status: 'error',
            };
        }
        return { bytecode: instanceNode.publicKey, status: 'success' };
    },
}));
/* eslint-disable camelcase, @typescript-eslint/naming-convention */
exports.compilerOperationsCommon = {
    addressData: exports.compilerOperationAddressData,
    currentBlockHeight: exports.compilerOperationCurrentBlockHeight,
    currentBlockTime: exports.compilerOperationCurrentBlockTime,
    hdKey: {
        public_key: exports.compilerOperationHdKeyPublicKeyCommon,
    },
    key: {
        public_key: exports.compilerOperationKeyPublicKeyCommon,
    },
    signingSerialization: {
        corresponding_output: exports.compilerOperationSigningSerializationCorrespondingOutput,
        corresponding_output_hash: exports.compilerOperationSigningSerializationCorrespondingOutputHash,
        covered_bytecode: exports.compilerOperationSigningSerializationCoveredBytecode,
        covered_bytecode_length: exports.compilerOperationSigningSerializationCoveredBytecodeLength,
        locktime: exports.compilerOperationSigningSerializationLocktime,
        outpoint_index: exports.compilerOperationSigningSerializationOutpointIndex,
        outpoint_transaction_hash: exports.compilerOperationSigningSerializationOutpointTransactionHash,
        output_value: exports.compilerOperationSigningSerializationOutputValue,
        sequence_number: exports.compilerOperationSigningSerializationSequenceNumber,
        transaction_outpoints: exports.compilerOperationSigningSerializationTransactionOutpoints,
        transaction_outpoints_hash: exports.compilerOperationSigningSerializationTransactionOutpointsHash,
        transaction_outputs: exports.compilerOperationSigningSerializationTransactionOutputs,
        transaction_outputs_hash: exports.compilerOperationSigningSerializationTransactionOutputsHash,
        transaction_sequence_numbers: exports.compilerOperationSigningSerializationTransactionSequenceNumbers,
        transaction_sequence_numbers_hash: exports.compilerOperationSigningSerializationTransactionSequenceNumbersHash,
        version: exports.compilerOperationSigningSerializationVersion,
    },
    walletData: exports.compilerOperationWalletData,
};
/* eslint-enable camelcase, @typescript-eslint/naming-convention */

},{"../format/numbers":30,"../key/hd-key":34,"../vm/instruction-sets/instruction-sets":92,"./compiler-defaults":40,"./compiler-operation-helpers":41}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationTemplateToCompilationEnvironmentVirtualizedTests = exports.authenticationTemplateToCompilationEnvironment = exports.createCompilerCommonSynchronous = exports.createAuthenticationProgramEvaluationCommon = exports.createCompiler = void 0;
const instruction_sets_1 = require("../vm/instruction-sets/instruction-sets");
const compiler_defaults_1 = require("./compiler-defaults");
const compiler_operations_1 = require("./compiler-operations");
const compile_1 = require("./language/compile");
const scenarios_1 = require("./scenarios");
/**
 * Create a `Compiler` from the provided compilation environment. This method
 * requires a full `CompilationEnvironment` and does not instantiate any new
 * crypto or VM implementations.
 *
 * @param compilationEnvironment - the environment from which to create the
 * compiler
 */
exports.createCompiler = (compilationEnvironment) => ({
    environment: compilationEnvironment,
    generateBytecode: (scriptId, data, debug = false) => {
        const result = compile_1.compileScript(scriptId, data, compilationEnvironment);
        return (debug
            ? result
            : result.success
                ? { bytecode: result.bytecode, success: true }
                : {
                    errorType: result.errorType,
                    errors: result.errors,
                    success: false,
                });
    },
    generateScenario: ({ unlockingScriptId, scenarioId }) => scenarios_1.generateScenarioCommon({
        environment: compilationEnvironment,
        scenarioId,
        unlockingScriptId,
    }),
});
const nullHashLength = 32;
/**
 * A common `createAuthenticationProgram` implementation for most compilers.
 *
 * Accepts the compiled contents of an evaluation and produces a
 * `AuthenticationProgramCommon` which can be evaluated to produce the resulting
 * program state.
 *
 * The precise shape of the authentication program produced by this method is
 * critical to the determinism of BTL evaluations for the compiler in which it
 * is used, it therefore must be standardized between compiler implementations.
 *
 * @param evaluationBytecode - the compiled bytecode to incorporate in the
 * created authentication program
 */
exports.createAuthenticationProgramEvaluationCommon = (evaluationBytecode) => ({
    inputIndex: 0,
    sourceOutput: {
        lockingBytecode: evaluationBytecode,
        satoshis: Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),
    },
    spendingTransaction: {
        inputs: [
            {
                outpointIndex: 0,
                outpointTransactionHash: new Uint8Array(nullHashLength),
                sequenceNumber: 0,
                unlockingBytecode: Uint8Array.of(),
            },
        ],
        locktime: 0,
        outputs: [
            {
                lockingBytecode: Uint8Array.of(),
                satoshis: Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]),
            },
        ],
        version: 0,
    },
});
/**
 * Synchronously create a compiler using the default common environment. Because
 * this compiler has no access to Secp256k1, Sha256, or a VM, it cannot compile
 * evaluations or operations which require key derivation or hashing.
 *
 * @param scriptsAndOverrides - a compilation environment from which properties
 * will be used to override properties of the default common compilation
 * environment – must include the `scripts` property
 */
exports.createCompilerCommonSynchronous = (scriptsAndOverrides) => {
    return exports.createCompiler(Object.assign({
        createAuthenticationProgram: exports.createAuthenticationProgramEvaluationCommon,
        opcodes: instruction_sets_1.generateBytecodeMap(instruction_sets_1.OpcodesCommon),
        operations: compiler_operations_1.compilerOperationsCommon,
    }, scriptsAndOverrides));
};
/**
 * Create a partial `CompilationEnvironment` from an `AuthenticationTemplate` by
 * extracting and formatting the `scripts` and `variables` properties.
 *
 * Note, if this `AuthenticationTemplate` might be malformed, first validate it
 * with `validateAuthenticationTemplate`.
 *
 * @param template - the `AuthenticationTemplate` from which to extract the
 * compilation environment
 */
exports.authenticationTemplateToCompilationEnvironment = (template) => {
    const scripts = Object.entries(template.scripts).reduce((all, [id, def]) => (Object.assign(Object.assign({}, all), { [id]: def.script })), {});
    const variables = Object.values(template.entities).reduce((all, entity) => (Object.assign(Object.assign({}, all), entity.variables)), {});
    const entityOwnership = Object.entries(template.entities).reduce((all, [entityId, entity]) => {
        var _a;
        return (Object.assign(Object.assign({}, all), Object.keys((_a = entity.variables) !== null && _a !== void 0 ? _a : {}).reduce((entityVariables, variableId) => (Object.assign(Object.assign({}, entityVariables), { [variableId]: entityId })), {})));
    }, {});
    const unlockingScripts = Object.entries(template.scripts).reduce((all, [id, def]) => 'unlocks' in def && def.unlocks !== undefined
        ? Object.assign(Object.assign({}, all), { [id]: def.unlocks }) : all, {});
    const unlockingScriptTimeLockTypes = Object.entries(template.scripts).reduce((all, [id, def]) => 'timeLockType' in def && def.timeLockType !== undefined
        ? Object.assign(Object.assign({}, all), { [id]: def.timeLockType }) : all, {});
    const lockingScriptTypes = Object.entries(template.scripts).reduce((all, [id, def]) => 'lockingType' in def &&
        def.lockingType !== undefined
        ? Object.assign(Object.assign({}, all), { [id]: def.lockingType }) : all, {});
    const scenarios = template.scenarios === undefined
        ? undefined
        : Object.entries(template.scenarios).reduce((all, [id, def]) => (Object.assign(Object.assign({}, all), { [id]: def })), {});
    return Object.assign(Object.assign({ entityOwnership,
        lockingScriptTypes }, (scenarios === undefined ? {} : { scenarios })), { scripts,
        unlockingScriptTimeLockTypes,
        unlockingScripts,
        variables });
};
/**
 * Create a partial `CompilationEnvironment` from an `AuthenticationTemplate`,
 * virtualizing all script tests as unlocking and locking script pairs.
 *
 * @param template - the authentication template from which to extract the
 * compilation environment
 */
exports.authenticationTemplateToCompilationEnvironmentVirtualizedTests = (template) => {
    const virtualizedScripts = Object.entries(template.scripts).reduce((all, [scriptId, script]) => {
        if ('tests' in script) {
            return Object.assign(Object.assign({}, all), script.tests.reduce((tests, test, index) => {
                var _a;
                const pushTestedScript = script.pushed === true;
                const checkScriptId = `${compiler_defaults_1.CompilerDefaults.virtualizedTestCheckScriptPrefix}${scriptId}_${index}`;
                const virtualizedLockingScriptId = `${compiler_defaults_1.CompilerDefaults.virtualizedTestLockingScriptPrefix}${scriptId}_${index}`;
                const virtualizedUnlockingScriptId = `${compiler_defaults_1.CompilerDefaults.virtualizedTestUnlockingScriptPrefix}${scriptId}_${index}`;
                return Object.assign(Object.assign({}, tests), { [checkScriptId]: { script: test.check }, [virtualizedLockingScriptId]: {
                        script: pushTestedScript
                            ? `<${scriptId}> ${checkScriptId}`
                            : `${scriptId} ${checkScriptId}`,
                    }, [virtualizedUnlockingScriptId]: {
                        script: (_a = test.setup) !== null && _a !== void 0 ? _a : '',
                        unlocks: virtualizedLockingScriptId,
                    } });
            }, {}));
        }
        return all;
    }, {});
    const templateWithVirtualizedTests = Object.assign(Object.assign({}, template), { scripts: Object.assign(Object.assign({}, template.scripts), virtualizedScripts) });
    return exports.authenticationTemplateToCompilationEnvironment(templateWithVirtualizedTests);
};

},{"../vm/instruction-sets/instruction-sets":92,"./compiler-defaults":40,"./compiler-operations":42,"./language/compile":45,"./scenarios":53}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileScript = exports.compileScriptP2shUnlocking = exports.compileScriptP2shLocking = exports.compileScriptRaw = exports.compileScriptContents = exports.describeExpectedInput = void 0;
const compiler_1 = require("../compiler");
const language_utils_1 = require("./language-utils");
const parse_1 = require("./parse");
const reduce_1 = require("./reduce");
const resolve_1 = require("./resolve");
/**
 * A text-formatting method to pretty-print the list of expected inputs
 * (`Encountered unexpected input while parsing script. Expected ...`). If
 * present, the `EOF` expectation is always moved to the end of the list.
 * @param expectedArray - the alphabetized list of expected inputs produced by
 * `parseScript`
 */
exports.describeExpectedInput = (expectedArray) => {
    /**
     * The constant used by the parser to denote the end of the input
     */
    const EOF = 'EOF';
    const newArray = expectedArray.filter((value) => value !== EOF);
    // eslint-disable-next-line functional/no-conditional-statement
    if (newArray.length !== expectedArray.length) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        newArray.push('the end of the script');
    }
    const withoutLastElement = newArray.slice(0, newArray.length - 1);
    const lastElement = newArray[newArray.length - 1];
    const arrayRequiresCommas = 3;
    const arrayRequiresOr = 2;
    return `Encountered unexpected input while parsing script. Expected ${newArray.length >= arrayRequiresCommas
        ? withoutLastElement.join(', ').concat(`, or ${lastElement}`)
        : newArray.length === arrayRequiresOr
            ? newArray.join(' or ')
            : lastElement}.`;
};
/**
 * This method is generally for internal use. The `compileScript` method is the
 * recommended API for direct compilation.
 */
exports.compileScriptContents = ({ data, environment, script, }) => {
    const parseResult = parse_1.parseScript(script);
    if (!parseResult.status) {
        return {
            errorType: 'parse',
            errors: [
                {
                    error: exports.describeExpectedInput(parseResult.expected),
                    range: {
                        endColumn: parseResult.index.column,
                        endLineNumber: parseResult.index.line,
                        startColumn: parseResult.index.column,
                        startLineNumber: parseResult.index.line,
                    },
                },
            ],
            success: false,
        };
    }
    const resolver = resolve_1.createIdentifierResolver({ data, environment });
    const resolvedScript = resolve_1.resolveScriptSegment(parseResult.value, resolver);
    const resolutionErrors = language_utils_1.getResolutionErrors(resolvedScript);
    if (resolutionErrors.length !== 0) {
        return {
            errorType: 'resolve',
            errors: resolutionErrors,
            parse: parseResult.value,
            resolve: resolvedScript,
            success: false,
        };
    }
    const reduction = reduce_1.reduceScript(resolvedScript, environment.vm, environment.createAuthenticationProgram);
    return Object.assign(Object.assign({}, (reduction.errors === undefined
        ? { bytecode: reduction.bytecode, success: true }
        : { errorType: 'reduce', errors: reduction.errors, success: false })), { parse: parseResult.value, reduce: reduction, resolve: resolvedScript });
};
const emptyRange = () => ({
    endColumn: 0,
    endLineNumber: 0,
    startColumn: 0,
    startLineNumber: 0,
});
/**
 * This method is generally for internal use. The `compileScript` method is the
 * recommended API for direct compilation.
 */
exports.compileScriptRaw = ({ data, environment, scriptId, }) => {
    var _a;
    const script = environment.scripts[scriptId];
    if (script === undefined) {
        return {
            errorType: 'parse',
            errors: [
                {
                    error: `No script with an ID of "${scriptId}" was provided in the compilation environment.`,
                    range: emptyRange(),
                },
            ],
            success: false,
        };
    }
    if (((_a = environment.sourceScriptIds) === null || _a === void 0 ? void 0 : _a.includes(scriptId)) === true) {
        return {
            errorType: 'parse',
            errors: [
                {
                    error: `A circular dependency was encountered: script "${scriptId}" relies on itself to be generated. (Source scripts: ${environment.sourceScriptIds.join(' → ')})`,
                    range: emptyRange(),
                },
            ],
            success: false,
        };
    }
    const sourceScriptIds = environment.sourceScriptIds === undefined
        ? [scriptId]
        : [...environment.sourceScriptIds, scriptId];
    return exports.compileScriptContents({
        data,
        environment: Object.assign(Object.assign({}, environment), { sourceScriptIds }),
        script,
    });
};
exports.compileScriptP2shLocking = ({ lockingBytecode, vm, }) => {
    const compiler = compiler_1.createCompilerCommonSynchronous({
        scripts: {
            p2shLocking: 'OP_HASH160 <$(<lockingBytecode> OP_HASH160)> OP_EQUAL',
        },
        variables: { lockingBytecode: { type: 'AddressData' } },
        vm,
    });
    return compiler.generateBytecode('p2shLocking', {
        bytecode: { lockingBytecode },
    });
};
exports.compileScriptP2shUnlocking = ({ lockingBytecode, unlockingBytecode, }) => {
    const compiler = compiler_1.createCompilerCommonSynchronous({
        scripts: {
            p2shUnlocking: 'unlockingBytecode <lockingBytecode>',
        },
        variables: {
            lockingBytecode: { type: 'AddressData' },
            unlockingBytecode: { type: 'AddressData' },
        },
    });
    return compiler.generateBytecode('p2shUnlocking', {
        bytecode: { lockingBytecode, unlockingBytecode },
    });
};
/**
 * Parse, resolve, and reduce the selected script using the provided `data` and
 * `environment`.
 *
 * Note, locktime validation only occurs if `transactionContext` is provided in
 * the environment.
 */
// eslint-disable-next-line complexity
exports.compileScript = (scriptId, data, environment) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const locktimeDisablingSequenceNumber = 0xffffffff;
    const lockTimeTypeBecomesTimestamp = 500000000;
    if (((_a = data.transactionContext) === null || _a === void 0 ? void 0 : _a.locktime) !== undefined) {
        if (((_b = environment.unlockingScriptTimeLockTypes) === null || _b === void 0 ? void 0 : _b[scriptId]) === 'height' &&
            data.transactionContext.locktime >= lockTimeTypeBecomesTimestamp) {
            return {
                errorType: 'parse',
                errors: [
                    {
                        error: `The script "${scriptId}" requires a height-based locktime (less than 500,000,000), but this transaction uses a timestamp-based locktime ("${data.transactionContext.locktime}").`,
                        range: emptyRange(),
                    },
                ],
                success: false,
            };
        }
        if (((_c = environment.unlockingScriptTimeLockTypes) === null || _c === void 0 ? void 0 : _c[scriptId]) === 'timestamp' &&
            data.transactionContext.locktime < lockTimeTypeBecomesTimestamp) {
            return {
                errorType: 'parse',
                errors: [
                    {
                        error: `The script "${scriptId}" requires a timestamp-based locktime (greater than or equal to 500,000,000), but this transaction uses a height-based locktime ("${data.transactionContext.locktime}").`,
                        range: emptyRange(),
                    },
                ],
                success: false,
            };
        }
    }
    if (((_d = data.transactionContext) === null || _d === void 0 ? void 0 : _d.sequenceNumber) !== undefined &&
        ((_e = environment.unlockingScriptTimeLockTypes) === null || _e === void 0 ? void 0 : _e[scriptId]) !== undefined &&
        data.transactionContext.sequenceNumber === locktimeDisablingSequenceNumber) {
        return {
            errorType: 'parse',
            errors: [
                {
                    error: `The script "${scriptId}" requires a locktime, but this input's sequence number is set to disable transaction locktime (0xffffffff). This will cause the OP_CHECKLOCKTIMEVERIFY operation to error when the transaction is verified. To be valid, this input must use a sequence number which does not disable locktime.`,
                    range: emptyRange(),
                },
            ],
            success: false,
        };
    }
    const rawResult = exports.compileScriptRaw({
        data,
        environment,
        scriptId,
    });
    if (!rawResult.success) {
        return rawResult;
    }
    const unlocks = (_f = environment.unlockingScripts) === null || _f === void 0 ? void 0 : _f[scriptId];
    const unlockingScriptType = unlocks === undefined
        ? undefined
        : (_g = environment.lockingScriptTypes) === null || _g === void 0 ? void 0 : _g[unlocks];
    const isP2shUnlockingScript = unlockingScriptType === 'p2sh';
    const lockingScriptType = (_h = environment.lockingScriptTypes) === null || _h === void 0 ? void 0 : _h[scriptId];
    const isP2shLockingScript = lockingScriptType === 'p2sh';
    if (isP2shLockingScript) {
        const transformedResult = exports.compileScriptP2shLocking({
            lockingBytecode: rawResult.bytecode,
            vm: environment.vm,
        });
        if (!transformedResult.success) {
            return transformedResult;
        }
        return Object.assign(Object.assign({}, rawResult), { bytecode: transformedResult.bytecode, transformed: 'p2sh-locking' });
    }
    if (isP2shUnlockingScript) {
        const lockingBytecodeResult = exports.compileScriptRaw({
            data,
            environment,
            scriptId: unlocks,
        });
        if (!lockingBytecodeResult.success) {
            return lockingBytecodeResult;
        }
        const transformedResult = exports.compileScriptP2shUnlocking({
            lockingBytecode: lockingBytecodeResult.bytecode,
            unlockingBytecode: rawResult.bytecode,
        });
        return Object.assign(Object.assign({}, rawResult), { bytecode: transformedResult.bytecode, transformed: 'p2sh-unlocking' });
    }
    return rawResult;
};

},{"../compiler":44,"./language-utils":47,"./parse":49,"./reduce":51,"./resolve":52}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierResolutionErrorType = exports.IdentifierResolutionType = void 0;
var IdentifierResolutionType;
(function (IdentifierResolutionType) {
    IdentifierResolutionType["opcode"] = "opcode";
    IdentifierResolutionType["variable"] = "variable";
    IdentifierResolutionType["script"] = "script";
})(IdentifierResolutionType = exports.IdentifierResolutionType || (exports.IdentifierResolutionType = {}));
var IdentifierResolutionErrorType;
(function (IdentifierResolutionErrorType) {
    IdentifierResolutionErrorType["unknown"] = "unknown";
    IdentifierResolutionErrorType["variable"] = "variable";
    IdentifierResolutionErrorType["script"] = "script";
})(IdentifierResolutionErrorType = exports.IdentifierResolutionErrorType || (exports.IdentifierResolutionErrorType = {}));

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUnexecutedRanges = exports.extractEvaluationSamplesRecursive = exports.extractEvaluationSamples = exports.stringifyErrors = exports.extractResolvedVariableBytecodeMap = exports.extractBytecodeResolutions = exports.allErrorsAreRecoverable = exports.getResolutionErrors = exports.compileBtl = exports.containsRange = exports.mergeRanges = void 0;
const hex_1 = require("../../format/hex");
const instruction_sets_utils_1 = require("../../vm/instruction-sets/instruction-sets-utils");
const compiler_1 = require("../compiler");
const pluckStartPosition = (range) => ({
    startColumn: range.startColumn,
    startLineNumber: range.startLineNumber,
});
const pluckEndPosition = (range) => ({
    endColumn: range.endColumn,
    endLineNumber: range.endLineNumber,
});
/**
 * Combine an array of `Range`s into a single larger `Range`.
 *
 * @param ranges - an array of `Range`s
 * @param parentRange - the range to assume if `ranges` is an empty array
 */
exports.mergeRanges = (ranges, parentRange = {
    endColumn: 0,
    endLineNumber: 0,
    startColumn: 0,
    startLineNumber: 0,
}) => {
    const minimumRangesToMerge = 2;
    const unsortedMerged = ranges.length < minimumRangesToMerge
        ? ranges.length === 1
            ? ranges[0]
            : parentRange
        : ranges.reduce(
        // eslint-disable-next-line complexity
        (merged, range) => (Object.assign(Object.assign({}, (range.endLineNumber > merged.endLineNumber
            ? pluckEndPosition(range)
            : range.endLineNumber === merged.endLineNumber &&
                range.endColumn > merged.endColumn
                ? pluckEndPosition(range)
                : pluckEndPosition(merged))), (range.startLineNumber < merged.startLineNumber
            ? pluckStartPosition(range)
            : range.startLineNumber === merged.startLineNumber &&
                range.startColumn < merged.startColumn
                ? pluckStartPosition(range)
                : pluckStartPosition(merged)))), ranges[0]);
    return Object.assign(Object.assign({}, pluckEndPosition(unsortedMerged)), pluckStartPosition(unsortedMerged));
};
/**
 * Returns true if the `outerRange` fully contains the `innerRange`, otherwise,
 * `false`.
 *
 * @param outerRange - the bounds of the outer range
 * @param innerRange - the inner range to test
 * @param exclusive - disallow the `innerRange` from overlapping the
 * `outerRange` (such that the outer start and end columns may not be equal) –
 * defaults to `true`
 */
// eslint-disable-next-line complexity
exports.containsRange = (outerRange, innerRange, exclusive = true) => {
    const startsAfter = outerRange.startLineNumber < innerRange.startLineNumber
        ? true
        : outerRange.startLineNumber === innerRange.startLineNumber
            ? exclusive
                ? outerRange.startColumn < innerRange.startColumn
                : outerRange.startColumn <= innerRange.startColumn
            : false;
    const endsBefore = outerRange.endLineNumber > innerRange.endLineNumber
        ? true
        : outerRange.endLineNumber === innerRange.endLineNumber
            ? exclusive
                ? outerRange.endColumn > innerRange.endColumn
                : outerRange.endColumn >= innerRange.endColumn
            : false;
    return startsAfter && endsBefore;
};
/**
 * Perform a simplified compilation on a Bitauth Templating Language (BTL)
 * script containing only hex literals, bigint literals, UTF8 literals, and push
 * statements. Scripts may not contain variables/operations, evaluations, or
 * opcode identifiers (use hex literals instead).
 *
 * This is useful for accepting complex user input in advanced interfaces,
 * especially for `AddressData` and `WalletData`.
 *
 * Returns the compiled bytecode as a `Uint8Array`, or throws an error message.
 *
 * @param script - a simple BTL script containing no variables or evaluations
 */
exports.compileBtl = (script) => {
    const result = compiler_1.createCompilerCommonSynchronous({
        scripts: { script },
    }).generateBytecode('script', {});
    if (result.success) {
        return result.bytecode;
    }
    return `BTL compilation error:${result.errors.reduce((all, { error, range }) => `${all} [${range.startLineNumber}, ${range.startColumn}]: ${error}`, '')}`;
};
/**
 * Extract a list of the errors which occurred while resolving a script.
 *
 * @param resolvedScript - the result of `resolveScript` from which to extract
 * errors
 */
exports.getResolutionErrors = (resolvedScript) => resolvedScript.reduce((errors, segment) => {
    switch (segment.type) {
        case 'error':
            return [
                ...errors,
                Object.assign(Object.assign({ error: segment.value }, (segment.missingIdentifier === undefined
                    ? {}
                    : {
                        missingIdentifier: segment.missingIdentifier,
                        owningEntity: segment.owningEntity,
                    })), { range: segment.range }),
            ];
        case 'push':
        case 'evaluation':
            return [...errors, ...exports.getResolutionErrors(segment.value)];
        default:
            return errors;
    }
}, []);
/**
 * Verify that every error in the provided array can be resolved by providing
 * additional variables in the compilation data (rather than deeper issues, like
 * problems with the authentication template or wallet implementation).
 *
 * Note, errors are only recoverable if the "entity ownership" of each missing
 * identifier is known (specified in `CompilationData`'s `entityOwnership`).
 *
 * @param errors - an array of compilation errors
 */
exports.allErrorsAreRecoverable = (errors) => errors.every((error) => 'missingIdentifier' in error && 'owningEntity' in error);
/**
 * Get an array of all resolutions used in a `ResolvedScript`.
 * @param resolvedScript - the resolved script to search
 */
exports.extractBytecodeResolutions = (resolvedScript) => 
// eslint-disable-next-line complexity
resolvedScript.reduce((all, segment) => {
    switch (segment.type) {
        case 'push':
        case 'evaluation':
            return [...all, ...exports.extractBytecodeResolutions(segment.value)];
        case 'bytecode':
            if ('variable' in segment) {
                return [
                    ...all,
                    {
                        bytecode: segment.value,
                        text: segment.variable,
                        type: 'variable',
                    },
                ];
            }
            if ('script' in segment) {
                return [
                    ...all,
                    ...exports.extractBytecodeResolutions(segment.source),
                    {
                        bytecode: segment.value,
                        text: segment.script,
                        type: 'script',
                    },
                ];
            }
            if ('opcode' in segment) {
                return [
                    ...all,
                    {
                        bytecode: segment.value,
                        text: segment.opcode,
                        type: 'opcode',
                    },
                ];
            }
            return [
                ...all,
                {
                    bytecode: segment.value,
                    text: segment.literal,
                    type: segment.literalType,
                },
            ];
        default:
            return all;
    }
}, []);
/**
 * Extract an object mapping the variable identifiers used in a `ResolvedScript`
 * to their resolved bytecode.
 *
 * @param resolvedScript - the resolved script to search
 */
exports.extractResolvedVariableBytecodeMap = (resolvedScript) => exports.extractBytecodeResolutions(resolvedScript).reduce((all, resolution) => resolution.type === 'variable'
    ? Object.assign(Object.assign({}, all), { [resolution.text]: resolution.bytecode }) : all, {});
/**
 * Format a list of `CompilationError`s into a single string, with an error
 * start position following each error. E.g. for line 1, column 2:
 * `The error message. [1, 2]`
 *
 * Errors are separated with the `separator`, which defaults to `; `, e.g.:
 * `The first error message. [1, 2]; The second error message. [3, 4]`
 *
 * @param errors - an array of compilation errors
 * @param separator - the characters with which to join the formatted errors.
 */
exports.stringifyErrors = (errors, separator = '; ') => {
    return `${errors
        .map((error) => `[${error.range.startLineNumber}, ${error.range.startColumn}] ${error.error}`)
        .join(separator)}`;
};
/**
 * Extract a set of "evaluation samples" from the result of a BTL compilation
 * and a matching debug trace (from `vm.debug`), pairing program states with the
 * source ranges which produced them – like a "source map" for complete
 * evaluations. This is useful for omniscient debuggers like Bitauth IDE.
 *
 * Returns an array of samples and an array of unmatched program states
 * remaining if `nodes` doesn't contain enough instructions to consume all
 * program states provided in `trace`. Returned samples are ordered by the
 * ending position (line and column) of their range.
 *
 * If all program states are consumed before the available nodes are exhausted,
 * the remaining nodes are ignored (the produced samples end at the last
 * instruction for which a program state exists). This usually occurs when an
 * error halts evaluation before the end of the script. (Note: if this occurs,
 * the final trace state will not be used, as it is expected to be the
 * duplicated final result produced by `vm.debug`, and should not be matched
 * with the next instruction. The returned `unmatchedStates` will have a length
 * of `0`.)
 *
 * This method allows for samples to be extracted from a single evaluation;
 * most applications should use `extractEvaluationSamplesRecursive` instead.
 *
 * @remarks
 * This method incrementally concatenates the reduced bytecode from each node,
 * parsing the result into evaluation samples.
 *
 * Each node can contain only a portion of an instruction (like a long push
 * operation), or it can contain multiple instructions (like a long hex literal
 * representing a string of bytecode or an evaluation which is not wrapped by a
 * push).
 *
 * If a node contains only a portion of an instruction, the bytecode from
 * additional nodes are concatenated (and ranges merged) until an instruction
 * can be created. If any bytecode remains after a sample has been created, the
 * next sample begins in the same range. (For this reason, it's possible that
 * samples overlap.)
 *
 * If a node contains more than one instruction, the intermediate states
 * produced before the final state for that sample are saved to the sample's
 * `intermediateStates` array.
 *
 * If the program states in `trace` are exhausted before the final instruction
 * in a sample (usually caused by an evaluation error), the last instruction
 * with a matching program state is used for the sample (with its program
 * state), and the unmatched instructions are ignored. (This allows the "last
 * known state" to be displayed for the sample which caused evaluation to halt.)
 *
 * ---
 *
 * For example, the following script demonstrates many of these cases:
 *
 * `0x00 0x01 0xab01 0xcd9300 $(OP_3 <0x00> OP_SWAP OP_CAT) 0x010203`
 *
 * Which compiles to `0x0001ab01cd93000003010203`, disassembled:
 *
 * `OP_0 OP_PUSHBYTES_1 0xab OP_PUSHBYTES_1 0xcd OP_ADD OP_0 OP_0 OP_PUSHBYTES_3 0x010203`
 *
 * In the script, there are 6 top-level nodes (identified below within `[]`):
 *
 * `[0x00] [0x01] [0xab01] [0xcd9300] [$(OP_3 <0x00> OP_SWAP OP_CAT)] [0x010203]`
 *
 * These nodes together encode 7 instructions, some within a single node, and
 * some split between several nodes. Below we substitute the evaluation for its
 * result `0x0003` to group instructions by `[]`:
 *
 * `[0x00] [0x01 0xab][01 0xcd][93][00] [0x00][03 0x010203]`
 *
 * The "resolution" of samples is limited to the range of single nodes: nodes
 * cannot always be introspected to determine where contained instructions begin
 * and end. For example, it is ambiguous which portions of the evaluation are
 * responsible for the initial `0x00` and which are responsible for the `0x03`.
 *
 * For this reason, the range of each sample is limited to the range(s) of one
 * or more adjacent nodes. Samples may overlap in the range of a node which is
 * responsible for both ending a previous sample and beginning a new sample.
 * (Though, only 2 samples can overlap. If a node is responsible for more than 2
 * instructions, the second sample includes `internalStates` for instructions
 * which occur before the end of the second sample.)
 *
 * In this case, there are 6 samples identified below within `[]`, where each
 * `[` is closed by the closest following `]` (no nesting):
 *
 * `[0x00] [0x01 [0xab01] [0xcd9300]] [[$(OP_3 <0x00> OP_SWAP OP_CAT)] 0x010203]`
 *
 * The ranges for each sample (in terms of nodes) are as follows:
 * - Sample 1: node 1
 * - Sample 2: node 2 + node 3
 * - Sample 3: node 3 + node 4
 * - Sample 4: node 4
 * - Sample 5: node 5
 * - Sample 6: node 5 + node 6
 *
 * Note that the following samples overlap:
 * - Sample 2 and Sample 3
 * - Sample 3 and Sample 4
 * - Sample 5 and Sample 6
 *
 * Finally, note that Sample 4 will have one internal state produced by the
 * `OP_ADD` instruction. Sample 4 then ends with the `OP_0` (`0x00`) instruction
 * at the end of the `0xcd9300` node.
 *
 * ---
 *
 * Note, this implementation relies on the expectation that `trace` begins with
 * the initial program state, contains a single program state per instruction,
 * and ends with the final program state (as produced by `vm.debug`). It also
 * expects the `bytecode` provided by nodes to be parsable by `parseBytecode`.
 *
 * @param evaluationRange - the range of the script node which was evaluated to
 * produce the `trace`
 * @param nodes - an array of reduced nodes to parse
 * @param trace - the `vm.debug` result to map to these nodes
 */
// eslint-disable-next-line complexity
exports.extractEvaluationSamples = ({ evaluationRange, nodes, trace, }) => {
    const traceWithoutFinalState = trace.length > 1 ? trace.slice(0, -1) : trace.slice();
    if (traceWithoutFinalState.length === 0) {
        return {
            samples: [],
            unmatchedStates: [],
        };
    }
    const samples = [
        {
            evaluationRange,
            internalStates: [],
            range: {
                endColumn: evaluationRange.startColumn,
                endLineNumber: evaluationRange.startLineNumber,
                startColumn: evaluationRange.startColumn,
                startLineNumber: evaluationRange.startLineNumber,
            },
            state: traceWithoutFinalState[0],
        },
    ];
    // eslint-disable-next-line functional/no-let
    let nextState = 1;
    // eslint-disable-next-line functional/no-let
    let nextNode = 0;
    // eslint-disable-next-line functional/no-let, @typescript-eslint/init-declarations
    let incomplete;
    // eslint-disable-next-line functional/no-loop-statement
    while (nextState < traceWithoutFinalState.length && nextNode < nodes.length) {
        const currentNode = nodes[nextNode];
        const { mergedBytecode, mergedRange } = incomplete === undefined
            ? {
                mergedBytecode: currentNode.bytecode,
                mergedRange: currentNode.range,
            }
            : {
                mergedBytecode: hex_1.flattenBinArray([
                    incomplete.bytecode,
                    currentNode.bytecode,
                ]),
                mergedRange: exports.mergeRanges([incomplete.range, currentNode.range]),
            };
        const parsed = instruction_sets_utils_1.parseBytecode(mergedBytecode);
        const hasNonMalformedInstructions = parsed.length !== 0 && !('malformed' in parsed[0]);
        if (hasNonMalformedInstructions) {
            const lastInstruction = parsed[parsed.length - 1];
            const validInstructions = (instruction_sets_utils_1.authenticationInstructionIsMalformed(lastInstruction)
                ? parsed.slice(0, parsed.length - 1)
                : parsed);
            const firstUnmatchedStateIndex = nextState + validInstructions.length;
            const matchingStates = traceWithoutFinalState.slice(nextState, firstUnmatchedStateIndex);
            const pairedStates = validInstructions.map((instruction, index) => ({
                instruction,
                state: matchingStates[index],
            }));
            /**
             * Guaranteed to have a defined `state` (or the loop would have exited).
             */
            const firstPairedState = pairedStates[0];
            const closesCurrentlyOpenSample = incomplete !== undefined;
            // eslint-disable-next-line functional/no-conditional-statement
            if (closesCurrentlyOpenSample) {
                // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
                samples.push({
                    evaluationRange,
                    instruction: firstPairedState.instruction,
                    internalStates: [],
                    range: mergedRange,
                    state: firstPairedState.state,
                });
            }
            const firstUndefinedStateIndex = pairedStates.findIndex(({ state }) => state === undefined);
            const sampleHasError = firstUndefinedStateIndex !== -1;
            const sampleClosingIndex = sampleHasError
                ? firstUndefinedStateIndex - 1
                : pairedStates.length - 1;
            const closesASecondSample = !closesCurrentlyOpenSample || sampleClosingIndex > 0;
            // eslint-disable-next-line functional/no-conditional-statement
            if (closesASecondSample) {
                const finalState = pairedStates[sampleClosingIndex];
                const secondSamplePairsBegin = closesCurrentlyOpenSample ? 1 : 0;
                const internalStates = pairedStates.slice(secondSamplePairsBegin, sampleClosingIndex);
                // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
                samples.push({
                    evaluationRange,
                    instruction: finalState.instruction,
                    internalStates,
                    range: currentNode.range,
                    state: finalState.state,
                });
            }
            // eslint-disable-next-line functional/no-expression-statement
            nextState = firstUnmatchedStateIndex;
            // eslint-disable-next-line functional/no-conditional-statement
            if (instruction_sets_utils_1.authenticationInstructionIsMalformed(lastInstruction)) {
                // eslint-disable-next-line functional/no-expression-statement
                incomplete = {
                    bytecode: instruction_sets_utils_1.serializeParsedAuthenticationInstructionMalformed(lastInstruction),
                    range: currentNode.range,
                };
                // eslint-disable-next-line functional/no-conditional-statement
            }
            else {
                // eslint-disable-next-line functional/no-expression-statement
                incomplete = undefined;
            }
            // eslint-disable-next-line functional/no-conditional-statement
        }
        else {
            const lastInstruction = parsed[parsed.length - 1];
            // eslint-disable-next-line functional/no-expression-statement
            incomplete =
                lastInstruction === undefined
                    ? undefined
                    : {
                        bytecode: instruction_sets_utils_1.serializeParsedAuthenticationInstructionMalformed(lastInstruction),
                        range: mergedRange,
                    };
        }
        // eslint-disable-next-line functional/no-expression-statement
        nextNode += 1;
    }
    /**
     * Because we ran out of `trace` states before all `nodes` were matched, we
     * know an error occurred which halted evaluation. This error is indicated in
     * the result by returning an empty array of `unmatchedStates`. Successful
     * evaluations will always return at least one unmatched state: the final
     * "evaluation result" state produced by `vm.debug`.
     */
    const errorOccurred = nextNode < nodes.length;
    const unmatchedStates = errorOccurred
        ? []
        : trace.slice(nextState);
    return {
        samples,
        unmatchedStates,
    };
};
/**
 * Similar to `extractEvaluationSamples`, but recursively extracts samples from
 * evaluations within the provided array of nodes.
 *
 * Because BTL evaluations are fully self-contained, there should never be
 * unmatched states from evaluations within a script reduction trace tree. (For
 * this reason, this method does not return the `unmatchedStates` from nested
 * evaluations.)
 *
 * Returned samples are ordered by the ending position (line and column) of
 * their range. Samples from BTL evaluations which occur within an outer
 * evaluation appear before their parent sample (which uses their result).
 *
 * @param evaluationRange - the range of the script node which was evaluated to
 * produce the `trace`
 * @param nodes - an array of reduced nodes to parse
 * @param trace - the `vm.debug` result to map to these nodes
 */
exports.extractEvaluationSamplesRecursive = ({ evaluationRange, nodes, trace, }) => {
    const extractEvaluations = (node, depth = 1) => {
        if ('push' in node) {
            return node.push.script.reduce((all, childNode) => [...all, ...extractEvaluations(childNode, depth)], []);
        }
        if ('source' in node) {
            const childSamples = node.source.script.reduce((all, childNode) => [
                ...all,
                ...extractEvaluations(childNode, depth + 1),
            ], []);
            const traceWithoutUnlockingPhase = node.trace.slice(1);
            const evaluationBeginToken = '$(';
            const evaluationEndToken = ')';
            const extracted = exports.extractEvaluationSamples({
                evaluationRange: {
                    endColumn: node.range.endColumn - evaluationEndToken.length,
                    endLineNumber: node.range.endLineNumber,
                    startColumn: node.range.startColumn + evaluationBeginToken.length,
                    startLineNumber: node.range.startLineNumber,
                },
                nodes: node.source.script,
                trace: traceWithoutUnlockingPhase,
            });
            return [...extracted.samples, ...childSamples];
        }
        return [];
    };
    const { samples, unmatchedStates } = exports.extractEvaluationSamples({
        evaluationRange,
        nodes,
        trace,
    });
    const childSamples = nodes.reduce((all, node) => [...all, ...extractEvaluations(node)], []);
    const endingOrderedSamples = [...samples, ...childSamples].sort((a, b) => {
        const linesOrdered = a.range.endLineNumber - b.range.endLineNumber;
        return linesOrdered === 0
            ? a.range.endColumn - b.range.endColumn
            : linesOrdered;
    });
    return {
        samples: endingOrderedSamples,
        unmatchedStates,
    };
};
const stateIsExecuting = (state) => state.executionStack.every((item) => item);
/**
 * Extract an array of ranges which were unused by an evaluation. This is useful
 * in development tooling for fading out or hiding code which is unimportant to
 * the current evaluation being tested.
 *
 * @remarks
 * Only ranges which are guaranteed to be unimportant to an evaluation are
 * returned by this method. These ranges are extracted from samples which:
 * - are preceded by a sample which ends with execution disabled (e.g. an
 * unsuccessful `OP_IF`)
 * - end with execution disabled, and
 * - contain no `internalStates` which enable execution.
 *
 * Note, internal states which temporarily re-enable and then disable execution
 * again can still have an effect on the parent evaluation, so this method
 * conservatively excludes such samples. For example, the hex literal
 * `0x675167`, which encodes `OP_ELSE OP_1 OP_ELSE`, could begin and end with
 * states in which execution is disabled, yet a `1` is pushed to the stack
 * during the sample's evaluation. (Samples like this are unusual, and can
 * almost always be reformatted to clearly separate the executed and unexecuted
 * instructions.)
 *
 * @param samples - an array of samples ordered by the ending position (line and
 * column) of their range.
 * @param evaluationBegins - the line and column at which the initial sample's
 * evaluation range begins (where the preceding state is assumed to be
 * executing), defaults to `1,1`
 */
exports.extractUnexecutedRanges = (samples, evaluationBegins = '1,1') => {
    const reduced = samples.reduce((all, sample) => {
        const { precedingStateSkipsByEvaluation, unexecutedRanges } = all;
        const currentEvaluationStartLineAndColumn = `${sample.evaluationRange.startLineNumber},${sample.evaluationRange.startColumn}`;
        const precedingStateSkips = precedingStateSkipsByEvaluation[currentEvaluationStartLineAndColumn];
        const endsWithSkip = !stateIsExecuting(sample.state);
        const sampleHasNoExecutedInstructions = endsWithSkip &&
            sample.internalStates.every((group) => !stateIsExecuting(group.state));
        if (precedingStateSkips && sampleHasNoExecutedInstructions) {
            return {
                precedingStateSkipsByEvaluation: Object.assign(Object.assign({}, precedingStateSkipsByEvaluation), { [currentEvaluationStartLineAndColumn]: true }),
                unexecutedRanges: [...unexecutedRanges, sample.range],
            };
        }
        return {
            precedingStateSkipsByEvaluation: Object.assign(Object.assign({}, precedingStateSkipsByEvaluation), { [currentEvaluationStartLineAndColumn]: endsWithSkip }),
            unexecutedRanges,
        };
    }, {
        precedingStateSkipsByEvaluation: {
            [evaluationBegins]: false,
        },
        unexecutedRanges: [],
    });
    const canHaveContainedRanges = 2;
    const containedRangesExcluded = reduced.unexecutedRanges.length < canHaveContainedRanges
        ? reduced.unexecutedRanges
        : reduced.unexecutedRanges.slice(0, -1).reduceRight((all, range) => {
            if (exports.containsRange(all[0], range)) {
                return all;
            }
            return [range, ...all];
        }, [reduced.unexecutedRanges[reduced.unexecutedRanges.length - 1]]);
    return containedRangesExcluded;
};

},{"../../format/hex":28,"../../vm/instruction-sets/instruction-sets-utils":91,"../compiler":44}],48:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./compile"), exports);
__exportStar(require("./language-utils"), exports);
__exportStar(require("./language-types"), exports);
__exportStar(require("./parse"), exports);
__exportStar(require("./reduce"), exports);
__exportStar(require("./resolve"), exports);

},{"./compile":45,"./language-types":46,"./language-utils":47,"./parse":49,"./reduce":51,"./resolve":52}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScript = void 0;
const parsimmon_1 = require("./parsimmon");
/* eslint-disable sort-keys, @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const authenticationScriptParser = parsimmon_1.P.createLanguage({
    script: (r) => parsimmon_1.P.seqMap(parsimmon_1.P.optWhitespace, r.expression.sepBy(parsimmon_1.P.optWhitespace), parsimmon_1.P.optWhitespace, (_, expressions) => expressions).node('Script'),
    expression: (r) => parsimmon_1.P.alt(r.comment, r.push, r.evaluation, r.utf8, r.binary, r.hex, r.bigint, r.identifier),
    comment: (r) => parsimmon_1.P.alt(r.singleLineComment, r.multiLineComment).node('Comment'),
    singleLineComment: () => parsimmon_1.P.seqMap(parsimmon_1.P.string('//').desc("the start of a single-line comment ('//')"), parsimmon_1.P.regexp(/[^\n]*/u), (__, comment) => comment.trim()),
    multiLineComment: () => parsimmon_1.P.seqMap(parsimmon_1.P.string('/*').desc("the start of a multi-line comment ('/*')"), parsimmon_1.P.regexp(/[\s\S]*?\*\//u).desc("the end of this multi-line comment ('*/')"), (__, comment) => comment.slice(0, -'*/'.length).trim()),
    push: (r) => parsimmon_1.P.seqMap(parsimmon_1.P.string('<').desc("the start of a push statement ('<')"), r.script, parsimmon_1.P.string('>').desc("the end of this push statement ('>')"), (_, push) => push).node('Push'),
    evaluation: (r) => parsimmon_1.P.seqMap(parsimmon_1.P.string('$').desc("the start of an evaluation ('$')"), parsimmon_1.P.string('(').desc("the opening parenthesis of this evaluation ('(')"), r.script, parsimmon_1.P.string(')').desc("the closing parenthesis of this evaluation (')')"), (_, __, evaluation) => evaluation).node('Evaluation'),
    identifier: () => parsimmon_1.P.regexp(/[a-zA-Z_][.a-zA-Z0-9_-]*/u)
        .desc('a valid identifier')
        .node('Identifier'),
    utf8: () => parsimmon_1.P.alt(parsimmon_1.P.seqMap(parsimmon_1.P.string('"').desc('a double quote (")'), parsimmon_1.P.regexp(/[^"]*/u), parsimmon_1.P.string('"').desc('a closing double quote (")'), (__, literal) => literal), parsimmon_1.P.seqMap(parsimmon_1.P.string("'").desc("a single quote (')"), parsimmon_1.P.regexp(/[^']*/u), parsimmon_1.P.string("'").desc("a closing single quote (')"), (__, literal) => literal)).node('UTF8Literal'),
    hex: () => parsimmon_1.P.seqMap(parsimmon_1.P.string('0x').desc("a hex literal ('0x...')"), parsimmon_1.P.regexp(/[0-9a-f]_*(?:_*[0-9a-f]_*[0-9a-f]_*)*[0-9a-f]/iu).desc('a valid hexadecimal string'), (__, literal) => literal).node('HexLiteral'),
    binary: () => parsimmon_1.P.seqMap(parsimmon_1.P.string('0b').desc("a binary literal ('0b...')"), parsimmon_1.P.regexp(/[01]+(?:[01_]*[01]+)*/iu).desc('a string of binary digits'), (__, literal) => literal).node('BinaryLiteral'),
    bigint: () => parsimmon_1.P.regexp(/-?[0-9]+(?:[0-9_]*[0-9]+)*/u)
        .desc('an integer literal')
        .node('BigIntLiteral'),
});
/* eslint-enable sort-keys, @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
exports.parseScript = (script) => authenticationScriptParser.script.parse(script);

},{"./parsimmon":50}],50:[function(require,module,exports){
"use strict";
/**
 * This file is derived from https://github.com/jneen/parsimmon and
 * https://github.com/DefinitelyTyped/DefinitelyTyped.
 */
/* eslint-disable prefer-destructuring, @typescript-eslint/unified-signatures, functional/no-method-signature, functional/no-throw-statement, functional/no-conditional-statement, @typescript-eslint/no-this-alias, consistent-this, @typescript-eslint/ban-ts-comment, prefer-spread, @typescript-eslint/restrict-template-expressions, func-names, @typescript-eslint/init-declarations, new-cap, @typescript-eslint/require-array-sort-compare, guard-for-in, no-plusplus, functional/no-let, functional/no-loop-statement, @typescript-eslint/prefer-for-of, @typescript-eslint/restrict-plus-operands, functional/immutable-data, @typescript-eslint/no-use-before-define, @typescript-eslint/strict-boolean-expressions, no-param-reassign, functional/no-expression-statement, functional/no-this-expression, @typescript-eslint/no-explicit-any, func-style, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/naming-convention, @typescript-eslint/method-signature-style */
// cspell: ignore accum
Object.defineProperty(exports, "__esModule", { value: true });
exports.P = void 0;
function Parsimmon(action) {
    // @ts-expect-error
    if (!(this instanceof Parsimmon)) {
        // @ts-expect-error
        return new Parsimmon(action);
    }
    // @ts-expect-error
    this._ = action;
}
const _ = Parsimmon.prototype;
// -*- Helpers -*-
function makeSuccess(index, value) {
    return {
        expected: [],
        furthest: -1,
        index,
        status: true,
        value,
    };
}
function makeFailure(index, expected) {
    expected = [expected];
    return {
        expected,
        furthest: index,
        index: -1,
        status: false,
        value: null,
    };
}
function mergeReplies(result, last) {
    if (!last) {
        return result;
    }
    if (result.furthest > last.furthest) {
        return result;
    }
    const expected = result.furthest === last.furthest
        ? union(result.expected, last.expected)
        : last.expected;
    return {
        expected,
        furthest: last.furthest,
        index: result.index,
        status: result.status,
        value: result.value,
    };
}
function makeLineColumnIndex(input, i) {
    const lines = input.slice(0, i).split('\n');
    /*
     * Note that unlike the character offset, the line and column offsets are
     * 1-based.
     */
    const lineWeAreUpTo = lines.length;
    const columnWeAreUpTo = lines[lines.length - 1].length + 1;
    return {
        column: columnWeAreUpTo,
        line: lineWeAreUpTo,
        offset: i,
    };
}
// Returns the sorted set union of two arrays of strings
function union(xs, ys) {
    const obj = {};
    for (let i = 0; i < xs.length; i++) {
        // @ts-expect-error
        obj[xs[i]] = true;
    }
    for (let j = 0; j < ys.length; j++) {
        // @ts-expect-error
        obj[ys[j]] = true;
    }
    const keys = [];
    for (const k in obj) {
        keys.push(k);
    }
    keys.sort();
    return keys;
}
// -*- Error Formatting -*-
function flags(re) {
    const s = String(re);
    return s.slice(s.lastIndexOf('/') + 1);
}
function anchoredRegexp(re) {
    return RegExp(`^(?:${re.source})`, flags(re));
}
// -*- Combinators -*-
function seq(...params) {
    const parsers = [].slice.call(params);
    const numParsers = parsers.length;
    return Parsimmon(function (input, i) {
        let result;
        const accum = new Array(numParsers);
        for (let j = 0; j < numParsers; j += 1) {
            result = mergeReplies(parsers[j]._(input, i), result);
            if (!result.status) {
                return result;
            }
            accum[j] = result.value;
            i = result.index;
        }
        return mergeReplies(makeSuccess(i, accum), result);
    });
}
function seqMap(...params) {
    const args = [].slice.call(params);
    const mapper = args.pop();
    return seq.apply(null, args).map(function (results) {
        // @ts-expect-error
        return mapper.apply(null, results);
    });
}
function createLanguage(parsers) {
    const language = {};
    for (const key in parsers) {
        (function (rule) {
            const func = function () {
                // @ts-expect-error
                return parsers[rule](language);
            };
            // @ts-expect-error
            language[rule] = lazy(func);
        })(key);
    }
    return language;
}
function alt(...params) {
    const parsers = [].slice.call(params);
    return Parsimmon(function (input, i) {
        let result;
        for (let j = 0; j < parsers.length; j += 1) {
            result = mergeReplies(parsers[j]._(input, i), result);
            if (result.status) {
                return result;
            }
        }
        return result;
    });
}
function sepBy(parser, separator) {
    return sepBy1(parser, separator).or(succeed([]));
}
function sepBy1(parser, separator) {
    const pairs = separator.then(parser).many();
    return seqMap(parser, pairs, function (r, rs) {
        return [r].concat(rs);
    });
}
// -*- Core Parsing Methods -*-
_.parse = function (input) {
    const result = this.skip(eof)._(input, 0);
    if (result.status) {
        return {
            status: true,
            value: result.value,
        };
    }
    return {
        expected: result.expected,
        index: makeLineColumnIndex(input, result.furthest),
        status: false,
    };
};
// -*- Other Methods -*-
_.or = function (alternative) {
    return alt(this, alternative);
};
_.then = function (next) {
    return seq(this, next).map(function (results) {
        return results[1];
    });
};
_.many = function () {
    const self = this;
    return Parsimmon(function (input, i) {
        const accum = [];
        let result;
        for (;;) {
            result = mergeReplies(self._(input, i), result);
            if (result.status) {
                /* istanbul ignore if */ if (i === result.index) {
                    throw new Error('infinite loop detected in .many() parser --- calling .many() on ' +
                        'a parser which can accept zero characters is usually the cause');
                }
                i = result.index;
                accum.push(result.value);
            }
            else {
                return mergeReplies(makeSuccess(i, accum), result);
            }
        }
    });
};
_.map = function (fn) {
    const self = this;
    return Parsimmon(function (input, i) {
        const result = self._(input, i);
        if (!result.status) {
            return result;
        }
        return mergeReplies(makeSuccess(result.index, fn(result.value)), result);
    });
};
_.skip = function (next) {
    return seq(this, next).map(function (results) {
        return results[0];
    });
};
_.node = function (name) {
    return seqMap(index, this, index, function (start, value, end) {
        return {
            end,
            name,
            start,
            value,
        };
    });
};
_.sepBy = function (separator) {
    return sepBy(this, separator);
};
_.desc = function (expected) {
    expected = [expected];
    const self = this;
    return Parsimmon(function (input, i) {
        const reply = self._(input, i);
        if (!reply.status) {
            reply.expected = expected;
        }
        return reply;
    });
};
// -*- Constructors -*-
function string(str) {
    const expected = `'${str}'`;
    return Parsimmon(function (input, i) {
        const j = i + str.length;
        const head = input.slice(i, j);
        if (head === str) {
            return makeSuccess(j, head);
        }
        return makeFailure(i, expected);
    });
}
function regexp(re, group = 0) {
    const anchored = anchoredRegexp(re);
    const expected = String(re);
    return Parsimmon(function (input, i) {
        const match = anchored.exec(input.slice(i));
        if (match) {
            const fullMatch = match[0];
            const groupMatch = match[group];
            return makeSuccess(i + fullMatch.length, groupMatch);
        }
        return makeFailure(i, expected);
    });
}
function succeed(value) {
    return Parsimmon(function (__, i) {
        return makeSuccess(i, value);
    });
}
function lazy(f) {
    const parser = Parsimmon(function (input, i) {
        parser._ = f()._;
        return parser._(input, i);
    });
    return parser;
}
// -*- Base Parsers -*-
const index = Parsimmon(function (input, i) {
    return makeSuccess(i, makeLineColumnIndex(input, i));
});
const eof = Parsimmon(function (input, i) {
    if (i < input.length) {
        return makeFailure(i, 'EOF');
    }
    return makeSuccess(i, null);
});
const optWhitespace = regexp(/\s*/u).desc('optional whitespace');
const whitespace = regexp(/\s+/u).desc('whitespace');
exports.P = {
    alt,
    createLanguage,
    index,
    lazy,
    makeFailure,
    makeSuccess,
    of: succeed,
    optWhitespace,
    regexp,
    sepBy,
    sepBy1,
    seq,
    seqMap,
    string,
    succeed,
    whitespace,
};

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceScript = exports.verifyBtlEvaluationState = void 0;
const format_1 = require("../../format/format");
const instruction_sets_1 = require("../../vm/instruction-sets/instruction-sets");
const language_utils_1 = require("./language-utils");
const emptyReductionTraceNode = (range) => ({
    bytecode: Uint8Array.of(),
    range,
});
/**
 * Perform the standard verification of BTL evaluation results. This ensures
 * that evaluations complete as expected: if an error occurs while computing an
 * evaluation, script compilation should fail.
 *
 * Three requirements are enforced:
 * - the evaluation may not produce an `error`
 * - the resulting stack must contain exactly 1 item
 * - the resulting execution stack must be empty (no missing `OP_ENDIF`s)
 *
 * This differs from the virtual machine's built-in `vm.verify` in that it is
 * often more lenient, for example, evaluations can succeed with an non-truthy
 * value on top of the stack.
 *
 * @param state - the final program state to verify
 */
exports.verifyBtlEvaluationState = (state) => {
    if (state.error !== undefined) {
        return state.error;
    }
    if (state.executionStack.length !== 0) {
        return instruction_sets_1.AuthenticationErrorCommon.nonEmptyExecutionStack;
    }
    if (state.stack.length !== 1) {
        return instruction_sets_1.AuthenticationErrorCommon.requiresCleanStack;
    }
    return true;
};
/**
 * Reduce a resolved script, returning the resulting bytecode and a trace of the
 * reduction process.
 *
 * This method will return an error if provided a `resolvedScript` with
 * resolution errors. To check for resolution errors, use `getResolutionErrors`.
 *
 * @param resolvedScript - the `CompiledScript` to reduce
 * @param vm - the `AuthenticationVirtualMachine` to use for evaluations
 * @param createEvaluationProgram - a method which accepts the compiled bytecode
 * of an evaluation and returns the authentication program used to evaluate it
 */
exports.reduceScript = (resolvedScript, vm, createEvaluationProgram) => {
    const script = resolvedScript.map((segment) => {
        switch (segment.type) {
            case 'bytecode':
                return { bytecode: segment.value, range: segment.range };
            case 'push': {
                const push = exports.reduceScript(segment.value, vm, createEvaluationProgram);
                const bytecode = instruction_sets_1.encodeDataPush(push.bytecode);
                return Object.assign(Object.assign({ bytecode }, (push.errors === undefined ? undefined : { errors: push.errors })), { push, range: segment.range });
            }
            case 'evaluation': {
                if (typeof vm === 'undefined' ||
                    typeof createEvaluationProgram === 'undefined') {
                    return Object.assign({ errors: [
                            {
                                error: 'Both a VM and a createState method are required to reduce evaluations.',
                                range: segment.range,
                            },
                        ] }, emptyReductionTraceNode(segment.range));
                }
                const reductionTrace = exports.reduceScript(segment.value, vm, createEvaluationProgram);
                if (reductionTrace.errors !== undefined) {
                    return Object.assign(Object.assign({}, emptyReductionTraceNode(segment.range)), { errors: reductionTrace.errors, source: reductionTrace, trace: [] });
                }
                const trace = vm.debug(createEvaluationProgram(reductionTrace.bytecode));
                /**
                 * `vm.debug` should always return at least one state.
                 */
                const lastState = trace[trace.length - 1];
                const result = exports.verifyBtlEvaluationState(lastState);
                const bytecode = lastState.stack[lastState.stack.length - 1];
                return Object.assign(Object.assign({}, (typeof result === 'string'
                    ? {
                        bytecode: Uint8Array.of(),
                        errors: [
                            {
                                error: `Failed to reduce evaluation: ${result}`,
                                range: segment.range,
                            },
                        ],
                    }
                    : {
                        bytecode,
                    })), { range: segment.range, source: reductionTrace, trace });
            }
            case 'comment':
                return emptyReductionTraceNode(segment.range);
            case 'error':
                return Object.assign({ errors: [
                        {
                            error: `Tried to reduce a BTL script with resolution errors: ${segment.value}`,
                            range: segment.range,
                        },
                    ] }, emptyReductionTraceNode(segment.range));
            // eslint-disable-next-line functional/no-conditional-statement
            default:
                // eslint-disable-next-line functional/no-throw-statement, @typescript-eslint/no-throw-literal, no-throw-literal
                throw new Error(`"${segment.type}" is not a known segment type.`);
        }
    });
    const reduction = script.reduce((all, segment) => (Object.assign({ bytecode: [...all.bytecode, segment.bytecode], ranges: [...all.ranges, segment.range] }, (all.errors !== undefined || segment.errors !== undefined
        ? {
            errors: [
                ...(all.errors === undefined ? [] : all.errors),
                ...(segment.errors === undefined ? [] : segment.errors),
            ],
        }
        : undefined))), { bytecode: [], ranges: [] });
    return Object.assign(Object.assign({}, (reduction.errors === undefined
        ? undefined
        : { errors: reduction.errors })), { bytecode: format_1.flattenBinArray(reduction.bytecode), range: language_utils_1.mergeRanges(reduction.ranges, resolvedScript.length === 0 ? undefined : resolvedScript[0].range), script });
};

},{"../../format/format":27,"../../vm/instruction-sets/instruction-sets":92,"./language-utils":47}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdentifierResolver = exports.resolveScriptIdentifier = exports.resolveVariableIdentifier = exports.BuiltInVariables = exports.resolveScriptSegment = void 0;
const format_1 = require("../../format/format");
const instruction_sets_1 = require("../../vm/instruction-sets/instruction-sets");
const compile_1 = require("./compile");
const language_types_1 = require("./language-types");
const language_utils_1 = require("./language-utils");
const pluckRange = (node) => ({
    endColumn: node.end.column,
    endLineNumber: node.end.line,
    startColumn: node.start.column,
    startLineNumber: node.start.line,
});
const removeNumericSeparators = (numericLiteral) => numericLiteral.replace(/_/gu, '');
exports.resolveScriptSegment = (segment, resolveIdentifiers) => {
    // eslint-disable-next-line complexity
    const resolved = segment.value.map((child) => {
        const range = pluckRange(child);
        switch (child.name) {
            case 'Identifier': {
                const identifier = child.value;
                const result = resolveIdentifiers(identifier);
                const ret = result.status
                    ? Object.assign({ range, type: 'bytecode', value: result.bytecode }, (result.type === language_types_1.IdentifierResolutionType.opcode
                        ? {
                            opcode: identifier,
                        }
                        : result.type === language_types_1.IdentifierResolutionType.variable
                            ? Object.assign(Object.assign(Object.assign({}, ('debug' in result ? { debug: result.debug } : {})), ('signature' in result
                                ? { signature: result.signature }
                                : {})), { variable: identifier }) : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            result.type === language_types_1.IdentifierResolutionType.script
                                ? { script: identifier, source: result.source }
                                : { unknown: identifier })) : Object.assign(Object.assign(Object.assign({}, ('debug' in result ? { debug: result.debug } : {})), ('recoverable' in result && result.recoverable
                    ? {
                        missingIdentifier: identifier,
                        owningEntity: result.entityOwnership,
                    }
                    : {})), { range, type: 'error', value: result.error });
                return ret;
            }
            case 'Push':
                return {
                    range,
                    type: 'push',
                    value: exports.resolveScriptSegment(child.value, resolveIdentifiers),
                };
            case 'Evaluation':
                return {
                    range,
                    type: 'evaluation',
                    value: exports.resolveScriptSegment(child.value, resolveIdentifiers),
                };
            case 'BigIntLiteral':
                return {
                    literal: child.value,
                    literalType: 'BigIntLiteral',
                    range,
                    type: 'bytecode',
                    value: instruction_sets_1.bigIntToScriptNumber(BigInt(removeNumericSeparators(child.value))),
                };
            case 'BinaryLiteral':
                return {
                    literal: child.value,
                    literalType: 'BinaryLiteral',
                    range,
                    type: 'bytecode',
                    value: instruction_sets_1.bigIntToScriptNumber(BigInt(`0b${removeNumericSeparators(child.value)}`)),
                };
            case 'HexLiteral':
                return {
                    literal: child.value,
                    literalType: 'HexLiteral',
                    range,
                    type: 'bytecode',
                    value: format_1.hexToBin(removeNumericSeparators(child.value)),
                };
            case 'UTF8Literal':
                return {
                    literal: child.value,
                    literalType: 'UTF8Literal',
                    range,
                    type: 'bytecode',
                    value: format_1.utf8ToBin(child.value),
                };
            case 'Comment':
                return {
                    range,
                    type: 'comment',
                    value: child.value,
                };
            default:
                return {
                    range,
                    type: 'error',
                    value: `Unrecognized segment: ${child.name}`,
                };
        }
    });
    return resolved.length === 0
        ? [{ range: pluckRange(segment), type: 'comment', value: '' }]
        : resolved;
};
var BuiltInVariables;
(function (BuiltInVariables) {
    BuiltInVariables["currentBlockTime"] = "current_block_time";
    BuiltInVariables["currentBlockHeight"] = "current_block_height";
    BuiltInVariables["signingSerialization"] = "signing_serialization";
})(BuiltInVariables = exports.BuiltInVariables || (exports.BuiltInVariables = {}));
const attemptCompilerOperation = ({ data, environment, identifier, matchingOperations, operationExample = 'operation_identifier', operationId, variableId, variableType, }) => {
    if (matchingOperations === undefined) {
        return {
            error: `The "${variableId}" variable type can not be resolved because the "${variableType}" operation has not been included in this compiler's CompilationEnvironment.`,
            status: 'error',
        };
    }
    if (typeof matchingOperations === 'function') {
        const operation = matchingOperations;
        return operation(identifier, data, environment);
    }
    if (operationId === undefined) {
        return {
            error: `This "${variableId}" variable could not be resolved because this compiler's "${variableType}" operations require an operation identifier, e.g. '${variableId}.${operationExample}'.`,
            status: 'error',
        };
    }
    const operation = matchingOperations[operationId];
    if (operation === undefined) {
        return {
            error: `The identifier "${identifier}" could not be resolved because the "${variableId}.${operationId}" operation is not available to this compiler.`,
            status: 'error',
        };
    }
    return operation(identifier, data, environment);
};
/**
 * If the identifer can be successfully resolved as a variable, the result is
 * returned as a Uint8Array. If the identifier references a known variable, but
 * an error occurs in resolving it, the error is returned as a string.
 * Otherwise, the identifier is not recognized as a variable, and this method
 * simply returns `false`.
 *
 * @param identifier - The full identifier used to describe this operation, e.g.
 * `owner.signature.all_outputs`.
 * @param data - The `CompilationData` provided to the compiler
 * @param environment - The `CompilationEnvironment` provided to the compiler
 */
exports.resolveVariableIdentifier = ({ data, environment, identifier, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const [variableId, operationId] = identifier.split('.');
    switch (variableId) {
        case BuiltInVariables.currentBlockHeight:
            return attemptCompilerOperation({
                data,
                environment,
                identifier,
                matchingOperations: (_a = environment.operations) === null || _a === void 0 ? void 0 : _a.currentBlockHeight,
                operationId,
                variableId,
                variableType: 'currentBlockHeight',
            });
        case BuiltInVariables.currentBlockTime:
            return attemptCompilerOperation({
                data,
                environment,
                identifier,
                matchingOperations: (_b = environment.operations) === null || _b === void 0 ? void 0 : _b.currentBlockTime,
                operationId,
                variableId,
                variableType: 'currentBlockTime',
            });
        case BuiltInVariables.signingSerialization:
            return attemptCompilerOperation({
                data,
                environment,
                identifier,
                matchingOperations: (_c = environment.operations) === null || _c === void 0 ? void 0 : _c.signingSerialization,
                operationExample: 'version',
                operationId,
                variableId,
                variableType: 'signingSerialization',
            });
        default: {
            const expectedVariable = (_d = environment.variables) === null || _d === void 0 ? void 0 : _d[variableId];
            if (expectedVariable === undefined) {
                return { status: 'skip' };
            }
            return attemptCompilerOperation(Object.assign({ data,
                environment,
                identifier,
                operationId,
                variableId }, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                AddressData: {
                    matchingOperations: (_e = environment.operations) === null || _e === void 0 ? void 0 : _e.addressData,
                    variableType: 'addressData',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                HdKey: {
                    matchingOperations: (_f = environment.operations) === null || _f === void 0 ? void 0 : _f.hdKey,
                    operationExample: 'public_key',
                    variableType: 'hdKey',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Key: {
                    matchingOperations: (_g = environment.operations) === null || _g === void 0 ? void 0 : _g.key,
                    operationExample: 'public_key',
                    variableType: 'key',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                WalletData: {
                    matchingOperations: (_h = environment.operations) === null || _h === void 0 ? void 0 : _h.walletData,
                    variableType: 'walletData',
                },
            }[expectedVariable.type]));
        }
    }
};
/**
 * Compile an internal script identifier.
 *
 * @remarks
 * If the identifer can be successfully resolved as a script, the script is
 * compiled and returned as a CompilationResultSuccess. If an error occurs in
 * compiling it, the error is returned as a string.
 *
 * Otherwise, the identifier is not recognized as a script, and this method
 * simply returns `false`.
 *
 * @param identifier - the identifier of the script to be resolved
 * @param data - the provided CompilationData
 * @param environment - the provided CompilationEnvironment
 * @param parentIdentifier - the identifier of the script which references the
 * script being resolved (for detecting circular dependencies)
 */
exports.resolveScriptIdentifier = ({ data, environment, identifier, }) => {
    if (environment.scripts[identifier] === undefined) {
        return false;
    }
    const result = compile_1.compileScriptRaw({ data, environment, scriptId: identifier });
    if (result.success) {
        return result;
    }
    return `Compilation error in resolved script "${identifier}": ${language_utils_1.stringifyErrors(result.errors)}`;
    /*
     * result.errors.reduce(
     *   (all, { error, range }) =>
     *     `${
     *       all === '' ? '' : `${all}; `
     *     } [${
     *       range.startLineNumber
     *     }, ${range.startColumn}]: ${error}`,
     *   ''
     * );
     */
};
/**
 * Return an `IdentifierResolutionFunction` for use in `resolveScriptSegment`.
 *
 * @param scriptId - the `id` of the script for which the resulting
 * `IdentifierResolutionFunction` will be used.
 * @param environment - a snapshot of the context around `scriptId`. See
 * `CompilationEnvironment` for details.
 * @param data - the actual variable values (private keys, shared wallet data,
 * shared address data, etc.) to use in resolving variables.
 */
exports.createIdentifierResolver = ({ data, environment, }) => 
// eslint-disable-next-line complexity
(identifier) => {
    var _a;
    const opcodeResult = (_a = environment.opcodes) === null || _a === void 0 ? void 0 : _a[identifier];
    if (opcodeResult !== undefined) {
        return {
            bytecode: opcodeResult,
            status: true,
            type: language_types_1.IdentifierResolutionType.opcode,
        };
    }
    const variableResult = exports.resolveVariableIdentifier({
        data,
        environment,
        identifier,
    });
    if (variableResult.status !== 'skip') {
        return variableResult.status === 'error'
            ? Object.assign(Object.assign(Object.assign(Object.assign({}, ('debug' in variableResult
                ? { debug: variableResult.debug }
                : {})), { error: variableResult.error }), (environment.entityOwnership === undefined
                ? {}
                : {
                    entityOwnership: environment.entityOwnership[identifier.split('.')[0]],
                })), { recoverable: 'recoverable' in variableResult, status: false, type: language_types_1.IdentifierResolutionErrorType.variable }) : Object.assign(Object.assign(Object.assign(Object.assign({}, ('debug' in variableResult
            ? { debug: variableResult.debug }
            : {})), { bytecode: variableResult.bytecode }), ('signature' in variableResult
            ? {
                signature: variableResult.signature,
            }
            : {})), { status: true, type: language_types_1.IdentifierResolutionType.variable });
    }
    const scriptResult = exports.resolveScriptIdentifier({
        data,
        environment,
        identifier,
    });
    if (scriptResult !== false) {
        return typeof scriptResult === 'string'
            ? {
                error: scriptResult,
                scriptId: identifier,
                status: false,
                type: language_types_1.IdentifierResolutionErrorType.script,
            }
            : {
                bytecode: scriptResult.bytecode,
                source: scriptResult.resolve,
                status: true,
                type: language_types_1.IdentifierResolutionType.script,
            };
    }
    return {
        error: `Unknown identifier "${identifier}".`,
        status: false,
        type: language_types_1.IdentifierResolutionErrorType.unknown,
    };
};

},{"../../format/format":27,"../../vm/instruction-sets/instruction-sets":92,"./compile":45,"./language-types":46,"./language-utils":47}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScenarioCommon = exports.extendCompilationDataWithScenarioBytecode = exports.extendedScenarioDefinitionToCompilationData = exports.generateExtendedScenario = exports.extendScenarioDefinition = exports.extendScenarioDefinitionData = exports.generateDefaultScenarioDefinition = void 0;
const hex_1 = require("../format/hex");
const numbers_1 = require("../format/numbers");
const hd_key_1 = require("../key/hd-key");
const compiler_defaults_1 = require("./compiler-defaults");
const compile_1 = require("./language/compile");
const language_utils_1 = require("./language/language-utils");
/*
 * & {
 *   value: Uint8Array;
 * };
 */
/**
 * Given a compilation environment, generate the default scenario which is
 * extended by all the environments scenarios.
 *
 * For details on default scenario generation, see
 * `AuthenticationTemplateScenario.extends`.
 *
 * @param environment - the compilation environment from which to generate the
 * default scenario
 */
// eslint-disable-next-line complexity
exports.generateDefaultScenarioDefinition = (environment) => {
    const { variables, entityOwnership } = environment;
    const keyVariableIds = variables === undefined
        ? []
        : Object.entries(variables)
            .filter((entry) => entry[1].type === 'Key')
            .map(([id]) => id);
    const entityIds = entityOwnership === undefined
        ? []
        : Object.keys(Object.values(entityOwnership).reduce((all, entityId) => (Object.assign(Object.assign({}, all), { [entityId]: true })), {}));
    const valueMap = [...keyVariableIds, ...entityIds]
        .sort(([idA], [idB]) => idA.localeCompare(idB))
        .reduce((all, id, index) => (Object.assign(Object.assign({}, all), { [id]: numbers_1.bigIntToBinUint256BEClamped(BigInt(index + 1)) })), {});
    const privateKeys = variables === undefined
        ? undefined
        : Object.entries(variables).reduce((all, [variableId, variable]) => variable.type === 'Key'
            ? Object.assign(Object.assign({}, all), { [variableId]: hex_1.binToHex(valueMap[variableId]) }) : all, {});
    const defaultScenario = {
        data: Object.assign({ currentBlockHeight: compiler_defaults_1.CompilerDefaults.defaultScenarioCurrentBlockHeight, currentBlockTime: compiler_defaults_1.CompilerDefaults.defaultScenarioCurrentBlockTime }, (privateKeys === undefined || Object.keys(privateKeys).length === 0
            ? {}
            : { keys: { privateKeys } })),
        transaction: {
            inputs: [{ unlockingBytecode: null }],
            locktime: compiler_defaults_1.CompilerDefaults.defaultScenarioTransactionLocktime,
            outputs: [
                {
                    lockingBytecode: compiler_defaults_1.CompilerDefaults.defaultScenarioTransactionOutputsLockingBytecodeHex,
                },
            ],
            version: compiler_defaults_1.CompilerDefaults.defaultScenarioTransactionVersion,
        },
        value: compiler_defaults_1.CompilerDefaults.defaultScenarioValue,
    };
    const hasHdKeys = variables === undefined
        ? false
        : Object.values(variables).findIndex((variable) => variable.type === 'HdKey') !== -1;
    if (!hasHdKeys) {
        return defaultScenario;
    }
    const { sha256, sha512 } = environment;
    if (sha256 === undefined) {
        return 'An implementations of "sha256" is required to generate defaults for HD keys, but the "sha256" property is not included in this compilation environment.';
    }
    if (sha512 === undefined) {
        return 'An implementations of "sha512" is required to generate defaults for HD keys, but the "sha512" property is not included in this compilation environment.';
    }
    const crypto = { sha256, sha512 };
    const hdPrivateKeys = entityIds.reduce((all, entityId) => {
        /**
         * The first 5,000,000,000 seeds have been tested, scenarios are
         * unlikely to exceed this number of entities.
         */
        const assumeValid = true;
        const masterNode = hd_key_1.deriveHdPrivateNodeFromSeed(crypto, valueMap[entityId], assumeValid);
        const hdPrivateKey = hd_key_1.encodeHdPrivateKey(crypto, {
            network: 'mainnet',
            node: masterNode,
        });
        return Object.assign(Object.assign({}, all), { [entityId]: hdPrivateKey });
    }, {});
    return Object.assign(Object.assign({}, defaultScenario), { data: Object.assign(Object.assign({}, defaultScenario.data), { hdKeys: {
                addressIndex: compiler_defaults_1.CompilerDefaults.defaultScenarioAddressIndex,
                hdPrivateKeys,
            } }) });
};
/**
 * Extend the `data` property of a scenario definition with values from a parent
 * scenario definition. Returns the extended value for `data`.
 *
 * @param parentData - the scenario `data` which is extended by the child
 * scenario
 * @param childData - the scenario `data` which may override values from the
 * parent scenario
 */
// eslint-disable-next-line complexity
exports.extendScenarioDefinitionData = (parentData, childData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, parentData), childData), (parentData.bytecode === undefined && childData.bytecode === undefined
        ? {}
        : {
            bytecode: Object.assign(Object.assign({}, parentData.bytecode), childData.bytecode),
        })), (parentData.hdKeys === undefined && childData.hdKeys === undefined
        ? {}
        : {
            hdKeys: Object.assign(Object.assign(Object.assign(Object.assign({}, parentData.hdKeys), childData.hdKeys), (((_a = parentData.hdKeys) === null || _a === void 0 ? void 0 : _a.hdPrivateKeys) === undefined &&
                ((_b = childData.hdKeys) === null || _b === void 0 ? void 0 : _b.hdPrivateKeys) === undefined
                ? {}
                : {
                    hdPrivateKeys: Object.assign(Object.assign({}, (_c = parentData.hdKeys) === null || _c === void 0 ? void 0 : _c.hdPrivateKeys), (_d = childData.hdKeys) === null || _d === void 0 ? void 0 : _d.hdPrivateKeys),
                })), (((_e = parentData.hdKeys) === null || _e === void 0 ? void 0 : _e.hdPublicKeys) === undefined &&
                ((_f = childData.hdKeys) === null || _f === void 0 ? void 0 : _f.hdPublicKeys) === undefined
                ? {}
                : {
                    hdPublicKeys: Object.assign(Object.assign({}, (_g = parentData.hdKeys) === null || _g === void 0 ? void 0 : _g.hdPublicKeys), (_h = childData.hdKeys) === null || _h === void 0 ? void 0 : _h.hdPublicKeys),
                })),
        })), (parentData.keys === undefined && childData.keys === undefined
        ? {}
        : {
            keys: {
                privateKeys: Object.assign(Object.assign({}, (_j = parentData.keys) === null || _j === void 0 ? void 0 : _j.privateKeys), (_k = childData.keys) === null || _k === void 0 ? void 0 : _k.privateKeys),
            },
        }));
};
/**
 * Extend a child scenario definition with values from a parent scenario
 * definition. Returns the extended values for `data`, `transaction`, and
 * `value`.
 *
 * @param parentScenario - the scenario which is extended by the child scenario
 * @param childScenario - the scenario which may override values from the parent
 * scenario
 */
// eslint-disable-next-line complexity
exports.extendScenarioDefinition = (parentScenario, childScenario) => {
    var _a, _b, _c;
    return Object.assign(Object.assign(Object.assign({}, (parentScenario.data === undefined && childScenario.data === undefined
        ? {}
        : {
            data: exports.extendScenarioDefinitionData((_a = parentScenario.data) !== null && _a !== void 0 ? _a : {}, (_b = childScenario.data) !== null && _b !== void 0 ? _b : {}),
        })), (parentScenario.transaction === undefined &&
        childScenario.transaction === undefined
        ? {}
        : {
            transaction: Object.assign(Object.assign({}, parentScenario.transaction), childScenario.transaction),
        })), (parentScenario.value === undefined && childScenario.value === undefined
        ? {}
        : { value: (_c = childScenario.value) !== null && _c !== void 0 ? _c : parentScenario.value }));
};
/**
 * Generate the full scenario which is extended by the provided scenario
 * identifier. Scenarios for which `extends` is `undefined` extend the default
 * scenario for the provided compilation environment.
 *
 * @param scenarioId - the identifier of the scenario for from which to select
 * the extended scenario
 * @param environment - the compilation environment from which to generate the
 * extended scenario
 * @param sourceScenarioIds - an array of scenario identifiers indicating the
 * path taken to arrive at the current scenario - used to detect and prevent
 * cycles in extending scenarios (defaults to `[]`)
 */
// eslint-disable-next-line complexity
exports.generateExtendedScenario = ({ environment, scenarioId, sourceScenarioIds = [], }) => {
    var _a;
    if (scenarioId === undefined) {
        return exports.generateDefaultScenarioDefinition(environment);
    }
    if (sourceScenarioIds.includes(scenarioId)) {
        return `Cannot extend scenario "${scenarioId}": scenario "${scenarioId}" extends itself. Scenario inheritance path: ${sourceScenarioIds.join(' → ')}`;
    }
    const scenario = (_a = environment.scenarios) === null || _a === void 0 ? void 0 : _a[scenarioId];
    if (scenario === undefined) {
        return `Cannot extend scenario "${scenarioId}": a scenario with the identifier ${scenarioId} is not included in this compilation environment.`;
    }
    const parentScenario = scenario.extends === undefined
        ? exports.generateDefaultScenarioDefinition(environment)
        : exports.generateExtendedScenario({
            environment,
            scenarioId: scenario.extends,
            sourceScenarioIds: [...sourceScenarioIds, scenarioId],
        });
    if (typeof parentScenario === 'string') {
        return parentScenario;
    }
    return exports.extendScenarioDefinition(parentScenario, scenario);
};
/**
 * Derive standard `CompilationData` properties from an extended scenario
 * definition.
 * @param definition - a scenario definition which has been extended by the
 * default scenario definition
 */
// eslint-disable-next-line complexity
exports.extendedScenarioDefinitionToCompilationData = (definition) => {
    var _a;
    return (Object.assign(Object.assign(Object.assign(Object.assign({}, (definition.data.currentBlockHeight === undefined
        ? {}
        : {
            currentBlockHeight: definition.data.currentBlockHeight,
        })), (definition.data.currentBlockTime === undefined
        ? {}
        : {
            currentBlockTime: definition.data.currentBlockTime,
        })), (definition.data.hdKeys === undefined
        ? {}
        : {
            hdKeys: Object.assign(Object.assign(Object.assign({}, (definition.data.hdKeys.addressIndex === undefined
                ? {}
                : {
                    addressIndex: definition.data.hdKeys.addressIndex,
                })), (definition.data.hdKeys.hdPrivateKeys !== undefined &&
                Object.keys(definition.data.hdKeys.hdPrivateKeys).length > 0
                ? {
                    hdPrivateKeys: definition.data.hdKeys.hdPrivateKeys,
                }
                : {})), (definition.data.hdKeys.hdPublicKeys === undefined
                ? {}
                : {
                    hdPublicKeys: definition.data.hdKeys.hdPublicKeys,
                })),
        })), (((_a = definition.data.keys) === null || _a === void 0 ? void 0 : _a.privateKeys) !== undefined &&
        Object.keys(definition.data.keys.privateKeys).length > 0
        ? {
            keys: {
                privateKeys: Object.entries(definition.data.keys.privateKeys).reduce((all, [id, hex]) => (Object.assign(Object.assign({}, all), { [id]: hex_1.hexToBin(hex) })), {}),
            },
        }
        : {})));
};
/**
 * Extend a `CompilationData` object with the compiled result of the bytecode
 * scripts provided by a `AuthenticationTemplateScenarioData`.
 *
 * @param compilationData - the compilation data to extend
 * @param environment - the compilation environment in which to compile the
 * scripts
 * @param scenarioDataBytecodeScripts - the `data.bytecode` property of an
 * `AuthenticationTemplateScenarioData`
 */
exports.extendCompilationDataWithScenarioBytecode = ({ compilationData, environment, scenarioDataBytecodeScripts, }) => {
    const prefixBytecodeScriptId = (id) => `${compiler_defaults_1.CompilerDefaults.scenarioBytecodeScriptPrefix}${id}`;
    const bytecodeScripts = Object.entries(scenarioDataBytecodeScripts).reduce((all, [id, script]) => {
        return Object.assign(Object.assign({}, all), { [prefixBytecodeScriptId(id)]: script });
    }, {});
    const bytecodeScriptExtendedEnvironment = Object.assign(Object.assign({}, environment), { scripts: Object.assign(Object.assign({}, environment.scripts), bytecodeScripts) });
    const bytecodeCompilations = Object.keys(scenarioDataBytecodeScripts).map((id) => {
        const result = compile_1.compileScriptRaw({
            data: compilationData,
            environment: bytecodeScriptExtendedEnvironment,
            scriptId: prefixBytecodeScriptId(id),
        });
        if (result.success) {
            return {
                bytecode: result.bytecode,
                id,
            };
        }
        return {
            errors: result.errors,
            id,
        };
    });
    const failedResults = bytecodeCompilations.filter((result) => 'errors' in result);
    if (failedResults.length > 0) {
        return `${failedResults
            .map((result) => `Compilation error while generating bytecode for "${result.id}": ${language_utils_1.stringifyErrors(result.errors)}`)
            .join('; ')}`;
    }
    const compiledBytecode = bytecodeCompilations.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.bytecode })), {});
    return Object.assign(Object.assign({}, (Object.keys(compiledBytecode).length > 0
        ? { bytecode: compiledBytecode }
        : {})), compilationData);
};
/**
 * The default `lockingBytecode` value for scenario outputs is a new empty
 * object (`{}`).
 */
const getScenarioOutputDefaultLockingBytecode = () => ({});
/**
 * Generate a scenario given a compilation environment. If neither `scenarioId`
 * or `unlockingScriptId` are provided, the default scenario for the compilation
 * environment will be generated.
 *
 * Returns either the full `CompilationData` for the selected scenario or an
 * error message (as a `string`).
 *
 * @param scenarioId - the ID of the scenario to generate – if `undefined`, the
 * default scenario
 * @param unlockingScriptId - the ID of the unlocking script under test by this
 * scenario – if `undefined` but required by the scenario, an error will be
 * produced
 * @param environment - the compilation environment from which to generate the
 * scenario
 */
// eslint-disable-next-line complexity
exports.generateScenarioCommon = ({ environment, scenarioId, unlockingScriptId, }) => {
    var _a, _b;
    const { scenario, scenarioName } = scenarioId === undefined
        ? { scenario: {}, scenarioName: `the default scenario` }
        : {
            scenario: (_a = environment.scenarios) === null || _a === void 0 ? void 0 : _a[scenarioId],
            scenarioName: `scenario "${scenarioId}"`,
        };
    if (scenario === undefined) {
        return `Cannot generate ${scenarioName}: a scenario with the identifier ${scenarioId} is not included in this compilation environment.`;
    }
    const parentScenario = exports.generateExtendedScenario({ environment, scenarioId });
    if (typeof parentScenario === 'string') {
        return `Cannot generate ${scenarioName}: ${parentScenario}`;
    }
    const extendedScenario = exports.extendScenarioDefinition(parentScenario, scenario);
    const partialCompilationData = exports.extendedScenarioDefinitionToCompilationData(extendedScenario);
    const fullCompilationData = exports.extendCompilationDataWithScenarioBytecode({
        compilationData: partialCompilationData,
        environment,
        scenarioDataBytecodeScripts: (_b = extendedScenario.data.bytecode) !== null && _b !== void 0 ? _b : {},
    });
    if (typeof fullCompilationData === 'string') {
        return `Cannot generate ${scenarioName}: ${fullCompilationData}`;
    }
    const testedInputs = extendedScenario.transaction.inputs.filter((input) => input.unlockingBytecode === null);
    if (testedInputs.length !== 1) {
        return `Cannot generate ${scenarioName}: the specific input under test in this scenario is ambiguous – "transaction.inputs" must include exactly one input which has "unlockingBytecode" set to "null".`;
    }
    const testedInputIndex = extendedScenario.transaction.inputs.findIndex((input) => input.unlockingBytecode === null);
    const outputs = extendedScenario.transaction.outputs.map((output) => {
        var _a, _b;
        return ({
            lockingBytecode: (_a = output.lockingBytecode) !== null && _a !== void 0 ? _a : getScenarioOutputDefaultLockingBytecode(),
            satoshis: (_b = output.satoshis) !== null && _b !== void 0 ? _b : compiler_defaults_1.CompilerDefaults.defaultScenarioOutputSatoshis,
        });
    });
    const compiledOutputResults = outputs.map(
    // eslint-disable-next-line complexity
    (output, index) => {
        var _a, _b;
        const satoshis = typeof output.satoshis === 'string'
            ? hex_1.hexToBin(output.satoshis)
            : numbers_1.bigIntToBinUint64LE(BigInt(output.satoshis));
        if (typeof output.lockingBytecode === 'string') {
            return {
                lockingBytecode: hex_1.hexToBin(output.lockingBytecode),
                satoshis,
            };
        }
        const specifiedLockingScriptId = output.lockingBytecode.script;
        const impliedLockingScriptId = unlockingScriptId === undefined
            ? undefined
            : (_a = environment.unlockingScripts) === null || _a === void 0 ? void 0 : _a[unlockingScriptId];
        const scriptId = typeof specifiedLockingScriptId === 'string'
            ? specifiedLockingScriptId
            : impliedLockingScriptId;
        if (scriptId === undefined) {
            if (unlockingScriptId === undefined) {
                return `Cannot generate locking bytecode for output ${index}: this output is set to use the script unlocked by the unlocking script under test, but an unlocking script ID was not provided for scenario generation.`;
            }
            return `Cannot generate locking bytecode for output ${index}: the locking script unlocked by "${unlockingScriptId}" is not provided in this compilation environment.`;
        }
        const overriddenDataDefinition = output.lockingBytecode.overrides === undefined
            ? undefined
            : exports.extendScenarioDefinitionData(extendedScenario.data, output.lockingBytecode.overrides);
        const overriddenCompilationData = overriddenDataDefinition === undefined
            ? undefined
            : exports.extendCompilationDataWithScenarioBytecode({
                compilationData: exports.extendedScenarioDefinitionToCompilationData({
                    data: overriddenDataDefinition,
                }),
                environment,
                scenarioDataBytecodeScripts: (_b = overriddenDataDefinition.bytecode) !== null && _b !== void 0 ? _b : {},
            });
        if (typeof overriddenCompilationData === 'string') {
            return `Cannot generate locking bytecode for output ${index}: ${overriddenCompilationData}`;
        }
        const data = overriddenCompilationData === undefined
            ? fullCompilationData
            : overriddenCompilationData;
        const result = compile_1.compileScript(scriptId, data, environment);
        if (!result.success) {
            return `Cannot generate locking bytecode for output ${index}: ${language_utils_1.stringifyErrors(result.errors)}`;
        }
        return { lockingBytecode: result.bytecode, satoshis };
    });
    const outputCompilationErrors = compiledOutputResults.filter((result) => typeof result === 'string');
    if (outputCompilationErrors.length > 0) {
        return `Cannot generate ${scenarioName}: ${outputCompilationErrors.join('; ')}`;
    }
    const compiledOutputs = compiledOutputResults;
    const sourceSatoshis = typeof extendedScenario.value === 'number'
        ? numbers_1.bigIntToBinUint64LE(BigInt(extendedScenario.value))
        : hex_1.hexToBin(extendedScenario.value);
    const unlockingBytecodeUnderTest = undefined;
    return {
        data: fullCompilationData,
        program: {
            inputIndex: testedInputIndex,
            sourceOutput: { satoshis: sourceSatoshis },
            spendingTransaction: {
                // eslint-disable-next-line complexity
                inputs: extendedScenario.transaction.inputs.map((input) => {
                    var _a, _b, _c;
                    return ({
                        outpointIndex: (_a = input.outpointIndex) !== null && _a !== void 0 ? _a : compiler_defaults_1.CompilerDefaults.defaultScenarioInputOutpointIndex,
                        outpointTransactionHash: hex_1.hexToBin((_b = input.outpointTransactionHash) !== null && _b !== void 0 ? _b : compiler_defaults_1.CompilerDefaults.defaultScenarioInputOutpointTransactionHash),
                        sequenceNumber: (_c = input.sequenceNumber) !== null && _c !== void 0 ? _c : compiler_defaults_1.CompilerDefaults.defaultScenarioInputSequenceNumber,
                        unlockingBytecode: input.unlockingBytecode === null
                            ? unlockingBytecodeUnderTest
                            : hex_1.hexToBin(typeof input.unlockingBytecode === 'string'
                                ? input.unlockingBytecode
                                : compiler_defaults_1.CompilerDefaults.defaultScenarioInputUnlockingBytecodeHex),
                    });
                }),
                locktime: extendedScenario.transaction.locktime,
                outputs: compiledOutputs,
                version: extendedScenario.transaction.version,
            },
        },
    };
};

},{"../format/hex":28,"../format/numbers":30,"../key/hd-key":34,"./compiler-defaults":40,"./language/compile":45,"./language/language-utils":47}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationTemplateP2pkh = exports.authenticationTemplateP2pkhNonHd = void 0;
/**
 * A standard single-factor authentication template which uses
 * Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use
 * on the network.
 *
 * This P2PKH template uses BCH Schnorr signatures, reducing the size of
 * transactions.
 *
 * Note, this authentication template uses only a single `Key`. For HD key
 * support, see `authenticationTemplateP2pkhHd`.
 */
exports.authenticationTemplateP2pkhNonHd = {
    $schema: 'https://bitauth.com/schemas/authentication-template-v0.schema.json',
    description: 'A standard single-factor authentication template which uses Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use on the network.\n\nThis P2PKH template uses BCH Schnorr signatures, reducing the size of transactions.',
    entities: {
        owner: {
            description: 'The individual who can spend from this wallet.',
            name: 'Owner',
            scripts: ['lock', 'unlock'],
            variables: {
                key: {
                    description: 'The private key which controls this wallet.',
                    name: 'Key',
                    type: 'Key',
                },
            },
        },
    },
    name: 'Single Signature (P2PKH)',
    scripts: {
        lock: {
            lockingType: 'standard',
            name: 'P2PKH Lock',
            script: 'OP_DUP\nOP_HASH160 <$(<key.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
        unlock: {
            name: 'Unlock',
            script: '<key.schnorr_signature.all_outputs>\n<key.public_key>',
            unlocks: 'lock',
        },
    },
    supported: ['BCH_2019_05', 'BCH_2019_11', 'BCH_2020_05'],
    version: 0,
};
/**
 * A standard single-factor authentication template which uses
 * Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use
 * on the network.
 *
 * This P2PKH template uses BCH Schnorr signatures, reducing the size of
 * transactions.
 *
 * Because the template uses a Hierarchical Deterministic (HD) key, it also
 * supports an "Observer (Watch-Only)" entity.
 */
exports.authenticationTemplateP2pkh = {
    $schema: 'https://bitauth.com/schemas/authentication-template-v0.schema.json',
    description: 'A standard single-factor authentication template which uses Pay-to-Public-Key-Hash (P2PKH), the most common authentication scheme in use on the network.\n\nThis P2PKH template uses BCH Schnorr signatures, reducing the size of transactions. Because the template uses a Hierarchical Deterministic (HD) key, it also supports an "Observer (Watch-Only)" entity.',
    entities: {
        observer: {
            description: 'An entity which can generate addresses but cannot spend funds from this wallet.',
            name: 'Observer (Watch-Only)',
            scripts: ['lock'],
        },
        owner: {
            description: 'The individual who can spend from this wallet.',
            name: 'Owner',
            scripts: ['lock', 'unlock'],
            variables: {
                key: {
                    description: 'The private key which controls this wallet.',
                    name: 'Key',
                    type: 'HdKey',
                },
            },
        },
    },
    name: 'Single Signature (P2PKH)',
    scripts: {
        lock: {
            lockingType: 'standard',
            name: 'P2PKH Lock',
            script: 'OP_DUP\nOP_HASH160 <$(<key.public_key> OP_HASH160\n)> OP_EQUALVERIFY\nOP_CHECKSIG',
        },
        unlock: {
            name: 'Unlock',
            script: '<key.schnorr_signature.all_outputs>\n<key.public_key>',
            unlocks: 'lock',
        },
    },
    supported: ['BCH_2019_05', 'BCH_2019_11', 'BCH_2020_05'],
    version: 0,
};

},{}],55:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./p2pkh"), exports);

},{"./p2pkh":54}],56:[function(require,module,exports){
"use strict";
/* eslint-disable max-lines */
/**
 * Because this file is consumed by the `doc:generate-json-schema` package
 * script to produce a JSON schema, large sections of the below documentation
 * are copied from this libraries `Transaction` and `CompilationData` types.
 *
 * This is preferable to importing those types, as most documentation needs to
 * be slightly modified for this context, and avoiding imports in this file
 * makes it easier to provide a stable API.
 */
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthenticationTemplate = exports.parseAuthenticationTemplateScenarios = exports.parseAuthenticationTemplateScenarioTransaction = exports.parseAuthenticationTemplateScenarioTransactionOutputs = exports.parseAuthenticationTemplateScenarioTransactionOutputLockingBytecode = exports.parseAuthenticationTemplateScenarioTransactionInputs = exports.parseAuthenticationTemplateScenarioData = exports.parseAuthenticationTemplateScenarioDataKeys = exports.parseAuthenticationTemplateScenarioDataHdKeys = exports.parseAuthenticationTemplateEntities = exports.parseAuthenticationTemplateVariable = exports.parseAuthenticationTemplateScripts = void 0;
/* eslint-disable max-lines, @typescript-eslint/ban-types */
const hex_1 = require("../format/hex");
const key_utils_1 = require("../key/key-utils");
const compiler_defaults_1 = require("./compiler-defaults");
const resolve_1 = require("./language/resolve");
const listIds = (ids) => ids
    .map((id) => `"${id}"`)
    .sort((a, b) => a.localeCompare(b))
    .join(', ');
/**
 * Verify that the provided value is an array which is not sparse.
 */
const isDenseArray = (maybeArray) => Array.isArray(maybeArray) && !maybeArray.includes(undefined);
/**
 * Check that a value is an array which contains only strings and has no empty
 * items (is not a sparse array, e.g. `[1, , 3]`).
 */
const isStringArray = (maybeArray) => isDenseArray(maybeArray) &&
    !maybeArray.some((item) => typeof item !== 'string');
const isObject = (maybeObject) => typeof maybeObject === 'object' && maybeObject !== null;
const isStringObject = (maybeStringObject) => !Object.values(maybeStringObject).some((value) => typeof value !== 'string');
const hasNonHexCharacter = /[^a-fA-F0-9]/u;
const isHexString = (maybeHexString) => typeof maybeHexString === 'string' &&
    !hasNonHexCharacter.test(maybeHexString);
const characterLength32BytePrivateKey = 64;
const isObjectOfValidPrivateKeys = (maybePrivateKeysObject) => !Object.values(maybePrivateKeysObject).some((value) => !isHexString(value) ||
    value.length !== characterLength32BytePrivateKey ||
    !key_utils_1.validateSecp256k1PrivateKey(hex_1.hexToBin(value)));
const isInteger = (value) => typeof value === 'number' && Number.isInteger(value);
const isPositiveInteger = (value) => isInteger(value) && value >= 0;
const isRangedInteger = (value, minimum, maximum) => isInteger(value) && value >= minimum && value <= maximum;
/**
 * Verify that a value is a valid `satoshi` value: either a number between `0`
 * and `Number.MAX_SAFE_INTEGER` or a 16-character, hexadecimal-encoded string.
 *
 * @param maybeSatoshis - the value to verify
 */
const isValidSatoshisValue = (maybeSatoshis) => {
    const uint64HexLength = 16;
    if (maybeSatoshis === undefined ||
        isRangedInteger(maybeSatoshis, 0, Number.MAX_SAFE_INTEGER) ||
        (isHexString(maybeSatoshis) && maybeSatoshis.length === uint64HexLength)) {
        return true;
    }
    return false;
};
/**
 * Parse an authentication template `scripts` object into its component scripts,
 * validating the shape of each script object. Returns either an error message
 * as a string or an object of cloned and sorted scripts.
 *
 * @param scripts - the `scripts` property of an `AuthenticationTemplate`
 */
// eslint-disable-next-line complexity
exports.parseAuthenticationTemplateScripts = (scripts) => {
    const unknownScripts = Object.entries(scripts).map(([id, script]) => ({ id, script }));
    const nonObjectScripts = unknownScripts
        .filter(({ script }) => typeof script !== 'object' || script === null)
        .map(({ id }) => id);
    if (nonObjectScripts.length > 0) {
        return `All authentication template scripts must be objects, but the following scripts are not objects: ${listIds(nonObjectScripts)}.`;
    }
    const allScripts = unknownScripts;
    const unlockingResults = allScripts
        .filter(({ script }) => 'unlocks' in script)
        // eslint-disable-next-line complexity
        .map(({ id, script }) => {
        const { ageLock, estimate, fails, invalid, name, passes, script: scriptContents, timeLockType, unlocks, } = script;
        if (typeof unlocks !== 'string') {
            return `The "unlocks" property of unlocking script "${id}" must be a string.`;
        }
        if (typeof scriptContents !== 'string') {
            return `The "script" property of unlocking script "${id}" must be a string.`;
        }
        if (ageLock !== undefined && typeof ageLock !== 'string') {
            return `If defined, the "ageLock" property of unlocking script "${id}" must be a string.`;
        }
        if (estimate !== undefined && typeof estimate !== 'string') {
            return `If defined, the "estimate" property of unlocking script "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of unlocking script "${id}" must be a string.`;
        }
        if (fails !== undefined && !isStringArray(fails)) {
            return `If defined, the "fails" property of unlocking script "${id}" must be an array containing only scenario identifiers (strings).`;
        }
        if (invalid !== undefined && !isStringArray(invalid)) {
            return `If defined, the "invalid" property of unlocking script "${id}" must be an array containing only scenario identifiers (strings).`;
        }
        if (passes !== undefined && !isStringArray(passes)) {
            return `If defined, the "passes" property of unlocking script "${id}" must be an array containing only scenario identifiers (strings).`;
        }
        if (timeLockType !== undefined &&
            timeLockType !== 'timestamp' &&
            timeLockType !== 'height') {
            return `If defined, the "timeLockType" property of unlocking script "${id}" must be either "timestamp" or "height".`;
        }
        return {
            id,
            script: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (ageLock === undefined ? {} : { ageLock })), (estimate === undefined ? {} : { estimate })), (fails === undefined ? {} : { fails })), (invalid === undefined ? {} : { invalid })), (passes === undefined ? {} : { passes })), (name === undefined ? {} : { name })), { script: scriptContents }), (timeLockType === undefined ? {} : { timeLockType })), { unlocks }),
        };
    });
    const invalidUnlockingResults = unlockingResults.filter((result) => typeof result === 'string');
    if (invalidUnlockingResults.length > 0) {
        return invalidUnlockingResults.join(' ');
    }
    const validUnlockingResults = unlockingResults;
    const unlocking = validUnlockingResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.script })), {});
    const unlockingIds = validUnlockingResults.map(({ id }) => id);
    const impliedLockingIds = validUnlockingResults.map(({ script }) => script.unlocks);
    const lockingResults = allScripts
        .filter(({ id, script }) => 'lockingType' in script || impliedLockingIds.includes(id))
        // eslint-disable-next-line complexity
        .map(({ id, script }) => {
        const { lockingType, script: scriptContents, name } = script;
        if (lockingType !== 'standard' && lockingType !== 'p2sh') {
            return `The "lockingType" property of locking script "${id}" must be either "standard" or "p2sh".`;
        }
        if (typeof scriptContents !== 'string') {
            return `The "script" property of locking script "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of locking script "${id}" must be a string.`;
        }
        return {
            id,
            script: Object.assign(Object.assign({ lockingType }, (name === undefined ? {} : { name })), { script: scriptContents }),
        };
    });
    const invalidLockingResults = lockingResults.filter((result) => typeof result === 'string');
    if (invalidLockingResults.length > 0) {
        return invalidLockingResults.join(' ');
    }
    const validLockingResults = lockingResults;
    const locking = validLockingResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.script })), {});
    const lockingIds = validLockingResults.map(({ id }) => id);
    const unknownLockingIds = Object.values(unlocking)
        .map((script) => script.unlocks)
        .filter((unlocks) => !lockingIds.includes(unlocks));
    if (unknownLockingIds.length > 0) {
        return `The following locking scripts (referenced in "unlocks" properties) were not provided: ${listIds(unknownLockingIds)}.`;
    }
    const testedResults = allScripts
        .filter(({ script }) => 'tests' in script)
        // eslint-disable-next-line complexity
        .map(({ id, script }) => {
        const { tests, script: scriptContents, name, pushed } = script;
        if (typeof scriptContents !== 'string') {
            return `The "script" property of tested script "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of tested script "${id}" must be a string.`;
        }
        if (pushed !== undefined && pushed !== true && pushed !== false) {
            return `If defined, the "pushed" property of tested script "${id}" must be a boolean value.`;
        }
        if (!Array.isArray(tests)) {
            return `If defined, the "tests" property of tested script "${id}" must be an array.`;
        }
        const extractedTests = 
        // eslint-disable-next-line complexity
        tests.map((test) => {
            const { check, fails, invalid, name: testName, passes, setup, } = test;
            if (typeof check !== 'string') {
                return `The "check" properties of all tests in tested script "${id}" must be a strings.`;
            }
            if (testName !== undefined && typeof testName !== 'string') {
                return `If defined, the "name" properties of all tests in tested script "${id}" must be strings.`;
            }
            if (setup !== undefined && typeof setup !== 'string') {
                return `If defined, the "setup" properties of all tests in tested script "${id}" must be strings.`;
            }
            if (fails !== undefined && !isStringArray(fails)) {
                return `If defined, the "fails" property of each test in tested script "${id}" must be an array containing only scenario identifiers (strings).`;
            }
            if (invalid !== undefined && !isStringArray(invalid)) {
                return `If defined, the "invalid" property of each test in tested script "${id}" must be an array containing only scenario identifiers (strings).`;
            }
            if (passes !== undefined && !isStringArray(passes)) {
                return `If defined, the "passes" property of each test in tested script "${id}" must be an array containing only scenario identifiers (strings).`;
            }
            return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ check }, (fails === undefined ? {} : { fails })), (invalid === undefined ? {} : { invalid })), (passes === undefined ? {} : { passes })), (testName === undefined ? {} : { name: testName })), (setup === undefined ? {} : { setup }));
        });
        const invalidTests = extractedTests.filter((result) => typeof result === 'string');
        if (invalidTests.length > 0) {
            return invalidTests.join(' ');
        }
        const validTests = extractedTests;
        return {
            id,
            script: Object.assign(Object.assign(Object.assign({}, (name === undefined ? {} : { name })), (pushed === undefined ? {} : { pushed })), { script: scriptContents, tests: validTests }),
        };
    });
    const invalidTestedResults = testedResults.filter((result) => typeof result === 'string');
    if (invalidTestedResults.length > 0) {
        return invalidTestedResults.join(' ');
    }
    const validTestedResults = testedResults;
    const tested = validTestedResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.script })), {});
    const testedIds = validTestedResults.map(({ id }) => id);
    const lockingAndUnlockingIds = [...lockingIds, ...unlockingIds];
    const lockingAndUnlockingIdsWithTests = lockingAndUnlockingIds.filter((id) => testedIds.includes(id));
    if (lockingAndUnlockingIdsWithTests.length > 0) {
        return `Locking and unlocking scripts may not have tests, but the following scripts include a "tests" property: ${listIds(lockingAndUnlockingIdsWithTests)}`;
    }
    const alreadySortedIds = [...lockingAndUnlockingIds, testedIds];
    const otherResults = allScripts
        .filter(({ id }) => !alreadySortedIds.includes(id))
        .map(({ id, script }) => {
        const { script: scriptContents, name } = script;
        if (typeof scriptContents !== 'string') {
            return `The "script" property of script "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of script "${id}" must be a string.`;
        }
        return {
            id,
            script: Object.assign(Object.assign({}, (name === undefined ? {} : { name })), { script: scriptContents }),
        };
    });
    const invalidOtherResults = otherResults.filter((result) => typeof result === 'string');
    if (invalidOtherResults.length > 0) {
        return invalidOtherResults.join(' ');
    }
    const validOtherResults = otherResults;
    const other = validOtherResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.script })), {});
    return {
        locking,
        other,
        tested,
        unlocking,
    };
};
const authenticationTemplateVariableTypes = [
    'AddressData',
    'HdKey',
    'Key',
    'WalletData',
];
const isAuthenticationTemplateVariableType = (type) => authenticationTemplateVariableTypes.includes(type);
/**
 * Parse an authentication template entity `variables` object into its component
 * variables, validating the shape of each variable object. Returns either an
 * error message as a string or the cloned variables object.
 *
 * @param scripts - the `scripts` property of an `AuthenticationTemplate`
 */
exports.parseAuthenticationTemplateVariable = (variables, entityId) => {
    const unknownVariables = Object.entries(variables).map(([id, variable]) => ({ id, variable }));
    const nonObjectVariables = unknownVariables
        .filter(({ variable }) => typeof variable !== 'object' || variable === null)
        .map(({ id }) => id);
    if (nonObjectVariables.length > 0) {
        return `All authentication template variables must be objects, but the following variables owned by entity "${entityId}" are not objects: ${listIds(nonObjectVariables)}.`;
    }
    const allEntities = unknownVariables;
    const variableResults = allEntities
        // eslint-disable-next-line complexity
        .map(({ id, variable }) => {
        const { description, name, type } = variable;
        if (!isAuthenticationTemplateVariableType(type)) {
            return `The "type" property of variable "${id}" must be a valid authentication template variable type. Available types are: ${listIds(authenticationTemplateVariableTypes)}.`;
        }
        if (description !== undefined && typeof description !== 'string') {
            return `If defined, the "description" property of variable "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of variable "${id}" must be a string.`;
        }
        if (type === 'HdKey') {
            const { addressOffset, hdPublicKeyDerivationPath, privateDerivationPath, publicDerivationPath, } = variable;
            if (addressOffset !== undefined && typeof addressOffset !== 'number') {
                return `If defined, the "addressOffset" property of HdKey "${id}" must be a number.`;
            }
            if (hdPublicKeyDerivationPath !== undefined &&
                typeof hdPublicKeyDerivationPath !== 'string') {
                return `If defined, the "hdPublicKeyDerivationPath" property of HdKey "${id}" must be a string.`;
            }
            if (privateDerivationPath !== undefined &&
                typeof privateDerivationPath !== 'string') {
                return `If defined, the "privateDerivationPath" property of HdKey "${id}" must be a string.`;
            }
            if (publicDerivationPath !== undefined &&
                typeof publicDerivationPath !== 'string') {
                return `If defined, the "publicDerivationPath" property of HdKey "${id}" must be a string.`;
            }
            const hdPublicKeyPath = hdPublicKeyDerivationPath !== null && hdPublicKeyDerivationPath !== void 0 ? hdPublicKeyDerivationPath : compiler_defaults_1.CompilerDefaults.hdKeyHdPublicKeyDerivationPath;
            const privatePath = privateDerivationPath !== null && privateDerivationPath !== void 0 ? privateDerivationPath : compiler_defaults_1.CompilerDefaults.hdKeyPrivateDerivationPath;
            const publicPath = publicDerivationPath !== null && publicDerivationPath !== void 0 ? publicDerivationPath : privatePath.replace('m', 'M');
            const validPrivatePathWithIndex = /^m(?:\/(?:[0-9]+|i)'?)*$/u;
            const validPrivatePath = /^m(?:\/[0-9]+'?)*$/u;
            const replacedPrivatePath = privatePath.replace('i', '0');
            if (!validPrivatePathWithIndex.test(privatePath) &&
                !validPrivatePath.test(replacedPrivatePath)) {
                return `If defined, the "privateDerivationPath" property of HdKey "${id}" must be a valid private derivation path, but the provided value is "${hdPublicKeyPath}". A valid path must begin with "m" and include only "/", "'", a single "i" address index character, and numbers.`;
            }
            if (!validPrivatePath.test(hdPublicKeyPath)) {
                return `If defined, the "hdPublicKeyDerivationPath" property of an HdKey must be a valid private derivation path for the HdKey's HD public node, but the provided value for HdKey "${id}" is "${hdPublicKeyPath}". A valid path must begin with "m" and include only "/", "'", and numbers (the "i" character cannot be used in "hdPublicKeyDerivationPath").`;
            }
            const validPublicPathWithIndex = /^M(?:\/(?:[0-9]+|i))*$/u;
            const validPublicPath = /^M(?:\/[0-9]+)*$/u;
            const replacedPublicPath = publicPath.replace('i', '0');
            if (!validPublicPathWithIndex.test(publicPath) &&
                !validPublicPath.test(replacedPublicPath)) {
                return `The "publicDerivationPath" property of HdKey "${id}" must be a valid public derivation path, but the current value is "${publicPath}". Public derivation paths must begin with "M" and include only "/", a single "i" address index character, and numbers. If the "privateDerivationPath" uses hardened derivation, the "publicDerivationPath" should be set to enable public derivation from the "hdPublicKeyDerivationPath".`;
            }
            const publicPathSuffix = publicPath.replace('M/', '');
            const impliedPrivatePath = `${hdPublicKeyPath}/${publicPathSuffix}`;
            if (impliedPrivatePath !== privatePath) {
                return `The "privateDerivationPath" property of HdKey "${id}" is "${privatePath}", but the implied private derivation path of "hdPublicKeyDerivationPath" and "publicDerivationPath" is "${impliedPrivatePath}". The "publicDerivationPath" property must be set to allow for public derivation of the same HD node derived by "privateDerivationPath" beginning from the HD public key derived at "hdPublicKeyDerivationPath".`;
            }
            return {
                id,
                variable: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (addressOffset === undefined ? {} : { addressOffset })), (description === undefined ? {} : { description })), (hdPublicKeyDerivationPath === undefined
                    ? {}
                    : { hdPublicKeyDerivationPath })), (name === undefined ? {} : { name })), (privateDerivationPath === undefined
                    ? {}
                    : { privateDerivationPath })), (publicDerivationPath === undefined
                    ? {}
                    : { publicDerivationPath })), { type }),
            };
        }
        return {
            id,
            variable: Object.assign(Object.assign(Object.assign({}, (description === undefined ? {} : { description })), (name === undefined ? {} : { name })), { type }),
        };
    });
    const invalidVariableResults = variableResults.filter((result) => typeof result === 'string');
    if (invalidVariableResults.length > 0) {
        return invalidVariableResults.join(' ');
    }
    const validVariableResults = variableResults;
    const clonedVariables = validVariableResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.variable })), {});
    return clonedVariables;
};
/**
 * Parse an authentication template `entities` object into its component
 * entities, validating the shape of each entity object. Returns either an error
 * message as a string or the cloned entities object.
 *
 * @param scripts - the `scripts` property of an `AuthenticationTemplate`
 */
exports.parseAuthenticationTemplateEntities = (entities) => {
    const unknownEntities = Object.entries(entities).map(([id, entity]) => ({ entity, id }));
    const nonObjectEntities = unknownEntities
        .filter(({ entity }) => typeof entity !== 'object' || entity === null)
        .map(({ id }) => id);
    if (nonObjectEntities.length > 0) {
        return `All authentication template entities must be objects, but the following entities are not objects: ${listIds(nonObjectEntities)}.`;
    }
    const allEntities = unknownEntities;
    const entityResults = allEntities
        // eslint-disable-next-line complexity
        .map(({ id, entity }) => {
        const { description, name, scripts, variables } = entity;
        if (description !== undefined && typeof description !== 'string') {
            return `If defined, the "description" property of entity "${id}" must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of entity "${id}" must be a string.`;
        }
        if (scripts !== undefined && !isStringArray(scripts)) {
            return `If defined, the "scripts" property of entity "${id}" must be an array containing only script identifiers (strings).`;
        }
        if (variables !== undefined && !isObject(variables)) {
            return `If defined, the "variables" property of entity "${id}" must be an object.`;
        }
        const variableResult = variables === undefined
            ? undefined
            : exports.parseAuthenticationTemplateVariable(variables, id);
        if (typeof variableResult === 'string') {
            return variableResult;
        }
        return {
            entity: Object.assign(Object.assign(Object.assign(Object.assign({}, (description === undefined ? {} : { description })), (name === undefined ? {} : { name })), (scripts === undefined ? {} : { scripts })), (variableResult === undefined
                ? {}
                : { variables: variableResult })),
            id,
        };
    });
    const invalidEntityResults = entityResults.filter((result) => typeof result === 'string');
    if (invalidEntityResults.length > 0) {
        return invalidEntityResults.join(' ');
    }
    const validEntityResults = entityResults;
    const clonedEntities = validEntityResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.entity })), {});
    return clonedEntities;
};
/**
 * Validate and clone an Authentication Template Scenario `data.hdKeys` object.
 *
 * @param hdKeys - the `data.hdKeys` object to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `scenario "test"` or
 * `'lockingBytecode.override' in output 2 of scenario "test"`
 */
// eslint-disable-next-line complexity
exports.parseAuthenticationTemplateScenarioDataHdKeys = (hdKeys, location) => {
    const { addressIndex, hdPublicKeys, hdPrivateKeys } = hdKeys;
    const maximumAddressIndex = 2147483648;
    if (addressIndex !== undefined &&
        !isRangedInteger(addressIndex, 0, maximumAddressIndex)) {
        return `If defined, the "data.hdKeys.addressIndex" property of ${location} must be a positive integer between 0 and 2,147,483,648 (inclusive).`;
    }
    if (hdPublicKeys !== undefined &&
        !(isObject(hdPublicKeys) && isStringObject(hdPublicKeys))) {
        return `If defined, the "data.hdKeys.hdPublicKeys" property of ${location} must be an object, and each value must be a string.`;
    }
    if (hdPrivateKeys !== undefined &&
        !(isObject(hdPrivateKeys) && isStringObject(hdPrivateKeys))) {
        return `If defined, the "data.hdKeys.hdPrivateKeys" property of ${location} must be an object, and each value must be a string.`;
    }
    return Object.assign(Object.assign(Object.assign({}, (addressIndex === undefined ? {} : { addressIndex })), (hdPublicKeys === undefined
        ? {}
        : { hdPublicKeys: Object.assign({}, hdPublicKeys) })), (hdPrivateKeys === undefined
        ? {}
        : { hdPrivateKeys: Object.assign({}, hdPrivateKeys) }));
};
/**
 * Validate and clone an Authentication Template Scenario `data.keys` object.
 *
 * @param keys - the `data.keys` object to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `scenario "test"` or
 * `'lockingBytecode.override' in output 2 of scenario "test"`
 */
exports.parseAuthenticationTemplateScenarioDataKeys = (keys, location) => {
    const { privateKeys } = keys;
    if (privateKeys !== undefined &&
        !(isObject(privateKeys) && isObjectOfValidPrivateKeys(privateKeys))) {
        return `If defined, the "data.keys.privateKeys" property of ${location} must be an object, and each value must be a 32-byte, hexadecimal-encoded private key.`;
    }
    return Object.assign({}, (privateKeys === undefined ? {} : { privateKeys }));
};
/**
 * Validate and clone an Authentication Template Scenario `data` object.
 *
 * @param data - the `data` object to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `scenario "test"` or
 * `'lockingBytecode.override' in output 2 of scenario "test"`
 */
// eslint-disable-next-line complexity
exports.parseAuthenticationTemplateScenarioData = (data, location) => {
    const { bytecode, currentBlockHeight, currentBlockTime, hdKeys, keys, } = data;
    if (bytecode !== undefined &&
        (!isObject(bytecode) || !isStringObject(bytecode))) {
        return `If defined, the "data.bytecode" property of ${location} must be an object, and each value must be a string.`;
    }
    const minimumBlockTime = 500000000;
    const maximumBlockTime = 4294967295;
    if (currentBlockHeight !== undefined &&
        !isRangedInteger(currentBlockHeight, 0, minimumBlockTime - 1)) {
        return `If defined, the "currentBlockHeight" property of ${location} must be a positive integer from 0 to 499,999,999 (inclusive).`;
    }
    if (currentBlockTime !== undefined &&
        !isRangedInteger(currentBlockTime, minimumBlockTime, maximumBlockTime)) {
        return `If defined, the "currentBlockTime" property of ${location} must be a positive integer from 500,000,000 to 4,294,967,295 (inclusive).`;
    }
    const hdKeysResult = hdKeys === undefined
        ? undefined
        : isObject(hdKeys)
            ? exports.parseAuthenticationTemplateScenarioDataHdKeys(hdKeys, location)
            : `If defined, the "data.hdKeys" property of ${location} must be an object.`;
    if (typeof hdKeysResult === 'string') {
        return hdKeysResult;
    }
    const keysResult = keys === undefined
        ? undefined
        : isObject(keys)
            ? exports.parseAuthenticationTemplateScenarioDataKeys(keys, location)
            : `If defined, the "data.keys" property of ${location} must be an object.`;
    if (typeof keysResult === 'string') {
        return keysResult;
    }
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (bytecode === undefined ? {} : { bytecode: Object.assign({}, bytecode) })), (currentBlockHeight === undefined ? {} : { currentBlockHeight })), (currentBlockTime === undefined ? {} : { currentBlockTime })), (hdKeysResult === undefined ? {} : { hdKeys: hdKeysResult })), (keysResult === undefined ? {} : { keys: keysResult }));
};
/**
 * Validate and clone an Authentication Template Scenario `transaction.inputs`
 * array.
 *
 * @param inputs - the `transaction.inputs` array to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `scenario "test"`
 */
exports.parseAuthenticationTemplateScenarioTransactionInputs = (inputs, location) => {
    if (inputs === undefined) {
        return undefined;
    }
    if (!isDenseArray(inputs)) {
        return `If defined, the "transaction.inputs" property of ${location} must be an array of scenario input objects.`;
    }
    const inputResults = inputs
        // eslint-disable-next-line complexity
        .map((maybeInput, inputIndex) => {
        const { outpointIndex, outpointTransactionHash, sequenceNumber, unlockingBytecode, } = maybeInput;
        const newLocation = `input ${inputIndex} in ${location}`;
        if (outpointIndex !== undefined && !isPositiveInteger(outpointIndex)) {
            return `If defined, the "outpointIndex" property of ${newLocation} must be a positive integer.`;
        }
        const characterLength32ByteHash = 64;
        if (outpointTransactionHash !== undefined &&
            !(isHexString(outpointTransactionHash) &&
                outpointTransactionHash.length === characterLength32ByteHash)) {
            return `If defined, the "outpointTransactionHash" property of ${newLocation} must be a 32-byte, hexadecimal-encoded hash (string).`;
        }
        const maxSequenceNumber = 0xffffffff;
        if (sequenceNumber !== undefined &&
            !isRangedInteger(sequenceNumber, 0, maxSequenceNumber)) {
            return `If defined, the "sequenceNumber" property of ${newLocation} must be a number between 0 and 4294967295 (inclusive).`;
        }
        if (unlockingBytecode !== undefined &&
            unlockingBytecode !== null &&
            !isHexString(unlockingBytecode)) {
            return `If defined, the "unlockingBytecode" property of ${newLocation} must be either a null value or a hexadecimal-encoded string.`;
        }
        return Object.assign(Object.assign(Object.assign(Object.assign({}, (outpointIndex === undefined ? {} : { outpointIndex })), (outpointTransactionHash === undefined
            ? {}
            : { outpointTransactionHash })), (sequenceNumber === undefined ? {} : { sequenceNumber })), (unlockingBytecode === undefined ? {} : { unlockingBytecode }));
    });
    const invalidInputResults = inputResults.filter((result) => typeof result === 'string');
    if (invalidInputResults.length > 0) {
        return invalidInputResults.join(' ');
    }
    const clonedInputs = inputResults;
    return clonedInputs;
};
/**
 * Validate and clone an Authentication Template Scenario transaction output
 * `lockingBytecode` object.
 *
 * @param outputs - the `transaction.outputs[outputIndex].lockingBytecode`
 * object to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `output 2 in scenario "test"`
 */
// eslint-disable-next-line complexity
exports.parseAuthenticationTemplateScenarioTransactionOutputLockingBytecode = (lockingBytecode, location) => {
    const { overrides, script } = lockingBytecode;
    if (script !== undefined && script !== null && !isHexString(script)) {
        return `If defined, the "script" property of ${location} must be a hexadecimal-encoded string or "null".`;
    }
    const clonedOverrides = overrides === undefined
        ? undefined
        : isObject(overrides)
            ? exports.parseAuthenticationTemplateScenarioData(overrides, `'lockingBytecode.override' in ${location}`)
            : `If defined, the "overrides" property of ${location} must be an object.`;
    if (typeof clonedOverrides === 'string') {
        return clonedOverrides;
    }
    return Object.assign(Object.assign({}, (script === undefined ? {} : { script })), (clonedOverrides === undefined ? {} : { overrides: clonedOverrides }));
};
/**
 * Validate and clone an Authentication Template Scenario `transaction.outputs`
 * array.
 *
 * @param outputs - the `transaction.outputs` array to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `of output 2 in scenario "test"`
 */
exports.parseAuthenticationTemplateScenarioTransactionOutputs = (outputs, location) => {
    if (outputs === undefined) {
        return undefined;
    }
    if (!isDenseArray(outputs)) {
        return `If defined, the "transaction.outputs" property of ${location} must be an array of scenario output objects.`;
    }
    const outputResults = outputs
        // eslint-disable-next-line complexity
        .map((maybeOutput, outputIndex) => {
        const { lockingBytecode, satoshis } = maybeOutput;
        const newLocation = `output ${outputIndex} in ${location}`;
        if (lockingBytecode !== undefined &&
            typeof lockingBytecode !== 'string' &&
            !isObject(lockingBytecode)) {
            return `If defined, the "lockingBytecode" property of ${newLocation} must be a string or an object.`;
        }
        if (typeof lockingBytecode === 'string' &&
            !isHexString(lockingBytecode)) {
            return `If the "lockingBytecode" property of ${newLocation} is a string, it must be a valid, hexadecimal-encoded locking bytecode.`;
        }
        const clonedLockingBytecode = lockingBytecode === undefined || typeof lockingBytecode === 'string'
            ? undefined
            : exports.parseAuthenticationTemplateScenarioTransactionOutputLockingBytecode(lockingBytecode, newLocation);
        if (typeof clonedLockingBytecode === 'string') {
            return clonedLockingBytecode;
        }
        if (!isValidSatoshisValue(satoshis)) {
            return `If defined, the "satoshis" property of ${newLocation} must be either a number or a little-endian, unsigned 64-bit integer as a hexadecimal-encoded string (16 characters).`;
        }
        return Object.assign(Object.assign({}, (lockingBytecode === undefined
            ? {}
            : typeof lockingBytecode === 'string'
                ? { lockingBytecode }
                : { lockingBytecode: clonedLockingBytecode })), (satoshis === undefined ? {} : { satoshis }));
    });
    const invalidOutputResults = outputResults.filter((result) => typeof result === 'string');
    if (invalidOutputResults.length > 0) {
        return invalidOutputResults.join(' ');
    }
    const clonedOutputs = outputResults;
    if (clonedOutputs.length === 0) {
        return `If defined, the "transaction.outputs" property of ${location} must be have at least one output.`;
    }
    return clonedOutputs;
};
/**
 * Validate and clone an Authentication Template Scenario `transaction` object.
 *
 * @param transaction - the `transaction` object to validate and clone
 * @param location - the location of the error to specify in error messages,
 * e.g. `of output 2 in scenario "test"`
 */
// eslint-disable-next-line complexity
exports.parseAuthenticationTemplateScenarioTransaction = (transaction, location) => {
    const { inputs, locktime, outputs, version } = transaction;
    const maximumLocktime = 4294967295;
    if (locktime !== undefined &&
        !isRangedInteger(locktime, 0, maximumLocktime)) {
        return `If defined, the "locktime" property of ${location} must be an integer between 0 and 4,294,967,295 (inclusive).`;
    }
    const maximumVersion = 4294967295;
    if (version !== undefined && !isRangedInteger(version, 0, maximumVersion)) {
        return `If defined, the "version" property of ${location} must be an integer between 0 and 4,294,967,295 (inclusive).`;
    }
    const clonedInputs = exports.parseAuthenticationTemplateScenarioTransactionInputs(inputs, location);
    if (typeof clonedInputs === 'string') {
        return clonedInputs;
    }
    const clonedOutputs = exports.parseAuthenticationTemplateScenarioTransactionOutputs(outputs, location);
    if (typeof clonedOutputs === 'string') {
        return clonedOutputs;
    }
    return Object.assign(Object.assign(Object.assign(Object.assign({}, (locktime === undefined ? {} : { locktime })), (clonedInputs === undefined ? {} : { inputs: clonedInputs })), (clonedOutputs === undefined ? {} : { outputs: clonedOutputs })), (version === undefined ? {} : { version }));
};
/**
 * Validate and clone an object of Authentication Template scenarios.
 *
 * @param scenarios - the scenarios object to validate and clone
 */
exports.parseAuthenticationTemplateScenarios = (scenarios) => {
    const unknownScenarios = Object.entries(scenarios).map(([id, scenario]) => ({ id, scenario }));
    const nonObjectScenarios = unknownScenarios
        .filter(({ scenario }) => typeof scenario !== 'object' || scenario === null)
        .map(({ id }) => id);
    if (nonObjectScenarios.length > 0) {
        return `All authentication template scenarios must be objects, but the following scenarios are not objects: ${listIds(nonObjectScenarios)}.`;
    }
    const allScenarios = unknownScenarios;
    const scenarioResults = allScenarios
        // eslint-disable-next-line complexity
        .map(({ id, scenario }) => {
        var _a;
        const { data, description, extends: extendsProp, name, transaction, value, } = scenario;
        const location = `scenario "${id}"`;
        if (description !== undefined && typeof description !== 'string') {
            return `If defined, the "description" property of ${location} must be a string.`;
        }
        if (name !== undefined && typeof name !== 'string') {
            return `If defined, the "name" property of ${location} must be a string.`;
        }
        if (extendsProp !== undefined && typeof extendsProp !== 'string') {
            return `If defined, the "extends" property of ${location} must be a string.`;
        }
        if (!isValidSatoshisValue(value)) {
            return `If defined, the "value" property of ${location} must be either a number or a little-endian, unsigned 64-bit integer as a hexadecimal-encoded string (16 characters).`;
        }
        if (data !== undefined && !isObject(data)) {
            return `If defined, the "data" property of ${location} must be an object.`;
        }
        if (transaction !== undefined && !isObject(transaction)) {
            return `If defined, the "transaction" property of ${location} must be an object.`;
        }
        const dataResult = data === undefined
            ? undefined
            : exports.parseAuthenticationTemplateScenarioData(data, location);
        if (typeof dataResult === 'string') {
            return dataResult;
        }
        const transactionResult = transaction === undefined
            ? undefined
            : exports.parseAuthenticationTemplateScenarioTransaction(transaction, location);
        if (typeof transactionResult === 'string') {
            return transactionResult;
        }
        const inputsUnderTest = (_a = transactionResult === null || transactionResult === void 0 ? void 0 : transactionResult.inputs) === null || _a === void 0 ? void 0 : _a.filter((input) => input.unlockingBytecode === undefined ||
            input.unlockingBytecode === null);
        if (inputsUnderTest !== undefined && inputsUnderTest.length !== 1) {
            return `If defined, the "transaction.inputs" array of ${location} must have exactly one input under test (an "unlockingBytecode" set to "null").`;
        }
        return {
            id,
            scenario: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (dataResult === undefined ? {} : { data: dataResult })), (description === undefined ? {} : { description })), (extendsProp === undefined ? {} : { extends: extendsProp })), (name === undefined ? {} : { name })), (transactionResult === undefined
                ? {}
                : { transaction: transactionResult })), (value === undefined ? {} : { value })),
        };
    });
    const invalidScenarioResults = scenarioResults.filter((result) => typeof result === 'string');
    if (invalidScenarioResults.length > 0) {
        return invalidScenarioResults.join(' ');
    }
    const validScenarioResults = scenarioResults;
    const clonedScenarios = validScenarioResults.reduce((all, result) => (Object.assign(Object.assign({}, all), { [result.id]: result.scenario })), {});
    const unknownExtends = Object.values(clonedScenarios).reduce((all, scenario) => scenario.extends !== undefined &&
        clonedScenarios[scenario.extends] === undefined
        ? [...all, scenario.extends]
        : all, []);
    if (unknownExtends.length > 0) {
        return `If defined, each scenario ID referenced by another scenario's "extends" property must exist. Unknown scenario IDs: ${listIds(unknownExtends)}.`;
    }
    return clonedScenarios;
};
const isVersion0 = (maybeTemplate) => maybeTemplate.version === 0;
const schemaIsOptionalString = (maybeTemplate) => {
    const property = maybeTemplate.$schema;
    return property === undefined || typeof property === 'string';
};
const nameIsOptionalString = (maybeTemplate) => {
    const property = maybeTemplate.name;
    return property === undefined || typeof property === 'string';
};
const descriptionIsOptionalString = (maybeTemplate) => {
    const property = maybeTemplate.description;
    return property === undefined || typeof property === 'string';
};
const supportsOnlyValidVmIdentifiers = (maybeTemplate, availableIdentifiers) => {
    const { supported } = maybeTemplate;
    return (Array.isArray(supported) &&
        supported.every((value) => availableIdentifiers.includes(value)));
};
/**
 * Parse and validate an authentication template, returning either an error
 * message as a string or a valid, safely-cloned `AuthenticationTemplate`.
 *
 * This method validates both the structure and the contents of a template:
 * - All properties and sub-properties are verified to be of the expected type.
 * - The ID of each entity, script, and scenario is confirmed to be unique.
 * - Script IDs referenced by entities and other scripts (via `unlocks`) are
 * confirmed to exist.
 * - The derivation paths of each HdKey are validated against each other.
 *
 * This method does not validate the BTL contents of scripts (by attempting
 * compilation, evaluate `AuthenticationTemplateScriptTest`s, or test scenario
 * generation. Unknown properties are ignored and excluded from the final
 * result.
 *
 * @param maybeTemplate - object to validate as an authentication template
 */
// eslint-disable-next-line complexity
exports.validateAuthenticationTemplate = (maybeTemplate) => {
    if (typeof maybeTemplate !== 'object' || maybeTemplate === null) {
        return 'A valid authentication template must be an object.';
    }
    if (!isVersion0(maybeTemplate)) {
        return 'Only version 0 authentication templates are currently supported.';
    }
    const vmIdentifiers = [
        'BCH_2022_11_SPEC',
        'BCH_2022_11',
        'BCH_2022_05_SPEC',
        'BCH_2022_05',
        'BCH_2021_11_SPEC',
        'BCH_2021_11',
        'BCH_2021_05_SPEC',
        'BCH_2021_05',
        'BCH_2020_11_SPEC',
        'BCH_2020_11',
        'BCH_2020_05',
        'BCH_2019_11',
        'BCH_2019_05',
        'BSV_2018_11',
        'BTC_2017_08',
    ];
    if (!supportsOnlyValidVmIdentifiers(maybeTemplate, vmIdentifiers) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        maybeTemplate.supported.includes(undefined)) {
        return `Version 0 authentication templates must include a "supported" list of authentication virtual machine versions. Available identifiers are: ${vmIdentifiers.join(', ')}.`;
    }
    if (!schemaIsOptionalString(maybeTemplate)) {
        return 'The "$schema" property of an authentication template must be a string.';
    }
    if (!nameIsOptionalString(maybeTemplate)) {
        return 'The "name" property of an authentication template must be a string.';
    }
    if (!descriptionIsOptionalString(maybeTemplate)) {
        return 'The "description" property of an authentication template must be a string.';
    }
    const { entities, scenarios, scripts } = maybeTemplate;
    if (typeof entities !== 'object' || entities === null) {
        return `The "entities" property of an authentication template must be an object.`;
    }
    if (typeof scripts !== 'object' || scripts === null) {
        return `The "scripts" property of an authentication template must be an object.`;
    }
    if (scenarios !== undefined &&
        (typeof scenarios !== 'object' || scenarios === null)) {
        return `If defined, the "scenarios" property of an authentication template must be an object.`;
    }
    const parsedScripts = exports.parseAuthenticationTemplateScripts(scripts);
    if (typeof parsedScripts === 'string') {
        return parsedScripts;
    }
    const clonedScripts = [
        ...Object.entries(parsedScripts.locking),
        ...Object.entries(parsedScripts.other),
        ...Object.entries(parsedScripts.tested),
        ...Object.entries(parsedScripts.unlocking),
    ].reduce((all, [id, script]) => (Object.assign(Object.assign({}, all), { [id]: script })), {});
    const clonedEntities = exports.parseAuthenticationTemplateEntities(entities);
    if (typeof clonedEntities === 'string') {
        return clonedEntities;
    }
    const clonedScenarios = scenarios === undefined
        ? undefined
        : exports.parseAuthenticationTemplateScenarios(scenarios);
    if (typeof clonedScenarios === 'string') {
        return clonedScenarios;
    }
    const variableIds = Object.values(clonedEntities).reduce((all, entity) => entity.variables === undefined
        ? all
        : [...all, ...Object.keys(entity.variables)], []);
    const entityIds = Object.keys(clonedEntities);
    const scriptIds = Object.keys(clonedScripts);
    const scenarioIds = clonedScenarios === undefined ? [] : Object.keys(clonedScenarios);
    const usedIds = [...variableIds, ...entityIds, ...scriptIds, ...scenarioIds];
    const builtInIds = [
        resolve_1.BuiltInVariables.currentBlockHeight,
        resolve_1.BuiltInVariables.currentBlockTime,
        resolve_1.BuiltInVariables.signingSerialization,
    ];
    const usedBuiltInIds = builtInIds.filter((builtInIdentifier) => usedIds.includes(builtInIdentifier));
    if (usedBuiltInIds.length > 0) {
        return `Built-in identifiers may not be re-used by any entity, variable, script, or scenario. The following built-in identifiers are re-used: ${listIds(usedBuiltInIds)}.`;
    }
    const idUsageCount = usedIds.reduce((count, id) => {
        var _a;
        return (Object.assign(Object.assign({}, count), { [id]: ((_a = count[id]) !== null && _a !== void 0 ? _a : 0) + 1 }));
    }, {});
    const duplicateIds = Object.entries(idUsageCount)
        .filter(([, count]) => count > 1)
        .map(([id]) => id);
    if (duplicateIds.length > 0) {
        return `The ID of each entity, variable, script, and scenario in an authentication template must be unique. The following IDs are re-used: ${listIds(duplicateIds)}.`;
    }
    const unknownScriptIds = Object.values(clonedEntities)
        .reduce((all, entity) => entity.scripts === undefined ? all : [...all, ...entity.scripts], [])
        .reduce((unique, id) => scriptIds.includes(id) || unique.includes(id)
        ? unique
        : [...unique, id], []);
    if (unknownScriptIds.length > 0) {
        return `Only known scripts may be assigned to entities. The following script IDs are not provided in this template: ${listIds(unknownScriptIds)}.`;
    }
    const unknownScenarioIds = [
        ...Object.values(parsedScripts.unlocking).reduce((all, script) => [
            ...all,
            ...(script.estimate === undefined ? [] : [script.estimate]),
            ...(script.fails === undefined ? [] : script.fails),
            ...(script.invalid === undefined ? [] : script.invalid),
            ...(script.passes === undefined ? [] : script.passes),
        ], []),
        ...Object.values(parsedScripts.tested).reduce((all, script) => [
            ...all,
            ...script.tests.reduce((fromScript, test) => [
                ...fromScript,
                ...(test.fails === undefined ? [] : test.fails),
                ...(test.invalid === undefined ? [] : test.invalid),
                ...(test.passes === undefined ? [] : test.passes),
            ], []),
        ], []),
    ].reduce((unique, id) => scenarioIds.includes(id) || unique.includes(id)
        ? unique
        : [...unique, id], []);
    if (unknownScenarioIds.length > 0) {
        return `Only known scenarios may be referenced by scripts. The following scenario IDs are not provided in this template: ${listIds(unknownScenarioIds)}.`;
    }
    const entityIdsReferencedByScenarioData = (data) => {
        var _a, _b;
        const hdPublicKeyEntityIds = ((_a = data === null || data === void 0 ? void 0 : data.hdKeys) === null || _a === void 0 ? void 0 : _a.hdPublicKeys) === undefined
            ? []
            : Object.keys(data.hdKeys.hdPublicKeys);
        const hdPrivateKeyEntityIds = ((_b = data === null || data === void 0 ? void 0 : data.hdKeys) === null || _b === void 0 ? void 0 : _b.hdPrivateKeys) === undefined
            ? []
            : Object.keys(data.hdKeys.hdPrivateKeys);
        return [...hdPublicKeyEntityIds, ...hdPrivateKeyEntityIds];
    };
    const unknownEntityIds = clonedScenarios === undefined
        ? []
        : Object.values(clonedScenarios)
            .reduce((all, scenario) => {
            var _a, _b;
            return [
                ...all,
                ...entityIdsReferencedByScenarioData(scenario.data),
                ...((_b = (_a = scenario.transaction) === null || _a === void 0 ? void 0 : _a.outputs) !== null && _b !== void 0 ? _b : []).reduce((fromOverrides, output) => isObject(output.lockingBytecode)
                    ? [
                        ...fromOverrides,
                        ...entityIdsReferencedByScenarioData(output.lockingBytecode.overrides),
                    ]
                    : fromOverrides, []),
            ];
        }, [])
            .reduce((unique, id) => entityIds.includes(id) || unique.includes(id)
            ? unique
            : [...unique, id], []);
    if (unknownEntityIds.length > 0) {
        return `Only known entities may be referenced by hdKeys properties within scenarios. The following entity IDs are not provided in this template: ${listIds(unknownEntityIds)}.`;
    }
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (maybeTemplate.$schema === undefined
        ? {}
        : { $schema: maybeTemplate.$schema })), (maybeTemplate.description === undefined
        ? {}
        : { description: maybeTemplate.description })), { entities: clonedEntities }), (maybeTemplate.name === undefined ? {} : { name: maybeTemplate.name })), { scenarios: clonedScenarios, scripts: clonedScripts, supported: maybeTemplate.supported, version: maybeTemplate.version });
};

},{"../format/hex":28,"../key/key-utils":35,"./compiler-defaults":40,"./language/resolve":52}],58:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./compiler-bch/compiler-bch"), exports);
__exportStar(require("./language/language"), exports);
__exportStar(require("./compiler-defaults"), exports);
__exportStar(require("./compiler-operation-helpers"), exports);
__exportStar(require("./compiler-operations"), exports);
__exportStar(require("./compiler-types"), exports);
__exportStar(require("./compiler"), exports);
__exportStar(require("./scenarios"), exports);
__exportStar(require("./standard/standard"), exports);
__exportStar(require("./template-types"), exports);
__exportStar(require("./template-validation"), exports);

},{"./compiler":44,"./compiler-bch/compiler-bch":39,"./compiler-defaults":40,"./compiler-operation-helpers":41,"./compiler-operations":42,"./compiler-types":43,"./language/language":48,"./scenarios":53,"./standard/standard":55,"./template-types":56,"./template-validation":57}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safelyExtendCompilationData = exports.extractMissingVariables = exports.extractResolvedVariables = exports.generateTransaction = exports.compileInputTemplate = exports.compileOutputTemplate = void 0;
const language_utils_1 = require("../template/language/language-utils");
const transaction_serialization_1 = require("./transaction-serialization");
const returnFailedCompilationDirective = ({ index, result, type, }) => {
    return Object.assign(Object.assign({ errors: result.errors.map((error) => (Object.assign(Object.assign({}, error), { error: `Failed compilation of ${type} directive at index "${index}": ${error.error}` }))), index }, (result.errorType === 'parse' ? {} : { resolved: result.resolve })), { type });
};
exports.compileOutputTemplate = ({ outputTemplate, index, }) => {
    if ('script' in outputTemplate.lockingBytecode) {
        const directive = outputTemplate.lockingBytecode;
        const data = directive.data === undefined ? {} : directive.data;
        const result = directive.compiler.generateBytecode(directive.script, data, true);
        return result.success
            ? {
                lockingBytecode: result.bytecode,
                satoshis: outputTemplate.satoshis,
            }
            : returnFailedCompilationDirective({ index, result, type: 'locking' });
    }
    return {
        lockingBytecode: outputTemplate.lockingBytecode.slice(),
        satoshis: outputTemplate.satoshis,
    };
};
exports.compileInputTemplate = ({ inputTemplate, index, outputs, template, transactionOutpoints, transactionSequenceNumbers, }) => {
    if ('script' in inputTemplate.unlockingBytecode) {
        const directive = inputTemplate.unlockingBytecode;
        const correspondingOutput = outputs[index];
        const result = directive.compiler.generateBytecode(directive.script, Object.assign(Object.assign({}, directive.data), { transactionContext: {
                correspondingOutput: correspondingOutput === undefined
                    ? undefined
                    : transaction_serialization_1.encodeOutput(correspondingOutput),
                locktime: template.locktime,
                outpointIndex: inputTemplate.outpointIndex,
                outpointTransactionHash: inputTemplate.outpointTransactionHash.slice(),
                outputValue: directive.satoshis,
                sequenceNumber: inputTemplate.sequenceNumber,
                transactionOutpoints: transactionOutpoints.slice(),
                transactionOutputs: transaction_serialization_1.encodeOutputsForSigning(outputs),
                transactionSequenceNumbers: transactionSequenceNumbers.slice(),
                version: template.version,
            } }), true);
        return result.success
            ? {
                outpointIndex: inputTemplate.outpointIndex,
                outpointTransactionHash: inputTemplate.outpointTransactionHash.slice(),
                sequenceNumber: inputTemplate.sequenceNumber,
                unlockingBytecode: result.bytecode,
            }
            : returnFailedCompilationDirective({ index, result, type: 'unlocking' });
    }
    return {
        outpointIndex: inputTemplate.outpointIndex,
        outpointTransactionHash: inputTemplate.outpointTransactionHash.slice(),
        sequenceNumber: inputTemplate.sequenceNumber,
        unlockingBytecode: inputTemplate.unlockingBytecode.slice(),
    };
};
/**
 * Generate a `Transaction` given a `TransactionTemplate` and any applicable
 * compilers and compilation data.
 *
 * Returns either a `Transaction` or an array of compilation errors.
 *
 * For each `CompilationDirective`, the `transactionContext` property will be
 * automatically provided to the compiler. All other necessary `CompilationData`
 * properties must be specified in the `TransactionTemplate`.
 *
 * @param template - the `TransactionTemplate` from which to create the
 * `Transaction`
 */
exports.generateTransaction = (template) => {
    const outputResults = template.outputs.map((outputTemplate, index) => exports.compileOutputTemplate({
        index,
        outputTemplate,
    }));
    const outputCompilationErrors = outputResults.filter((result) => 'errors' in result);
    if (outputCompilationErrors.length > 0) {
        const outputCompletions = outputResults
            .map((result, index) => 'lockingBytecode' in result
            ? { index, output: result, type: 'output' }
            : result)
            .filter((result) => 'output' in result);
        return {
            completions: outputCompletions,
            errors: outputCompilationErrors,
            stage: 'outputs',
            success: false,
        };
    }
    const outputs = outputResults;
    const inputSerializationElements = template.inputs.map((inputTemplate) => ({
        outpointIndex: inputTemplate.outpointIndex,
        outpointTransactionHash: inputTemplate.outpointTransactionHash.slice(),
        sequenceNumber: inputTemplate.sequenceNumber,
    }));
    const transactionOutpoints = transaction_serialization_1.encodeOutpoints(inputSerializationElements);
    const transactionSequenceNumbers = transaction_serialization_1.encodeSequenceNumbersForSigning(inputSerializationElements);
    const inputResults = template.inputs.map((inputTemplate, index) => exports.compileInputTemplate({
        index,
        inputTemplate,
        outputs,
        template,
        transactionOutpoints,
        transactionSequenceNumbers,
    }));
    const inputCompilationErrors = inputResults.filter((result) => 'errors' in result);
    if (inputCompilationErrors.length > 0) {
        const inputCompletions = inputResults
            .map((result, index) => 'unlockingBytecode' in result
            ? { index, input: result, type: 'input' }
            : result)
            .filter((result) => 'input' in result);
        return {
            completions: inputCompletions,
            errors: inputCompilationErrors,
            stage: 'inputs',
            success: false,
        };
    }
    const inputs = inputResults;
    return {
        success: true,
        transaction: {
            inputs,
            locktime: template.locktime,
            outputs,
            version: template.version,
        },
    };
};
/**
 * TODO: fundamentally unsound, migrate to PST format
 *
 * Extract a map of successfully resolved variables to their resolved bytecode.
 *
 * @param transactionGenerationError - a transaction generation attempt where
 * `success` is `false`
 */
exports.extractResolvedVariables = (transactionGenerationError) => transactionGenerationError.errors.reduce((all, error) => error.resolved === undefined
    ? all
    : Object.assign(Object.assign({}, all), language_utils_1.extractResolvedVariableBytecodeMap(error.resolved)), {});
/**
 * TODO: fundamentally unsound, migrate to PST format
 *
 * Given an unsuccessful transaction generation result, extract a map of the
 * identifiers missing from the compilation mapped to the entity which owns each
 * variable.
 *
 * Returns `false` if any errors are fatal (the error either cannot be resolved
 * by providing a variable, or the entity ownership of the required variable was
 * not provided in the compilation data).
 *
 * @param transactionGenerationError - a transaction generation result where
 * `success` is `false`
 */
exports.extractMissingVariables = (transactionGenerationError) => {
    const allErrors = transactionGenerationError.errors.reduce((all, error) => [...all, ...error.errors], []);
    if (!language_utils_1.allErrorsAreRecoverable(allErrors)) {
        return false;
    }
    return allErrors.reduce((all, error) => (Object.assign(Object.assign({}, all), { [error.missingIdentifier]: error.owningEntity })), {});
};
/**
 * TODO: fundamentally unsound, migrate to PST format
 *
 * Safely extend a compilation data with resolutions provided by other entities
 * (via `extractResolvedVariables`).
 *
 * It is security-critical that compilation data only be extended with expected
 * identifiers from the proper owning entity of each variable. See
 * `CompilationData.bytecode` for details.
 *
 * Returns `false` if any errors are fatal (the error either cannot be resolved
 * by providing a variable, or the entity ownership of the required variable was
 * not provided in the compilation data).
 *
 * @remarks
 * To determine which identifiers are required by a given compilation, the
 * compilation is first attempted with only trusted variables: variables owned
 * or previously verified (like `WalletData`) by the compiling entity. If this
 * compilation produces a `TransactionGenerationError`, the error can be
 * provided to `safelyExtendCompilationData`, along with the trusted compilation
 * data and a mapping of untrusted resolutions (where the result of
 * `extractResolvedVariables` is assigned to the entity ID of the entity from
 * which they were received).
 *
 * The first compilation must use only trusted compilation data
 */
exports.safelyExtendCompilationData = (transactionGenerationError, trustedCompilationData, untrustedResolutions) => {
    const missing = exports.extractMissingVariables(transactionGenerationError);
    if (missing === false)
        return false;
    const selectedResolutions = Object.entries(missing).reduce((all, [identifier, entityId]) => {
        const entityResolution = untrustedResolutions[entityId];
        if (entityResolution === undefined) {
            return all;
        }
        const resolution = entityResolution[identifier];
        if (resolution === undefined) {
            return all;
        }
        return Object.assign(Object.assign({}, all), { [identifier]: resolution });
    }, {});
    return Object.assign(Object.assign({}, trustedCompilationData), { bytecode: Object.assign(Object.assign({}, selectedResolutions), trustedCompilationData.bytecode) });
};

},{"../template/language/language-utils":47,"./transaction-serialization":60}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSequenceNumbersForSigning = exports.encodeOutputsForSigning = exports.encodeOutpoints = exports.getTransactionHash = exports.getTransactionHashLE = exports.getTransactionHashBE = exports.encodeTransaction = exports.decodeTransaction = exports.TransactionDecodingError = exports.decodeTransactionUnsafe = exports.encodeOutputsForTransaction = exports.encodeOutput = exports.readTransactionOutput = exports.encodeInputs = exports.encodeInput = exports.readTransactionInput = void 0;
const format_1 = require("../format/format");
/**
 * @param bin - the raw transaction from which to read the input
 * @param offset - the offset at which the input begins
 */
exports.readTransactionInput = (bin, offset) => {
    const sha256HashBytes = 32;
    const uint32Bytes = 4;
    const offsetAfterTxHash = offset + sha256HashBytes;
    const outpointTransactionHash = bin
        .slice(offset, offsetAfterTxHash)
        .reverse();
    const offsetAfterOutpointIndex = offsetAfterTxHash + uint32Bytes;
    const outpointIndex = format_1.binToNumberUint32LE(bin.subarray(offsetAfterTxHash, offsetAfterOutpointIndex));
    const { nextOffset: offsetAfterBytecodeLength, value: bytecodeLength, } = format_1.readBitcoinVarInt(bin, offsetAfterOutpointIndex);
    const offsetAfterBytecode = offsetAfterBytecodeLength + Number(bytecodeLength);
    const unlockingBytecode = bin.slice(offsetAfterBytecodeLength, offsetAfterBytecode);
    const nextOffset = offsetAfterBytecode + uint32Bytes;
    const sequenceNumber = format_1.binToNumberUint32LE(bin.subarray(offsetAfterBytecode, nextOffset));
    return {
        input: {
            outpointIndex,
            outpointTransactionHash,
            sequenceNumber,
            unlockingBytecode,
        },
        nextOffset,
    };
};
/**
 * Encode a single input for inclusion in an encoded transaction.
 *
 * @param output - the input to encode
 */
exports.encodeInput = (input) => format_1.flattenBinArray([
    input.outpointTransactionHash.slice().reverse(),
    format_1.numberToBinUint32LE(input.outpointIndex),
    format_1.bigIntToBitcoinVarInt(BigInt(input.unlockingBytecode.length)),
    input.unlockingBytecode,
    format_1.numberToBinUint32LE(input.sequenceNumber),
]);
/**
 * Encode a set of inputs for inclusion in an encoded transaction including
 * the prefixed number of inputs.
 *
 * Format: [BitcoinVarInt: input count] [encoded inputs]
 *
 * @param inputs - the set of inputs to encode
 */
exports.encodeInputs = (inputs) => format_1.flattenBinArray([
    format_1.bigIntToBitcoinVarInt(BigInt(inputs.length)),
    ...inputs.map(exports.encodeInput),
]);
/**
 * Read a single transaction output from an encoded transaction.
 *
 * @param bin - the raw transaction from which to read the output
 * @param offset - the offset at which the output begins
 */
exports.readTransactionOutput = (bin, offset) => {
    const uint64Bytes = 8;
    const offsetAfterSatoshis = offset + uint64Bytes;
    const satoshis = bin.slice(offset, offsetAfterSatoshis);
    const { nextOffset: offsetAfterScriptLength, value } = format_1.readBitcoinVarInt(bin, offsetAfterSatoshis);
    const bytecodeLength = Number(value);
    const nextOffset = offsetAfterScriptLength + bytecodeLength;
    const lockingBytecode = bytecodeLength === 0
        ? new Uint8Array()
        : bin.slice(offsetAfterScriptLength, nextOffset);
    return {
        nextOffset,
        output: {
            lockingBytecode,
            satoshis,
        },
    };
};
/**
 * Encode a single output for inclusion in an encoded transaction.
 *
 * @param output - the output to encode
 */
exports.encodeOutput = (output) => format_1.flattenBinArray([
    output.satoshis,
    format_1.bigIntToBitcoinVarInt(BigInt(output.lockingBytecode.length)),
    output.lockingBytecode,
]);
/**
 * Encode a set of outputs for inclusion in an encoded transaction
 * including the prefixed number of outputs.
 *
 * Format: [BitcoinVarInt: output count] [encoded outputs]
 *
 * @param outputs - the set of outputs to encode
 */
exports.encodeOutputsForTransaction = (outputs) => format_1.flattenBinArray([
    format_1.bigIntToBitcoinVarInt(BigInt(outputs.length)),
    ...outputs.map(exports.encodeOutput),
]);
/**
 * Decode a `Uint8Array` using the version 1 or 2 raw transaction format.
 *
 * Note: this method throws runtime errors when attempting to decode messages
 * which do not properly follow the transaction format. If the input is
 * untrusted, use `decodeTransaction`.
 *
 * @param bin - the raw message to decode
 */
exports.decodeTransactionUnsafe = (bin) => {
    const uint32Bytes = 4;
    const version = format_1.binToNumberUint32LE(bin.subarray(0, uint32Bytes));
    const offsetAfterVersion = uint32Bytes;
    const { nextOffset: offsetAfterInputCount, value: inputCount, } = format_1.readBitcoinVarInt(bin, offsetAfterVersion);
    // eslint-disable-next-line functional/no-let
    let cursor = offsetAfterInputCount;
    const inputs = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < Number(inputCount); i++) {
        const { input, nextOffset } = exports.readTransactionInput(bin, cursor);
        // eslint-disable-next-line functional/no-expression-statement
        cursor = nextOffset;
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        inputs.push(input);
    }
    const { nextOffset: offsetAfterOutputCount, value: outputCount, } = format_1.readBitcoinVarInt(bin, cursor);
    // eslint-disable-next-line functional/no-expression-statement
    cursor = offsetAfterOutputCount;
    const outputs = [];
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < Number(outputCount); i++) {
        const { output, nextOffset } = exports.readTransactionOutput(bin, cursor);
        // eslint-disable-next-line functional/no-expression-statement
        cursor = nextOffset;
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        outputs.push(output);
    }
    const locktime = format_1.binToNumberUint32LE(bin.subarray(cursor, cursor + uint32Bytes));
    return {
        inputs,
        locktime,
        outputs,
        version,
    };
};
var TransactionDecodingError;
(function (TransactionDecodingError) {
    TransactionDecodingError["invalidFormat"] = "Transaction decoding error: message does not follow the version 1 or version 2 transaction format.";
})(TransactionDecodingError = exports.TransactionDecodingError || (exports.TransactionDecodingError = {}));
/**
 * Decode a `Uint8Array` using the version 1 or 2 raw transaction format.
 *
 * @param bin - the raw message to decode
 */
exports.decodeTransaction = (bin) => {
    // eslint-disable-next-line functional/no-try-statement
    try {
        return exports.decodeTransactionUnsafe(bin);
    }
    catch (_a) {
        return TransactionDecodingError.invalidFormat;
    }
};
/**
 * Encode a `Transaction` using the standard P2P network format. This
 * serialization is also used when computing the transaction's hash (A.K.A.
 * "transaction ID" or "TXID").
 */
exports.encodeTransaction = (tx) => format_1.flattenBinArray([
    format_1.numberToBinUint32LE(tx.version),
    exports.encodeInputs(tx.inputs),
    exports.encodeOutputsForTransaction(tx.outputs),
    format_1.numberToBinUint32LE(tx.locktime),
]);
/**
 * Compute a transaction hash (A.K.A. "transaction ID" or "TXID") from an
 * encoded transaction in big-endian byte order. This is the byte order
 * typically used by block explorers and other user interfaces.
 *
 * @returns the transaction hash as a string
 *
 * @param transaction - the encoded transaction
 * @param sha256 - an implementation of sha256
 */
exports.getTransactionHashBE = (sha256, transaction) => sha256.hash(sha256.hash(transaction));
/**
 * Compute a transaction hash (A.K.A. "transaction ID" or "TXID") from an
 * encoded transaction in little-endian byte order. This is the byte order
 * used in P2P network messages.
 *
 * @remarks
 * The result of sha256 is defined by its specification as big-endian, but
 * bitcoin message formats always reverse the order of this result for
 * serialization in P2P network messages.
 *
 * @returns the transaction hash in little-endian byte order
 *
 * @param transaction - the encoded transaction
 * @param sha256 - an implementation of sha256
 */
exports.getTransactionHashLE = (sha256, transaction) => exports.getTransactionHashBE(sha256, transaction).reverse();
/**
 * Return a `Transaction`'s hash as a string (in big-endian byte order as is
 * common for user interfaces).
 *
 * @param transaction - the encoded transaction
 * @param sha256 - an implementation of sha256
 */
exports.getTransactionHash = (sha256, transaction) => format_1.binToHex(exports.getTransactionHashBE(sha256, transaction));
/**
 * Get the hash of all outpoints in a series of inputs. (For use in
 * `hashTransactionOutpoints`.)
 *
 * @param inputs - the series of inputs from which to extract the outpoints
 * @param sha256 - an implementation of sha256
 */
exports.encodeOutpoints = (inputs) => format_1.flattenBinArray(inputs.map((i) => format_1.flattenBinArray([
    i.outpointTransactionHash.slice().reverse(),
    format_1.numberToBinUint32LE(i.outpointIndex),
])));
/**
 * Encode an array of transaction outputs for use in transaction signing
 * serializations.
 *
 * @param outputs - the array of outputs to encode
 */
exports.encodeOutputsForSigning = (outputs) => format_1.flattenBinArray(outputs.map(exports.encodeOutput));
/**
 * Encode an array of input sequence numbers for use in transaction signing
 * serializations.
 *
 * @param inputs - the array of inputs from which to extract the sequence
 * numbers
 */
exports.encodeSequenceNumbersForSigning = (inputs) => format_1.flattenBinArray(inputs.map((i) => format_1.numberToBinUint32LE(i.sequenceNumber)));

},{"../format/format":27}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidSatoshis = void 0;
/**
 * The maximum uint64 value – an impossibly large, intentionally invalid value
 * for `satoshis`. See `Transaction.satoshis` for details.
 */
// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
exports.invalidSatoshis = Uint8Array.from([255, 255, 255, 255, 255, 255, 255, 255]);

},{}],62:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generate-transaction"), exports);
__exportStar(require("./transaction-serialization"), exports);
__exportStar(require("./transaction-types"), exports);
__exportStar(require("./verify-transaction"), exports);

},{"./generate-transaction":59,"./transaction-serialization":60,"./transaction-types":61,"./verify-transaction":63}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTransaction = void 0;
/**
 * Statelessly verify a transaction given an `AuthenticationVirtualMachine` and
 * a list of spent outputs (the `lockingBytecode` and `satoshis` being spent by
 * each input).
 *
 * Note, while the virtual machine will evaluate locktime-related operations
 * against the transactions own `locktime`, this method does not verify the
 * transaction's `locktime` property itself (allowing verification to be
 * stateless).
 *
 * Before a statelessly verified transaction can be added to the blockchain,
 * node implementations must confirm that:
 * - all `spentOutputs` are still unspent, and
 * - both relative and absolute locktime consensus requirements have been met.
 * (See BIP65, BIP68, and BIP112 for details.)
 *
 * @param spentOutputs - an array of the `Output`s spent by the transaction's
 * `inputs` in matching order (`inputs[0]` spends `spentOutputs[0]`, etc.)
 * @param transaction - the transaction to verify
 * @param vm - the authentication virtual machine to use in validation
 */
exports.verifyTransaction = ({ spentOutputs, transaction, vm, }) => {
    if (transaction.inputs.length !== spentOutputs.length) {
        return [
            'Unable to verify transaction: a spent output must be provided for each transaction input.',
        ];
    }
    const errors = transaction.inputs.reduce((all, _, index) => {
        const program = {
            inputIndex: index,
            sourceOutput: spentOutputs[index],
            spendingTransaction: transaction,
        };
        const state = vm.evaluate(program);
        const verify = vm.verify(state);
        if (verify === true) {
            return all;
        }
        return [...all, `Error in evaluating input index "${index}": ${verify}`];
    }, []);
    return errors.length === 0 ? true : errors;
};

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcodeDescriptionsBCH = exports.OpcodeDescriptionsUniqueBCH = void 0;
const descriptions_1 = require("../common/descriptions");
var OpcodeDescriptionsUniqueBCH;
(function (OpcodeDescriptionsUniqueBCH) {
    OpcodeDescriptionsUniqueBCH["OP_CAT"] = "Pop the top 2 items from the stack and concatenate them, pushing the result.";
    OpcodeDescriptionsUniqueBCH["OP_SPLIT"] = "Pop the top item from the stack as an index (Script Number) and the next item as a byte array. Split the byte array into two stack items at the index (zero-based), pushing the results.";
    OpcodeDescriptionsUniqueBCH["OP_NUM2BIN"] = "Pop the top item from the stack as an item length (Script Number) and the next item as a Script Number (without encoding restrictions). Re-encode the number using a byte array of the provided length, filling any unused bytes with zeros. (If the requested length is too short to encode the number, error.)";
    OpcodeDescriptionsUniqueBCH["OP_BIN2NUM"] = "Pop the top item from the stack as a Script Number without encoding restrictions. Minimally-encode the number and push the result. (If the number can't be encoded in 4 bytes or less, error.)";
    OpcodeDescriptionsUniqueBCH["OP_AND"] = "Pop the top 2 items from the stack and perform a bitwise AND on each byte, pushing the result. If the length of the items are not equal, error.";
    OpcodeDescriptionsUniqueBCH["OP_OR"] = "Pop the top 2 items from the stack and perform a bitwise OR on each byte, pushing the result. If the length of the items are not equal, error.";
    OpcodeDescriptionsUniqueBCH["OP_XOR"] = "Pop the top 2 items from the stack and perform a bitwise XOR on each byte, pushing the result. If the length of the items are not equal, error.";
    OpcodeDescriptionsUniqueBCH["OP_DIV"] = "Pop the top item from the stack as a denominator (Script Number) and the next as a numerator (Script Number). Divide and push the result to the stack.";
    OpcodeDescriptionsUniqueBCH["OP_MOD"] = "Pop the top item from the stack as a denominator (Script Number) and the next as a numerator (Script Number). Divide and push the remainder to the stack.";
    OpcodeDescriptionsUniqueBCH["OP_CHECKDATASIG"] = "Pop the top 3 items from the stack. Treat the top as a public key, the second as a message, and the third as a signature. If the signature is valid, push a Script Number 1, otherwise push a Script Number 0.";
    OpcodeDescriptionsUniqueBCH["OP_CHECKDATASIGVERIFY"] = "Pop the top 3 items from the stack. Treat the top as a public key, the second as a message, and the third as a signature. If the signature is not valid, error. (This operation is a combination of OP_CHECKDATASIG followed by OP_VERIFY.)";
    OpcodeDescriptionsUniqueBCH["OP_REVERSEBYTES"] = "Pop the top item from the stack and reverse it, pushing the result.";
})(OpcodeDescriptionsUniqueBCH = exports.OpcodeDescriptionsUniqueBCH || (exports.OpcodeDescriptionsUniqueBCH = {}));
/**
 * A map of descriptions for each Bitcoin Cash opcode.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.OpcodeDescriptionsBCH = Object.assign(Object.assign({}, descriptions_1.OpcodeDescriptionsCommon), OpcodeDescriptionsUniqueBCH);

},{"../common/descriptions":78}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationErrorBCH = void 0;
var AuthenticationErrorBCH;
(function (AuthenticationErrorBCH) {
    AuthenticationErrorBCH["exceededMaximumOperationCount"] = "Program exceeded the maximum operation count (201 operations).";
    AuthenticationErrorBCH["exceededMaximumStackItemLength"] = "Program attempted to push a stack item which exceeded the maximum stack item length (520 bytes).";
    AuthenticationErrorBCH["exceededMaximumScriptNumberLength"] = "Program attempted an OP_BIN2NUM operation on a byte sequence which cannot be encoded within the maximum Script Number length (4 bytes).";
    AuthenticationErrorBCH["divisionByZero"] = "Program attempted to divide a number by zero.";
    AuthenticationErrorBCH["insufficientLength"] = "Program called an OP_NUM2BIN operation with an insufficient byte length to re-encode the provided number.";
    AuthenticationErrorBCH["invalidSplitIndex"] = "Program called an OP_SPLIT operation with an invalid index.";
    AuthenticationErrorBCH["malformedP2shBytecode"] = "Redeem bytecode was malformed prior to P2SH evaluation.";
    AuthenticationErrorBCH["mismatchedBitwiseOperandLength"] = "Program attempted a bitwise operation on operands of different lengths.";
    AuthenticationErrorBCH["requiresPushOnly"] = "Unlocking bytecode may contain only push operations.";
})(AuthenticationErrorBCH = exports.AuthenticationErrorBCH || (exports.AuthenticationErrorBCH = {}));

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInstructionSetBCH = exports.getFlagsForInstructionSetBCH = exports.instructionSetBCHCurrentStrict = exports.InstructionSetBCH = exports.isWitnessProgram = exports.isPayToScriptHash = exports.OpcodesBCH = void 0;
const combinators_1 = require("../common/combinators");
const common_1 = require("../common/common");
const instruction_sets_utils_1 = require("../instruction-sets-utils");
const bch_errors_1 = require("./bch-errors");
const bch_opcodes_1 = require("./bch-opcodes");
Object.defineProperty(exports, "OpcodesBCH", { enumerable: true, get: function () { return bch_opcodes_1.OpcodesBCH; } });
const bch_operations_1 = require("./bch-operations");
exports.isPayToScriptHash = (verificationInstructions) => verificationInstructions.length === 3 /* length */ &&
    verificationInstructions[0].opcode ===
        bch_opcodes_1.OpcodesBCH.OP_HASH160 &&
    verificationInstructions[1].opcode ===
        bch_opcodes_1.OpcodesBCH.OP_PUSHBYTES_20 &&
    verificationInstructions[2 /* lastElement */]
        .opcode === bch_opcodes_1.OpcodesBCH.OP_EQUAL;
/**
 * Test a stack item for the SegWit Recovery Rules activated in `BCH_2019_05`.
 *
 * @param bytecode - the stack item to test
 */
// eslint-disable-next-line complexity
exports.isWitnessProgram = (bytecode) => {
    const correctLength = bytecode.length >= 4 /* minimumLength */ &&
        bytecode.length <= 42 /* maximumLength */;
    const validVersionPush = bytecode[0] === 0 /* OP_0 */ ||
        (bytecode[0] >= 81 /* OP_1 */ && bytecode[0] <= 96 /* OP_16 */);
    const correctLengthByte = bytecode[1] + 2 /* versionAndLengthBytes */ === bytecode.length;
    return correctLength && validVersionPush && correctLengthByte;
};
/**
 * From C++ implementation:
 * Note that IsPushOnly() *does* consider OP_RESERVED to be a push-type
 * opcode, however execution of OP_RESERVED fails, so it's not relevant to
 * P2SH/BIP62 as the scriptSig would fail prior to the P2SH special
 * validation code being executed.
 */
const isPushOperation = (opcode) => opcode < bch_opcodes_1.OpcodesBCH.OP_16;
/**
 * This library's supported versions of the BCH virtual machine. "Strict"
 * versions (A.K.A. `isStandard` from the C++ implementations) enable additional
 * validation which is commonly used on the P2P network before relaying
 * transactions. Transactions which fail these rules are often called
 * "non-standard" – the transactions can technically be included by miners in
 * valid blocks, but most network nodes will refuse to relay them.
 *
 * BCH instruction sets marked `SPEC` ("specification") have not yet been
 * deployed on the main network and are subject to change. After deployment, the
 * `SPEC` suffix is removed. This change only effects the name of the TypeScript
 * enum member – the value remains the same. E.g.
 * `InstructionSetBCH.BCH_2020_05_SPEC` became `InstructionSetBCH.BCH_2020_05`,
 * but the value remained `BCH_2020_05`.
 *
 * This allows consumers to select an upgrade policy: when a version of Libauth
 * is released in which compatibility with a deployed virtual machine is
 * confirmed, this change can help to identify downstream code which requires
 * review.
 *  - Consumers which prefer to upgrade manually should specify a `SPEC` type,
 * e.g. `InstructionSetBCH.BCH_2020_05_SPEC`.
 *  - Consumers which prefer full compatibility between Libauth version should
 * specify a precise instruction set value (e.g. `BCH_2020_05`) or use the
 * dedicated "current" value: `instructionSetBCHCurrentStrict`.
 */
var InstructionSetBCH;
(function (InstructionSetBCH) {
    InstructionSetBCH["BCH_2019_05"] = "BCH_2019_05";
    InstructionSetBCH["BCH_2019_05_STRICT"] = "BCH_2019_05_STRICT";
    InstructionSetBCH["BCH_2019_11"] = "BCH_2019_11";
    InstructionSetBCH["BCH_2019_11_STRICT"] = "BCH_2019_11_STRICT";
    InstructionSetBCH["BCH_2020_05"] = "BCH_2020_05";
    InstructionSetBCH["BCH_2020_05_STRICT"] = "BCH_2020_05_STRICT";
    InstructionSetBCH["BCH_2020_11_SPEC"] = "BCH_2020_11";
    InstructionSetBCH["BCH_2020_11_STRICT_SPEC"] = "BCH_2020_11_STRICT";
    InstructionSetBCH["BCH_2021_05_SPEC"] = "BCH_2021_05";
    InstructionSetBCH["BCH_2021_05_STRICT_SPEC"] = "BCH_2021_05_STRICT";
    InstructionSetBCH["BCH_2021_11_SPEC"] = "BCH_2021_11";
    InstructionSetBCH["BCH_2021_11_STRICT_SPEC"] = "BCH_2021_11_STRICT";
    InstructionSetBCH["BCH_2022_05_SPEC"] = "BCH_2022_05";
    InstructionSetBCH["BCH_2022_05_STRICT_SPEC"] = "BCH_2022_05_STRICT";
    InstructionSetBCH["BCH_2022_11_SPEC"] = "BCH_2022_11";
    InstructionSetBCH["BCH_2022_11_STRICT_SPEC"] = "BCH_2022_11_STRICT";
})(InstructionSetBCH = exports.InstructionSetBCH || (exports.InstructionSetBCH = {}));
/**
 * The current strict virtual machine version used by the Bitcoin Cash (BCH)
 * network.
 */
exports.instructionSetBCHCurrentStrict = InstructionSetBCH.BCH_2020_05_STRICT;
// eslint-disable-next-line complexity
exports.getFlagsForInstructionSetBCH = (instructionSet) => {
    switch (instructionSet) {
        case InstructionSetBCH.BCH_2019_05:
            return {
                disallowUpgradableNops: false,
                opReverseBytes: false,
                requireBugValueZero: false,
                requireMinimalEncoding: false,
                requireNullSignatureFailures: true,
            };
        case InstructionSetBCH.BCH_2019_05_STRICT:
            return {
                disallowUpgradableNops: true,
                opReverseBytes: false,
                requireBugValueZero: false,
                requireMinimalEncoding: true,
                requireNullSignatureFailures: true,
            };
        case InstructionSetBCH.BCH_2019_11:
            return {
                disallowUpgradableNops: false,
                opReverseBytes: false,
                requireBugValueZero: true,
                requireMinimalEncoding: true,
                requireNullSignatureFailures: true,
            };
        case InstructionSetBCH.BCH_2019_11_STRICT:
            return {
                disallowUpgradableNops: true,
                opReverseBytes: false,
                requireBugValueZero: true,
                requireMinimalEncoding: true,
                requireNullSignatureFailures: true,
            };
        case InstructionSetBCH.BCH_2020_05:
            return {
                disallowUpgradableNops: false,
                opReverseBytes: true,
                requireBugValueZero: false,
                requireMinimalEncoding: false,
                requireNullSignatureFailures: true,
            };
        case InstructionSetBCH.BCH_2020_05_STRICT:
            return {
                disallowUpgradableNops: true,
                opReverseBytes: true,
                requireBugValueZero: true,
                requireMinimalEncoding: true,
                requireNullSignatureFailures: true,
            };
        default:
            return new Error(`${instructionSet} is not a known instruction set.`);
    }
};
/**
 * Initialize a new instruction set for the BCH virtual machine.
 *
 * @param flags - an object configuring the flags for this vm (see
 * `getFlagsForInstructionSetBCH`)
 * @param sha1 - a Sha1 implementation
 * @param sha256 - a Sha256 implementation
 * @param ripemd160 - a Ripemd160 implementation
 * @param secp256k1 - a Secp256k1 implementation
 */
exports.createInstructionSetBCH = ({ flags, ripemd160, secp256k1, sha1, sha256, }) => (Object.assign(Object.assign({ clone: common_1.cloneAuthenticationProgramStateCommon, continue: (state) => state.error === undefined && state.ip < state.instructions.length, 
    // eslint-disable-next-line complexity
    evaluate: (program, stateEvaluate) => {
        var _a;
        const { unlockingBytecode } = program.spendingTransaction.inputs[program.inputIndex];
        const { lockingBytecode } = program.sourceOutput;
        const unlockingInstructions = instruction_sets_utils_1.parseBytecode(unlockingBytecode);
        const lockingInstructions = instruction_sets_utils_1.parseBytecode(lockingBytecode);
        const externalState = common_1.createTransactionContextCommon(program);
        const initialState = common_1.createAuthenticationProgramStateCommon({
            instructions: unlockingInstructions,
            stack: [],
            transactionContext: externalState,
        });
        const unlockingResult = unlockingBytecode.length > common_1.ConsensusCommon.maximumBytecodeLength
            ? common_1.applyError(common_1.AuthenticationErrorCommon.exceededMaximumBytecodeLengthUnlocking, initialState)
            : instruction_sets_utils_1.authenticationInstructionsAreMalformed(unlockingInstructions)
                ? common_1.applyError(common_1.AuthenticationErrorCommon.malformedUnlockingBytecode, initialState)
                : lockingBytecode.length > common_1.ConsensusCommon.maximumBytecodeLength
                    ? common_1.applyError(common_1.AuthenticationErrorCommon.exceededMaximumBytecodeLengthLocking, initialState)
                    : instruction_sets_utils_1.authenticationInstructionsAreMalformed(lockingInstructions)
                        ? common_1.applyError(common_1.AuthenticationErrorCommon.malformedLockingBytecode, initialState)
                        : initialState.instructions.every((instruction) => isPushOperation(instruction.opcode))
                            ? stateEvaluate(initialState)
                            : common_1.applyError(bch_errors_1.AuthenticationErrorBCH.requiresPushOnly, initialState);
        if (unlockingResult.error !== undefined) {
            return unlockingResult;
        }
        const lockingResult = stateEvaluate(common_1.createAuthenticationProgramStateCommon({
            instructions: lockingInstructions,
            stack: unlockingResult.stack,
            transactionContext: externalState,
        }));
        if (!exports.isPayToScriptHash(lockingInstructions)) {
            return lockingResult;
        }
        const p2shStack = common_1.cloneStack(unlockingResult.stack);
        // eslint-disable-next-line functional/immutable-data
        const p2shScript = (_a = p2shStack.pop()) !== null && _a !== void 0 ? _a : Uint8Array.of();
        if (p2shStack.length === 0 && exports.isWitnessProgram(p2shScript)) {
            return lockingResult;
        }
        const p2shInstructions = instruction_sets_utils_1.parseBytecode(p2shScript);
        return instruction_sets_utils_1.authenticationInstructionsAreMalformed(p2shInstructions)
            ? Object.assign(Object.assign({}, lockingResult), { error: bch_errors_1.AuthenticationErrorBCH.malformedP2shBytecode }) : stateEvaluate(common_1.createAuthenticationProgramStateCommon({
            instructions: p2shInstructions,
            stack: p2shStack,
            transactionContext: externalState,
        }));
    }, operations: Object.assign(Object.assign({}, common_1.commonOperations({ flags, ripemd160, secp256k1, sha1, sha256 })), combinators_1.mapOverOperations(bch_operations_1.bitcoinCashOperations({
        flags,
        secp256k1,
        sha256,
    }), combinators_1.conditionallyEvaluate, combinators_1.incrementOperationCount, common_1.checkLimitsCommon)) }, common_1.undefinedOperation()), { verify: (state) => {
        if (state.error !== undefined) {
            return state.error;
        }
        if (state.executionStack.length !== 0) {
            return common_1.AuthenticationErrorCommon.nonEmptyExecutionStack;
        }
        if (state.stack.length !== 1) {
            return common_1.AuthenticationErrorCommon.requiresCleanStack;
        }
        if (!common_1.stackItemIsTruthy(state.stack[0])) {
            return common_1.AuthenticationErrorCommon.unsuccessfulEvaluation;
        }
        return true;
    } }));

},{"../common/combinators":75,"../common/common":76,"../instruction-sets-utils":91,"./bch-errors":65,"./bch-opcodes":67,"./bch-operations":68}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcodeAlternateNamesBCH = exports.OpcodesBCH = void 0;
var OpcodesBCH;
(function (OpcodesBCH) {
    /**
     * A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
     */
    OpcodesBCH[OpcodesBCH["OP_0"] = 0] = "OP_0";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
    OpcodesBCH[OpcodesBCH["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
    OpcodesBCH[OpcodesBCH["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
    OpcodesBCH[OpcodesBCH["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
    OpcodesBCH[OpcodesBCH["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
    OpcodesBCH[OpcodesBCH["OP_1NEGATE"] = 79] = "OP_1NEGATE";
    OpcodesBCH[OpcodesBCH["OP_RESERVED"] = 80] = "OP_RESERVED";
    /**
     * A.K.A. `OP_TRUE`
     */
    OpcodesBCH[OpcodesBCH["OP_1"] = 81] = "OP_1";
    OpcodesBCH[OpcodesBCH["OP_2"] = 82] = "OP_2";
    OpcodesBCH[OpcodesBCH["OP_3"] = 83] = "OP_3";
    OpcodesBCH[OpcodesBCH["OP_4"] = 84] = "OP_4";
    OpcodesBCH[OpcodesBCH["OP_5"] = 85] = "OP_5";
    OpcodesBCH[OpcodesBCH["OP_6"] = 86] = "OP_6";
    OpcodesBCH[OpcodesBCH["OP_7"] = 87] = "OP_7";
    OpcodesBCH[OpcodesBCH["OP_8"] = 88] = "OP_8";
    OpcodesBCH[OpcodesBCH["OP_9"] = 89] = "OP_9";
    OpcodesBCH[OpcodesBCH["OP_10"] = 90] = "OP_10";
    OpcodesBCH[OpcodesBCH["OP_11"] = 91] = "OP_11";
    OpcodesBCH[OpcodesBCH["OP_12"] = 92] = "OP_12";
    OpcodesBCH[OpcodesBCH["OP_13"] = 93] = "OP_13";
    OpcodesBCH[OpcodesBCH["OP_14"] = 94] = "OP_14";
    OpcodesBCH[OpcodesBCH["OP_15"] = 95] = "OP_15";
    OpcodesBCH[OpcodesBCH["OP_16"] = 96] = "OP_16";
    OpcodesBCH[OpcodesBCH["OP_NOP"] = 97] = "OP_NOP";
    OpcodesBCH[OpcodesBCH["OP_VER"] = 98] = "OP_VER";
    OpcodesBCH[OpcodesBCH["OP_IF"] = 99] = "OP_IF";
    OpcodesBCH[OpcodesBCH["OP_NOTIF"] = 100] = "OP_NOTIF";
    OpcodesBCH[OpcodesBCH["OP_VERIF"] = 101] = "OP_VERIF";
    OpcodesBCH[OpcodesBCH["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
    OpcodesBCH[OpcodesBCH["OP_ELSE"] = 103] = "OP_ELSE";
    OpcodesBCH[OpcodesBCH["OP_ENDIF"] = 104] = "OP_ENDIF";
    OpcodesBCH[OpcodesBCH["OP_VERIFY"] = 105] = "OP_VERIFY";
    OpcodesBCH[OpcodesBCH["OP_RETURN"] = 106] = "OP_RETURN";
    OpcodesBCH[OpcodesBCH["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
    OpcodesBCH[OpcodesBCH["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
    OpcodesBCH[OpcodesBCH["OP_2DROP"] = 109] = "OP_2DROP";
    OpcodesBCH[OpcodesBCH["OP_2DUP"] = 110] = "OP_2DUP";
    OpcodesBCH[OpcodesBCH["OP_3DUP"] = 111] = "OP_3DUP";
    OpcodesBCH[OpcodesBCH["OP_2OVER"] = 112] = "OP_2OVER";
    OpcodesBCH[OpcodesBCH["OP_2ROT"] = 113] = "OP_2ROT";
    OpcodesBCH[OpcodesBCH["OP_2SWAP"] = 114] = "OP_2SWAP";
    OpcodesBCH[OpcodesBCH["OP_IFDUP"] = 115] = "OP_IFDUP";
    OpcodesBCH[OpcodesBCH["OP_DEPTH"] = 116] = "OP_DEPTH";
    OpcodesBCH[OpcodesBCH["OP_DROP"] = 117] = "OP_DROP";
    OpcodesBCH[OpcodesBCH["OP_DUP"] = 118] = "OP_DUP";
    OpcodesBCH[OpcodesBCH["OP_NIP"] = 119] = "OP_NIP";
    OpcodesBCH[OpcodesBCH["OP_OVER"] = 120] = "OP_OVER";
    OpcodesBCH[OpcodesBCH["OP_PICK"] = 121] = "OP_PICK";
    OpcodesBCH[OpcodesBCH["OP_ROLL"] = 122] = "OP_ROLL";
    OpcodesBCH[OpcodesBCH["OP_ROT"] = 123] = "OP_ROT";
    OpcodesBCH[OpcodesBCH["OP_SWAP"] = 124] = "OP_SWAP";
    OpcodesBCH[OpcodesBCH["OP_TUCK"] = 125] = "OP_TUCK";
    OpcodesBCH[OpcodesBCH["OP_CAT"] = 126] = "OP_CAT";
    OpcodesBCH[OpcodesBCH["OP_SPLIT"] = 127] = "OP_SPLIT";
    OpcodesBCH[OpcodesBCH["OP_NUM2BIN"] = 128] = "OP_NUM2BIN";
    OpcodesBCH[OpcodesBCH["OP_BIN2NUM"] = 129] = "OP_BIN2NUM";
    OpcodesBCH[OpcodesBCH["OP_SIZE"] = 130] = "OP_SIZE";
    OpcodesBCH[OpcodesBCH["OP_INVERT"] = 131] = "OP_INVERT";
    OpcodesBCH[OpcodesBCH["OP_AND"] = 132] = "OP_AND";
    OpcodesBCH[OpcodesBCH["OP_OR"] = 133] = "OP_OR";
    OpcodesBCH[OpcodesBCH["OP_XOR"] = 134] = "OP_XOR";
    OpcodesBCH[OpcodesBCH["OP_EQUAL"] = 135] = "OP_EQUAL";
    OpcodesBCH[OpcodesBCH["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
    OpcodesBCH[OpcodesBCH["OP_RESERVED1"] = 137] = "OP_RESERVED1";
    OpcodesBCH[OpcodesBCH["OP_RESERVED2"] = 138] = "OP_RESERVED2";
    OpcodesBCH[OpcodesBCH["OP_1ADD"] = 139] = "OP_1ADD";
    OpcodesBCH[OpcodesBCH["OP_1SUB"] = 140] = "OP_1SUB";
    OpcodesBCH[OpcodesBCH["OP_2MUL"] = 141] = "OP_2MUL";
    OpcodesBCH[OpcodesBCH["OP_2DIV"] = 142] = "OP_2DIV";
    OpcodesBCH[OpcodesBCH["OP_NEGATE"] = 143] = "OP_NEGATE";
    OpcodesBCH[OpcodesBCH["OP_ABS"] = 144] = "OP_ABS";
    OpcodesBCH[OpcodesBCH["OP_NOT"] = 145] = "OP_NOT";
    OpcodesBCH[OpcodesBCH["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
    OpcodesBCH[OpcodesBCH["OP_ADD"] = 147] = "OP_ADD";
    OpcodesBCH[OpcodesBCH["OP_SUB"] = 148] = "OP_SUB";
    OpcodesBCH[OpcodesBCH["OP_MUL"] = 149] = "OP_MUL";
    OpcodesBCH[OpcodesBCH["OP_DIV"] = 150] = "OP_DIV";
    OpcodesBCH[OpcodesBCH["OP_MOD"] = 151] = "OP_MOD";
    OpcodesBCH[OpcodesBCH["OP_LSHIFT"] = 152] = "OP_LSHIFT";
    OpcodesBCH[OpcodesBCH["OP_RSHIFT"] = 153] = "OP_RSHIFT";
    OpcodesBCH[OpcodesBCH["OP_BOOLAND"] = 154] = "OP_BOOLAND";
    OpcodesBCH[OpcodesBCH["OP_BOOLOR"] = 155] = "OP_BOOLOR";
    OpcodesBCH[OpcodesBCH["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
    OpcodesBCH[OpcodesBCH["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
    OpcodesBCH[OpcodesBCH["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
    OpcodesBCH[OpcodesBCH["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
    OpcodesBCH[OpcodesBCH["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
    OpcodesBCH[OpcodesBCH["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
    OpcodesBCH[OpcodesBCH["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
    OpcodesBCH[OpcodesBCH["OP_MIN"] = 163] = "OP_MIN";
    OpcodesBCH[OpcodesBCH["OP_MAX"] = 164] = "OP_MAX";
    OpcodesBCH[OpcodesBCH["OP_WITHIN"] = 165] = "OP_WITHIN";
    OpcodesBCH[OpcodesBCH["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
    OpcodesBCH[OpcodesBCH["OP_SHA1"] = 167] = "OP_SHA1";
    OpcodesBCH[OpcodesBCH["OP_SHA256"] = 168] = "OP_SHA256";
    OpcodesBCH[OpcodesBCH["OP_HASH160"] = 169] = "OP_HASH160";
    OpcodesBCH[OpcodesBCH["OP_HASH256"] = 170] = "OP_HASH256";
    OpcodesBCH[OpcodesBCH["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
    OpcodesBCH[OpcodesBCH["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
    OpcodesBCH[OpcodesBCH["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
    OpcodesBCH[OpcodesBCH["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
    OpcodesBCH[OpcodesBCH["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
    OpcodesBCH[OpcodesBCH["OP_NOP1"] = 176] = "OP_NOP1";
    /**
     * Previously `OP_NOP2`
     */
    OpcodesBCH[OpcodesBCH["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
    /**
     * Previously `OP_NOP2`
     */
    OpcodesBCH[OpcodesBCH["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
    OpcodesBCH[OpcodesBCH["OP_NOP4"] = 179] = "OP_NOP4";
    OpcodesBCH[OpcodesBCH["OP_NOP5"] = 180] = "OP_NOP5";
    OpcodesBCH[OpcodesBCH["OP_NOP6"] = 181] = "OP_NOP6";
    OpcodesBCH[OpcodesBCH["OP_NOP7"] = 182] = "OP_NOP7";
    OpcodesBCH[OpcodesBCH["OP_NOP8"] = 183] = "OP_NOP8";
    OpcodesBCH[OpcodesBCH["OP_NOP9"] = 184] = "OP_NOP9";
    OpcodesBCH[OpcodesBCH["OP_NOP10"] = 185] = "OP_NOP10";
    /**
     * Previously `OP_UNKNOWN186`
     */
    OpcodesBCH[OpcodesBCH["OP_CHECKDATASIG"] = 186] = "OP_CHECKDATASIG";
    /**
     * Previously `OP_UNKNOWN187`
     */
    OpcodesBCH[OpcodesBCH["OP_CHECKDATASIGVERIFY"] = 187] = "OP_CHECKDATASIGVERIFY";
    /**
     * Previously `OP_UNKNOWN188`
     */
    OpcodesBCH[OpcodesBCH["OP_REVERSEBYTES"] = 188] = "OP_REVERSEBYTES";
    /**
     * A.K.A. `FIRST_UNDEFINED_OP_VALUE`
     */
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN192"] = 192] = "OP_UNKNOWN192";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN193"] = 193] = "OP_UNKNOWN193";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN194"] = 194] = "OP_UNKNOWN194";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN195"] = 195] = "OP_UNKNOWN195";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN196"] = 196] = "OP_UNKNOWN196";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN197"] = 197] = "OP_UNKNOWN197";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN198"] = 198] = "OP_UNKNOWN198";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN199"] = 199] = "OP_UNKNOWN199";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN200"] = 200] = "OP_UNKNOWN200";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN201"] = 201] = "OP_UNKNOWN201";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN202"] = 202] = "OP_UNKNOWN202";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN203"] = 203] = "OP_UNKNOWN203";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN204"] = 204] = "OP_UNKNOWN204";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN205"] = 205] = "OP_UNKNOWN205";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN206"] = 206] = "OP_UNKNOWN206";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN207"] = 207] = "OP_UNKNOWN207";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN208"] = 208] = "OP_UNKNOWN208";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN209"] = 209] = "OP_UNKNOWN209";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN210"] = 210] = "OP_UNKNOWN210";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN211"] = 211] = "OP_UNKNOWN211";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
    /**
     * A.K.A. `OP_PREFIX_BEGIN`
     */
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
    /**
     * A.K.A. `OP_PREFIX_END`
     */
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
    OpcodesBCH[OpcodesBCH["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
})(OpcodesBCH = exports.OpcodesBCH || (exports.OpcodesBCH = {}));
var OpcodeAlternateNamesBCH;
(function (OpcodeAlternateNamesBCH) {
    /**
     * A.K.A. `OP_0`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_FALSE"] = 0] = "OP_FALSE";
    /**
     * A.K.A. `OP_0`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUSHBYTES_0"] = 0] = "OP_PUSHBYTES_0";
    /**
     * A.K.A. `OP_1`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_TRUE"] = 81] = "OP_TRUE";
    /**
     * A.K.A. `OP_CHECKLOCKTIMEVERIFY`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_NOP2"] = 177] = "OP_NOP2";
    /**
     * A.K.A. `OP_CHECKSEQUENCEVERIFY`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_NOP3"] = 178] = "OP_NOP3";
    /**
     * A.K.A. `OP_CHECKDATASIG`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_UNKNOWN186"] = 186] = "OP_UNKNOWN186";
    /**
     * A.K.A. `OP_CHECKDATASIGVERIFY`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_UNKNOWN187"] = 187] = "OP_UNKNOWN187";
    /**
     * A.K.A. `OP_UNKNOWN189`
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["FIRST_UNDEFINED_OP_VALUE"] = 189] = "FIRST_UNDEFINED_OP_VALUE";
    /**
     * A.K.A. `OP_UNKNOWN240`. Some implementations have reserved opcodes
     * `0xf0` through `0xf7` for a future range of multi-byte opcodes, though none
     * are yet available on the network.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PREFIX_BEGIN"] = 240] = "OP_PREFIX_BEGIN";
    /**
     * A.K.A. `OP_UNKNOWN247`. Some implementations have reserved opcodes
     * `0xf0` through `0xf7` for a future range of multi-byte opcodes, though none
     * are yet available on the network.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PREFIX_END"] = 247] = "OP_PREFIX_END";
    /**
     * `OP_SMALLINTEGER` is used internally for template matching in the C++
     * implementation. When found on the network, it is `OP_UNKNOWN250`.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_SMALLINTEGER"] = 250] = "OP_SMALLINTEGER";
    /**
     * `OP_PUBKEYS` is used internally for template matching in the C++
     * implementation. When found on the network, it is `OP_UNKNOWN251`.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEYS"] = 251] = "OP_PUBKEYS";
    /**
     * `OP_PUBKEYHASH` is used internally for template matching in the C++
     * implementation. When found on the network, it is `OP_UNKNOWN253`.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEYHASH"] = 253] = "OP_PUBKEYHASH";
    /**
     * `OP_PUBKEY` is used internally for template matching in the C++
     * implementation. When found on the network, it is `OP_UNKNOWN254`.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_PUBKEY"] = 254] = "OP_PUBKEY";
    /**
     * `OP_INVALIDOPCODE` is described as such for testing in the C++
     * implementation. When found on the network, it is `OP_UNKNOWN255`.
     */
    OpcodeAlternateNamesBCH[OpcodeAlternateNamesBCH["OP_INVALIDOPCODE"] = 255] = "OP_INVALIDOPCODE";
})(OpcodeAlternateNamesBCH = exports.OpcodeAlternateNamesBCH || (exports.OpcodeAlternateNamesBCH = {}));

},{}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitcoinCashOperations = exports.opReverseBytes = exports.opCheckDataSigVerify = exports.opCheckDataSig = exports.isValidSignatureEncodingBCHRaw = exports.opMod = exports.opDiv = exports.opXor = exports.opOr = exports.opAnd = exports.bitwiseOperation = exports.opBin2Num = exports.opNum2Bin = exports.padMinimallyEncodedScriptNumber = exports.opSplit = exports.opCat = void 0;
const hex_1 = require("../../../format/hex");
const combinators_1 = require("../common/combinators");
const common_1 = require("../common/common");
const encoding_1 = require("../common/encoding");
const errors_1 = require("../common/errors");
const flow_control_1 = require("../common/flow-control");
const types_1 = require("../common/types");
const bch_errors_1 = require("./bch-errors");
const bch_opcodes_1 = require("./bch-opcodes");
const bch_types_1 = require("./bch-types");
exports.opCat = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => a.length + b.length > common_1.ConsensusCommon.maximumStackItemLength
    ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.exceededMaximumStackItemLength, nextState)
    : combinators_1.pushToStack(nextState, hex_1.flattenBinArray([a, b])));
exports.opSplit = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, value) => {
    const index = Number(value);
    return combinators_1.useOneStackItem(nextState, (finalState, [item]) => index < 0 || index > item.length
        ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.invalidSplitIndex, finalState)
        : combinators_1.pushToStack(finalState, item.slice(0, index), item.slice(index)));
}, { requireMinimalEncoding });
var Constants;
(function (Constants) {
    Constants[Constants["positiveSign"] = 0] = "positiveSign";
    Constants[Constants["negativeSign"] = 128] = "negativeSign";
})(Constants || (Constants = {}));
exports.padMinimallyEncodedScriptNumber = (scriptNumber, length) => {
    // eslint-disable-next-line functional/no-let
    let signBit = Constants.positiveSign;
    // eslint-disable-next-line functional/no-conditional-statement
    if (scriptNumber.length > 0) {
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise
        signBit = scriptNumber[scriptNumber.length - 1] & Constants.negativeSign;
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise, functional/immutable-data
        scriptNumber[scriptNumber.length - 1] &= Constants.negativeSign - 1;
    }
    const result = Array.from(scriptNumber);
    // eslint-disable-next-line functional/no-loop-statement
    while (result.length < length - 1) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        result.push(0);
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    result.push(signBit);
    return Uint8Array.from(result);
};
exports.opNum2Bin = () => (state) => combinators_1.useOneScriptNumber(state, (nextState, value) => {
    const targetLength = Number(value);
    return targetLength > common_1.ConsensusCommon.maximumStackItemLength
        ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.exceededMaximumStackItemLength, nextState)
        : combinators_1.useOneScriptNumber(nextState, (finalState, [target]) => {
            const minimallyEncoded = types_1.bigIntToScriptNumber(target);
            return minimallyEncoded.length > targetLength
                ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.insufficientLength, finalState)
                : minimallyEncoded.length === targetLength
                    ? combinators_1.pushToStack(finalState, minimallyEncoded)
                    : combinators_1.pushToStack(finalState, exports.padMinimallyEncodedScriptNumber(minimallyEncoded, targetLength));
        }, {
            maximumScriptNumberByteLength: 
            // TODO: is this right?
            common_1.ConsensusCommon.maximumStackItemLength,
            requireMinimalEncoding: false,
        });
}, { requireMinimalEncoding: true });
exports.opBin2Num = () => (state) => combinators_1.useOneScriptNumber(state, (nextState, [target]) => {
    const minimallyEncoded = types_1.bigIntToScriptNumber(target);
    return minimallyEncoded.length > common_1.ConsensusCommon.maximumScriptNumberLength
        ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.exceededMaximumScriptNumberLength, nextState)
        : combinators_1.pushToStack(nextState, minimallyEncoded);
}, {
    // TODO: is this right?
    maximumScriptNumberByteLength: common_1.ConsensusCommon.maximumStackItemLength,
    requireMinimalEncoding: false,
});
exports.bitwiseOperation = (combine) => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => a.length === b.length
    ? combinators_1.pushToStack(nextState, combine(a, b))
    : errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.mismatchedBitwiseOperandLength, nextState));
exports.opAnd = () => exports.bitwiseOperation((a, b) => a.map((v, i) => v & b[i]));
exports.opOr = () => exports.bitwiseOperation((a, b) => a.map((v, i) => v | b[i]));
exports.opXor = () => exports.bitwiseOperation((a, b) => a.map((v, i) => v ^ b[i]));
exports.opDiv = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [a, b]) => b === BigInt(0)
    ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.divisionByZero, nextState)
    : combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(a / b)), { requireMinimalEncoding });
exports.opMod = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [a, b]) => b === BigInt(0)
    ? errors_1.applyError(bch_errors_1.AuthenticationErrorBCH.divisionByZero, nextState)
    : combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(a % b)), { requireMinimalEncoding });
/**
 * Validate the encoding of a raw signature – a signature without a signing
 * serialization type byte (A.K.A. "sighash" byte).
 *
 * @param signature - the raw signature
 */
exports.isValidSignatureEncodingBCHRaw = (signature) => signature.length === 0 ||
    signature.length === bch_types_1.ConsensusBCH.schnorrSignatureLength ||
    encoding_1.isValidSignatureEncodingDER(signature);
exports.opCheckDataSig = ({ secp256k1, sha256, }) => (state) => 
// eslint-disable-next-line complexity
combinators_1.useThreeStackItems(state, (nextState, [signature, message, publicKey]) => {
    if (!exports.isValidSignatureEncodingBCHRaw(signature)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidSignatureEncoding, nextState);
    }
    if (!encoding_1.isValidPublicKeyEncoding(publicKey)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidPublicKeyEncoding, nextState);
    }
    const digest = sha256.hash(message);
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    nextState.signedMessages.push(message);
    const useSchnorr = signature.length === bch_types_1.ConsensusBCH.schnorrSignatureLength;
    const success = useSchnorr
        ? secp256k1.verifySignatureSchnorr(signature, publicKey, digest)
        : secp256k1.verifySignatureDERLowS(signature, publicKey, digest);
    return !success && signature.length !== 0
        ? errors_1.applyError(errors_1.AuthenticationErrorCommon.nonNullSignatureFailure, nextState)
        : combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(success));
});
exports.opCheckDataSigVerify = ({ secp256k1, sha256, }) => combinators_1.combineOperations(exports.opCheckDataSig({ secp256k1, sha256 }), flow_control_1.opVerify());
exports.opReverseBytes = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => combinators_1.pushToStack(nextState, item.slice().reverse()));
exports.bitcoinCashOperations = ({ flags, secp256k1, sha256, }) => {
    const operations = {
        [bch_opcodes_1.OpcodesBCH.OP_CAT]: exports.opCat(),
        [bch_opcodes_1.OpcodesBCH.OP_SPLIT]: exports.opSplit(flags),
        [bch_opcodes_1.OpcodesBCH.OP_NUM2BIN]: exports.opNum2Bin(),
        [bch_opcodes_1.OpcodesBCH.OP_BIN2NUM]: exports.opBin2Num(),
        [bch_opcodes_1.OpcodesBCH.OP_AND]: exports.opAnd(),
        [bch_opcodes_1.OpcodesBCH.OP_OR]: exports.opOr(),
        [bch_opcodes_1.OpcodesBCH.OP_XOR]: exports.opXor(),
        [bch_opcodes_1.OpcodesBCH.OP_DIV]: exports.opDiv(flags),
        [bch_opcodes_1.OpcodesBCH.OP_MOD]: exports.opMod(flags),
        [bch_opcodes_1.OpcodesBCH.OP_CHECKDATASIG]: exports.opCheckDataSig({
            secp256k1,
            sha256,
        }),
        [bch_opcodes_1.OpcodesBCH.OP_CHECKDATASIGVERIFY]: exports.opCheckDataSigVerify({ secp256k1, sha256 }),
    };
    return flags.opReverseBytes
        ? Object.assign(Object.assign({}, operations), { [bch_opcodes_1.OpcodesBCH.OP_REVERSEBYTES]: exports.opReverseBytes() }) : operations;
};

},{"../../../format/hex":28,"../common/combinators":75,"../common/common":76,"../common/encoding":79,"../common/errors":80,"../common/flow-control":81,"../common/types":89,"./bch-errors":65,"./bch-opcodes":67,"./bch-types":69}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestAuthenticationProgramBCH = exports.ConsensusBCH = void 0;
const format_1 = require("../../../format/format");
const transaction_serialization_1 = require("../../../transaction/transaction-serialization");
var ConsensusBCH;
(function (ConsensusBCH) {
    ConsensusBCH[ConsensusBCH["schnorrSignatureLength"] = 64] = "schnorrSignatureLength";
})(ConsensusBCH = exports.ConsensusBCH || (exports.ConsensusBCH = {}));
exports.createTestAuthenticationProgramBCH = ({ lockingBytecode, satoshis, sha256, unlockingBytecode, }) => {
    const testFundingTransaction = {
        inputs: [
            {
                outpointIndex: 0xffffffff,
                outpointTransactionHash: format_1.hexToBin('0000000000000000000000000000000000000000000000000000000000000000'),
                sequenceNumber: 0xffffffff,
                unlockingBytecode: Uint8Array.of(0, 0),
            },
        ],
        locktime: 0,
        outputs: [{ lockingBytecode, satoshis }],
        version: 1,
    };
    const testSpendingTransaction = {
        inputs: [
            {
                outpointIndex: 0,
                outpointTransactionHash: transaction_serialization_1.getTransactionHashBE(sha256, transaction_serialization_1.encodeTransaction(testFundingTransaction)),
                sequenceNumber: 0xffffffff,
                unlockingBytecode,
            },
        ],
        locktime: 0,
        outputs: [{ lockingBytecode: Uint8Array.of(), satoshis }],
        version: 1,
    };
    return {
        inputIndex: 0,
        sourceOutput: testFundingTransaction.outputs[0],
        spendingTransaction: testSpendingTransaction,
    };
};

},{"../../../format/format":27,"../../../transaction/transaction-serialization":60}],70:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateVirtualMachineBCH = void 0;
const crypto_1 = require("../../../crypto/crypto");
const virtual_machine_1 = require("../../virtual-machine");
const bch_instruction_sets_1 = require("./bch-instruction-sets");
__exportStar(require("./bch-descriptions"), exports);
__exportStar(require("./bch-errors"), exports);
__exportStar(require("./bch-instruction-sets"), exports);
__exportStar(require("./bch-opcodes"), exports);
__exportStar(require("./bch-operations"), exports);
__exportStar(require("./bch-types"), exports);
__exportStar(require("./fixtures/bitcoin-abc/bitcoin-abc-utils"), exports);
/**
 * Initialize a virtual machine using the provided BCH instruction set.
 *
 * @param instructionSet - the VM version to instantiate – by default, the
 * current "strict" VM is used (`instructionSetBCHCurrentStrict`)
 */
exports.instantiateVirtualMachineBCH = async (instructionSet = bch_instruction_sets_1.instructionSetBCHCurrentStrict) => {
    const [sha1, sha256, ripemd160, secp256k1] = await Promise.all([
        crypto_1.instantiateSha1(),
        crypto_1.instantiateSha256(),
        crypto_1.instantiateRipemd160(),
        crypto_1.instantiateSecp256k1(),
    ]);
    return virtual_machine_1.createAuthenticationVirtualMachine(bch_instruction_sets_1.createInstructionSetBCH({
        flags: bch_instruction_sets_1.getFlagsForInstructionSetBCH(instructionSet),
        ripemd160,
        secp256k1,
        sha1,
        sha256,
    }));
};

},{"../../../crypto/crypto":17,"../../virtual-machine":93,"./bch-descriptions":64,"./bch-errors":65,"./bch-instruction-sets":66,"./bch-opcodes":67,"./bch-operations":68,"./bch-types":69,"./fixtures/bitcoin-abc/bitcoin-abc-utils":71}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleBitcoinABCScript = exports.bitcoinABCOpcodes = void 0;
const format_1 = require("../../../../../format/format");
const common_1 = require("../../../common/common");
const instruction_sets_utils_1 = require("../../../instruction-sets-utils");
const bch_opcodes_1 = require("../../bch-opcodes");
exports.bitcoinABCOpcodes = Object.entries(instruction_sets_utils_1.generateBytecodeMap(bch_opcodes_1.OpcodesBCH)).reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur[0].slice('OP_'.length)]: cur[1] })), {
    PUSHDATA1: Uint8Array.of(bch_opcodes_1.OpcodesBCH.OP_PUSHDATA_1),
    PUSHDATA2: Uint8Array.of(bch_opcodes_1.OpcodesBCH.OP_PUSHDATA_2),
    PUSHDATA4: Uint8Array.of(bch_opcodes_1.OpcodesBCH.OP_PUSHDATA_4),
});
/**
 * Convert a string from Bitcoin ABC's `script_tests.json` text-format to
 * bytecode. The string must be valid – this method attempts to convert all
 * unmatched tokens to `BigInt`s.
 *
 * @privateRemarks
 * This method doesn't use {@link compileScript} because of a slight
 * incompatibility in the languages. In BTL, BigIntLiterals are a primitive
 * type, and must be surrounded by a push statement (e.g. `<100>`) to push a
 * number to the stack. In the `script_tests.json` text-format, numbers are
 * assumed to be pushed. We could implement a transformation after the
 * compiler's parse step, but because this format doesn't require any other
 * features of the compiler, we opt to implement this as a simple method.
 * @param abcScript - the script in Bitcoin ABC's `script_tests.json` text
 * format
 */
exports.assembleBitcoinABCScript = (abcScript) => format_1.flattenBinArray(abcScript
    .split(' ')
    .filter((token) => token !== '')
    .map((token) => token.startsWith('0x')
    ? format_1.hexToBin(token.slice('0x'.length))
    : token.startsWith("'")
        ? common_1.encodeDataPush(format_1.utf8ToBin(token.slice(1, token.length - 1)))
        : exports.bitcoinABCOpcodes[token] === undefined
            ? common_1.encodeDataPush(common_1.bigIntToScriptNumber(BigInt(token)))
            : exports.bitcoinABCOpcodes[token]));

},{"../../../../../format/format":27,"../../../common/common":76,"../../../instruction-sets-utils":91,"../../bch-opcodes":67}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcodesBTC = void 0;
var OpcodesBTC;
(function (OpcodesBTC) {
    OpcodesBTC[OpcodesBTC["OP_0"] = 0] = "OP_0";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
    OpcodesBTC[OpcodesBTC["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
    OpcodesBTC[OpcodesBTC["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
    OpcodesBTC[OpcodesBTC["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
    OpcodesBTC[OpcodesBTC["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
    OpcodesBTC[OpcodesBTC["OP_1NEGATE"] = 79] = "OP_1NEGATE";
    OpcodesBTC[OpcodesBTC["OP_RESERVED"] = 80] = "OP_RESERVED";
    OpcodesBTC[OpcodesBTC["OP_1"] = 81] = "OP_1";
    OpcodesBTC[OpcodesBTC["OP_2"] = 82] = "OP_2";
    OpcodesBTC[OpcodesBTC["OP_3"] = 83] = "OP_3";
    OpcodesBTC[OpcodesBTC["OP_4"] = 84] = "OP_4";
    OpcodesBTC[OpcodesBTC["OP_5"] = 85] = "OP_5";
    OpcodesBTC[OpcodesBTC["OP_6"] = 86] = "OP_6";
    OpcodesBTC[OpcodesBTC["OP_7"] = 87] = "OP_7";
    OpcodesBTC[OpcodesBTC["OP_8"] = 88] = "OP_8";
    OpcodesBTC[OpcodesBTC["OP_9"] = 89] = "OP_9";
    OpcodesBTC[OpcodesBTC["OP_10"] = 90] = "OP_10";
    OpcodesBTC[OpcodesBTC["OP_11"] = 91] = "OP_11";
    OpcodesBTC[OpcodesBTC["OP_12"] = 92] = "OP_12";
    OpcodesBTC[OpcodesBTC["OP_13"] = 93] = "OP_13";
    OpcodesBTC[OpcodesBTC["OP_14"] = 94] = "OP_14";
    OpcodesBTC[OpcodesBTC["OP_15"] = 95] = "OP_15";
    OpcodesBTC[OpcodesBTC["OP_16"] = 96] = "OP_16";
    OpcodesBTC[OpcodesBTC["OP_NOP"] = 97] = "OP_NOP";
    OpcodesBTC[OpcodesBTC["OP_VER"] = 98] = "OP_VER";
    OpcodesBTC[OpcodesBTC["OP_IF"] = 99] = "OP_IF";
    OpcodesBTC[OpcodesBTC["OP_NOTIF"] = 100] = "OP_NOTIF";
    OpcodesBTC[OpcodesBTC["OP_VERIF"] = 101] = "OP_VERIF";
    OpcodesBTC[OpcodesBTC["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
    OpcodesBTC[OpcodesBTC["OP_ELSE"] = 103] = "OP_ELSE";
    OpcodesBTC[OpcodesBTC["OP_ENDIF"] = 104] = "OP_ENDIF";
    OpcodesBTC[OpcodesBTC["OP_VERIFY"] = 105] = "OP_VERIFY";
    OpcodesBTC[OpcodesBTC["OP_RETURN"] = 106] = "OP_RETURN";
    OpcodesBTC[OpcodesBTC["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
    OpcodesBTC[OpcodesBTC["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
    OpcodesBTC[OpcodesBTC["OP_2DROP"] = 109] = "OP_2DROP";
    OpcodesBTC[OpcodesBTC["OP_2DUP"] = 110] = "OP_2DUP";
    OpcodesBTC[OpcodesBTC["OP_3DUP"] = 111] = "OP_3DUP";
    OpcodesBTC[OpcodesBTC["OP_2OVER"] = 112] = "OP_2OVER";
    OpcodesBTC[OpcodesBTC["OP_2ROT"] = 113] = "OP_2ROT";
    OpcodesBTC[OpcodesBTC["OP_2SWAP"] = 114] = "OP_2SWAP";
    OpcodesBTC[OpcodesBTC["OP_IFDUP"] = 115] = "OP_IFDUP";
    OpcodesBTC[OpcodesBTC["OP_DEPTH"] = 116] = "OP_DEPTH";
    OpcodesBTC[OpcodesBTC["OP_DROP"] = 117] = "OP_DROP";
    OpcodesBTC[OpcodesBTC["OP_DUP"] = 118] = "OP_DUP";
    OpcodesBTC[OpcodesBTC["OP_NIP"] = 119] = "OP_NIP";
    OpcodesBTC[OpcodesBTC["OP_OVER"] = 120] = "OP_OVER";
    OpcodesBTC[OpcodesBTC["OP_PICK"] = 121] = "OP_PICK";
    OpcodesBTC[OpcodesBTC["OP_ROLL"] = 122] = "OP_ROLL";
    OpcodesBTC[OpcodesBTC["OP_ROT"] = 123] = "OP_ROT";
    OpcodesBTC[OpcodesBTC["OP_SWAP"] = 124] = "OP_SWAP";
    OpcodesBTC[OpcodesBTC["OP_TUCK"] = 125] = "OP_TUCK";
    OpcodesBTC[OpcodesBTC["OP_CAT"] = 126] = "OP_CAT";
    OpcodesBTC[OpcodesBTC["OP_SUBSTR"] = 127] = "OP_SUBSTR";
    OpcodesBTC[OpcodesBTC["OP_LEFT"] = 128] = "OP_LEFT";
    OpcodesBTC[OpcodesBTC["OP_RIGHT"] = 129] = "OP_RIGHT";
    OpcodesBTC[OpcodesBTC["OP_SIZE"] = 130] = "OP_SIZE";
    OpcodesBTC[OpcodesBTC["OP_INVERT"] = 131] = "OP_INVERT";
    OpcodesBTC[OpcodesBTC["OP_AND"] = 132] = "OP_AND";
    OpcodesBTC[OpcodesBTC["OP_OR"] = 133] = "OP_OR";
    OpcodesBTC[OpcodesBTC["OP_XOR"] = 134] = "OP_XOR";
    OpcodesBTC[OpcodesBTC["OP_EQUAL"] = 135] = "OP_EQUAL";
    OpcodesBTC[OpcodesBTC["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
    OpcodesBTC[OpcodesBTC["OP_RESERVED1"] = 137] = "OP_RESERVED1";
    OpcodesBTC[OpcodesBTC["OP_RESERVED2"] = 138] = "OP_RESERVED2";
    OpcodesBTC[OpcodesBTC["OP_1ADD"] = 139] = "OP_1ADD";
    OpcodesBTC[OpcodesBTC["OP_1SUB"] = 140] = "OP_1SUB";
    OpcodesBTC[OpcodesBTC["OP_2MUL"] = 141] = "OP_2MUL";
    OpcodesBTC[OpcodesBTC["OP_2DIV"] = 142] = "OP_2DIV";
    OpcodesBTC[OpcodesBTC["OP_NEGATE"] = 143] = "OP_NEGATE";
    OpcodesBTC[OpcodesBTC["OP_ABS"] = 144] = "OP_ABS";
    OpcodesBTC[OpcodesBTC["OP_NOT"] = 145] = "OP_NOT";
    OpcodesBTC[OpcodesBTC["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
    OpcodesBTC[OpcodesBTC["OP_ADD"] = 147] = "OP_ADD";
    OpcodesBTC[OpcodesBTC["OP_SUB"] = 148] = "OP_SUB";
    OpcodesBTC[OpcodesBTC["OP_MUL"] = 149] = "OP_MUL";
    OpcodesBTC[OpcodesBTC["OP_DIV"] = 150] = "OP_DIV";
    OpcodesBTC[OpcodesBTC["OP_MOD"] = 151] = "OP_MOD";
    OpcodesBTC[OpcodesBTC["OP_LSHIFT"] = 152] = "OP_LSHIFT";
    OpcodesBTC[OpcodesBTC["OP_RSHIFT"] = 153] = "OP_RSHIFT";
    OpcodesBTC[OpcodesBTC["OP_BOOLAND"] = 154] = "OP_BOOLAND";
    OpcodesBTC[OpcodesBTC["OP_BOOLOR"] = 155] = "OP_BOOLOR";
    OpcodesBTC[OpcodesBTC["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
    OpcodesBTC[OpcodesBTC["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
    OpcodesBTC[OpcodesBTC["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
    OpcodesBTC[OpcodesBTC["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
    OpcodesBTC[OpcodesBTC["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
    OpcodesBTC[OpcodesBTC["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
    OpcodesBTC[OpcodesBTC["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
    OpcodesBTC[OpcodesBTC["OP_MIN"] = 163] = "OP_MIN";
    OpcodesBTC[OpcodesBTC["OP_MAX"] = 164] = "OP_MAX";
    OpcodesBTC[OpcodesBTC["OP_WITHIN"] = 165] = "OP_WITHIN";
    OpcodesBTC[OpcodesBTC["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
    OpcodesBTC[OpcodesBTC["OP_SHA1"] = 167] = "OP_SHA1";
    OpcodesBTC[OpcodesBTC["OP_SHA256"] = 168] = "OP_SHA256";
    OpcodesBTC[OpcodesBTC["OP_HASH160"] = 169] = "OP_HASH160";
    OpcodesBTC[OpcodesBTC["OP_HASH256"] = 170] = "OP_HASH256";
    OpcodesBTC[OpcodesBTC["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
    OpcodesBTC[OpcodesBTC["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
    OpcodesBTC[OpcodesBTC["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
    OpcodesBTC[OpcodesBTC["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
    OpcodesBTC[OpcodesBTC["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
    OpcodesBTC[OpcodesBTC["OP_NOP1"] = 176] = "OP_NOP1";
    OpcodesBTC[OpcodesBTC["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
    OpcodesBTC[OpcodesBTC["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
    OpcodesBTC[OpcodesBTC["OP_NOP4"] = 179] = "OP_NOP4";
    OpcodesBTC[OpcodesBTC["OP_NOP5"] = 180] = "OP_NOP5";
    OpcodesBTC[OpcodesBTC["OP_NOP6"] = 181] = "OP_NOP6";
    OpcodesBTC[OpcodesBTC["OP_NOP7"] = 182] = "OP_NOP7";
    OpcodesBTC[OpcodesBTC["OP_NOP8"] = 183] = "OP_NOP8";
    OpcodesBTC[OpcodesBTC["OP_NOP9"] = 184] = "OP_NOP9";
    OpcodesBTC[OpcodesBTC["OP_NOP10"] = 185] = "OP_NOP10";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN186"] = 186] = "OP_UNKNOWN186";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN187"] = 187] = "OP_UNKNOWN187";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN188"] = 188] = "OP_UNKNOWN188";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN192"] = 192] = "OP_UNKNOWN192";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN193"] = 193] = "OP_UNKNOWN193";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN194"] = 194] = "OP_UNKNOWN194";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN195"] = 195] = "OP_UNKNOWN195";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN196"] = 196] = "OP_UNKNOWN196";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN197"] = 197] = "OP_UNKNOWN197";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN198"] = 198] = "OP_UNKNOWN198";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN199"] = 199] = "OP_UNKNOWN199";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN200"] = 200] = "OP_UNKNOWN200";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN201"] = 201] = "OP_UNKNOWN201";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN202"] = 202] = "OP_UNKNOWN202";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN203"] = 203] = "OP_UNKNOWN203";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN204"] = 204] = "OP_UNKNOWN204";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN205"] = 205] = "OP_UNKNOWN205";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN206"] = 206] = "OP_UNKNOWN206";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN207"] = 207] = "OP_UNKNOWN207";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN208"] = 208] = "OP_UNKNOWN208";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN209"] = 209] = "OP_UNKNOWN209";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN210"] = 210] = "OP_UNKNOWN210";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN211"] = 211] = "OP_UNKNOWN211";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
    /**
     * Used internally in the C++ implementation.
     */
    OpcodesBTC[OpcodesBTC["OP_SMALLINTEGER"] = 250] = "OP_SMALLINTEGER";
    /**
     * Used internally in the C++ implementation.
     */
    OpcodesBTC[OpcodesBTC["OP_PUBKEYS"] = 251] = "OP_PUBKEYS";
    OpcodesBTC[OpcodesBTC["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
    /**
     * Used internally in the C++ implementation.
     */
    OpcodesBTC[OpcodesBTC["OP_PUBKEYHASH"] = 253] = "OP_PUBKEYHASH";
    /**
     * Used internally in the C++ implementation.
     */
    OpcodesBTC[OpcodesBTC["OP_PUBKEY"] = 254] = "OP_PUBKEY";
    /**
     * Used internally in the C++ implementation.
     */
    OpcodesBTC[OpcodesBTC["OP_INVALIDOPCODE"] = 255] = "OP_INVALIDOPCODE";
})(OpcodesBTC = exports.OpcodesBTC || (exports.OpcodesBTC = {}));

},{}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arithmeticOperations = exports.opWithin = exports.opMax = exports.opMin = exports.opGreaterThanOrEqual = exports.opGreaterThan = exports.opLessThanOrEqual = exports.opLessThan = exports.opNumNotEqual = exports.opNumEqualVerify = exports.opNumEqual = exports.opBoolOr = exports.opBoolAnd = exports.opSub = exports.opAdd = exports.op0NotEqual = exports.opNot = exports.opAbs = exports.opNegate = exports.op1Sub = exports.op1Add = void 0;
const combinators_1 = require("./combinators");
const flow_control_1 = require("./flow-control");
const opcodes_1 = require("./opcodes");
const types_1 = require("./types");
exports.op1Add = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(value + BigInt(1))), { requireMinimalEncoding });
exports.op1Sub = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(value - BigInt(1))), { requireMinimalEncoding });
exports.opNegate = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(-value)), { requireMinimalEncoding });
exports.opAbs = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(value < 0 ? -value : value)), { requireMinimalEncoding });
exports.opNot = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, value === BigInt(0)
    ? types_1.bigIntToScriptNumber(BigInt(1))
    : types_1.bigIntToScriptNumber(BigInt(0))), { requireMinimalEncoding });
exports.op0NotEqual = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, [value]) => combinators_1.pushToStack(nextState, value === BigInt(0)
    ? types_1.bigIntToScriptNumber(BigInt(0))
    : types_1.bigIntToScriptNumber(BigInt(1))), { requireMinimalEncoding });
exports.opAdd = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(firstValue + secondValue)), { requireMinimalEncoding });
exports.opSub = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(firstValue - secondValue)), { requireMinimalEncoding });
exports.opBoolAnd = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue !== BigInt(0) && secondValue !== BigInt(0))), { requireMinimalEncoding });
exports.opBoolOr = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue !== BigInt(0) || secondValue !== BigInt(0))), { requireMinimalEncoding });
exports.opNumEqual = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue === secondValue)), { requireMinimalEncoding });
exports.opNumEqualVerify = (flags) => combinators_1.combineOperations(exports.opNumEqual(flags), flow_control_1.opVerify());
exports.opNumNotEqual = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue !== secondValue)), { requireMinimalEncoding });
exports.opLessThan = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue < secondValue)), { requireMinimalEncoding });
exports.opLessThanOrEqual = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue <= secondValue)), { requireMinimalEncoding });
exports.opGreaterThan = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue > secondValue)), { requireMinimalEncoding });
exports.opGreaterThanOrEqual = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(firstValue >= secondValue)), { requireMinimalEncoding });
exports.opMin = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(firstValue < secondValue ? firstValue : secondValue)), { requireMinimalEncoding });
exports.opMax = ({ requireMinimalEncoding, }) => (state) => combinators_1.useTwoScriptNumbers(state, (nextState, [firstValue, secondValue]) => combinators_1.pushToStack(nextState, types_1.bigIntToScriptNumber(firstValue > secondValue ? firstValue : secondValue)), { requireMinimalEncoding });
exports.opWithin = ({ requireMinimalEncoding, }) => (state) => combinators_1.useThreeScriptNumbers(state, (nextState, [firstValue, secondValue, thirdValue]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(secondValue <= firstValue && firstValue < thirdValue)), { requireMinimalEncoding });
exports.arithmeticOperations = (flags) => ({
    [opcodes_1.OpcodesCommon.OP_1ADD]: exports.op1Add(flags),
    [opcodes_1.OpcodesCommon.OP_1SUB]: exports.op1Sub(flags),
    [opcodes_1.OpcodesCommon.OP_NEGATE]: exports.opNegate(flags),
    [opcodes_1.OpcodesCommon.OP_ABS]: exports.opAbs(flags),
    [opcodes_1.OpcodesCommon.OP_NOT]: exports.opNot(flags),
    [opcodes_1.OpcodesCommon.OP_0NOTEQUAL]: exports.op0NotEqual(flags),
    [opcodes_1.OpcodesCommon.OP_ADD]: exports.opAdd(flags),
    [opcodes_1.OpcodesCommon.OP_SUB]: exports.opSub(flags),
    [opcodes_1.OpcodesCommon.OP_BOOLAND]: exports.opBoolAnd(flags),
    [opcodes_1.OpcodesCommon.OP_BOOLOR]: exports.opBoolOr(flags),
    [opcodes_1.OpcodesCommon.OP_NUMEQUAL]: exports.opNumEqual(flags),
    [opcodes_1.OpcodesCommon.OP_NUMEQUALVERIFY]: exports.opNumEqualVerify(flags),
    [opcodes_1.OpcodesCommon.OP_NUMNOTEQUAL]: exports.opNumNotEqual(flags),
    [opcodes_1.OpcodesCommon.OP_LESSTHAN]: exports.opLessThan(flags),
    [opcodes_1.OpcodesCommon.OP_LESSTHANOREQUAL]: exports.opLessThanOrEqual(flags),
    [opcodes_1.OpcodesCommon.OP_GREATERTHAN]: exports.opGreaterThan(flags),
    [opcodes_1.OpcodesCommon.OP_GREATERTHANOREQUAL]: exports.opGreaterThanOrEqual(flags),
    [opcodes_1.OpcodesCommon.OP_MIN]: exports.opMin(flags),
    [opcodes_1.OpcodesCommon.OP_MAX]: exports.opMax(flags),
    [opcodes_1.OpcodesCommon.OP_WITHIN]: exports.opWithin(flags),
});

},{"./combinators":75,"./flow-control":81,"./opcodes":83,"./types":89}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitwiseOperations = exports.opEqualVerify = exports.opEqual = void 0;
const combinators_1 = require("./combinators");
const flow_control_1 = require("./flow-control");
const opcodes_1 = require("./opcodes");
const types_1 = require("./types");
const areEqual = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};
exports.opEqual = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [element1, element2]) => combinators_1.pushToStack(nextState, types_1.booleanToScriptNumber(areEqual(element1, element2))));
exports.opEqualVerify = () => combinators_1.combineOperations(exports.opEqual(), flow_control_1.opVerify());
exports.bitwiseOperations = () => ({
    [opcodes_1.OpcodesCommon.OP_EQUAL]: exports.opEqual(),
    [opcodes_1.OpcodesCommon.OP_EQUALVERIFY]: exports.opEqualVerify(),
});

},{"./combinators":75,"./flow-control":81,"./opcodes":83,"./types":89}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineOperations = exports.pushToStack = exports.useThreeScriptNumbers = exports.useTwoScriptNumbers = exports.useOneScriptNumber = exports.useSixStackItems = exports.useFourStackItems = exports.useThreeStackItems = exports.useTwoStackItems = exports.useOneStackItem = exports.mapOverOperations = exports.conditionallyEvaluate = exports.incrementOperationCount = void 0;
const common_1 = require("./common");
const errors_1 = require("./errors");
exports.incrementOperationCount = (operation) => (state) => {
    const nextState = operation(state);
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    nextState.operationCount += 1;
    return nextState;
};
exports.conditionallyEvaluate = (operation) => (state) => state.executionStack.every((item) => item) ? operation(state) : state;
/**
 * Map a function over each operation in an `InstructionSet.operations` object,
 * assigning the result to the same `opcode` in the resulting object.
 * @param operations - an operations map from an `InstructionSet`
 * @param combinator - a function to apply to each operation
 */
exports.mapOverOperations = (operations, ...combinators) => Object.keys(operations).reduce((result, operation) => (Object.assign(Object.assign({}, result), { [operation]: combinators.reduce((op, combinator) => combinator(op), operations[parseInt(operation, 10)]) })), {});
/**
 * Pop one stack item off of `state.stack` and provide that item to `operation`.
 */
exports.useOneStackItem = (state, operation) => {
    // eslint-disable-next-line functional/immutable-data
    const item = state.stack.pop();
    if (item === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.emptyStack, state);
    }
    return operation(state, [item]);
};
exports.useTwoStackItems = (state, operation) => exports.useOneStackItem(state, (nextState, [valueTwo]) => exports.useOneStackItem(nextState, (lastState, [valueTop]) => operation(lastState, [valueTop, valueTwo])));
exports.useThreeStackItems = (state, operation) => exports.useOneStackItem(state, (nextState, [valueThree]) => exports.useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [valueTop, valueTwo, valueThree])));
exports.useFourStackItems = (state, operation) => exports.useTwoStackItems(state, (nextState, [valueThree, valueFour]) => exports.useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [valueTop, valueTwo, valueThree, valueFour])));
exports.useSixStackItems = (state, operation) => exports.useFourStackItems(state, (nextState, [valueThree, valueFour, valueFive, valueSix]) => exports.useTwoStackItems(nextState, (lastState, [valueTop, valueTwo]) => operation(lastState, [
    valueTop,
    valueTwo,
    valueThree,
    valueFour,
    valueFive,
    valueSix,
])));
const normalMaximumScriptNumberByteLength = 4;
exports.useOneScriptNumber = (state, operation, { requireMinimalEncoding, maximumScriptNumberByteLength = normalMaximumScriptNumberByteLength, }) => exports.useOneStackItem(state, (nextState, [item]) => {
    const value = common_1.parseBytesAsScriptNumber(item, {
        maximumScriptNumberByteLength,
        requireMinimalEncoding,
    });
    if (common_1.isScriptNumberError(value)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidScriptNumber, state);
    }
    return operation(nextState, [value]);
});
exports.useTwoScriptNumbers = (state, operation, { requireMinimalEncoding, maximumScriptNumberByteLength = normalMaximumScriptNumberByteLength, }) => exports.useOneScriptNumber(state, (nextState, [secondValue]) => exports.useOneScriptNumber(nextState, (lastState, [firstValue]) => operation(lastState, [firstValue, secondValue]), { maximumScriptNumberByteLength, requireMinimalEncoding }), { maximumScriptNumberByteLength, requireMinimalEncoding });
exports.useThreeScriptNumbers = (state, operation, { requireMinimalEncoding, maximumScriptNumberByteLength = normalMaximumScriptNumberByteLength, }) => exports.useTwoScriptNumbers(state, (nextState, [secondValue, thirdValue]) => exports.useOneScriptNumber(nextState, (lastState, [firstValue]) => operation(lastState, [firstValue, secondValue, thirdValue]), { maximumScriptNumberByteLength, requireMinimalEncoding }), { maximumScriptNumberByteLength, requireMinimalEncoding });
/**
 * Return the provided state with the provided value pushed to its stack.
 * @param state - the state to update and return
 * @param data - the value to push to the stack
 */
exports.pushToStack = (state, ...data) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.stack.push(...data);
    return state;
};
// TODO: if firstOperation errors, secondOperation might overwrite the error
exports.combineOperations = (firstOperation, secondOperation) => (state) => secondOperation(firstOperation(state));

},{"./common":76,"./errors":80}],76:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthenticationProgramStateCommonEmpty = exports.createTransactionContextCommonTesting = exports.createTransactionContextCommonEmpty = exports.cloneAuthenticationProgramStateCommon = exports.createAuthenticationProgramStateCommon = exports.createTransactionContextCommon = exports.createAuthenticationProgramInternalStateCommon = exports.cloneStack = exports.commonOperations = exports.checkLimitsCommon = exports.undefinedOperation = exports.ConsensusCommon = void 0;
const transaction_serialization_1 = require("../../../transaction/transaction-serialization");
const arithmetic_1 = require("./arithmetic");
const bitwise_1 = require("./bitwise");
const combinators_1 = require("./combinators");
const crypto_1 = require("./crypto");
const errors_1 = require("./errors");
const flow_control_1 = require("./flow-control");
const nop_1 = require("./nop");
const opcodes_1 = require("./opcodes");
const push_1 = require("./push");
const splice_1 = require("./splice");
const stack_1 = require("./stack");
const time_1 = require("./time");
__exportStar(require("./arithmetic"), exports);
__exportStar(require("./bitwise"), exports);
__exportStar(require("./combinators"), exports);
__exportStar(require("./crypto"), exports);
__exportStar(require("./descriptions"), exports);
__exportStar(require("./encoding"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./flow-control"), exports);
__exportStar(require("./nop"), exports);
__exportStar(require("./opcodes"), exports);
__exportStar(require("./push"), exports);
__exportStar(require("./signing-serialization"), exports);
__exportStar(require("./splice"), exports);
__exportStar(require("./stack"), exports);
__exportStar(require("./time"), exports);
__exportStar(require("./types"), exports);
var ConsensusCommon;
(function (ConsensusCommon) {
    /**
     * A.K.A. `MAX_SCRIPT_ELEMENT_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStackItemLength"] = 520] = "maximumStackItemLength";
    ConsensusCommon[ConsensusCommon["maximumScriptNumberLength"] = 4] = "maximumScriptNumberLength";
    /**
     * A.K.A. `MAX_OPS_PER_SCRIPT`
     */
    ConsensusCommon[ConsensusCommon["maximumOperationCount"] = 201] = "maximumOperationCount";
    /**
     * A.K.A. `MAX_SCRIPT_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumBytecodeLength"] = 10000] = "maximumBytecodeLength";
    /**
     * A.K.A. `MAX_STACK_SIZE`
     */
    ConsensusCommon[ConsensusCommon["maximumStackDepth"] = 1000] = "maximumStackDepth";
})(ConsensusCommon = exports.ConsensusCommon || (exports.ConsensusCommon = {}));
exports.undefinedOperation = () => ({
    undefined: combinators_1.conditionallyEvaluate((state) => errors_1.applyError(errors_1.AuthenticationErrorCommon.unknownOpcode, state)),
});
exports.checkLimitsCommon = (operation) => (state) => {
    const nextState = operation(state);
    return nextState.stack.length + nextState.alternateStack.length >
        ConsensusCommon.maximumStackDepth
        ? errors_1.applyError(errors_1.AuthenticationErrorCommon.exceededMaximumStackDepth, nextState)
        : nextState.operationCount > ConsensusCommon.maximumOperationCount
            ? errors_1.applyError(errors_1.AuthenticationErrorCommon.exceededMaximumOperationCount, nextState)
            : nextState;
};
exports.commonOperations = ({ flags, ripemd160, secp256k1, sha1, sha256, }) => {
    const unconditionalOperations = Object.assign(Object.assign(Object.assign({}, nop_1.disabledOperations()), push_1.pushOperations(flags)), combinators_1.mapOverOperations(flow_control_1.unconditionalFlowControlOperations(flags), combinators_1.incrementOperationCount));
    const conditionalOperations = combinators_1.mapOverOperations(Object.assign(Object.assign({}, push_1.pushNumberOperations()), { [opcodes_1.OpcodesCommon.OP_RESERVED]: flow_control_1.reservedOperation() }), combinators_1.conditionallyEvaluate);
    const incrementingOperations = combinators_1.mapOverOperations(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, arithmetic_1.arithmeticOperations(flags)), bitwise_1.bitwiseOperations()), crypto_1.cryptoOperations({
        flags,
        ripemd160,
        secp256k1,
        sha1,
        sha256,
    })), flow_control_1.conditionalFlowControlOperations()), stack_1.stackOperations(flags)), splice_1.spliceOperations()), time_1.timeOperations(flags)), nop_1.nonOperations(flags)), combinators_1.conditionallyEvaluate, combinators_1.incrementOperationCount);
    return combinators_1.mapOverOperations(Object.assign(Object.assign(Object.assign({}, unconditionalOperations), incrementingOperations), conditionalOperations), exports.checkLimitsCommon);
};
exports.cloneStack = (stack) => stack.reduce((newStack, element) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    newStack.push(element.slice());
    return newStack;
}, []);
exports.createAuthenticationProgramInternalStateCommon = ({ instructions, stack = [], }) => ({
    alternateStack: [],
    executionStack: [],
    instructions,
    ip: 0,
    lastCodeSeparator: -1,
    operationCount: 0,
    signatureOperationsCount: 0,
    signedMessages: [],
    stack,
});
exports.createTransactionContextCommon = (program) => ({
    correspondingOutput: program.inputIndex < program.spendingTransaction.outputs.length
        ? transaction_serialization_1.encodeOutput(program.spendingTransaction.outputs[program.inputIndex])
        : undefined,
    locktime: program.spendingTransaction.locktime,
    outpointIndex: program.spendingTransaction.inputs[program.inputIndex].outpointIndex,
    outpointTransactionHash: program.spendingTransaction.inputs[program.inputIndex]
        .outpointTransactionHash,
    outputValue: program.sourceOutput.satoshis,
    sequenceNumber: program.spendingTransaction.inputs[program.inputIndex].sequenceNumber,
    transactionOutpoints: transaction_serialization_1.encodeOutpoints(program.spendingTransaction.inputs),
    transactionOutputs: transaction_serialization_1.encodeOutputsForSigning(program.spendingTransaction.outputs),
    transactionSequenceNumbers: transaction_serialization_1.encodeSequenceNumbersForSigning(program.spendingTransaction.inputs),
    version: program.spendingTransaction.version,
});
exports.createAuthenticationProgramStateCommon = ({ transactionContext, instructions, stack, }) => (Object.assign(Object.assign({}, exports.createAuthenticationProgramInternalStateCommon({
    instructions,
    stack,
})), transactionContext));
/**
 * Note: this implementation does not safely clone elements within array
 * properties. Mutating values within arrays will mutate those values in cloned
 * program states.
 */
exports.cloneAuthenticationProgramStateCommon = (state) => (Object.assign(Object.assign({}, (state.error === undefined ? {} : { error: state.error })), { alternateStack: state.alternateStack.slice(), correspondingOutput: state.correspondingOutput, executionStack: state.executionStack.slice(), instructions: state.instructions.slice(), ip: state.ip, lastCodeSeparator: state.lastCodeSeparator, locktime: state.locktime, operationCount: state.operationCount, outpointIndex: state.outpointIndex, outpointTransactionHash: state.outpointTransactionHash.slice(), outputValue: state.outputValue, sequenceNumber: state.sequenceNumber, signatureOperationsCount: state.signatureOperationsCount, signedMessages: state.signedMessages.slice(), stack: state.stack.slice(), transactionOutpoints: state.transactionOutpoints, transactionOutputs: state.transactionOutputs, transactionSequenceNumbers: state.transactionSequenceNumbers, version: state.version }));
const sha256HashLength = 32;
const outputValueLength = 8;
/**
 * This is a meaningless but complete `TransactionContextCommon` which uses `0`
 * values for each property.
 */
exports.createTransactionContextCommonEmpty = () => ({
    correspondingOutput: Uint8Array.of(0),
    locktime: 0,
    outpointIndex: 0,
    outpointTransactionHash: new Uint8Array(sha256HashLength),
    outputValue: new Uint8Array(outputValueLength),
    sequenceNumber: 0,
    transactionOutpoints: Uint8Array.of(0),
    transactionOutputs: Uint8Array.of(0),
    transactionSequenceNumbers: Uint8Array.of(0),
    version: 0,
});
const correspondingOutput = 1;
const transactionOutpoints = 2;
const transactionOutputs = 3;
const transactionSequenceNumbers = 4;
const outpointTransactionHashFill = 5;
/**
 * This is a meaningless but complete `TransactionContextCommon` which uses a
 * different value for each property. This is useful for testing and debugging.
 */
exports.createTransactionContextCommonTesting = () => ({
    correspondingOutput: Uint8Array.of(correspondingOutput),
    locktime: 0,
    outpointIndex: 0,
    outpointTransactionHash: new Uint8Array(sha256HashLength).fill(outpointTransactionHashFill),
    outputValue: new Uint8Array(outputValueLength),
    sequenceNumber: 0,
    transactionOutpoints: Uint8Array.of(transactionOutpoints),
    transactionOutputs: Uint8Array.of(transactionOutputs),
    transactionSequenceNumbers: Uint8Array.of(transactionSequenceNumbers),
    version: 0,
});
/**
 * Create an "empty" common authentication program state, suitable for testing a
 * VM/compiler.
 */
exports.createAuthenticationProgramStateCommonEmpty = ({ instructions, stack = [], }) => (Object.assign(Object.assign({}, exports.createAuthenticationProgramInternalStateCommon({ instructions, stack })), exports.createTransactionContextCommonEmpty()));

},{"../../../transaction/transaction-serialization":60,"./arithmetic":73,"./bitwise":74,"./combinators":75,"./crypto":77,"./descriptions":78,"./encoding":79,"./errors":80,"./flow-control":81,"./nop":82,"./opcodes":83,"./push":84,"./signing-serialization":85,"./splice":86,"./stack":87,"./time":88,"./types":89}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoOperations = exports.opCheckMultiSigVerify = exports.opCheckSigVerify = exports.opCheckMultiSig = exports.opCheckSig = exports.opCodeSeparator = exports.opHash256 = exports.opHash160 = exports.opSha256 = exports.opSha1 = exports.opRipemd160 = void 0;
const bch_types_1 = require("../bch/bch-types");
const instruction_sets_utils_1 = require("../instruction-sets-utils");
const combinators_1 = require("./combinators");
const common_1 = require("./common");
const encoding_1 = require("./encoding");
const errors_1 = require("./errors");
const flow_control_1 = require("./flow-control");
const opcodes_1 = require("./opcodes");
const signing_serialization_1 = require("./signing-serialization");
exports.opRipemd160 = ({ ripemd160, }) => (state) => combinators_1.useOneStackItem(state, (nextState, [value]) => combinators_1.pushToStack(nextState, ripemd160.hash(value)));
exports.opSha1 = ({ sha1, }) => (state) => combinators_1.useOneStackItem(state, (nextState, [value]) => combinators_1.pushToStack(nextState, sha1.hash(value)));
exports.opSha256 = ({ sha256, }) => (state) => combinators_1.useOneStackItem(state, (nextState, [value]) => combinators_1.pushToStack(nextState, sha256.hash(value)));
exports.opHash160 = ({ ripemd160, sha256, }) => (state) => combinators_1.useOneStackItem(state, (nextState, [value]) => combinators_1.pushToStack(nextState, ripemd160.hash(sha256.hash(value))));
exports.opHash256 = ({ sha256, }) => (state) => combinators_1.useOneStackItem(state, (nextState, [value]) => combinators_1.pushToStack(nextState, sha256.hash(sha256.hash(value))));
exports.opCodeSeparator = () => (state) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.lastCodeSeparator = state.ip;
    return state;
};
exports.opCheckSig = ({ flags, secp256k1, sha256, }) => (s) => 
// eslint-disable-next-line complexity
combinators_1.useTwoStackItems(s, (state, [bitcoinEncodedSignature, publicKey]) => {
    if (!encoding_1.isValidPublicKeyEncoding(publicKey)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidPublicKeyEncoding, state);
    }
    if (!encoding_1.isValidSignatureEncodingBCHTransaction(bitcoinEncodedSignature)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidSignatureEncoding, state);
    }
    const coveredBytecode = instruction_sets_utils_1.serializeAuthenticationInstructions(state.instructions).subarray(state.lastCodeSeparator + 1);
    const { signingSerializationType, signature } = encoding_1.decodeBitcoinSignature(bitcoinEncodedSignature);
    const serialization = signing_serialization_1.generateSigningSerializationBCH({
        correspondingOutput: state.correspondingOutput,
        coveredBytecode,
        locktime: state.locktime,
        outpointIndex: state.outpointIndex,
        outpointTransactionHash: state.outpointTransactionHash,
        outputValue: state.outputValue,
        sequenceNumber: state.sequenceNumber,
        sha256,
        signingSerializationType,
        transactionOutpoints: state.transactionOutpoints,
        transactionOutputs: state.transactionOutputs,
        transactionSequenceNumbers: state.transactionSequenceNumbers,
        version: state.version,
    });
    const digest = sha256.hash(sha256.hash(serialization));
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.signedMessages.push(serialization);
    const useSchnorr = signature.length === bch_types_1.ConsensusBCH.schnorrSignatureLength;
    const success = useSchnorr
        ? secp256k1.verifySignatureSchnorr(signature, publicKey, digest)
        : secp256k1.verifySignatureDERLowS(signature, publicKey, digest);
    return !success &&
        flags.requireNullSignatureFailures &&
        signature.length !== 0
        ? errors_1.applyError(errors_1.AuthenticationErrorCommon.nonNullSignatureFailure, state)
        : combinators_1.pushToStack(state, common_1.booleanToScriptNumber(success));
});
exports.opCheckMultiSig = ({ flags: { requireMinimalEncoding, requireBugValueZero, requireNullSignatureFailures, }, secp256k1, sha256, }) => (s) => combinators_1.useOneScriptNumber(s, (state, publicKeysValue) => {
    const potentialPublicKeys = Number(publicKeysValue);
    if (potentialPublicKeys < 0) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidNaturalNumber, state);
    }
    if (potentialPublicKeys > 20 /* maximumPublicKeys */) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.exceedsMaximumMultisigPublicKeyCount, state);
    }
    const publicKeys = 
    // eslint-disable-next-line functional/immutable-data
    potentialPublicKeys > 0 ? state.stack.splice(-potentialPublicKeys) : [];
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.operationCount += potentialPublicKeys;
    return state.operationCount > common_1.ConsensusCommon.maximumOperationCount
        ? errors_1.applyError(errors_1.AuthenticationErrorCommon.exceededMaximumOperationCount, state)
        : combinators_1.useOneScriptNumber(state, (nextState, approvingKeys) => {
            const requiredApprovingPublicKeys = Number(approvingKeys);
            if (requiredApprovingPublicKeys < 0) {
                return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidNaturalNumber, nextState);
            }
            if (requiredApprovingPublicKeys > potentialPublicKeys) {
                return errors_1.applyError(errors_1.AuthenticationErrorCommon.insufficientPublicKeys, nextState);
            }
            const signatures = requiredApprovingPublicKeys > 0
                ? // eslint-disable-next-line functional/immutable-data
                    nextState.stack.splice(-requiredApprovingPublicKeys)
                : [];
            return combinators_1.useOneStackItem(nextState, 
            // eslint-disable-next-line complexity
            (finalState, [protocolBugValue]) => {
                if (requireBugValueZero && protocolBugValue.length !== 0) {
                    return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidProtocolBugValue, finalState);
                }
                const coveredBytecode = instruction_sets_utils_1.serializeAuthenticationInstructions(finalState.instructions).subarray(finalState.lastCodeSeparator + 1);
                let approvingPublicKeys = 0; // eslint-disable-line functional/no-let
                let remainingSignatures = signatures.length; // eslint-disable-line functional/no-let
                let remainingPublicKeys = publicKeys.length; // eslint-disable-line functional/no-let
                // eslint-disable-next-line functional/no-loop-statement
                while (remainingSignatures > 0 &&
                    remainingPublicKeys > 0 &&
                    approvingPublicKeys + remainingPublicKeys >=
                        remainingSignatures &&
                    approvingPublicKeys !== requiredApprovingPublicKeys) {
                    const publicKey = publicKeys[remainingPublicKeys - 1];
                    const bitcoinEncodedSignature = signatures[remainingSignatures - 1];
                    if (!encoding_1.isValidPublicKeyEncoding(publicKey)) {
                        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidPublicKeyEncoding, finalState);
                    }
                    if (!encoding_1.isValidSignatureEncodingBCHTransaction(bitcoinEncodedSignature)) {
                        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidSignatureEncoding, finalState);
                    }
                    const { signingSerializationType, signature, } = encoding_1.decodeBitcoinSignature(bitcoinEncodedSignature);
                    const serialization = signing_serialization_1.generateSigningSerializationBCH({
                        correspondingOutput: state.correspondingOutput,
                        coveredBytecode,
                        locktime: state.locktime,
                        outpointIndex: state.outpointIndex,
                        outpointTransactionHash: state.outpointTransactionHash,
                        outputValue: state.outputValue,
                        sequenceNumber: state.sequenceNumber,
                        sha256,
                        signingSerializationType,
                        transactionOutpoints: state.transactionOutpoints,
                        transactionOutputs: state.transactionOutputs,
                        transactionSequenceNumbers: state.transactionSequenceNumbers,
                        version: state.version,
                    });
                    const digest = sha256.hash(sha256.hash(serialization));
                    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
                    finalState.signedMessages.push(serialization);
                    if (signature.length === bch_types_1.ConsensusBCH.schnorrSignatureLength) {
                        return errors_1.applyError(errors_1.AuthenticationErrorCommon.schnorrSizedSignatureInCheckMultiSig, finalState);
                    }
                    const signed = secp256k1.verifySignatureDERLowS(signature, publicKey, digest);
                    // eslint-disable-next-line functional/no-conditional-statement
                    if (signed) {
                        approvingPublicKeys += 1; // eslint-disable-line functional/no-expression-statement
                        remainingSignatures -= 1; // eslint-disable-line functional/no-expression-statement
                    }
                    remainingPublicKeys -= 1; // eslint-disable-line functional/no-expression-statement
                }
                const success = approvingPublicKeys === requiredApprovingPublicKeys;
                if (!success &&
                    requireNullSignatureFailures &&
                    !signatures.every((signature) => signature.length === 0)) {
                    return errors_1.applyError(errors_1.AuthenticationErrorCommon.nonNullSignatureFailure, finalState);
                }
                return combinators_1.pushToStack(finalState, common_1.booleanToScriptNumber(success));
            });
        }, { requireMinimalEncoding });
}, { requireMinimalEncoding });
exports.opCheckSigVerify = ({ flags, secp256k1, sha256, }) => combinators_1.combineOperations(exports.opCheckSig({ flags, secp256k1, sha256 }), flow_control_1.opVerify());
exports.opCheckMultiSigVerify = ({ flags, secp256k1, sha256, }) => combinators_1.combineOperations(exports.opCheckMultiSig({ flags, secp256k1, sha256 }), flow_control_1.opVerify());
exports.cryptoOperations = ({ flags, ripemd160, secp256k1, sha1, sha256, }) => ({
    [opcodes_1.OpcodesCommon.OP_RIPEMD160]: exports.opRipemd160({
        ripemd160,
    }),
    [opcodes_1.OpcodesCommon.OP_SHA1]: exports.opSha1({ sha1 }),
    [opcodes_1.OpcodesCommon.OP_SHA256]: exports.opSha256({ sha256 }),
    [opcodes_1.OpcodesCommon.OP_HASH160]: exports.opHash160({
        ripemd160,
        sha256,
    }),
    [opcodes_1.OpcodesCommon.OP_HASH256]: exports.opHash256({ sha256 }),
    [opcodes_1.OpcodesCommon.OP_CODESEPARATOR]: exports.opCodeSeparator(),
    [opcodes_1.OpcodesCommon.OP_CHECKSIG]: exports.opCheckSig({
        flags,
        secp256k1,
        sha256,
    }),
    [opcodes_1.OpcodesCommon.OP_CHECKSIGVERIFY]: exports.opCheckSigVerify({
        flags,
        secp256k1,
        sha256,
    }),
    [opcodes_1.OpcodesCommon.OP_CHECKMULTISIG]: exports.opCheckMultiSig({
        flags,
        secp256k1,
        sha256,
    }),
    [opcodes_1.OpcodesCommon.OP_CHECKMULTISIGVERIFY]: exports.opCheckMultiSigVerify({ flags, secp256k1, sha256 }),
});

},{"../bch/bch-types":69,"../instruction-sets-utils":91,"./combinators":75,"./common":76,"./encoding":79,"./errors":80,"./flow-control":81,"./opcodes":83,"./signing-serialization":85}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcodeDescriptionsCommon = void 0;
var OpcodeDescriptionsCommon;
(function (OpcodeDescriptionsCommon) {
    OpcodeDescriptionsCommon["OP_0"] = "Push the Script Number 0 onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_1"] = "Push the next byte onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_2"] = "Push the next 2 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_3"] = "Push the next 3 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_4"] = "Push the next 4 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_5"] = "Push the next 5 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_6"] = "Push the next 6 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_7"] = "Push the next 7 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_8"] = "Push the next 8 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_9"] = "Push the next 9 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_10"] = "Push the next 10 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_11"] = "Push the next 11 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_12"] = "Push the next 12 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_13"] = "Push the next 13 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_14"] = "Push the next 14 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_15"] = "Push the next 15 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_16"] = "Push the next 16 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_17"] = "Push the next 17 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_18"] = "Push the next 18 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_19"] = "Push the next 19 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_20"] = "Push the next 20 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_21"] = "Push the next 21 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_22"] = "Push the next 22 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_23"] = "Push the next 23 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_24"] = "Push the next 24 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_25"] = "Push the next 25 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_26"] = "Push the next 26 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_27"] = "Push the next 27 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_28"] = "Push the next 28 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_29"] = "Push the next 29 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_30"] = "Push the next 30 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_31"] = "Push the next 31 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_32"] = "Push the next 32 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_33"] = "Push the next 33 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_34"] = "Push the next 34 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_35"] = "Push the next 35 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_36"] = "Push the next 36 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_37"] = "Push the next 37 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_38"] = "Push the next 38 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_39"] = "Push the next 39 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_40"] = "Push the next 40 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_41"] = "Push the next 41 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_42"] = "Push the next 42 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_43"] = "Push the next 43 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_44"] = "Push the next 44 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_45"] = "Push the next 45 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_46"] = "Push the next 46 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_47"] = "Push the next 47 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_48"] = "Push the next 48 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_49"] = "Push the next 49 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_50"] = "Push the next 50 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_51"] = "Push the next 51 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_52"] = "Push the next 52 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_53"] = "Push the next 53 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_54"] = "Push the next 54 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_55"] = "Push the next 55 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_56"] = "Push the next 56 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_57"] = "Push the next 57 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_58"] = "Push the next 58 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_59"] = "Push the next 59 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_60"] = "Push the next 60 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_61"] = "Push the next 61 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_62"] = "Push the next 62 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_63"] = "Push the next 63 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_64"] = "Push the next 64 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_65"] = "Push the next 65 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_66"] = "Push the next 66 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_67"] = "Push the next 67 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_68"] = "Push the next 68 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_69"] = "Push the next 69 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_70"] = "Push the next 70 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_71"] = "Push the next 71 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_72"] = "Push the next 72 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_73"] = "Push the next 73 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_74"] = "Push the next 74 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHBYTES_75"] = "Push the next 75 bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHDATA_1"] = "Read the next Uint8 and push that number of bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHDATA_2"] = "Read the next little-endian Uint16 and push that number of bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_PUSHDATA_4"] = "Read the next little-endian Uint32 and push that number of bytes onto the stack.";
    OpcodeDescriptionsCommon["OP_1NEGATE"] = "Push the Script Number -1 onto the stack.";
    OpcodeDescriptionsCommon["OP_RESERVED"] = "Error unless found in an unexecuted conditional branch. Note: OP_RESERVED does not count toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_1"] = "Push the Script Number 1 onto the stack.";
    OpcodeDescriptionsCommon["OP_2"] = "Push the Script Number 2 onto the stack.";
    OpcodeDescriptionsCommon["OP_3"] = "Push the Script Number 3 onto the stack.";
    OpcodeDescriptionsCommon["OP_4"] = "Push the Script Number 4 onto the stack.";
    OpcodeDescriptionsCommon["OP_5"] = "Push the Script Number 5 onto the stack.";
    OpcodeDescriptionsCommon["OP_6"] = "Push the Script Number 6 onto the stack.";
    OpcodeDescriptionsCommon["OP_7"] = "Push the Script Number 7 onto the stack.";
    OpcodeDescriptionsCommon["OP_8"] = "Push the Script Number 8 onto the stack.";
    OpcodeDescriptionsCommon["OP_9"] = "Push the Script Number 9 onto the stack.";
    OpcodeDescriptionsCommon["OP_10"] = "Push the Script Number 10 onto the stack.";
    OpcodeDescriptionsCommon["OP_11"] = "Push the Script Number 11 onto the stack.";
    OpcodeDescriptionsCommon["OP_12"] = "Push the Script Number 12 onto the stack.";
    OpcodeDescriptionsCommon["OP_13"] = "Push the Script Number 13 onto the stack.";
    OpcodeDescriptionsCommon["OP_14"] = "Push the Script Number 14 onto the stack.";
    OpcodeDescriptionsCommon["OP_15"] = "Push the Script Number 15 onto the stack.";
    OpcodeDescriptionsCommon["OP_16"] = "Push the Script Number 16 onto the stack.";
    OpcodeDescriptionsCommon["OP_NOP"] = "No operation. Note: OP_NOP counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_VER"] = "Error unless found in an unexecuted conditional branch. Note: OP_VER counts toward the opcode limit. (Historically, this pushed a protocol version number to the stack.)";
    OpcodeDescriptionsCommon["OP_IF"] = "Pop the top item from the stack. If it is not \"truthy\", skip evaluation until the matching OP_ELSE or OP_ENDIF.";
    OpcodeDescriptionsCommon["OP_NOTIF"] = "Evaluate OP_NOT followed by OP_IF.";
    OpcodeDescriptionsCommon["OP_VERIF"] = "Error, even when found in an unexecuted conditional branch. (Historically, this was a combination of OP_VER and OP_IF.)";
    OpcodeDescriptionsCommon["OP_VERNOTIF"] = "Error, even when found in an unexecuted conditional branch. (Historically, this was a combination of OP_VER and OP_NOTIF.)";
    OpcodeDescriptionsCommon["OP_ELSE"] = "Invert conditional evaluation within the current OP_IF ... OP_ENDIF block. (If evaluation is enabled, disable it, if it is disabled, enable it.)";
    OpcodeDescriptionsCommon["OP_ENDIF"] = "End the current OP_IF ... OP_ENDIF block.";
    OpcodeDescriptionsCommon["OP_VERIFY"] = "Pop the top item from the stack and error if it isn't \"truthy\".";
    OpcodeDescriptionsCommon["OP_RETURN"] = "Error when executed.";
    OpcodeDescriptionsCommon["OP_TOALTSTACK"] = "Pop the top item from the stack and push it onto the alternate stack.";
    OpcodeDescriptionsCommon["OP_FROMALTSTACK"] = "Pop the top item from the alternate stack and push it onto the stack.";
    OpcodeDescriptionsCommon["OP_2DROP"] = "Pop the top 2 items from the stack and discard them.";
    OpcodeDescriptionsCommon["OP_2DUP"] = "Duplicate the top 2 items on the stack. (E.g. [a, b] -> [a, b, a, b])";
    OpcodeDescriptionsCommon["OP_3DUP"] = "Duplicate the top 3 items on the stack. (E.g. [a, b, c] -> [a, b, c, a, b, c])";
    OpcodeDescriptionsCommon["OP_2OVER"] = "Duplicate the 2 items beginning at a depth of 2 on the stack. (E.g. [a, b, c, d] -> [a, b, c, d, a, b])";
    OpcodeDescriptionsCommon["OP_2ROT"] = "Rotate the top 6 items on the stack, bringing the fifth and sixth items to the top. (E.g. [a, b, c, d, e, f] -> [c, d, e, f, a, b])";
    OpcodeDescriptionsCommon["OP_2SWAP"] = "Swap the positions of the top two pairs of items on the stack. (E.g. [a, b, c, d] -> [c, d, a, b])";
    OpcodeDescriptionsCommon["OP_IFDUP"] = "If the top item on the stack is \"truthy\", duplicate it.";
    OpcodeDescriptionsCommon["OP_DEPTH"] = "Push the current number of stack items as a Script Number.";
    OpcodeDescriptionsCommon["OP_DROP"] = "Pop the top item from the stack and discard it. (E.g. [a] -> [])";
    OpcodeDescriptionsCommon["OP_DUP"] = "Duplicate the top item on the stack. (E.g. [a] -> [a, a])";
    OpcodeDescriptionsCommon["OP_NIP"] = "Remove the second-to-top item from the stack. (E.g. [a, b] -> [b])";
    OpcodeDescriptionsCommon["OP_OVER"] = "Duplicate the second-to-top item on the stack. (E.g. [a, b] -> [a, b, a])";
    OpcodeDescriptionsCommon["OP_PICK"] = "Pop the top item from the stack as a Script Number. Duplicate the item at that depth (zero-indexed), placing it on top of the stack. (E.g. [a, b, c, 2] -> [a, b, c, a])";
    OpcodeDescriptionsCommon["OP_ROLL"] = "Pop the top item from the stack as a Script Number. Move the item at that depth (zero-indexed) to the top of the stack. (E.g. [a, b, c, 2] -> [b, c, a])";
    OpcodeDescriptionsCommon["OP_ROT"] = "Rotate the top 3 items on the stack, bringing the third item to the top. (E.g. [a, b, c] -> [b, c, a])";
    OpcodeDescriptionsCommon["OP_SWAP"] = "Swap the top two items on the stack. (E.g. [a, b] -> [b, a])";
    OpcodeDescriptionsCommon["OP_TUCK"] = "Duplicate the item at the top of the stack, inserting it below the second-to-top item. (E.g. [a, b] -> [b, a, b])";
    OpcodeDescriptionsCommon["OP_CAT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this concatenated two stack items.)";
    OpcodeDescriptionsCommon["OP_SUBSTR"] = "Error, even when found in an unexecuted conditional branch. (Historically, this returned a section of a stack item.)";
    OpcodeDescriptionsCommon["OP_LEFT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this returned a section to the left of a point in a stack item.)";
    OpcodeDescriptionsCommon["OP_RIGHT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this returned a section to the right of a point in a stack item.)";
    OpcodeDescriptionsCommon["OP_SIZE"] = "Push the byte-length of the top stack item as a Script Number.";
    OpcodeDescriptionsCommon["OP_INVERT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this flipped all the bits in a stack item.)";
    OpcodeDescriptionsCommon["OP_AND"] = "Error, even when found in an unexecuted conditional branch. (Historically, this performed a boolean AND on each bit in two stack items.)";
    OpcodeDescriptionsCommon["OP_OR"] = "Error, even when found in an unexecuted conditional branch. (Historically, this performed a boolean OR on each bit in two stack items.)";
    OpcodeDescriptionsCommon["OP_XOR"] = "Error, even when found in an unexecuted conditional branch. (Historically, this performed a boolean XOR on each bit in two stack items.)";
    OpcodeDescriptionsCommon["OP_EQUAL"] = "Pop the top two items from the stack and compare them byte-by-byte. If they are the same, push a Script Number 1, otherwise push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_EQUALVERIFY"] = "Pop the top two items from the stack and compare them byte-by-byte. If the values are different, error. (This operation is a combination of OP_EQUAL followed by OP_VERIFY.)";
    OpcodeDescriptionsCommon["OP_RESERVED1"] = "Error unless found in an unexecuted conditional branch. Note: OP_RESERVED1 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_RESERVED2"] = "Error unless found in an unexecuted conditional branch. Note: OP_RESERVED2 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_1ADD"] = "Pop the top item from the stack as a Script Number, add 1, then push the result.";
    OpcodeDescriptionsCommon["OP_1SUB"] = "Pop the top item from the stack as a Script Number, subtract 1, then push the result.";
    OpcodeDescriptionsCommon["OP_2MUL"] = "Error, even when found in an unexecuted conditional branch. (Historically, this multiplied a Script Number by 2.)";
    OpcodeDescriptionsCommon["OP_2DIV"] = "Error, even when found in an unexecuted conditional branch. (Historically, this divided a Script Number by 2.)";
    OpcodeDescriptionsCommon["OP_NEGATE"] = "Pop the top item from the stack as a Script Number, negate it, then push the result.";
    OpcodeDescriptionsCommon["OP_ABS"] = "Pop the top item from the stack as a Script Number, take its absolute value, then push the result.";
    OpcodeDescriptionsCommon["OP_NOT"] = "Pop the top item from the stack as a Script Number. If its value is 0, push a Script Number 1, otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_0NOTEQUAL"] = "Pop the top item from the stack as a Script Number. If its value is not 0, push a Script Number 1, otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_ADD"] = "Pop the top two items from the stack as Script Numbers. Add them, then push the result.";
    OpcodeDescriptionsCommon["OP_SUB"] = "Pop the top two items from the stack as Script Numbers. Subtract the top item from the second item, then push the result.";
    OpcodeDescriptionsCommon["OP_MUL"] = "Error, even when found in an unexecuted conditional branch. (Historically, this multiplied two Script Numbers.)";
    OpcodeDescriptionsCommon["OP_DIV"] = "Error, even when found in an unexecuted conditional branch. (Historically, this divided two Script Numbers.)";
    OpcodeDescriptionsCommon["OP_MOD"] = "Error, even when found in an unexecuted conditional branch. (Historically, this returned the remainder after dividing one Script Number by another.)";
    OpcodeDescriptionsCommon["OP_LSHIFT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this performed a sign-preserving, left bit shift.)";
    OpcodeDescriptionsCommon["OP_RSHIFT"] = "Error, even when found in an unexecuted conditional branch. (Historically, this performed a sign-preserving, right bit shift.)";
    OpcodeDescriptionsCommon["OP_BOOLAND"] = "Pop the top two items from the stack as Script Numbers. If neither value is a Script Number 0, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_BOOLOR"] = "Pop the top two items from the stack as Script Numbers. If either value is a Script Number 1, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_NUMEQUAL"] = "Pop the top two items from the stack as Script Numbers. If the values are equal, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_NUMEQUALVERIFY"] = "Pop the top two items from the stack as Script Numbers. If the values are different, error. (This operation is a combination of OP_NUMEQUAL followed by OP_VERIFY.)";
    OpcodeDescriptionsCommon["OP_NUMNOTEQUAL"] = "Pop the top two items from the stack as Script Numbers. If the values are not equal, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_LESSTHAN"] = "Pop the top two items from the stack as Script Numbers. If the second item is less than top item, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_GREATERTHAN"] = "Pop the top two items from the stack as Script Numbers. If the second item is greater than top item, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_LESSTHANOREQUAL"] = "Pop the top two items from the stack as Script Numbers. If the second item is less than or equal to the top item, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_GREATERTHANOREQUAL"] = "Pop the top two items from the stack as Script Numbers. If the second item is greater than or equal to the top item, push a Script Number 1. Otherwise, push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_MIN"] = "Pop the top two items from the stack as Script Numbers. Push the smaller of the two numbers.";
    OpcodeDescriptionsCommon["OP_MAX"] = "Pop the top two items from the stack as Script Numbers. Push the larger of the two numbers.";
    OpcodeDescriptionsCommon["OP_WITHIN"] = "Pop the top three items from the stack as Script Numbers. If the top number is within the range defined by the following two numbers (left-inclusive), push a Script Number 1. Otherwise, push a Script Number 0. (E.g. for [a, b, c]: if (b <= a), and (a < c), [1]. Else [0].)";
    OpcodeDescriptionsCommon["OP_RIPEMD160"] = "Pop the top item from the stack and pass it through ripemd160, pushing the result onto the stack.";
    OpcodeDescriptionsCommon["OP_SHA1"] = "Pop the top item from the stack and pass it through sha1, pushing the result onto the stack.";
    OpcodeDescriptionsCommon["OP_SHA256"] = "Pop the top item from the stack and pass it through sha256, pushing the result onto the stack.";
    OpcodeDescriptionsCommon["OP_HASH160"] = "Pop the top item from the stack and pass it through sha256, then ripemd160, pushing the result onto the stack.";
    OpcodeDescriptionsCommon["OP_HASH256"] = "Pop the top item from the stack and pass it through sha256 twice, pushing the result onto the stack.";
    OpcodeDescriptionsCommon["OP_CODESEPARATOR"] = "Update the value of lastCodeSeparator to the instruction pointer's current value. (This reduces the coverage of signing serializations used in signature verification operations.)";
    OpcodeDescriptionsCommon["OP_CHECKSIG"] = "Pop the top two items from the stack. Treat the top as a signature and the second as a public key. If the signature is valid, push a Script Number 1, otherwise push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_CHECKSIGVERIFY"] = "Pop the top two items from the stack. Treat the top as a signature and the second as a public key. If the signature is not valid, error. (This operation is a combination of OP_CHECKSIG followed by OP_VERIFY.)";
    OpcodeDescriptionsCommon["OP_CHECKMULTISIG"] = "Pop items from the stack: first pop the Script Number of public keys, then pop each of those public keys. Next, pop the Script Number of required signatures, then pop each of those signatures. Finally, pop a final Script Number which must be 0 due to a protocol bug. Checking each signature against each public key in order, if all signatures are valid \u2013 and the required number of signatures have been provided \u2013 push a Script Number 1, otherwise push a Script Number 0.";
    OpcodeDescriptionsCommon["OP_CHECKMULTISIGVERIFY"] = "Pop items from the stack: first pop the Script Number of public keys, then pop each of those public keys. Next, pop the Script Number of required signatures, then pop each of those signatures. Finally, (due to a protocol bug) pop an unused final Script Number which must be 0. Checking each signature against each public key in order, if any signatures are invalid \u2013 or the required number of signatures have not been provided \u2013 error. (This operation is a combination of OP_CHECKMULTISIG followed by OP_VERIFY.)";
    OpcodeDescriptionsCommon["OP_NOP1"] = "No operation (reserved for future expansion). Note: OP_NOP1 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_CHECKLOCKTIMEVERIFY"] = "Verify the transaction occurs after an absolute block time or height: read the top item on the stack as a Script Number (without removing it), and compare it to the transaction's locktime. If the required locktime has not passed, or if locktime has been disabled for this input by a maximized sequence number, error.";
    OpcodeDescriptionsCommon["OP_CHECKSEQUENCEVERIFY"] = "Verify the transaction occurs after the output being spent has \"aged\" by a relative block time or block height since it was created: read the top item on the stack as a Script Number (without removing it), and compare it to the age encoded in the input's sequence number. If the required relative locktime has not passed, or if relative locktime has been disabled by the sequence number or the transaction version, error.";
    OpcodeDescriptionsCommon["OP_NOP4"] = "No operation (reserved for future expansion). Note: OP_NOP4 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP6"] = "No operation (reserved for future expansion). Note: OP_NOP6 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP5"] = "No operation (reserved for future expansion). Note: OP_NOP5 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP7"] = "No operation (reserved for future expansion). Note: OP_NOP7 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP8"] = "No operation (reserved for future expansion). Note: OP_NOP8 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP9"] = "No operation (reserved for future expansion). Note: OP_NOP9 counts toward the opcode limit.";
    OpcodeDescriptionsCommon["OP_NOP10"] = "No operation (reserved for future expansion). Note: OP_NOP10 counts toward the opcode limit.";
})(OpcodeDescriptionsCommon = exports.OpcodeDescriptionsCommon || (exports.OpcodeDescriptionsCommon = {}));

},{}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBitcoinSignature = exports.isValidSignatureEncodingBCHTransaction = exports.isValidSignatureEncodingDER = exports.isValidPublicKeyEncoding = exports.isValidCompressedPublicKeyEncoding = exports.isValidUncompressedPublicKeyEncoding = void 0;
const bch_1 = require("../bch/bch");
const signing_serialization_1 = require("./signing-serialization");
exports.isValidUncompressedPublicKeyEncoding = (publicKey) => publicKey.length === 65 /* uncompressedByteLength */ &&
    publicKey[0] === 4 /* uncompressedHeaderByte */;
exports.isValidCompressedPublicKeyEncoding = (publicKey) => publicKey.length === 33 /* compressedByteLength */ &&
    (publicKey[0] === 2 /* compressedHeaderByteEven */ ||
        publicKey[0] === 3 /* compressedHeaderByteOdd */);
exports.isValidPublicKeyEncoding = (publicKey) => exports.isValidCompressedPublicKeyEncoding(publicKey) ||
    exports.isValidUncompressedPublicKeyEncoding(publicKey);
const isNegative = (value) => 
// eslint-disable-next-line no-bitwise
(value & 128 /* negative */) !== 0;
const hasUnnecessaryPadding = (length, firstByte, secondByte) => length > 1 && firstByte === 0 && !isNegative(secondByte);
const isValidInteger = (signature, tagIndex, length, valueIndex
// eslint-disable-next-line max-params
) => signature[tagIndex] === 2 /* integerTagType */ &&
    length !== 0 &&
    !isNegative(signature[valueIndex]) &&
    !hasUnnecessaryPadding(length, signature[valueIndex], signature[valueIndex + 1]);
/**
 * Validate a DER-encoded signature.
 *
 * @remarks
 * This function is consensus-critical since BIP66, but differs from the BIP66
 * specification in that it does not validate the existence of a signing
 * serialization type byte at the end of the signature (to support
 * OP_CHECKDATASIG). To validate a bitcoin-encoded signature (including null
 * signatures), use `isValidSignatureEncodingBCH`.
 *
 * @privateRemarks
 * From the Bitcoin ABC C++ implementation:
 *
 * Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
 * total-length: 1-byte length descriptor of everything that follows,
 * excluding the sighash byte.
 * R-length: 1-byte length descriptor of the R value that follows.
 * R: arbitrary-length big-endian encoded R value. It must use the
 * shortest possible encoding for a positive integers (which means no null
 * bytes at the start, except a single one when the next byte has its highest
 * bit set).
 * S-length: 1-byte length descriptor of the S value that follows.
 * S: arbitrary-length big-endian encoded S value. The same rules apply.
 */
// eslint-disable-next-line complexity
exports.isValidSignatureEncodingDER = (signature) => {
    const correctLengthRange = signature.length > 8 /* minimumLength */ &&
        signature.length < 72 /* maximumLength */;
    const correctSequenceTagType = signature[0 /* sequenceTagIndex */] === 48 /* sequenceTagType */;
    const correctSequenceLength = signature[1 /* sequenceLengthIndex */] ===
        signature.length - 2 /* sequenceMetadataBytes */;
    const rLength = signature[3 /* rLengthIndex */];
    if (rLength === undefined) {
        return false;
    }
    const consistentRLength = rLength <= signature.length - 7 /* minimumNonRValueBytes */;
    const rIsValid = isValidInteger(signature, 2 /* rTagIndex */, rLength, 4 /* rValueIndex */);
    const sTagIndex = 4 /* rValueIndex */ + rLength; // eslint-disable-line @typescript-eslint/restrict-plus-operands
    const sLengthIndex = sTagIndex + 1;
    const sLength = signature[sLengthIndex];
    if (sLength === undefined) {
        return false;
    }
    const sValueIndex = sLengthIndex + 1;
    const consistentSLength = sValueIndex + sLength === signature.length;
    const sIsValid = isValidInteger(signature, sTagIndex, sLength, sValueIndex);
    return (correctLengthRange &&
        correctSequenceTagType &&
        correctSequenceLength &&
        consistentRLength &&
        rIsValid &&
        consistentSLength &&
        sIsValid);
};
/**
 * Validate the encoding of a transaction signature, including a signing
 * serialization type byte (A.K.A. "sighash" byte).
 *
 * @param transactionSignature - the full transaction signature
 */
exports.isValidSignatureEncodingBCHTransaction = (transactionSignature) => transactionSignature.length === 0 ||
    transactionSignature.length === bch_1.ConsensusBCH.schnorrSignatureLength + 1 ||
    (signing_serialization_1.isDefinedSigningSerializationType(transactionSignature[transactionSignature.length - 1]) &&
        exports.isValidSignatureEncodingDER(transactionSignature.slice(0, transactionSignature.length - 1)));
/**
 * Split a bitcoin-encoded signature into a signature and signing serialization
 * type.
 *
 * While a bitcoin-encoded signature only includes a single byte to encode the
 * signing serialization type, a 3-byte forkId can be appended to the signing
 * serialization to provide replay-protection between different forks. (See
 * Bitcoin Cash's Replay Protected Sighash spec for details.)
 *
 * @param signature - a signature which passes `isValidSignatureEncoding`
 */
exports.decodeBitcoinSignature = (encodedSignature) => ({
    signature: encodedSignature.slice(0, encodedSignature.length - 1),
    signingSerializationType: new Uint8Array([
        encodedSignature[encodedSignature.length - 1],
    ]),
});

},{"../bch/bch":70,"./signing-serialization":85}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyError = exports.AuthenticationErrorCommon = void 0;
var AuthenticationErrorCommon;
(function (AuthenticationErrorCommon) {
    AuthenticationErrorCommon["calledReserved"] = "Program called an unassigned, reserved operation.";
    AuthenticationErrorCommon["calledReturn"] = "Program called an OP_RETURN operation.";
    AuthenticationErrorCommon["calledUpgradableNop"] = "Program called a disallowed upgradable non-operation (OP_NOP1-OP_NOP10).";
    AuthenticationErrorCommon["checkSequenceUnavailable"] = "Program called an OP_CHECKSEQUENCEVERIFY operation, but OP_CHECKSEQUENCEVERIFY requires transaction version 2 or higher.";
    AuthenticationErrorCommon["disabledOpcode"] = "Program contains a disabled opcode.";
    AuthenticationErrorCommon["emptyAlternateStack"] = "Tried to read from an empty alternate stack.";
    AuthenticationErrorCommon["emptyStack"] = "Tried to read from an empty stack.";
    AuthenticationErrorCommon["exceededMaximumBytecodeLengthLocking"] = "The provided locking bytecode exceeds the maximum bytecode length (10,000 bytes).";
    AuthenticationErrorCommon["exceededMaximumBytecodeLengthUnlocking"] = "The provided unlocking bytecode exceeds the maximum bytecode length (10,000 bytes).";
    AuthenticationErrorCommon["exceededMaximumStackDepth"] = "Program exceeded the maximum stack depth (1,000 items).";
    AuthenticationErrorCommon["exceededMaximumOperationCount"] = "Program exceeded the maximum operation count (201 operations).";
    AuthenticationErrorCommon["exceedsMaximumMultisigPublicKeyCount"] = "Program called an OP_CHECKMULTISIG which exceeds the maximum public key count (20 public keys).";
    AuthenticationErrorCommon["exceedsMaximumPush"] = "Push exceeds the push size limit of 520 bytes.";
    AuthenticationErrorCommon["failedVerify"] = "Program failed an OP_VERIFY operation.";
    AuthenticationErrorCommon["invalidStackIndex"] = "Tried to read from an invalid stack index.";
    AuthenticationErrorCommon["incompatibleLocktimeType"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation with an incompatible locktime type. The transaction locktime and required locktime must both refer to either a block height or a block time.";
    AuthenticationErrorCommon["incompatibleSequenceType"] = "Program called an OP_CHECKSEQUENCEVERIFY operation with an incompatible sequence type flag. The input sequence number and required sequence number must both use the same sequence locktime type.";
    AuthenticationErrorCommon["insufficientPublicKeys"] = "Program called an OP_CHECKMULTISIG operation which requires signatures from more public keys than are provided.";
    AuthenticationErrorCommon["invalidNaturalNumber"] = "Invalid input: the key/signature count inputs for OP_CHECKMULTISIG require a natural number (n > 0).";
    AuthenticationErrorCommon["invalidProtocolBugValue"] = "The OP_CHECKMULTISIG protocol bug value must be a Script Number 0 (to comply with the \"NULLDUMMY\" rule).";
    AuthenticationErrorCommon["invalidPublicKeyEncoding"] = "Encountered an improperly encoded public key.";
    AuthenticationErrorCommon["invalidScriptNumber"] = "Invalid input: this operation requires a valid Script Number.";
    AuthenticationErrorCommon["invalidSignatureEncoding"] = "Encountered an improperly encoded signature.";
    AuthenticationErrorCommon["locktimeDisabled"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation, but locktime is disabled for this transaction.";
    AuthenticationErrorCommon["malformedLockingBytecode"] = "The provided locking bytecode is malformed.";
    AuthenticationErrorCommon["malformedPush"] = "Program must be long enough to push the requested number of bytes.";
    AuthenticationErrorCommon["malformedUnlockingBytecode"] = "The provided unlocking bytecode is malformed.";
    AuthenticationErrorCommon["negativeLocktime"] = "Program called an OP_CHECKLOCKTIMEVERIFY or OP_CHECKSEQUENCEVERIFY operation with a negative locktime.";
    AuthenticationErrorCommon["nonEmptyExecutionStack"] = "Program completed with a non-empty execution stack (missing `OP_ENDIF`).";
    AuthenticationErrorCommon["nonMinimalPush"] = "Push operations must use the smallest possible encoding.";
    AuthenticationErrorCommon["nonNullSignatureFailure"] = "Program failed a signature verification with a non-null signature (violating the \"NULLFAIL\" rule).";
    AuthenticationErrorCommon["requiresCleanStack"] = "Program completed with an unexpected number of items on the stack (must be exactly 1).";
    AuthenticationErrorCommon["schnorrSizedSignatureInCheckMultiSig"] = "Program used a schnorr-sized signature (65 bytes) in an OP_CHECKMULTISIG operation.";
    AuthenticationErrorCommon["unexpectedElse"] = "Encountered an OP_ELSE outside of an OP_IF ... OP_ENDIF block.";
    AuthenticationErrorCommon["unexpectedEndIf"] = "Encountered an OP_ENDIF which is not following a matching OP_IF.";
    AuthenticationErrorCommon["unknownOpcode"] = "Called an unknown opcode.";
    AuthenticationErrorCommon["unmatchedSequenceDisable"] = "Program called an OP_CHECKSEQUENCEVERIFY operation requiring the disable flag, but the input's sequence number is missing the disable flag.";
    AuthenticationErrorCommon["unsatisfiedLocktime"] = "Program called an OP_CHECKLOCKTIMEVERIFY operation which requires a locktime greater than the transaction's locktime.";
    AuthenticationErrorCommon["unsatisfiedSequenceNumber"] = "Program called an OP_CHECKSEQUENCEVERIFY operation which requires a sequence number greater than the input's sequence number.";
    AuthenticationErrorCommon["unsuccessfulEvaluation"] = "Unsuccessful evaluation: completed with a non-truthy value on top of the stack.";
})(AuthenticationErrorCommon = exports.AuthenticationErrorCommon || (exports.AuthenticationErrorCommon = {}));
/**
 * Applies the `error` to a `state`.
 *
 * @remarks
 * If the state already has an error, this method does not override it.
 * (Evaluation should end after the first encountered error, so further errors
 * aren't relevant.)
 */
exports.applyError = (error, state) => (Object.assign(Object.assign({}, state), { error: state.error === undefined ? error : state.error }));

},{}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unconditionalFlowControlOperations = exports.opElse = exports.opEndIf = exports.opNotIf = exports.opIf = exports.conditionalFlowControlOperations = exports.opReturn = exports.reservedOperation = exports.opVerify = void 0;
const arithmetic_1 = require("./arithmetic");
const combinators_1 = require("./combinators");
const common_1 = require("./common");
const errors_1 = require("./errors");
const opcodes_1 = require("./opcodes");
exports.opVerify = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => common_1.stackItemIsTruthy(item)
    ? nextState
    : errors_1.applyError(errors_1.AuthenticationErrorCommon.failedVerify, nextState));
exports.reservedOperation = () => (state) => errors_1.applyError(errors_1.AuthenticationErrorCommon.calledReserved, state);
exports.opReturn = () => (state) => errors_1.applyError(errors_1.AuthenticationErrorCommon.calledReturn, state);
exports.conditionalFlowControlOperations = () => ({
    [opcodes_1.OpcodesCommon.OP_RESERVED]: exports.reservedOperation(),
    [opcodes_1.OpcodesCommon.OP_VER]: exports.reservedOperation(),
    [opcodes_1.OpcodesCommon.OP_VERIFY]: exports.opVerify(),
    [opcodes_1.OpcodesCommon.OP_RETURN]: exports.opReturn(),
    [opcodes_1.OpcodesCommon.OP_RESERVED1]: exports.reservedOperation(),
    [opcodes_1.OpcodesCommon.OP_RESERVED2]: exports.reservedOperation(),
});
exports.opIf = () => (state) => {
    if (state.executionStack.every((item) => item)) {
        // eslint-disable-next-line functional/immutable-data
        const element = state.stack.pop();
        if (element === undefined) {
            return errors_1.applyError(errors_1.AuthenticationErrorCommon.emptyStack, state);
        }
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        state.executionStack.push(common_1.stackItemIsTruthy(element));
        return state;
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.executionStack.push(false);
    return state;
};
exports.opNotIf = (flags) => {
    const not = combinators_1.conditionallyEvaluate(arithmetic_1.opNot(flags));
    const ifOp = exports.opIf();
    return (state) => ifOp(not(state));
};
exports.opEndIf = () => (state) => {
    // eslint-disable-next-line functional/immutable-data
    const element = state.executionStack.pop();
    if (element === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.unexpectedEndIf, state);
    }
    return state;
};
exports.opElse = () => (state) => {
    const top = state.executionStack[state.executionStack.length - 1];
    if (top === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.unexpectedElse, state);
    }
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    state.executionStack[state.executionStack.length - 1] = !top;
    return state;
};
exports.unconditionalFlowControlOperations = (flags) => ({
    [opcodes_1.OpcodesCommon.OP_IF]: exports.opIf(),
    [opcodes_1.OpcodesCommon.OP_NOTIF]: exports.opNotIf(flags),
    [opcodes_1.OpcodesCommon.OP_VERIF]: exports.reservedOperation(),
    [opcodes_1.OpcodesCommon.OP_VERNOTIF]: exports.reservedOperation(),
    [opcodes_1.OpcodesCommon.OP_ELSE]: exports.opElse(),
    [opcodes_1.OpcodesCommon.OP_ENDIF]: exports.opEndIf(),
});

},{"./arithmetic":73,"./combinators":75,"./common":76,"./errors":80,"./opcodes":83}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disabledOperations = exports.disabledOperation = exports.nonOperations = exports.opNop = void 0;
const errors_1 = require("./errors");
const opcodes_1 = require("./opcodes");
exports.opNop = (flags) => (state) => flags.disallowUpgradableNops
    ? errors_1.applyError(errors_1.AuthenticationErrorCommon.calledUpgradableNop, state)
    : state;
exports.nonOperations = (flags) => ({
    [opcodes_1.OpcodesCommon.OP_NOP]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP1]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP4]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP5]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP6]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP7]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP8]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP9]: exports.opNop(flags),
    [opcodes_1.OpcodesCommon.OP_NOP10]: exports.opNop(flags),
});
/**
 * "Disabled" operations are explicitly forbidden from occurring anywhere in a
 * script, even within an unexecuted branch.
 */
exports.disabledOperation = () => (state) => errors_1.applyError(errors_1.AuthenticationErrorCommon.unknownOpcode, state);
exports.disabledOperations = () => ({
    [opcodes_1.OpcodesCommon.OP_CAT]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_SUBSTR]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_LEFT]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_RIGHT]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_INVERT]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_AND]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_OR]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_XOR]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_2MUL]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_2DIV]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_MUL]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_DIV]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_MOD]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_LSHIFT]: exports.disabledOperation(),
    [opcodes_1.OpcodesCommon.OP_RSHIFT]: exports.disabledOperation(),
});

},{"./errors":80,"./opcodes":83}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcodesCommon = void 0;
var OpcodesCommon;
(function (OpcodesCommon) {
    /**
     * A.K.A. `OP_FALSE` or `OP_PUSHBYTES_0`
     */
    OpcodesCommon[OpcodesCommon["OP_0"] = 0] = "OP_0";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_1"] = 1] = "OP_PUSHBYTES_1";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_2"] = 2] = "OP_PUSHBYTES_2";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_3"] = 3] = "OP_PUSHBYTES_3";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_4"] = 4] = "OP_PUSHBYTES_4";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_5"] = 5] = "OP_PUSHBYTES_5";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_6"] = 6] = "OP_PUSHBYTES_6";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_7"] = 7] = "OP_PUSHBYTES_7";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_8"] = 8] = "OP_PUSHBYTES_8";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_9"] = 9] = "OP_PUSHBYTES_9";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_10"] = 10] = "OP_PUSHBYTES_10";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_11"] = 11] = "OP_PUSHBYTES_11";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_12"] = 12] = "OP_PUSHBYTES_12";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_13"] = 13] = "OP_PUSHBYTES_13";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_14"] = 14] = "OP_PUSHBYTES_14";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_15"] = 15] = "OP_PUSHBYTES_15";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_16"] = 16] = "OP_PUSHBYTES_16";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_17"] = 17] = "OP_PUSHBYTES_17";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_18"] = 18] = "OP_PUSHBYTES_18";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_19"] = 19] = "OP_PUSHBYTES_19";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_20"] = 20] = "OP_PUSHBYTES_20";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_21"] = 21] = "OP_PUSHBYTES_21";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_22"] = 22] = "OP_PUSHBYTES_22";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_23"] = 23] = "OP_PUSHBYTES_23";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_24"] = 24] = "OP_PUSHBYTES_24";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_25"] = 25] = "OP_PUSHBYTES_25";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_26"] = 26] = "OP_PUSHBYTES_26";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_27"] = 27] = "OP_PUSHBYTES_27";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_28"] = 28] = "OP_PUSHBYTES_28";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_29"] = 29] = "OP_PUSHBYTES_29";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_30"] = 30] = "OP_PUSHBYTES_30";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_31"] = 31] = "OP_PUSHBYTES_31";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_32"] = 32] = "OP_PUSHBYTES_32";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_33"] = 33] = "OP_PUSHBYTES_33";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_34"] = 34] = "OP_PUSHBYTES_34";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_35"] = 35] = "OP_PUSHBYTES_35";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_36"] = 36] = "OP_PUSHBYTES_36";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_37"] = 37] = "OP_PUSHBYTES_37";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_38"] = 38] = "OP_PUSHBYTES_38";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_39"] = 39] = "OP_PUSHBYTES_39";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_40"] = 40] = "OP_PUSHBYTES_40";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_41"] = 41] = "OP_PUSHBYTES_41";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_42"] = 42] = "OP_PUSHBYTES_42";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_43"] = 43] = "OP_PUSHBYTES_43";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_44"] = 44] = "OP_PUSHBYTES_44";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_45"] = 45] = "OP_PUSHBYTES_45";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_46"] = 46] = "OP_PUSHBYTES_46";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_47"] = 47] = "OP_PUSHBYTES_47";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_48"] = 48] = "OP_PUSHBYTES_48";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_49"] = 49] = "OP_PUSHBYTES_49";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_50"] = 50] = "OP_PUSHBYTES_50";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_51"] = 51] = "OP_PUSHBYTES_51";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_52"] = 52] = "OP_PUSHBYTES_52";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_53"] = 53] = "OP_PUSHBYTES_53";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_54"] = 54] = "OP_PUSHBYTES_54";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_55"] = 55] = "OP_PUSHBYTES_55";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_56"] = 56] = "OP_PUSHBYTES_56";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_57"] = 57] = "OP_PUSHBYTES_57";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_58"] = 58] = "OP_PUSHBYTES_58";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_59"] = 59] = "OP_PUSHBYTES_59";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_60"] = 60] = "OP_PUSHBYTES_60";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_61"] = 61] = "OP_PUSHBYTES_61";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_62"] = 62] = "OP_PUSHBYTES_62";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_63"] = 63] = "OP_PUSHBYTES_63";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_64"] = 64] = "OP_PUSHBYTES_64";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_65"] = 65] = "OP_PUSHBYTES_65";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_66"] = 66] = "OP_PUSHBYTES_66";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_67"] = 67] = "OP_PUSHBYTES_67";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_68"] = 68] = "OP_PUSHBYTES_68";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_69"] = 69] = "OP_PUSHBYTES_69";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_70"] = 70] = "OP_PUSHBYTES_70";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_71"] = 71] = "OP_PUSHBYTES_71";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_72"] = 72] = "OP_PUSHBYTES_72";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_73"] = 73] = "OP_PUSHBYTES_73";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_74"] = 74] = "OP_PUSHBYTES_74";
    OpcodesCommon[OpcodesCommon["OP_PUSHBYTES_75"] = 75] = "OP_PUSHBYTES_75";
    OpcodesCommon[OpcodesCommon["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
    OpcodesCommon[OpcodesCommon["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
    OpcodesCommon[OpcodesCommon["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
    OpcodesCommon[OpcodesCommon["OP_1NEGATE"] = 79] = "OP_1NEGATE";
    OpcodesCommon[OpcodesCommon["OP_RESERVED"] = 80] = "OP_RESERVED";
    /**
     * A.K.A. `OP_TRUE`
     */
    OpcodesCommon[OpcodesCommon["OP_1"] = 81] = "OP_1";
    OpcodesCommon[OpcodesCommon["OP_2"] = 82] = "OP_2";
    OpcodesCommon[OpcodesCommon["OP_3"] = 83] = "OP_3";
    OpcodesCommon[OpcodesCommon["OP_4"] = 84] = "OP_4";
    OpcodesCommon[OpcodesCommon["OP_5"] = 85] = "OP_5";
    OpcodesCommon[OpcodesCommon["OP_6"] = 86] = "OP_6";
    OpcodesCommon[OpcodesCommon["OP_7"] = 87] = "OP_7";
    OpcodesCommon[OpcodesCommon["OP_8"] = 88] = "OP_8";
    OpcodesCommon[OpcodesCommon["OP_9"] = 89] = "OP_9";
    OpcodesCommon[OpcodesCommon["OP_10"] = 90] = "OP_10";
    OpcodesCommon[OpcodesCommon["OP_11"] = 91] = "OP_11";
    OpcodesCommon[OpcodesCommon["OP_12"] = 92] = "OP_12";
    OpcodesCommon[OpcodesCommon["OP_13"] = 93] = "OP_13";
    OpcodesCommon[OpcodesCommon["OP_14"] = 94] = "OP_14";
    OpcodesCommon[OpcodesCommon["OP_15"] = 95] = "OP_15";
    OpcodesCommon[OpcodesCommon["OP_16"] = 96] = "OP_16";
    OpcodesCommon[OpcodesCommon["OP_NOP"] = 97] = "OP_NOP";
    OpcodesCommon[OpcodesCommon["OP_VER"] = 98] = "OP_VER";
    OpcodesCommon[OpcodesCommon["OP_IF"] = 99] = "OP_IF";
    OpcodesCommon[OpcodesCommon["OP_NOTIF"] = 100] = "OP_NOTIF";
    OpcodesCommon[OpcodesCommon["OP_VERIF"] = 101] = "OP_VERIF";
    OpcodesCommon[OpcodesCommon["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
    OpcodesCommon[OpcodesCommon["OP_ELSE"] = 103] = "OP_ELSE";
    OpcodesCommon[OpcodesCommon["OP_ENDIF"] = 104] = "OP_ENDIF";
    OpcodesCommon[OpcodesCommon["OP_VERIFY"] = 105] = "OP_VERIFY";
    OpcodesCommon[OpcodesCommon["OP_RETURN"] = 106] = "OP_RETURN";
    OpcodesCommon[OpcodesCommon["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
    OpcodesCommon[OpcodesCommon["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
    OpcodesCommon[OpcodesCommon["OP_2DROP"] = 109] = "OP_2DROP";
    OpcodesCommon[OpcodesCommon["OP_2DUP"] = 110] = "OP_2DUP";
    OpcodesCommon[OpcodesCommon["OP_3DUP"] = 111] = "OP_3DUP";
    OpcodesCommon[OpcodesCommon["OP_2OVER"] = 112] = "OP_2OVER";
    OpcodesCommon[OpcodesCommon["OP_2ROT"] = 113] = "OP_2ROT";
    OpcodesCommon[OpcodesCommon["OP_2SWAP"] = 114] = "OP_2SWAP";
    OpcodesCommon[OpcodesCommon["OP_IFDUP"] = 115] = "OP_IFDUP";
    OpcodesCommon[OpcodesCommon["OP_DEPTH"] = 116] = "OP_DEPTH";
    OpcodesCommon[OpcodesCommon["OP_DROP"] = 117] = "OP_DROP";
    OpcodesCommon[OpcodesCommon["OP_DUP"] = 118] = "OP_DUP";
    OpcodesCommon[OpcodesCommon["OP_NIP"] = 119] = "OP_NIP";
    OpcodesCommon[OpcodesCommon["OP_OVER"] = 120] = "OP_OVER";
    OpcodesCommon[OpcodesCommon["OP_PICK"] = 121] = "OP_PICK";
    OpcodesCommon[OpcodesCommon["OP_ROLL"] = 122] = "OP_ROLL";
    OpcodesCommon[OpcodesCommon["OP_ROT"] = 123] = "OP_ROT";
    OpcodesCommon[OpcodesCommon["OP_SWAP"] = 124] = "OP_SWAP";
    OpcodesCommon[OpcodesCommon["OP_TUCK"] = 125] = "OP_TUCK";
    OpcodesCommon[OpcodesCommon["OP_CAT"] = 126] = "OP_CAT";
    OpcodesCommon[OpcodesCommon["OP_SUBSTR"] = 127] = "OP_SUBSTR";
    OpcodesCommon[OpcodesCommon["OP_LEFT"] = 128] = "OP_LEFT";
    OpcodesCommon[OpcodesCommon["OP_RIGHT"] = 129] = "OP_RIGHT";
    OpcodesCommon[OpcodesCommon["OP_SIZE"] = 130] = "OP_SIZE";
    OpcodesCommon[OpcodesCommon["OP_INVERT"] = 131] = "OP_INVERT";
    OpcodesCommon[OpcodesCommon["OP_AND"] = 132] = "OP_AND";
    OpcodesCommon[OpcodesCommon["OP_OR"] = 133] = "OP_OR";
    OpcodesCommon[OpcodesCommon["OP_XOR"] = 134] = "OP_XOR";
    OpcodesCommon[OpcodesCommon["OP_EQUAL"] = 135] = "OP_EQUAL";
    OpcodesCommon[OpcodesCommon["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
    OpcodesCommon[OpcodesCommon["OP_RESERVED1"] = 137] = "OP_RESERVED1";
    OpcodesCommon[OpcodesCommon["OP_RESERVED2"] = 138] = "OP_RESERVED2";
    OpcodesCommon[OpcodesCommon["OP_1ADD"] = 139] = "OP_1ADD";
    OpcodesCommon[OpcodesCommon["OP_1SUB"] = 140] = "OP_1SUB";
    OpcodesCommon[OpcodesCommon["OP_2MUL"] = 141] = "OP_2MUL";
    OpcodesCommon[OpcodesCommon["OP_2DIV"] = 142] = "OP_2DIV";
    OpcodesCommon[OpcodesCommon["OP_NEGATE"] = 143] = "OP_NEGATE";
    OpcodesCommon[OpcodesCommon["OP_ABS"] = 144] = "OP_ABS";
    OpcodesCommon[OpcodesCommon["OP_NOT"] = 145] = "OP_NOT";
    OpcodesCommon[OpcodesCommon["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
    OpcodesCommon[OpcodesCommon["OP_ADD"] = 147] = "OP_ADD";
    OpcodesCommon[OpcodesCommon["OP_SUB"] = 148] = "OP_SUB";
    OpcodesCommon[OpcodesCommon["OP_MUL"] = 149] = "OP_MUL";
    OpcodesCommon[OpcodesCommon["OP_DIV"] = 150] = "OP_DIV";
    OpcodesCommon[OpcodesCommon["OP_MOD"] = 151] = "OP_MOD";
    OpcodesCommon[OpcodesCommon["OP_LSHIFT"] = 152] = "OP_LSHIFT";
    OpcodesCommon[OpcodesCommon["OP_RSHIFT"] = 153] = "OP_RSHIFT";
    OpcodesCommon[OpcodesCommon["OP_BOOLAND"] = 154] = "OP_BOOLAND";
    OpcodesCommon[OpcodesCommon["OP_BOOLOR"] = 155] = "OP_BOOLOR";
    OpcodesCommon[OpcodesCommon["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
    OpcodesCommon[OpcodesCommon["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
    OpcodesCommon[OpcodesCommon["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
    OpcodesCommon[OpcodesCommon["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
    OpcodesCommon[OpcodesCommon["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
    OpcodesCommon[OpcodesCommon["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
    OpcodesCommon[OpcodesCommon["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
    OpcodesCommon[OpcodesCommon["OP_MIN"] = 163] = "OP_MIN";
    OpcodesCommon[OpcodesCommon["OP_MAX"] = 164] = "OP_MAX";
    OpcodesCommon[OpcodesCommon["OP_WITHIN"] = 165] = "OP_WITHIN";
    OpcodesCommon[OpcodesCommon["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
    OpcodesCommon[OpcodesCommon["OP_SHA1"] = 167] = "OP_SHA1";
    OpcodesCommon[OpcodesCommon["OP_SHA256"] = 168] = "OP_SHA256";
    OpcodesCommon[OpcodesCommon["OP_HASH160"] = 169] = "OP_HASH160";
    OpcodesCommon[OpcodesCommon["OP_HASH256"] = 170] = "OP_HASH256";
    OpcodesCommon[OpcodesCommon["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
    OpcodesCommon[OpcodesCommon["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
    OpcodesCommon[OpcodesCommon["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
    OpcodesCommon[OpcodesCommon["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
    OpcodesCommon[OpcodesCommon["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
    OpcodesCommon[OpcodesCommon["OP_NOP1"] = 176] = "OP_NOP1";
    /**
     * Previously `OP_NOP2`
     */
    OpcodesCommon[OpcodesCommon["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
    /**
     * Previously `OP_NOP2`
     */
    OpcodesCommon[OpcodesCommon["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
    OpcodesCommon[OpcodesCommon["OP_NOP4"] = 179] = "OP_NOP4";
    OpcodesCommon[OpcodesCommon["OP_NOP5"] = 180] = "OP_NOP5";
    OpcodesCommon[OpcodesCommon["OP_NOP6"] = 181] = "OP_NOP6";
    OpcodesCommon[OpcodesCommon["OP_NOP7"] = 182] = "OP_NOP7";
    OpcodesCommon[OpcodesCommon["OP_NOP8"] = 183] = "OP_NOP8";
    OpcodesCommon[OpcodesCommon["OP_NOP9"] = 184] = "OP_NOP9";
    OpcodesCommon[OpcodesCommon["OP_NOP10"] = 185] = "OP_NOP10";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN186"] = 186] = "OP_UNKNOWN186";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN187"] = 187] = "OP_UNKNOWN187";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN188"] = 188] = "OP_UNKNOWN188";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN189"] = 189] = "OP_UNKNOWN189";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN190"] = 190] = "OP_UNKNOWN190";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN191"] = 191] = "OP_UNKNOWN191";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN192"] = 192] = "OP_UNKNOWN192";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN193"] = 193] = "OP_UNKNOWN193";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN194"] = 194] = "OP_UNKNOWN194";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN195"] = 195] = "OP_UNKNOWN195";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN196"] = 196] = "OP_UNKNOWN196";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN197"] = 197] = "OP_UNKNOWN197";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN198"] = 198] = "OP_UNKNOWN198";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN199"] = 199] = "OP_UNKNOWN199";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN200"] = 200] = "OP_UNKNOWN200";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN201"] = 201] = "OP_UNKNOWN201";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN202"] = 202] = "OP_UNKNOWN202";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN203"] = 203] = "OP_UNKNOWN203";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN204"] = 204] = "OP_UNKNOWN204";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN205"] = 205] = "OP_UNKNOWN205";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN206"] = 206] = "OP_UNKNOWN206";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN207"] = 207] = "OP_UNKNOWN207";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN208"] = 208] = "OP_UNKNOWN208";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN209"] = 209] = "OP_UNKNOWN209";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN210"] = 210] = "OP_UNKNOWN210";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN211"] = 211] = "OP_UNKNOWN211";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN212"] = 212] = "OP_UNKNOWN212";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN213"] = 213] = "OP_UNKNOWN213";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN214"] = 214] = "OP_UNKNOWN214";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN215"] = 215] = "OP_UNKNOWN215";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN216"] = 216] = "OP_UNKNOWN216";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN217"] = 217] = "OP_UNKNOWN217";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN218"] = 218] = "OP_UNKNOWN218";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN219"] = 219] = "OP_UNKNOWN219";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN220"] = 220] = "OP_UNKNOWN220";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN221"] = 221] = "OP_UNKNOWN221";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN222"] = 222] = "OP_UNKNOWN222";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN223"] = 223] = "OP_UNKNOWN223";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN224"] = 224] = "OP_UNKNOWN224";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN225"] = 225] = "OP_UNKNOWN225";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN226"] = 226] = "OP_UNKNOWN226";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN227"] = 227] = "OP_UNKNOWN227";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN228"] = 228] = "OP_UNKNOWN228";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN229"] = 229] = "OP_UNKNOWN229";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN230"] = 230] = "OP_UNKNOWN230";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN231"] = 231] = "OP_UNKNOWN231";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN232"] = 232] = "OP_UNKNOWN232";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN233"] = 233] = "OP_UNKNOWN233";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN234"] = 234] = "OP_UNKNOWN234";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN235"] = 235] = "OP_UNKNOWN235";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN236"] = 236] = "OP_UNKNOWN236";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN237"] = 237] = "OP_UNKNOWN237";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN238"] = 238] = "OP_UNKNOWN238";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN239"] = 239] = "OP_UNKNOWN239";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN240"] = 240] = "OP_UNKNOWN240";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN241"] = 241] = "OP_UNKNOWN241";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN242"] = 242] = "OP_UNKNOWN242";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN243"] = 243] = "OP_UNKNOWN243";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN244"] = 244] = "OP_UNKNOWN244";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN245"] = 245] = "OP_UNKNOWN245";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN246"] = 246] = "OP_UNKNOWN246";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN247"] = 247] = "OP_UNKNOWN247";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN248"] = 248] = "OP_UNKNOWN248";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN249"] = 249] = "OP_UNKNOWN249";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN250"] = 250] = "OP_UNKNOWN250";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN251"] = 251] = "OP_UNKNOWN251";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN252"] = 252] = "OP_UNKNOWN252";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN253"] = 253] = "OP_UNKNOWN253";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN254"] = 254] = "OP_UNKNOWN254";
    OpcodesCommon[OpcodesCommon["OP_UNKNOWN255"] = 255] = "OP_UNKNOWN255";
})(OpcodesCommon = exports.OpcodesCommon || (exports.OpcodesCommon = {}));

},{}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNumberOperations = exports.pushNumberOpcodes = exports.pushOperations = exports.pushOperation = exports.pushByteOpcodes = exports.isMinimalDataPush = exports.encodeDataPush = exports.PushOperationConstants = void 0;
const format_1 = require("../../../format/format");
const hex_1 = require("../../../format/hex");
const combinators_1 = require("./combinators");
const errors_1 = require("./errors");
const opcodes_1 = require("./opcodes");
const types_1 = require("./types");
var PushOperationConstants;
(function (PushOperationConstants) {
    PushOperationConstants[PushOperationConstants["OP_0"] = 0] = "OP_0";
    /**
     * OP_PUSHBYTES_75
     */
    PushOperationConstants[PushOperationConstants["maximumPushByteOperationSize"] = 75] = "maximumPushByteOperationSize";
    PushOperationConstants[PushOperationConstants["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
    PushOperationConstants[PushOperationConstants["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
    PushOperationConstants[PushOperationConstants["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
    /**
     * OP_PUSHDATA_4
     */
    PushOperationConstants[PushOperationConstants["highestPushDataOpcode"] = 78] = "highestPushDataOpcode";
    /**
     * For OP_1 to OP_16, `opcode` is the number offset by `0x50` (80):
     *
     * `OP_N = 0x50 + N`
     *
     * OP_0 is really OP_PUSHBYTES_0 (`0x00`), so it does not follow this pattern.
     */
    PushOperationConstants[PushOperationConstants["pushNumberOpcodesOffset"] = 80] = "pushNumberOpcodesOffset";
    /** OP_1 through OP_16 */
    PushOperationConstants[PushOperationConstants["pushNumberOpcodes"] = 16] = "pushNumberOpcodes";
    PushOperationConstants[PushOperationConstants["negativeOne"] = 129] = "negativeOne";
    PushOperationConstants[PushOperationConstants["OP_1NEGATE"] = 79] = "OP_1NEGATE";
    /**
     * 256 - 1
     */
    PushOperationConstants[PushOperationConstants["maximumPushData1Size"] = 255] = "maximumPushData1Size";
    /**
     * Standard consensus parameter for most Bitcoin forks.
     */
    PushOperationConstants[PushOperationConstants["maximumPushSize"] = 520] = "maximumPushSize";
    /**
     * 256 ** 2 - 1
     */
    PushOperationConstants[PushOperationConstants["maximumPushData2Size"] = 65535] = "maximumPushData2Size";
    /**
     * 256 ** 4 - 1
     */
    PushOperationConstants[PushOperationConstants["maximumPushData4Size"] = 4294967295] = "maximumPushData4Size";
})(PushOperationConstants = exports.PushOperationConstants || (exports.PushOperationConstants = {}));
/**
 * Returns the minimal bytecode required to push the provided `data` to the
 * stack.
 *
 * @remarks
 * This method conservatively encodes a `Uint8Array` as a data push. For Script
 * Numbers which can be pushed using a single opcode (-1 through 16), the
 * equivalent bytecode value is returned. Other `data` values will be prefixed
 * with the proper opcode and push length bytes (if necessary) to create the
 * minimal push instruction.
 *
 * Note, while some single-byte Script Number pushes will be minimally-encoded
 * by this method, all larger inputs will be encoded as-is (it cannot be assumed
 * that inputs are intended to be used as Script Numbers). To encode the push of
 * a Script Number, minimally-encode the number before passing it to this
 * method, e.g.:
 * `encodeDataPush(bigIntToScriptNumber(parseBytesAsScriptNumber(nonMinimalNumber)))`.
 *
 * The maximum `bytecode` length which can be encoded for a push in the Bitcoin
 * system is `4294967295` (~4GB). This method assumes a smaller input – if
 * `bytecode` has the potential to be longer, it should be checked (and the
 * error handled) prior to calling this method.
 *
 * @param data - the Uint8Array to push to the stack
 */
// eslint-disable-next-line complexity
exports.encodeDataPush = (data) => data.length <= PushOperationConstants.maximumPushByteOperationSize
    ? data.length === 0
        ? Uint8Array.of(0)
        : data.length === 1
            ? data[0] !== 0 && data[0] <= PushOperationConstants.pushNumberOpcodes
                ? Uint8Array.of(data[0] + PushOperationConstants.pushNumberOpcodesOffset)
                : data[0] === PushOperationConstants.negativeOne
                    ? Uint8Array.of(PushOperationConstants.OP_1NEGATE)
                    : Uint8Array.from([1, ...data])
            : Uint8Array.from([data.length, ...data])
    : data.length <= PushOperationConstants.maximumPushData1Size
        ? Uint8Array.from([
            PushOperationConstants.OP_PUSHDATA_1,
            data.length,
            ...data,
        ])
        : data.length <= PushOperationConstants.maximumPushData2Size
            ? Uint8Array.from([
                PushOperationConstants.OP_PUSHDATA_2,
                ...format_1.numberToBinUint16LE(data.length),
                ...data,
            ])
            : Uint8Array.from([
                PushOperationConstants.OP_PUSHDATA_4,
                ...format_1.numberToBinUint32LE(data.length),
                ...data,
            ]);
/**
 * Returns true if the provided `data` is minimally-encoded by the provided
 * `opcode`.
 * @param opcode - the opcode used to push `data`
 * @param data - the contents of the push
 */
// eslint-disable-next-line complexity
exports.isMinimalDataPush = (opcode, data) => data.length === 0
    ? opcode === PushOperationConstants.OP_0
    : data.length === 1
        ? data[0] >= 1 && data[0] <= PushOperationConstants.pushNumberOpcodes
            ? opcode === data[0] + PushOperationConstants.pushNumberOpcodesOffset
            : data[0] === PushOperationConstants.negativeOne
                ? opcode === PushOperationConstants.OP_1NEGATE
                : true
        : data.length <= PushOperationConstants.maximumPushByteOperationSize
            ? opcode === data.length
            : data.length <= PushOperationConstants.maximumPushData1Size
                ? opcode === PushOperationConstants.OP_PUSHDATA_1
                : data.length <= PushOperationConstants.maximumPushData2Size
                    ? opcode === PushOperationConstants.OP_PUSHDATA_2
                    : true;
exports.pushByteOpcodes = [
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_1,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_2,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_3,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_4,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_5,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_6,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_7,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_8,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_9,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_10,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_11,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_12,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_13,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_14,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_15,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_16,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_17,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_18,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_19,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_20,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_21,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_22,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_23,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_24,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_25,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_26,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_27,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_28,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_29,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_30,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_31,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_32,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_33,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_34,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_35,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_36,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_37,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_38,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_39,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_40,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_41,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_42,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_43,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_44,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_45,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_46,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_47,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_48,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_49,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_50,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_51,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_52,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_53,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_54,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_55,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_56,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_57,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_58,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_59,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_60,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_61,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_62,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_63,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_64,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_65,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_66,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_67,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_68,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_69,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_70,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_71,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_72,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_73,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_74,
    opcodes_1.OpcodesCommon.OP_PUSHBYTES_75,
];
const executionIsActive = (state) => state.executionStack.every((item) => item);
exports.pushOperation = (flags, maximumPushSize = PushOperationConstants.maximumPushSize) => (state) => {
    const instruction = state.instructions[state.ip];
    return instruction.data.length > maximumPushSize
        ? errors_1.applyError(errors_1.AuthenticationErrorCommon.exceedsMaximumPush, state)
        : executionIsActive(state)
            ? flags.requireMinimalEncoding &&
                !exports.isMinimalDataPush(instruction.opcode, instruction.data)
                ? errors_1.applyError(errors_1.AuthenticationErrorCommon.nonMinimalPush, state)
                : combinators_1.pushToStack(state, instruction.data)
            : state;
};
exports.pushOperations = (flags, maximumPushSize = PushOperationConstants.maximumPushSize) => {
    const push = exports.pushOperation(flags, maximumPushSize);
    return hex_1.range(PushOperationConstants.highestPushDataOpcode + 1).reduce((group, i) => (Object.assign(Object.assign({}, group), { [i]: push })), {});
};
exports.pushNumberOpcodes = [
    opcodes_1.OpcodesCommon.OP_1NEGATE,
    opcodes_1.OpcodesCommon.OP_1,
    opcodes_1.OpcodesCommon.OP_2,
    opcodes_1.OpcodesCommon.OP_3,
    opcodes_1.OpcodesCommon.OP_4,
    opcodes_1.OpcodesCommon.OP_5,
    opcodes_1.OpcodesCommon.OP_6,
    opcodes_1.OpcodesCommon.OP_7,
    opcodes_1.OpcodesCommon.OP_8,
    opcodes_1.OpcodesCommon.OP_9,
    opcodes_1.OpcodesCommon.OP_10,
    opcodes_1.OpcodesCommon.OP_11,
    opcodes_1.OpcodesCommon.OP_12,
    opcodes_1.OpcodesCommon.OP_13,
    opcodes_1.OpcodesCommon.OP_14,
    opcodes_1.OpcodesCommon.OP_15,
    opcodes_1.OpcodesCommon.OP_16,
];
const op1NegateValue = -1;
exports.pushNumberOperations = () => exports.pushNumberOpcodes
    .map((opcode, i) => [
    opcode,
    [op1NegateValue, ...hex_1.range(PushOperationConstants.pushNumberOpcodes, 1)]
        .map(BigInt)
        .map(types_1.bigIntToScriptNumber)[i],
])
    .reduce((group, pair) => (Object.assign(Object.assign({}, group), { [pair[0]]: (state) => combinators_1.pushToStack(state, pair[1].slice()) })), {});

},{"../../../format/format":27,"../../../format/hex":28,"./combinators":75,"./errors":80,"./opcodes":83,"./types":89}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLegacySigningSerialization = exports.generateSigningSerializationBCH = exports.hashOutputs = exports.hashSequence = exports.hashPrevouts = exports.isDefinedSigningSerializationType = exports.SigningSerializationFlag = void 0;
const format_1 = require("../../../format/format");
/**
 * A.K.A. `sighash` flags
 */
var SigningSerializationFlag;
(function (SigningSerializationFlag) {
    /**
     * A.K.A. `SIGHASH_ALL`
     */
    SigningSerializationFlag[SigningSerializationFlag["allOutputs"] = 1] = "allOutputs";
    /**
     * A.K.A `SIGHASH_NONE`
     */
    SigningSerializationFlag[SigningSerializationFlag["noOutputs"] = 2] = "noOutputs";
    /**
     * A.K.A. `SIGHASH_SINGLE`
     */
    SigningSerializationFlag[SigningSerializationFlag["correspondingOutput"] = 3] = "correspondingOutput";
    SigningSerializationFlag[SigningSerializationFlag["forkId"] = 64] = "forkId";
    /**
     * A.K.A `ANYONE_CAN_PAY`
     */
    SigningSerializationFlag[SigningSerializationFlag["singleInput"] = 128] = "singleInput";
})(SigningSerializationFlag = exports.SigningSerializationFlag || (exports.SigningSerializationFlag = {}));
exports.isDefinedSigningSerializationType = (byte) => {
    const baseType = 
    // eslint-disable-next-line no-bitwise
    byte &
        // eslint-disable-next-line no-bitwise
        ~(SigningSerializationFlag.forkId | SigningSerializationFlag.singleInput);
    return (baseType >= SigningSerializationFlag.allOutputs &&
        baseType <= SigningSerializationFlag.correspondingOutput);
};
const match = (type, flag) => 
// eslint-disable-next-line no-bitwise
(type[0] & flag) !== 0;
const equals = (type, flag
// eslint-disable-next-line no-bitwise
) => (type[0] & 31 /* mask5Bits */) === flag;
const shouldSerializeSingleInput = (type) => match(type, SigningSerializationFlag.singleInput);
const shouldSerializeCorrespondingOutput = (type) => equals(type, SigningSerializationFlag.correspondingOutput);
const shouldSerializeNoOutputs = (type) => equals(type, SigningSerializationFlag.noOutputs);
const emptyHash = () => new Uint8Array(32 /* sha256HashByteLength */).fill(0);
/**
 * Return the proper `hashPrevouts` value for a given a signing serialization
 * type.
 * @param signingSerializationType - the signing serialization type to test
 * @param transactionOutpoints - see `generateSigningSerializationBCH`
 */
exports.hashPrevouts = ({ sha256, signingSerializationType, transactionOutpoints, }) => shouldSerializeSingleInput(signingSerializationType)
    ? emptyHash()
    : sha256.hash(sha256.hash(transactionOutpoints));
/**
 * Return the proper `hashSequence` value for a given a signing serialization
 * type.
 * @param signingSerializationType - the signing serialization type to test
 * @param transactionSequenceNumbers - see
 * `generateSigningSerializationBCH`
 */
exports.hashSequence = ({ sha256, signingSerializationType, transactionSequenceNumbers, }) => !shouldSerializeSingleInput(signingSerializationType) &&
    !shouldSerializeCorrespondingOutput(signingSerializationType) &&
    !shouldSerializeNoOutputs(signingSerializationType)
    ? sha256.hash(sha256.hash(transactionSequenceNumbers))
    : emptyHash();
/**
 * Return the proper `hashOutputs` value for a given a signing serialization
 * type.
 * @param signingSerializationType - the signing serialization type to test
 * @param transactionOutputs - see `generateSigningSerializationBCH`
 * @param correspondingOutput - see `generateSigningSerializationBCH`
 */
exports.hashOutputs = ({ correspondingOutput, sha256, signingSerializationType, transactionOutputs, }) => !shouldSerializeCorrespondingOutput(signingSerializationType) &&
    !shouldSerializeNoOutputs(signingSerializationType)
    ? sha256.hash(sha256.hash(transactionOutputs))
    : shouldSerializeCorrespondingOutput(signingSerializationType)
        ? correspondingOutput === undefined
            ? emptyHash()
            : sha256.hash(sha256.hash(correspondingOutput))
        : emptyHash();
/**
 * Serialize the signature-protected properties of a transaction following the
 * algorithm required by the `signingSerializationType` of a signature.
 *
 * Note: this implementation re-computes all hashes each time it is called. A
 * performance-critical application could instead use memoization to avoid
 * re-computing these values when validating many signatures within a single
 * transaction. See BIP143 for details.
 */
exports.generateSigningSerializationBCH = ({ correspondingOutput, coveredBytecode, forkId = new Uint8Array([0, 0, 0]), locktime, outpointIndex, outpointTransactionHash, outputValue, sequenceNumber, sha256, signingSerializationType, transactionOutpoints, transactionOutputs, transactionSequenceNumbers, version, }) => format_1.flattenBinArray([
    format_1.numberToBinUint32LE(version),
    exports.hashPrevouts({ sha256, signingSerializationType, transactionOutpoints }),
    exports.hashSequence({
        sha256,
        signingSerializationType,
        transactionSequenceNumbers,
    }),
    outpointTransactionHash.slice().reverse(),
    format_1.numberToBinUint32LE(outpointIndex),
    format_1.bigIntToBitcoinVarInt(BigInt(coveredBytecode.length)),
    coveredBytecode,
    outputValue,
    format_1.numberToBinUint32LE(sequenceNumber),
    exports.hashOutputs({
        correspondingOutput,
        sha256,
        signingSerializationType,
        transactionOutputs,
    }),
    format_1.numberToBinUint32LE(locktime),
    signingSerializationType,
    forkId,
]);
/**
 * @param signingSerializationType - the 32-bit number indicating the signing
 * serialization algorithm to use
 */
exports.isLegacySigningSerialization = (signingSerializationType) => {
    // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
    const forkValue = signingSerializationType >> 8;
    // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
    const newForkValue = (forkValue ^ 0xdead) | 0xff0000;
    // eslint-disable-next-line no-bitwise, @typescript-eslint/no-magic-numbers
    const sighashType = (newForkValue << 8) | (signingSerializationType & 0xff);
    // eslint-disable-next-line no-bitwise
    return (sighashType & SigningSerializationFlag.forkId) === 0;
};

},{"../../../format/format":27}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spliceOperations = exports.opSize = void 0;
const combinators_1 = require("./combinators");
const opcodes_1 = require("./opcodes");
const types_1 = require("./types");
exports.opSize = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => combinators_1.pushToStack(nextState, item, types_1.bigIntToScriptNumber(BigInt(item.length))));
exports.spliceOperations = () => ({
    [opcodes_1.OpcodesCommon.OP_SIZE]: exports.opSize(),
});

},{"./combinators":75,"./opcodes":83,"./types":89}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackOperations = exports.opTuck = exports.opSwap = exports.opRot = exports.opRoll = exports.opPick = exports.opOver = exports.opNip = exports.opDup = exports.opDrop = exports.opDepth = exports.opIfDup = exports.op2Swap = exports.op2Rot = exports.op2Over = exports.op3Dup = exports.op2Dup = exports.op2Drop = exports.opFromAltStack = exports.opToAltStack = void 0;
const combinators_1 = require("./combinators");
const errors_1 = require("./errors");
const opcodes_1 = require("./opcodes");
const types_1 = require("./types");
exports.opToAltStack = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => {
    // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
    nextState.alternateStack.push(item);
    return nextState;
});
exports.opFromAltStack = () => (state) => {
    // eslint-disable-next-line functional/immutable-data
    const item = state.alternateStack.pop();
    if (item === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.emptyAlternateStack, state);
    }
    return combinators_1.pushToStack(state, item);
};
exports.op2Drop = () => (state) => combinators_1.useTwoStackItems(state, (nextState) => nextState);
exports.op2Dup = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => combinators_1.pushToStack(nextState, a, b, a.slice(), b.slice()));
exports.op3Dup = () => (state) => combinators_1.useThreeStackItems(state, (nextState, [a, b, c]) => combinators_1.pushToStack(nextState, a, b, c, a.slice(), b.slice(), c.slice()));
exports.op2Over = () => (state) => combinators_1.useFourStackItems(state, (nextState, [a, b, c, d]) => combinators_1.pushToStack(nextState, a, b, c, d, a.slice(), b.slice()));
exports.op2Rot = () => (state) => combinators_1.useSixStackItems(state, (nextState, [a, b, c, d, e, f]) => combinators_1.pushToStack(nextState, c, d, e, f, a, b));
exports.op2Swap = () => (state) => combinators_1.useFourStackItems(state, (nextState, [a, b, c, d]) => combinators_1.pushToStack(nextState, c, d, a, b));
exports.opIfDup = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => combinators_1.pushToStack(nextState, ...(types_1.stackItemIsTruthy(item) ? [item, item.slice()] : [item])));
exports.opDepth = () => (state) => combinators_1.pushToStack(state, types_1.bigIntToScriptNumber(BigInt(state.stack.length)));
exports.opDrop = () => (state) => combinators_1.useOneStackItem(state, (nextState) => nextState);
exports.opDup = () => (state) => combinators_1.useOneStackItem(state, (nextState, [item]) => combinators_1.pushToStack(nextState, item, item.slice()));
exports.opNip = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [, b]) => combinators_1.pushToStack(nextState, b));
exports.opOver = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => combinators_1.pushToStack(nextState, a, b, a.slice()));
exports.opPick = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, depth) => {
    const item = nextState.stack[nextState.stack.length - 1 - Number(depth)];
    if (item === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidStackIndex, state);
    }
    return combinators_1.pushToStack(nextState, item.slice());
}, { requireMinimalEncoding });
exports.opRoll = ({ requireMinimalEncoding, }) => (state) => combinators_1.useOneScriptNumber(state, (nextState, depth) => {
    const index = nextState.stack.length - 1 - Number(depth);
    if (index < 0 || index > nextState.stack.length - 1) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidStackIndex, state);
    }
    // eslint-disable-next-line functional/immutable-data
    return combinators_1.pushToStack(nextState, nextState.stack.splice(index, 1)[0]);
}, { requireMinimalEncoding });
exports.opRot = () => (state) => combinators_1.useThreeStackItems(state, (nextState, [a, b, c]) => combinators_1.pushToStack(nextState, b, c, a));
exports.opSwap = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => combinators_1.pushToStack(nextState, b, a));
exports.opTuck = () => (state) => combinators_1.useTwoStackItems(state, (nextState, [a, b]) => combinators_1.pushToStack(nextState, b.slice(), a, b));
exports.stackOperations = (flags) => ({
    [opcodes_1.OpcodesCommon.OP_TOALTSTACK]: exports.opToAltStack(),
    [opcodes_1.OpcodesCommon.OP_FROMALTSTACK]: exports.opFromAltStack(),
    [opcodes_1.OpcodesCommon.OP_2DROP]: exports.op2Drop(),
    [opcodes_1.OpcodesCommon.OP_2DUP]: exports.op2Dup(),
    [opcodes_1.OpcodesCommon.OP_3DUP]: exports.op3Dup(),
    [opcodes_1.OpcodesCommon.OP_2OVER]: exports.op2Over(),
    [opcodes_1.OpcodesCommon.OP_2ROT]: exports.op2Rot(),
    [opcodes_1.OpcodesCommon.OP_2SWAP]: exports.op2Swap(),
    [opcodes_1.OpcodesCommon.OP_IFDUP]: exports.opIfDup(),
    [opcodes_1.OpcodesCommon.OP_DEPTH]: exports.opDepth(),
    [opcodes_1.OpcodesCommon.OP_DROP]: exports.opDrop(),
    [opcodes_1.OpcodesCommon.OP_DUP]: exports.opDup(),
    [opcodes_1.OpcodesCommon.OP_NIP]: exports.opNip(),
    [opcodes_1.OpcodesCommon.OP_OVER]: exports.opOver(),
    [opcodes_1.OpcodesCommon.OP_PICK]: exports.opPick(flags),
    [opcodes_1.OpcodesCommon.OP_ROLL]: exports.opRoll(flags),
    [opcodes_1.OpcodesCommon.OP_ROT]: exports.opRot(),
    [opcodes_1.OpcodesCommon.OP_SWAP]: exports.opSwap(),
    [opcodes_1.OpcodesCommon.OP_TUCK]: exports.opTuck(),
});

},{"./combinators":75,"./errors":80,"./opcodes":83,"./types":89}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeOperations = exports.opCheckSequenceVerify = exports.opCheckLockTimeVerify = exports.readLocktime = void 0;
const common_1 = require("./common");
const errors_1 = require("./errors");
const opcodes_1 = require("./opcodes");
var Bits;
(function (Bits) {
    Bits[Bits["sequenceLocktimeDisableFlag"] = 31] = "sequenceLocktimeDisableFlag";
    Bits[Bits["sequenceLocktimeTypeFlag"] = 22] = "sequenceLocktimeTypeFlag";
})(Bits || (Bits = {}));
var Constants;
(function (Constants) {
    Constants[Constants["locktimeScriptNumberByteLength"] = 5] = "locktimeScriptNumberByteLength";
    Constants[Constants["locktimeThreshold"] = 500000000] = "locktimeThreshold";
    Constants[Constants["locktimeDisablingSequenceNumber"] = 4294967295] = "locktimeDisablingSequenceNumber";
    Constants[Constants["sequenceLocktimeTransactionVersionMinimum"] = 2] = "sequenceLocktimeTransactionVersionMinimum";
    // eslint-disable-next-line no-bitwise
    Constants[Constants["sequenceLocktimeDisableFlag"] = 2147483648] = "sequenceLocktimeDisableFlag";
    // eslint-disable-next-line no-bitwise
    Constants[Constants["sequenceLocktimeTypeFlag"] = 4194304] = "sequenceLocktimeTypeFlag";
    Constants[Constants["sequenceGranularity"] = 9] = "sequenceGranularity";
    Constants[Constants["sequenceLocktimeMask"] = 65535] = "sequenceLocktimeMask";
})(Constants || (Constants = {}));
exports.readLocktime = (state, operation, flags) => {
    const item = state.stack[state.stack.length - 1];
    if (item === undefined) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.emptyStack, state);
    }
    const parsedLocktime = common_1.parseBytesAsScriptNumber(item, {
        maximumScriptNumberByteLength: Constants.locktimeScriptNumberByteLength,
        requireMinimalEncoding: flags.requireMinimalEncoding,
    });
    if (common_1.isScriptNumberError(parsedLocktime)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.invalidScriptNumber, state);
    }
    const locktime = Number(parsedLocktime);
    if (locktime < 0) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.negativeLocktime, state);
    }
    return operation(state, locktime);
};
const locktimeTypesAreCompatible = (locktime, requiredLocktime) => (locktime < Constants.locktimeThreshold &&
    requiredLocktime < Constants.locktimeThreshold) ||
    (locktime >= Constants.locktimeThreshold &&
        requiredLocktime >= Constants.locktimeThreshold);
exports.opCheckLockTimeVerify = (flags) => (state) => exports.readLocktime(state, (nextState, requiredLocktime) => {
    if (!locktimeTypesAreCompatible(nextState.locktime, requiredLocktime)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.incompatibleLocktimeType, nextState);
    }
    if (requiredLocktime > nextState.locktime) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.unsatisfiedLocktime, nextState);
    }
    if (nextState.sequenceNumber === Constants.locktimeDisablingSequenceNumber) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.locktimeDisabled, nextState);
    }
    return nextState;
}, flags);
// eslint-disable-next-line no-bitwise
const includesFlag = (value, flag) => (value & flag) !== 0;
exports.opCheckSequenceVerify = (flags) => (state) => exports.readLocktime(state, 
// eslint-disable-next-line complexity
(nextState, requiredSequence) => {
    const sequenceLocktimeDisabled = includesFlag(requiredSequence, Constants.sequenceLocktimeDisableFlag);
    if (sequenceLocktimeDisabled) {
        return nextState;
    }
    if (nextState.version < Constants.sequenceLocktimeTransactionVersionMinimum) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.checkSequenceUnavailable, nextState);
    }
    if (includesFlag(nextState.sequenceNumber, Constants.sequenceLocktimeDisableFlag)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.unmatchedSequenceDisable, nextState);
    }
    if (includesFlag(requiredSequence, Constants.sequenceLocktimeTypeFlag) !==
        includesFlag(nextState.sequenceNumber, Constants.sequenceLocktimeTypeFlag)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.incompatibleSequenceType, nextState);
    }
    if (
    // eslint-disable-next-line no-bitwise
    (requiredSequence & Constants.sequenceLocktimeMask) >
        // eslint-disable-next-line no-bitwise
        (nextState.sequenceNumber & Constants.sequenceLocktimeMask)) {
        return errors_1.applyError(errors_1.AuthenticationErrorCommon.unsatisfiedSequenceNumber, nextState);
    }
    return nextState;
}, flags);
exports.timeOperations = (flags) => ({
    [opcodes_1.OpcodesCommon.OP_CHECKLOCKTIMEVERIFY]: exports.opCheckLockTimeVerify(flags),
    [opcodes_1.OpcodesCommon.OP_CHECKSEQUENCEVERIFY]: exports.opCheckSequenceVerify(flags),
});

},{"./common":76,"./errors":80,"./opcodes":83}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanToScriptNumber = exports.stackItemIsTruthy = exports.bigIntToScriptNumber = exports.parseBytesAsScriptNumber = exports.isScriptNumberError = exports.ScriptNumberError = void 0;
var ScriptNumberError;
(function (ScriptNumberError) {
    ScriptNumberError["outOfRange"] = "Failed to parse Script Number: overflows Script Number range.";
    ScriptNumberError["requiresMinimal"] = "Failed to parse Script Number: the number is not minimally-encoded.";
})(ScriptNumberError = exports.ScriptNumberError || (exports.ScriptNumberError = {}));
exports.isScriptNumberError = (value) => value === ScriptNumberError.outOfRange ||
    value === ScriptNumberError.requiresMinimal;
const normalMaximumScriptNumberByteLength = 4;
/**
 * This method attempts to parse a "Script Number", a format with which numeric
 * values are represented on the stack. (The Satoshi implementation calls this
 * `CScriptNum`.)
 *
 * If `bytes` is a valid Script Number, this method returns the represented
 * number in BigInt format. If `bytes` is not valid, a `ScriptNumberError` is
 * returned.
 *
 * All common operations accepting numeric parameters or pushing numeric values
 * to the stack currently use the Script Number format. The binary format of
 * numbers wouldn't be important if they could only be operated on by arithmetic
 * operators, but since the results of these operations may become input to
 * other operations (e.g. hashing), the specific representation is consensus-
 * critical.
 *
 * Parsing of Script Numbers is limited to 4 bytes (with the exception of
 * OP_CHECKLOCKTIMEVERIFY and OP_CHECKSEQUENCEVERIFY, which read up to 5-bytes).
 * The bytes are read as a signed integer (for 32-bits: inclusive range from
 * -2^31 + 1 to 2^31 - 1) in little-endian byte order. Script Numbers must
 * further be encoded as minimally as possible (no zero-padding). See code/tests
 * for details.
 *
 * @remarks
 * Operators may push numeric results to the stack which exceed the current
 * 4-byte length limit of Script Numbers. While these stack elements would
 * otherwise be valid Script Numbers, because of the 4-byte length limit, they
 * can only be used as non-numeric values in later operations.
 *
 * Most other implementations currently parse Script Numbers into 64-bit
 * integers to operate on them (rather than integers of arbitrary size like
 * BigInt). Currently, no operators are at risk of overflowing 64-bit integers
 * given 32-bit integer inputs, but future operators may require additional
 * refactoring in those implementations.
 *
 * @param bytes - a Uint8Array from the stack
 * @param requireMinimalEncoding - if true, this method returns an error when
 * parsing non-minimally encoded Script Numbers
 * @param maximumScriptNumberByteLength - the maximum valid number of bytes
 */
// eslint-disable-next-line complexity
exports.parseBytesAsScriptNumber = (bytes, { maximumScriptNumberByteLength = normalMaximumScriptNumberByteLength, requireMinimalEncoding = true, } = {
    maximumScriptNumberByteLength: normalMaximumScriptNumberByteLength,
    requireMinimalEncoding: true,
}) => {
    if (bytes.length === 0) {
        return BigInt(0);
    }
    if (bytes.length > maximumScriptNumberByteLength) {
        return ScriptNumberError.outOfRange;
    }
    const mostSignificantByte = bytes[bytes.length - 1];
    const secondMostSignificantByte = bytes[bytes.length - 1 - 1];
    const allButTheSignBit = 127;
    const justTheSignBit = 128;
    if (requireMinimalEncoding &&
        // eslint-disable-next-line no-bitwise
        (mostSignificantByte & allButTheSignBit) === 0 &&
        // eslint-disable-next-line no-bitwise
        (bytes.length <= 1 || (secondMostSignificantByte & justTheSignBit) === 0)) {
        return ScriptNumberError.requiresMinimal;
    }
    const bitsPerByte = 8;
    const signFlippingByte = 0x80;
    // eslint-disable-next-line functional/no-let
    let result = BigInt(0);
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let byte = 0; byte < bytes.length; byte++) {
        // eslint-disable-next-line functional/no-expression-statement,  no-bitwise
        result |= BigInt(bytes[byte]) << BigInt(byte * bitsPerByte);
    }
    /* eslint-disable no-bitwise */
    const isNegative = (bytes[bytes.length - 1] & signFlippingByte) !== 0;
    return isNegative
        ? -(result &
            ~(BigInt(signFlippingByte) << BigInt(bitsPerByte * (bytes.length - 1))))
        : result;
    /* eslint-enable no-bitwise */
};
/**
 * Convert a BigInt into the "Script Number" format. See
 * `parseBytesAsScriptNumber` for more information.
 *
 * @param integer - the BigInt to encode as a Script Number
 */
// eslint-disable-next-line complexity
exports.bigIntToScriptNumber = (integer) => {
    if (integer === BigInt(0)) {
        return new Uint8Array();
    }
    const bytes = [];
    const isNegative = integer < 0;
    const byteStates = 0xff;
    const bitsPerByte = 8;
    // eslint-disable-next-line functional/no-let
    let remaining = isNegative ? -integer : integer;
    // eslint-disable-next-line functional/no-loop-statement
    while (remaining > 0) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data, no-bitwise
        bytes.push(Number(remaining & BigInt(byteStates)));
        // eslint-disable-next-line functional/no-expression-statement, no-bitwise
        remaining >>= BigInt(bitsPerByte);
    }
    const signFlippingByte = 0x80;
    // eslint-disable-next-line no-bitwise, functional/no-conditional-statement
    if ((bytes[bytes.length - 1] & signFlippingByte) > 0) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        bytes.push(isNegative ? signFlippingByte : 0x00);
        // eslint-disable-next-line functional/no-conditional-statement
    }
    else if (isNegative) {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data, no-bitwise
        bytes[bytes.length - 1] |= signFlippingByte;
    }
    return new Uint8Array(bytes);
};
/**
 * Returns true if the provided stack item is "truthy" in the sense required
 * by several operations (anything but zero and "negative zero").
 *
 * The Satoshi implementation calls this method `CastToBool`.
 *
 * @param item - the stack item to check for truthiness
 */
exports.stackItemIsTruthy = (item) => {
    const signFlippingByte = 0x80;
    // eslint-disable-next-line functional/no-let, functional/no-loop-statement, no-plusplus
    for (let i = 0; i < item.length; i++) {
        if (item[i] !== 0) {
            if (i === item.length - 1 && item[i] === signFlippingByte) {
                return false;
            }
            return true;
        }
    }
    return false;
};
/**
 * Convert a boolean into Script Number format (the type used to express
 * boolean values emitted by several operations).
 *
 * @param value - the boolean value to convert
 */
exports.booleanToScriptNumber = (value) => value ? exports.bigIntToScriptNumber(BigInt(1)) : exports.bigIntToScriptNumber(BigInt(0));

},{}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],91:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeParsedAuthenticationInstructions = exports.serializeAuthenticationInstructions = exports.serializeParsedAuthenticationInstruction = exports.serializeParsedAuthenticationInstructionMalformed = exports.serializeAuthenticationInstruction = exports.assembleBytecodeBTC = exports.assembleBytecodeBCH = exports.assembleBytecode = exports.generateBytecodeMap = exports.disassembleBytecodeBTC = exports.disassembleBytecodeBCH = exports.disassembleBytecode = exports.disassembleParsedAuthenticationInstructions = exports.disassembleParsedAuthenticationInstruction = exports.disassembleAuthenticationInstruction = exports.disassembleParsedAuthenticationInstructionMalformed = exports.parseBytecode = exports.readAuthenticationInstruction = exports.lengthBytesForPushOpcode = exports.authenticationInstructionsAreNotMalformed = exports.authenticationInstructionsAreMalformed = exports.authenticationInstructionIsMalformed = void 0;
const format_1 = require("../../format/format");
const compiler_1 = require("../../template/compiler");
const bch_1 = require("./bch/bch");
const btc_1 = require("./btc/btc");
/**
 * A type-guard which checks if the provided instruction is malformed.
 * @param instruction - the instruction to check
 */
exports.authenticationInstructionIsMalformed = (instruction) => 'malformed' in instruction;
/**
 * A type-guard which checks if the final instruction in the provided array of
 * instructions is malformed. (Only the final instruction can be malformed.)
 * @param instruction - the array of instructions to check
 */
exports.authenticationInstructionsAreMalformed = (instructions) => instructions.length > 0 &&
    exports.authenticationInstructionIsMalformed(instructions[instructions.length - 1]);
/**
 * A type-guard which confirms that the final instruction in the provided array
 * is not malformed. (Only the final instruction can be malformed.)
 * @param instruction - the array of instructions to check
 */
exports.authenticationInstructionsAreNotMalformed = (instructions) => !exports.authenticationInstructionsAreMalformed(instructions);
var CommonPushOpcodes;
(function (CommonPushOpcodes) {
    CommonPushOpcodes[CommonPushOpcodes["OP_0"] = 0] = "OP_0";
    CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_1"] = 76] = "OP_PUSHDATA_1";
    CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_2"] = 77] = "OP_PUSHDATA_2";
    CommonPushOpcodes[CommonPushOpcodes["OP_PUSHDATA_4"] = 78] = "OP_PUSHDATA_4";
})(CommonPushOpcodes || (CommonPushOpcodes = {}));
const uint8Bytes = 1;
const uint16Bytes = 2;
const uint32Bytes = 4;
const readLittleEndianNumber = (script, index, length) => {
    const view = new DataView(script.buffer, index, length);
    const readAsLittleEndian = true;
    return length === uint8Bytes
        ? view.getUint8(0)
        : length === uint16Bytes
            ? view.getUint16(0, readAsLittleEndian)
            : view.getUint32(0, readAsLittleEndian);
};
/**
 * Returns the number of bytes used to indicate the length of the push in this
 * operation.
 * @param opcode - an opcode between 0x00 and 0x4e
 */
exports.lengthBytesForPushOpcode = (opcode) => opcode < CommonPushOpcodes.OP_PUSHDATA_1
    ? 0
    : opcode === CommonPushOpcodes.OP_PUSHDATA_1
        ? uint8Bytes
        : opcode === CommonPushOpcodes.OP_PUSHDATA_2
            ? uint16Bytes
            : uint32Bytes;
/**
 * Parse one instruction from the provided script.
 *
 * Returns an object with an `instruction` referencing a
 * `ParsedAuthenticationInstruction`, and a `nextIndex` indicating the next
 * index from which to read. If the next index is greater than or equal to the
 * length of the script, the script has been fully parsed.
 *
 * The final `ParsedAuthenticationInstruction` from a serialized script may be
 * malformed if 1) the final operation is a push and 2) too few bytes remain for
 * the push operation to complete.
 *
 * @param script - the script from which to read the next instruction
 * @param index - the offset from which to begin reading
 */
// eslint-disable-next-line complexity
exports.readAuthenticationInstruction = (script, index) => {
    const opcode = script[index];
    if (opcode > CommonPushOpcodes.OP_PUSHDATA_4) {
        return {
            instruction: {
                opcode: opcode,
            },
            nextIndex: index + 1,
        };
    }
    const lengthBytes = exports.lengthBytesForPushOpcode(opcode);
    if (lengthBytes !== 0 && index + lengthBytes >= script.length) {
        const sliceStart = index + 1;
        const sliceEnd = sliceStart + lengthBytes;
        return {
            instruction: {
                expectedLengthBytes: lengthBytes,
                length: script.slice(sliceStart, sliceEnd),
                malformed: true,
                opcode: opcode,
            },
            nextIndex: sliceEnd,
        };
    }
    const dataBytes = lengthBytes === 0
        ? opcode
        : readLittleEndianNumber(script, index + 1, lengthBytes);
    const dataStart = index + 1 + lengthBytes;
    const dataEnd = dataStart + dataBytes;
    return {
        instruction: Object.assign(Object.assign({ data: script.slice(dataStart, dataEnd) }, (dataEnd > script.length
            ? {
                expectedDataBytes: dataEnd - dataStart,
                malformed: true,
            }
            : undefined)), { opcode: opcode }),
        nextIndex: dataEnd,
    };
};
/**
 * Parse authentication bytecode (`lockingBytecode` or `unlockingBytecode`)
 * into `ParsedAuthenticationInstructions`. The method
 * `authenticationInstructionsAreMalformed` can be used to check if these
 * instructions include a malformed instruction. If not, they are valid
 * `AuthenticationInstructions`.
 *
 * This implementation is common to most bitcoin forks, but the type parameter
 * can be used to strongly type the resulting instructions. For example:
 *
 * ```js
 *  const instructions = parseAuthenticationBytecode<OpcodesBCH>(script);
 * ```
 *
 * @param script - the serialized script to parse
 */
exports.parseBytecode = (script) => {
    const instructions = [];
    // eslint-disable-next-line functional/no-let
    let i = 0;
    // eslint-disable-next-line functional/no-loop-statement
    while (i < script.length) {
        const { instruction, nextIndex } = exports.readAuthenticationInstruction(script, i);
        // eslint-disable-next-line functional/no-expression-statement
        i = nextIndex;
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        instructions.push(instruction);
    }
    return instructions;
};
/**
 * OP_0 is the only single-word push. All other push instructions will
 * disassemble to multiple ASM words. (OP_1-OP_16 are handled like normal
 * operations.)
 */
const isMultiWordPush = (opcode) => opcode !== CommonPushOpcodes.OP_0;
const formatAsmPushHex = (data) => data.length > 0 ? `0x${format_1.binToHex(data)}` : '';
const formatMissingBytesAsm = (missing) => `[missing ${missing} byte${missing === 1 ? '' : 's'}]`;
const hasMalformedLength = (instruction) => 'length' in instruction;
const isPushData = (pushOpcode) => pushOpcode >= CommonPushOpcodes.OP_PUSHDATA_1;
/**
 * Disassemble a malformed authentication instruction into a string description.
 * @param opcodes - a mapping of possible opcodes to their string representation
 * @param instruction - the malformed instruction to disassemble
 */
exports.disassembleParsedAuthenticationInstructionMalformed = (opcodes, instruction) => `${opcodes[instruction.opcode]} ${hasMalformedLength(instruction)
    ? `${formatAsmPushHex(instruction.length)}${formatMissingBytesAsm(instruction.expectedLengthBytes - instruction.length.length)}`
    : `${isPushData(instruction.opcode)
        ? `${instruction.expectedDataBytes} `
        : ''}${formatAsmPushHex(instruction.data)}${formatMissingBytesAsm(instruction.expectedDataBytes - instruction.data.length)}`}`;
/**
 * Disassemble a properly-formed authentication instruction into a string
 * description.
 * @param opcodes - a mapping of possible opcodes to their string representation
 * @param instruction - the instruction to disassemble
 */
exports.disassembleAuthenticationInstruction = (opcodes, instruction) => `${opcodes[instruction.opcode]}${'data' in instruction &&
    isMultiWordPush(instruction.opcode)
    ? ` ${isPushData(instruction.opcode)
        ? `${instruction.data.length} `
        : ''}${formatAsmPushHex(instruction.data)}`
    : ''}`;
/**
 * Disassemble a single `ParsedAuthenticationInstruction` (includes potentially
 * malformed instructions) into its ASM representation.
 *
 * @param script - the instruction to disassemble
 */
exports.disassembleParsedAuthenticationInstruction = (opcodes, instruction) => exports.authenticationInstructionIsMalformed(instruction)
    ? exports.disassembleParsedAuthenticationInstructionMalformed(opcodes, instruction)
    : exports.disassembleAuthenticationInstruction(opcodes, instruction);
/**
 * Disassemble an array of `ParsedAuthenticationInstructions` (including
 * potentially malformed instructions) into its ASM representation.
 *
 * @param script - the array of instructions to disassemble
 */
exports.disassembleParsedAuthenticationInstructions = (opcodes, instructions) => instructions
    .map((instruction) => exports.disassembleParsedAuthenticationInstruction(opcodes, instruction))
    .join(' ');
/**
 * Disassemble authentication bytecode into a lossless ASM representation. (All
 * push operations are represented with the same opcodes used in the bytecode,
 * even when non-minimally encoded.)
 *
 * @param opcodes - the set to use when determining the name of opcodes, e.g. `OpcodesBCH`
 * @param bytecode - the authentication bytecode to disassemble
 */
exports.disassembleBytecode = (opcodes, bytecode) => exports.disassembleParsedAuthenticationInstructions(opcodes, exports.parseBytecode(bytecode));
/**
 * Disassemble BCH authentication bytecode into its ASM representation.
 * @param bytecode - the authentication bytecode to disassemble
 */
exports.disassembleBytecodeBCH = (bytecode) => exports.disassembleParsedAuthenticationInstructions(bch_1.OpcodesBCH, exports.parseBytecode(bytecode));
/**
 * Disassemble BTC authentication bytecode into its ASM representation.
 * @param bytecode - the authentication bytecode to disassemble
 */
exports.disassembleBytecodeBTC = (bytecode) => exports.disassembleParsedAuthenticationInstructions(btc_1.OpcodesBTC, exports.parseBytecode(bytecode));
/**
 * Create an object where each key is an opcode identifier and each value is
 * the bytecode value (`Uint8Array`) it represents.
 * @param opcodes - An opcode enum, e.g. `OpcodesBCH`
 */
exports.generateBytecodeMap = (opcodes) => Object.entries(opcodes)
    .filter((entry) => typeof entry[1] === 'number')
    .reduce((identifiers, pair) => (Object.assign(Object.assign({}, identifiers), { [pair[0]]: Uint8Array.of(pair[1]) })), {});
/**
 * Re-assemble a string of disassembled bytecode (see `disassembleBytecode`).
 *
 * @param opcodes - a mapping of opcodes to their respective Uint8Array
 * representation
 * @param disassembledBytecode - the disassembled bytecode to re-assemble
 */
exports.assembleBytecode = (opcodes, disassembledBytecode) => {
    const environment = {
        opcodes,
        scripts: { asm: disassembledBytecode },
    };
    return compiler_1.createCompilerCommonSynchronous(environment).generateBytecode('asm', {});
};
/**
 * Re-assemble a string of disassembled BCH bytecode (see
 * `disassembleBytecodeBCH`).
 *
 * Note, this method performs automatic minimization of push instructions.
 *
 * @param disassembledBytecode - the disassembled BCH bytecode to re-assemble
 */
exports.assembleBytecodeBCH = (disassembledBytecode) => exports.assembleBytecode(exports.generateBytecodeMap(bch_1.OpcodesBCH), disassembledBytecode);
/**
 * Re-assemble a string of disassembled BCH bytecode (see
 * `disassembleBytecodeBTC`).
 *
 * Note, this method performs automatic minimization of push instructions.
 *
 * @param disassembledBytecode - the disassembled BTC bytecode to re-assemble
 */
exports.assembleBytecodeBTC = (disassembledBytecode) => exports.assembleBytecode(exports.generateBytecodeMap(btc_1.OpcodesBTC), disassembledBytecode);
const getInstructionLengthBytes = (instruction) => {
    const opcode = instruction.opcode;
    const expectedLength = exports.lengthBytesForPushOpcode(opcode);
    return expectedLength === uint8Bytes
        ? Uint8Array.of(instruction.data.length)
        : expectedLength === uint16Bytes
            ? format_1.numberToBinUint16LE(instruction.data.length)
            : format_1.numberToBinUint32LE(instruction.data.length);
};
/**
 * Re-serialize a valid authentication instruction.
 * @param instruction - the instruction to serialize
 */
exports.serializeAuthenticationInstruction = (instruction) => Uint8Array.from([
    instruction.opcode,
    ...('data' in instruction
        ? [
            ...(isPushData(instruction.opcode)
                ? getInstructionLengthBytes(instruction)
                : []),
            ...instruction.data,
        ]
        : []),
]);
/**
 * Re-serialize a malformed authentication instruction.
 * @param instruction - the malformed instruction to serialize
 */
exports.serializeParsedAuthenticationInstructionMalformed = (instruction) => {
    const opcode = instruction.opcode;
    if (hasMalformedLength(instruction)) {
        return Uint8Array.from([opcode, ...instruction.length]);
    }
    if (isPushData(opcode)) {
        return Uint8Array.from([
            opcode,
            ...(opcode === CommonPushOpcodes.OP_PUSHDATA_1
                ? Uint8Array.of(instruction.expectedDataBytes)
                : opcode === CommonPushOpcodes.OP_PUSHDATA_2
                    ? format_1.numberToBinUint16LE(instruction.expectedDataBytes)
                    : format_1.numberToBinUint32LE(instruction.expectedDataBytes)),
            ...instruction.data,
        ]);
    }
    return Uint8Array.from([opcode, ...instruction.data]);
};
/**
 * Re-serialize a potentially-malformed authentication instruction.
 * @param instruction - the potentially-malformed instruction to serialize
 */
exports.serializeParsedAuthenticationInstruction = (instruction) => exports.authenticationInstructionIsMalformed(instruction)
    ? exports.serializeParsedAuthenticationInstructionMalformed(instruction)
    : exports.serializeAuthenticationInstruction(instruction);
/**
 * Re-serialize an array of valid authentication instructions.
 * @param instructions - the array of valid instructions to serialize
 */
exports.serializeAuthenticationInstructions = (instructions) => format_1.flattenBinArray(instructions.map(exports.serializeAuthenticationInstruction));
/**
 * Re-serialize an array of potentially-malformed authentication instructions.
 * @param instructions - the array of instructions to serialize
 */
exports.serializeParsedAuthenticationInstructions = (instructions) => format_1.flattenBinArray(instructions.map(exports.serializeParsedAuthenticationInstruction));

},{"../../format/format":27,"../../template/compiler":44,"./bch/bch":70,"./btc/btc":72}],92:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./btc/btc"), exports);
__exportStar(require("./bch/bch"), exports);
__exportStar(require("./common/common"), exports);
__exportStar(require("./instruction-sets-utils"), exports);
__exportStar(require("./instruction-sets-types"), exports);

},{"./bch/bch":70,"./btc/btc":72,"./common/common":76,"./instruction-sets-types":90,"./instruction-sets-utils":91}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthenticationVirtualMachine = void 0;
const format_1 = require("../format/format");
/**
 * Create an AuthenticationVirtualMachine to evaluate authentication programs
 * constructed from operations in the `instructionSet`.
 * @param instructionSet - an `InstructionSet`
 */
exports.createAuthenticationVirtualMachine = (instructionSet) => {
    const availableOpcodes = 256;
    const operators = format_1.range(availableOpcodes).map((codepoint) => instructionSet.operations[codepoint] === undefined
        ? instructionSet.undefined
        : instructionSet.operations[codepoint]);
    const getCodepoint = (state) => state.instructions[state.ip];
    const after = (state) => {
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        state.ip += 1;
        return state;
    };
    const getOperation = (state) => operators[getCodepoint(state).opcode];
    const stateStepMutate = (state) => after(getOperation(state)(state));
    const stateContinue = instructionSet.continue;
    /**
     * When we get real tail call optimization, this can be replaced
     * with recursion.
     */
    const untilComplete = (state, stepFunction) => {
        // eslint-disable-next-line functional/no-loop-statement
        while (stateContinue(state)) {
            // eslint-disable-next-line functional/no-expression-statement, no-param-reassign
            state = stepFunction(state);
        }
        return state;
    };
    const clone = (state) => instructionSet.clone(state);
    const { verify } = instructionSet;
    const stateEvaluate = (state) => untilComplete(clone(state), stateStepMutate);
    const stateDebugStep = (state) => {
        const operator = getOperation(state);
        return after(operator(clone(state)));
    };
    const stateDebug = (state) => {
        const trace = [];
        // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
        trace.push(state);
        // eslint-disable-next-line functional/no-expression-statement
        untilComplete(state, (currentState) => {
            const nextState = stateDebugStep(currentState);
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            trace.push(nextState);
            return nextState;
        });
        return trace;
    };
    const stateStep = (state) => stateStepMutate(clone(state));
    const evaluate = (program) => instructionSet.evaluate(program, stateEvaluate);
    const debug = (program) => {
        const results = [];
        const proxyDebug = (state) => {
            var _a;
            const debugResult = stateDebug(state);
            // eslint-disable-next-line functional/no-expression-statement, functional/immutable-data
            results.push(...debugResult);
            return ((_a = debugResult[debugResult.length - 1]) !== null && _a !== void 0 ? _a : state);
        };
        const finalResult = instructionSet.evaluate(program, proxyDebug);
        return [...results, finalResult];
    };
    return {
        debug,
        evaluate,
        stateContinue,
        stateDebug,
        stateEvaluate,
        stateStep,
        stateStepMutate,
        verify,
    };
};

},{"../format/format":27}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],95:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./instruction-sets/instruction-sets"), exports);
__exportStar(require("./vm-types"), exports);
__exportStar(require("./virtual-machine"), exports);

},{"./instruction-sets/instruction-sets":92,"./virtual-machine":93,"./vm-types":94}]},{},[1]);
